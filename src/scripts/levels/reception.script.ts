import { subscribe, unsubscribe } from '../systems/dispatcher'
import { getAdjacentRooms } from '../systems/stations'
/**
 * testjpf need to convert into one single file for all levels
 */
const { rooms, stations } = globalThis.game.world
function load_npcs() {
  const roomName = rooms.focused // testjpf remove hardcode string!
  //const stations: { [key: string]: string } = rooms.all[roomName].stations

  for (const station of rooms.all[roomName].stationKeys) {
    const npc = stations.all[station]
    station == 'desk'
      ? msg.post('deskarea#station', 'loadStation', { npc, roomName })
      : msg.post(`/${station}#npc_loader`, 'load_npc', { npc })
  }
  /** 
  const swaps = rooms.all[roomName].swaps
  let swap: keyof typeof swaps
  for (swap in swaps) {
    const npc = swaps[swap][1]
    print('RECEPTIONSWAPS::', swap, swaps[swap][0], swaps[swap][1])
    msg.post(`/${swaps[swap][0]}#npc_loader`, 'load_npc', { npc })
  }
*/
  //TESTJPF do you need any of these sopecific level files?
  //see how much you can move to main level.ts
  //const npc = rooms.fallbacks.stations.reception_unplaced
  // msg.post('/reception_unplaced#npc_loader', 'load_npc', { npc })
}

function load_adjacent() {
  const roomNames = getAdjacentRooms(rooms.focused)
  for (const adjacent of roomNames) {
    const sKeys: string[] = rooms.all[adjacent].stationKeys
    //let station: keyof typeof stations
    for (const s of sKeys) {
      const npc = stations.all[s].occupant
      msg.post(
        `/${adjacent}lite/${adjacent}${stations.all[s].name}#npc_loader`,
        'load_shell',
        {
          npc,
        }
      )
    }
  }
}
// todo need room sys and inventory state!!!
// TESTjpf
function load_storage() {
  const actors = rooms.all[rooms.focused].actors
  let sKey: keyof typeof actors
  for (sKey in actors) {
    const actor = actors[sKey]
    const params = {
      roomName: rooms.focused,
      storagename: actor.name,
      ani: 'vase_art1',
    }
    msg.post('/vase1#storage', 'load_storage_inventory', params)
    sprite.play_flipbook('/vase1#sprite', params.ani)
  }
  const params = {
    roomName: rooms.focused,
    storagename: 'vase',
    ani: 'vase_art1',
  }
  msg.post('/vase1#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase1#sprite', params.ani)

  params.storagename = 'vase2'
  params.ani = 'vase_art6'
  msg.post('/vase2#storage', 'load_storage_inventory', params)
  sprite.play_flipbook('/vase2#sprite', params.ani)
}

interface props {
  sub_id: number
  //storagename: string
}
export const level_reception_upgrades = {
  init() {
    //since already here dont use this:
    //quests.updateStatus('activate', 'world_tutorial_medic')
    //but this:
    // msg.post('#', hash('level_reception_0'), { status: 'active' })
    // wtm.status.active = true //testjpf should probable be a setter
    //make a random npc injured.
    //subscribe to their quest.
    //ignored by other  npcs
  },
  tick() {
    //look through updgrades? testjpf
  },
}
export function init(this: props) {
  //this.value = true
  //set_color(this.value)

  this.sub_id = subscribe(['level_reception_1', 'level_reception_2'])
  ///testjpf
  //could do instead, subscribe['quest_']
  //and get all quest messages. then in Tuturial
  //I could get all quest_tutorial_
  //and unsubscribe when tuts is over
}
export function final(this: props) {
  unsubscribe(this.sub_id)
}

export function on_message(
  this: props,
  messageId: hash,
  message: { levelId: string; status: string },
  _sender: url
): void {
  if (messageId == hash('room_load')) {
    load_npcs()
    load_storage()
    load_adjacent()
  }
  if (messageId == hash('level_reception_1')) {
    print('TESTJPF!!: This should eventually generate bouses in receptiion.')
  }
  //  if (message == "unlock"){print("unlock")}
  //todo testjpf make more specific
  if (message.status == 'activate') {
    //testjpf
    //use command object to fire funciton based on msgID
    //that processes below:::ß
    print('unlock: TESTJPF levelID:: ', message.levelId)
  }
}
