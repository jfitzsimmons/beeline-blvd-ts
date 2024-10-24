import { shuffle } from '../utils/utils'
//import { aid_check, clearance_checks } from './ai_checks'
import { Direction } from '../../types/ai'
//import { Occupants } from '../../types/state'
import { RoomsInitLayout, RoomsInitRoles } from '../states/inits/roomsInitState'
//import { remove_effects } from '../systems/effectsystem'
//import { reception_checks } from './levels/reception'
////import { customs_checks } from './levels/customs'
//import { baggage_checks } from './levels/baggage'
//import { doctor_ai_turn, freeze_injured_npc } from '../systems/emergencysystem'
//import { thief_consolation_checks } from '../systems/tasksystem'
//const { world } = globalThis.game
//const { tasks, rooms, npcs, player } = world
/** 
const initial_places = [
  'reception',
  'baggage',
  'customs',
  'admin1',
  'entrance',
  'viplobby',
  'loading',
  'security',
  'lockers',
  'warehouse',
  'alley1',
  'commonsext',
  'storage',
  'commonsint',
  'chapel',
  'alley2',
  'inn1',
  'lobby',
  'infirmary',
  'recroom',
  'pubgrill',
  'gym',
  'store',
  'maintenance',
  'alley3',
]*/
const count: { [key: string]: number } = {}
const unplacedcount: { [key: string]: number } = {}

// could this be purely functional utility?
export function attempt_to_fill_station(
  room_list: string[],
  npc: string,
  matrix: { x: number; y: number },
  clan: string,
  stationMap: { [key: string]: { [key: string]: string } }
) {
  //testjpf debug number of roomlist occurences
  room_list.forEach((element) => {
    if (count[element] != null) {
      count[element] += 1
    } else {
      count[element] = 1
    }
  })

  let placed = false
  //let fallback = false
  let chosenRoom = ''
  let chosenStation = ''

  //const current = npcs.all[npc].matrix

  //loop through priority room_list
  //testjpf. not sure why it needs me to reverse.??
  //room_list.reverse()
  while (placed == false) {
    //    room_list.forEach((room: string) => {
    for (const room of room_list) {
      const shuffled_stations: [string, string][] = shuffle(
        Object.entries(stationMap[room])
      )
      //  let ks: keyof typeof shuffled_stations
      for (const ks of shuffled_stations) {
        if (RoomsInitRoles[ks[0]].includes(clan)) {
          //loop thru room stations see if empty or has correct role
          chosenRoom = room
          chosenStation = ks[0]
          /**
          print(
            npc,
            ',went to ,',
            room,
            ks[0],
            ',from,',
            RoomsInitLayout[matrix.y][matrix.x],
            ',using,',
            npcs.all[npc].ai_path,
            ',TURNS,',
            npcs.all[npc].turns_since_encounter
          )
 */
          //fill station testjpf abstract maybe for NPCS turn state?
          //npcs.all[npc].exitroom = RoomsInitLayout[current.y][current.x]!
          placed = true
          break
        }
      }
      if (placed == true) break
    }
    // fallback stations
    /**
     * else if (
        room_list.includes('grounds') &&
        rooms.fallbacks.stations['grounds_unplaced'] == ''
      ) {
        rooms.fallbacks.stations['grounds_unplaced'] = npc
        npcs.all[npc].matrix = rooms.all['grounds'].matrix
     */
    if (placed == false) {
      //fallback = true
      if (
        room_list.includes('admin1') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'admin1'
      ) {
        chosenStation = 'admin1_passer'
        chosenRoom = 'admin1'
      } else if (
        room_list.includes('security') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'security'
      ) {
        chosenStation = 'security_passer'
        chosenRoom = 'security'
      } else if (room_list.includes('security')) {
        chosenStation = 'security_outside1'
        chosenRoom = 'security'
      } else if (room_list.includes('grounds')) {
        chosenStation = 'grounds_unplaced'
        chosenRoom = 'grounds'
      } else if (room_list.includes('viplobby')) {
        chosenStation = 'viplobby_outside1'
        chosenRoom = 'viplobby'
      } else if (room_list.includes('reception')) {
        chosenStation = 'reception_unplaced'
        chosenRoom = 'reception'
      } else if (room_list.includes('infirmary')) {
        chosenStation = 'infirmary_outside1'
        chosenRoom = 'infirmary'
      } else if (room_list.includes('dorms')) {
        chosenStation = 'dorms_outside1'
        chosenRoom = 'dorms'
      } else {
        if (unplacedcount[npc] != null) {
          unplacedcount[npc] += 1
        } else {
          unplacedcount[npc] = 1
        }
        if (unplacedcount[RoomsInitLayout[matrix.y][matrix.x]!] != null) {
          unplacedcount[RoomsInitLayout[matrix.y][matrix.x]!] += 1
        } else {
          unplacedcount[RoomsInitLayout[matrix.y][matrix.x]!] = 1
        }
      }
      placed = true
    }
  }
  print('FILLSTATIONEND:::', chosenRoom, chosenStation, npc)
  return { chosenRoom, chosenStation }
}
/**
 * @param target target: room npc wants to get to
 * @param npc current: room npc is in
 * @returns array of room strings
 */
