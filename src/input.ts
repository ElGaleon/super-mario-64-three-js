import { CommandKey } from './helpers/characterControls'

export const COMMANDS = [
  { key: 'W A S D', action: 'Move Mario' },
  { key: 'R', action: 'Toggle run/walk' },
  { key: 'Space', action: 'Jump' },
  { key: 'Arrow Down', action: 'Slide' },
  { key: 'M', action: 'Moonwalk' },
  { key: 'B', action: 'Dance' },
  { key: 'G', action: 'Show/hide debug' },
  { key: 'Mouse', action: 'Rotate camera' },
  { key: 'Touch', action: 'Mobile controls' },
  { key: 'Double click', action: 'Toggle fullscreen' },
] as const

export const RUN_TOGGLE_CODE = 'KeyR'
export const DEBUG_TOGGLE_CODE = 'KeyG'
export const GAMEPLAY_KEYS = new Set<CommandKey>(['w', 'a', 's', 'd', ' ', 'arrowdown', 'm', 'b'])
