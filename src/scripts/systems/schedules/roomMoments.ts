import {
  take_check,
  npcStealCheck,
  take_or_stash,
} from '../../systems/npcs/crimeChecks'
//import RoomState from '../../states/room'
import { cicadaModulus, shuffle } from '../../utils/utils'
import { Storage } from '../../../types/state'

const { behaviors, stations, npcs, inventory } = globalThis.game.world

function deskWaitingNpcs(ids: string[]) {
  let thiefVictim = null
  let thief = null
  let actor: Storage
  let loot: string[] = []
  let attendant = npcs.all[ids[0]]
  // stations.all.reception_desk.occupant === '' ? null : npcs.all[stations.all.admin1_desk)
  if (cicadaModulus() && ids[2] != '') {
    thiefVictim = npcs.all[ids[2]]

    loot = thiefVictim.inventory
    actor = inventory.all[ids[1]]
    if (actor.inventory.length > 0 && attendant !== null) {
      const witness: string | null = npcStealCheck(
        thiefVictim.name,
        attendant.name,
        actor.id
      )
      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${attendant.name}_${thiefVictim.name}`,
        })
      }
    } else if (actor.inventory.length > 0) {
      take_check(thiefVictim.name, actor.id)
    }
  }

  if (ids[3] != '') thief = npcs.all[ids[3]]

  if (
    thiefVictim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    const witness: string | null = npcStealCheck(thief.name, thiefVictim.name)
    if (witness == 'witness') {
      behaviors.addBehavior({
        id: `suspecting_${thiefVictim.name}_${thief.name}`,
      })
    }
  }
  if (cicadaModulus() && attendant !== null) {
    // actor = inventory.all.room_reception_drawer
    take_or_stash(attendant.name, ids[1])
  }
}
//testjpf this func may be overkill
function randomOneOnOneOrActor(ids: string[]) {
  const loot = inventory.all[ids[2]]

  const [suspect, victim] = shuffle([
    ids[0] == '' ? null : npcs.all[ids[0]],
    ids[1] == '' ? null : npcs.all[ids[1]],
  ])
  if (
    suspect != null &&
    victim != null &&
    loot.inventory.length > 0 &&
    suspect.cooldown < 1
  ) {
    const witness = npcStealCheck(suspect.name, victim.name, loot.id)
    if (witness == 'witness') {
      behaviors.addBehavior({
        id: `suspecting_${victim.name}_${suspect.name}`,
      })
    }
  } else if (suspect != null) {
    take_or_stash(suspect.name, loot.id)
  }
}
export function groundsStealStash1() {
  const actor: Storage = inventory.all.room_grounds_cargo
  let [suspect, watcher] = shuffle([
    stations.all.grounds_assistant.occupant == ''
      ? null
      : npcs.all[stations.all.grounds_assistant.occupant],
    stations.all.grounds_aid.occupant == ''
      ? null
      : npcs.all[stations.all.grounds_aid.occupant],
  ])

  if (
    suspect != null &&
    watcher != null &&
    math.random() > suspect.cooldown * 0.1
  ) {
    const lootSwitch =
      math.random() > 0.5
        ? actor.inventory.length > 0 && actor
        : watcher.inventory.length > 0

    if (lootSwitch !== false) {
      const witness =
        lootSwitch === true
          ? npcStealCheck(suspect.name, watcher.name)
          : npcStealCheck(suspect.name, watcher.name, actor.id)

      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${watcher.name}_${suspect.name}`,
        })
      }
    }
  } else if (cicadaModulus() && suspect != null && actor.inventory.length > 0) {
    take_or_stash(suspect.name, actor.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;[suspect, watcher] = shuffle([
    stations.all.grounds_assistant.occupant == ''
      ? null
      : npcs.all[stations.all.grounds_assistant.occupant],
    stations.all.grounds_loiter1.occupant == ''
      ? null
      : npcs.all[stations.all.grounds_loiter1.occupant],
  ])
  if (
    suspect != null &&
    watcher != null &&
    suspect.cooldown < 1 //&&
    // watcher.inventory.length > 0
  ) {
    const witness = npcStealCheck(suspect.name, watcher.name)

    if (witness == 'witness') {
      behaviors.addBehavior({
        id: `suspecting_${watcher.name}_${suspect.name}`,
      })
    }
  }
}
export function receptionsStealStash1() {
  deskWaitingNpcs([
    stations.all.reception_desk.occupant,
    inventory.all.room_reception_drawer.id,
    stations.all.reception_guest.occupant,
    stations.all.reception_loiter4.occupant,
  ])
  ///////////////////

  if (cicadaModulus() && stations.all.reception_patrol.occupant != '') {
    let attendant = npcs.all[stations.all.reception_patrol.occupant]
    let actor = inventory.all.room_reception_vase2
    take_or_stash(attendant.name, actor.id)
  }
  if (cicadaModulus() && stations.all.reception_loiter2.occupant != '') {
    let attendant = npcs.all[stations.all.reception_loiter2.occupant]

    let actor = inventory.all.room_reception_vase
    take_or_stash(attendant.name, actor.id)
  }
}

export function infirmaryStealStash1() {
  deskWaitingNpcs([
    stations.all.infirmary_desk.occupant,
    inventory.all.room_infirmary_drawer.id,
    stations.all.infirmary_servants.occupant,
    stations.all.infirmary_loiter2.occupant,
  ])
  /////////////////

  let [suspect, watcher, third] = shuffle([
    stations.all.infirmary_loiter2.occupant == ''
      ? null
      : npcs.all[stations.all.infirmary_loiter2.occupant],
    stations.all.infirmary_servants2.occupant == ''
      ? null
      : npcs.all[stations.all.infirmary_servants2.occupant],
    stations.all.infirmary_loiter1.occupant == ''
      ? null
      : npcs.all[stations.all.infirmary_loiter1.occupant],
  ])

  if (suspect == null && third != null) {
    suspect = third
    third = null
  }
  if (watcher == null && third != null) watcher = third
  if (
    suspect != null &&
    watcher != null &&
    suspect.cooldown < 1 &&
    watcher.inventory.length > 0
  ) {
    const witness = npcStealCheck(suspect.name, watcher.name)

    if (witness == 'witness') {
      behaviors.addBehavior({
        id: `suspecting_${watcher.name}_${suspect.name}`,
      })
    }
  }
}

export function customsStealStash1() {
  let suspect = null
  // let thief = null
  let victim = null
  let actor: Storage
  let attendant = stations.all.customs_desk.occupant
  if (stations.all.customs_guest.occupant !== '') {
    suspect = npcs.all[stations.all.customs_guest.occupant]
    //print("victim.name",victim.name)
    actor = inventory.all.room_customs_drawer
    //loot = actor.inventory

    if (actor.inventory.length > 0 && attendant !== '') {
      const witness = npcStealCheck(suspect.name, attendant, actor.id)
      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${attendant}_${suspect.name}`,
        })
      }
    } else if (actor.inventory.length > 0) {
      take_or_stash(suspect.name, actor.id)
    }
  }

  if (
    stations.all.customs_loiter4.occupant != '' &&
    stations.all.customs_guard.occupant != ''
  ) {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[suspect, victim] = shuffle([
      npcs.all[stations.all.customs_loiter4.occupant],
      npcs.all[stations.all.customs_guard.occupant],
    ])
    if (suspect.cooldown <= 0) {
      const witness = npcStealCheck(suspect.name, victim.name)
      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${victim.name}_${suspect.name}`,
        })
      }
    }
  }

  if (attendant !== null) {
    actor = inventory.all.room_customs_locker
    take_or_stash(attendant, actor.id)
  }
  if (stations.all.customs_loiter3.occupant != '') {
    attendant = stations.all.customs_loiter3.occupant

    actor = inventory.all.room_customs_vase3
    take_or_stash(attendant, actor.id)
  }
}

