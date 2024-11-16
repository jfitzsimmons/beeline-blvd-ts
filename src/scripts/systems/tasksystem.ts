import { Task } from '../../types/tasks'
import { confrontation_check, seen_check } from '../states/inits/checksFuncs'

const { tasks, npcs, player } = globalThis.game.world

function testjpfplayerconfrontationConsequence(
  // s: string,
  w: string,
  confrontDecided = false
): string {
  const caution: Task = {
    owner: w,
    turns: 1,
    label: 'confront',
    scope: 'clan',
    authority: 'security',
    target: 'player',
    cause: 'theft',
  }

  const consequence = tasks.checks.build_consequence(
    caution,
    w,
    [],
    confrontDecided
  )

  return confrontDecided == true ? 'concern' : consequence
}
function testjpfplayerthief_consequences(
  t: string,
  w: string,
  c: { confront: boolean; type: string }
) {
  if (w != '' && c.type == 'seen') {
    const tTraits = tasks.parent.returnPlayer().state.traits
    const wTraits = tasks.parent.returnNpc(w).traits

    c.confront = c.confront == true || confrontation_check(tTraits, wTraits)
    c.type = testjpfplayerconfrontationConsequence(w, c.confront)
  }

  if (c.confront == false && c.type != 'neutral')
    tasks.taskBuilder(w, c.type, t, 'theft')

  return c
}

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
