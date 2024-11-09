import NpcState from '../scripts/states/npc'
import RoomState from '../scripts/states/room'
import { Effect } from './tasks'

export interface NpcsState {
  all: Npcs
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
}

export interface Npcs {
  [key: string]: NpcState
}
export interface NpcDefaults {
  convos: number
  actions: string[]
  ai_path: string
  matrix: { x: number; y: number }
  traits: Traits
  turns_since_encounter: number
  turns_since_convo: number
  love: number
  hp: number
  cooldown: number
  effects: Effect[]
  currRoom: string
  exitRoom: string
  currStation: string
  race: string
}
export interface Npc extends NpcDefaults {
  home: { x: number; y: number }
  name: string
  inventory: string[]
  clearance: number
  clan: string
  body: string
}
export interface PlayerState {
  currRoom: string
  exitRoom: string
  matrix: { x: number; y: number }
  name: string
  inventory: string[]
  pos: { x: number; y: number }
  heat: number
  alert_level: number
  clearance: number
  hp: number
  hp_max: number
  ap_max: number
  ap: number
  turns: number
  checkpoint: string
  traits: Traits
  effects: string[]
  factions: { [key: string]: number }
  gangs: { [key: string]: number }
}
export interface Traits {
  opinion?: Trait | never
  skills: Trait | never
  binaries: Trait | never
}
export interface Trait {
  [key: string]: number
}

export interface RoomsState {
  all: Rooms
  layout: Array<Array<string | null>>
  roles: Roles
  fallbacks: Fallbacks
}
export interface Rooms {
  [key: string]: RoomState //| Occupancy
}
export interface Room {
  matrix: { x: number; y: number }
  roomName: string
  clearance: number
  stations: { [key: string]: string }
  actors: Actors
  props?: string[]
  vacancies?: Vacancies
}
export interface Vacancies {
  [key: string]: string
}
export interface Fallbacks {
  stations: { [key: string]: string }
}
export interface Actors {
  [key: string]: Actor
}
export interface Actor {
  inventory: string[]
  watcher?: string
  actions: string[]
}

export interface Roles {
  [key: string]: string[]
}
export interface InventoryTable {
  [key: string]: InventoryTableItem
}
export interface InventoryTableItem {
  value: number
  level: number
  binaries: { [key: string]: number }
  skills: { [key: string]: number }
}
