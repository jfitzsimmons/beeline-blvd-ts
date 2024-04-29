import { Actor } from '../../../types/state'

const { rooms, npcs } = globalThis.game.world
import { take_check, steal_check, take_or_stash } from '../ai_checks'

function steal_stash_checks() {
  let victim = null
  let thief = null
  let actor: Actor
  let loot: string[] = []
  let attendant = npcs.all[rooms.all.reception.stations.desk]
  //print("rooms.all.reception.stations.guest",rooms.all.reception.stations.guest)
  if (rooms.all.reception.stations.guest != '') {
    victim = npcs.all[rooms.all.reception.stations.guest]
    //print("victim.labelname",victim.labelname)

    loot = victim.inventory
    actor = rooms.all.reception.actors.drawer
    if (actor.inventory.length > 0 && rooms.all.reception.stations.desk == '') {
      take_check(victim, actor)
    } else if (actor.inventory.length > 0) {
      steal_check(victim, attendant, actor.inventory)
    }
  }

  if (rooms.all.reception.stations.loiter4 != '') {
    thief = npcs.all[rooms.all.reception.stations.loiter4]
  }
  if (
    victim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    steal_check(thief, victim, loot)
  }
  if (rooms.all.reception.stations.desk != '') {
    actor = rooms.all.reception.actors.drawer
    take_or_stash(attendant, actor)
  }
  if (rooms.all.reception.stations.patrol != '') {
    attendant = npcs.all[rooms.all.reception.stations.patrol]
    actor = rooms.all.reception.actors.vase2
    take_or_stash(attendant, actor)
  }
  if (rooms.all.reception.stations.loiter2 != '') {
    attendant = npcs.all[rooms.all.reception.stations.loiter2]
    actor = rooms.all.reception.actors.vase
    take_or_stash(attendant, actor)
  }
}

export function reception_checks() {
  steal_stash_checks
}
