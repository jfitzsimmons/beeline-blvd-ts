import Sequence from './sequence'

export default class Selector {
  children: Sequence[] = []
  constructor(sequences: Sequence[]) {
    this.children = sequences
  }
  run() {
    for (const child of this.children) {
      print('SELECTERCHILD')

      const remove = child.run()
      if (remove === 'REMOVE')
        this.children.splice(this.children.indexOf(child), 1)
    }
  }
}
