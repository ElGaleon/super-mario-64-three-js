import GUI from 'lil-gui'
import {
  Clock,
  LoadingManager,
  PCFSoftShadowMap,
  Scene,
  WebGLRenderer,
} from 'three'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import Stats from 'three/addons/libs/stats.module.js'
import '../style/style.css'
import { initLights } from './lights';
import { ambientLight, pointLight } from './lights';
import { initHelpers, axesHelper, pointLightHelper, gridHelper } from './helpers/helpers';
import { initCameraAndControls, camera, cameraControls } from './controls';
import { loadRoom, loadMirrors, loadMario, mario, characterControls, setObjectsLoadingManager } from './objects';
import { KeysPressed, ROOM_BOUNDARIES } from './helpers/characterControls';
import { COMMANDS, DEBUG_TOGGLE_CODE, GAMEPLAY_KEYS, RUN_TOGGLE_CODE } from './input';
import { MIRROR_ROOM_VIDEO } from './videoReference';

const CANVAS_ID = 'scene'
const LEVEL_INFO = {
  title: 'Mirror Room',
  text: 'This scene is inspired by the mirror room in Peach Castle: a compact interior where reflective surfaces, framed images, and hidden routes play with orientation and perception.',
  linkLabel: 'Learn more about Super Mario 64',
  linkUrl: 'https://en.wikipedia.org/wiki/Super_Mario_64',
  videoLabel: 'Watch the Mirror Room reference video',
}

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let clock: Clock
let stats: Stats
let gui: GUI
let loadingOverlay: HTMLDivElement
let loadingProgress: HTMLDivElement
let loadingLabel: HTMLParagraphElement
let sidePanelStack: HTMLDivElement
let debugVisible = false

const myScene = {
    showBumpMap: true, 
    showRoom: true, 
    showMario: true, 
    showMirrors: true
}

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()
  }

  createSidePanelStack()
  createLevelInfoPanel()
  createControlsLegend()
  createLoadingOverlay()

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()
    setObjectsLoadingManager(loadingManager)

    loadingManager.onStart = () => {
      updateLoading(0, 'Loading assets...')
    }
    loadingManager.onProgress = (_url, loaded, total) => {
      const progress = total > 0 ? loaded / total : 0
      updateLoading(progress, `Loading ${loaded}/${total}`)
    }
    loadingManager.onLoad = () => {
      updateLoading(1, 'Ready')
      window.setTimeout(() => {
        loadingOverlay.classList.add('is-hidden')
      }, 250)
    }
    loadingManager.onError = () => {
      updateLoading(1, 'Loading error')
    }
  }

  // ===== 💡 LIGHTS =====
  initLights(scene)

  // ===== 🎥 CAMERA & 🕹️ CONTROLS =====
  {
    initCameraAndControls(scene, canvas);

    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    });
  }

  // ===== 📦 OBJECTS =====
  {
        loadRoom(scene, myScene.showBumpMap);
        loadMirrors(scene);
        loadMario(scene);
  }

  // spotLight.target = mario;

  // ===== 🪄 HELPERS =====
  initHelpers(scene);

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
    stats.dom.classList.add('stats-panel')
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const objectsFolder = gui.addFolder('Bump Map')
    objectsFolder.add(myScene, 'showBumpMap').name('Show Bump Map').onChange((value: boolean) => loadRoom(scene, value));

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')
    helpersFolder.add(gridHelper, 'visible').name('grid helper')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

    const boundariesFolder = gui.addFolder('Room Boundaries')
    boundariesFolder.add(ROOM_BOUNDARIES, 'minX').name('min X').disable()
    boundariesFolder.add(ROOM_BOUNDARIES, 'maxX').name('max X').disable()
    boundariesFolder.add(ROOM_BOUNDARIES, 'minZ').name('min Z').disable()
    boundariesFolder.add(ROOM_BOUNDARIES, 'maxZ').name('max Z').disable()

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')

    gui.close()
    setDebugVisible(debugVisible)
  }
}

function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    
  requestAnimationFrame(animate)

  stats.update()
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}

