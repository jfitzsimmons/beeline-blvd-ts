import { Actor } from '../../../types/state'
import { take_or_stash, npcStealCheck } from '../../states/inits/checksFuncs'
import NpcState from '../../states/npc'
import RoomState from '../../states/room'
import { shuffle } from '../../utils/utils'

//const { rooms, npcs } = globalThis.game.world

function steal_stash_checks(this: RoomState) {
  let suspect = null
  // let thief = null
  let victim = null
  let actor: Actor
  let attendant =
    this.stations.desk === '' ? '' : this.parent.returnNpc(this.stations.desk)
  if (this.stations.guest !== '') {
    suspect = this.parent.returnNpc(this.stations.guest)
    //print("victim.name",victim.name)
    actor = this.actors.desks
    //loot = actor.inventory
    if (actor.inventory.length > 0 && attendant instanceof NpcState) {
      npcStealCheck(suspect, attendant, actor.inventory)
    } else if (actor.inventory.length > 0) {
      take_or_stash(suspect, actor)
    }
  }

  if (this.stations.loiter4 != '' && this.stations.guard != '') {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[suspect, victim] = shuffle([
      this.parent.returnNpc(this.stations.loiter4),
      this.parent.returnNpc(this.stations.guard),
    ])
    if (victim.inventory.length > 0 && suspect.cooldown <= 0)
      npcStealCheck(suspect, victim, victim.inventory)
  }

  if (attendant instanceof NpcState) {
    actor = this.actors.locker
    take_or_stash(attendant, actor)
  }
  if (this.stations.loiter3 != '') {
    attendant = this.parent.returnNpc(this.stations.loiter3)
    actor = this.actors.vase3
    take_or_stash(attendant, actor)
  }
}

export function customs_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
