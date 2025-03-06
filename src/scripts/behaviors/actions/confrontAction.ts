import {
  ActionProps,
  BehaviorKeys,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import {
  build_consequence,
  targetPunchedCheck,
  prejudice_check,
  unlucky_check,
  angel_check,
  becomeASnitchCheck,
  suspicious_check,
  vanity_check,
  watcher_punched_check,
} from '../../states/inits/checksFuncs'
import { shuffle } from '../../utils/utils'
import {
  removeRandom,
  removeValuable,
  removeAdvantageous,
} from '../../systems/inventorysystem'
export default class ConfrontAction extends Action {
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
    const tempcons: Array<
      (
        chkr: QuestionProps,
        chkd: QuestionProps
      ) => { pass: boolean; type: string }
    > = shuffle([
      suspicious_check,
      becomeASnitchCheck,
      targetPunchedCheck,
      angel_check,
      vanity_check,
      prejudice_check,
      unlucky_check,
      watcher_punched_check,
    ])

    const consolation = build_consequence(this.a, this.perp, tempcons, false)
    print(
      'CONFRONTaction::: consolation after consequence:::',
      consolation,
      'confronter:',
      this.a.name,
      'perp:',
      this.perp.name
    )

    if (consolation == 'neutral') {
      let chest_item = null
      /**
       * need sequence for snitch!!
       * need returns for chkfuncs call_security
       *
       * testjpf NEW
       * this is why you had that loot STATE prop
       * confront sequence needs loot.
       */

      if (math.random() < 0.4) {
        chest_item = removeRandom(this.a.inventory, ['apple01'])
      } else if (math.random() < 0.5) {
        chest_item = removeValuable(this.a.inventory, ['apple01'])
      } else {
        chest_item = removeAdvantageous(
          this.a.inventory,
          ['apple01'],
          this.a.traits.skills
        )
      }

      this.a.addInvBonus(chest_item)
      //if (victim == true ){ remove_chest_bonus(w, chest_item) }
      this.a.cooldown = math.random(5, 15)
    }

    this.a.cooldown = this.a.cooldown + 5

    return () => this.success()
    //need something that checks response
    //does response need EffectsAction, sequences, something else???
    //testjpf
  }
  continue(s: string): string {
    print('CONFRONT-Action:: Continue:', s)
    return 'continue'
  }
}
