export interface NpcsState {
  all: Npcs
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
}

export interface Npcs {
  [key: string]: Npc
}

export interface Quests {
  [key: string]: Quest
}

export interface Quest {
  passed: boolean
  conditions: QuestConditions
  side_quests?: QuestConditions
}

export interface QuestConditions {
  [key: string | number]: QuestCondition
}
export interface QuestCondition {
  passed?: boolean
  interval?: string
  func: (args: [() => any, any]) => boolean
  args: [() => any, any]
}

export interface WorldQuests {
  [key: string]: Quests
}
export interface AllQuestsMethods {
  [key: string]: QuestMethods
}
export interface QuestMethods {
  [key: string]: (
    args?: unknown | [() => Npcs, number]
  ) => Npc[] | boolean | Npcs | [string[], Npcs] | string[] | Skills | void
}
export interface Npc extends NpcDefaults {
  home: { x: number; y: number }
  labelname: string
  inventory: string[]
  clearence: number
  clan: string
  body: string
}

export interface NpcDefaults {
  convos: number
  actions: string[]
  ai_path: string
  matrix: { x: number; y: number }
  attitudes: Skills | never
  skills: Skills | never
  binaries: Skills | never
  turns_since_encounter: number
  love: number
  hp: number
  cooldown: number
  effects: Effect[]
  currentroom: string
  exitroom: string
  currentstation: string
  race: string
}
export interface Skills {
  [key: string]: number
}
export interface PlayerState {
  currentroom: string
  exitroom: string
  matrix: { x: number; y: number }
  labelname: string
  inventory: string[]
  pos: { x: number; y: number }
  alert_level: number
  hp: number
  ap_max: number
  ap: number
  turns: number
  checkpoint: string
  binaries: Skills
  skills: Skills
  effects: string[]
}

export interface RoomsState {
  all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
}
export interface Fallbacks {
  stations: { [key: string]: string }
}
export interface Rooms {
  [key: string]: Room | Jail
}
interface Room {
  matrix: { x: number; y: number }
  roomname: string
  stations: { [key: string]: string }
  actors: Actors
  props?: string[]
  prisoners?: Prisoners
}

export interface Jail extends Room {
  prisoners: Prisoners
}
interface Actors {
  [key: string]: Actor
}
export interface Actor {
  inventory: string[]
  watcher?: string
  actions: string[]
}
export interface Prisoners {
  [key: string]: string
}
export interface Roles {
  [key: string]: string[]
}

export interface Caution {
  npc: string
  time: number
  label: string // merits
  type: string
  authority: string //ex; labor
  suspect: string
  reason: string
}

export interface Confront {
  npc: string
  station: string
  state: string
  reason: string
}

export interface Effect {
  label: string
  turns: number
  fx: {
    type: 'skills' | 'binaries' | 'attitudes'
    stat: string
    adjustment: number
  }
}

export interface Typewriter {
  state: string
  textspeed: number
  letter_fadein: number
  letter_fadeout: number
  line_spacing_scale: number
  zoom_speed: number
  scale: number
  node: node
  auto: boolean
  letter_nodes: { [key: string]: node }
  text: string
  parent: node
  instant_node: node | null
  init: (arg: string) => void
  set_node: () => void
  set_options: (arg: any) => void
  start: (arg: string) => void
  set_instant_text: (arg: string) => void
  hide_instant_text: () => void
  next: () => void
  set_scale: (arg: number) => void
  redraw: () => void
}
