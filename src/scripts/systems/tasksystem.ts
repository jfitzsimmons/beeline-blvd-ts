//import { AttendantProps, ThiefVictimProps } from '../../types/ai'
//import { QuestionProps } from '../../types/behaviors'
//import {
//confrontation_check,
//  build_consequence,
//} from '../states/inits/checksFuncs'

//const { player, npcs } = globalThis.game.world
/**
function testjpfplayerconfrontationConsequence(
  w: string,
  confrontDecided = false
): string {
  const checker = npcs.all[w].getBehaviorProps('question') as QuestionProps
  const checked = player.getBehaviorProps('question') as QuestionProps
  //testjpf
  //i could probably add checkfncs to empty array
  //must not require novel interruption
  //will get thief consolations
  const consequence = build_consequence(checker, checked, [], confrontDecided)
  //  could return reckless which would need to add
  // recklessSeq to NPC
  //merits/demerits seq??
  //and snitch
  //others would require novel interruption!!??
  return confrontDecided == true ? 'concern' : consequence
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
**/
