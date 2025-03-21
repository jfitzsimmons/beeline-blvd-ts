import NpcState from '../scripts/states/npc'
import WorldPlayer from '../scripts/states/player'
import TaskState from '../scripts/states/task'
import { QuestMethods } from './tasks'

export interface WorldPlayerArgs {
  world: {
    returnNpc(n: string): NpcState
    //didCrossPaths(owner: string, target: string): boolean
  }
  rooms: {
    getOccupants(r: string): string[]
    getFocusedRoom(): string
  }
  novel: {
    setConfrontation(npc: string, action: string, reason: string): void
  }
}
export interface WorldNpcsArgs {
  world: {
    returnNpc(n: string): NpcState
    returnPlayer(): WorldPlayer
  }
  rooms: {
    getOccupants(r: string): string[]
    getFocusedRoom(): string
    clearStation(room: string, station: string, npc: string): void
    checkSetStation(room: string, station: string, npc: string): boolean
    pruneStationMap(room: string, station: string): void
    setStation(room: string, station: string, npc: string): void
    getStationMap(): {
      [key: string]: { [key: string]: { [key: string]: string } }
    }
    sendToVacancy(
      room: string,
      npc: string,
      currRoom: string,
      currStation: string
    ): string | null
    getWards(room: string): string[]
  }
  novel: {
    setConfrontation(npc: string, action: string, reason: string): void
  }
}
export interface NpcProps extends WorldNpcsArgs {
  npcs: {
    addAdjustMendingQueue(patient: string): void
    getMendingQueue(): string[]
    removeMendee(mendee: string): void
    addIgnore(n: string): void
    removeIgnore(n: string): void
    returnMendeeLocation(): string | null
    getIgnore(): string[]
  }
}
export interface WorldQuestsMethods {
  [key: string]: QuestMethods
}

export interface WorldArgs {
  returnNpc(n: string): NpcState
  returnPlayer(): WorldPlayer
}
export interface RoomProps extends WorldArgs {
  setFocused(r: string): void
}
export interface TaskProps extends WorldArgs {
  //addAdjustMendingQueue(patient: string): void
  npcHasTask(
    owner: string[],
    target: string[],
    labels?: string[]
  ): TaskState | null
  taskBuilder(owner: string, label: string, target: string, cause: string): void
}
