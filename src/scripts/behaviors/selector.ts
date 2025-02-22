import Sequence from './sequence'

export default class Selector {
  children: Sequence[] = []
  constructor(sequences: Sequence[]) {
    this.children = sequences
  }
  run() {
    for (const child of this.children) {
      const proceed = child.run()
      if (proceed === 'REMOVE') {
        print('SELECTOR::: REMOVE:: LEngth:', this.children.length)
        this.children.splice(this.children.indexOf(child), 1)
        print('22SELECTOR::: REMOVE:: LEngth:', this.children.length)
      }
    }
  }
}
