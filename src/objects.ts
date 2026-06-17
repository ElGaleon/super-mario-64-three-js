import { DoubleSide, Group, Object3D, Scene, TextureLoader, RepeatWrapping, PlaneGeometry, Color, AnimationClip, AnimationMixer, AnimationAction, LoadingManager } from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { CharacterControls } from "./helpers/characterControls";


let objLoader = new OBJLoader();
let mtlLoader = new MTLLoader();
let gltfLoader = new GLTFLoader();
let room: Group;
let mirrors: Reflector[] = [];
let mario: Group
let characterControls: CharacterControls
mtlLoader.setMaterialOptions({ side: DoubleSide });

let mirrorConfig = [
    { x: 0, y: 1, z: -1.99 },
    { x: -2, y: 1, z: -1.99 },
    { x: 2, y: 1, z: -1.99 }
]
// Textures
const carpetBumpTexture = new TextureLoader().load('./assets/images/carpet2.jpg');
carpetBumpTexture.wrapS = carpetBumpTexture.wrapT = RepeatWrapping;

const brickBumpTexture = new TextureLoader().load('./assets/images/brick.jpg');
brickBumpTexture.wrapS = RepeatWrapping;
brickBumpTexture.wrapT = RepeatWrapping;

const wallBumpTexture = new TextureLoader().load('./assets/images/wall.jpg');
wallBumpTexture.wrapS = RepeatWrapping;
wallBumpTexture.wrapT = RepeatWrapping;

const marbleBumpTexture = new TextureLoader().load('./assets/images/pillar.png');
marbleBumpTexture.wrapS = marbleBumpTexture.wrapT = RepeatWrapping;

export function setObjectsLoadingManager(manager: LoadingManager) {
    objLoader = new OBJLoader(manager);
    mtlLoader = new MTLLoader(manager);
    gltfLoader = new GLTFLoader(manager);
    mtlLoader.setMaterialOptions({ side: DoubleSide });
}

export function loadRoom(scene: Scene, showBumpMap: boolean) {
    mtlLoader.load("./assets/obj/mirror/mirror_room.mtl", function (materials: MTLLoader.MaterialCreator) {
        materials.preload();
      // Moquette     
        materials.materials["Moquette"].transparent = false;
        materials.materials["Moquette"].transparent = false;
        // @ts-ignore
        materials.materials["Moquette"].reflectivity = 0;
        // @ts-ignore
        materials.materials["Moquette"].shininess = 10;
        // @ts-ignore
        materials.materials["Moquette"].bumpMap = showBumpMap ? carpetBumpTexture : null;
        // @ts-ignore
        materials.materials["Moquette"].bumpScale = 0.7;
  
        // Bricks
        materials.materials["Brick"].transparent = false;
        // @ts-ignore
        materials.materials["Brick"].bumpMap = showBumpMap ? brickBumpTexture : null;
        // @ts-ignore
        materials.materials["Brick"].reflectivity = 0;
        // @ts-ignore
        materials.materials["Brick"].shininess = 10;

        // Floor
        materials.materials["Floor"].transparent = false;
        // Marble
        materials.materials["Marble"].transparent = false;
        // @ts-ignore
        materials.materials["Marble"].bumpMap = showBumpMap ? marbleBumpTexture : null;
        // @ts-ignore
        materials.materials["Marble"].reflectivity = 1;
        // @ts-ignore
        materials.materials["Marble"].shininess = 60;
        // Wall
        materials.materials["Wall"].transparent = false;
        // @ts-ignore
        materials.materials["Wall"].bumpMap = showBumpMap ? wallBumpTexture : null;
        // @ts-ignore
        materials.materials["Wall"].reflectivity = 0;
        // @ts-ignore
        materials.materials["Wall"].shininess = 10;
        // Frames
        materials.materials["Snow"].transparent = false;
        materials.materials["Whomps"].transparent = false;
        materials.materials["Goomba_Frame"].transparent = false;
        materials.materials["Bomb-Omb"].transparent = false;
        materials.materials["Bay"].transparent = false;

        materials.materials["Moquette"].needsUpdate = true;
        materials.materials["Brick"].needsUpdate = true;
        materials.materials["Marble"].needsUpdate = true;
        materials.materials["Wall"].needsUpdate = true;

        objLoader.setMaterials(materials);
        objLoader.load("./assets/obj/mirror/mirror_room.obj", function(data) {
            data.traverse(function (child: Object3D) {
              if (child.name == 'Entrance' || child.name == 'Room') {
                child.receiveShadow = true;
              } else {
                child.receiveShadow = true;
                child.castShadow = true;
              }
            });
           disposeRoom(scene);
           room = data;
           scene.add(room);
        },
            // called when loading is in progress
            function ( xhr ) {
    
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
            },
            // called when loading has errors
            function ( error ) {
    
                console.log( 'An error happened: ' + error );
    
            });
    });
}

export function loadMirrors(scene: Scene) {
    mirrorConfig.forEach(config => {
        const mirror = new Reflector(new PlaneGeometry(1.6, 2), {
            color: new Color(0xECECEC),
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
        });
        mirror.position.set(config.x, config.y, config.z);
        scene.add(mirror);
        mirrors.push(mirror);
    });
}

export function loadMario(scene: Scene) {
    gltfLoader.load('./assets/glb/SM64/SM64.glb', function (glb: GLTF) {
        mario = glb.scene;
        mario.traverse(function (child: Object3D) {
                child.castShadow = true;
                child.receiveShadow = true;
        }) 
        mario.position.set(0,0,0);
        mario.rotation.set(0, Math.PI,0 );
        mario.scale.set(35,35,35);
        scene.add(mario);
        const gltfAnimations: AnimationClip[] = glb.animations;
        const mixer = new AnimationMixer(mario);
        const animationsMap: Map<string, AnimationAction> = new Map()
        gltfAnimations.filter(a => a.name != 'TPose').forEach((a: AnimationClip) => animationsMap.set(a.name, mixer.clipAction(a)));
    
        characterControls = new CharacterControls(mario, mixer, animationsMap, 'Idle');
      },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function (error) {  
            console.log( `An error happened while loading Mario: ${error}`);   
        });
}

function disposeRoom(scene: Scene) {
    if (!room) {
        return;
    }

    scene.remove(room);
    room.traverse((child: Object3D) => {
        const geometry = (child as any).geometry;
        const material = (child as any).material;
        geometry?.dispose?.();

        if (Array.isArray(material)) {
            material.forEach((item) => item?.dispose?.());
        } else {
            material?.dispose?.();
        }
    });
}

export {room, mirrors, mario, characterControls}
