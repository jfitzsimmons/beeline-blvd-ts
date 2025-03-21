import {
  ActionProps,
  AnnouncerProps,
  BehaviorKeys,
  HelperProps,
  HeroQuestionProps,
  QuestionProps,
} from '../../../types/behaviors'
import Action from '../action'
import {
  targetPunchedCheck,
  prejudice_check,
  unlucky_check,
  angel_check,
  becomeASnitchCheck,
  vanity_check,
  watcher_punched_check,
  suspicious_check,
  meritsDemerits,
  recklessCheck,
  pledgeCheck,
} from '../../states/inits/checksFuncs'
import { shuffle } from '../../utils/utils'
import { removeValuable, removeAdvantageous } from '../../utils/inventory'
import Storage from '../../states/storage'
import SnitchSequence from '../sequences/snitchSequence'
import ArrestSequence from '../sequences/arrestSequence'
import PhoneSequence from '../sequences/phoneSequence'
import AnnouncerSequence from '../sequences/announcerSequence'
//import RecklessSequence from '../sequences/recklessSequence'
import InjuredSequence from '../sequences/injuredSequence'
import ImmobileSequence from '../sequences/immobileSequence'
import ScoutSequence from '../sequences/scoutSequence'
import QuestionSequence from '../sequences/questionSequence'
import AssaultedSequence from '../sequences/assaultedSequence'
export default class SuspectingAction extends Action {
  a: QuestionProps
  perp: QuestionProps | HeroQuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  cause: string //'theft | 'pockets'
  isHero: boolean
  storage?: Storage
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps | HeroQuestionProps,
    cause: string,
    storage?: Storage
  ) {
    const props = getProps('question') as QuestionProps
    super()
    this.a = props
    this.perp =
      perp.name === 'player'
        ? (perp as HeroQuestionProps)
        : (perp as QuestionProps)
    this.getProps = getProps
    this.storage = storage
    this.cause = cause
    this.isHero = this.perp.name === 'player' ? true : false
    /**
    if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom() &&
      this.isHero == false
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print("NEWNEW",this.a.name, 'STATION MOVE VIA TASK confront', this.perp.name, 'in', this.a.currRoom)
    }
      **/
  }
  run(): { (): void } {
    //testjpf have conditions fro severity?!?!?
    const resultChecks: Array<
      (
        chkr: QuestionProps,
        chkd: QuestionProps
      ) => { pass: boolean; type: string }
    > =
      this.isHero == true
        ? [
            suspicious_check,
            ...shuffle([becomeASnitchCheck, meritsDemerits, recklessCheck]),
          ]
        : shuffle([
            becomeASnitchCheck,
            targetPunchedCheck,
            angel_check,
            vanity_check,
            prejudice_check,
            unlucky_check,
            watcher_punched_check,
            becomeASnitchCheck,
            meritsDemerits,
            recklessCheck,
            pledgeCheck,
          ])

    let consequence = { pass: false, type: 'neutral' }

    for (let i = resultChecks.length; i-- !== 0; ) {
      consequence = resultChecks[i](this.a, this.perp)
      if (consequence.pass == true) i = 0
    }

    // prettier-ignore
    print('Suspectingaction::: consequence:::',consequence.type,this.cause,'| confronter:',this.a.name,(this.a.getBehaviorProps('announcer')as AnnouncerProps).hp,'perp:',this.perp.name,(this.perp.getBehaviorProps('announcer')as AnnouncerProps).hp,'inroom:',this.a.currRoom)
    /***
     * testjpf
     * need to open inventory on
     * exiting novel
     */
    if (this.isHero == true) {
      const perp = this.perp.getBehaviorProps('question') as HeroQuestionProps
      if (consequence.type == 'snitch') {
        if (this.a.clan == 'security') {
          for (const behavior of this.a.behavior.active.children) {
            if (
              behavior instanceof QuestionSequence &&
              (behavior.perp('helper') as HelperProps).name == this.perp.name
            ) {
              behavior.update(this.cause)
              print(
                'suspectingAction::: QuestionSequence extended for:: ',
                this.a.name,
                'about:',
                this.perp.name
              )
              return () =>
                this.success(
                  `${this.a.name} extend questionUpdate suspectingsACTION in ${this.a.currRoom}`
                )
            }
          }
          this.a.addToBehavior(
            'active',
            new QuestionSequence(
              this.a.getBehaviorProps.bind(this.a),
              this.perp.getBehaviorProps.bind(this.perp),
              this.cause
            )
          )
        } else {
          for (const behavior of this.a.behavior.active.children) {
            if (
              behavior instanceof SnitchSequence &&
              behavior.perp.name == this.perp.name
            ) {
              behavior.update(this.cause)
              print(
                'suspectingAction::: SnitchSequence extended for:: ',
                this.a.name,
                'about:',
                this.perp.name
              )
              return () =>
                this.success(
                  `${this.a.name} extend snitchUpdate suspectingsACTION in ${this.a.currRoom}`
                )
            }
          }
          this.a.addToBehavior(
            'active',
            new SnitchSequence(
              this.getProps,
              this.perp.getBehaviorProps('helper') as HelperProps,
              this.cause
            )
          )
        }
        const params = {
          actorname: this.storage?.name,
          //isNpc: _this.isNpc,
          watcher: this.a.name,
          action: this.cause,
        }
        print('SNITCH:: ', this.storage?.name)

        msg.post('/shared/guis#inventory', 'opened_chest', params)
        msg.post('#', 'release_input_focus')
        return () =>
          this.success(
            `SuspectingACtion::: success: ishero: cause concolation:${this.cause} | ${consequence.type}`
          )
      }
      if (this.cause == 'pockets') {
        perp.setConfrontation(this.a.name, consequence.type, this.cause)

        msg.post('worldproxies:/controller#novelcontroller', 'show_scene')

        return () =>
          this.success(
            `SuspectingACtion::: success: ishero: cause concolation:${this.cause} | ${consequence.type}`
          )
      }
      if (consequence.type == 'merits') {
        perp.setConfrontation(this.a.name, this.cause, consequence.type)

        msg.post('worldproxies:/controller#novelcontroller', 'show_scene')

        const params = {
          actorname: this.storage?.name,
          //isNpc: _this.isNpc,
          watcher: this.a.name,
          action: this.cause,
        }
        print('neutralsuspecting:: ', this.storage?.name)

        msg.post('/shared/guis#inventory', 'opened_chest', params)
        msg.post('#', 'release_input_focus')

        return () =>
          this.success(
            `SuspectingACtion::: Fail: ishero: cause concolation:${this.cause} | ${consequence.type}`
          )
      }
      if (consequence.type == 'suspicious') {
        perp.setConfrontation(this.a.name, consequence.type, this.cause)
        msg.post('worldproxies:/controller#novelcontroller', 'show_scene')

        return () =>
          this.success(
            `SuspectingACtion::: Suspicious Confront: ishero: cause concolation:${this.cause} | ${consequence.type}`
          )
      }
    }
    //For abstraction could have a
    //consequenceAction tha build these
    //testjpf
    if (this.isHero === false) {
      if (consequence.type == 'snitch') {
        //testjpf::
        //new SnitchSequence()
        //snitch sequence should weight concern lower than theft.
        if (this.a.clan == 'security') {
          this.a.addToBehavior(
            'active',
            new QuestionSequence(
              this.getProps,
              this.perp.getBehaviorProps.bind(this.perp),
              this.cause
            )
          )
        } else {
          this.a.addToBehavior(
            'active',
            new SnitchSequence(
              this.getProps,
              this.perp.getBehaviorProps('helper') as HelperProps,
              this.cause
            )
          )
          if (
            this.a.behavior.place.children.length < 1 &&
            this.a.turnPriority < 97
          )
            this.a.addToBehavior(
              'place',
              new ScoutSequence(
                this.a.getBehaviorProps.bind(this.a),
                this.a.currRoom
              )
            )
        }
        //print('SNITCH:: ', this.storage?.name)
        return () =>
          this.success(
            `SuspectingACtion::: success: NPC:SNITCH: cause concolation:${this.cause} | ${consequence.type} || ${this.a.name} | ${this.perp.name}`
          )
      } else if (consequence.type === 'phonesecurity') {
        print(
          'SuspectingAction::',
          this.a.name,
          'has phone-ing on::',
          this.perp.name
        )
        for (const behavior of this.a.behavior.active.children) {
          if (
            behavior instanceof PhoneSequence &&
            behavior.perp.name == this.perp.name
          ) {
            behavior.update(this.cause)
            print(
              'suspectingAction::: phoneSequence extended for:: ',
              this.a.name,
              'by:',
              this.perp.name
            )
            return () =>
              this.continue(
                `${this.a.name} already has phone. phoneUpdate PHONeACTION in ${this.a.currRoom}`
              )
          }
        }
        return () =>
          this.alternate(
            new PhoneSequence(
              this.a.getBehaviorProps.bind(this.a),
              this.perp.getBehaviorProps('helper') as HelperProps,
              this.cause
            )
          )
      } else if (consequence.type == 'jailed') {
        this.perp.updateFromBehavior('turnPriority', 97)
        print(
          'SupectingAction::',
          this.a.name,
          'has Arrested::',
          this.perp.name
        )
        this.perp.addToBehavior(
          'place',
          new ArrestSequence(this.perp.getBehaviorProps.bind(this.perp))
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
          print("runrun",this.a.name, 'STATION MOVE VIA suspecting jailed', this.perp.name, 'in', this.a.currRoom)
        }
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
          print("runrun",this.a.name, 'STATION MOVE VIA suspecting jailed', this.perp.name, 'in', this.a.currRoom)
        }
        return () => this.continue('reckless')
      } else if (
        consequence.type == 'merits' ||
        consequence.type == 'demerits'
      ) {
        print(
          'SupectingAction::',
          this.a.name,
          'will make announcements about::',
          this.perp.name
        )
        this.a.addToBehavior(
          'active',
          new AnnouncerSequence(
            this.getProps,
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
          print("runrun",this.a.name, 'STATION MOVE VIA suspecting',consequence.type, this.perp.name, 'in', this.a.currRoom)
        }
      } else if (consequence.type.slice(0, 6) === 'wPunch') {
        print(
          this.perp.hp,
          'SuspectingAction::PUNCH perp got punched',
          this.perp.name,
          'by',
          this.a.name
        )
        //testjpf need update for injury,mendee. pause mendee if mender gets distracted.
        if ((this.a.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
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
          print("runrun",this.a.name, 'STATION MOVE VIA suspecting',consequence.type, this.perp.name, 'in', this.a.currRoom)
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
          'SuspectingAction::PUNCH WATCHER got punched',
          this.a.name,
          'by',
          this.perp.name
        )
        if ((this.a.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
          this.a.addToBehavior(
            'active',
            new InjuredSequence(this.a.getBehaviorProps.bind(this.a))
          )

          if (
            !this.a.behavior.place.children.some(
              (c) => c instanceof ImmobileSequence
            )
          )
            this.a.addToBehavior(
              'place',
              new ImmobileSequence(this.a.getBehaviorProps.bind(this.a))
            )
          if (
            this.a.currRoom == this.perp.currRoom &&
            this.a.currRoom == this.a.getFocusedRoom()
          ) {
            msg.post(`/${this.perp.currStation}#npc_loader`, hash('move_npc'), {
              station: this.a.currStation,
              npc: this.perp.name,
            })
            // prettier-ignore
            print("runrun",this.perp.name, 'STATION MOVE VIA suspecting',consequence.type, this.a.name, 'in', this.a.currRoom)
          }
          return () =>
            this.alternate(
              new AssaultedSequence(
                this.getProps as (behavior: BehaviorKeys) => ActionProps,
                this.perp.getBehaviorProps('question') as QuestionProps
              )
            )
        }
      }
    }
    if (consequence.type == 'neutral' && this.isHero == false) {
      const robbed = this.storage == undefined ? this.a : this.storage
      let chest_item: string | null = null
      const rand = math.random()

      if (rand < 0.4) {
        chest_item =
          robbed.inventory[math.random(0, robbed.inventory.length - 1)]
        //chest_item = removeRandom(this.a.inventory, ['apple01'])
      } else if (rand < 0.7) {
        chest_item = removeValuable(robbed.inventory)
      } else {
        chest_item = removeAdvantageous(
          robbed.inventory,
          this.perp.traits.skills
        )
      }

      if (chest_item !== null) {
        //if (robbed.updateInventory !== undefined)
        robbed.updateInventory('delete', chest_item)
        this.perp.updateInventory('add', chest_item)
      }
      //if (victim == true ){ remove_chest_bonus(w, chest_item) }
      this.perp.cooldown = math.random(5, 15)
      return () =>
        this.fail(
          `SuspectingAction::: Failed:: ${
            this.a.name
          } was neutral and had no effect on ${this.perp.name}. stole: ${
            chest_item !== null ? chest_item : ''
          }`
        )
    } else if (consequence.type == 'neutral' && this.isHero == true) {
      const params = {
        actorname: this.storage?.name,
        watcher: this.a.name,
        action: this.cause,
      }
      print('neutralsuspecting:: ', this.storage?.name)
      msg.post('/shared/guis#inventory', 'opened_chest', params)
      msg.post('#', 'release_input_focus')
      this.fail(
        `SuspectingAction::: Failed:: ${this.a.name} was neutral and had no effect on ${this.perp.name}`
      )
    }

    return () => this.success(`Default, ${consequence.type},`)
  }
  success(s?: string) {
    print('SuspectingAction:: Success::', s)
  }
  continue(s: string): string {
    print('SuspectingAction:: Continue:', s)
    return 'continue'
  }
}