export function baggageStealStash1() {
  randomOneOnOneOrActor([
    stations.all.baggage_assistant.occupant,
    stations.all.baggage_browse.occupant,
    math.random() > 0.5 ? 'room_baggage_luggage_1' : 'room_baggage_luggage_2',
  ])
}

export function admin1StealStash1() {
  // let thiefVictim = null
  //let thief = null
  const actor = inventory.all.room_admin1_locker
  //let loot: string[] = []
  const attendant =
    stations.all.admin1_desk.occupant === ''
      ? null
      : npcs.all[stations.all.admin1_desk.occupant]

  const [suspect, watcher] = shuffle([
    stations.all.admin1_monitor.occupant == ''
      ? null
      : npcs.all[stations.all.admin1_monitor.occupant],
    stations.all.admin1_boss.occupant == ''
      ? null
      : npcs.all[stations.all.admin1_boss.occupant],
  ])

  if (suspect != null && watcher != null && suspect.cooldown < 1) {
    const lootSwitch =
      math.random() > 0.5
        ? actor.inventory.length > 0 && actor
        : watcher.inventory.length > 0

    if (lootSwitch !== false) {
      const witness =
        lootSwitch === true
          ? npcStealCheck(suspect.name, watcher.name)
          : npcStealCheck(suspect.name, watcher.name, actor.id)

      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${watcher.name}_${suspect.name}`,
        })
      }
    }
  } else if (
    cicadaModulus() &&
    stations.all.admin1_patrol.occupant != '' &&
    actor.inventory.length > 0
  ) {
    const thief = npcs.all[stations.all.admin1_patrol.occupant]

    //loot = thiefVictim.inventory

    if (attendant !== null) {
      const witness: string | null = npcStealCheck(
        thief.name,
        attendant.name,
        actor.id
      )
      if (witness == 'witness') {
        behaviors.addBehavior({
          id: `suspecting_${attendant.name}_${thief.name}`,
        })
      }
    } else {
      take_check(thief.name, actor.id)
    }
  } else if (
    cicadaModulus() &&
    attendant !== null &&
    actor.inventory.length > 0
  ) {
    take_or_stash(attendant.name, actor.id)
  }
}
