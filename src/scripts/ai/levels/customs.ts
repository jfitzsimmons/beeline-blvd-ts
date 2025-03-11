import { AttendantProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import { take_or_stash, npcStealCheck } from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
import Storage from '../../states/storage'
import { shuffle } from '../../utils/utils'

//const { rooms, npcs } = globalThis.game.world

function steal_stash_checks(this: RoomState) {
  let suspect = null
  // let thief = null
  let victim = null
  let actor: Storage
  let attendant =
    this.stations.desk === '' ? null : this.parent.returnNpc(this.stations.desk)
  if (this.stations.guest !== '') {
    suspect = this.parent.returnNpc(this.stations.guest)
    //print("victim.name",victim.name)
    actor = this.actors.drawer
    //loot = actor.inventory
    if (actor.inventory.length > 0 && attendant !== null) {
      const attendantProps: AttendantProps = {
        name: attendant.name,
        traits: attendant.traits,
        clan: attendant.clan,
        inventory: attendant.inventory,
        updateInventory: attendant.updateInventory.bind(attendant),
      }
      const witness = npcStealCheck(suspect, attendantProps, actor)
      if (witness == 'witness') {
        const perp = suspect.getBehaviorProps('question') as QuestionProps
        attendant.addToBehavior(
          'active',
          new SuspectingSequence(
            attendant.getBehaviorProps.bind(attendant),
            perp,
            'theft',
            actor
          )
        )
      }
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
    if (victim.inventory.length > 0 && suspect.cooldown <= 0) {
      const victimProps: AttendantProps = {
        name: victim.name,
        traits: victim.traits,
        clan: victim.clan,
        inventory: victim.inventory,
        updateInventory: victim.updateInventory.bind(victim),
      }
      const witness = npcStealCheck(suspect, victimProps)
      if (witness == 'witness') {
        const perp = suspect.getBehaviorProps('question') as QuestionProps
        victim.addToBehavior(
          'active',
          new SuspectingSequence(
            victim.getBehaviorProps.bind(victim),
            perp,
            'pockets'
          )
        )
      }
    }
  }

  if (attendant !== null) {
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
