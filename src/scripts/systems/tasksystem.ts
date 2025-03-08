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
    //so i would need a ConfrontSeq
    //it may only be for player because
    //npc might jsut be arbitrary
    //ACTUALLY could be a way to separate the npcs who move to npc?
    //how? by random? what for?
    // optin of going up to one at a time
    // vs in the middle of a confront
    //so additional mechanic
    //complicated for no reason?
    c.type = testjpfplayerconfrontationConsequence(w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral')
    tasks.taskBuilder(w, c.type, t, 'theft')

  return c
}
*/
