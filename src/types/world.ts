import NpcState from '../scripts/states/npc'
import WorldPlayer from '../scripts/states/player'
import StateMachine from '../scripts/states/stateMachine'
import TaskState from '../scripts/states/task'
import { NovelNpc } from './novel'
import { Npcs, Traits } from './state'
import { QuestMethods, Task } from './tasks'

export interface WorldArgs {
  returnNpc(n: string): NpcState
  returnPlayer(): WorldPlayer
}
export interface RoomProps extends WorldArgs {
  setFocused(r: string): void
}
export interface WorldTasksArgs extends WorldArgs {
  didCrossPaths(owner: string, target: string): boolean
  returnPlayer(): WorldPlayer
  getOccupants(r: string): string[]
  setConfrontation(t: Task): void
}
export interface TaskProps extends WorldTasksArgs {
  //addAdjustMendingQueue(patient: string): void
  npcHasTask(
    owner: string[],
    target: string[],
    labels?: string[]
  ): TaskState | null
  taskBuilder(owner: string, label: string, target: string, cause: string): void
}
export interface WorldPlayerArgs {
  getFocusedRoom(): string
  hasHallpass(owner: string): TaskState | null
  removeTaskByCause(target: string, cause: string): void
}
export interface WorldNpcsArgs extends TaskProps {
  getPlayerRoom(): string
  clearStation(room: string, station: string, npc: string): void
  checkSetStation(room: string, station: string, npc: string): boolean
  pruneStationMap(room: string, station: string): void
  setStation(room: string, station: string, npc: string): void
  getStationMap(): { [key: string]: { [key: string]: string } }
  sendToVacancy(room: string, npc: string): string | null
  //getMendingQueue(): string[]
  //removeMendee(mendee: string): void
  hasHallpass(owner: string): TaskState | null
  getFocusedRoom(): string
  removeTaskByCause(target: string, cause: string): void
  getNovelUpdates(): NovelNpc
  playerFSM: StateMachine
  playerTraits: Traits
}
export interface NpcProps extends WorldNpcsArgs {
  addAdjustMendingQueue(patient: string): void
  getMendingQueue(): string[]
  removeMendee(mendee: string): void
  addInfirmed(n: string, vacancy: string): void
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
  getIgnore(): string[]
}
export interface WorldQuestsMethods {
  [key: string]: QuestMethods
}
