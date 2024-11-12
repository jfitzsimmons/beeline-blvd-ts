import NpcState from '../scripts/states/npc'
import WorldPlayer from '../scripts/states/player'
import StateMachine from '../scripts/states/stateMachine'
import TaskState from '../scripts/states/task'
import { NovelNpc } from './novel'
import { Npcs, Traits } from './state'
import { QuestMethods, Task } from './tasks'

export interface WorldRoomsArgs {
  returnNpc(n: string): NpcState
  returnPlayer(): WorldPlayer
}

export interface RoomProps extends WorldRoomsArgs {
  setFocused(r: string): void
}
export interface WorldNovelArgs {
  returnNpc(n: string): NpcState
}
export interface WorldTasksArgs extends WorldNovelArgs {
  didCrossPaths(owner: string, target: string): boolean
  returnPlayer(): WorldPlayer
  getOccupants(r: string): string[]
  setConfrontation(t: Task): void
}
export interface TaskProps extends WorldTasksArgs {
  addAdjustMendingQueue(patient: string): void
  npcHasTask(owner: string, target: string, labels?: string[]): TaskState | null
  taskBuilder(owner: string, label: string, target: string, cause: string): void
}
export interface WorldPlayerArgs {
  getFocusedRoom(): string
  hasHallpass(owner: string): TaskState | null
  removeTaskByCause(target: string, cause: string): void
}
export interface WorldNpcsArgs {
  isStationedTogether(npcs: string[], room: string): boolean
  getPlayerRoom(): string
  clearStation(room: string, station: string, npc: string): void
  setStation(room: string, station: string, npc: string): void
  pruneStationMap(room: string, station: string): void
  getStationMap(): { [key: string]: { [key: string]: string } }
  sendToVacancy(room: string, npc: string): string | null
  getMendingQueue(): string[]
  taskBuilder(owner: string, label: string, target: string, cause: string): void
  npcHasTask(owner: string, target: string, labels: string[]): TaskState | null
  hasHallpass(owner: string): TaskState | null
  getNovelUpdates(): NovelNpc
  playerFSM: StateMachine
  playerTraits: Traits
}
export interface NpcProps extends WorldNpcsArgs {
  addInfirmed(n: string): void
  getInfirmed(): string[]
  removeInfirmed(n: string): void
  addInjured(n: string): void
  getInjured(): string[]
  removeInjured(n: string): void
  addIgnore(n: string): void
  removeIgnore(n: string): void
  returnDoctors(): NpcState[]
  returnSecurity(): NpcState[]
  returnAll(): Npcs
  returnOrderAll(): [string[], Npcs]
  returnMendeeLocation(): string | null
}
export interface WorldQuestsMethods {
  [key: string]: QuestMethods
}
