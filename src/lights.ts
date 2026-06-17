    import {
        Scene,
        AmbientLight,
        SpotLight,
        PointLight
    } from 'three';
    
let ambientLight: AmbientLight
let pointLight: PointLight
let spotLight: SpotLight

export function initLights(scene: Scene) {
    ambientLight = new AmbientLight('white', 0.4)
    pointLight = new PointLight('white', 20, 100)
    spotLight = new SpotLight(0xffffff, 1);
    spotLight.target.position.set(3,0,0);
    pointLight.position.set(0, 2, 0)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)
}

export {ambientLight, pointLight, spotLight}

