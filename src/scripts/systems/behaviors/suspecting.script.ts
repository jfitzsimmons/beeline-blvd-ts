import { Behavior, BehaviorSystem } from '../../../types/state'
import { removeValuable, removeAdvantageous } from '../../utils/inventory'
import { shuffle } from '../../utils/utils'
import { subscribe, unsubscribe } from '../dispatcher'
import {
  angel_check,
  becomeASnitchCheck,
  meritsDemerits,
  pledgeCheck,
  prejudice_check,
  recklessCheck,
  suspicious_check,
  targetPunchedCheck,
  unlucky_check,
  vanity_check,
  watcher_punched_check,
} from '../npcs/crimeChecks'

const { npcs, rooms, stations, behaviors, novels } = globalThis.game.world

export default {
  id: 'suspecting',
  recipient: '',
  agent: '',
  reason: '',
  type: '',
  turns: 0,
  optionKeys: [],
  storage: '',

  init(behavior: Behavior): BehaviorSystem {
    //TESTJP loop through types of behaviors
    //snitch, quest, injured, etc...
    // init blank
    // this.id = behavior.id
    this.recipient = behavior.recipient
    this.agent = behavior.agent
    this.reason = behavior.reason
    this.type = behavior.type
    this.turns = behavior.turns
    this.storage = behavior.optionKeys[0]

    // this.sub_id = subscribe(['behavior_npc_default'])
    /**testjpf here we can subscribe
     * then on tick()we dispatch this id with message tick?
     *
     *
     * subscribe would be good because we can keep updating
     * with more security guards and civilians
     */

    return { ...this }
  },

  tick(): void {
    //testjpf have conditions fro severity?!?!?
    const resultChecks: Array<
      (chkr: string, chkd: string) => { pass: boolean; type: string }
    > =
      this.recipient == 'player'
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
      consequence = resultChecks[i](this.agent, this.recipient)
      if (consequence.pass == true) i = 0
    }

    // prettier-ignore
    //print('Suspectingaction::: consequence:::',consequence.type,this.reason,'| confronter:',this.agent,(this.a.getBehaviorProps('announcer')as AnnouncerProps).hp,'perp:',this.recipient,(this.perp.getBehaviorProps('announcer')as AnnouncerProps).hp,'inroom:',this.a.currRoom)
    /***
     * testjpf
     * need to open inventory on
     * exiting novel
     */
    if (this.recipient == 'player') {
      //  const perp = this.perp.getBehaviorProps('question') as Herostring
        if (consequence.type == 'snitch') {
          if (npcs.all[this.agent].clan == 'security') {
            /*
            for (const behavior of this.a.behavior.active.children) {
              if (
                behavior instanceof QuestionSequence &&
                (behavior.perp('helper') as HelperProps).name == this.recipient
              ) {
                behavior.update(this.reason)
                print(
                  'suspectingAction::: QuestionSequence extended for:: ',
                  this.agent,
                  'about:',
                  this.recipient
                )
                return () =>
                  this.success(
                    `${this.agent} extend questionUpdate suspectingsACTION in ${this.a.currRoom}`
                  )
              }
            }
            this.a.addToBehavior(
              'active',
              new QuestionSequence(
                this.a.getBehaviorProps.bind(this.a),
                this.perp.getBehaviorProps.bind(this.perp),
                this.reason
              )
            )
              */
          } else {
           /*
            for (const behavior of this.a.behavior.active.children) {
              if (
                behavior instanceof SnitchSequence &&
                behavior.perp.name == this.recipient
              ) {
                behavior.update(this.reason)
                print(
                  'suspectingAction::: SnitchSequence extended for:: ',
                  this.agent,
                  'about:',
                  this.recipient
                )
                return () =>
                  this.success(
                    `${this.agent} extend snitchUpdate suspectingsACTION in ${this.a.currRoom}`
                  )
              }
            }
            this.a.addToBehavior(
              'active',
              new SnitchSequence(
                this.getProps,
                this.perp.getBehaviorProps('helper') as HelperProps,
                this.reason
              )
            )
              */
          }
          const params = {
            actorname: this.storage,
            //isNpc: _this.isNpc,
            watcher: this.agent,
            action: this.reason,
          }
          print('SNITCH:: ', this.storage)
  
          msg.post('/shared/guis#inventory', 'opened_chest', params)
          msg.post('#', 'release_input_focus')
          return 
        }
        if (this.reason == 'pockets') {
          novels.setConfrontation(this.agent, consequence.type, this.reason)
  
          msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  
          return 
        }
        if (consequence.type == 'merits') {
          novels.setConfrontation(this.agent, this.reason, consequence.type)
  
          msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  
          const params = {
            actorname: this.storage,
            //isNpc: _this.isNpc,
            watcher: this.agent,
            action: this.reason,
          }
          print('neutralsuspecting:: ', this.storage)
  
          msg.post('/shared/guis#inventory', 'opened_chest', params)
          msg.post('#', 'release_input_focus')
  
   
        }
        if (consequence.type == 'suspicious') {
          novels.setConfrontation(this.agent, consequence.type, this.reason)
          msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  

        }
      }
    //For abstraction could have a
    //consequenceAction tha build these
    //testjpf
    if (this.recipient !== 'player') {
      if (consequence.type == 'snitch') {
        if (npcs.all[this.recipient].clan == 'security') {
          for (const behavior of npcs.all[this.agent].behaviorKeys) {
            if (behavior === `behavior_${this.agent}_${this.recipient}`) {
              behaviors.updateBehavior(
                `behavior_${this.agent}_${this.recipient}`
              )
              print(
                'suspectingAction::: QuestionSequence extended for:: ',
                this.agent,
                'by:',
                this.agent,
                'for',
                this.recipient
              )
              return
            }
          }
          behaviors.addBehavior({
            id: `questioning_${this.agent}_${this.recipient}`,
          })
        } else {
          /*
          behaviors.addToBehavior(
            'active',
            new SnitchSequence(
              this.getProps,
              this.perp.getBehaviorProps('helper') as HelperProps,
              this.reason
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
              */
        }
        //print('SNITCH:: ', this.storage)
        return
      } else if (consequence.type === 'phonesecurity') {
        print(
          'SuspectingAction::',
          this.agent,
          'has phone-ing on::',
          this.recipient
        )
        /*
        for (const behavior of this.a.behavior.active.children) {
          if (
            behavior instanceof PhoneSequence &&
            behavior.perp.name == this.recipient
          ) {
            behavior.update(this.reason)
            print(
              'suspectingAction::: phoneSequence extended for:: ',
              this.agent,
              'by:',
              this.recipient
            )
            return () =>
              this.continue(
                `${this.agent} already has phone. phoneUpdate PHONeACTION in ${this.a.currRoom}`
              )
          }
        }
        return () =>
          this.alternate(
            new PhoneSequence(
              this.a.getBehaviorProps.bind(this.a),
              this.perp.getBehaviorProps('helper') as HelperProps,
              this.reason
            )
          )
            */
      } else if (consequence.type == 'jailed') {
        /*
        this.perp.updateFromBehavior('turnPriority', 97)
        print('SupectingAction::', this.agent, 'has Arrested::', this.recipient)
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
            npc: this.agent,
          })
          // prettier-ignore
          print("runrun",this.agent, 'STATION MOVE VIA suspecting jailed', this.recipient, 'in', this.a.currRoom)
        }
      } else if (consequence.type == 'reckless') {
        if (
          this.a.currRoom == this.perp.currRoom &&
          this.a.currRoom == this.a.getFocusedRoom()
        ) {
          msg.post(`/${this.a.currStation}#npc_loader`, hash('move_npc'), {
            station: this.perp.currStation,
            npc: this.agent,
          })
          // prettier-ignore
          print("runrun",this.agent, 'STATION MOVE VIA suspecting jailed', this.recipient, 'in', this.a.currRoom)
        }
        return () => this.continue('reckless')
      } else if (
        consequence.type == 'merits' ||
        consequence.type == 'demerits'
      ) {
        print(
          'SupectingAction::',
          this.agent,
          'will make announcements about::',
          this.recipient
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
            npc: this.agent,
          })
          // prettier-ignore
          print("runrun",this.agent, 'STATION MOVE VIA suspecting',consequence.type, this.recipient, 'in', this.a.currRoom)
        }
      } else if (consequence.type.slice(0, 6) === 'wPunch') {
        print(
          this.perp.hp,
          'SuspectingAction::PUNCH perp got punched',
          this.recipient,
          'by',
          this.agent
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
            npc: this.agent,
          })
          // prettier-ignore
          print("runrun",this.agent, 'STATION MOVE VIA suspecting',consequence.type, this.recipient, 'in', this.a.currRoom)
        }
        return () =>
          this.alternate(
            new AssaultedSequence(
              this.perp.getBehaviorProps.bind(this.perp),
              this.getProps('question') as string
            )
          )
      } else if (consequence.type.slice(0, 6) === 'sPunch') {
        print(
          this.a.hp,
          'SuspectingAction::PUNCH WATCHER got punched',
          this.agent,
          'by',
          this.recipient
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
              npc: this.recipient,
            })
            // prettier-ignore
            print("runrun",this.recipient, 'STATION MOVE VIA suspecting',consequence.type, this.agent, 'in', this.a.currRoom)
          }
          return () =>
            this.alternate(
              new AssaultedSequence(
                this.getProps as (behavior: BehaviorKeys) => ActionProps,
                this.perp.getBehaviorProps('question') as string
              )
            )
        }
            */
      }
    }
    if (consequence.type == 'neutral' && this.recipient == 'player') {
      const robbed = this.storage == undefined ? this.agent : this.storage
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
      /*
      return () =>
        this.fail(
          `SuspectingAction::: Failed:: ${
            this.agent
          } was neutral and had no effect on ${this.recipient}. stole: ${
            chest_item !== null ? chest_item : ''
          }`
        )
          */
    } else if (consequence.type == 'neutral' && this.recipient == 'player') {
      const params = {
        actorname: this.storage,
        watcher: this.agent,
        action: this.reason,
      }
      print('neutralsuspecting:: ', this.storage)
      msg.post('/shared/guis#inventory', 'opened_chest', params)
      msg.post('#', 'release_input_focus')
      // this.fail(
      //    `SuspectingAction::: Failed:: ${this.agent} was neutral and had no effect on ${this.recipient}`
      //    )
    }

    return //() => this.success(`Default, ${consequence.type},`)
  },
}

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['npc_questioning_'])
  ///testjpf
  //could do instead, subscribe['quest_']
  //and get all quest messages. then in Tuturial
  //I could get all quest_tutorial_
  //and unsubscribe when tuts is over
}

export function final(this: props) {
  unsubscribe(this.sub_id)
}
//testjpf
//could import from a sub folder
//something like questHashTable
export function on_message(
  this: props,
  _messageId: hash,
  message: { questId: string; type: string },
  _sender: url
) {
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.type == 'backup') {
    //warn other officers
  }
}
