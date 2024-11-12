import { npcStealCheck, take_or_stash } from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
import { shuffle } from '../../utils/utils'

//const { rooms, npcs } = globalThis.game.world

function steal_stash_checks(_this: RoomState) {
  const loot =
    math.random() > 0.5 ? _this.actors.luggage_1 : _this.actors.luggage_2

  const [suspect, victim] = shuffle([
    _this.stations.assistan == ''
      ? null
      : _this.parent.returnNpc(_this.stations.assistant),
    _this.stations.browse == ''
      ? null
      : _this.parent.returnNpc(_this.stations.browse),
  ])
  if (
    suspect != null &&
    victim != null &&
    loot.inventory.length > 0 &&
    suspect.cooldown <= 0
  ) {
    npcStealCheck(suspect, victim, loot.inventory)
  } else if (suspect != null) {
    take_or_stash(suspect, loot)
  }
}

export function baggage_checks(this: RoomState) {
  steal_stash_checks(this)
}
