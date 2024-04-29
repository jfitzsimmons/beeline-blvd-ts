import { Npc } from '../../../types/state'
import { steal_check, take_or_stash } from '../../ai/ai_checks'
import { npc_action_move, rooms_near_target } from '../../ai/ai_main'
import { shuffle } from '../../utils/utils'
import { any_has_value } from '../../utils/quest'

const { rooms, npcs, tasks, player, novel } = globalThis.game.world

export function tutorialA(interval = 'turn') {
  const luggage =
    math.random() > 0.5
      ? rooms.all.grounds.actors.player_luggage
      : rooms.all.grounds.actors.other_luggage
  if (luggage.inventory.length > 0 && interval == 'turn') {
    const worker2 = npcs.all[rooms.all['grounds'].stations.worker2]
    const guest2 = npcs.all[rooms.all['grounds'].stations.guest2]

    if (worker2 != null && worker2.cooldown <= 0) {
      guest2 == null
        ? take_or_stash(worker2, rooms.all.grounds.actors.player_luggage)
        : steal_check(worker2, guest2, luggage.inventory)
    } else if (guest2 != null && guest2.cooldown <= 0) {
      worker2 == null
        ? take_or_stash(guest2, rooms.all.grounds.actors.player_luggage)
        : steal_check(guest2, worker2, luggage.inventory)
    }
  }

  if (tasks.quests.tutorial.medic_assist.passed == false) {
    if (
      tasks.quests.tutorial.medic_assist.conditions[1].passed == true &&
      interval == 'turn' &&
      rooms.all['grounds'].stations.worker1 != ''
    ) {
      const replace = rooms.all.grounds.stations.aid
      if (replace != '' && npcs.all[replace].clan != 'doctors') {
        //const docs = shuffle(npcs.return_doctors())
        const doc: Npc = shuffle(npcs.return_doctors())[0]
        let { currentroom, currentstation } = doc

        rooms.all[currentroom].stations[currentstation] = ''
        rooms.all.grounds.stations.aid = doc.labelname
        currentroom = 'grounds'
        currentstation = 'aid'
        npc_action_move(replace, rooms_near_target(player.matrix))
      }
    }
    /**
     * so testjpf we have a propert that accepts multipl type of export functions and returns
     *
     * we then use one of those export functions, which has a more specific type.
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
function doctorsScripts() {
  const has_met = tasks.quests.tutorial.medic_assist.conditions[1].passed
  tasks.quests.tutorial.medic_assist.conditions[1]
  // bad??:: if reasonstring.startswith('quest - ')
  //then on novel_main novel.quest.solution = endof(message.reason)
  if (has_met == false) {
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorial/tutorialAdoctor'
  }
  return null
}
function worker2Scripts() {
  print('worker2 script called', novel.reason)
  if (novel.npc.turns_since_convo > 0 && novel.reason == 'concern') {
    print('worker2 script returned')
    return 'tutorial/concernLuggage'
  }

  if (
    novel.reason == 'offender' ||
    (novel.reason == 'concern' &&
      novel.npc.turns_since_convo < 3 &&
      novel.npc.love < -4)
  )
    return 'tutorial/offenderLuggage'

  //testjpf maybe have another fedUpLuggage that is majority alerts?
  //also, just add a lot more love chcks to the concern and offender
  //more alert checks as well
  //by checks i mean choices with checks

  if (novel.reason == 'concern') return 'tutorial/concernLuggage'

  return null
}

const tutorialAlookup: { [key: string]: () => string | null } = {
  doctors: doctorsScripts,
  worker2: worker2Scripts,
}

export function tutorialAscripts(actor: string): string[] {
  const scripts = []
  if (tutorialAlookup[actor] != null) scripts.push(tutorialAlookup[actor]())
  if (tutorialAlookup[npcs.all[actor].clan] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].clan]())
  if (tutorialAlookup[npcs.all[actor].currentstation] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currentstation]())

  return scripts.filter((s: string | null): s is string => s != null)
}

export function tutorialB() {
  // tutorialA()
}
