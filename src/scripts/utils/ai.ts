import { Direction } from '../../types/ai'
//import { Traits } from '../../types/state'
//import { Effect } from '../../types/tasks'
import {
  RoomsInitRoles,
  RoomsInitLayout,
  RoomsInitState,
} from '../states/inits/roomsInitState'
import { shuffle } from './utils'

// user defined type guard
/**
export function isNpc(a: ActorState | ActionProps): a is NpcState {
  return a.name !== 'player'
}
  */

const count: { [key: string]: number } = {}
const unplacedcount: { [key: string]: number } = {}
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
      if (placed == true) break
    }

    // fallback stations
    if (placed == false) {
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
  npc: { matrix: { x: number; y: number }; home: { x: number; y: number } }
): string[] {
  const room_list: (string | null)[] = []
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
    sincePlayerRoom: number
    aiPath: string
    matrix: { x: number; y: number }
    target: { x: number; y: number }
    home: { x: number; y: number }
  }
) {
  let target = { x: 0, y: 0 }
  if (n.sincePlayerRoom > 25) {
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
