import Sequence from '../scripts/behaviors/sequence'
import NpcState from '../scripts/states/npc'
import { Traits } from './state'
import { Effect } from './tasks'

export type ActionProps =
  | EffectsProps
  | PlaceProps
  | MenderProps
  | ImmobileProps
  | InjuredProps
  | MendeeProps
  | InfirmProps
  | InfirmedProps
  | HelperProps
  | QuestionProps
  | DefaultBehaviorProps

export type BehaviorKeys =
  | 'place'
  | 'effects'
  | 'medplace'
  | 'injury'
  | 'mender'
  | 'immobile'
  | 'injured'
  | 'mendee'
  | 'infirm'
  | 'infirmed'
  | 'helper'
  | 'question'

export interface BehaviorProps {
  effects: () => EffectsProps
  place: () => PlaceProps
  medplace: () => MedicPlaceProps
  injury: () => DefaultBehaviorProps
  mender: () => MenderProps
  immobile: () => ImmobileProps
  injured: () => InjuredProps
  mendee: () => MendeeProps
  infirm: () => InfirmProps
  infirmed: () => InfirmedProps
  helper: () => HelperProps
  question: () => QuestionProps
}

export interface DefaultBehaviorProps {
  name: string
  sincePlayerRoom: number
  currRoom: string
  currStation: string
  hp: number
  matrix: { x: number; y: number }
  cooldown: number
  addToBehavior(
    selector: 'place' | 'active',
    s: Sequence,
    unshift?: boolean
  ): void
}
export interface PlaceProps extends DefaultBehaviorProps {
  clearance: number
  clan: string
  exitRoom: string
  findRoomPlaceStation(t?: { x: number; y: number }, r?: string[]): void
}

export interface MedicPlaceProps extends PlaceProps {
  checkSetStation(room: string, station: string, npc: string): boolean
  getWards(room: string): string[]
  getMendingQueue(): string[]
  returnMendeeLocation(): string | null
}

export interface EffectsProps {
  effects: Effect[]
  traits: Traits
}
//export interface InjuryProps extends DefaultBehaviorProps {}
export interface QuestionProps extends DefaultBehaviorProps {
  traits: Traits
  inventory: string[]
  clan: string
  love: number
  addInvBonus(item: string): void
  addOrExtendEffect(effect: Effect): void
  getBehaviorProps(behavior: string): ActionProps
}

export interface MenderProps extends DefaultBehaviorProps {
  returnNpc(n: string): NpcState
  getFocusedRoom(): string
}
export interface InjuredProps extends DefaultBehaviorProps {
  traits: Traits
  exitRoom: string
  returnNpc(n: string): NpcState
  getMendingQueue(): string[]
  getOccupants(r: string): string[]
  getIgnore(): string[]
  addAdjustMendingQueue(patient: string): void
}
export interface HelperProps extends PlaceProps {
  returnNpc(n: string): NpcState
  getOccupants(r: string): string[]
  addAdjustMendingQueue(patient: string): void
  makePriorityRoomList(target: { x: number; y: number }): string[]
  getMendingQueue(): string[]
}
export interface MendeeProps extends DefaultBehaviorProps {
  returnNpc(n: string): NpcState
  addIgnore(n: string): void
  addAdjustMendingQueue(patient: string): void
  removeMendee(n: string): void
}
export interface InfirmedProps extends DefaultBehaviorProps {
  getOccupants(r: string): string[]
  //removeInfirmed(n: string): void
}
export interface ImmobileProps extends DefaultBehaviorProps {
  pruneStationMap(currRoom: string, currStation: string): void
}
export interface InfirmProps extends DefaultBehaviorProps {
  exitRoom: string
  sendToVacancy(
    room: string,
    npc: string,
    currRoom: string,
    currStation: string
  ): string | null
  // addInfirmed(n: string, vacancy: string): void
}
