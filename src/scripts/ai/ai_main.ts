import { aid_check } from './ai_checks'
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

//npcs.all[rooms.all.reception.stations.guest].hp = 0
//npcs.all[rooms.all.grounds.stations.worker1].hp = 0

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

export function aiActions() {
  //release_occupants()

  //clearance_checks()
  aid_check()

  reception_checks()
  customs_checks()
  baggage_checks()
}
