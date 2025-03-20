/* eslint-disable @typescript-eslint/no-empty-function */
import StateMachine from './stateMachine'
import { QuestMethods, Task } from '../../types/tasks'
import TaskState from './task'
import { TaskProps, WorldArgs } from '../../types/world'
export default class WorldTasks {
  private _all: TaskState[]
  private _spawn: string
  fsm: StateMachine
  quests: QuestMethods
  methods: TaskProps
  p: WorldArgs

  constructor(worldProps: WorldArgs) {
    this.fsm = new StateMachine(this, 'tasks')
    this._all = []
    this._spawn = 'grounds'
    this.p = worldProps
    this.methods = {
      npcHasTask: this.npcHasTask.bind(this),
      // didCrossPaths: this.p.didCrossPaths.bind(this),
      returnNpc: this.p.returnNpc.bind(this),
      returnPlayer: this.p.returnPlayer.bind(this),
      taskBuilder: this.taskBuilder.bind(this),
      //getOccupants: this.p.getOccupants.bind(this),
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
    this.npcHasTask = this.npcHasTask.bind(this)
    this.taskBuilder = this.taskBuilder.bind(this)
  }
  private onNewEnter(): void {}
  private onNewUpdate(): void {}
  private onNewExit(): void {}
  private onTurnEnter(): void {}
  private onTurnUpdate(): void {
    let i = this.all.length
    while (i-- !== 0) {
      const task = this.all[i]
      if (task.turns < 1) {
        this.all.splice(i, 1)
      } else {
        task.turns = task.turns - 1
      }
    }
  }
  private onTurnExit(): void {}
  public set spawn(s: string) {
    this._spawn = s
  }
  public get spawn() {
    return this._spawn
  }
  public get all() {
    return this._all
  }
  taskHasOwner(cause: string): string | null {
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
    owner: string[] = [],
    target: string[] = [],
    labels: string[] = []
  ): TaskState | null {
    for (const c of this.all) {
      if (
        (owner.length < 1 || owner.includes(c.owner)) &&
        (target.length < 1 || target.includes(c.target)) &&
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

  taskBuilder(o: string, label: string, target: string, cause = 'theft') {
    const owner = this.p.returnNpc(o)
    const append: Task = {
      owner: owner.name,
      turns: 15,
      label,
      scope: 'npc',
      authority: owner.clan, //ex; labor
      target,
      cause,
    }
    if (label == 'snitch') {
      append.authority = 'security'
      append.scope = 'clan'
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
    this.append_task(append)
  }
  append_task(task: Task) {
    this.all.push(new TaskState(task, this.methods))
  }
  get_field_docs(): string[] {
    const docs = this.all.filter((c) => c.cause == 'field').map((c) => c.owner)
    return docs
  }
}
