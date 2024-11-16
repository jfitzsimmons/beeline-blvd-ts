/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { QuestsState } from '../../types/tasks'
import { tutorialQuests } from './inits/quests/tutorialstate'
import { WorldQuestsMethods } from '../../types/world'

const dt = math.randomseed(os.time())

function build_quests_state(questmethods: WorldQuestsMethods): QuestsState {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
export default class WorldQuests {
  private _questmethods: WorldQuestsMethods
  private _all: QuestsState
  checkpoint: string
  fsm: StateMachine

  constructor(questmethods: WorldQuestsMethods) {
    this.fsm = new StateMachine(this, 'quests')
    this.checkpoint = 'tutorialA'
    this._questmethods = questmethods
    this._questmethods.qq = {
      percent_tutorial: this.percent_tutorial.bind(this),
    }
    this._all = build_quests_state(this.questmethods)
    //this._spawn = 'grounds'
    //this.mendingQueue = []
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
  }
  private onNewEnter(): void {
    print('questsNEWENTER')
    let kq: keyof typeof this.all.tutorial
    for (kq in this.all.tutorial) {
      this.all.tutorial[kq].fsm.setState('new')
    }
  }
  private onNewUpdate(): void {
    print('questsNEWUPDATE')

    const checkpointQuests = this.all[this.checkpoint.slice(0, -1)]
    let kq: keyof typeof checkpointQuests
    for (kq in checkpointQuests) {
      checkpointQuests[kq].fsm.update(dt)
    }
    this.fsm.setState('turn')
  }
  private onNewExit(): void {}
  private onTurnEnter(): void {
    print('questsTURNENTER')
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
  public get all() {
    return this._all
  }
  public get questmethods() {
    return this._questmethods
  }
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
  //TESTJPF NEW this really should just loop through each quest, update.
  //each quest could update. each step can fire it's own function and args
  // this could lead to better function imports
  //and better FSM condtionals!!!
  // checks quest completion after interactions and turns
  /** 
  update_quests_progress = (interval: string) => {
    //  print('.checkpointslice(0, -1)', checkpoint.slice(0, -1))
   // const quests = this.all[this.checkpoint.slice(0, -1)]
    //let questKey: keyof typeof quests
    //for (questKey in quests) {
      const quest = quests[questKey]
      if (quest.passed == false) {
        let quest_passed = true
        //print('questKey:', questKey)
        let condition: keyof typeof quest.conditions
        for (condition in quest.conditions) {
          // print('condition:', condition)
          const goal = quest.conditions[condition]
          //print('PREgoal label:', goal.label, goal.passed, goal.status)
          if (goal.passed == false && goal.fsm.getState() != 'failed') {
            // arg:func is array in case need for more than 1 check
            for (let i: number = goal.func.length; i-- !== 0; ) {
              if (
                goal.interval[i] == interval &&
                goal.func[i]!(goal.args[i]) == true
              ) {
                print('goal PASSED: GOAL', goal.label)
                goal.passed = true
                //goal.status = 'complete'
                quest.fsm.setState('active')
                //quest.status = 'active'
                break
              }
            }
          }
          //print('POSTgoal label:', goal.label, goal.passed, goal.status)

          if (goal.passed == false) quest_passed = false
        }
        if (quest_passed == true) {
          quest.passed = true
          quest.fsm.setState('complete')
          print(questKey, 'quest COMPLETE!!!')
        }
      }
    }
  }*/
}
