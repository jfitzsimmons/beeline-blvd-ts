import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import { npcStealCheck, take_or_stash } from '../../states/inits/checksFuncs'
import RoomState from '../../states/room'
import { shuffle } from '../../utils/utils'

//const { rooms, npcs } = globalThis.game.world

function steal_stash_checks(_this: RoomState) {
  const loot =
    math.random() > 0.5 ? _this.actors.luggage_1 : _this.actors.luggage_2

  const [suspect, victim] = shuffle([
    _this.stations.assistant == ''
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
    const victimProps: AttendantProps = {
      name: victim.name,
      traits: victim.traits,
      clan: victim.clan,
      inventory: victim.inventory,
      updateInventory: victim.updateInventory.bind(victim),
      addOrExtendEffect: victim.addOrExtendEffect.bind(victim),
    }
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
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    const witness = npcStealCheck(suspectProps, victimProps, loot)
    if (witness == 'witness') {
      const perp = suspect.getBehaviorProps('question') as QuestionProps
      victim.addToBehavior(
        'active',
        new SuspectingSequence(
          victim.getBehaviorProps.bind(victim),
          perp,
          'theft',
          loot
        )
      )
    }
  } else if (suspect != null) {
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
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    take_or_stash(suspectProps, loot)
  }
}

export function baggage_checks(this: RoomState) {
  steal_stash_checks(this)
}
