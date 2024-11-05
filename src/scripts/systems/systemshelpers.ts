import { Occupants } from '../../types/state'

const { npcs, tasks, rooms } = globalThis.game.world

export function add_pledge(s: string) {
  //print('QC:: pledge') //pledge not to do it again
  npcs.all[s].cooldown = npcs.all[s].cooldown + 8
}

export function go_to_jail(s: string) {
  // remove all arrests for suspect(clear record)
  tasks.removeHeat(s)
  const occupants: Occupants = rooms.all.security.occupants!
  let station: keyof typeof occupants
  for (station in occupants) {
    const prisoner = occupants[station]
    if (prisoner == '') {
      rooms.all.security.occupants![station] = s
      npcs.all[s].matrix = rooms.all.security.matrix
      npcs.all[s].cooldown = 8

      // print(s, 'jailed for:', npcs.all[s].cooldown)
      break
      //testjpf if jail full, kick outside of hub
    }
  }
}
