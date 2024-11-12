import { Task, Consequence } from '../../types/tasks'
import { shuffle } from '../utils/utils'
import { confrontation_check, seen_check } from '../states/inits/checksFuncs'

const { tasks, npcs, player } = globalThis.game.world

function testjpfplayerconfrontationConsequence(
  //_this: WorldTasks,
  s: string,
  w: string,
  confrontDecided = false
): string {
  let tempcons: Array<(s: string, w: string) => Consequence> = []
  //let confrontDecided = true
  //const consolation = { pass: true, type: 'concern' }
  if (s != 'player') {
    //testjpf re-add confrontation_checks
    //but from this
    tempcons = shuffle([])
    //confrontDecided = false
  }
  const caution: Task = {
    owner: w,
    turns: 1,
    label: 'confront',
    scope: 'clan',
    authority: 'security',
    target: s,
    cause: 'theft',
  }

  //testjpf the rest of this would go to
  //npc_confront_consequence or
  //playerConfrontConsequence on Task state!!!
  const consequence = tasks.checks.build_consequence(
    caution,
    w,
    tempcons,
    confrontDecided == true && s == 'player'
  )

  return confrontDecided == true && s == 'player' ? 'concern' : consequence
}
function testjpfplayerthief_consequences(
  //_this: WorldTasks,
  t: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (w != '' && c.type == 'seen') {
    const tTraits =
      t === 'player'
        ? tasks.parent.returnPlayer().state.traits
        : tasks.parent.returnNpc(t).traits

    const wTraits = tasks.parent.returnNpc(w).traits

    //so never confront true for NPcs?testjpf
    c.confront = c.confront == true || confrontation_check(tTraits, wTraits)

    //testjpf maybe here change stae of player or npc to
    //confronted.  handle the rest of the logic in taskFSM
    //use or base of handleConfrontation()
    //This is where I's build new confront task?!

    c.type = testjpfplayerconfrontationConsequence(t, w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral') {
    tasks.taskBuilder(w, c.type, t, 'theft')
  }
  return c
}
//this.npcs.checks.witnessplayer??? testjpf
export function witness_player(w: string): { confront: boolean; type: string } {
  let consequence = {
    confront: false,
    type: 'neutral',
  }

  consequence = testjpfplayerthief_consequences(
    'player',
    w,
    seen_check(player.state, npcs.all[w])
  )
  //TESTJPF THIS IS USED FOR NOVEL REASON!!!
  //and if confront is true!!
  //so what i dneed to do here or on level
  //set playerfsm to 'confronted' if true
  //DONE!!
  return consequence
}
export function address_busy_tasks() {
  const ts = tasks.all.filter((t) => t.label == 'mender')
  for (let i = ts.length - 1; i >= 0; i--) {
    if (ts[i].cause == 'injury' && ts[i].label == 'mender') {
      const hurt = npcs.all[ts[i].target].hp < 5
      if (npcs.all[ts[i].owner].currRoom == player.currRoom && hurt == true) {
        msg.post(
          `/${npcs.all[ts[i].owner].currStation}#npc_loader`,
          hash('move_npc'),
          {
            station: npcs.all[ts[i].target].currStation,
            npc: ts[i].owner,
          }
        )
        print(
          ts[i].owner,
          'STATION MOVE VIA TASK mending',
          ts[i].target,
          'in',
          npcs.all[ts[i].owner].currRoom
        )
      }
      if (hurt == false) {
        ts[i].turns = 0
        npcs.all[ts[i].owner].fsm.setState('turn')
      }
    }
  }
}
