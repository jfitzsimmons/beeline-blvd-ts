import { BehaviorRunReturn } from '../../types/behaviors'
import Action from './action'

export default class Sequence {
  children: Action[]
  constructor(actions: Action[]) {
    this.children = actions
    this.run = this.run.bind(this)
  }
  run(): BehaviorRunReturn {
    print('SEQUENCE::: childrenlength: PRERUN:', this.children.length)

    for (const child of this.children) {
      print('SEQCHILD')
      child.run()
    }
    print('SEQUENCE::: childrenlength:', this.children.length)
    return 'REMOVE'
  }
}
