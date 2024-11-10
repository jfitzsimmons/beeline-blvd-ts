import { Direction } from '../../types/ai'
//import { Traits } from '../../types/state'
//import { Effect } from '../../types/tasks'
import { RoomsInitRoles, RoomsInitLayout } from '../states/inits/roomsInitState'
import { shuffle } from './utils'

const count: { [key: string]: number } = {}
const unplacedcount: { [key: string]: number } = {}
export function attempt_to_fillStation(
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
  let chosenRoom = ''
  let chosenStation = ''

  while (placed == false) {
    //    room_list.forEach((room: string) => {
    for (const room of room_list) {
      const shuffledStations: [string, string][] = shuffle(
        Object.entries(stationMap[room])
      )
      for (const ks of shuffledStations) {
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
          //npcs.all[npc].exitRoom = RoomsInitLayout[current.y][current.x]!
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
  //print('FILLSTATIONEND:::', chosenRoom, chosenStation, npc)
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
    target: { x: number; y: number }
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
/**
export function add_effects_bonus(a: Traits, e: Effect) {
  a[e.fx.type][e.fx.stat] = a[e.fx.type][e.fx.stat] + e.fx.adjustment
}
  */
