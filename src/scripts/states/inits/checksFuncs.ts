//testjpf move 2 checks to parent
//use new init
// will need individual method Types 'per task'
// some tasks wont have any

import WorldTasks from '../tasks'

//need to send cause TESTJPF
export function playerSnitchCheck(
  this: WorldTasks,
  priors: boolean,
  cop: string,
  cause: string
): string {
  ///testjpf still nrrd to figure out alert_level!!!
  //do alert_level search

  let caution_state = 'questioning'
  const player = this.parent.returnPlayer()
  if (player.alert_level > 3) caution_state = 'arrest'
  player.alert_level =
    priors == null ? player.alert_level + 1 : player.alert_level + 2
  if (player.alert_level > 5 && this.npcHasTask(cop, 'player') == null) {
    this.taskBuilder(cop, 'snitch', 'player', cause)
  }
  print('plauer snitch chk :: alertlvl::', player.alert_level)
  return caution_state
}
//need to send target TESTJPF
export function npcSnitchCheck(this: WorldTasks, c: string, t: string): string {
  let caution_state = 'questioning'
  const cop = this.parent.returnNpc(c)
  const target = this.parent.returnNpc(t)
  if (this.npcHasTask(c, t, ['questioning', 'arrest'])) {
    cop.traits.opinion[target.clan] = cop.traits.opinion[target.clan] - 1
    print('NPCSNITCHCHK')
    if (math.random() < 0.33) caution_state = 'arrest'
  }
  return caution_state
}
