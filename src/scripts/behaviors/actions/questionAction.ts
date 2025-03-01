import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import {
  build_consequence,
  jailtime_check,
  pledgeCheck,
  bribeCheck,
  targetPunchedCheck,
  prejudice_check,
  admirer_check,
  unlucky_check,
} from '../../states/inits/checksFuncs'
import { shuffle } from '../../utils/utils'

export default class QuestionAction extends Action {
  a: QuestionProps
  perp: QuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps
  ) {
    const props = getProps('question') as QuestionProps
    super(props)
    this.a = props
    this.perp = perp
    this.getProps = getProps
  }
  run(): { (): void } {
    //if (this.a.getApb().includes(target)) {
    // this.parent.returnNpc(this.target).fsm.setState('arrestee')
    // return
    // } else if (this.label == 'questioning') {
    //testjpf convert rest!!!:::
    const tempcons: Array<
      (
        chkr: QuestionProps,
        chkd: QuestionProps
      ) => { pass: boolean; type: string }
    > = shuffle([
      pledgeCheck,
      bribeCheck,
      targetPunchedCheck,
      jailtime_check,
      admirer_check,
      prejudice_check,
      unlucky_check,
    ])

    build_consequence(this.a, this.perp, tempcons, false)
    //}
    print(tempcons)
    return () => this.success()
    //need something that checks response
    //does response need EffectsAction, sequences, something else???
    //testjpf
  }
  continue(s: string): string {
    print('Injur-ed-Action:: Continue:', s)
    return 'continue'
  }
}
