/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { AllQuestsMethods, Task, WorldQuests } from '../../types/tasks'
import { tutorialQuests } from './inits/quests/tutorialstate'
import NpcState from './npc'
import TaskState from './task'

const dt = math.randomseed(os.time())

function build_quests_state(questmethods: AllQuestsMethods): WorldQuests {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}
export default class WorldTasks {
  private _all: TaskState[]
  private _questmethods: AllQuestsMethods
  //private consolations: Array<(b: Skills, s: Skills) => Consolation>
  private _quests: WorldQuests
  //spawn will be updated when checkpoints are passed.
  private _spawn: string
  fsm: StateMachine

  mendingQueue: string[]

  constructor(questmethods: AllQuestsMethods) {
    this.fsm = new StateMachine(this, 'tasks')

    this._questmethods = questmethods
    this._questmethods.tq = {
      num_of_injuries: this.num_of_injuries.bind(this),
      percent_tutorial: this.percent_tutorial.bind(this),
    }
    this._all = []
    this._quests = build_quests_state(this.questmethods)
    this._spawn = 'grounds'
    this.mendingQueue = []
    this.fsm.addState('idle')
    this.fsm.addState('turn', {
      onEnter: this.onTurnEnter.bind(this),
      onUpdate: this.onTurnUpdate.bind(this),
      onExit: this.onTurnExit.bind(this),
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
    let i = this.all.length
    while (i-- !== 0) {
      // print('npc', i)
      const task = this.all[i]

      task.fsm.update(dt)
    }
  }
  private onTurnExit(): void {}
  public set spawn(s: string) {
    this._spawn = s
  }
  public get spawn() {
    return this._spawn
  }
  public set quests(s: WorldQuests) {
    this._quests = s
  }
  public get quests() {
    return this._quests
  }
  public get all() {
    return this._all
  }
  public get questmethods() {
    return this._questmethods
  }
  task_has_npc(cause: string): string | null {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (c.cause == cause) {
        return this.all[i].owner
      }
    }
    return null
  }
  percent_tutorial(): number {
    let qKey: keyof typeof this.quests
    let count = 0
    let passed = 0
    for (qKey in this.quests['tutorial']) {
      if (this.quests['tutorial'][qKey].passed == true) passed = passed + 1
      count = count + 1
    }

    return Math.round((passed / count) * 100)
  }
  num_of_injuries(): number {
    const injuries = this.all.filter((c) => c.label == 'injury').length
    //print('busy_doc:: docs[0]:', docs[0])
    return injuries
  }
  remove_quest_tasks(owner: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (c.target == owner && ['quest'].includes(c.label)) {
        this.all.splice(i, 1)
      }
    }
  }
  remove_mend(sus: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (c.target == sus && ['mending'].includes(c.label)) {
        this.all.splice(i, 1)
      }
    }
  }
  remove_heat(sus: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (
        c.target == sus &&
        ['questioning', 'arrest', 'snitch', 'injury'].includes(c.label)
      ) {
        this.all.splice(i, 1)
      }
    }
  }
  already_hunting(owner: string, sus: string) {
    for (const c of this.all) {
      if (
        c.owner == owner &&
        c.target == sus &&
        (c.label == 'questioning' || c.label == 'arrest')
      ) {
        return c
      }
    }
    return null
  }
  plan_on_snitching(owner: string, sus: string): boolean {
    for (const c of this.all) {
      if (c.owner == owner && c.target == sus && c.label == 'snitch') {
        return true
      }
    }
    return false
  }
  npc_has_task(owner: string, sus: string): TaskState | null {
    for (const c of this.all) {
      if ((owner == 'any' || c.owner == owner) && c.target == sus) {
        return c
      }
    }
    return null
  }
  has_clearance(sus: string): boolean {
    for (const c of this.all) {
      if (c.target == sus && c.label == 'clearance') {
        return true
      }
    }
    return false
  }
  npc_is_wanted(sus: string): boolean {
    for (const c of this.all) {
      if (
        c.target == sus &&
        (c.label == 'arrest' || c.label == 'questioning')
      ) {
        return true
      }
    }
    return false
  }
  number_of_tasks(sus: string): number {
    let count = 0
    for (const c of this.all) {
      if (c.target == sus) {
        count++
      }
    }
    return count
  }

  //TEstjpf need add task remove task
  //add_task_assist
  task_builder(n: NpcState, c: string, s: string, cause = 'theft') {
    //explain why you need this testjpf
    //no nested ifs
    //cna this be done somewhere else?
    const append: Task = {
      owner: n.labelname,
      turns: 15,
      label: c, // merits //testjpf state is a bad name
      scope: 'npc',
      authority: n.clan, //ex; labor
      target: s,
      cause,
    }
    //testjpf this is getting bad.  cleanup code
    if (c == 'snitch') {
      append.authority = 'security'
      append.scope = 'clan'
      if (s == 'player') {
        this.questmethods.pq.increase_alert_level()
      }
    } else if (c == 'merits') {
      if (s == 'player') {
        n.love = n.love + 1
      }
      append.turns = 3
    } else if (c == 'demerits') {
      if (s == 'player') {
        n.love = n.love - 1
      }
      append.turns = 3
    } else if (c == 'reckless') {
      append.turns = 3
    } else if (c == 'injury') {
      append.authority = 'doctors'
      append.scope = 'clan'
      append.turns = 30
    } else if (c == 'suspicious') {
      append.label = 'snitch'
      append.authority = 'security'
      append.scope = 'clan'
      append.turns = 10
      append.cause = 'suspicious'
    } else if (c == 'quest') {
      append.turns = 72
      append.authority = 'player'
    }

    print(
      append.owner,
      'know that',
      append.target,
      'did',
      append.cause,
      'so created task:',
      append.label,
      'for turns:',
      append.turns
    )

    this.append_task(append)
  }
  append_task(task: Task) {
    print('NEW::: Appended task::', task.label, task.owner)
    this.all.push(new TaskState(task))
  }
  // checks quest completion after interactions and turns
  //TESTJPF all FSM stuff for quest turn
  update_quests_progress = (interval: string, checkpoint: string) => {
    //  print('checkpoint.slice(0, -1)', checkpoint.slice(0, -1))
    const quests = this.quests[checkpoint.slice(0, -1)]

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
  get_field_docs(): string[] {
    //if mending and in field busy
    //if mending in office and office full
    const docs = this.all.filter((c) => c.cause == 'field').map((c) => c.owner)

    return docs
  }
  has_ignore_task(n: string): boolean {
    //if mending and in field busy
    //if mending in office and office full
    const ignored = this.all.filter((c) => c.label == 'ignore' && c.owner == n)
    print(
      'ignored.length > 0 ? true : false',
      ignored.length > 0 ? true : false
    )
    return ignored.length > 0 ? true : false
  }
}
