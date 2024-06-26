import { shuffle } from '../../utils/utils'

const { rooms, npcs } = globalThis.game.world
import { steal_check, take_or_stash } from '../ai_checks'

function steal_stash_checks() {
  const loot =
    math.random() > 0.5
      ? rooms.all.baggage.actors.luggage_1
      : rooms.all.baggage.actors.luggage_2
  const [suspect, victim] = shuffle([
    npcs.all[rooms.all.baggage.stations.assistant],
    npcs.all[rooms.all.baggage.stations.browse],
  ])
  if (
    suspect != null &&
    victim != null &&
    loot.inventory.length > 0 &&
    suspect.cooldown <= 0
  ) {
    steal_check(suspect, victim, loot.inventory)
  } else if (suspect != null) {
    take_or_stash(suspect, loot)
  }
}

export function baggage_checks() {
  steal_stash_checks
}
