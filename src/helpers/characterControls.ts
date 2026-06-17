import {
    AnimationAction,
    AnimationMixer,
    Group,
    Camera,
    Quaternion,
    Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { camera, cameraControls } from '../controls';

const W = 'w'
const A = 'a'
const S = 's'
const D = 'd'
export type CommandKey = typeof W | typeof A | typeof S | typeof D | 'arrowdown' | ' ' | 'm' | 'b'
export type KeysPressed = Partial<Record<CommandKey, boolean>>
const DIRECTIONS: CommandKey[] = [W, A, S, D]

const MOVE_ACTIONS = ['Walking', 'Walk Backward', 'Run', 'Moonwalk']
const RESTART_ACTIONS = ['Jump', 'Slide', 'Dance']
const MODEL_FORWARD_OFFSET = Math.PI
const CHARACTER_RADIUS = 0.18
export const ROOM_BOUNDARIES = {
    minX: -3.4,
    minZ: -1.9,
    maxX: 3.4,
    maxZ: 1.9,
} as const

const MARBLE_COLLIDERS = [
    { minX: -2.1, maxX: -1.9, minZ: -1.3, maxZ: -1.1 },
    { minX: -1.1, maxX: -0.9, minZ: 0.9, maxZ: 1.1 },
    { minX: 1.9, maxX: 2.1, minZ: 1.1, maxZ: 1.3 },
    { minX: 0.9, maxX: 1.1, minZ: -1.1, maxZ: -0.9 },
] as const

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function hitsMarble(x: number, z: number) {
    return MARBLE_COLLIDERS.some((collider) => (
        x > collider.minX - CHARACTER_RADIUS &&
        x < collider.maxX + CHARACTER_RADIUS &&
        z > collider.minZ - CHARACTER_RADIUS &&
        z < collider.maxZ + CHARACTER_RADIUS
    ))
}

export class CharacterControls {

    model: Group
    mixer: AnimationMixer
    animationsMap: Map<string, AnimationAction> = new Map()
    orbitControl: OrbitControls
    camera: Camera

    // State
    toggleRun: boolean = true;
    currentAction: string
    oneShotRemaining = 0;

    // Temporary data
    walkDirection = new Vector3();
    rotateAngle = new Vector3(0,1,0);
    rotateQuarternion = new Quaternion();
    cameraTarget = new Vector3();
    desiredCameraTarget = new Vector3();

    // Constants 
    fadeDuration: number = 0.2
    runVelocity: number = 1;
    walkVelocity: number = 0.5;

    constructor(
        model: Group,
        mixer: AnimationMixer,
        animationsMap: Map<string, AnimationAction> = new Map(),
        currentAction: string) {
        
            this.model = model;
            this.mixer = mixer;
            this.animationsMap = animationsMap;
            this.currentAction = currentAction;
            this.animationsMap.forEach((value, key) => {
                if (key === currentAction) {
                    value.play();
                }
            })
            this.orbitControl = cameraControls;
            this.camera = camera;
            this.desiredCameraTarget.set(model.position.x, model.position.y, model.position.z);
            this.cameraTarget.set(model.position.x, model.position.y, model.position.z);
        }

    public switchRunToToggle() {
        this.toggleRun = !this.toggleRun;
    }

    public update(delta: number, keysPressed: KeysPressed) {
        const directionPressed = DIRECTIONS.some((key: CommandKey) => keysPressed[key] === true);
        let play: string;
        if (keysPressed["arrowdown"]) {
            play = 'Slide'
        } else if (keysPressed["m"]) {
            play = 'Moonwalk'
        } else if (keysPressed["b"]) {
            play = 'Dance'
        } else if (directionPressed && this.toggleRun && !keysPressed["s"]) {
            play = 'Run';
        } else if (directionPressed && !keysPressed["s"]) {
            play = 'Walking'
        } else if (directionPressed && keysPressed["s"]) {
            play = 'Walk Backward'
        } else if (keysPressed[" "]) {
            play = 'Jump';
        }else {
            play = 'Idle';
        }

        if (this.oneShotRemaining > 0 && RESTART_ACTIONS.includes(this.currentAction)) {
            this.oneShotRemaining = Math.max(0, this.oneShotRemaining - delta);
            play = this.currentAction;
        }

        this.switchAnimation(play);

        if (MOVE_ACTIONS.includes(this.currentAction)) {
            const angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            )
            const directionOffset = this.directionOffset(keysPressed);

            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset + MODEL_FORWARD_OFFSET);
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            const velocity = this.currentAction === 'Run' ? this.runVelocity : this.walkVelocity;
            const requestedMoveX = this.walkDirection.x * velocity * delta;
            const requestedMoveZ = this.walkDirection.z * velocity * delta;
            const { x: nextX, z: nextZ } = this.resolveCollision(requestedMoveX, requestedMoveZ);
            const clampedMoveX = nextX - this.model.position.x;
            const clampedMoveZ = nextZ - this.model.position.z;

            this.model.position.x = nextX;
            this.model.position.z = nextZ;
            this.updateCameraTarget(clampedMoveX, clampedMoveZ);
        }

        this.smoothCameraTarget(delta);
        this.mixer.update(delta);
    }

    private switchAnimation(nextAction: string) {
        if (this.currentAction === nextAction) {
            return;
        }

        const toPlay = this.animationsMap.get(nextAction);
        const current = this.animationsMap.get(this.currentAction);

        if (!toPlay) {
            return;
        }

        current?.fadeOut(this.fadeDuration);

        if (RESTART_ACTIONS.includes(nextAction)) {
            toPlay.reset();
            this.oneShotRemaining = toPlay.getClip().duration;
        } else {
            this.oneShotRemaining = 0;
        }

        toPlay.fadeIn(this.fadeDuration).play();
        this.currentAction = nextAction;
    }

    private resolveCollision(moveX: number, moveZ: number) {
        const currentX = this.model.position.x;
        const currentZ = this.model.position.z;
        const desiredX = clamp(currentX + moveX, ROOM_BOUNDARIES.minX, ROOM_BOUNDARIES.maxX);
        const desiredZ = clamp(currentZ + moveZ, ROOM_BOUNDARIES.minZ, ROOM_BOUNDARIES.maxZ);

        if (!hitsMarble(desiredX, desiredZ)) {
            return { x: desiredX, z: desiredZ };
        }

        const xOnly = clamp(currentX + moveX, ROOM_BOUNDARIES.minX, ROOM_BOUNDARIES.maxX);
        if (!hitsMarble(xOnly, currentZ)) {
            return { x: xOnly, z: currentZ };
        }

        const zOnly = clamp(currentZ + moveZ, ROOM_BOUNDARIES.minZ, ROOM_BOUNDARIES.maxZ);
        if (!hitsMarble(currentX, zOnly)) {
            return { x: currentX, z: zOnly };
        }

        return { x: currentX, z: currentZ };
    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ

        this.desiredCameraTarget.x = this.model.position.x
        this.desiredCameraTarget.y = this.model.position.y
        this.desiredCameraTarget.z = this.model.position.z
    }

    private smoothCameraTarget(delta: number) {
        const cameraFollowSpeed = 10;
        const amount = 1 - Math.exp(-cameraFollowSpeed * delta);

        this.cameraTarget.x += (this.desiredCameraTarget.x - this.cameraTarget.x) * amount;
        this.cameraTarget.y += (this.desiredCameraTarget.y - this.cameraTarget.y) * amount;
        this.cameraTarget.z += (this.desiredCameraTarget.z - this.cameraTarget.z) * amount;
        this.orbitControl.target = this.cameraTarget
    }
    

    private directionOffset(keysPressed: KeysPressed) {
        let directionOffset = 0 // corresponds to W
        if (keysPressed[W]) {
            if (keysPressed[A]) { // W + A
                directionOffset = Math.PI / 4
            } else if(keysPressed[D]) { // W + D
                directionOffset = -Math.PI / 4
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) { // S + A
                directionOffset = Math.PI / 4 + Math.PI / 2
            } else if(keysPressed[D]) { // W + D
                directionOffset = -Math.PI / 4 -Math.PI / 2
            }
        } else if (keysPressed[A]) {
            directionOffset = Math.PI / 2 // A
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // D
        }
        return directionOffset;
    }
}
