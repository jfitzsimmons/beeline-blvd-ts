import { steal_check } from '../ai/ai_checks'
import { npc_action_move, assign_nearby_rooms } from '../ai/ai_main'
import { shuffle } from '../utils/utils'
import { any_has_value } from '../utils/quest'
import { Npc } from '../../types/state'
const { rooms, npcs, tasks, player } = globalThis.game.world

export const scripts = {
  ['tutorialAscripts']: tutorialAscripts,
  //["tutorialB"] = tutorialBscripts,
}
export const checks = {
  ['tutorialA']: tutorialA,
  ['tutorialB']: tutorialB,
}

export function quest_checks(interval: string) {
  let cKey: keyof typeof checks
  for (cKey in checks) {
    checks[cKey](interval)
  }
}

function tutorialA(interval = 'turn') {
  const luggage = rooms.all.grounds.actors.player_luggage.inventory
  if (luggage.length > 0 && interval == 'turn') {
    const worker2 = npcs.all[rooms.all['grounds'].stations.worker2]
    const guest2 = npcs.all[rooms.all['grounds'].stations.guest2]

    if (math.random() < 0.5 && worker2 != null && worker2.cooldown <= 0) {
      print('Quest related checks:::')
      steal_check(worker2, guest2, luggage)
    } else if (math.random() < 0.5 && guest2 != null && guest2.cooldown <= 0) {
      print('Quest related checks:::')
      steal_check(guest2, worker2, luggage)
    }
  }

  if (tasks.quests.tutorial.medic_assist.passed == false) {
    if (
      tasks.quests.tutorial.medic_assist.conditions[1].passed == true &&
      interval == 'turn' &&
      rooms.all['grounds'].stations.worker1 != ''
    ) {
      print('placing a doctor!!!')
      const replace = rooms.all.grounds.stations.aid
      if (replace != '' && npcs.all[replace].clan != 'doctors') {
        //const docs = shuffle(npcs.return_doctors())
        const doc: Npc = shuffle(npcs.return_doctors())[0]
        let { currentroom, currentstation } = doc

        rooms.all[currentroom].stations[currentstation] = ''
        rooms.all.grounds.stations.aid = doc.labelname
        currentroom = 'grounds'
        currentstation = 'aid'
        print(replace, 'has been REPLACED by:', doc.labelname)
        npc_action_move(replace, assign_nearby_rooms(player.matrix))
      }
    }
    /**
     * so testjpf we have a propert that accepts multipl type of functions and returns
     *
     * we then use one of those functions, which has a more specific type.
     *
     * lint still thinks it's type is the original vague one
     */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _return_docs = npcs.return_doctors
    if (
      tasks.quests.tutorial.medic_assist.conditions[1].passed == true &&
      interval == 'interact' &&
      tasks.quests.tutorial.medic_assist.conditions[2].passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == false &&
      any_has_value([_return_docs, 'vial02']) == false
    ) {
      print('launch novel about ...here is a keycard get some meds')
      player.inventory.push('note')
      const params = {
        path: 'grounds/tutorialmeds',
        npc: rooms.all['grounds'].stations.aid,
        reason: 'apple',
        roomname: 'grounds',
      }
      msg.post('proxies:/controller#novelcontroller', 'show_scene', params)
    } else if (
      tasks.quests.tutorial.medic_assist.conditions[1].passed == true &&
      interval == 'interact' &&
      tasks.quests.tutorial.medic_assist.conditions[2].passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == true &&
      any_has_value([_return_docs, 'vial02']) == true
    ) {
      print('PASSED')
      //for (const item of player.inventory) {
      if (player.inventory.includes('note')) {
        const note = player.inventory.splice(
          player.inventory.indexOf('note'),
          1
        )
        npcs.all[rooms.all['grounds'].stations.aid].inventory.push(note[0])
      }
      //	}
      print('testjpf TEXT script thank you, misson complete fri}.')
    }
  }
}

function tutorialAscripts(actor: string) {
  const has_met = tasks.quests.tutorial.medic_assist.conditions[1].passed
  if (
    actor != 'player' &&
    npcs.all[actor].clan == 'doctors' &&
    has_met == false
  ) {
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorialAdoctor'
  }
  return ''
}

function tutorialB() {
  // tutorialA()
}
