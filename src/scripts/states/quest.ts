/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { Quest } from '../../types/tasks'
import QuestStep from './questStep'
import SideQuest from './sideQuest'
const dt = math.randomseed(os.time())

export default class QuestState {
  //private _questmethods: WorldQuestsMethods
  id: string
  passed: boolean
  fsm: StateMachine
  conditions: { [key: string]: QuestStep }
  sideQuests: { [key: string]: SideQuest }
  constructor(questparams: Quest) {
    this.id = questparams.id
    this.fsm = new StateMachine(this, 'quest' + this.id)
    this.passed = questparams.passed
    this.conditions = questparams.conditions
    this.sideQuests = questparams.side_quests
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
    })
    this.fsm.addState('active', {
      onEnter: this.onActiveEnter.bind(this),
      onUpdate: this.onActiveUpdate.bind(this),
      onExit: this.onActiveExit.bind(this),
    })
    this.fsm.addState('new', {
      onEnter: this.onNewEnter.bind(this),
      onUpdate: this.onNewUpdate.bind(this),
      onExit: this.onNewExit.bind(this),
    })
  }
  private onNewEnter(): void {
    print('singlequeestNEWENTER')

    let kc: keyof typeof this.conditions
    for (kc in this.conditions) {
      this.conditions[kc].fsm.setState('new')
    }
    let ksq: keyof typeof this.sideQuests
    for (ksq in this.sideQuests) {
      this.sideQuests[ksq].fsm.setState('new')
    }
  }
  private onNewUpdate(): void {
    print('singlequeestNEWUPDATE')

    if (this.passed == true) return
    let kc: keyof typeof this.conditions
    for (kc in this.conditions) {
      this.conditions[kc].fsm.update(dt)
    }
    let ksq: keyof typeof this.sideQuests
    for (ksq in this.sideQuests) {
      this.sideQuests[ksq].fsm.update(dt)
    }
    this.fsm.setState('turn')
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {}
  private onTurnExit(): void {}
  private onActiveEnter(): void {
    if (this.passed == true) return
    let kc: keyof typeof this.conditions
    for (kc in this.conditions) {
      this.conditions[kc].fsm.update(dt)
    }
    let ksq: keyof typeof this.sideQuests
    for (ksq in this.sideQuests) {
      this.sideQuests[ksq].fsm.update(dt)
    }
  }
  private onActiveUpdate(): void {
    if (this.passed == true) return
    let kc: keyof typeof this.conditions
    for (kc in this.conditions) {
      this.conditions[kc].fsm.update(dt)
    }
    let ksq: keyof typeof this.sideQuests
    for (ksq in this.sideQuests) {
      this.sideQuests[ksq].fsm.update(dt)
    }
  }
  private onActiveExit(): void {}
}
