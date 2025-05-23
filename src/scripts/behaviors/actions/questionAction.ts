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
import InjuredSequence from '../sequences/injuredSequence'
import ImmobileSequence from '../sequences/immobileSequence'
import JailedSequence from '../sequences/jailedSequence'
import AssaultedSequence from '../sequences/assaultedSequence'
import EndAction from './endAction'
import QuestionSequence from '../sequences/questionSequence'

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
    super()
    this.a = props
    this.hero = perp.name == 'player' ? (perp as HeroQuestionProps) : null
    this.reason = reason
    this.perp = this.hero == null ? (perp as QuestionProps) : this.hero
    this.getProps = getProps
  }

  run(): { (): void } {
    this.perp = this.perp.getBehaviorProps('question') as QuestionProps
    this.a = this.getProps('question') as QuestionProps

    const currRoom = this.a.currRoom == this.perp.currRoom
    const crossedPaths =
      currRoom === true
        ? currRoom
        : Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
            (s: string) =>
              s === this.perp.name && this.perp.exitRoom == this.a.currRoom
          ).length > 0

    if (crossedPaths === false) {
      const cops = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
        (s: string) => s !== this.a.name && s.substring(0, 3) == 'sec'
      )
      for (const c of cops) {
        //  print('CINQUESTUON:::', c, 'from:', this.a.name)
        const chatter = this.a.returnNpc(c)
        for (const b of chatter.behavior.active.children) {
          /** * print(
            'CINQUESTUON:::behaviors::',
            b.constructor.name,
            'from:',
            this.a.name,
            (b as QuestionSequence).perp('question').name
          )
*/
          if (
            b.constructor.name == 'QuestionSequence' &&
            (b as QuestionSequence).perp('question').name == this.perp.name
          ) {
            print(
              'CINQUESTUON:::ADDADJUST!!!!',
              c,
              'from:',
              this.a.name,
              'PERP:',
              this.perp.name,
              this.perp.currRoom
            )

            this.a.addAdjustWantedQueue(this.perp.name, this.perp.currRoom)
            break
          }
        }
      }

      return () =>
        this.continue(
          `QuestionAction::: ${this.a.name} did not cross paths with ${this.perp.name} for ${this.reason}`
        )
    }
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
      if (consequence.pass == true) i = resultChecks.length
    }
    //For abstraction could have a
    //consequenceAction tha build these
    //testjpf
    if (consequence.type === 'jailed' || consequence.type === 'phonesecurity') {
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
          if (
            behavior instanceof JailedSequence &&
            behavior.a.name == this.perp.name
          ) {
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
      if (
        this.a.currRoom == this.perp.currRoom &&
        this.a.currRoom == this.a.getFocusedRoom()
      ) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
          station: this.perp.currStation,
          npc: this.a.name,
        })
        // prettier-ignore
        print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA  question',consequence.type, this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
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
      if (
        this.a.currRoom == this.perp.currRoom &&
        this.a.currRoom == this.a.getFocusedRoom()
      ) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
          station: this.perp.currStation,
          npc: this.a.name,
        })
        // prettier-ignore
        print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA  question',consequence.type, this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
      }
    } else if (consequence.type.slice(0, 6) === 'wPunch') {
      print(
        this.perp.hp,
        'QuestioningAction::PUNCH perp got punched',
        this.perp.name,
        'by',
        this.a.name,
        'in',
        this.a.currRoom
      )
      if ((this.perp.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
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
      }

      if (
        this.a.currRoom == this.perp.currRoom &&
        this.a.currRoom == this.a.getFocusedRoom()
      ) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
          station: this.perp.currStation,
          npc: this.a.name,
        })
        // prettier-ignore
        print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA  question',consequence.type, this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
      }

      return () =>
        this.alternate(
          new AssaultedSequence(
            this.perp.getBehaviorProps.bind(this.perp),
            this.getProps('question') as QuestionProps
          )
        )
    } else if (consequence.type.slice(0, 6) === 'sPunch') {
      print(
        this.a.hp,
        'QuestioningAction::PUNCH WATCHER got punched',
        this.a.name,
        'by',
        this.perp.name
      )
      if ((this.a.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
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

      if (
        this.a.currRoom == this.perp.currRoom &&
        this.a.currRoom == this.a.getFocusedRoom()
      ) {
        msg.post(`/${this.perp.currStation}#npc_loader`, hash('move_npc'), {
          station: this.a.currStation,
          npc: this.perp.name,
        })
        // prettier-ignore
        print('runrun',this.perp.name,this.a.currStation, 'STATION MOVE VIA  question',consequence.type, this.a.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
      }

      return () =>
        this.alternate(
          new AssaultedSequence(
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            this.perp.getBehaviorProps('question') as QuestionProps
          )
        )
    } else if (consequence.type == 'reckless') {
      if (
        this.a.currRoom == this.perp.currRoom &&
        this.a.currRoom == this.a.getFocusedRoom()
      ) {
        msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
          station: this.perp.currStation,
          npc: this.a.name,
        })
        // prettier-ignore
        print('runrun',this.a.name,this.a.currStation, 'STATION MOVE VIA  question',consequence.type, this.perp.name, 'in', this.a.currRoom,this.perp.currRoom, this.perp.currStation)
      }
      return () =>
        this.alternate(
          new EndAction([
            'reckless',
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            this.perp,
            this.reason,
          ])
        )
      // new RecklessSequence()
    }
    /**
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
     
    const cops = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
      (s: string) => s !== this.a.name && s.substring(0, 3) == 'sec'
    )
    for (const c of cops) {
      const chatter = this.a.returnNpc(c)
      for (const b of chatter.behavior.active.children) {
        if (
          b.constructor.name == 'QuestionSequence' &&
          (b as QuestionSequence).perp('question').name == this.perp.name
        ) {
          this.a.addAdjustWantedQueue(this.perp.name, this.perp.currRoom)
          break
        }
      }
    } */
    return () =>
      this.fail(
        `||>> Behavior: QUESTIONACTION::: Default Fail:: ${consequence.type}`
      )
  }
  continue(s: string): string {
    print('QuestionAction:: Continue:', s)
    return 'continue'
  }
  success(s?: string): string {
    print('QuestionAction:: Success:', s, `for ${this.reason}`)
    return 'success'
  }
}
