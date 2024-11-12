import NpcState from '../scripts/states/npc'
import QuestState from '../scripts/states/quest'
import QuestStep from '../scripts/states/questStep'
//import WorldTasks from '../scripts/states/tasks'
import { Npcs, Trait } from './state'
import { NoOptionals } from './utils'

export interface Task {
  owner: string
  turns: number
  label: string // merits
  scope: string
  authority: string //ex; labor
  target: string
  cause: string
}
export interface TasksChecks {
  playerSnitchCheck(priors: boolean, cop: string, cause: string): Consequence
  npcCommitSnitchCheck(c: string, t: string): Consequence
  ignorant_check(target: string, listener: string): Consequence
  dumb_crook_check(target: string, listener: string): Consequence
  chaotic_good_check(target: string, listener: string): Consequence
  build_consequence(
    t: Task,
    listener: string,
    checks: Array<(target: string, listener: string) => Consequence>,
    precheck: boolean
  ): string
  recklessCheck(t: string, l: string): Consequence
  classy_check(t: string, l: string): Consequence
  predator_check(t: string, l: string): Consequence
  jailtime_check(t: string, l: string): Consequence
  pledgeCheck(t: string, l: string): Consequence
  bribeCheck(t: string, l: string): Consequence
  targetPunchedCheck(t: string, l: string): Consequence
  suspicious_check(t: string, l: string): Consequence
  vanity_check(t: string, l: string): Consequence
  prejudice_check(t: string, l: string): Consequence
  angel_check(t: string, l: string): Consequence
  admirer_check(t: string, l: string): Consequence
  unlucky_check(t: string, l: string): Consequence
  becomeASnitchCheck(t: string, l: string): Consequence
  watcher_punched_check(t: string, l: string): Consequence
  charmed_merits(t: string, l: string): Consequence
  ap_boost(t: string, l: string): Consequence
  love_boost(t: string, l: string): Consequence
}
export interface TasksOutcomes {
  addPledge(t: string): void
  lConfrontPunchT(t: string, hit?: number): void
  tConfrontPunchL(l: string, hit?: number): void
  getExtorted(t: string, l: string): string
  add_prejudice(tClan: string, listener: NpcState): void
  given_gift(t: string, l: string): Consequence
}
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
  conditions: QuestConditions
  side_quests?: QuestConditions
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
    | Trait
    | number
    | void
    | string
    | null
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
export interface Effect {
  label: string
  turns: number
  fx: {
    type: 'skills' | 'binaries' | 'opinion'
    stat: string
    adjustment: number
  }
}
export interface Consequence {
  pass: boolean
  type: string
}
