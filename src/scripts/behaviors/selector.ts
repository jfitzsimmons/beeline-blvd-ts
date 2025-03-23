import {
  AnnouncerProps,
  BehaviorRunReturn,
  HelperProps,
  QuestionProps,
} from '../../types/behaviors'
import Sequence from './sequence'
import PhoneSequence from './sequences/phoneSequence'
import RecklessSequence from './sequences/recklessSequence'
import SuspectingSequence from './sequences/suspectingSequence'

export default class Selector {
  children: Sequence[] = []
  constructor(sequences: Sequence[]) {
    this.children = sequences
  }
  run() {
    for (let i = this.children.length; i-- !== 0; ) {
      const proceed: BehaviorRunReturn = this.children[i].run()
      if (proceed === 'REMOVE') {
        this.children.splice(i, 1)
      } else if (Array.isArray(proceed)) {
        print(
          'SELECTOR!!!:: Proceed is array',
          Array.isArray(proceed),
          proceed[2].name
        )
        if (proceed[0] === 'phone') {
          const props = proceed[1]('helper') as HelperProps

          props.addToBehavior(
            'active',
            new PhoneSequence(proceed[1], proceed[2] as HelperProps, proceed[3])
          )
        } else if (proceed[0] === 'suspecting') {
          new SuspectingSequence(
            proceed[1],
            proceed[2] as QuestionProps,
            proceed[3],
            proceed[4] !== null ? proceed[4] : undefined
          ).run()
        } else if (proceed[0] === 'reckless') {
          const props = proceed[1]('question') as QuestionProps
          props.addToBehavior(
            'active',
            new RecklessSequence(
              proceed[1],
              proceed[2] as AnnouncerProps,
              proceed[3]
            )
          )
        }
        this.children.splice(i, 1)
      }
    }
  }
}
