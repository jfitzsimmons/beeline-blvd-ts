import {
  ActionProps,
  BehaviorKeys,
  AnnouncerProps,
  QuestionProps,
} from '../../../types/behaviors'
import {
  ignorant_check,
  dumb_crook_check,
  chaotic_good_check,
  classy_check,
  predator_check,
} from '../../states/inits/checksFuncs'

import { shuffle } from '../../utils/utils'
import Action from '../action'

export default class RecklessAction extends Action {
  a: AnnouncerProps
  inspirer: AnnouncerProps
  cause: string

  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    inspirer: AnnouncerProps,
    cause: string
  ) {
    const props = getProps('announcer') as AnnouncerProps
    super(props)
    this.a = props
    this.inspirer = inspirer
    this.cause = cause
    this.getProps = getProps
  }
  run(): { (): void } {
    const listeners = Object.values(
      this.a.getOccupants(this.a.currRoom)
    ).filter((s) => s != '' && s != this.a.name && s != this.inspirer.name)

    for (const l of listeners) {
      print('LISTERNER::: Recklessaction::', l)
      const listener = this.a.returnNpc(l)
      const resultChecks: Array<
        (
          chkr: QuestionProps,
          chkd: QuestionProps
        ) => { pass: boolean; type: string }
      > = shuffle([
        ignorant_check,
        dumb_crook_check,
        chaotic_good_check,
        classy_check,
        predator_check,
      ])

      let consequence = { pass: false, type: 'neutral' }

      for (let i = 0; i < resultChecks.length - 1; i++) {
        consequence = resultChecks[i](
          this.getProps('question') as QuestionProps,
          listener.getBehaviorProps('announcer') as QuestionProps
        )
        // prettier-ignore
        // print(i, '-- buildconsequence::: ARGCHECKS::', consolation.pass, consolation.type, checked, checker)
        if (consequence.pass == true) return () => this.continue(`RecklessACtion:: found for: ${this.a.name} against ${listener.name} inspired by ${this.inspirer.name}::: ${consequence.type}`)
      }
    }

    return () =>
      this.continue(
        'RecklessACtion:: Default - continue without effect for:' +
          this.a.name +
          'about' +
          this.inspirer.name +
          ' | ' +
          this.inspirer.cooldown +
          'turns left'
      )
  }
  continue(s: string): string {
    print('AnnouncerAction:: Continue:', s)
    return 'continue'
  }
}
