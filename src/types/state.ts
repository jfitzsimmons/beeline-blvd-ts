export interface WorldState {
  player: PlayerState
  rooms: RoomsState
  //npcs: any
  //tasks: any
  clock: number
}
export interface GameState {
  world: WorldState
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
