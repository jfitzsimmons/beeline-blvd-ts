import { shuffle, surrounding_room_matrix } from '../utils/utils'
import { aid_check, clearance_checks } from './ai_checks'
import { Direction } from '../../types/ai'
import { Occupants } from '../../types/state'
import { remove_effects } from '../systems/effectsystem'
import { reception_checks } from './levels/reception'
import { customs_checks } from './levels/customs'
import { baggage_checks } from './levels/baggage'
import {
  doctor_ai_turn,
  freeze_injured_npc,
  injured_npcs,
} from '../systems/emergencysystem'
//import { thief_consolation_checks } from '../systems/tasksystem'

const { tasks, rooms, npcs, player } = globalThis.game.world
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
]
const count: { [key: string]: number } = {}
const unplacedcount: { [key: string]: number } = {}
function attempt_to_fill_station(room_list: string[], npc: string) {
  //testjpf debug number of roomlist occurences
  room_list.forEach((element) => {
    if (count[element] != null) {
      count[element] += 1
    } else {
      count[element] = 1
    }
  })

  let placed = false

  const current = npcs.all[npc].matrix

  //loop through priority room_list
  while (placed == false) {
    //    room_list.forEach((room: string) => {
    for (const room of room_list) {
      const shuffled_stations: [string, string][] = shuffle(
        Object.entries(rooms.all[room].stations)
      )

      //  let ks: keyof typeof shuffled_stations
      for (const ks of shuffled_stations) {
        const station = ks[1]
        if (station == '' && rooms.roles[ks[0]].includes(npcs.all[npc].clan)) {
          //loop thru room stations see if empty or has correct role
          /** 
          print(
            npc,
            ',went to ,',
            room,
            ks[0],
            ',from,',
            rooms.layout[current.y][current.x],
            ',using,',
            npcs.all[npc].ai_path,
            ',TURNS,',
            npcs.all[npc].turns_since_encounter
          )
          */
          //fill station
          npcs.all[npc].exitroom = rooms.layout[current.y][current.x]!
          npcs.all[npc].currentroom = room
          rooms.all[room].stations[ks[0]] = npc
          npcs.all[npc].matrix = rooms.all[room].matrix
          npcs.all[npc].currentstation = ks[0]
          placed = true
          if (room != player.currentroom) {
            npcs.all[npc].turns_since_encounter =
              npcs.all[npc].turns_since_encounter + 1
          } else {
            npcs.all[npc].turns_since_encounter = 0
          }
          return
        }
      }
    }
    // fallback stations
    if (placed == false) {
      if (
        room_list.includes('admin1') &&
        rooms.fallbacks.stations['admin1_passer'] == '' &&
        rooms.layout[current.y][current.x] != 'admin1'
      ) {
        rooms.fallbacks.stations['admin1_passer'] = npc
        npcs.all[npc].matrix = rooms.all['admin1'].matrix
      } else if (
        room_list.includes('security') &&
        rooms.fallbacks.stations['security_passer'] == '' &&
        rooms.layout[current.y][current.x] != 'security'
      ) {
        rooms.fallbacks.stations['security_passer'] = npc
        npcs.all[npc].matrix = rooms.all['security'].matrix
      } else if (
        room_list.includes('security') &&
        rooms.fallbacks.stations['security_outside1'] == ''
      ) {
        rooms.fallbacks.stations['security_outside1'] = npc
        npcs.all[npc].matrix = rooms.all['security'].matrix
      } else if (
        room_list.includes('grounds') &&
        rooms.fallbacks.stations['grounds_unplaced'] == ''
      ) {
        rooms.fallbacks.stations['grounds_unplaced'] = npc
        npcs.all[npc].matrix = rooms.all['grounds'].matrix
      } else if (
        room_list.includes('viplobby') &&
        rooms.fallbacks.stations['viplobby_outside1'] == ''
      ) {
        rooms.fallbacks.stations['viplobby_outside1'] = npc
        npcs.all[npc].matrix = rooms.all['viplobby'].matrix
      } else if (
        room_list.includes('reception') &&
        rooms.fallbacks.stations['reception_unplaced'] == ''
      ) {
        rooms.fallbacks.stations['reception_unplaced'] = npc
        npcs.all[npc].matrix = rooms.all['reception'].matrix
      } else if (
        room_list.includes('infirmary') &&
        rooms.fallbacks.stations['infirmary_outside1'] == ''
      ) {
        rooms.fallbacks.stations['infirmary_outside1'] = npc
        npcs.all[npc].matrix = rooms.all['infirmary'].matrix
      } else if (
        room_list.includes('dorms') &&
        rooms.fallbacks.stations['dorms_outside1'] == ''
      ) {
        rooms.fallbacks.stations['dorms_outside1'] = npc
        npcs.all[npc].matrix = rooms.all['dorms'].matrix
      } else {
        if (unplacedcount[npc] != null) {
          unplacedcount[npc] += 1
        } else {
          unplacedcount[npc] = 1
        }
        if (unplacedcount[rooms.layout[current.y][current.x]!] != null) {
          unplacedcount[rooms.layout[current.y][current.x]!] += 1
        } else {
          unplacedcount[rooms.layout[current.y][current.x]!] = 1
        }
      }
      placed = true
    }
  }
}
/**
 * @param target target: room npc wants to get to
 * @param npc current: room npc is in
 * @returns array of room strings
 */
