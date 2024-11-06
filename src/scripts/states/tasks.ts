/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import {
  QuestMethods,
  Task,
  TaskProps,
  WorldTasksProps,
} from '../../types/tasks'
import TaskState from './task'
import { arraymove } from '../utils/utils'

const dt = math.randomseed(os.time())
/** 
function build_quests_state(questmethods: AllQuestsMethods): WorldQuests {
  return {
    tutorial: tutorialQuests(questmethods),
  }
}*/
export default class WorldTasks {
  private _all: TaskState[]
  //private consolations: Array<(b: Skills, s: Skills) => Consolation>
  //private _quests: WorldQuests
  //spawn will be updated when checkpoints are passed.
  private _spawn: string
  fsm: StateMachine
  quests: QuestMethods
  mendingQueue: string[]
  medicalSys: string[]
  methods: TaskProps
  parent: WorldTasksProps
  constructor(worldProps: WorldTasksProps) {
    this.fsm = new StateMachine(this, 'tasks')
    this._all = []
    // this._quests = build_quests_state(this.questmethods)
    this._spawn = 'grounds'
    this.mendingQueue = []
    this.medicalSys = []
    this.parent = worldProps
    this.methods = {
      npcHasTask: this.npcHasTask.bind(this),
      addAdjustMendingQueue: this.addAdjustMendingQueue.bind(this),
      didCrossPaths: this.parent.didCrossPaths.bind(this),
      returnNpc: this.parent.returnNpc.bind(this),
      returnPlayer: this.parent.returnPlayer.bind(this),
      taskBuilder: this.taskBuilder.bind(this),
      getOccupants: this.parent.getOccupants.bind(this),
    }

    this.quests = {
      num_of_injuries: this.num_of_injuries.bind(this),
    }

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

    this.fsm.setState('new')
    this.removeTaskByCause = this.removeTaskByCause.bind(this)
    this.removeTaskByLabel = this.removeTaskByLabel.bind(this)
    this.has_clearance = this.has_clearance.bind(this)
    this.getMendingQueue = this.getMendingQueue.bind(this)
    this.npcHasTask = this.npcHasTask.bind(this)
    this.taskBuilder = this.taskBuilder.bind(this)
  }
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    //testjpf one array of systemTasks/ crossTasks
    //in loop do ['mender','questioning',
    //'arrest','snitch','reckless',}includes(task.label)
    //opposite better !['quest,'injury'].includes
    //overengineered? not sure what i want?
    //instead of this.all have statetasks and systemtasks!?
    let i = this.all.length
    while (i-- !== 0) {
      const task = this.all[i]
      print(
        'TURNUPDATE::: task::',
        task.label,
        task.owner,
        task.target,
        task.cause
      )
      task.turns < 1 ? this.all.splice(i, 1) : task.fsm.update(dt)
      task.turns = task.turns - 1
    }
  }
  private onTurnExit(): void {}
  public set spawn(s: string) {
    this._spawn = s
  }
  public get spawn() {
    return this._spawn
  }
  /** 
  public set quests(s: WorldQuests) {
    this._quests = s
  }
  public get quests() {
    return this._quests
  }*/
  public get all() {
    return this._all
  }
  getMendingQueue(): string[] {
    return this.mendingQueue
  }
  addAdjustMendingQueue(patient: string) {
    if (this.mendingQueue.includes(patient) == true) {
      if (this.mendingQueue.indexOf(patient) > 1)
        arraymove(this.mendingQueue, this.mendingQueue.indexOf(patient), 0)
    } else {
      print('cautions caused patient:', patient, 'to be added to mendingQueue')
      this.mendingQueue.push(patient)
    }
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
  num_of_injuries(): number {
    const injuries = this.all.filter((c) => c.label == 'injury').length
    //print('busy_doc:: docs[0]:', docs[0])
    return injuries
  }
  removeTaskByLabel(owner: string, label: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (c.owner == owner && [label].includes(c.label)) {
        this.all.splice(i, 1)
      }
    }
  }
  removeTaskByCause(target: string, cause: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const t = this.all[i]
      if (t.target == target && [cause].includes(t.cause)) {
        this.all.splice(i, 1)
      }
    }
  }
  remove_quest_tasks(owner: string) {
    for (let i = this.all.length - 1; i >= 0; i--) {
      const c = this.all[i]
      if (c.owner == owner && ['quest'].includes(c.label)) {
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
  removeHeat(sus: string) {
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
  already_hunting(owner: string, sus: string): Task | null {
    for (const t of this.all) {
      if (
        t.owner == owner &&
        t.target == sus &&
        (t.label == 'questioning' || t.label == 'arrest')
      ) {
        t.turns = t.turns + 6
        return t
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
  npcHasTask(
    owner: string,
    target: string,
    labels: string[] = []
  ): TaskState | null {
    // print('npcHasTask', owner, target)
    for (const c of this.all) {
      //   print('npcHasTask:: C:', c.owner, c.target, c.label)
      if (
        (owner == 'any' || c.owner == owner) &&
        c.target == target &&
        (labels.length < 1 || labels.includes(c.label))
      ) {
        return c
      }
    }
    return null
  }
  has_clearance(owner: string): TaskState | null {
    for (const c of this.all) {
      if (c.owner == owner && c.label == 'clearance') {
        return c
      }
    }
    return null
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
  taskBuilder(o: string, label: string, target: string, cause = 'theft') {
    const owner = this.parent.returnNpc(o)
    //explain why you need this testjpf
    //no nested ifs
    //cna this be done somewhere else?
    const append: Task = {
      owner: owner.name,
      turns: 15,
      label, // merits //testjpf state is a bad name
      scope: 'npc',
      authority: owner.clan, //ex; labor
      target,
      cause,
    }
    //testjpf this is getting bad.  cleanup code
    if (label == 'snitch') {
      append.authority = 'security'
      append.scope = 'clan'
      if (target == 'player') {
        //this.questmethods.pq.increase_alert_level()
      }
    } else if (label == 'merits') {
      if (target == 'player') {
        owner.love = owner.love + 1
      }
      append.turns = 3
    } else if (label == 'demerits') {
      if (target == 'player') {
        owner.love = owner.love - 1
      }
      append.turns = 3
    } else if (label == 'reckless') {
      append.turns = 3
    } else if (label == 'injury') {
      append.authority = 'doctors'
      append.scope = 'clan'
      append.turns = 30
    } else if (label == 'suspicious') {
      append.label = 'snitch'
      append.authority = 'security'
      append.scope = 'clan'
      append.turns = 10
      append.cause = 'suspicious'
    } else if (label == 'quest') {
      append.turns = 72
      append.authority = 'player'
    } else if (label == 'mender') {
      append.turns = 99
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
    //if injury adjust q
    //in adjust q, dont push new task? ttestjpf
    this.all.push(new TaskState(task, this.methods))
  }
  // checks quest completion after interactions and turns
  //TESTJPF all FSM stuff for quest turn
  //update_quests_progress = (interval: string, checkpoint: string) {}

  get_field_docs(): string[] {
    //if mending and in field busy
    //if mending in office and office full
    const docs = this.all.filter((c) => c.cause == 'field').map((c) => c.owner)

    return docs
  }
  /**
  has_ignore_task(n: string): boolean {
    //if mending and in field busy
    //if mending in office and office full
    const ignored = this.all.filter((c) => c.label == 'ignore' && c.owner == n)
    print(
      'ignored.length > 0 ? true : false',
      ignored.length > 0 ? true : false
    )
    return ignored.length > 0 ? true : false
  }*/
}
