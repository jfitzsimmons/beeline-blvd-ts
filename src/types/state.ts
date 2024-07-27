import { Effect } from './tasks'

export interface NpcsState {
  all: Npcs
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
}

export interface Npcs {
  [key: string]: Npc
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
  turns_since_convo: number
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
  heat: number
  alert_level: number
  clearance: number
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
  [key: string]: Room | Occupancy
}
interface Room {
  matrix: { x: number; y: number }
  roomname: string
  clearance: number
  stations: { [key: string]: string }
  actors: Actors
  props?: string[]
  occupants?: Occupants
}

export interface Occupancy extends Room {
  occupants: Occupants
}
interface Actors {
  [key: string]: Actor
}
export interface Actor {
  inventory: string[]
  watcher?: string
  actions: string[]
}
export interface Occupants {
  [key: string]: string
}
export interface Roles {
  [key: string]: string[]
}
