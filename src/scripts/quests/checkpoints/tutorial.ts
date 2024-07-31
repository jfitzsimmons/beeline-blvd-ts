import { Npc } from '../../../types/state'
import { steal_check, take_or_stash } from '../../ai/ai_checks'
import { npc_action_move } from '../../ai/ai_main'
import { shuffle, surrounding_room_matrix } from '../../utils/utils'
//import { any_has_value } from '../../utils/quest'

const { rooms, npcs, tasks, player, novel } = globalThis.game.world
function medic_assist_checks() {
  //print('medic assist check:: nove.reason:: ', novel.reason)
  const quest = tasks.quests.tutorial.medic_assist.conditions[0]
  if (quest.passed == false) {
    // TESTJPF why remove heat from worker1??/
    tasks.remove_heat(rooms.all.grounds.stations.worker1)
    //tasks.remove_quest_cautions(rooms.all.grounds.stations.worker1)
    //print('11111')
    //testjpf probably need new caution
    // doctors still need to ignore victim
    //activate bonus quests / side quests
    //probably need some way to remove quest cautions
    //status or something //on address_quest a
    //clean_up() calls whatever you need.
    //add to tutorialstate? probably?!!

    //
  } else if (quest.passed == true && quest.status == 'inactive') {
    print('HELP THAT MAN ACTIVE!!!')
    tasks.quests.tutorial.medic_assist.conditions[0].status = 'active'
    tasks.quests.tutorial.medic_assist.status = 'active'
    // tasks.quests.tutorial.medic_assist.conditions[1].status = 'active'
  } else if (
    novel.reason == 'hungrydoc' &&
    quest.passed == true &&
    quest.status == 'active' &&
    tasks.quests.tutorial.medic_assist.conditions[2].status == 'inactive'
  ) {
    tasks.quests.tutorial.medic_assist.conditions[2].status = 'active'
    print(
      'STATUS ACTIVE. ready for apple!! ?? ::',
      tasks.quests.tutorial.medic_assist.conditions[2].status
    )
    //testjpf
    // i think jsut sets novel.reason in script builder.
    //So for 100  turns, this npc will always talk to you about a quest
    //which quest? the one that comes from quest directory scripts
    // as seen in sbuilder:: const quest_paths
    tasks.append_caution({
      label: 'quest',
      time: 100,
      type: 'hungry',
      reason: 'quest',
      npc: npcs.all[novel.npc.labelname].labelname,
      suspect: npcs.all[novel.npc.labelname].labelname,
      authority: 'player',
    })
    //info.build_objectives(tasks.quests)
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (
    tasks.quests.tutorial.medic_assist.conditions[2].status == 'active' &&
    tasks.quests.tutorial.medic_assist.conditions[2].passed == false
  ) {
    print('PRE novel.item:: from tut:: apple01:?:', novel.item)
    if (novel.item == 'apple01') {
      print(
        'novel.item:: from tut:: apple01:?:',
        novel.item,
        tasks.quests.tutorial.medic_assist.conditions[2].passed
      )
      // tasks.quests.tutorial.medic_assist.conditions[2].passed = true
      quest.status = 'complete'
      tasks.remove_quest_cautions(novel.npc.labelname)
      print(tasks.quests.tutorial.medic_assist.conditions[2].passed)
      novel.reason = 'getadoctor'
      msg.post('proxies:/controller#novelcontroller', 'show_scene')
    }
  } else if (
    tasks.quests.tutorial.medic_assist.conditions[2].status == 'active' &&
    tasks.quests.tutorial.medic_assist.conditions[2].passed == true
  ) {
    print('pre 3333', tasks.quests.tutorial.medic_assist.conditions[2].status)
    tasks.quests.tutorial.medic_assist.conditions[2].status = 'complete'
    // testjpf this is overwriting my scriptsdialog functions
    print('3333', tasks.quests.tutorial.medic_assist.conditions[2].status)

    tasks.append_caution({
      label: 'mending',
      time: 100,
      type: 'quest',
      reason: 'field',
      npc: npcs.all[novel.npc.labelname].labelname,
      suspect: npcs.all[rooms.all.grounds.stations.worker1].labelname,
      authority: 'doctors',
    })
    msg.post(
      `/${npcs.all[novel.npc.labelname].currentstation}#npc_loader`,
      hash('move_npc'),
      {
        station: 'worker1',
        npc: novel.npc.labelname,
      }
    )
    if (
      novel.reason == 'getsomemeds' &&
      tasks.quests.tutorial.medic_assist.conditions[3].status == 'inactive'
    ) {
      print('PRE !!! notepushed')

      tasks.quests.tutorial.medic_assist.conditions[3].status = 'active'
      player.add_inventory('note')
      print('noteadded')
      // create caution for... 10 turns?
      // i don't have cleareance logic setup!!
      //testjpf add "note" to inventory
    }
    //testjpf open dialog with thanks and next task???
    // use novel_init here jsut to laod the same tutorial/
    //testjpf
    // need something to check if this doc was given food.
    // in 'interact' gui send message to exit gui??
    // containing item, maybe who from "npc" or "player"
  } else if (
    novel.reason == 'getsomemeds' &&
    tasks.quests.tutorial.medic_assist.conditions[3].status == 'inactive'
  ) {
    print('PRE !!! notepushed')

    tasks.quests.tutorial.medic_assist.conditions[3].status = 'active'
    player.add_inventory('note')
    print('noteadded')
    // create caution for... 10 turns?
    // i don't have cleareance logic setup!!
    //testjpf add "note" to inventory
  }
}

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
    medic_assist_checks()
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
        npc_action_move(
          replace,
          surrounding_room_matrix(player.matrix, npcs.all[replace].matrix)
        )
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
    // const _return_docs = npcs.return_doctors
    /*
    if (
      tasks.quests.tutorial.medic_assist.conditions[1].passed == true &&
      interval == 'interact' &&
      tasks.quests.tutorial.medic_assist.conditions[2].passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == false &&
      any_has_value([_return_docs, 'vial02']) == false
    ) {
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
      if (player.inventory.includes('note')) {
        const note = player.inventory.splice(
          player.inventory.indexOf('note'),
          1
        )
        npcs.all[rooms.all['grounds'].stations.aid].inventory.push(note[0])
      }
    }*/
  }
}
function doctorsScripts() {
  const has_met_victim = tasks.quests.tutorial.medic_assist.conditions[0].passed
  // bad??:: if reasonstring.startswith('quest - ')
  //then on novel_main novel.quest.solution = endof(message.reason)

  if (
    has_met_victim == true &&
    tasks.quests.tutorial.medic_assist.conditions[2].status == 'inactive'
  ) {
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorial/tutorialAdoctor'
  } else if (
    tasks.quests.tutorial.medic_assist.conditions[2].status != 'inactive'
  ) {
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return tasks.quests.tutorial.medic_assist.conditions[2].passed == false
      ? 'tutorial/hungrydoc'
      : 'tutorial/getadoctor'
  }
  return null
}

function worker1Scripts() {
  if (tasks.quests.tutorial.medic_assist.conditions[1].passed == false) {
    novel.reason = 'quest'
    return 'tutorial/helpThatMan'
  }
  return null
}
function worker2Scripts() {
  //testjpf maybe have another fedUpLuggage that is majority alerts?
  //also, just add a lot more love chcks to the concern and offender
  //more alert checks as well
  //by checks i mean choices with checks

  if (novel.reason == 'concern') {
    novel.priority = true
    novel.reason = 'quest'
    return 'tutorial/concernLuggage'
  }

  return null
}

const tutorialAlookup: { [key: string]: () => string | null } = {
  doctors: doctorsScripts,
  worker2: worker2Scripts,
  worker1: worker1Scripts,
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