function set_room_priority(
  target: { x: number; y: number },
  npc: string
): string[] {
  const room_list: (string | null)[] = []
  const current = npcs.all[npc].matrix
  //get list of possible rooms NPC could go to next in order to get to target
  if (target.y > current.y) {
    room_list.push(rooms.layout[current.y + 1][current.x])
  }
  if (target.x < current.x) {
    room_list.push(rooms.layout[current.y][current.x - 1])
  }
  if (target.y < current.y) {
    room_list.push(rooms.layout[current.y - 1][current.x])
  }
  if (target.x > current.x) {
    room_list.push(rooms.layout[current.y][current.x + 1])
  }

  room_list.push(rooms.layout[current.y][current.x])

  if (
    target.y > current.y &&
    current.y - 1 >= 0 &&
    rooms.layout[current.y - 1][current.x] != null
  ) {
    room_list.push(rooms.layout[current.y - 1][current.x])
  }
  if (target.x > current.x && rooms.layout[current.y][current.x - 1] != null) {
    room_list.push(rooms.layout[current.y][current.x - 1])
  }
  if (
    target.y <= current.y &&
    current.y < 6 &&
    rooms.layout[current.y + 1] != null
  ) {
    room_list.push(rooms.layout[current.y + 1][current.x])
  }
  if (target.x <= current.x && rooms.layout[current.y][current.x + 1] != null) {
    room_list.push(rooms.layout[current.y][current.x + 1])
  }

  room_list.push(rooms.layout[npcs.all[npc].home.y][npcs.all[npc].home.x])
  const filteredArray: string[] = room_list.filter(
    (s): s is string => s != null
  )
  return filteredArray
}
function set_npc_target(direction: Direction, n: string) {
  const npc = npcs.all[n]
  let target = { x: 0, y: 0 }
  if (npc.turns_since_encounter > 20) {
    target = player.matrix
  } else if (npc.ai_path == 'pinky') {
    //always targets 0 to 2 rooms infront of player
    target = direction.front
  } else if (npc.ai_path == 'blinky') {
    //always targets 1 room behind player unless too far
    const distance = npc.matrix.x - npc.home.x + (npc.matrix.y - npc.home.y)
    if (distance < -5 || distance > 5) {
      target = npc.home
    } else {
      target = direction.back
    }
  } else if (npc.ai_path == 'inky') {
    //1/3 check to see if you 1: too far from home or 2: 50/50 left/right
    let distance = 0
    if (math.random() < 0.33) {
      distance =
        npc.matrix.x - player.matrix_x + (npc.matrix.y - player.matrix_y)
    } else {
      distance = 9
    }
    if (distance > -2 && distance < 2) {
      target = npc.home
    } else if (math.random() < 0.5) {
      target = direction.right
    } else {
      target = direction.left
    }
  } else if (npc.ai_path == 'clyde') {
    const distance =
      npc.matrix.x - player.matrix_x + (npc.matrix.y - player.matrix_y)
    //random front, back, left, right unless too close and fail 50/50 check
    if (distance > -2 && distance < 2 && math.random() > 0.5) {
      target = npc.home
    } else {
      const dirsRO = ['front', 'back', 'left', 'right'] as const
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
function release_occupants(d: Direction) {
  const prisoners: Occupants = rooms.all.security.occupants!
  let station: keyof typeof prisoners
  for (station in prisoners) {
    const prisoner = prisoners[station]
    if (prisoner != '' && npcs.all[prisoner].cooldown <= 0) {
      npc_action_move(prisoner, d)
      rooms.all.security.occupants![station] = ''
    }
  }
  const occupants: Occupants = rooms.all.infirmary.occupants!
  let bed: keyof typeof occupants
  for (bed in occupants) {
    const patient = occupants[bed]
    if (patient != '' && npcs.all[patient].cooldown <= 0) {
      npcs.all[patient].hp = 10
      npc_action_move(patient, d)
      rooms.all.infirmary.occupants![bed] = ''
    }
  }
}

function ai_actions(direction: Direction) {
  clearance_checks()
  aid_check(injured_npcs)
  release_occupants(direction)
  reception_checks()
  customs_checks()
  baggage_checks
}

export function npc_action_move(n: string, d: Direction) {
  const npc = npcs.all[n]
  const target = set_npc_target(d, n)
  const room_list: string[] = set_room_priority(target, n)
  attempt_to_fill_station(room_list, n)
  remove_effects(npc)
  if (npc.cooldown > 0) npc.cooldown = npc.cooldown - 1
}

export function place_npcs() {
  npcs.sort_npcs_by_encounter()

  npcs.order.forEach((n: string) => {
    const npc = npcs.all[n]
    let placed = false

    const shuffled_stations: [string, string][] = shuffle(
      Object.entries(rooms.all.grounds.stations)
    )

    for (const ks of shuffled_stations) {
      const station = ks[1]

      if (station == '' && rooms.roles[ks[0]].includes(npc.clan)) {
        rooms.all.grounds.stations[ks[0]] = npc.labelname
        npc.matrix = rooms.all.grounds.matrix
        npc.currentstation = ks[0]
        npc.currentroom = 'grounds'
        placed = true
        break
      }
    }
    if (placed == false) {
      for (const p of initial_places) {
        const shuffled_stations: [string, string][] = shuffle(
          Object.entries(rooms.all[p].stations)
        )

        for (const ks of shuffled_stations) {
          const station = ks[1]

          if (station == '' && rooms.roles[ks[0]].includes(npc.clan)) {
            rooms.all[p].stations[ks[0]] = npc.labelname
            npc.matrix = rooms.all[p].matrix
            npc.currentstation = ks[0]
            npc.currentroom = p

            placed = true
            break
          }
        }
        if (placed == true) {
          break
        }
      }
    }
  })

  //TESTJPF  TEST SETTINGS:::
  tasks.caution_builder(
    npcs.all['security004'],
    'questioning',
    rooms.all.grounds.stations.assistant,
    'testing'
  )
  npcs.all[rooms.all.reception.stations.guard].hp = 0
  npcs.all[rooms.all.grounds.stations.worker1].hp = 0

  tasks.append_caution({
    label: 'quest',
    npc: npcs.all[rooms.all.grounds.stations.worker1].labelname,
    authority: 'player',
    time: 100,
    suspect: npcs.all[rooms.all.grounds.stations.worker1].labelname,
    reason: 'quest',
    type: 'helpthatman',
  })
}
export function ai_turn() {
  //count = {}
  rooms.clear_stations()

  const patients = Object.values(rooms.all.infirmary.occupants!).filter(
    (p) => p != ''
  )
  const immobile: string[] = [
    ...Object.values(rooms.all.security.occupants!),
    ...patients,
    ...tasks.get_field_docs(),
  ]

  let targets: Direction = surrounding_room_matrix(
    rooms.all[player.exitroom].matrix,
    player.matrix
  )

  npcs.sort_npcs_by_encounter()

  for (let i = npcs.order.length; i-- !== 0; ) {
    const npc = npcs.all[npcs.order[i]]
    if (npc.hp <= 0 && patients.includes(npc.labelname) == false) {
      freeze_injured_npc(npc)
    }
    if (npc.clan == 'doctors') {
      const [docTargets, docInOffice] = doctor_ai_turn(npc, targets)
      targets = docTargets
      if (docInOffice == true) immobile.push(npc.labelname)
    }
    if (immobile.includes(npc.labelname) == false && npc.hp > 0)
      npc_action_move(npc.labelname, targets)
  }

  ai_actions(targets)

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
}
