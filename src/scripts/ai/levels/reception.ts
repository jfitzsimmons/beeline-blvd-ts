import { Actor } from '../../../types/state'
import {
  take_check,
  npcStealCheck,
  take_or_stash,
} from '../../states/inits/checksFuncs'
//import npcs from '../../states/npcs'
import RoomState from '../../states/room'
import { cicadaModulus } from '../../utils/utils'

//const { rooms, npcs } = globalThis.game.world
//import { take_check, npcStealCheck, take_or_stash } from '../ai_checks'

function steal_stash_checks(this: RoomState) {
  let victim = null
  let thief = null
  let actor: Actor
  let loot: string[] = []
  let attendant =
    this.stations.desk === '' ? '' : this.parent.returnNpc(this.stations.desk)
  // print('this.stations.guest', this.stations.guest)
  if (cicadaModulus() && this.stations.guest != '') {
    victim = this.parent.returnNpc(this.stations.guest)
    //  print('victim.name', victim.name)

    loot = victim.inventory
    actor = this.actors.drawer
    if (actor.inventory.length > 0 && typeof attendant !== 'string') {
      npcStealCheck(victim, attendant, actor.inventory)
    } else if (actor.inventory.length > 0) {
      take_check(victim, actor)
    }
  }

  if (this.stations.loiter4 != '') {
    thief = this.parent.returnNpc(this.stations.loiter4)
  }
  if (
    cicadaModulus() &&
    victim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    npcStealCheck(thief, victim, loot)
  }
  if (cicadaModulus() && typeof attendant !== 'string') {
    actor = this.actors.drawer
    take_or_stash(attendant, actor)
  }
  if (cicadaModulus() && this.stations.patrol != '') {
    attendant = this.parent.returnNpc(this.stations.patrol)
    actor = this.actors.vase2
    take_or_stash(attendant, actor)
  }
  if (cicadaModulus() && this.stations.loiter2 != '') {
    attendant = this.parent.returnNpc(this.stations.loiter2)
    actor = this.actors.vase
    take_or_stash(attendant, actor)
  }
}

export function reception_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
