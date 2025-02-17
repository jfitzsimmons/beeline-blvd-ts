import Action from './action'

export default class Sequence {
  children: Action[]
  constructor(actions: Action[]) {
    this.children = actions
  }
  run() {
    for (const child of this.children) {
      child.run()
    }
  }
}
