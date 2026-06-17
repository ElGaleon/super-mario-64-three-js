declare module 'three' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    normalize(): this;
    applyAxisAngle(axis: Vector3, angle: number): this;
  }

  export class Quaternion {
    setFromAxisAngle(axis: Vector3, angle: number): this;
    rotateTowards(q: Quaternion, step: number): this;
  }

  export class Object3D {
    name: string;
    castShadow: boolean;
    receiveShadow: boolean;
    position: Vector3;
    rotation: Vector3;
    quaternion: Quaternion;
    scale: Vector3;
    traverse(callback: (child: Object3D) => void): void;
  }

  export class Group extends Object3D {
    add(...object: Object3D[]): this;
  }

  export class Scene extends Object3D {
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
  }

  export class Camera extends Object3D {
    getWorldDirection(target: Vector3): Vector3;
  }

  export class PerspectiveCamera extends Camera {
    aspect: number;
    constructor(fov: number, aspect: number, near: number, far: number);
    updateProjectionMatrix(): void;
  }

  export class Clock {
    getDelta(): number;
  }

  export class LoadingManager {
    onStart?: (url: string, loaded: number, total: number) => void;
    onProgress?: (url: string, loaded: number, total: number) => void;
    onLoad?: () => void;
    onError?: (url: string) => void;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    shadowMap: { enabled: boolean; type: unknown };
    constructor(parameters?: { canvas?: HTMLElement; antialias?: boolean; alpha?: boolean });
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: Camera): void;
  }

  export const PCFSoftShadowMap: unknown;
  export const DoubleSide: unknown;
  export const RepeatWrapping: unknown;

  export class Color {
    constructor(color?: number | string);
  }

  export class PlaneGeometry {
    constructor(width?: number, height?: number);
  }

  export class CanvasTexture extends Texture {
    constructor(canvas: HTMLCanvasElement);
  }

  export class Texture {
    wrapS: unknown;
    wrapT: unknown;
  }

  export class MeshBasicMaterial {
    constructor(parameters?: { map?: Texture; side?: unknown });
    dispose(): void;
  }

  export class Mesh extends Object3D {
    constructor(geometry?: PlaneGeometry, material?: MeshBasicMaterial);
  }

  export class TextureLoader {
    load(url: string): Texture;
  }

  export class AnimationClip {
    name: string;
    duration: number;
  }

  export class AnimationAction {
    getClip(): AnimationClip;
    play(): this;
    reset(): this;
    fadeIn(duration: number): this;
    fadeOut(duration: number): this;
  }

  export class AnimationMixer {
    constructor(root: Object3D);
    clipAction(clip: AnimationClip): AnimationAction;
    update(deltaTime: number): void;
  }

  export class AmbientLight extends Object3D {
    visible: boolean;
    constructor(color?: string | number, intensity?: number);
  }

  export class PointLight extends Object3D {
    visible: boolean;
    shadow: {
      radius: number;
      camera: { near: number; far: number };
      mapSize: { width: number; height: number };
    };
    constructor(color?: string | number, intensity?: number, distance?: number);
  }

  export class SpotLight extends Object3D {
    target: Object3D;
    constructor(color?: string | number, intensity?: number);
  }

  export class AxesHelper extends Object3D {
    visible: boolean;
    constructor(size?: number);
  }

  export class GridHelper extends Object3D {
    visible: boolean;
    constructor(size?: number, divisions?: number, color1?: string | number, color2?: string | number);
  }

  export class PointLightHelper extends Object3D {
    visible: boolean;
    constructor(light: PointLight, sphereSize?: number, color?: string | number);
  }
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, Vector3 } from 'three';

  export class OrbitControls {
    target: Vector3;
    enableDamping: boolean;
    autoRotate: boolean;
    constructor(camera: Camera, domElement: HTMLElement);
    update(): void;
  }
}

declare module 'three/examples/jsm/loaders/MTLLoader.js' {
  import { LoadingManager } from 'three';

  export namespace MTLLoader {
    export interface MaterialCreator {
      materials: Record<string, any>;
      preload(): void;
    }
  }

  export class MTLLoader {
    constructor(manager?: LoadingManager);
    setMaterialOptions(options: Record<string, unknown>): void;
    load(url: string, onLoad: (materials: MTLLoader.MaterialCreator) => void): void;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader.js' {
  import { Group, LoadingManager } from 'three';
  import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

  export class OBJLoader {
    constructor(manager?: LoadingManager);
    setMaterials(materials: MTLLoader.MaterialCreator): this;
    load(
      url: string,
      onLoad: (object: Group) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: unknown) => void,
    ): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import { AnimationClip, Group, LoadingManager } from 'three';

  export interface GLTF {
    animations: AnimationClip[];
    scene: Group;
  }

  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: unknown) => void,
    ): void;
  }
}

declare module 'three/examples/jsm/objects/Reflector.js' {
  import { Color, Object3D, PlaneGeometry } from 'three';

  export class Reflector extends Object3D {
    constructor(
      geometry: PlaneGeometry,
      options?: { color?: Color; textureWidth?: number; textureHeight?: number },
    );
  }
}

declare module 'three/addons/libs/stats.module.js' {
  export default class Stats {
    dom: HTMLElement;
    update(): void;
  }
}
