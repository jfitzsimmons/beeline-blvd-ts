import {
  ActionProps,
  BehaviorKeys,
  AnnouncerProps,
  QuestionProps,
  HelperProps,
  //HelperProps,
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
import PhoneSequence from '../sequences/phoneSequence'
import QuestionSequence from '../sequences/questionSequence'
import SnitchSequence from '../sequences/snitchSequence'

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
        if (consequence.type == 'phonesecurity') {
          if (listener.clan == 'security') {
            for (const behavior of listener.behavior.active.children) {
              if (behavior instanceof QuestionSequence) {
                behavior.update(this.cause)
                return () =>
                  this.continue(
                    `||>> Behavior: RecklessAction: QuestionSequence extended for ${listener.name}by ${this.a.name} in ${listener.currRoom} for ${this.inspirer.name}`
                  )
              }
            }
            listener.addToBehavior(
              'active',
              new QuestionSequence(
                listener.getBehaviorProps.bind(listener),
                this.inspirer.getBehaviorProps.bind(this.inspirer),
                this.cause
              )
            )
          } else if (this.a.currRoom == 'security') {
            for (const behavior of listener.behavior.active.children) {
              if (behavior instanceof SnitchSequence) {
                behavior.update(this.cause)
                print(
                  'recklessAction::: SnitchSequence extended for:: ',
                  this.inspirer.name,
                  'by:',
                  listener.name
                )
                return () =>
                  this.continue(
                    `||>> Behavior: RecklessAction: ${listener.name} Call snitching in ${listener.currRoom} on ${this.inspirer.name}`
                  )
              }
            }
            listener.addToBehavior(
              'active',
              new SnitchSequence(
                listener.getBehaviorProps.bind(listener),
                this.inspirer.getBehaviorProps('helper') as HelperProps,
                this.cause
              )
            )
          } else {
            for (const behavior of listener.behavior.active.children) {
              if (behavior instanceof PhoneSequence) {
                behavior.update(this.cause)
                return () =>
                  this.continue(
                    this.continue(
                      `||>> Behavior: RecklessAction: PhoneSequence extended for ${listener.name}by ${this.a.name} in ${listener.currRoom} for ${this.inspirer.name}`
                    )
                  )
              }
            }
            return () =>
              this.alternate(
                new PhoneSequence(
                  listener.getBehaviorProps.bind(listener),
                  this.inspirer.getBehaviorProps('helper') as HelperProps,
                  this.cause
                )
              )
          }
        }

        if (consequence.pass == true) {
          return () =>
            this.continue(
              `RecklessACtion:: found for: ${this.a.name} talking to ${listener.name} inspired by ${this.inspirer.name}::: ${consequence.type}`
            )
        }
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
    print('RecklessAction:: Continue:', s)
    return 'continue'
  }
}