export function set_room_priority(
  target: { x: number; y: number },
  npc: { matrix: { x: number; y: number }; home: { x: number; y: number } }
): string[] {
  const room_list: (string | null)[] = []
  //const current = npcs.all[npc].matrix
  //get list of possible rooms NPC could go to next in order to get to target
  if (target.y > npc.matrix.y) {
    room_list.push(RoomsInitLayout[npc.matrix.y + 1][npc.matrix.x])
  }
  if (target.x < npc.matrix.x) {
    room_list.push(RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1])
  }
  if (target.y < npc.matrix.y) {
    room_list.push(RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x])
  }
  if (target.x > npc.matrix.x) {
    room_list.push(RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1])
  }

  room_list.push(RoomsInitLayout[npc.matrix.y][npc.matrix.x])

  if (
    target.y > npc.matrix.y &&
    npc.matrix.y - 1 >= 0 &&
    RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x] != null
  ) {
    room_list.push(RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x])
  }
  if (
    target.x > npc.matrix.x &&
    RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1] != null
  ) {
    room_list.push(RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1])
  }
  if (
    target.y <= npc.matrix.y &&
    npc.matrix.y < 6 &&
    RoomsInitLayout[npc.matrix.y + 1] != null
  ) {
    room_list.push(RoomsInitLayout[npc.matrix.y + 1][npc.matrix.x])
  }
  if (
    target.x <= npc.matrix.x &&
    RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1] != null
  ) {
    room_list.push(RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1])
  }

  room_list.push(RoomsInitLayout[npc.home.y][npc.home.x])
  const filteredArray: string[] = room_list.filter(
    (s): s is string => s != null
  )
  return filteredArray
}
export function set_npc_target(
  direction: Direction,
  n: {
    turns_since_encounter: number
    ai_path: string
    matrix: { x: number; y: number }
    player: { x: number; y: number }
    home: { x: number; y: number }
  }
) {
  //const npc = npcs.all[n]
  let target = { x: 0, y: 0 }
  if (n.turns_since_encounter > 20) {
    target = direction.center
  } else if (n.ai_path == 'pinky') {
    //always targets 0 to 2 rooms infront of player
    target = direction.front
  } else if (n.ai_path == 'blinky') {
    //always targets 1 room behind player unless too far
    const distance = n.matrix.x - n.home.x + (n.matrix.y - n.home.y)
    if (distance < -5 || distance > 5) {
      target = n.home
    } else {
      target = direction.back
    }
  } else if (n.ai_path == 'inky') {
    //1/3 check to see if you 1: too far from home or 2: 50/50 left/right
    let distance = 0
    if (math.random() < 0.33) {
      distance =
        n.matrix.x - direction.center.x + (n.matrix.y - direction.center.y)
    } else {
      distance = 9
    }
    if (distance > -2 && distance < 2) {
      target = n.home
    } else if (math.random() < 0.5) {
      target = direction.right
    } else {
      target = direction.left
    }
  } else if (n.ai_path == 'clyde') {
    const distance = n.matrix.x - n.player.x + (n.matrix.y - direction.center.y)
    //random front, back, left, right unless too close and fail 50/50 check
    if (distance > -2 && distance < 2 && math.random() > 0.5) {
      target = n.home
    } else {
      const dirsRO = ['center', 'front', 'back', 'left', 'right'] as const
      const dirs = shuffle([...dirsRO])
      const kd: keyof Direction = dirs[0]
      target = direction[kd]
    }
  }
  //limit target to map layout grid
  if (target.x < 0) {
    target.x = 0
  } else if (target.x > 5) {
    target.x = 5
  }

  if (target.y < 0) {
    target.y = 0
  } else if (target.y > 5) {
    target.y = 5
  }

  return target
}
//function release_occupants() {
/**
  const prisoners: Occupants = rooms.all.security.occupants!
  let station: keyof typeof prisoners
  for (station in prisoners) {
    const prisoner = prisoners[station]
    if (prisoner != '' && npcs.all[prisoner].cooldown <= 0) {
      npcs.all[prisoner].fsm.setState('turn')
      //npc_action_move(prisoner, d)
      rooms.all.security.occupants![station] = ''
    }
  }
  const occupants: Occupants = rooms.all.infirmary.occupants!
  let bed: keyof typeof occupants
  for (bed in occupants) {
    const patient = occupants[bed]
    if (patient != '' && npcs.all[patient].cooldown <= 0) {
      npcs.all[patient].hp = 10
      npcs.all[patient].fsm.setState('turn')
      //npc_action_move(patient, d)
      rooms.all.infirmary.occupants![bed] = ''
    }
  }
     */
