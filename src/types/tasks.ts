import NpcState from '../scripts/states/npc'
import QuestState from '../scripts/states/quest'
import QuestStep from '../scripts/states/questStep'
import TaskState from '../scripts/states/task'
//import { Direction } from './ai'
import { Npcs, PlayerState, Skills } from './state'

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
export interface WorldPlayerProps {
  getFocusedRoom(): string
  hasHallpass(owner: string): TaskState | null
  removeTaskByCause(target: string, cause: string): void
}
export interface WorldTasksProps {
  didCrossPaths(owner: string, target: string): boolean
  returnNpc(n: string): NpcState
  returnPlayer(): PlayerState
  getOccupants(r: string): string[]
}
export interface TaskProps extends WorldTasksProps {
  addAdjustMendingQueue(patient: string): void
  npcHasTask(owner: string, target: string, labels?: string[]): TaskState | null
  taskBuilder(owner: string, label: string, target: string, cause: string): void
}
export interface PlayerMethod {
  setRoomInfo(r: string): void
  getPlayerRoom(): string
}

export interface NpcsProps2 {
  set_focused(r: string): void
}
export interface NpcsProps {
  isStationedTogether(npcs: string[], room: string): boolean
  getPlayerRoom(): string
  clearStation(room: string, station: string, npc: string): void
  setStation(room: string, station: string, npc: string): void
  pruneStationMap(room: string, station: string): void
  getStationMap(): { [key: string]: { [key: string]: string } }
  //resetStationMap(): void
  //getVicinityTargets(): Direction
  sendToInfirmary(npc: string): string | null
  getMendingQueue(): string[]
  taskBuilder(owner: string, label: string, target: string, cause: string): void
  hasHallpass(owner: string): TaskState | null
}
export interface NpcMethod extends NpcsProps {
  add_infirmed(n: string): void
  get_infirmed(): string[]
  remove_infirmed(n: string): void
  add_injured(n: string): void
  get_injured(): string[]
  remove_injured(n: string): void
  add_ignore(n: string): void
  remove_ignore(n: string): void
  //getVicinityTargets(): Direction
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
export interface TasksChecks {
  playerSnitchCheck(priors: boolean, cop: string, cause: string): string
  npcSnitchCheck(c: string, t: string): string
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
    type: 'skills' | 'binaries' | 'opinion'
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
