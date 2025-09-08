import NpcState from '../scripts/states/npc'
//import QuestState from '../scripts/states/quest'
import QuestStep from '../scripts/states/questStep'
//import SideQuest from '../scripts/states/sideQuest'
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

export interface QuestConditions {
  [key: string | number]: QuestStep
}
export interface QuestProps {
  id: string
  label: string
  solution?: string
  passed: boolean
  interval: string[]
  func: { (args: [() => any, any]): boolean }[]
  args: [() => any, any][]
}
export interface SideQuestProps {
  id: string
  label: string
  solution?: string
  passed: boolean
}
export interface QuestsState {
  [key: string]: { [key: string]: Quest }
}
export interface Quests {
  [key: string]: Quest
}
/**
  export interface Quest {
  id: string
  nextId: string
  passed: boolean
  conditions: QuestConditions
  side_quests: { [key: string]: SideQuest }
}**/
export interface Status {
  active: boolean
  passed: boolean
  see: boolean
  archive: boolean
}
export interface QuestTask {
  type: string
  subtype: string
  name: string
  operator: string
  value: string | string[]
}
export interface QuestStage {
  status: Status
  note: string
  tasks: QuestTask[]
}
export interface Quest {
  id: string
  //nextId: string
  checkpoint: string
  scope: string
  stage: number
  stages: QuestStage[]
  status: Status
  unlockSubKeys: string[]
  novelKeys: string[]
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
export interface Unlocks {
  [key: string]: Unlock
}

export interface Unlock {
  id: string
  unlock: (u: string) => void
}
export interface Moments {
  [key: string]: Moment
}

export interface Moment {
  id: string
  moment: (u: string) => void
}
