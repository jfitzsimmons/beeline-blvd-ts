import {
  GetProps,
  HeroQuestionProps,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import { crimeChecks } from '../../states/inits/checksFuncs'
import ArrestSequence from '../sequences/arrestSequence'

export default class QuestionAction extends Action {
  a: QuestionProps
  perp: QuestionProps
  reason: string
  hero: HeroQuestionProps | null
  getProps: GetProps
  constructor(
    getProps: GetProps,
    perp: QuestionProps | HeroQuestionProps,
    reason: string
  ) {
    const props = getProps('question') as QuestionProps
    super(props)
    this.a = props
    this.hero = perp.name == 'player' ? (perp as HeroQuestionProps) : null
    this.reason = reason
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
      this.hero == null &&
      ['utside', '_passe', 'isoner', 'atient'].includes(
        this.a.currStation.slice(-7, -1)
      )
    )
      return () =>
        this.fail(
          `QuestionAction:: ${this.a.name} gets 1 turn clearance for ${this.a.currStation}`
        )

    const currRoom =
      (this.hero === null &&
        this.a.currRoom == this.perp.currRoom &&
        ['isoner', 'atient'].includes(this.perp.currStation.slice(-7, -1))) ||
      (this.hero !== null && this.a.currRoom == this.perp.currRoom)

    // const currRoom = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
    //   (s) => s != '' && s != this.a.name && s.slice(0, 4) === 'secu'
    // )

    const crossedPaths =
      currRoom === true
        ? currRoom
        : Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
            (s: string) =>
              s === this.perp.name && this.perp.exitRoom == this.a.currRoom
          ).length > 0
    // print('QuestionAction:: crossedBOOLEAN: ', crossedPaths, this.perp.exitRoom)
    if (crossedPaths === false)
      return () =>
        this.continue(
          `QuestionAction::: ${this.a.name} did not cross paths with ${this.perp.name}`
        )
    if (this.hero !== null && crossedPaths === true) {
      this.hero.setConfrontation(this.a.name, this.reason, 'questioning')
      return () =>
        this.success(
          'QuestionAction::: HERO:: this should set novel for player confrontation.'
        )
    }
    print(this.reason)
    const resultChecks: Array<
      (
        chkr: QuestionProps,
        chkd: QuestionProps
      ) => { pass: boolean; type: string }
    > = crimeChecks[this.reason]!

    let consequence = { pass: false, type: 'neutral' }

    for (let i = 0; i < resultChecks.length - 1; i++) {
      consequence = resultChecks[i](this.a, this.perp)
      // prettier-ignore
      // print(i, '-- buildconsequence::: ARGCHECKS::', consolation.pass, consolation.type, checked, checker)
      if (consequence.pass == true) i = resultChecks.length
    }
    if (consequence.type === 'jailed') {
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
