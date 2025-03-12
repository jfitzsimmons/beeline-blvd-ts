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
} from '../../states/inits/checksFuncs'
import { shuffle } from '../../utils/utils'
import { removeValuable, removeAdvantageous } from '../../utils/inventory'
import Storage from '../../states/storage'
import SnitchSequence from '../sequences/snitchSequence'
import ArrestSequence from '../sequences/arrestSequence'
import PhoneSequence from '../sequences/phoneSequence'
import AnnouncerSequence from '../sequences/announcerSequence'
import RecklessSequence from '../sequences/recklessSequence'
export default class SuspectingAction extends Action {
  a: QuestionProps
  perp: QuestionProps | HeroQuestionProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  cause: string //'theft | 'pockets'
  isHero: boolean
  storage?: Storage
  ///testjpf ii thinki can get by with isHero
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: QuestionProps | HeroQuestionProps,
    cause: string,
    storage?: Storage
  ) {
    const props = getProps('question') as QuestionProps
    super(props)
    this.a = props
    this.perp =
      perp.name === 'player'
        ? (perp as HeroQuestionProps)
        : (perp as QuestionProps)
    this.getProps = getProps
    this.storage = storage
    this.cause = cause
    this.isHero = this.perp.name === 'player' ? true : false
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
          ])

    let consequence = { pass: false, type: 'neutral' }

    for (let i = resultChecks.length; i-- !== 0; ) {
      consequence = resultChecks[i](this.a, this.perp)
      // prettier-ignore
      // print(i, '-- buildconsequence::: ARGCHECKS::', consequence.pass, consequence.type, checked, checker)
      if (consequence.pass == true) i = 0
    }

    // prettier-ignore
    print('Suspectingaction::: consequence after consequence/cause:::',consequence.type,this.cause,'confronter:',this.a.name,'perp:',this.perp.name,'inroom:',this.a.currRoom,this.perp.currRoom,'||| PLAYERROOM:',this.a.getFocusedRoom())
    /***
     * testjpf seems here i need conditions that create new
     * sequences for different types of consequences
     * snitch, reckless, jailed (similar to questionAct!!!)
     *
     * what to do with merits/demerits
     *
     * need to open inventory on
     * exiting novel
     */
    if (this.isHero == true) {
      const perp = this.perp.getBehaviorProps('question') as HeroQuestionProps
      if (consequence.type == 'snitch') {
        //testjpf::
        //new SnitchSequence()
        //snitch sequence should weight concern lower than theft.

        this.a.addToBehavior(
          'active',
          new SnitchSequence(
            this.getProps,
            this.perp.getBehaviorProps('helper') as HelperProps,
            this.cause
          )
        )
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
        //testjpf return () => alternate(new ConfrontSequence?)
        //maybe also do this with others, some at random?
        msg.post('worldproxies:/controller#novelcontroller', 'show_scene')

        return () =>
          this.success(
            `SuspectingACtion::: Fail: ishero: cause concolation:${this.cause} | ${consequence.type}`
          )
      }
    } else if (
      this.a.currRoom == this.perp.currRoom &&
      this.a.currRoom == this.a.getFocusedRoom()
    ) {
      msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
        station: this.perp.currStation,
        npc: this.a.name,
      })
      // prettier-ignore
      print("runrun",this.a.name, 'STATION MOVE VIA TASK confront', this.perp.name, 'in', this.a.currRoom)
    }

    if (this.isHero === false) {
      if (consequence.type == 'snitch') {
        //testjpf::
        //new SnitchSequence()
        //snitch sequence should weight concern lower than theft.

        this.a.addToBehavior(
          'active',
          new SnitchSequence(
            this.getProps,
            this.perp.getBehaviorProps('helper') as HelperProps,
            this.cause
          )
        )
        //print('SNITCH:: ', this.storage?.name)
        return () =>
          this.success(
            `SuspectingACtion::: success: NPC:SNITCH: cause concolation:${this.cause} | ${consequence.type} || ${this.a.name} | ${this.perp.name}`
          )
      } else if (consequence.type === 'phonesecurity') {
        // this.perp.updateFromBehavior('turnPriority', 97)
        print(
          'SuspectingAction::',
          this.a.name,
          'has phone-ing on::',
          this.perp.name
        )
        this.a.addToBehavior(
          'active',
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
      } else if (consequence.type == 'reckless') {
        print(
          'SupectingAction::',
          this.a.name,
          'will become reckless about::',
          this.perp.name
        )
        this.perp.addToBehavior(
          'active',
          new RecklessSequence(
            this.getProps,
            this.perp.getBehaviorProps('announcer') as AnnouncerProps,
            this.cause
          )
        )
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
        this.perp.addToBehavior(
          'active',
          new AnnouncerSequence(
            this.getProps,
            this.perp.getBehaviorProps('announcer') as AnnouncerProps,
            consequence.type
          )
        )
      }
    }

    if (consequence.type == 'neutral' && this.isHero == false) {
      const robbed = this.storage == undefined ? this.a : this.storage
      let chest_item = null
      /**
       * need sequence for snitch!!
       * need returns for chkfuncs call_security
       * differentiate between stealing, taking and stashing? no just...
       * have some sort of severiity on the actors?
       * luggage bad, reception desk bad, customs desk very bad,  vase not so bad
       * needs to be part of npcstealcheck and witnessplayer
       * maybe local function in chkfuncs that bases it on actor naem
       * and room name and npc clan etc...
       * that in turn decides the resultChecks / checks
       * ALso this alway has some sort of inventory part currently
       * probably will need to abstract at some point
       */

      if (math.random() < 0.4) {
        chest_item =
          robbed.inventory[math.random(0, robbed.inventory.length - 1)]
        //chest_item = removeRandom(this.a.inventory, ['apple01'])
      } else if (math.random() < 0.5) {
        chest_item = removeValuable(robbed.inventory)
      } else {
        chest_item = removeAdvantageous(
          robbed.inventory,
          this.perp.traits.skills
        )
      }

      if (chest_item !== null) {
        if (robbed.updateInventory !== undefined)
          robbed.updateInventory('delete', chest_item)
        this.perp.updateInventory('add', chest_item)
        //this.perp.addInvBonus(chest_item)
      }
      //if (victim == true ){ remove_chest_bonus(w, chest_item) }
      this.perp.cooldown = math.random(5, 15)
      return () =>
        this.fail(
          `SuspectingAction::: Failed:: ${this.a.name} was neutral and had no effect on ${this.perp.name}`
        )
    } else if (consequence.type == 'neutral' && this.isHero == true) {
      const params = {
        actorname: this.storage?.name,
        //isNpc: _this.isNpc,
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

    //this.a.cooldown = this.a.cooldown + 5

    return () => this.success()
    //need something that checks response
    //does response need EffectsAction, sequences, something else???
    //testjpf
  }
  success(s?: string) {
    print('SuspectingAction:: Success::', s)
  }
}