function createLoadingOverlay() {
  loadingOverlay = document.createElement('div')
  loadingOverlay.className = 'loading-overlay'
  loadingOverlay.setAttribute('role', 'status')
  loadingOverlay.setAttribute('aria-live', 'polite')

  const content = document.createElement('div')
  content.className = 'loading-content'

  const logo = document.createElement('img')
  logo.className = 'mario-logo'
  logo.setAttribute('aria-label', 'Super Mario 64')
  logo.setAttribute('alt', 'Super Mario 64')
  logo.setAttribute('src', './assets/images/Super_Mario_64_logo.png')

  loadingLabel = document.createElement('p')
  loadingLabel.textContent = 'Preparing scene...'

  const track = document.createElement('div')
  track.className = 'loading-track'

  loadingProgress = document.createElement('div')
  loadingProgress.className = 'loading-progress'
  track.appendChild(loadingProgress)

  content.append(logo, loadingLabel, track)
  loadingOverlay.appendChild(content)
  document.body.appendChild(loadingOverlay)
}

function updateLoading(progress: number, label: string) {
  loadingLabel.textContent = label
  loadingProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`
}

function createSidePanelStack() {
  sidePanelStack = document.createElement('div')
  sidePanelStack.className = 'side-panel-stack'
  document.body.appendChild(sidePanelStack)
}

function createLevelInfoPanel() {
  const panel = document.createElement('details')
  panel.className = 'scene-info-panel'
  panel.open = true

  const summary = document.createElement('summary')
  summary.textContent = LEVEL_INFO.title
  panel.appendChild(summary)

  const content = document.createElement('p')
  content.textContent = LEVEL_INFO.text

  const videoLink = document.createElement('a')
  videoLink.href = MIRROR_ROOM_VIDEO.url
  videoLink.target = '_blank'
  videoLink.rel = 'noopener noreferrer'
  videoLink.textContent = LEVEL_INFO.videoLabel

  const sourceLink = document.createElement('a')
  sourceLink.href = LEVEL_INFO.linkUrl
  sourceLink.target = '_blank'
  sourceLink.rel = 'noopener noreferrer'
  sourceLink.textContent = LEVEL_INFO.linkLabel

  panel.append(content, videoLink, sourceLink)
  sidePanelStack.appendChild(panel)
}

function createControlsLegend() {
  const panel = document.createElement('details')
  panel.className = 'controls-legend'
  panel.open = true

  const summary = document.createElement('summary')
  summary.textContent = 'Controls'
  panel.appendChild(summary)

  const list = document.createElement('dl')
  COMMANDS.forEach(({ key, action }) => {
    const keyElement = document.createElement('dt')
    keyElement.textContent = key
    const actionElement = document.createElement('dd')
    actionElement.textContent = action
    list.append(keyElement, actionElement)
  })

  panel.appendChild(list)
  sidePanelStack.appendChild(panel)
}

function setDebugVisible(value: boolean) {
  debugVisible = value
  gui.domElement.style.display = debugVisible ? '' : 'none'
  stats.dom.style.display = debugVisible ? '' : 'none'
}

function normalizeKey(event: KeyboardEvent) {
  return event.key === ' ' ? ' ' : event.key.toLowerCase()
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest('.lil-gui') ||
    target.closest('input, textarea, select, button') ||
    target.isContentEditable
  )
}

// Control Keys
const keysPressed: KeysPressed = {}
document.addEventListener("keydown", function(event) {
    if (isTypingTarget(event.target)) {
      return
    }

    const normalizedKey = normalizeKey(event)
    const isRunToggle = event.code === RUN_TOGGLE_CODE
    const isDebugToggle = event.code === DEBUG_TOGGLE_CODE

    if (isRunToggle || isDebugToggle || GAMEPLAY_KEYS.has(normalizedKey as keyof KeysPressed)) {
      event.preventDefault()
    }

    if (isRunToggle && !event.repeat && characterControls) {
        characterControls.switchRunToToggle()
    } else if (isDebugToggle && !event.repeat) {
        setDebugVisible(!debugVisible)
    } else if (GAMEPLAY_KEYS.has(normalizedKey as keyof KeysPressed)) {
        keysPressed[normalizedKey as keyof KeysPressed] = true
    }
}, false)

document.addEventListener("keyup", function(event){
    if (isTypingTarget(event.target)) {
      return
    }

    const normalizedKey = normalizeKey(event)
    if (GAMEPLAY_KEYS.has(normalizedKey as keyof KeysPressed)) {
      event.preventDefault()
      keysPressed[normalizedKey as keyof KeysPressed] = false
    }
});

export {mario}
