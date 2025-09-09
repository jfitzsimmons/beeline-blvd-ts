import { Behavior, BehaviorSystem } from '../../../types/state'
import {
  RoomsInitState,
  RoomsInitPriority,
} from '../../states/inits/roomsInitState'
import { subscribe, unsubscribe } from '../dispatcher'
import npcSys from '../npcs.script'

const { npcs, rooms, stations, behaviors, novels } = globalThis.game.world

export default {
  id: 'behavior_placement',
  recipient: '',
  agent: '',
  reason: '',
  type: 'default',
  turns: Infinity,
  optionKeys: [],

  init(behavior: Behavior): BehaviorSystem {
    //TESTJP loop through types of behaviors
    //snitch, quest, injured, etc...
    // init blank
    //this.id = behavior.id
    this.recipient = behavior.recipient
    //can use recipient for paramedic
    this.agent = behavior.agent
    this.reason = behavior.reason
    this.type = behavior.type
    //can use type for medic and stuff?? testjpf
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
    if (this.type == 'default') {
      if (npcs.all[this.agent].cooldown > 0)
        npcs.all[this.agent].cooldown = npcs.all[this.agent].cooldown - 1
      npcs.all[this.agent].exitRoom = npcs.all[this.agent].currRoom
      print(
        '||>> Behavior: PlaceAction: findRoomPlaceStation REGPLACEACTION:',
        npcs.all[this.agent].name
      )
      if (npcs.all[this.agent].turnPriority == 94 && math.random() > 0.3) {
        npcSys.findRoomPlaceStation(
          this.agent,
          RoomsInitState[
            RoomsInitPriority[math.random(0, RoomsInitPriority.length - 1)]
          ].matrix
        )

        print(
          '|> Behavior: PlaceAction: findRoomPlaceStation RANDOM94:',
          npcs.all[this.agent].name
        )
        // return () => this.success()
      }
      npcSys.findRoomPlaceStation(this.agent)

      //  return () => this.success()
    } else if (this.type == 'cop') {
      // const mobile = this.a.turnPriority < 96
      const agent = npcs.all[this.agent]
      const mobile = agent.status.mobile
      //const inprisoned = this.a.getWards('security').length
      const imprisoned = Object.values(rooms.all.security.wardKeys).filter(
        (wk) => stations.all[wk].occupant !== ''
      ).length
      if (agent.cooldown > 0) agent.cooldown = agent.cooldown - 1
      agent.exitRoom = agent.currRoom

      if (mobile === true && imprisoned > 1) {
        if (math.random() + imprisoned * 0.2 > 1) {
          const filled = stations.checkSetStation('security_desk', agent.name)

          if (filled == true) {
            agent.currRoom = 'security'
            return
          }
          print(
            '||>> Behavior: CopPlaceAction: TendingShop!',
            agent.name,
            'filled:',
            filled
          )

          //testjpf
          //!! I think this logic is badd anyway
          //this has no ELSE!!!
          //!!! RELY on () => success()  INSTEAD
        } else if (imprisoned > 2) {
          const target = RoomsInitState.security.matrix
          npcSys.findRoomPlaceStation(this.agent, target)
          print('||>> Behavior: CopPlaceAction: CodeBlue!', agent.name)
          return
        }
      } else if (
        mobile === true &&
        imprisoned < 1 &&
        this.a.getWantedQueue().length > 1
      ) {
        const [criminal, crimeScene] = this.a.getWantedQueue()[0]
        const target =
          crimeScene != 'checked'
            ? RoomsInitState[crimeScene].matrix
            : RoomsInitState[
                RoomsInitPriority[math.random(0, RoomsInitPriority.length - 1)]
              ].matrix

        npcSys.findRoomPlaceStation(this.agent, target)
        if (crimeScene != 'checked' && agent.currRoom == crimeScene)
          this.a.addAdjustWantedQueue(criminal, 'checked')
        print(
          '||>> Behavior: CopPlaceAction: Bounty Hunting!',
          agent.name,
          crimeScene,
          criminal
        )

        return
      }
      print('||>> Behavior: CopPlaceAction: Default Placing.', agent.name)
      agent.turnPriority == 95 && math.random() > 0.3
        ? npcSys.findRoomPlaceStation(
            this.agent,
            RoomsInitState[
              RoomsInitPriority[math.random(0, RoomsInitPriority.length - 1)]
            ].matrix
          )
        : npcSys.findRoomPlaceStation(this.agent)

      return
    }
    // dispatch(this.id, { type: 'tick' })
    //loop through other npcs and see if they passed by
    // add questionAction logic here
  },
}

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['npc_placement_'])
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