//}

//function ai_actions() {
//clearance_checks()
//aid_check()
//release_occupants()
//reception_checks()
//customs_checks()
//baggage_checks
//}

//export function npc_action_move(n: string, d: Direction) {
//const npc = npcs.all[n]
//for most part target centered around player
// const target = set_npc_target(d, n)
//diff room list for each npc
//const room_list: string[] = set_room_priority(target, n)
//attempt_to_fill_station(room_list, n)
//}
// test todo move to an FSM
//export function place_npcs() {
//npcs.sort_npcs_by_encounter()
//TESTJPF  TEST SETTINGS:::
/** 
  tasks.caution_builder(
    npcs.all['security004'],
    'questioning',
    rooms.all.grounds.stations.assistant,
    'testing'
  )
  npcs.all[rooms.all.reception.stations.guard].hp = 0
  npcs.all[rooms.all.grounds.stations.worker1].hp = 0

  tasks.append_caution({
    label: 'ignore',
    npc: npcs.all[rooms.all.grounds.stations.worker1].labelname,
    authority: 'doctors',
    time: 100,
    suspect: npcs.all[rooms.all.grounds.stations.worker1].labelname,
    reason: 'quest',
    type: 'helpthatman',
  })
    */
//}
//export function ai_turn() {
//testjpf
//ai turn is called on level load
// this clears stations only!!!
//const dt = math.randomseed(os.time())
//world.fsm.update(dt)

//NOW MOVE ALL TO NPCS TURN! HOPEFULLY!! TESTJPF
///npc state infirmed. on enter add to infirmed list. exit remove!!!
/** const infirmed = Object.values(rooms.all.infirmary.occupants!).filter(
    (p) => p != ''
  )*/
//infirmed, inmates, and doctors in the field dont have actions
//in office docs are case by case
// now part of you immobile state update, enter, exit testjpf

//move to npc!!
//const immobile: string[] = [...infirmed, ...tasks.get_field_docs()]
//npcs.sort_npcs_by_encounter()

//move to Rooms and room!!

//testjpf move loop to NPCS turnupdate
//for (let i = npcs.order.length; i-- !== 0; ) {
//injure needs to freeze / not move
//const npc = npcs.all[npcs.order[i]]
//npc.fsm.update(math.randomseed(os.time()))
// npc.fsm.setState('injury')
///testjpf above should be injured not infirm
//!infirm in infirmary
//confusing because tasks.medicq and
//emergency injured_npc seem redundant
//freeze_injured_npc(npc)
//immobile.push(npc.labelname)
// }
//if (npc.clan == 'doctors') {
//testjpf need lots of target changes mostly
// decipher in in fieldmending, infirmarymending, else move
//Docs target field or infirmary
//const [docTargets, docInOffice] = doctor_ai_turn(npc, targets)
// targets = docTargets
//In-office docs dont have actions
// if (docInOffice == true) print('TODO TESTJPF') //immobile.push(npc.labelname)
//}

//default mobile actions
//if (npc.fsm.isCurrentState('move')) npc_action_move(npc.labelname, targets)
//}

//ai_actions()

//TESTJPF DEBUG BELOW ::::
/** 
  let cKey: keyof typeof count

  for (cKey in count) {
    print(cKey, count[cKey])
  }

  let uKey: keyof typeof unplacedcount

  for (uKey in unplacedcount) {
    print(uKey, unplacedcount[uKey])
  }*/
//print('npcs.order.length', npcs.order.length)
//}
