import {
  ActionProps,
  BehaviorKeys,
  GetProps,
  HeroInjuredProps,
  InjuredProps,
  QuestionProps,
} from '../../../types/behaviors'
import { confrontation_check } from '../../states/inits/checksFuncs'
import Action from '../action'
import QuestionSequence from '../sequences/questionSequence'

export default class TrespassAction extends Action {
  a: InjuredProps | HeroInjuredProps
  isHero: boolean
  enforcer: null | { (behavior: BehaviorKeys): ActionProps }
  getProps: GetProps
  constructor(getProps: GetProps) {
    const props = getProps('injured')
    super(props)
    this.a =
      props.name === 'player'
        ? (props as HeroInjuredProps)
        : (props as InjuredProps)
    this.getProps = getProps
    this.isHero = this.a.name === 'player' ? true : false
    this.enforcer = null
  }
  run(): { (): void } {
    if (
      this.a.turnPriority > 96 ||
      (this.isHero == false &&
        ['side', 'asse'].includes(this.a.currStation.slice(-5, -1)))
    )
      return () =>
        this.fail(
          `||>> Behavior: TrespassAction:: ${this.a.name} gets 1 turn clearance for ${this.a.currStation}`
        )

    this.a.updateFromBehavior('turnPriority', 96) // so can add QuestionSeq to available security

    //if (this.a.getIgnore().includes(this.a.name))
    // return () =>
    // this.fail('TrespassAction:: IGNORE - injured NPC???:' + this.a.name)

    const currRoom = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
      (s) => s != '' && s != this.a.name && s.slice(0, 4) === 'secu'
    )
    const prevRoom = Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
      (s: string) =>
        s.slice(0, 4) === 'secu' &&
        this.a.returnNpc(s).exitRoom == this.a.currRoom
    )
    if (prevRoom.length > 0)
      print(
        '|> TrespassAction: Trespasser and Cop are in Separate Rooms, but crossed Paths. TODO! testjpf'
      )
    //testjpf have other npcs suspect??
    //confront??
    for (const e of [...new Set([...prevRoom, ...currRoom])]) {
      if (this.isHero === true) print('ISHERO ENFORCERS::', e)
      this.enforcer = this.a.returnNpc(e).getBehaviorProps.bind(this)
      const enforcer = this.enforcer('question') as QuestionProps
      if (
        enforcer.turnPriority < 96 &&
        confrontation_check(enforcer.traits, this.a.traits) == true
        //math.random() > 0.2 &&
      ) {
        for (const behavior of enforcer.behavior.active.children) {
          if (
            behavior instanceof QuestionSequence &&
            (behavior.perp('question') as QuestionProps).name == this.a.name
          ) {
            behavior.update('clearance')
            print(
              '|>::: QuestionSequence extended for:: ',
              enforcer.name,
              'by:',
              this.a.name
            )
            return () =>
              this.continue(
                `${this.a.name} extend questionUpdate trespassACTION in ${this.a.currRoom}`
              )
          }
        }
        enforcer.addToBehavior(
          'active',
          new QuestionSequence(this.enforcer, this.getProps, 'clearance')
        )
        return () =>
          this.continue(
            '|>:: Enforcer:' +
              enforcer.name +
              'is going to question:' +
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
