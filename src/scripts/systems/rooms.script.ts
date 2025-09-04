//import questsData from './quests/data'
import roomsData from './initData/rooms'

//testjpf make new import
//quest
import { subscribe, unsubscribe } from './dispatcher'
import { load_adjacent, load_storage, loadNpcs } from './rooms/onScreen'
//import { RoomsInitLayout } from '../states/inits/roomsInitState'
//import { quest_checker, questTasks } from '../listeners/quests/quests_main'

const { rooms, inventory } = globalThis.game.world

export default {
  quests: {},
  // TESTJPF !!! NOW unlocks / upgrades: ???
  dispatches: {},
  tick() {
    // for (const [, room] of Object.entries(rooms.all)) {
    //testjpf need to formalize a questlistener
    //if (questTasks[quest.id] !== null) questTasks[quest.id].tick()
    //TESTJPF then tutorialA, tutb will ahve things like
    // .active(),.see(), that will be called in tick
    // quests.loadCstenss(k)
    // }
  },
  init() {
    for (const [, room] of Object.entries(roomsData)) {
      rooms.initRoom(room)
      for (const [, storage] of Object.entries(room.actors)) {
        inventory.initStorage(storage)
      }
      //questTasks[quest.id].init()
      // quests.loadListeners(k)
    }
    ///testjpf
    // now activate new game stuff?
  },
  newGame() {
    //testjpf
    // load tutorial listeners
    //make active
    //when active send message with msgid of questid  and message of active
  },
  loadOnScreenRooms() {
    load_adjacent()
    loadNpcs()
    load_storage()
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

  this.sub_id = subscribe(['room_'])
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
  messageId: hash,
  message: { unlockId: string; status: string },
  _sender: url
) {
  if (messageId == hash('reception_level_1')) {
    print('TESTJPF!!: This should eventually make a level upgrade.')
    //  if (message == "unlock"){print("unlock")}
    if (message.status == 'unlock') {
      print('rooms: TESTJPF unlockID:: ', message.unlockId)
    }
  }
}
