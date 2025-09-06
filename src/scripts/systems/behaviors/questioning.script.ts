/**
 * so we will have access to state
 * so 2 returnNpc functions?
 *  seems to be going down the same road...
 * need to be able to update stats.
 * needs to be able to add other behaviors
 * !!!  will have that because of behavio sstate!!!!
 *
 */

//import { NpcsInitState } from '../../states/inits/npcsInitState'
//import NpcState from '../../states/npc'
import { Behavior, BehaviorSystem } from '../../../types/state'
import { subscribe, unsubscribe } from '../dispatcher'
const { npcs, rooms } = globalThis.game.world
//const { world_tutorial_medic: wtm } = quests.all
// testjpf need new nps inits
export default {
  id: '',
  recipient: '',
  agent: '',
  reason: '',
  type: '',

  init(behavior: Behavior): BehaviorSystem {
    //TESTJP loop through types of behaviors
    //snitch, quest, injured, etc...
    // init blank
    this.id = behavior.id
    this.recipient = behavior.agent
    this.agent = behavior.agent
    this.reason = behavior.reason
    this.type = behavior.type
    //since already here dont use this:
    //quests.updateStatus('activate', 'world_tutorial_medic')
    //but this:
    // msg.post('#', hash('world_tutorial_medic'), { status: 'active' })
    //  wtm.status.active = true //testjpf should probable be a setter
    //make a random npc injured.
    //subscribe to their quest.
    //ignored by other  npcs
    return { ...this }
  },
  tick() {
    //loop through other npcs and see if they passed by
    // add questionAction logic here
    const recipient = npcs.all[this.recipient]
    const agent = npcs.all[this.agent]
    const currRoom = agent.currRoom == recipient.currRoom
    const crossedPaths =
      currRoom === true
        ? currRoom
        : Object.values(rooms.getOccupants(agent.exitRoom)).filter(
            (s: string) =>
              s === recipient.name && recipient.exitRoom == agent.currRoom
          ).length > 0

    if (crossedPaths === false) {
      const cops = Object.values(agent.getOccupants(agent.currRoom)).filter(
        (s: string) => s !== agent.name && s.substring(0, 3) == 'sec'
      )
      for (const c of cops) {
        //  print('CINQUESTUON:::', c, 'from:', agent.name)
        const chatter = agent.returnNpc(c)
        for (const b of chatter.behavior.active.children) {
          /** * print(
                'CINQUESTUON:::behaviors::',
                b.constructor.name,
                'from:',
                agent.name,
                (b as QuestionSequence).perp('question').name
              )
    */
          if (
            b.constructor.name == 'QuestionSequence' &&
            (b as QuestionSequence).perp('question').name == recipient.name
          ) {
            print(
              'CINQUESTUON:::ADDADJUST!!!!',
              c,
              'from:',
              agent.name,
              'PERP:',
              recipient.name,
              recipient.currRoom
            )

            agent.addAdjustWantedQueue(recipient.name, recipient.currRoom)
            break
          }
        }
      }

      return () =>
        this.continue(
          `QuestionAction::: ${agent.name} did not cross paths with ${recipient.name} for ${this.reason}`
        )
    }
    if (this.hero !== null && crossedPaths === true) {
      this.hero.setConfrontation(agent.name, this.reason, 'questioning')
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
      if (recipient.currStation.slice(0, 4) == 'patie') {
        recipient.addToBehavior(
          'place',
          new ArrestSequence(
            recipient.getBehaviorProps.bind(this.perp),
            10 - agent.hp
          )
        )
        print(
          agent.name,
          'QuestionAction::: ',
          recipient.name,
          'delayed Arrest because is Patient'
        )
      } else if (recipient.currStation.slice(0, 4) == 'priso') {
        for (const behavior of recipient.behavior.active.children) {
          if (
            behavior instanceof JailedSequence &&
            behavior.a.name == recipient.name
          ) {
            behavior.update()
            print(
              'QuestionAction::: JAil Sentence extended for:: ',
              recipient.name,
              'by:',
              agent.name
            )
            break
          }
        }
      } else {
        recipient.updateFromBehavior('turnPriority', 97)
        print('QuestionAction::', agent.name, 'has Arrested::', recipient.name)
        recipient.addToBehavior(
          'place',
          new ArrestSequence(recipient.getBehaviorProps.bind(this.perp))
        )
      }
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == agent.getFocusedRoom()
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
      return () =>
        this.success(
          `QuestionAction::: Success:: ARREST:: ${recipient.name} by ${agent.name} `
        )
    } else if (consequence.type == 'merits' || consequence.type == 'demerits') {
      print(
        'QuestionAction::',
        agent.name,
        'will make announcements about::',
        recipient.name
      )
      recipient.addToBehavior(
        'active',
        new AnnouncerSequence(
          this.getProps as (behavior: BehaviorKeys) => ActionProps,
          recipient.getBehaviorProps('announcer') as AnnouncerProps,
          consequence.type
        )
      )
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == agent.getFocusedRoom()
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
    } else if (consequence.type.slice(0, 6) === 'wPunch') {
      print(
        recipient.hp,
        'QuestioningAction::PUNCH perp got punched',
        recipient.name,
        'by',
        agent.name,
        'in',
        agent.currRoom
      )
      if ((recipient.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
        recipient.addToBehavior(
          'active',
          new InjuredSequence(recipient.getBehaviorProps.bind(this.perp))
        )
        if (
          !recipient.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          recipient.addToBehavior(
            'place',
            new ImmobileSequence(recipient.getBehaviorProps.bind(this.perp))
          )
      }

      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == agent.getFocusedRoom()
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }

      return () =>
        this.alternate(
          new AssaultedSequence(
            recipient.getBehaviorProps.bind(this.perp),
            this.getProps('question') as QuestionProps
          )
        )
    } else if (consequence.type.slice(0, 6) === 'sPunch') {
      print(
        agent.hp,
        'QuestioningAction::PUNCH WATCHER got punched',
        agent.name,
        'by',
        recipient.name
      )
      if ((agent.getBehaviorProps('announcer') as AnnouncerProps).hp < 1) {
        // testjpf probably need an update()
        //for injuredsequencetoo!
        agent.addToBehavior(
          'active',
          new InjuredSequence(agent.getBehaviorProps.bind(this.a))
        )

        if (
          !recipient.behavior.place.children.some(
            (c) => c instanceof ImmobileSequence
          )
        )
          agent.addToBehavior(
            'place',
            new ImmobileSequence(agent.getBehaviorProps.bind(this.a))
          )
      }

      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == agent.getFocusedRoom()
      ) {
        msg.post(`/${recipient.currStation}#npc_loader`, hash('move_npc'), {
          station: agent.currStation,
          npc: recipient.name,
        })
        // prettier-ignore
        print('runrun',recipient.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, agent.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }

      return () =>
        this.alternate(
          new AssaultedSequence(
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            recipient.getBehaviorProps('question') as QuestionProps
          )
        )
    } else if (consequence.type == 'reckless') {
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == agent.getFocusedRoom()
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
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
          agent.currRoom == recipient.currRoom &&
          agent.currRoom == agent.getFocusedRoom()
        ) {
          msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
            station: recipient.currStation,
            npc: agent.name,
          })
          // prettier-ignore
          print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA TASK question', recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
        }
         
        const cops = Object.values(agent.getOccupants(agent.currRoom)).filter(
          (s: string) => s !== agent.name && s.substring(0, 3) == 'sec'
        )
        for (const c of cops) {
          const chatter = agent.returnNpc(c)
          for (const b of chatter.behavior.active.children) {
            if (
              b.constructor.name == 'QuestionSequence' &&
              (b as QuestionSequence).perp('question').name == recipient.name
            ) {
              agent.addAdjustWantedQueue(recipient.name, recipient.currRoom)
              break
            }
          }
        } */
    return () =>
      this.fail(
        `||>> Behavior: QUESTIONACTION::: Default Fail:: ${consequence.type}`
      )
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
  message: { questId: string; status: string },
  _sender: url
) {
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.status == 'backup') {
    //warn other officers
  }
}
