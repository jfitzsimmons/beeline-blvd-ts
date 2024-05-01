import { Npc, Npcs, Skills } from './state'

export interface ObjectivesGroup
  extends Record<string, Objectives | string | any> {
  status: string
}
export interface Objectives extends Record<string, Objective | string | any> {
  status: string
}
export interface Objective {
  status: string
  conditions: ObjectiveConditions
  side_Objectives?: ObjectiveConditions
}

export interface ObjectiveConditions {
  [key: string | number]: ObjectiveCondition
}
export interface ObjectiveCondition {
  label: string
  status: string
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
  [key: string | number]: QuestCondition
}
export interface QuestCondition {
  label?: string
  solution?: string
  passed: boolean
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
export interface QuestMethods {
  [key: string]: (
    args?: unknown | [() => Npcs, number]
  ) =>
    | Npc[]
    | boolean
    | Npcs
    | [string[], Npcs]
    | string[]
    | Skills
    | number
    | void
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
