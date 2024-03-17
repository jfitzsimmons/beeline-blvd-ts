/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

//const reception = require('../../main.systems.ai.levels.reception')
//const utils = require('main.utils.utils')
import { shuffle } from '../utils/utils'
import { seen_check, confrontation_check } from './ai_checks'
//const checks = require('../../main.utils.checks')
import { Direction } from '../../types/ai'
import { Prisoners } from '../../types/state'
import { remove_effects } from '../systems/effectsystem'
import { reception_checks } from './levels/reception'

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

function attempt_to_fill_station(room_list: string[], npc: string) {
  let placed = false
  //const room = ''
  //const misses = {}
  const current = npcs.all[npc].matrix

  //loop through priority room_list
  while (placed == false) {
    room_list.forEach((room: string) => {
      const shuffled_stations: [string, string][] = shuffle(
        Object.entries(rooms.all[room].stations)
      )

      //  let ks: keyof typeof shuffled_stations
      for (const ks of shuffled_stations) {
        const station = ks[1]

        if (station == '' && rooms.roles[ks[0]].includes(npcs.all[npc].clan)) {
          //loop thru room stations see if empty or has correct role
          print(
            npc,
            ',went to ,',
            room,
            ks,
            ',from,',
            rooms.layout[current.y][current.x],
            ',using,',
            npcs.all[npc].ai_path,
            ',TURNS,',
            npcs.all[npc].turns_since_encounter
          )
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
          break
        }
      }
      //  if (placed == true) break
    })
    // fallback stations
    if (placed == false) {
      // testjpf thought of idea to have a "non_placer" npc in each room.
      // could have some dialog about being stranded. having to wait.
      if (
        room_list.includes('admin1') &&
        rooms.fallbacks.stations['admin1_passer'] == '' &&
        rooms.layout[current.y][current.x] != 'admin1'
      ) {
        print(npc, 'passer A')
        rooms.fallbacks.stations['admin1_passer'] = npc
        npcs.all[npc].matrix = rooms.all['admin1'].matrix
      } else if (
        room_list.includes('security') &&
        rooms.fallbacks.stations['admin1_passer'] == '' &&
        rooms.layout[current.y][current.x] != 'security'
      ) {
        print(npc, 'passer S')
        rooms.fallbacks.stations['security_passer'] = npc
        npcs.all[npc].matrix = rooms.all['security'].matrix
      } else if (
        room_list.includes('grounds') &&
        rooms.fallbacks.stations['grounds_unplaced'] == ''
      ) {
        print(npc, 'grounds_unplaced')
        rooms.fallbacks.stations['grounds_unplaced'] = npc
        npcs.all[npc].matrix = rooms.all['grounds'].matrix
      } else if (
        room_list.includes('reception') &&
        rooms.fallbacks.stations['reception_unplaced'] == ''
      ) {
        print(npc, 'recpt_unplaced')
        rooms.fallbacks.stations['reception_unplaced'] = npc
        npcs.all[npc].matrix = rooms.all['reception'].matrix
      } else {
        print(
          npc,
          'TESTJPF DID NOT PLACE AT ALL from: ',
          rooms.layout[current.y][current.x]
        )
      }
      placed = true
    }
  }
}
//target: room npc wants to get to
//current: room npc is in
function set_room_priority(
  target: { x: number; y: number },
  npc: string
): string[] {
  const room_list: (string | null)[] = []
  const current = npcs.all[npc].matrix
  print(npc, target.x, target.y, 'target.x target.y')
  //get list of possible rooms NPC could go to next in order to get to target
  print(current.x, current.y, 'current.x current.y')
  print('curr room', rooms.layout[current.y][current.x])
  //print(rooms.layout[current.y + 1][current.x])

  //testjpf
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
  // room_list = room_list.filter((r) => r !== null
  const filteredArray: string[] = room_list.filter(
    (s): s is string => s != null
  )
  return filteredArray //.filter((r) => r !== null)
}
function set_npc_target(direction: Direction, n: string) {
  const npc = npcs.all[n]
  let target = { x: 0, y: 0 }
  if (npc.turns_since_encounter > 20) {
    target = player.matrix
  } else if (npc.ai_path == 'pinky') {
    //always targets 1 to 3 rooms infront of player
    target = direction.front
  } else if (npc.ai_path == 'blinky') {
    //always targets 1 room behind of player
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
    } else {
      if (math.random() < 0.5) {
        target = direction.right
      } else {
        target = direction.left
      }
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
export function assign_nearby_rooms(enter: { x: number; y: number }) {
  const exit = player.matrix
  let direction = {
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  }
  //get directions based on way exit is facing
  if (exit.x > enter.x) {
    direction = {
      front: { x: enter.x - math.random(0, 2), y: enter.y },
      back: { x: enter.x + 2, y: enter.y },
      left: { x: enter.x, y: enter.y + 1 },
      right: { x: enter.x, y: enter.y - 1 },
    }
  } else if (exit.y < enter.y) {
    direction = {
      front: { x: enter.x, y: enter.y + math.random(0, 2) },
      back: { x: enter.x, y: enter.y - 2 },
      left: { x: enter.x + 1, y: enter.y },
      right: { x: enter.x - 1, y: enter.y },
    }
  } else if (exit.y > enter.y) {
    direction = {
      front: { x: enter.x, y: enter.y - math.random(0, 2) },
      back: { x: enter.x, y: enter.y + 2 },
      left: { x: enter.x - 1, y: enter.y },
      right: { x: enter.x + 1, y: enter.y },
    }
  } else {
    direction = {
      front: { x: enter.x + math.random(0, 2), y: enter.y },
      back: { x: enter.x - 2, y: enter.y },
      left: { x: enter.x, y: enter.y - 1 },
      right: { x: enter.x, y: enter.y + 1 },
    }
  }
  return direction
}
function release_prisoners(d: Direction) {
  const prisoners: Prisoners = rooms.all.security.prisoners!
  let station: keyof typeof prisoners
  for (station in prisoners) {
    const prisoner = prisoners[station]
    if (prisoner != '' && npcs.all[prisoner].cooldown <= 0) {
      print('released from prison:', prisoner)
      npc_action_move(prisoner, d)
      rooms.all.security.prisoners![station] = ''
    }
  }
}

// testjpf naming conventions start getting vague
function ai_actions(direction: Direction) {
  release_prisoners(direction)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  reception_checks()
}
export function npc_action_move(n: string, d: Direction) {
  const npc = npcs.all[n]
  const target = set_npc_target(d, n)
  const room_list: string[] = set_room_priority(target, n)
  attempt_to_fill_station(room_list, n)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  remove_effects(npc)
  if (npc.cooldown > 0) npc.cooldown = npc.cooldown - 1
}

// testjpf So far this is just run on init
export function place_npcs() {
  // NPC with longest since encounter with p (Randomized on init)

  npcs.sort_npcs_by_encounter()

  //table.sort(npcs.order, function(a, b) return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter end)
  npcs.order.forEach((n: string) => {
    const npc = npcs.all[n]
    let placed = false
    //tries to place NPC at grounds - level 1

    const shuffled_stations: [string, string][] = shuffle(
      Object.entries(rooms.all.grounds.stations)
    )

    //  let ks: keyof typeof shuffled_stations
    for (const ks of shuffled_stations) {
      const station = ks[1]
      // const station = shuffled_stations[ks]

      if (station == '' && rooms.roles[ks[0]].includes(npc.clan)) {
        rooms.all.grounds.stations[ks[0]] = npc.labelname
        npc.matrix = rooms.all.grounds.matrix
        npc.currentstation = ks[0]
        print('GROUNDS::: ', npc.labelname, 'placed in', ks)
        placed = true
        break
      }
    }
    if (placed == false) {
      for (const p of initial_places) {
        const shuffled_stations: [string, string][] = shuffle(
          Object.entries(rooms.all[p].stations)
        )

        //  let ks: keyof typeof shuffled_stations
        for (const ks of shuffled_stations) {
          const station = ks[1]
          // const station = shuffled_stations[ks]

          if (station == '' && rooms.roles[ks[0]].includes(npc.clan)) {
            rooms.all[p].stations[ks[0]] = npc.labelname
            npc.matrix = rooms.all[p].matrix
            npc.currentstation = ks[0]
            print('RANDOM::: ', npc.labelname, 'placed in', ks[0], 'ROOM', p)
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
}
export function ai_turn(enter: string) {
  const direction: Direction = assign_nearby_rooms(rooms.all[enter].matrix)
  // NPC gone longest since encountering player moves first
  npcs.sort_npcs_by_encounter()
  /**npcs.order.sort(function(a:string,b:string) { 
		return npcs.all[a].turns_since_encounter > npcs.all[b].turns_since_encounter; 
	});**/

  npcs.order.forEach((n: string) => {
    npc_action_move(n, direction)
  })

  ai_actions(direction)
}
export function witness(w: string) {
  const suspect = player.state
  const watcher = npcs.all[w]
  const consequence = {
    confront: false,
    type: 'neutral',
  }

  // is an NPC watching?
  if (
    watcher != null &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    seen_check(suspect.skills, watcher.skills) == true
  ) {
    // should NPC confront suspect?
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (confrontation_check(suspect, watcher) == true) {
      consequence.confront = true
      consequence.type = 'confront'
    } else {
      consequence.type = tasks.consolation_checks(
        watcher.binaries,
        watcher.skills
      )
    }
    if (consequence.confront == false && consequence.type != 'neutral') {
      tasks.caution_builder(watcher, consequence.type, 'player', 'theft')
    } else {
      print('player seen but not confronted by', w)
    }
  } else {
    print('No one is Watching')
  }
  return consequence
}
