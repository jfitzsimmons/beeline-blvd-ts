import {
  GetProps,
  HeroQuestionProps,
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
import ArrestSequence from '../sequences/arrestSequence'

export default class QuestionAction extends Action {
  a: QuestionProps
  perp: QuestionProps
  hero: HeroQuestionProps | null
  getProps: GetProps
  constructor(getProps: GetProps, perp: QuestionProps | HeroQuestionProps) {
    const props = getProps('question') as QuestionProps
    super(props)
    this.a = props
    this.hero = perp.name == 'player' ? (perp as HeroQuestionProps) : null

    this.perp = this.hero == null ? (perp as QuestionProps) : this.hero
    this.getProps = getProps
    if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom()
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print('newnew',this.a.name,this.a.currStation, 'STATION MOVE VIA TASK question', this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
    }
  }

  run(): { (): void } {
    this.perp = this.perp.getBehaviorProps('question') as QuestionProps
    this.a = this.getProps('question') as QuestionProps
    //if (this.a.getApb().includes(target)) {
    // this.parent.returnNpc(this.target).fsm.setState('arrestee')
    // return
    // } else if (this.label == 'questioning') {
    //testjpf convert rest!!!:::

    /**
     * testjpf
     * going to have to think about what i want to do with player questioning.
     * right now launches novel and relies on outcome???
     * creates confront task
     * sets player to confronted
     * level checks player state
     * launches novel
     * novel was set by IN THEORY QuestionAction
     * AKA::: Right here
     * i like the idea of using check but with user interaction.
     *  maybe traits also determine what choices you get.
     * as well as if you pass.
     *
     * use a different set of tempcons?
     * ex watcherpunch instead of other way around
     */
    if (
      this.hero !== null &&
      (this.hero.currRoom == this.a.currRoom ||
        (this.a.currRoom == this.hero.exitRoom &&
          this.a.exitRoom == this.hero.currRoom))
    ) {
      this.hero.setConfrontation(this.a.name, 'questioning', 'clearance')
      return () =>
        this.success(
          'QuestionAction::: HERO:: this should set novel for player confrontation.'
        )
    }

    const currRoom = this.a.currRoom == this.perp.currRoom

    print(
      'QuestionAction:: CurroomBOOLEAN: ',
      currRoom,
      this.a.name,
      this.a.currRoom,
      this.perp.name,
      this.perp.currRoom
    )

    const crossedPaths =
      currRoom === true
        ? currRoom
        : Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
            (s: string) =>
              s === this.perp.name && this.perp.exitRoom == this.a.currRoom
          ).length > 0
    print('QuestionAction:: crossedBOOLEAN: ', crossedPaths, this.perp.exitRoom)
    if (crossedPaths === false)
      return () =>
        this.continue(
          `QuestionAction::: ${this.a.name} did not cross paths with ${this.perp.name}`
        )

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
    const consequence: string = build_consequence(
      this.a,
      this.perp,
      tempcons,
      false
    )
    if (consequence === 'jailed') {
      this.perp.updateFromBehavior('turnPriority', 97)
      print('QuestionAction::', this.a.name, 'has Arrested::', this.perp.name)
      this.perp.addToBehavior(
        'place',
        new ArrestSequence(this.perp.getBehaviorProps.bind(this.perp))
      )
    }
    print('Consequence:', consequence)
    //}
    //print(tempcons)
    if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom()
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA TASK question', this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
    }
    return () => this.success()
    //need something that checks response
    //does response need EffectsAction, sequences, something else???
    //testjpf
  }
  continue(s: string): string {
    print('QuestionAction:: Continue:', s)
    return 'continue'
  }
  success(s?: string) {
    print('QuestionAction:: Success:', s)
  }
}
