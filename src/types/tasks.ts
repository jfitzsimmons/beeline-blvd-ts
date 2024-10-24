import NpcState from '../scripts/states/npc'
import { Direction } from './ai'
import { Npcs, Skills } from './state'

type NoOptionals<T> = {
  [K in keyof T]-?: T[K]
}
export type ObjectivesGroup = NoOptionals<ObjectivesGroupOpt>
export interface ObjectivesGroupOpt {
  [key: string]: {
    status: string
    quest: { [key: string]: Objectives }
  }
}
export interface Objectives extends Record<string, Objective | string | any> {
  status: string
  objective: { [key: string | number]: Objective }
}
export interface Objective {
  status: string
  label: string
  side_Objectives?: Objective
}
/** 
export interface Objective {
  status: string
  data: ObjectiveConditions
  side_Objectives?: ObjectiveConditions
}

export interface ObjectiveConditions {
  [key: string | number]: ObjectiveCondition
}
export interface ObjectiveCondition {
  label: string
  status: string
}
*/
export interface Quests {
  [key: string]: Quest
}

export interface Quest {
  passed: boolean
  status: 'active' | 'inactive' | 'complete'
  conditions: QuestConditions
  side_quests?: QuestConditions
}

export interface QuestConditions {
  [key: string | number]: QuestCondition
}
export interface QuestCondition {
  label: string
  solution?: string
  passed: boolean
  status: 'inactive' | 'active' | 'complete' | 'standby' | 'failed'
  interval: string[]
  func: { (args: [() => any, any]): boolean }[]
  args: [() => any, any][]
}

export interface WorldQuests {
  [key: string]: Quests
}
export interface AllQuestsMethods {
  [key: string]: QuestMethods
}
export interface PlayerMethod {
  set_room_info(r: string): void
  get_player_room(): string
}
export interface RoomMethod {
  get_player_room(): string
  clear_station(room: string, station: string, npc: string): void
  set_station(room: string, station: string, npc: string): void
  prune_station_map(room: string, station: string): void
  get_station_map(): { [key: string]: { [key: string]: string } }
  reset_station_map(): void
  getVicinityTargets(): Direction
}
export interface NpcMethod extends RoomMethod {
  add_infirmed(n: string): void
  remove_infirmed(n: string): void
  add_injured(n: string): void
  remove_injured(n: string): void
  getVicinityTargets(): Direction
}
export interface QuestMethods {
  [key: string]: (
    args: [() => Npcs, number] | string | void
  ) =>
    | NpcState[]
    | boolean
    | Npcs
    | [string[], Npcs]
    | string[]
    | Skills
    | number
    | void
    | string
    | null
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

export interface Consolation {
  fail: boolean
  caution: string
}

export interface Consequence {
  pass: boolean
  type: string
}
