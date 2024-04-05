import { Actor } from '../../../types/state'
import { shuffle } from '../../utils/utils'

const { rooms, npcs } = globalThis.game.world
import { steal_check, take_or_stash } from '../ai_checks'

function steal_stash_checks() {
  let suspect = null
  // let thief = null
  let victim = null
  let actor: Actor
  let attendant = npcs.all[rooms.all.customs.stations.desk]
  //print("rooms.all.customs.stations.guest",rooms.all.customs.stations.guest)
  if (rooms.all.customs.stations.guest != '') {
    suspect = npcs.all[rooms.all.customs.stations.guest]
    //print("victim.labelname",victim.labelname)
    actor = rooms.all.customs.actors.desks
    //loot = actor.inventory
    if (actor.inventory.length > 0 && rooms.all.customs.stations.desk == '') {
      take_or_stash(suspect, actor)
    } else if (actor.inventory.length > 0) {
      steal_check(suspect, attendant, actor.inventory)
    }
  }

  if (
    rooms.all.customs.stations.loiter4 != '' &&
    rooms.all.customs.stations.guard != ''
  ) {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[suspect, victim] = shuffle([
      npcs.all[rooms.all.customs.stations.loiter4],
      npcs.all[rooms.all.customs.stations.guard],
    ])
    if (victim.inventory.length > 0 && suspect.cooldown <= 0)
      steal_check(suspect, victim, victim.inventory)
  }

  if (attendant != null) {
    actor = rooms.all.customs.actors.locker
    take_or_stash(attendant, actor)
  }
  if (rooms.all.customs.stations.loiter3 != '') {
    attendant = npcs.all[rooms.all.customs.stations.loiter3]
    actor = rooms.all.customs.actors.vase3
    take_or_stash(attendant, actor)
  }
}

export function customs_checks() {
  steal_stash_checks
}
