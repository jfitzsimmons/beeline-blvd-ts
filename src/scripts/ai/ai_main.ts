import { aid_check, clearance_checks } from './ai_checks'
import { baggage_checks } from './levels/baggage'
import { customs_checks } from './levels/customs'
import { reception_checks } from './levels/reception'

// could this be purely functional utility?

/*
function release_occupants() {
  const prisoners: Occupants = rooms.all.security.occupants!
  let station: keyof typeof prisoners
  for (station in prisoners) {
    const prisoner = prisoners[station]
    if (prisoner != '' && npcs.all[prisoner].cooldown <= 0) {
      npcs.all[prisoner].fsm.setState('turn')
      //npc_action_move(prisoner, d)
     // rooms.all.security.occupants![station] = ''
    }
  }
}
 */

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
tasks.task_builder(
  npcs.all['security004'],
  'questioning',
  rooms.all.grounds.stations.assistant,
  'testing'
)
*/
//}

export function aiActions() {
  //release_occupants()

  clearance_checks()
  aid_check()

  reception_checks()
  customs_checks()
  baggage_checks()
}
