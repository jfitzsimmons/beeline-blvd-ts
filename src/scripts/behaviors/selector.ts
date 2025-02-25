import Sequence from './sequence'

export default class Selector {
  children: Sequence[] = []
  constructor(sequences: Sequence[]) {
    this.children = sequences
  }
  run() {
    if (this.children.length < 1) print('SELECTOR::: EMPTY!!!')
    for (let i = this.children.length; i-- !== 0; ) {
      const proceed = this.children[i].run()
      if (proceed === 'REMOVE') {
        print('SELECTOR::: REMOVE:: LEngth:', this.children.length)
        this.children.splice(i, 1)
        print('22SELECTOR::: REMOVE:: LEngth:', this.children.length)
      }
    }
  }
}
