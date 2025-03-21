import { ThiefVictimProps } from '../../../types/ai'
import {
  //ActionProps,
  //BehaviorKeys,
  GetProps,
  HelperProps,
  HeroInjuredProps,
  InjuredProps,
  QuestionProps,
} from '../../../types/behaviors'
import { npcAssaultCheck } from '../../states/inits/checksFuncs'
//import { confrontation_check, seen_check } from '../../states/inits/checksFuncs'
import Action from '../action'
//import PhoneSequence from '../sequences/phoneSequence'
import EndAction from './endAction'
//import QuestionSequence from '../sequences/questionSequence'
//import SuspectingSequence from '../sequences/suspectingSequence'

export default class AssaultedAction extends Action {
  a: InjuredProps | HeroInjuredProps
  isHero: boolean
  assaulter: QuestionProps
  getProps: GetProps
  constructor(getProps: GetProps, assaulter: QuestionProps) {
    const props = getProps('injured')
    super()
    this.assaulter = assaulter

    this.a =
      props.name === 'player'
        ? (props as HeroInjuredProps)
        : (props as InjuredProps)
    this.getProps = getProps
    this.isHero = this.a.name === 'player' ? true : false
  }
  run(): { (): void } {
    this.a.updateFromBehavior('turnPriority', 96) // so can add QuestionSeq to available security

    //if (this.a.getIgnore().includes(this.a.name))
    // return () =>
    // this.fail('TrespassAction:: IGNORE - injured NPC???:' + this.a.name)

    const currRoom = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
      (s) => s != '' && s != this.a.name && s !== this.assaulter.name
    )

    //testjpf have other npcs suspect??
    //confront??
    for (const e of currRoom) {
      if (this.isHero === true) print('ISHERO ENFORCERS::', e)
      const enforcerprops = this.a.returnNpc(e).getBehaviorProps.bind(this)
      const enforcer = enforcerprops('question') as QuestionProps
      /**
       * need to clean up thief victim props
       * or else make things worse
       * testjpf
       */

      if (
        enforcer.turnPriority < 96 &&
        // seen_check(enforcer.traits, this.assaulter.traits).type == 'seen'
        math.random() > 0.2
      ) {
        //TEsTJPF NEED SOME SORT OF ASSAULT CHECK FIRST!!
        //like stealcheck
        const assaulterProps: ThiefVictimProps = {
          name: this.assaulter.name,
          traits: this.assaulter.traits,
          inventory: this.assaulter.inventory,
          clan: this.assaulter.clan,
          cooldown: this.assaulter.cooldown,
          crime: 'theft',
          removeInvBonus: this.assaulter.removeInvBonus.bind(this.assaulter),
          addInvBonus: this.assaulter.addInvBonus.bind(this.assaulter),
          updateInventory: this.assaulter.updateInventory.bind(this.assaulter),
          addOrExtendEffect: this.assaulter.addOrExtendEffect.bind(
            this.assaulter
          ),
        }
        const consequence = npcAssaultCheck(assaulterProps, enforcer)

        //new EndSequence('suspecting')
        if (consequence === 'assault') {
          return () =>
            this.alternate(
              new EndAction([
                'suspecting',
                enforcerprops,
                this.assaulter,
                'assault',
              ])
            )
        }
        if (consequence === 'assaultcritfail') {
          return () =>
            this.alternate(
              new EndAction([
                'phone',
                enforcerprops,
                this.assaulter.getBehaviorProps('helper') as HelperProps,
                'assault',
              ])
            )
        }

        return () =>
          this.continue(
            '|>:: Witness:' +
              enforcer.name +
              'is suspecting/phoning:' +
              this.assaulter.name +
              'for' +
              this.a.name
          )
      }
    }

    return () =>
      this.continue('|>: Default - trespass successful for:' + this.a.name)
  }
  success(s?: string): void {
    print('|||>>> Behavior: TrespassAction:: Success:', s)
  }
  continue(s: string): string {
    print('|||>>> Behavior: TrespassAction:: Continue:', s)
    return 'continue'
  }
}
