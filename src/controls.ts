import { Scene, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


let camera: PerspectiveCamera
let cameraControls: OrbitControls

export function initCameraAndControls(_scene: Scene, canvas: HTMLElement) {
    camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(1, 1, 1)

    cameraControls = new OrbitControls(camera, canvas);
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()
}

export {camera, cameraControls}
