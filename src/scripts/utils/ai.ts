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

const count: { [key: string]: number } = {}
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
  stationMap: { [key: string]: { [key: string]: string } }
): { chosenRoom: string; chosenStation: string } {
  //testjpf debug number of roomlist occurences
  room_list.forEach((element) => {
    if (count[element] != null) {
      count[element] += 1
    } else {
      count[element] = 1
    }
  })

  let placed = false
  let chosenRoom = ''
  let chosenStation = ''

  while (placed == false) {
    for (const room of room_list) {
      const shuffledStations: [string, string][] = shuffle(
        Object.entries(stationMap[room])
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
        //just make a kvp like {loading: ['loading_outside1', 'loading_passer']}
        print('AIROOM:::', room, npc)
        if (fallbackTable[room] !== null)
          for (const station of fallbackTable[room]) {
            print(
              'AREFALLBACKSWORKING?',
              station.slice(-6),
              RoomsInitLayout[matrix.y][matrix.x],
              stationMap.fallbacks[station]
            )
            if (
              (station.slice(-6) == 'passer' &&
                RoomsInitLayout[matrix.y][matrix.x] != room &&
                stationMap.fallbacks[station] !== null) ||
              (station.slice(-6) !== 'passer' &&
                stationMap.fallbacks[station] !== null)
            ) {
              chosenStation = station
              chosenRoom = room
              placed = true
              break
            }
            if (placed == true) break
          }
      }

      /** 
      if (
        room_list.includes('loading') &&
        stationMap.fallbacks['loading_outside1'] !== null
      ) {
        chosenStation = 'loading_outside1'
        chosenRoom = 'loading'
      } else if (
        room_list.includes('grounds') &&
        stationMap.fallbacks['grounds_unplaced'] !== null
      ) {
        chosenStation = 'grounds_unplaced'
        chosenRoom = 'grounds'
      } else if (
        room_list.includes('viplobby') &&
        stationMap.fallbacks['viplobby_outside1'] !== null
      ) {
        chosenStation = 'viplobby_outside1'
        chosenRoom = 'viplobby'
      } else if (
        room_list.includes('reception') &&
        stationMap.fallbacks['reception_unplaced'] !== null
      ) {
        chosenStation = 'reception_unplaced'
        chosenRoom = 'reception'
      } else if (
        room_list.includes('infirmary') &&
        stationMap.fallbacks['infirmary_outside1'] !== null
      ) {
        chosenStation = 'infirmary_outside1'
        chosenRoom = 'infirmary'
      } else if (
        room_list.includes('dorms') &&
        stationMap.fallbacks['dorms_outside1'] !== null
      ) {
        chosenStation = 'dorms_outside1'
        chosenRoom = 'dorms'
      } else if (
        room_list.includes('security') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'security' &&
        stationMap.fallbacks['security_passer'] !== null
      ) {
        chosenStation = 'security_passer'
        chosenRoom = 'security'
      } else if (
        room_list.includes('baggage') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'baggage' &&
        stationMap.fallbacks['baggage_passer'] !== null
      ) {
        chosenStation = 'baggage_passer'
        chosenRoom = 'baggage'
      } else if (
        room_list.includes('alley2') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'alley2' &&
        stationMap.fallbacks['alley2_passer'] !== null
      ) {
        chosenStation = 'alley2_passer'
        chosenRoom = 'alley2'
      } else if (
        room_list.includes('alley4') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'alley4' &&
        stationMap.fallbacks['alley4_passer'] !== null
      ) {
        chosenStation = 'alley4_passer'
        chosenRoom = 'alley4'
      } else if (
        room_list.includes('viplobby') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'viplobby' &&
        stationMap.fallbacks['viplobby_passer'] !== null
      ) {
        chosenStation = 'viplobby_passer'
        chosenRoom = 'viplobby'
      } else if (
        room_list.includes('admin1') &&
        RoomsInitLayout[matrix.y][matrix.x] != 'admin1' &&
        stationMap.fallbacks['admin1_passer'] !== null
      ) {
        chosenStation = 'admin1_passer'
        chosenRoom = 'admin1'
      } else if (
        room_list.includes('security') &&
        stationMap.fallbacks['security_outside1'] !== null
      ) {
        chosenStation = 'security_outside1'
        chosenRoom = 'security'
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
    **/
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

  shuffle(room_list).push(RoomsInitLayout[npc.matrix.y][npc.matrix.x])

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

  const filteredArray: string[] = [...new Set(room_list)].sort(function (a, b) {
    if (
      RoomsInitState[a].clearance > npc.clearance &&
      RoomsInitState[b].clearance <= npc.clearance
    )
      return 1
    if (
      RoomsInitState[b].clearance > npc.clearance &&
      RoomsInitState[a].clearance <= npc.clearance
    )
      return -1
    return 0
  })
  filteredArray.push(RoomsInitLayout[npc.home.y][npc.home.x])

  return filteredArray
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
  if (n.turnPriority > 25) {
    target = direction.center
  } else if (n.aiPath == 'pinky') {
    //always targets 0 to 2 rooms infront of player
    target = direction.front
  } else if (n.aiPath == 'blinky') {
    //always targets 1 room behind player unless too far
    const distance = n.matrix.x - n.home.x + (n.matrix.y - n.home.y)
    if (distance < -5 || distance > 5) {
      target = n.home
    } else {
      target = direction.back
    }
  } else if (n.aiPath == 'inky') {
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
  } else if (n.aiPath == 'clyde') {
    const distance = n.matrix.x - n.target.x + (n.matrix.y - direction.center.y)
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
  } else if (target.x > 4) {
    target.x = 4
  }

  if (target.y < 0) {
    target.y = 0
  } else if (target.y > 5) {
    target.y = 5
  }

  return target
}
