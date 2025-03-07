import { AttendantProps, ThiefVictimProps } from '../../types/ai'
import { QuestionProps } from '../../types/behaviors'
import {
  confrontation_check,
  seen_check,
  build_consequence,
} from '../states/inits/checksFuncs'

const { tasks, player, npcs } = globalThis.game.world

function testjpfplayerconfrontationConsequence(
  w: string,
  confrontDecided = false
): string {
  const checker = npcs.all[w].getBehaviorProps('question') as QuestionProps
  const checked = player.getBehaviorProps('question') as QuestionProps
  const consequence = build_consequence(checker, checked, [], confrontDecided)

  return confrontDecided == true ? 'concern' : consequence

  // return confrontDecided == true ? 'concern' : consequence
}
function testjpfplayerthief_consequences(
  t: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (w != '' && c.type == 'seen') {
    const tTraits = tasks.parent.returnPlayer().traits
    const wTraits = tasks.parent.returnNpc(w).traits

    c.confront = c.confront == true || confrontation_check(tTraits, wTraits)
    c.type = testjpfplayerconfrontationConsequence(w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral')
    tasks.taskBuilder(w, c.type, t, 'theft')

  return c
}

export function witness_player(w: string): { confront: boolean; type: string } {
  print('witness_player')
  let consequence = {
    confront: false,
    type: 'neutral',
  }

  //USED TODO CHFUNCS SEEN_CHECK()
  const thiefprops: ThiefVictimProps = {
    name: player.name,
    addInvBonus: player.addInvBonus.bind(player),
    removeInvBonus: player.removeInvBonus.bind(player),
    updateInventory: player.updateInventory.bind(player),
    traits: player.traits,
    inventory: player.inventory,
    cooldown: player.cooldown,
    clan: player.clan,
  }
  const attendantProps: AttendantProps = {
    name: npcs.all[w].name,
    traits: npcs.all[w].traits,
    clan: npcs.all[w].clan,
    inventory: npcs.all[w].inventory,
    updateInventory: npcs.all[w].updateInventory.bind(npcs.all[w]),
  }
  const seen = seen_check(thiefprops, attendantProps)
  consequence = testjpfplayerthief_consequences('player', w, seen)
  print(
    'witness_player:: w,confront,type::',
    w,
    consequence.confront,
    consequence.type
  )

  return consequence
}
