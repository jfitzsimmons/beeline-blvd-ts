import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import {
  take_check,
  npcStealCheck,
  take_or_stash,
} from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
import Storage from '../../states/storage'
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
  let thiefVictim = null
  let thief = null
  let actor: Storage
  let loot: string[] = []
  const attendant =
    this.stations.desk === '' ? null : this.p.returnNpc(this.stations.desk)
  if (this.swaps.servants2[1] != '') {
    thiefVictim = this.p.returnNpc(this.swaps.servants2[1])
    const thiefVictimProps: ThiefVictimProps = {
      name: thiefVictim.name,
      traits: thiefVictim.traits,
      inventory: thiefVictim.inventory,
      clan: thiefVictim.clan,
      cooldown: thiefVictim.cooldown,
      crime: 'theft',
      removeInvBonus: thiefVictim.removeInvBonus.bind(thiefVictim),
      addInvBonus: thiefVictim.addInvBonus.bind(thiefVictim),
      updateInventory: thiefVictim.updateInventory.bind(thiefVictim),
      addOrExtendEffect: thiefVictim.addOrExtendEffect.bind(thiefVictim),
    }
    loot = thiefVictim.inventory
    actor = this.actors.drawer
    if (actor.inventory.length > 0 && attendant !== null) {
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
        const perp = thiefVictim.getBehaviorProps('question') as QuestionProps
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
      take_check(thiefVictimProps, actor)
    }
  }

  thief =
    this.stations.loiter2 != '' ? this.p.returnNpc(this.stations.loiter2) : null
  if (
    thiefVictim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    const victimProps: AttendantProps = {
      name: thiefVictim.name,
      traits: thiefVictim.traits,
      clan: thiefVictim.clan,
      inventory: thiefVictim.inventory,
      updateInventory: thiefVictim.updateInventory.bind(thiefVictim),
      addOrExtendEffect: thiefVictim.addOrExtendEffect.bind(thiefVictim),
    }
    const thiefProps: ThiefVictimProps = {
      name: thief.name,
      traits: thief.traits,
      inventory: thief.inventory,
      clan: thief.clan,
      cooldown: thief.cooldown,
      crime: 'pockets',
      removeInvBonus: thief.removeInvBonus.bind(thief),
      addInvBonus: thief.addInvBonus.bind(thief),
      updateInventory: thief.updateInventory.bind(thief),
      addOrExtendEffect: thief.addOrExtendEffect.bind(thief),
    }
    const witness: string | null = npcStealCheck(thiefProps, victimProps)
    if (witness == 'witness') {
      const perp = thief.getBehaviorProps('question') as QuestionProps
      thiefVictim.addToBehavior(
        'active',
        new SuspectingSequence(
          thiefVictim.getBehaviorProps.bind(thiefVictim),
          perp,
          'pockets'
        )
      )
    }
  }
  if (cicadaModulus() && attendant !== null) {
    actor = this.actors.drawer
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
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    take_or_stash(attendantProps, actor)
  }

  let [suspect, watcher, third] = shuffle([
    this.swaps.loiter2[1] == ''
      ? null
      : this.p.returnNpc(this.swaps.loiter2[1]),
    this.stations.servants2 == ''
      ? null
      : this.p.returnNpc(this.stations.servants2),
    this.stations.loiter1 == ''
      ? null
      : this.p.returnNpc(this.stations.loiter1),
  ])

  if (suspect == null && third != null) {
    suspect = third
    third = null
  }
  if (watcher == null && third != null) watcher = third
  if (
    suspect != null &&
    watcher != null &&
    suspect.cooldown < 1 &&
    watcher.inventory.length > 0
  ) {
    const thiefVictimProps: ThiefVictimProps = {
      name: suspect.name,
      traits: suspect.traits,
      inventory: suspect.inventory,
      clan: suspect.clan,
      cooldown: suspect.cooldown,
      crime: 'pockets',
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
    const witness = npcStealCheck(thiefVictimProps, attendantProps)

    if (witness == 'witness') {
      const perp = suspect.getBehaviorProps('question') as QuestionProps
      watcher.addToBehavior(
        'active',
        new SuspectingSequence(
          watcher.getBehaviorProps.bind(watcher),
          perp,
          'pockets'
        )
      )
    }
  }
}

export function infirmary_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
