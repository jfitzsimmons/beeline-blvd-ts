/* eslint-disable @typescript-eslint/no-empty-function */
import { InventoryTableItem, Trait } from '../../types/state'
import { QuestMethods } from '../../types/tasks'
import { shuffle } from '../utils/utils'
import { RoomsInitLayout, RoomsInitState } from './inits/roomsInitState'
//import StateMachine from './stateMachine'
import { itemStateInit } from './inits/inventoryInitState'
import { WorldPlayerArgs } from '../../types/world'
import ActorState from './actor'

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
  parent: WorldPlayerArgs

  constructor(p: string, playerProps: WorldPlayerArgs) {
    print('pre player super')
    super(p, playerProps) // call super() here
    //this.pos= { x: 704, y: 448 }
    print('post player super')

    //this.fsm = new StateMachine(this, 'player' + p)
    print('post player FSM')

    this.currRoom = 'grounds'
    print('post player currom')

    this.matrix = { x: 0, y: 4 }
    this.ap = 30
    this.apMax = 30
    this.name = 'player'
    this.exitRoom = 'grounds'
    print('pre player traits')

    randomTrait(this.traits.skills, this.traits.binaries)
    print('post player super')
    this.inventory = ['axe', 'apple01']

    this.quests = {
      return_inventory: this.return_inventory.bind(this),
      return_skills: this.return_skills.bind(this),
      return_playerroom: this.return_playerroom.bind(this),
    }
    this.parent = playerProps
    this.inventory_init()
    this.fsm
      .addState('idle')
      .addState('turn', {
        onEnter: this.onTurnEnter.bind(this),
        onUpdate: this.onTurnUpdate.bind(this),
        onExit: this.onTurnExit.bind(this),
      })
      .addState('trespass', {
        onEnter: this.onTrespassEnter.bind(this),
        onUpdate: this.onTrespassUpdate.bind(this),
        onExit: this.onTrespassExit.bind(this),
      })
      .addState('confronted', {
        onEnter: this.onConfrontedEnter.bind(this),
        onUpdate: this.onConfrontedUpdate.bind(this),
        onExit: this.onConfrontedExit.bind(this),
      })
    this.addToAlertLevel = this.addToAlertLevel.bind(this)
    this.getPlayerRoom = this.getPlayerRoom.bind(this)
    this.setRoomInfo = this.setRoomInfo.bind(this)
  }
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    //todo
    print('<< :: PLAYER-UPDATE-FSM :: >>')
    this.ap = this.ap - 1
    this.turns = this.turns + 1
    this.setRoomInfo()
    if (this.clearance < RoomsInitState[this.currRoom].clearance) {
      print(
        'PLAYER::: NEWQUESTIONED!!!',
        this.clearance,
        RoomsInitState[this.currRoom].clearance,
        this.currRoom
      )
      this.fsm.setState('trespass')
    }
  }
  private onTurnExit(): void {
    // print(this.name, 'has entered MOVE STATE')
  }
  private onTrespassEnter(): void {
    const hallpass = this.parent.hasHallpass('player')
    print('HALLPASS::', hallpass, this.currRoom, this.clearance)
    if (
      hallpass != null &&
      tonumber(hallpass.scope.charAt(hallpass.scope.length - 1))! >=
        RoomsInitState[this.currRoom].clearance
    ) {
      print(
        'HALLPASS2::',
        hallpass.scope,
        tonumber(hallpass.scope.charAt(hallpass.scope.length - 1))!,
        this.currRoom,
        this.clearance
      )

      this.fsm.setState('turn')
    }
  }
  private onTrespassUpdate(): void {
    this.ap = this.ap - 1
    this.turns = this.turns + 1
    this.setRoomInfo()
    if (this.clearance >= RoomsInitState[this.currRoom].clearance)
      this.fsm.setState('turn')
  }
  private onTrespassExit(): void {
    this.parent.removeTaskByCause('player', 'clearance')
  }
  private onConfrontedEnter(): void {}
  private onConfrontedUpdate(): void {}
  private onConfrontedExit(): void {}
  setRoomInfo() {
    this.exitRoom = RoomsInitLayout[this.matrix.y][this.matrix.x]!
    this.currRoom = this.parent.getFocusedRoom()
    this.matrix = RoomsInitState[this.currRoom].matrix
    print('::: SETROOMINFO:::exit,enter::', this.exitRoom, this.currRoom)
  }
  getPlayerRoom(): string {
    return this.currRoom
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

  add_inventory(i: string) {
    this.inventory.push(i)
  }
  return_inventory(): string[] {
    return this.inventory
  }
  return_skills(): Trait {
    return this.traits.skills
  }
  return_playerroom(): string {
    return this.currRoom
  }
  addToAlertLevel(n: number) {
    this.alert_level += n
  }
  private inventory_init() {
    for (const item of this.inventory) {
      print('item:::', item)
      this.addInvBonus(item)
    }
  }
}
