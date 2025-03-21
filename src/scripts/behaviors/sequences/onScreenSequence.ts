import { GetProps } from '../../../types/behaviors'

import OnScreenAction from '../actions/onScreenAction'
import Sequence from '../sequence'

export default class OnScreenSequence extends Sequence {
  constructor(reason: string, getProps: GetProps) {
    super([new OnScreenAction(reason, getProps)])
    print(`___>>> Behavior:: OnscreenSequence: for ${reason}, talk to ?`)
  }
  run(): 'REMOVE' | '' {
    for (const child of this.children) {
      child.run()()
    }
    return 'REMOVE'
  }
}
