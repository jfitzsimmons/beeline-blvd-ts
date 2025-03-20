import {
  ActionProps,
  BehaviorKeys,
  InjuredProps,
  MenderProps,
} from '../../../types/behaviors'
import { NpcsInitState } from '../../states/inits/npcsInitState'
import Action from '../action'
import Sequence from '../sequence'
import HelperSequence from '../sequences/helperSequence'
import ImmobileSequence from '../sequences/immobileSequence'
import MenderSequence from '../sequences/menderSequence'
import ScoutSequence from '../sequences/scoutSequence'
import MendeeAction from './mendeeAction'

export default class InjuredAction extends Action {
  a: InjuredProps
  doc: null | { (behavior: BehaviorKeys): ActionProps }
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(getProps: (behavior: BehaviorKeys) => ActionProps) {
    const props = getProps('injured') as InjuredProps
    super()
    this.a = props
    this.doc = null
    this.getProps = getProps
  }
  run(): { (): void } {
    if (this.a.getIgnore().includes(this.a.name))
      return () =>
        this.continue(
          '||>> Behavior: Injur-ED-action:: IGNORE - Quest related NPC:' +
            this.a.name +
            ':' +
            this.a.turnPriority
        )

    const helpers = Object.values(this.a.getOccupants(this.a.currRoom))
      .filter((s) => s != '' && s != this.a.name)
      .sort(function (a, b) {
        if (a.slice(0, 3) === 'doc' && b.slice(0, 3) !== 'doc') return -1
        if (b.slice(0, 3) === 'doc' && a.slice(0, 3) !== 'doc') return 1
        return 0
      })
    for (const helper of helpers) {
      if (this.a.returnNpc(helper).turnPriority < 96) {
        //doctors start mending after RNG weighted by patient priority
        const ticket = this.a.getMendingQueue().indexOf(this.a.name)
        const random = math.random(0, 4)
        if (
          NpcsInitState[helper].clan == 'doctors' &&
          ((ticket != -1 && ticket < random) || (ticket == -1 && random > 3))
        ) {
          this.doc = this.a.returnNpc(helper).getBehaviorProps.bind(this)
          //const props = this.getProps('mendee')
          return () => this.alternate(new MendeeAction(this.getProps))
        } else if (
          math.random() > 0.8 &&
          // this.a.parent.npcHasTask([helper], [this.a.name]) === null &&
          NpcsInitState[helper].clan !== 'doctors'
        ) {
          const scout = this.a.returnNpc(helper)
          if (
            !scout.behavior.active.children.some(
              (c) => c instanceof HelperSequence
            )
          ) {
            scout.addToBehavior(
              'active',
              new HelperSequence(
                scout.getBehaviorProps.bind(scout),
                this.a.name
              )
            )
            if (scout.behavior.place.children.length < 1)
              scout.addToBehavior(
                'place',
                new ScoutSequence(
                  scout.getBehaviorProps.bind(scout),
                  this.a.currRoom
                )
              )
            return () =>
              this.continue(
                '|>:: GoodSamaritan - Add HELPERSequence for:' +
                  scout.name +
                  '| VICTIM:' +
                  this.a.name +
                  ':' +
                  this.a.turnPriority
              )
          }
        } else if (
          NpcsInitState[helper].clan == 'doctors' &&
          math.random() > 0.5
        ) {
          print(
            '|> ACTION::: Doc:',
            helper,
            'added',
            this.a.name,
            'to QUEUE!' + ':' + this.a.turnPriority
          )
          this.a.addAdjustMendingQueue(this.a.name)
        }
      }
    }

    return () =>
      this.continue(
        '|>:: Default - Add Another InjuredSequence for:' +
          this.a.name +
          ':' +
          this.a.turnPriority
      )
  }
  continue(s: string): string {
    print('|||>>> Behavior:Injur-ed-Action:: Continue:', s)
    return 'continue'
  }
  alternate(as: Action | Sequence) {
    if (this.doc != null) {
      const doc = this.doc('mender') as MenderProps
      doc.updateFromBehavior('turnPriority', 97)
      doc.addToBehavior('active', new MenderSequence(this.doc, this.a))
      if (
        !doc.behavior.place.children.some((c) => c instanceof ImmobileSequence)
      )
        doc.addToBehavior('place', new ImmobileSequence(this.doc))

      print(
        '||>> Behavior: injuredAction:: alternate doc mender sequence:: doc,a:',
        this.doc,
        this.a.name
      )
    }
    return as instanceof Action ? as.run()() : as.run()
  }
}
