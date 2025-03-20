import { Task } from '../../types/tasks'
import { TaskProps } from '../../types/world'

export default class TaskState {
  label: string // merits
  owner: string
  target: string
  turns: number
  scope: string
  authority: string //ex; labor
  cause: string
  parent: TaskProps

  constructor(t: Task, taskProps: TaskProps) {
    this.label = t.label
    this.owner = t.owner
    this.target = t.target
    this.turns = t.turns
    this.scope = t.scope
    this.authority = t.authority
    this.cause = t.cause
    this.parent = taskProps
  }
}
