/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { AllQuestsMethods, QuestsState } from '../../types/tasks'
import { tutorialQuests } from './inits/quests/tutorialstate'

//const dt = math.randomseed(os.time())

function build_quests_state(questmethods: AllQuestsMethods): QuestsState {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
export default class WorldQuests {
  private _questmethods: AllQuestsMethods
  private _all: QuestsState
  checkpoint: string
  fsm: StateMachine

  constructor(questmethods: AllQuestsMethods) {
    this.fsm = new StateMachine(this, 'quests')
    this.checkpoint = 'tutorialA' //testjpf un-hardcode
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
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    // let i = this.all.length
    //probably update_quests_progress()!!
    this.update_quests_progress('turn')
  }
  private onTurnExit(): void {}
  private onInteractEnter(): void {}
  private onInteractUpdate(): void {
    this.update_quests_progress('interact')
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

  // checks quest completion after interactions and turns
  //TESTJPF all FSM stuff for quest turn
  update_quests_progress = (interval: string) => {
    //  print('checkpoint.slice(0, -1)', checkpoint.slice(0, -1))
    const quests = this.all[this.checkpoint.slice(0, -1)]

    let questKey: keyof typeof quests
    for (questKey in quests) {
      const quest = quests[questKey]
      if (quest.passed == false) {
        let quest_passed = true
        //print('questKey:', questKey)
        let condition: keyof typeof quest.conditions
        for (condition in quest.conditions) {
          // print('condition:', condition)
          const goal = quest.conditions[condition]
          //print('PREgoal label:', goal.label, goal.passed, goal.status)
          if (goal.passed == false && goal.status != 'failed') {
            // arg:func is array in case need for more than 1 check
            for (let i: number = goal.func.length; i-- !== 0; ) {
              if (
                goal.interval[i] == interval &&
                goal.func[i]!(goal.args[i]) == true
              ) {
                print('goal PASSED: GOAL', goal.label)
                goal.passed = true
                //goal.status = 'complete'
                quest.status = 'active'
                break
              }
            }
          }
          //print('POSTgoal label:', goal.label, goal.passed, goal.status)

          if (goal.passed == false) quest_passed = false
        }
        if (quest_passed == true) {
          quest.passed = true
          quest.status = 'complete'
          print(questKey, 'quest COMPLETE!!!')
        }
      }
    }
  }
}