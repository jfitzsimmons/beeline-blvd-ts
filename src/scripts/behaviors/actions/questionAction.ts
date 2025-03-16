import {
  ActionProps,
  AnnouncerProps,
  BehaviorKeys,
  GetProps,
  HeroQuestionProps,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import { crimeChecks } from '../../states/inits/checksFuncs'
import ArrestSequence from '../sequences/arrestSequence'
import AnnouncerSequence from '../sequences/announcerSequence'
//import RecklessSequence from '../sequences/recklessSequence'
import InjuredSequence from '../sequences/injuredSequence'
import ImmobileSequence from '../sequences/immobileSequence'
import JailedSequence from '../sequences/jailedSequence'

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
    //testjpf insetad of removng patient and prisoners
    //make it a condition?!?!?TODO NOW::
    const currRoom = this.a.currRoom == this.perp.currRoom //&& ['isoner', 'atient'].includes(this.perp.currStation.slice(-7, -1))) ||//(this.hero !== null && this.a.currRoom == this.perp.currRoom)

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
      //hnadle logic here for currstation prisoner
      // and currstation patient
      //if already jailed update jailed sequence?
      // have something that ranks severity of prisoner??
      // if infirmed add arrestsequence that delays itself until uninfirmed
      // maybe arrestseq has a skip bail FUGITIVE option?
      if (this.perp.currStation.slice(0, 4) == 'patie') {
        this.perp.addToBehavior(
          'place',
          new ArrestSequence(
            this.perp.getBehaviorProps.bind(this.perp),
            10 - this.a.hp
          )
        )
        print(
          this.a.name,
          'QuestionAction::: ',
          this.perp.name,
          'delayed Arrest because is Patient'
        )
      } else if (this.perp.currStation.slice(0, 4) == 'priso') {
        for (const behavior of this.perp.behavior.active.children) {
          if (behavior instanceof JailedSequence) {
            behavior.update()
            print(
              'QuestionAction::: JAil Sentence extended for:: ',
              this.perp.name,
              'by:',
              this.a.name
            )
            break
          }
        }
      } else {
        this.perp.updateFromBehavior('turnPriority', 97)
        print('QuestionAction::', this.a.name, 'has Arrested::', this.perp.name)
        this.perp.addToBehavior(
          'place',
          new ArrestSequence(this.perp.getBehaviorProps.bind(this.perp))
        )
      }
      return () =>
        this.success(
          `QuestionAction::: Success:: ARREST:: ${this.perp.name} by ${this.a.name} `
        )
    } else if (consequence.type == 'merits' || consequence.type == 'demerits') {
      print(
        'QuestionAction::',
        this.a.name,
        'will make announcements about::',
        this.perp.name
      )
      this.perp.addToBehavior(
        'active',
        new AnnouncerSequence(
          this.getProps as (behavior: BehaviorKeys) => ActionProps,
          this.perp.getBehaviorProps('announcer') as AnnouncerProps,
          consequence.type
        )
      )
    } else if (
      consequence.type.slice(0, 6) === 'wPunch' &&
      (this.perp.getBehaviorProps('announcer') as AnnouncerProps).hp < 1
    ) {
      print(
        this.perp.hp,
        'QuestioningAction::PUNCH perp got punched',
        this.perp.name,
        'by',
        this.a.name,
        'in',
        this.a.currRoom
      )
      this.perp.addToBehavior(
        'active',
        new InjuredSequence(this.perp.getBehaviorProps.bind(this.perp))
      )
      if (
        !this.perp.behavior.place.children.some(
          (c) => c instanceof ImmobileSequence
        )
      )
        this.perp.addToBehavior(
          'place',
          new ImmobileSequence(this.perp.getBehaviorProps.bind(this.perp))
        )
    } else if (
      consequence.type.slice(0, 6) === 'sPunch' &&
      (this.a.getBehaviorProps('announcer') as AnnouncerProps).hp < 1
    ) {
      print(
        this.a.hp,
        'QuestioningAction::PUNCH WATCHER got punched',
        this.a.name,
        'by',
        this.perp.name
      )
      // testjpf probably need an update()
      //for injuredsequencetoo!
      this.a.addToBehavior(
        'active',
        new InjuredSequence(this.a.getBehaviorProps.bind(this.a))
      )

      if (
        !this.perp.behavior.place.children.some(
          (c) => c instanceof ImmobileSequence
        )
      )
        this.a.addToBehavior(
          'place',
          new ImmobileSequence(this.a.getBehaviorProps.bind(this.a))
        )
    }
    print(
      '||>> Behavior: QUESTIONACTION:: Consequence pass,type:',
      consequence.pass,
      consequence.type
    )
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
    return () =>
      this.success(
        '||>> Behavior: QUESTIONACTION::: DEFAULT::' + consequence.type
      )
  }
  continue(s: string): string {
    print('QuestionAction:: Continue:', s)
    return 'continue'
  }
  success(s?: string): string {
    print('QuestionAction:: Success:', s)
    return 'success'
  }
}
