import { Behavior, BehaviorSystem } from '../../types/state'
//import { BehaviorsInitState } from './inits/behaviorInitState'

export default class WorldBehaviors {
  private _all: { [key: string]: BehaviorSystem } = {}

  checkpoint: string
  commands: { [key: string]: BehaviorSystem } = {}
  constructor() {
    // this.fsm = new StateMachine(this, 'quests')
    this.checkpoint = 'tutorialA'

    //this._all = { }

    //   this.initBehavior = this.initBehavior.bind(this)
    this.addCommand = this.addCommand.bind(this)
    this.updateBehavior = this.updateBehavior.bind(this)
    this.addBehavior = this.addBehavior.bind(this)
  }

  public get all() {
    return this._all
  }
  addBehavior({
    id = 'behavior_npc_player',
    //recipient = 'player',
    //agent = 'security001',
    reason = 'theft',
    // type = 'question',
    turns = 5,
    optionKeys = [],
  }: Partial<Behavior> = {}): void {
    const [type, agent, recipient] = id.split('_')
    const required: Behavior = {
      id,
      recipient,
      agent,
      reason,
      type,
      turns,
      optionKeys,
    }
    const behaviorKey = `behavior_${agent}_${recipient}`
    //testjpf this needs to be the actual entity
    // probably need entity command object.
    //Id like to add behaviorKey to npc state as well

    this._all[behaviorKey] = this.commands[type].init(
      required
    ) as BehaviorSystem
  }
  addCommand(bs: BehaviorSystem): void {
    this.commands[bs.id] = bs
  }
  deleteBehavior(id: string): void {
    delete this._all[id]
  }
  updateBehavior(id: string): void {
    this.all[id].turns += 4
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
