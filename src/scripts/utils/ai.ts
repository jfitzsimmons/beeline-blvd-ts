import { Direction } from '../../types/ai'
import {
  RoomsInitRoles,
  RoomsInitLayout,
  RoomsInitState,
} from '../states/inits/roomsInitState'
import { shuffle } from './utils'

export const turnPriorityLookup = {
  99: [],
  98: ['infirmed', 'injured', 'mendee', 'jailed'], // :: IMMOBILE
  97: ['mender', 'infirm', 'arrest'], //:: Emergency Response?
  96: ['phone'],
  95: ['question'],
  94: ['announcer', 'reckless', 'snitch', 'helper', 'suspecting'],
  93: ['trespass'],
}
export const crimeSeverity: { [key: string]: number } = {
  clearance: 0,
  concern: 0,
  harass: 1,
  theft: 2,
  pockets: 3,
  assault: 4,
}
//TESTJPF Export for DEBUG ONLY???!!!
let roomPlaceCount: {
  [key: string]: { occupants: number; [key: string]: number }
} = {}
export const resetRoomPlaceCount = () => {
  roomPlaceCount = {}
  roomListCount = {}
  print('RESETPLACECOUNT!!!!')
}
export const getRoomPlaceCount = (room: string) => {
  print('ROOMLISTCOUNT:: ', room, roomListCount[room])
}
let roomListCount: { [key: string]: number } = {}
//const unplacedcount: { [key: string]: number } = {}
const fallbackTable: { [key: string]: string[] } = {
  loading: ['loading_outside1'],
  grounds: ['grounds_unplaced'],
  viplobby: ['viplobby_passer', 'viplobby_outside1'],
  reception: ['reception_unplaced'],
  infirmary: ['infirmary_outside1'],
  dorms: ['dorms_outside1', 'dorms_unplaced'],
  security: ['security_passer', 'security_outside1'],
  baggage: ['baggage_passer'],
  alley2: ['alley2_passer'],
  alley4: ['alley4_passer'],
  admin1: ['admin1_passer'],
  customs: ['customs_unplaced'],
  store: ['store_unplaced'],
}
export function fillStationAttempt(
  room_list: string[],
  npc: string,
  matrix: { x: number; y: number },
  clan: string,
  stationMap: {
    [key: string]: { [key: string]: { [key: string]: string } }
  }
): { chosenRoom: string; chosenStation: string } {
  //testjpf debug number of roomlist occurences
  room_list.forEach((room) => {
    if (roomListCount[room] != null) {
      roomListCount[room] += 1
    } else {
      roomListCount[room] = 1
    }
  })

  let placed = false
  let chosenRoom = ''
  let chosenStation = ''

  while (placed == false) {
    for (const room of room_list) {
      if (roomPlaceCount[room] != null) {
        roomPlaceCount[room].listed += 1
      } else {
        roomPlaceCount[room] = { listed: 1, occupants: 0 }
      }
      const shuffledStations: [string, string][] = shuffle(
        Object.entries(stationMap[room].stations)
      )
      for (const ks of shuffledStations) {
        chosenStation =
          ks[0] in RoomsInitState[room].swaps && math.random() > 0.6
            ? RoomsInitState[room].swaps[ks[0]][0]
            : ks[0]

        const role = RoomsInitRoles[chosenStation]
        if (role.includes(clan)) {
          //loop thru room stations see if empty or has correct role
          chosenRoom = room
          // prettier-ignore
          // print(npc, ',went to ,', room, ks[0], ',from,', RoomsInitLayout[matrix.y][matrix.x])
          placed = true
          break
        }
      }
      //print('CHOSENROOM AI:: ', room, npc)
      if (placed == true) break
    }

    // fallback stations
    if (placed == false) {
      for (const room of room_list) {
        if (fallbackTable[room] !== null)
          for (const station of fallbackTable[room]) {
            const passer = station.slice(-6) == 'passer'
            if (
              (passer == false &&
                stationMap.backup.fallbacks[station] !== null) ||
              (passer == true &&
                RoomsInitLayout[matrix.y][matrix.x] != room &&
                stationMap.backup.fallbacks[station] !== null)
            ) {
              chosenStation = station
              chosenRoom = room
              placed = true
              break
            }
          }
        if (placed == true) break
      }

      if (chosenRoom == '')
        print(
          'COMPLETELY UNPLACED.  NEed passers for unloading, alley 1...',
          npc
        )
      placed = true
    }
  }
  // prettier-ignore
  // print( 'fillStationAttempt::: ///utils/ai:: ||| chosenRoom:', chosenRoom, '| chosenStation:', chosenStation, '| npc: ', npc )
  if (roomPlaceCount[chosenRoom] != null) {
    roomPlaceCount[chosenRoom].occupants += 1
  } else {
    roomPlaceCount[chosenRoom] = {
      occupants: 1,
      clyde: 0,
      pinky: 0,
      blinky: 0,
      inky: 0,
    }
  }

  return { chosenRoom, chosenStation }
}
/**
 * @param target target: room npc wants to get to
 * @param npc current: room npc is in
 * @returns array of room strings
 */
