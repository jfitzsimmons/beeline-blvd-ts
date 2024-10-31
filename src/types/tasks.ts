import NpcState from '../scripts/states/npc'
import QuestState from '../scripts/states/quest'
import QuestStep from '../scripts/states/questStep'
import TaskState from '../scripts/states/task'
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

export interface QuestConditions {
  [key: string | number]: QuestStep
}
export interface QuestCondition {
  id: string
  label: string
  solution?: string
  passed: boolean
  //status: 'inactive' | 'active' | 'complete' | 'standby' | 'failed'
  interval: string[]
  func: { (args: [() => any, any]): boolean }[]
  args: [() => any, any][]
}

export interface QuestsState {
  [key: string]: { [key: string]: QuestState }
}
export interface Quests {
  [key: string]: QuestState
}

export interface Quest {
  id: string
  passed: boolean
  // status: 'active' | 'inactive' | 'complete'
  conditions: QuestConditions
  side_quests?: QuestConditions
}
export interface AllQuestsMethods {
  [key: string]: QuestMethods
}
export interface TasksMethods {
  has_hallpass(owner: string): TaskState | null
  removeTaskByCause(owner: string, cause: string): void
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
  send_to_infirmary(npc: string): string | null
  getMendingQueue(): string[]
  taskBuilder(
    owner: NpcState,
    label: string,
    target: string,
    cause: string
  ): void
  has_hallpass(owner: string): TaskState | null
}
export interface NpcMethod extends RoomMethod {
  add_infirmed(n: string): void
  get_infirmed(): string[]
  remove_infirmed(n: string): void
  add_injured(n: string): void
  get_injured(): string[]
  remove_injured(n: string): void
  add_ignore(n: string): void
  remove_ignore(n: string): void
  getVicinityTargets(): Direction
  return_doctors(): NpcState[]
  return_security(): NpcState[]
  return_all(): Npcs
  return_order_all(): [string[], Npcs]
  returnMendeeLocation(): string
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

export interface Task {
  owner: string
  turns: number
  label: string // merits
  scope: string
  authority: string //ex; labor
  target: string
  cause: string
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
