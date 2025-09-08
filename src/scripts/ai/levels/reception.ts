import {
  take_check,
  npcStealCheck,
  take_or_stash,
} from '../../systems/npcs/crimeChecks'
import RoomState from '../../states/room'
import { cicadaModulus } from '../../utils/utils'
import { Storage } from '../../../types/state'

const { behaviors, stations, npcs, inventory } = globalThis.game.world
export function receptionsStealStash1() {
  let thiefVictim = null
  let thief = null
  let actor: Storage
  let loot: string[] = []
  let attendant = npcs.all[stations.all.reception_desk.occupant]
  // stations.all.reception_desk.occupant === '' ? null : this.p.returnNpc(this.stations.desk)
  if (cicadaModulus() && stations.all.reception_guest.occupant != '') {
    thiefVictim = npcs.all[stations.all.reception_guest.occupant]

    loot = thiefVictim.inventory
    actor = inventory.all.room_reception_drawer
    if (actor.inventory.length > 0 && attendant !== null) {
      const witness: string | null = npcStealCheck(
        thiefVictim.name,
        attendant.name,
        actor.id
      )
      //todotestjpf behaviors.addBehavior()
      if (witness == 'witness') {
        // const perp = thiefVictim.getBehaviorProps('question') as QuestionProps
        behaviors.addBehavior({
          id: `suspecting_${attendant.name}_${thiefVictim.name}`,
        })
      }
    } else if (actor.inventory.length > 0) {
      take_check(thiefVictim.name, actor.id)
    }
  }

  if (stations.all.reception_loiter4.occupant != '') {
    thief = npcs.all[stations.all.reception_loiter4.occupant]
  }
  if (
    cicadaModulus() &&
    thiefVictim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    const witness: string | null = npcStealCheck(thief.name, thiefVictim.name)
    if (witness == 'witness') {
      //  const perp = thief.getBehaviorProps('question') as QuestionProps
      behaviors.addBehavior({
        id: `suspecting_${thiefVictim.name}_${thief.name}`,
      })
    }
  }
  if (cicadaModulus() && attendant !== null) {
    actor = this.actors.drawer

    take_or_stash(attendant.name, actor.id)
  }
  if (cicadaModulus() && stations.all.reception_patrol.occupant != '') {
    attendant = npcs.all[stations.all.reception_patrol.occupant]

    actor = this.actors.vase2
    take_or_stash(attendant.name, actor.id)
  }
  if (cicadaModulus() && stations.all.reception_loiter2.occupant != '') {
    attendant = npcs.all[stations.all.reception_loiter2.occupant]

    actor = this.actors.vase
    take_or_stash(attendant.name, actor.id)
  }
}

export function reception_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
