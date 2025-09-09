import npcsData from './initData/npcs'
//testjpf make new import
//quest
import { subscribe, unsubscribe } from './dispatcher'
import {
  fillStationAttempt,
  set_npc_target,
  set_room_priority,
} from '../utils/ai'
import { surrounding_room_matrix } from '../utils/utils'
import { RoomsInitState } from '../states/inits/roomsInitState'

const { npcs, rooms, behaviors } = globalThis.game.world

export default {
  //behaviors: { placement },
  tick() {
    for (const [, npc] of Object.entries(npcs.all)) {
      npc.cooldown -= 1
    }
    //testjpf this is where i need to give thought to...
    // mutliple actions with AP
    //placing vs behavior. vs moments....
  },
  init() {
    for (const [, npc] of Object.entries(npcsData)) {
      npcs.initNpc(npc)
      behaviors.addBehavior({
        id: `place_${npc.name}_${npc.clan}`,
        turns: Infinity,
      })
      //questTasks[quest.id]()
      // quests.loadListeners(k)
    }

    ///testjpf
    // now activate new game stuff?
  },
  newGame() {
    //npcs newenter and exit can go herer
  },
  makePriorityRoomList(n: string, target: { x: number; y: number }): string[] {
    const searcher = npcs.all[n]
    const npcPriorityProps = {
      matrix: searcher.matrix,
      home: searcher.home,
      clearance: searcher.clearance,
    }
    const npcTurnProps = {
      turnPriority: searcher.turnPriority,
      aiPath: searcher.aiPath,
      target: target,
      ...npcPriorityProps,
    }

    return set_room_priority(
      set_npc_target(
        surrounding_room_matrix(target, searcher.matrix),
        npcTurnProps
      ),
      npcPriorityProps
    )
  },
  findRoomPlaceStation(
    n: string,
    t: { x: number; y: number } | undefined = undefined,
    r: string[] | undefined = undefined
  ): void {
    rooms.get_focused()
    const playerRoom = rooms.get_focused()
    const roomTarget = t !== undefined ? t : RoomsInitState[playerRoom].matrix
    const priorities =
      r !== undefined ? r : this.makePriorityRoomList(n, roomTarget)

    const searcher = npcs.all[n]

    searcher.exitRoom = searcher.currRoom
    //TODO most importatn need to figure out new station stuff as POC
    const { chosenRoom, chosenStation } = fillStationAttempt(
      priorities,
      searcher.name,
      searcher.matrix,
      searcher.clan
      // searcher.p.rooms.getStationMap()
    )
    // searcher.p.rooms.clearStation(searcher.currRoom, searcher.currStation, searcher.name)
    // searcher.p.rooms.setStation(chosenRoom, chosenStation, searcher.name)

    //prettier-ignore
    print('length:!:',priorities.length,searcher.name,':: findRoomPlaceStation ::',chosenRoom,chosenStation,':EXIT:',searcher.exitRoom)

    searcher.currRoom = chosenRoom
    searcher.currStation = chosenStation
    searcher.matrix = RoomsInitState[chosenRoom].matrix
    if (searcher.turnPriority > 93) return
    if (math.random() > 0.4 && chosenRoom === playerRoom) {
      searcher.turnPriority = 0
    } else {
      searcher.turnPriority = searcher.turnPriority + 1
    }
  },
}

//const dispatcher = require "crit.dispatcher"

//const h_toggle = //hash("toggle")

interface props {
  sub_id: number
  //storagename: string
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)
  /**
   * !!! TESTJPF
   * loop trhough all the script.ts files and int them too!
   */
  this.sub_id = subscribe(['quest_'])
  ///testjpf
  //could do instead, subscribe['quest_']
  //and get all quest messages. then in Tuturial
  //I could get all quest_tutorial_
  //and unsubscribe when tuts is over
}

export function final(this: props) {
  unsubscribe(this.sub_id)
  //loop through all sun script.ts and run final! todo
  //testjpf
}
//testjpf
//could import from a sub folder
//something like questHashTable
export function on_message(
  this: props,
  messageId: hash,
  message: { questId: string; status: string },
  _sender: url
) {
  /**
   * testjpf
   * maybe here we just accept status and id
   * just send the message through to sub script??? probably
   */

  if (messageId == hash('quest_tutorial_start')) {
    print('TESTJPF!!: This should eventually make a quest available.')
    //  if (message == "unlock"){print("unlock")}
    if (message.status == 'unlock') {
      print('unlock: TESTJPF questID:: ', message.questId)
    }
  }
  if (message.status == 'add') {
    print('unlock: TESTJPF questID:: ', message.questId)
    // quests.initQuest(quest)
  }
}
