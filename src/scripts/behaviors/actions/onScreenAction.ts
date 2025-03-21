import {
  ActionProps,
  BehaviorKeys,
  GetProps,
  OnScreenProps,
} from '../../../types/behaviors'
import Action from '../action'
//import WorldPlayer from '../../states/player'

export default class OnScreenAction extends Action {
  a: OnScreenProps
  //perp: QuestionProps
  reason: string
  //player: WorldPlayer
  getProps: GetProps
  constructor(reason: string, getProps: GetProps) {
    const props = (getProps as (behavior: BehaviorKeys) => ActionProps)(
      'onScreen'
    ) as OnScreenProps
    super()
    this.a = props
    // this.hero = perp.name == 'player' ? (perp as HeroQuestionProps) : null
    this.reason = reason
    //this.perp = this.hero == null ? (perp as QuestionProps) : this.hero
    this.getProps = getProps
    // this.player = this.a.returnPlayer()
    print(
      `___>>> Behavior:: OnscreenAction: for ${this.reason}, talk to ${this.a.name}?`
    )
  }

  run(): { (): void } {
    //TESTJPF
    //I think i can get pretty far
    //using differen logic to set different confrontations
    //aka novel scripts
    this.a.setConfrontation(this.a.name, 'trespasser', this.reason)
    return () =>
      this.success(
        'OnScreenAction::: HERO:: this should set novel for player to talk about trespasser.'
      )
  }
  success(s?: string): string {
    print('OnScreenAction:: Success:', s, `for ${this.reason}`)
    return 'success'
  }
}