export function set_room_priority(
  target: { x: number; y: number },
  npc: {
    matrix: { x: number; y: number }
    home: { x: number; y: number }
    clearance: number
  }
): string[] {
  const room_list: string[] = []
  const delayPriority: string[] = []

  if (target.y > npc.matrix.y) {
    //if target above go one room up/north
    const room = RoomsInitLayout[npc.matrix.y + 1][npc.matrix.x]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 5
      ? delayPriority.push(room)
      : room_list.push(room)
  } else if (target.y < npc.matrix.y) {
    //one south
    const room = RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 5
      ? delayPriority.push(room)
      : room_list.push(room)
  }
  if (target.x < npc.matrix.x) {
    // one left/west
    const room = RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 5
      ? delayPriority.push(room)
      : room_list.push(room)
  } else if (target.x > npc.matrix.x) {
    //one east
    const room = RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 5
      ? delayPriority.push(room)
      : room_list.push(room)
  }
  //what about EQUALS TO?
  shuffle(room_list)
  const room = RoomsInitLayout[npc.matrix.y][npc.matrix.x]
  roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 3
    ? delayPriority.push(room)
    : room_list.push(room)

  if (
    target.y >= npc.matrix.y &&
    npc.matrix.y - 1 >= 0 &&
    RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x] != null
  ) {
    const room = RoomsInitLayout[npc.matrix.y - 1][npc.matrix.x]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 4
      ? delayPriority.push(room)
      : room_list.push(room)
  }
  if (
    target.x >= npc.matrix.x &&
    RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1] != null
  ) {
    const room = RoomsInitLayout[npc.matrix.y][npc.matrix.x - 1]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 4
      ? delayPriority.push(room)
      : room_list.push(room)
  }
  if (
    target.y <= npc.matrix.y &&
    //npc.matrix.y < 6 &&
    RoomsInitLayout[npc.matrix.y + 1] != null
  ) {
    const room = RoomsInitLayout[npc.matrix.y + 1][npc.matrix.x]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 4
      ? delayPriority.push(room)
      : room_list.push(room)
  }
  if (
    target.x <= npc.matrix.x &&
    RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1] != null
  ) {
    const room = RoomsInitLayout[npc.matrix.y][npc.matrix.x + 1]
    roomPlaceCount[room] != null && roomPlaceCount[room].occupants > 4
      ? delayPriority.push(room)
      : room_list.push(room)
  }

  delayPriority.push(RoomsInitLayout[npc.home.y][npc.home.x])

  const flatArr: string[] = [...new Set([...room_list, ...delayPriority])]
  const sortedArr = []

  for (let i = flatArr.length; i-- !== 0; ) {
    RoomsInitState[flatArr[i]].clearance > npc.clearance
      ? sortedArr.push(flatArr[i])
      : sortedArr.unshift(flatArr[i])
  }
  //prettier-ignore
  //for (let i = 1; i <= sortedArr.length; i++) {print(i,'filtered:',sortedArr[i - 1],'from: ',RoomsInitLayout[npc.matrix.y][npc.matrix.x],'target:',RoomsInitLayout[target.y][target.x])}
  return sortedArr
}
export function set_npc_target(
  direction: Direction,
  n: {
    turnPriority: number
    aiPath: string
    matrix: { x: number; y: number }
    target: { x: number; y: number }
    home: { x: number; y: number }
  }
) {
  let target = { x: 0, y: 0 }
  const rndm = Math.random()
  if (rndm < 0.2 || (n.turnPriority > 25 && n.turnPriority < 90)) {
    target = direction.center
  } else if (n.aiPath == 'pinky') {
    //always targets 0 to 2 rooms infront of player /33% +1 left or right?
    target = rndm > 0.2 ? direction.front : direction.back
  } else if (n.aiPath == 'blinky') {
    //always targets 1 room behind player unless too far
    const distance = math.abs(n.matrix.x - n.home.x + (n.matrix.y - n.home.y))
    print('BLINKYDISTANCE:::', distance)
    if (distance > 2) {
      target = n.home
    } else {
      target = direction.back
    }
  } else if (n.aiPath == 'inky') {
    //1/3 check to see if you 1: too close, go home or 2: 50/50 left/right 50/50 +1 front
    let distance = 0
    if (rndm < 0.3) {
      distance = math.abs(
        n.matrix.x - direction.center.x + (n.matrix.y - direction.center.y)
      )
      print('IIIIIIINKYDISTANCE:::', distance)
    } else {
      distance = 9
    }
    if (distance < 1) {
      target = n.home
    } else if (rndm < 0.5) {
      target = direction.right
    } else {
      target = direction.left
    }
  } else if (n.aiPath == 'clyde') {
    const distance = n.matrix.x - n.target.x + (n.matrix.y - direction.center.y)
    //random front, back, left, right unless too close and fail 50/50 check
    print('CLYDEDISTANCE:::', distance)

    if (distance > -2 && distance < 2 && rndm > 0.5) {
      target = n.home
    } else {
      const dirsRO = [
        'center',
        'front',
        'back',
        'left',
        'right',
        'back',
      ] as const
      const dirs = shuffle([...dirsRO])
      const kd: keyof Direction = dirs[0]
      target = direction[kd]
    }
  }
  //limit target to map layout grid
  if (target.x < 0 || target.x > 4) {
    target.x = rndm < 0.5 ? 4 : 0
  }
  if (target.y < 0 || target.y > 5) {
    target.y = Math.random() < 0.5 ? 5 : 0
  }

  return target
}
