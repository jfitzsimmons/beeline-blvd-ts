import Selector from '../scripts/behaviors/selector'
import NpcState from '../scripts/states/npc'
import RoomState from '../scripts/states/room'
import { BehaviorProps } from './behaviors'
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
  aiPath: string
  matrix: { x: number; y: number }
  traits: Traits
  sincePlayerRoom: number
  sincePlayerConvo: number
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
export interface Behavior {
  place: Selector
  active: Selector
  props: BehaviorProps
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
  hpMax: number
  apMax: number
  ap: number
  turns: number
  checkpoint: string
  traits: Traits
  effects: string[]
  factions: { [key: string]: number }
  gangs: { [key: string]: number }
}
export interface Traits {
  opinion: Trait | never
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
  swaps: Swaps
  actors: Actors
  props?: string[]
  wards?: Wards
}
export interface Wards {
  [key: string]: string
}
export interface Swaps {
  [key: string]: [string, string]
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
