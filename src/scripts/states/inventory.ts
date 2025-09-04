/* eslint-disable @typescript-eslint/no-empty-function */
//import StateMachine from './stateMachine'
import { Inventories, Storage } from '../../types/state'
import { InventoryInitState } from './inits/inventoryInitState'
//import { tutorialQuests } from './inits/quests/tutorialstate'
//import { WorldQuestsMethods } from '../../types/world'

//const dt = math.randomseed(os.time())

/**
 function build_quests_state(questmethods: WorldQuestsMethods): QuestsState {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
  */
export default class WorldInventory {
  //private _questmethods: WorldQuestsMethods
  //private _all: QuestsState
  private _all: Inventories

  //fsm: StateMachine

  constructor() {
    // this.fsm = new StateMachine(this, 'quests')

    // this._questmethods = questmethods

    this._all = { ...InventoryInitState }
    /**
       this._questmethods.qq = {
      percent_tutorial: this.percent_tutorial.bind(this),
    } 
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })
    this.fsm.addState('interact', {
      onEnter: this.onInteractEnter.bind(this),
      onUpdate: this.onInteractUpdate.bind(this),
      onExit: this.onInteractExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })
      */
    this.updateInventory = this.updateInventory.bind(this)

    this.initStorage = this.initStorage.bind(this)
  }
  /** 
  private onNewEnter(): void {
    //  print('questsNEWENTER')
    let kq: keyof typeof this.all.tutorial
    for (kq in this.all.tutorial) {
      this.all.tutorial[kq].fsm.setState('new')
    }
  }
  private onNewUpdate(): void {
    // print('questsNEWUPDATE')

    const checkpointQuests = this.all[this.checkpoint.slice(0, -1)]
    let kq: keyof typeof checkpointQuests
    for (kq in checkpointQuests) {
      checkpointQuests[kq].fsm.update(dt)
    }
    this.fsm.setState('turn')
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {
    //  print('questsTURNENTER')
    let kq: keyof typeof this.all.tutorial
    for (kq in this.all.tutorial) {
      this.all.tutorial[kq].fsm.setState('turn')
    }
  }
  private onTurnUpdate(): void {
    print('<<< ::: QUESTSTurnUpdate() ::: >>>')
    const checkpointQuests = this.all[this.checkpoint.slice(0, -1)]
    let kq: keyof typeof checkpointQuests
    for (kq in checkpointQuests) {
      print('LOOP!!! QUESTSTurnUpdate() ::: >>>')

      checkpointQuests[kq].fsm.update(dt)
    }
  }
  private onTurnExit(): void {}
  private onInteractEnter(): void {}
  private onInteractUpdate(): void {
    //testjpf rethink diff between turn and interact
    const checkpointQuests = this.all[this.checkpoint]
    let kq: keyof typeof checkpointQuests
    for (kq in checkpointQuests) {
      checkpointQuests[kq].fsm.update(dt)
    }
  }
  private onInteractExit(): void {}


    percent_tutorial(): number {
    let qKey: keyof typeof this.all
    let count = 0
    let passed = 0
    for (qKey in this.all['tutorial']) {
      if (this.all['tutorial'][qKey].passed == true) passed = passed + 1
      count = count + 1
    }

    return Math.round((passed / count) * 100)
  }
    */
  public get all() {
    return this._all
  }
  initStorage(storage: Storage) {
    const storageKey = storage.id
    this._all[storageKey] = storage
  }

  updateInventory(id: string, addDelete: 'add' | 'delete', item: string) {
    const inventory = this.all[id].inventory

    addDelete == 'add'
      ? inventory.push(item)
      : inventory.splice(inventory.indexOf(item), 1)
  }
}
