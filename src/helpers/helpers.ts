import { AxesHelper, GridHelper, PointLightHelper, Scene } from "three"
import { pointLight } from "../lights"

let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let gridHelper: GridHelper

export function initHelpers(scene: Scene) {
    axesHelper = new AxesHelper(4)
    axesHelper.visible = false
    scene.add(axesHelper)

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
    pointLightHelper.visible = false
    scene.add(pointLightHelper)

    gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    scene.add(gridHelper)
}

export {axesHelper, pointLightHelper, gridHelper}