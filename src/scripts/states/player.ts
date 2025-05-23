/* eslint-disable @typescript-eslint/no-empty-function */
import { Behavior, InventoryTableItem, Trait } from '../../types/state'
import { Effect, QuestMethods } from '../../types/tasks'
import { shuffle } from '../utils/utils'
import { RoomsInitState } from './inits/roomsInitState'
import { itemStateInit } from './inits/inventoryInitState'
import { WorldPlayerArgs } from '../../types/world'
import ActorState from './actor'
import Selector from '../behaviors/selector'
import Sequence from '../behaviors/sequence'
import {
  ActionProps,
  BehaviorSetters,
  HeroBehaviorKeys,
  HeroBehaviorProps,
} from '../../types/behaviors'
import PlaceSequence from '../behaviors/sequences/placeSequence'
import TrespassSequence from '../behaviors/sequences/trespassSequence'

function randomTrait(skills: Trait, bins: Trait) {
  let tempvals: number[] = shuffle([1, 1, 3, 4, 5, 6, 6, 7])
  let count = 0
  /*** START HERE TESTJPF
   * need the skills key. hardcode? make a type?!?!
   */
  let ks: keyof typeof skills // Type is "one" | "two" | "three"
  for (ks in skills) {
    skills[ks] = tempvals[count] + math.random(-1, 1)
    count++
  }

  tempvals = shuffle([-0.5, 0.5, -0.1, 0.1, -0.2, 0.2, -0.3, 0.3])
  count = 0
  let kb: keyof typeof bins // Type is "one" | "two" | "three"
  for (kb in bins) {
    bins[kb] = tempvals[count] + math.random(-0.2, 0.2)
    count++
  }
}

export default class WorldPlayer extends ActorState {
  pos = { x: 704, y: 448 }
  heat = 0
  alert_level = 0
  turns = 0
  checkpoint = 'tutorialA'
  quests: QuestMethods
  p: WorldPlayerArgs
  behavior: Behavior
  clan: string
  constructor(name: string, playerProps: WorldPlayerArgs) {
    super(name, playerProps)
    this.currRoom = 'reception'
    this.matrix = { x: 0, y: 4 }
    this.ap = 30
    this.apMax = 30
    this.clearance = 0
    this.name = 'player'
    this.clan = 'hero'
    this.exitRoom = 'grounds'
    const behaviorDefaults = () => {
      return {
        name: this.name,
        matrix: this.matrix,
        cooldown: this.cooldown,
        turnPriority: this.turnPriority,
        currRoom: this.currRoom,
        behavior: this.behavior,
        addToBehavior: this.addToBehavior.bind(this),
        hp: this.hp,
        updateFromBehavior: this.updateFromBehavior.bind(this),
      }
    }
    this.behavior = {
      active: new Selector([]),
      place: new Selector([]),
      update: {
        cooldown: (value) => (this.cooldown = value as number),
        hp: (value) => (this.hp = value as number),
        clearance: (value) => (this.clearance = value as number),
        turnPriority: (value) => (this.turnPriority = value as number),
        station: (value) => {
          const v = value as [string, string]
          this.matrix = RoomsInitState[v[0]].matrix
          this.exitRoom = this.currRoom
          this.currRoom = v[0]
          //this.currStation = v[1]
          //return
        },
      },
      props: {
        effects: () => {
          return { effects: this.effects, traits: this.traits }
        },

        place: () => {
          return {
            clearance: this.clearance,
            clan: 'hero',
            exitRoom: this.exitRoom,
            setRoomInfo: this.setRoomInfo.bind(this),
            ...behaviorDefaults(),
          }
        },
        immobile: () => {
          return {
            ...behaviorDefaults(),
          }
        },
        injured: () => {
          return {
            traits: this.traits,
            exitRoom: this.exitRoom,
            returnNpc: this.p.world.returnNpc.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            ...behaviorDefaults(),
          }
        },
        helper: () => {
          return {
            clearance: this.clearance,
            clan: 'hero',
            returnNpc: this.p.world.returnNpc.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            exitRoom: this.exitRoom,
            ...behaviorDefaults(),
          }
        },
        infirm: () => {
          return {
            exitRoom: this.exitRoom,
            ...behaviorDefaults(),
          }
        },
        infirmed: () => {
          return {
            clearance: this.clearance,
            getOccupants: this.p.rooms.getOccupants.bind(this),
            ...behaviorDefaults(),
          }
        },
        question: () => {
          return {
            traits: this.traits,
            inventory: this.inventory,
            clan: 'hero',
            // love: this.love,
            exitRoom: this.exitRoom,
            addInvBonus: this.addInvBonus.bind(this),
            removeInvBonus: this.removeInvBonus.bind(this),
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            setConfrontation: this.p.novel.setConfrontation.bind(this),
            ...behaviorDefaults(),
          }
        },
        announcer: () => {
          return {
            clan: this.clan,
            //love: this.love,
            traits: this.traits,
            addOrExtendEffect: this.addOrExtendEffect.bind(this),
            getOccupants: this.p.rooms.getOccupants.bind(this),
            returnNpc: this.p.world.returnNpc.bind(this),
            getBehaviorProps: this.getBehaviorProps.bind(this),
            ...behaviorDefaults(),
          }
        },
      } as HeroBehaviorProps,
    }
    randomTrait(this.traits.skills, this.traits.binaries)
    this.inventory = ['axe', 'apple01']
    this.p = playerProps
    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      return_playerroom: this.p.rooms.getFocusedRoom.bind(this),
    }
    this.inventory_init()
    this.fsm
      .addState('idle')
      .addState('place', {
        onEnter: this.onPlaceEnter.bind(this),
        onUpdate: this.onPlaceUpdate.bind(this),
        onExit: this.onPlaceExit.bind(this),
      })
      .addState('active', {
        onEnter: this.onActiveEnter.bind(this),
        onUpdate: this.onActiveUpdate.bind(this),
        onExit: this.onActiveExit.bind(this),
      })

