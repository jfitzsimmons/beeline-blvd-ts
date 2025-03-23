import { ThiefVictimProps, AttendantProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import { npcStealCheck, take_or_stash } from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
import Storage from '../../states/storage'
import { cicadaModulus, shuffle } from '../../utils/utils'
function steal_stash_checks(this: RoomState) {
  const actor: Storage = this.actors.cargo
  let [suspect, watcher] = shuffle([
    this.stations.assistant == ''
      ? null
      : this.p.returnNpc(this.stations.assistant),
    this.swaps.aid[1] == '' ? null : this.p.returnNpc(this.swaps.aid[1]),
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
            'theft',
            lootSwitch !== true ? actor : undefined
          )
        )
      }
    }
  } else if (cicadaModulus() && suspect != null && actor.inventory.length > 0) {
    const suspectProps: ThiefVictimProps = {
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
    take_or_stash(suspectProps, actor)
  }

  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;[suspect, watcher] = shuffle([
    this.swaps.assistant[1] == ''
      ? null
      : this.p.returnNpc(this.swaps.assistant[1]),
    this.swaps.loiter1[1] == ''
      ? null
      : this.p.returnNpc(this.swaps.loiter1[1]),
  ])
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

export function grounds_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
