import Action from './action'

export default class Sequence {
  children: Action[]
  constructor(actions: Action[]) {
    this.children = actions
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()
    }
    return ''
  }
}
