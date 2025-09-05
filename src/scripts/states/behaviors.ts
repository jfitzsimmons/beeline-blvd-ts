import { Behavior } from '../../types/state'
import { BehaviorsInitState } from './inits/behaviorInitState'

export default class WorldBehaviors {
  private _all: { [key: string]: Behavior }

  checkpoint: string

  constructor() {
    // this.fsm = new StateMachine(this, 'quests')
    this.checkpoint = 'tutorialA'

    this._all = { ...BehaviorsInitState }

    this.initBehavior = this.initBehavior.bind(this)
  }

  public get all() {
    return this._all
  }
  initBehavior({}) {}
  addBehavior({
    id = 'behavior_npc_question',
    recipient = 'player',
    agent = '',
    reason = 'theft',
    type = 'question',
  }: Partial<Behavior> = {}): void {
    const required: Behavior = { id, recipient, agent, reason, type }
    const behaviorKey = `behavior_${agent}_${id}`
    //testjpf this needs to be the actual entity
    // probably need entity command object.
    //Id like to add behaviorKey to npc state as well
    this._all[behaviorKey] = required
  }
  deleteBehavior(id: string): void {
    delete this._all[id]
  }
  /**
  updateStatus(questKey: string, statusKey: string) {
    if (statusKey == 'activate') {
      this.all[questKey].status.active = true
      dispatch(questKey, { status: 'activate' })
    }
  }

  */
  //TESTJPF NEW this really should just loop through each quest, update.
  //each quest could update. each step can fire it's own function and args
  // this could lead to better function imports
  //and better FSM condtionals!!!
  // checks quest completion after interactions and turns
}
