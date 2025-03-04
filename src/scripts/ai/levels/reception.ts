import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
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

function steal_stash_checks(this: RoomState) {
  let thiefVictim = null
  let thief = null
  let actor: Actor
  let loot: string[] = []
  let attendant =
    this.stations.desk === '' ? null : this.parent.returnNpc(this.stations.desk)
  // print('this.stations.guest', this.stations.guest)
  if (cicadaModulus() && this.stations.guest != '') {
    thiefVictim = this.parent.returnNpc(this.stations.guest)
    const thiefVictimProps: ThiefVictimProps = {
      name: thiefVictim.name,
      traits: thiefVictim.traits,
      inventory: thiefVictim.inventory,
      clan: thiefVictim.clan,
      cooldown: thiefVictim.cooldown,
      removeInvBonus: thiefVictim.removeInvBonus.bind(thiefVictim),
      addInvBonus: thiefVictim.addInvBonus.bind(thiefVictim),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }

    //  print('victim.name', victim.name)

    loot = thiefVictim.inventory
    actor = this.actors.drawer
    if (actor.inventory.length > 0 && attendant !== null) {
      const attendantProps: AttendantProps = {
        name: attendant.name,
        traits: attendant.traits,
        clan: attendant.clan,
        taskBuilder: attendant.parent.taskBuilder.bind(attendant),
      }
      npcStealCheck(thiefVictimProps, attendantProps, actor.inventory)
    } else if (actor.inventory.length > 0) {
      take_check(thiefVictimProps, actor)
    }
  }

  if (this.stations.loiter4 != '') {
    thief = this.parent.returnNpc(this.stations.loiter4)
  }
  if (
    cicadaModulus() &&
    thiefVictim != null &&
    thief != null &&
    loot.length > 0 &&
    thief.cooldown <= 0
  ) {
    const victimProps: AttendantProps = {
      name: thiefVictim.name,
      traits: thiefVictim.traits,
      clan: thiefVictim.clan,
      taskBuilder: thiefVictim.parent.taskBuilder.bind(thiefVictim),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    const thiefProps: ThiefVictimProps = {
      name: thief.name,
      traits: thief.traits,
      inventory: thief.inventory,
      clan: thief.clan,
      cooldown: thief.cooldown,
      removeInvBonus: thief.removeInvBonus.bind(thief),
      addInvBonus: thief.addInvBonus.bind(thief),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    npcStealCheck(thiefProps, victimProps, loot)
  }
  if (cicadaModulus() && attendant !== null) {
    actor = this.actors.drawer
    const attendantProps: ThiefVictimProps = {
      name: attendant.name,
      traits: attendant.traits,
      inventory: attendant.inventory,
      clan: attendant.clan,
      cooldown: attendant.cooldown,
      removeInvBonus: attendant.removeInvBonus.bind(attendant),
      addInvBonus: attendant.addInvBonus.bind(attendant),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    take_or_stash(attendantProps, actor)
  }
  if (cicadaModulus() && this.stations.patrol != '') {
    attendant = this.parent.returnNpc(this.stations.patrol)
    const attendantProps: ThiefVictimProps = {
      name: attendant.name,
      traits: attendant.traits,
      inventory: attendant.inventory,
      clan: attendant.clan,
      cooldown: attendant.cooldown,
      removeInvBonus: attendant.removeInvBonus.bind(attendant),
      addInvBonus: attendant.addInvBonus.bind(attendant),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    actor = this.actors.vase2
    take_or_stash(attendantProps, actor)
  }
  if (cicadaModulus() && this.stations.loiter2 != '') {
    attendant = this.parent.returnNpc(this.stations.loiter2)
    const attendantProps: ThiefVictimProps = {
      name: attendant.name,
      traits: attendant.traits,
      inventory: attendant.inventory,
      clan: attendant.clan,
      cooldown: attendant.cooldown,
      removeInvBonus: attendant.removeInvBonus.bind(attendant),
      addInvBonus: attendant.addInvBonus.bind(attendant),
      //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
    }
    actor = this.actors.vase
    take_or_stash(attendantProps, actor)
  }
}

export function reception_checks(this: RoomState) {
  steal_stash_checks.bind(this)()
}
