import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import {
  take_check,
  npcStealCheck,
  take_or_stash,
} from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
//import Storage from '../../states/storage'
import { cicadaModulus, shuffle } from '../../utils/utils'
/**
 *
 * testjpf
 * i think these shoudl create Steal / Stash / Take seqs for characters
 * that might take care of these props. should be behavior props.
 * then i can deal with them with all other behavior.
 * run behavior ewheneve i need instead of forced through FSM!!!!!
 * //maybe not!! see if it pans out later
 */
function steal_stash_checks(this: RoomState) {
  // let thiefVictim = null
  //let thief = null
  const actor = this.actors.locker
  //let loot: string[] = []
  const attendant =
    this.stations.desk === '' ? null : this.p.returnNpc(this.stations.desk)

  const [suspect, watcher] = shuffle([
    this.stations.monitor == ''
      ? null
      : this.p.returnNpc(this.stations.monitor),
    this.swaps.boss[1] == '' ? null : this.p.returnNpc(this.swaps.boss[1]),
  ])

  if (suspect != null && watcher != null && suspect.cooldown < 1) {
    const lootSwitch =
      math.random() > 0.5
        ? actor.inventory.length > 0 && actor
        : watcher.inventory.length > 0

    if (lootSwitch !== false) {
      const thiefVictimProps: ThiefVictimProps = {
        name: suspect.name,
        traits: suspect.traits,
        inventory: suspect.inventory,
        clan: suspect.clan,
        cooldown: suspect.cooldown,
        crime: 'theft',
        removeInvBonus: suspect.removeInvBonus.bind(suspect),
        addInvBonus: suspect.addInvBonus.bind(suspect),
        updateInventory: suspect.updateInventory.bind(suspect),
        addOrExtendEffect: suspect.addOrExtendEffect.bind(suspect),
      }
      const attendantProps: AttendantProps = {
        name: watcher.name,
        traits: watcher.traits,
        clan: watcher.clan,
        inventory: watcher.inventory,
        updateInventory: watcher.updateInventory.bind(watcher),
        addOrExtendEffect: watcher.addOrExtendEffect.bind(watcher),
      }
      const witness =
        lootSwitch === true
          ? npcStealCheck(thiefVictimProps, attendantProps)
          : npcStealCheck(thiefVictimProps, attendantProps, actor)

      if (witness == 'witness') {
        const perp = suspect.getBehaviorProps('question') as QuestionProps
        watcher.addToBehavior(
          'active',
          new SuspectingSequence(
            watcher.getBehaviorProps.bind(watcher),
            perp,
            lootSwitch !== true ? 'theft' : 'pockets',
            lootSwitch !== true ? actor : undefined
          )
        )
      }
    }
  } else if (
    cicadaModulus() &&
    this.swaps.patrol[1] != '' &&
    actor.inventory.length > 0
  ) {
    const thief = this.p.returnNpc(this.swaps.patrol[1])
    const thiefVictimProps: ThiefVictimProps = {
      name: thief.name,
      traits: thief.traits,
      inventory: thief.inventory,
      clan: thief.clan,
      cooldown: thief.cooldown,
      crime: 'theft',
      removeInvBonus: thief.removeInvBonus.bind(thief),
      addInvBonus: thief.addInvBonus.bind(thief),
      updateInventory: thief.updateInventory.bind(thief),
      addOrExtendEffect: thief.addOrExtendEffect.bind(thief),
    }
    //loot = thiefVictim.inventory

    if (attendant !== null) {
      const attendantProps: AttendantProps = {
        name: attendant.name,
        traits: attendant.traits,
        clan: attendant.clan,
        inventory: attendant.inventory,
        updateInventory: attendant.updateInventory.bind(attendant),
        addOrExtendEffect: attendant.addOrExtendEffect.bind(attendant),
      }
      const witness: string | null = npcStealCheck(
        thiefVictimProps,
        attendantProps,
        actor
      )
      if (witness == 'witness') {
        const perp = thief.getBehaviorProps('question') as QuestionProps
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
    } else {
      take_check(thiefVictimProps, actor)
    }
  } else if (
    cicadaModulus() &&
    attendant !== null &&
    actor.inventory.length > 0
  ) {
    const attendantProps: ThiefVictimProps = {
      name: attendant.name,
      traits: attendant.traits,
      inventory: attendant.inventory,
      clan: attendant.clan,
      cooldown: attendant.cooldown,
      crime: 'concern',
      removeInvBonus: attendant.removeInvBonus.bind(attendant),
      addInvBonus: attendant.addInvBonus.bind(attendant),
      updateInventory: attendant.updateInventory.bind(attendant),
      addOrExtendEffect: attendant.addOrExtendEffect.bind(attendant),
    }
    take_or_stash(attendantProps, actor)
  }
}

export function admin1_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
