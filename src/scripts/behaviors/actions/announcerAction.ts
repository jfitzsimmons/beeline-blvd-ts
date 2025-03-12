import {
  ActionProps,
  BehaviorKeys,
  AnnouncerProps,
} from '../../../types/behaviors'
import { Effect } from '../../../types/tasks'
import { NpcsInitState } from '../../states/inits/npcsInitState'
import { fx, fxLookup } from '../../utils/consts'
import { shuffle } from '../../utils/utils'
import Action from '../action'

export default class AnnouncerAction extends Action {
  a: AnnouncerProps
  announcee: AnnouncerProps
  purpose: string

  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    announcee: AnnouncerProps,
    purpose: string
  ) {
    const props = getProps('announcer') as AnnouncerProps
    super(props)
    this.a = props
    this.announcee = announcee
    this.purpose = purpose
    this.getProps = getProps
  }
  run(): { (): void } {
    const listeners = Object.values(
      this.a.getOccupants(this.a.currRoom)
    ).filter((s) => s != '' && s != this.a.name && s != this.announcee.name)

    for (const l of listeners) {
      print('LISTERNER::: Announceraction::', l)
      const listener = this.a.returnNpc(l)

      if (this.announcee.name === 'player') {
        const adj = this.purpose === 'merits' ? 1 : -1
        listener.love = listener.love + adj
      }
      const fxArray: string[] =
        this.purpose === 'merits' ? fxLookup.merits : fxLookup.demerits
      //const fx_labels =
      const effect: Effect = fx[shuffle(fxArray)[0]!]
      if (effect.fx.type == 'opinion' && this.announcee.name !== 'player') {
        effect.fx.stat = NpcsInitState[this.announcee.name].clan
      }
      // prettier-ignore
      // print(this.owner, 'found:', npc, 'because', this.purpose, '.', npc, 'has effect:', fx_labels[1])
      listener.addOrExtendEffect(effect)
      break
    }

    return () =>
      this.continue(
        'AnnouncerAction:: Default - continue AnnouncerSequence for:' +
          this.a.name +
          'about' +
          this.announcee.name +
          ' | ' +
          this.announcee.cooldown +
          'turns left'
      )
  }
  continue(s: string): string {
    print('AnnouncerAction:: Continue:', s)
    return 'continue'
  }
}
