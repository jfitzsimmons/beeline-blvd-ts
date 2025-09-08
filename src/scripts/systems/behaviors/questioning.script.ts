import { Behavior, BehaviorSystem } from '../../../types/state'
import { subscribe, unsubscribe } from '../dispatcher'
import { crimeChecks } from '../npcs/crimeChecks'

const { npcs, rooms, stations, behaviors, novels } = globalThis.game.world

export default {
  id: 'behavior_questioning',
  recipient: '',
  agent: '',
  reason: '',
  type: '',
  turns: 0,
  optionKeys: [],

  init(behavior: Behavior): BehaviorSystem {
    //TESTJP loop through types of behaviors
    //snitch, quest, injured, etc...
    // init blank
    //this.id = behavior.id
    this.recipient = behavior.recipient
    this.agent = behavior.agent
    this.reason = behavior.reason
    this.type = behavior.type
    this.turns = behavior.turns

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
    // dispatch(this.id, { type: 'tick' })
    //loop through other npcs and see if they passed by
    // add questionAction logic here
    const recipient = npcs.all[this.recipient]
    const agent = npcs.all[this.agent]
    const currRoom = agent.currRoom == recipient.currRoom
    const crossedPaths =
      currRoom === true
        ? currRoom
        : Object.values(rooms.all[agent.exitRoom].stationKeys).filter(
            (sk: string) =>
              stations.all[sk].occupant === recipient.name &&
              recipient.exitRoom == agent.currRoom
          ).length > 0

    if (crossedPaths === false) {
      const cops = Object.values(rooms.all[agent.currRoom].stationKeys).filter(
        (sk: string) =>
          stations.all[sk].occupant !== agent.name &&
          stations.all[sk].occupant.substring(0, 3) == 'sec'
      )
      /**
       * testjpf
       * maybe we do a dispatch 'cop_chatter'
       * where
       */
      for (const c of cops) {
        //  print('CINQUESTUON:::', c, 'from:', agent.name)
        const chatter = npcs.all[stations.all[c].occupant]
        const priors = Object.values(chatter.behaviorKeys).filter(
          (bk: string) => bk.split('_')[2] == recipient.name
        )

        //testjpf may need more. raise suspicion. increase heat. etc..
        for (const pk of priors) behaviors.updateBehavior(pk)
        return
      }
    }
    if (this.recipient == 'player' && crossedPaths === true) {
      novels.setConfrontation(agent.name, this.reason, 'questioning')
      return
    }
    const resultChecks: Array<
      (chkr: string, chkd: string) => { pass: boolean; type: string }
    > = crimeChecks[this.reason]

    let consequence = { pass: false, type: 'neutral' }

    for (let i = 0; i < resultChecks.length - 1; i++) {
      consequence = resultChecks[i](this.agent, this.recipient)
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
        /**
         * testjpf. need arrestsys

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
                   */
      } else if (recipient.currStation.slice(0, 4) == 'priso') {
        this.turns += 8
        print(
          'QuestionAction::: JAil Sentence extended for:: ',
          recipient.name,
          'by:',
          agent.name
        )
      } else {
        recipient.turnPriority = 97
        print('QuestionAction::', agent.name, 'has Arrested::', recipient.name)
        // recipient.addToBehavior(
        //    'place',
        //    new ArrestSequence(recipient.getBehaviorProps.bind(this.perp))
        //  )
      }
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == rooms.focused
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
    } else if (consequence.type == 'merits' || consequence.type == 'demerits') {
      print(
        'QuestionAction::',
        agent.name,
        'will make announcements about::',
        recipient.name
      )
      /*
      recipient.addToBehavior(
        'active',
        new AnnouncerSequence(
          this.getProps as (behavior: BehaviorKeys) => ActionProps,
          recipient.getBehaviorProps('announcer') as AnnouncerProps,
          consequence.type
        )
      )*/
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == rooms.focused
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
      /*
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
          */

      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == rooms.focused
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
    } else if (consequence.type.slice(0, 6) === 'sPunch') {
      print(
        agent.hp,
        'QuestioningAction::PUNCH WATCHER got punched',
        agent.name,
        'by',
        recipient.name
      ) /*
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
*/
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == rooms.focused
      ) {
        msg.post(`/${recipient.currStation}#npc_loader`, hash('move_npc'), {
          station: agent.currStation,
          npc: recipient.name,
        })
        // prettier-ignore
        print('runrun',recipient.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, agent.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
      /*
      return () =>
        this.alternate(
          new AssaultedSequence(
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            recipient.getBehaviorProps('question') as QuestionProps
          )
        )
          */
    } else if (consequence.type == 'reckless') {
      if (
        agent.currRoom == recipient.currRoom &&
        agent.currRoom == rooms.focused
      ) {
        msg.post(`/${agent.currStation}#npc_loader`, hash('move_npc'), {
          station: recipient.currStation,
          npc: agent.name,
        })
        // prettier-ignore
        print('runrun',agent.name,agent.currStation, 'STATION MOVE VIA  question',consequence.type, recipient.name, 'in', agent.currRoom,recipient.currRoom, recipient.currStation)
      }
      /*
      return () =>
        this.alternate(
          new EndAction([
            'reckless',
            this.getProps as (behavior: BehaviorKeys) => ActionProps,
            this.perp,
            this.reason,
          ])
        )
          */
      // new RecklessSequence()
    }
    /**
        if (
          agent.currRoom == recipient.currRoom &&
          agent.currRoom == rooms.focused
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

    this.turns--
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
