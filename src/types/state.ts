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
  [key: number]: QuestCondition
}
export interface QuestCondition {
  passed?: boolean
  interval?: string
  func: () => void
  args: unknown[]
}

export interface WorldQuests {
  [key: string]: Quests
}
export interface AllQuestsMethods {
  [key: string]: QuestMethods
}
export interface QuestMethods {
  [key: string]: () => unknown
}
export interface Npc extends NpcDefaults {
  home: { x: number; y: number }
  labelname: string
  inventory: hash[]
  clearence: number
  clan: string
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
  effects: string[]
  currentroom: string
  exitroom: string
  currentstation: string
}
export interface Skills {
  [key: string]: number
}
export interface PlayerState {
  currentroom: string
  exitroom: string
  matrix: { x: number; y: number }
  labelname: string
  inventory: hash[]
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
interface Fallbacks {
  stations: { [key: string]: string }
}
interface Rooms {
  [key: string]: Room
}
interface Room {
  matrix: { x: number; y: number }
  roomname: string
  stations: { [key: string]: string }
  actors: Actors
  prisoners?: Prisoners
  props?: string[]
}
interface Actors {
  [key: string]: Actor
}
interface Actor {
  inventory: hash[]
  watcher?: string
  actions: string[]
}
interface Prisoners {
  [key: string]: string
}
interface Roles {
  [key: string]: string[]
}