    this.addToAlertLevel = this.addToAlertLevel.bind(this)
    // this.getPlayerRoom = this.getPlayerRoom.bind(this)
    this.setRoomInfo = this.setRoomInfo.bind(this)
    this.addInvBonus = this.addInvBonus.bind(this)
    this.add_effects_bonus = this.add_effects_bonus.bind(this)
    this.addOrExtendEffect = this.addOrExtendEffect.bind(this)
    this.addToBehavior = this.addToBehavior.bind(this)
    this.getBehaviorProps = this.getBehaviorProps.bind(this)
    this.updateFromBehavior = this.updateFromBehavior.bind(this)
    this.updateInventory = this.updateInventory.bind(this)
  }
  private onPlaceEnter(): void {
    if (this.behavior.place.children.length < 1)
      this.behavior.place.children.push(
        new PlaceSequence(this.getBehaviorProps.bind(this))
      )
  }
  private onPlaceUpdate(): void {
    this.behavior.place.run()
  }
  private onPlaceExit(): void {
    if (
      this.clearance + math.random(0, 1) <
      RoomsInitState[this.currRoom].clearance
    )
      //TESTJPF I think i need to remove player and
      // npcstate from checkfuncs init!!!
      this.behavior.active.children.push(
        new TrespassSequence(this.getBehaviorProps.bind(this))
      )

    this.behavior.active.run()
  }
  private onActiveEnter(): void {}
  private onActiveUpdate(): void {}
  private onActiveExit(): void {}

  setRoomInfo() {
    this.ap = this.ap - 1
    this.turns = this.turns + 1
    this.exitRoom = this.currRoom
    this.currRoom = this.p.rooms.getFocusedRoom()
    this.matrix = RoomsInitState[this.currRoom].matrix
    print('::: SETROOMINFO:::exit,enter::', this.exitRoom, this.currRoom)
  }
  /**
  getPlayerRoom(): string {
    return this.currRoom
  }
    **/
  updateFromBehavior(
    prop: keyof BehaviorSetters,
    value: number | [string, string]
  ): void {
    this.behavior.update[prop](value)

    //this.behavior.props[behavior]()
  }
  getBehaviorProps(behavior: HeroBehaviorKeys): ActionProps {
    const b = behavior
    return this.behavior.props[b]()
  }
  addToBehavior(selector: 'place' | 'active', s: Sequence, unshift = false) {
    unshift === false
      ? this.behavior[selector].children.push(s)
      : this.behavior[selector].children.unshift(s)
  }
  removeInvBonus(i: string) {
    const item: InventoryTableItem = { ...itemStateInit[i] }
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] - item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] - item.binaries[bKey]
  }

  addInvBonus(i: string) {
    const item: InventoryTableItem = { ...itemStateInit[i] }
    let sKey: keyof typeof item.skills
    for (sKey in item.skills)
      this.traits.skills[sKey] = this.traits.skills[sKey] + item.skills[sKey]

    let bKey: keyof typeof item.binaries
    for (bKey in item.binaries)
      this.traits.binaries[bKey] =
        this.traits.binaries[bKey] + item.binaries[bKey]
  }
  updateInventory(addDelete: 'add' | 'delete', item: string) {
    print(
      addDelete,
      'Playerupdateinv::: Item ...traits::speed, charisma,evil,authority:',
      item,
      this.traits.skills.speed,
      this.traits.skills.charisma,
      this.traits.binaries.evil_good,
      this.traits.binaries.anti_authority
    )
    if (addDelete == 'add') {
      this.inventory.push(item)
      this.addInvBonus(item)
    } else {
      this.inventory.splice(this.inventory.indexOf(item), 1)
      this.removeInvBonus(item)
    }
    print(
      addDelete,
      'Playerupdateinv::: Item ...traits::speed, charisma,evil,authority:',
      item,
      this.traits.skills.speed,
      this.traits.skills.charisma,
      this.traits.binaries.evil_good,
      this.traits.binaries.anti_authority
    )
  }
  add_inventory(i: string) {
    this.inventory.push(i)
  }
  return_inventory(): string[] {
    return this.inventory
  }
  return_skills(): Trait {
    return this.traits.skills
  }
  addToAlertLevel(n: number) {
    this.alert_level += n
  }
  private inventory_init() {
    for (const item of this.inventory) {
      this.addInvBonus(item)
    }
  }
  addOrExtendEffect(e: Effect) {
    //   let ek: keyof typeof this.effects
    for (const fx of this.effects) {
      if (e.label === fx.label) {
        fx.turns += 5
        return
      }
    }
    this.effects.push(e)
    this.add_effects_bonus(e)
  }
  add_effects_bonus(e: Effect) {
    this.traits[e.fx.type]![e.fx.stat] =
      this.traits[e.fx.type]![e.fx.stat] + e.fx.adjustment
  }
  remove_effects_bonus(e: Effect) {
    this.traits[e.fx.type]![e.fx.stat] =
      this.traits[e.fx.type]![e.fx.stat] - e.fx.adjustment
  }
  remove_effects(effects: Effect[]) {
    if (effects.length < 1) return
    //let eKey: keyof typeof
    for (let i = effects.length; i-- !== 0; ) {
      const e = effects[i]
      if (e.turns < 0) {
        this.remove_effects_bonus(e)
        effects.splice(i, 1)
      } else {
        e.turns = e.turns - 1
      }
    }
  }
}
