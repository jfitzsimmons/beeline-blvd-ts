import Sequence from '../scripts/behaviors/sequence'
import NpcState from '../scripts/states/npc'
import WorldPlayer from '../scripts/states/player'
import Storage from '../scripts/states/storage'
import { Behavior, Traits } from './state'
import { Effect } from './tasks'

export type ActionProps =
  | EffectsProps
  | PlaceProps
  | HeroPlaceProps
  | MenderProps
  | ImmobileProps
  | InjuredProps
  | HeroInjuredProps
  | MendeeProps
  | InfirmProps
  | InfirmedProps
  | HelperProps
  | QuestionProps
  | DefaultBehaviorProps
  | AnnouncerProps
  | OnScreenProps
  | CopPlaceProps

export type HeroBehaviorKeys =
  | 'place'
  | 'effects'
  | 'immobile'
  | 'injured'
  | 'infirm'
  | 'infirmed'
  | 'helper'
  | 'question'
  | 'announcer'

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
  | 'announcer'
  | 'onScreen'
  | 'cops'

export interface BehaviorSetters {
  cooldown: (value: number | [string, string]) => void
  hp: (value: number | [string, string]) => void
  clearance: (value: number | [string, string]) => void
  turnPriority: (value: number | [string, string]) => void
  station: (value: number | [string, string]) => void
}

export type GetProps =
  | { (behavior: BehaviorKeys): ActionProps }
  | { (behavior: HeroBehaviorKeys): ActionProps }

export type BehaviorRunReturn =
  | 'REMOVE'
  | ''
  | [
      string,
      (behavior: BehaviorKeys) => ActionProps,
      ActionProps,
      string,
      Storage?
    ]
export interface HeroBehaviorProps {
  effects: () => EffectsProps
  place: () => PlaceProps | HeroPlaceProps
  immobile: () => ImmobileProps
  injured: () => InjuredProps
  infirm: () => InfirmProps
  infirmed: () => InfirmedProps
  helper: () => HelperProps
  question: () => QuestionProps | HeroQuestionProps
  announcer: () => AnnouncerProps
}

export interface BehaviorProps extends HeroBehaviorProps {
  medplace: () => MedicPlaceProps
  injury: () => DefaultBehaviorProps
  mender: () => MenderProps
  mendee: () => MendeeProps
  onScreen: () => OnScreenProps
  cops: () => CopPlaceProps
}

export interface DefaultBehaviorProps {
  name: string
  turnPriority: number
  currRoom: string
  currStation: string
  hp: number
  matrix: { x: number; y: number }
  cooldown: number
  behavior: Behavior
  addToBehavior(
    selector: 'place' | 'active',
    s: Sequence,
    unshift?: boolean
  ): void
  updateFromBehavior(
    prop: keyof BehaviorSetters,
    value: number | [string, string]
  ): void
}

export interface HeroPlaceProps extends SharedPlaceProps {
  setRoomInfo(): void
}
export interface SharedPlaceProps extends DefaultBehaviorProps {
  clearance: number
  clan: string
  exitRoom: string
  //findRoomPlaceStation(t?: { x: number; y: number }, r?: string[]): void
}

export interface PlaceProps extends SharedPlaceProps {
  findRoomPlaceStation(t?: { x: number; y: number }, r?: string[]): void
}

export interface MedicPlaceProps extends PlaceProps {
  checkSetStation(room: string, station: string, npc: string): boolean
  getWards(room: string): string[]
  getMendingQueue(): string[]
  returnMendeeLocation(): string | null
}

export interface CopPlaceProps extends PlaceProps {
  checkSetStation(room: string, station: string, npc: string): boolean
  getWards(room: string): string[]
  getWantedQueue(): [string, string][]
  addAdjustWantedQueue(fugitive: string, room: string): void
  getBehaviorProps(behavior: string): ActionProps
}

export interface EffectsProps {
  name: string
  effects: Effect[]
  traits: Traits
}
//export interface InjuryProps extends DefaultBehaviorProps {}
export interface QuestionProps extends DefaultBehaviorProps {
  traits: Traits
  inventory: string[]
  clan: string
  love: number
  exitRoom: string
  behavior: Behavior
  addAdjustWantedQueue(fugitive: string, room: string): void
  removeInvBonus: (chest_item: string) => void
  addInvBonus(item: string): void
  addOrExtendEffect(effect: Effect): void
  getBehaviorProps(behavior: string): ActionProps
  getOccupants(r: string): string[]
  getFocusedRoom(): string
  updateInventory(addDelete: 'add' | 'delete', item: string): void
  returnNpc(n: string): NpcState
}
export interface AnnouncerProps extends DefaultBehaviorProps {
  traits: Traits
  clan: string
  love: number
  returnNpc(n: string): NpcState
  addOrExtendEffect(effect: Effect): void
  getOccupants(r: string): string[]
  getBehaviorProps(behavior: string): ActionProps
}
export interface HeroQuestionProps extends QuestionProps {
  setConfrontation(npc: string, action: string, reason: string): void
}
/**
 * TESTJPF TODO
 * gothroughsequences and make sure that only
 * what is needed is in the tyope
 * and try like hell to trim this down
 */
export interface OnScreenProps extends DefaultBehaviorProps {
  returnPlayer(): WorldPlayer
  setConfrontation(npc: string, action: string, reason: string): void
}
export interface MenderProps extends DefaultBehaviorProps {
  behavior: Behavior
  returnNpc(n: string): NpcState
  getFocusedRoom(): string
}
export interface HeroInjuredProps extends DefaultBehaviorProps {
  traits: Traits
  exitRoom: string
  returnNpc(n: string): NpcState
  getOccupants(r: string): string[]
}
export interface InjuredProps extends HeroInjuredProps {
  //traits: Traits
  //exitRoom: string
  // returnNpc(n: string): NpcState
  getFocusedRoom(): string
  getMendingQueue(): string[]
  //getOccupants(r: string): string[]
  getIgnore(): string[]
  addAdjustMendingQueue(patient: string): void
}
export interface HelperProps extends PlaceProps {
  behavior: Behavior
  returnNpc(n: string): NpcState
  getOccupants(r: string): string[]
  addAdjustMendingQueue(patient: string): void
  makePriorityRoomList(target: { x: number; y: number }): string[]
  getMendingQueue(): string[]
  getFocusedRoom(): string
}
export interface MendeeProps extends DefaultBehaviorProps {
  returnNpc(n: string): NpcState
  addIgnore(n: string): void
  addAdjustMendingQueue(patient: string): void
  removeMendee(n: string): void
}
export interface InfirmedProps extends DefaultBehaviorProps {
  clearance: number
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
