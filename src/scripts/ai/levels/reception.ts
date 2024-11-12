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

function steal_stash_checks(_this: RoomState) {
  let victim = null
  let thief = null
  let actor: Actor
  let loot: string[] = []
  let attendant =
    _this.stations.desk === ''
      ? ''
      : _this.parent.returnNpc(_this.stations.desk)
  print('_this.stations.guest', _this.stations.guest)
  if (cicadaModulus() && _this.stations.guest != '') {
    victim = _this.parent.returnNpc(_this.stations.guest)
    print('victim.name', victim.name)

    loot = victim.inventory
    actor = _this.actors.drawer
    if ((actor.inventory.length > 0, typeof attendant !== 'string')) {
      npcStealCheck(victim, attendant, actor.inventory)
    } else if (actor.inventory.length > 0) {
      take_check(victim, actor)
    }
  }

  if (_this.stations.loiter4 != '') {
    thief = _this.parent.returnNpc(_this.stations.loiter4)
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
    actor = _this.actors.drawer
    take_or_stash(attendant, actor)
  }
  if (cicadaModulus() && _this.stations.patrol != '') {
    attendant = _this.parent.returnNpc(_this.stations.patrol)
    actor = _this.actors.vase2
    take_or_stash(attendant, actor)
  }
  if (cicadaModulus() && _this.stations.loiter2 != '') {
    attendant = _this.parent.returnNpc(_this.stations.loiter2)
    actor = _this.actors.vase
    take_or_stash(attendant, actor)
  }
}

export function reception_checks(this: RoomState) {
  steal_stash_checks(this)
}
