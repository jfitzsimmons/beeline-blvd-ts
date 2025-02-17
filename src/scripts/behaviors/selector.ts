import Sequence from './sequence'

export default class Selector {
  children: Sequence[] = []
  constructor(sequences: Sequence[]) {
    this.children = sequences
  }
  run() {
    for (const child of this.children) {
      child.run()
    }
  }
}
