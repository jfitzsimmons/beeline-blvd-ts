import { AttendantProps, ThiefVictimProps } from '../../../types/ai'
import { QuestionProps } from '../../../types/behaviors'
import SuspectingSequence from '../../behaviors/sequences/suspectingSequence'
import { take_or_stash, npcStealCheck } from '../../states/inits/checksFuncs'
import QuestStep from '../../states/questStep'
import { doctors } from '../../utils/consts'
//import { npc_action_move } from '../../ai/ai_main'
//import NpcState from '../../states/npc'
import { from_same_room } from '../../utils/quest'
//import { shuffle } from '../../utils/utils'

const { rooms, npcs, tasks, player, novel, info, quests } =
  globalThis.game.world

function injured_checks() {
  const quest = quests.all.tutorial.medic_assist
  const { '0': injury } = quest.conditions
  const injured = npcs.all[rooms.all.grounds.stations.worker1]

  if (injury.fsm.getState() == 'new' && injury.passed == true) {
    injury.fsm.setState('active')
    quest.fsm.setState('active')
    injured.love = injured.love + 1
    info.add_interaction(`${injured.name} likes that you are helping them.`)
  }
}
function infirmary_checks(delivery: QuestStep) {
  //print('infirmary_checks', novel.reason, delivery.fsm.getState())
  if (
    //testjpf this only works if talking to doctors
    // doctor sripts only gets called for doctors!!!
    //BUG!! STOP hardcoding these TODO NOW!!
    //Type not string, but "favormedsquest" |""|""etc...?
    //or ENUMS?!?!?!
    novel.reason == 'favormedsquest' &&
    delivery.fsm.getState() == 'new'
  ) {
    player.add_inventory('vial02')
    info.add_interaction(`${novel.npc.name}'s gave you meds for a doctor`)
  }
}
function doctor_checks() {
  const quest = quests.all.tutorial.medic_assist
  const injured = npcs.all[rooms.all.grounds.stations.worker1]
  // let's you interact with any doctor
  const doctor = npcs.all[novel.npc.name]
  const { '0': injury, '2': apple, '3': meds, '5': delivery } = quest.conditions
  //print('APPLE:PASSED:STATE::', novel.item, apple.passed, apple.fsm.getState())
  if (
    novel.reason == 'hungrydoc' &&
    injury.fsm.getState() == 'active' &&
    apple.fsm.getState() == 'new'
  ) {
    apple.fsm.setState('active')
    tasks.taskBuilder(doctor.name, 'quest', injured.name, 'quest')
    novel.append_npc_quest(doctor.name)
    info.add_interaction(`${doctor.name} needs food.`)
  } else if (
    //testjpf TODO:::
    novel.reason == 'druggiedoc' &&
    apple.fsm.getState() == 'new'
  ) {
    novel.append_npc_quest(doctor.name)
    tasks.taskBuilder(doctor.name, 'quest', injured.name, 'quest')
    info.add_interaction(`${doctor.name} needs drugs.`)
  } else if (
    novel.item == 'apple01' &&
    apple.passed == true &&
    apple.fsm.getState() == 'active'
  ) {
    /**
     * changing apple passed to Quests
     * means it's pass before this check
     * might need to do "ask a favor" like with vial02
     * TODOTESTJPF
     *
     */
    //apple.passed = true
    tasks.remove_quest_tasks(doctor.name)
    tasks.taskBuilder(doctor.name, 'mender', injured.name, 'injury')

    novel.remove_npc_quest(doctor.name)
    novel.reason = 'getadoctor'
    novel.npc = doctor
    //testjpf needed for non optional dialog.
    // optional quest options need TODO
    novel.forced = true

    info.add_interaction(`${doctor.name} likes that you fed them.`)
    doctor.love = doctor.love + 1
    // testjpf this is overwriting my scriptsdialog functions???
    npcs.all[doctor.name].fsm.setState('mender')

    info.add_interaction(`${injured.name} likes that you got a doctor.`)
    injured.love = injured.love + 1

    msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  } else if (novel.reason == 'getsomemeds' && meds.fsm.getState() == 'new') {
    meds.fsm.setState('active')
    apple.fsm.setState('complete')

    player.add_inventory('note')
    quest.sideQuests.hallpass.fsm.setState('active')
    /*
    need hallpass seq?? testjpf
    tasks.append_task({
      label: 'hallpass',
      turns: 8,
      scope: 'type3',
      cause: 'medical',
      owner: 'player',
      target: 'infirmary',
      authority: 'security',
    })
      */
    tasks.taskBuilder(doctor.name, 'quest', injured.name, 'waitingformeds')
    novel.append_npc_quest(doctor.name)
    info.add_interaction(`${doctor.name}'s gave you clearance for 8 turns`)

    msg.post(`/${doctor.currStation}#npc_loader`, hash('move_npc'), {
      station: 'worker1',
      npc: doctor.name,
    })
  } else if (novel.reason == 'rejectmeds') {
    apple.fsm.setState('complete')
    info.add_interaction(`${doctor.name} doesn't like you wont help.`)
    injured.love = injured.love - 1

    msg.post(`/${doctor.currStation}#npc_loader`, hash('move_npc'), {
      station: 'worker1',
      npc: doctor.name,
    })
  } else if (
    quest.sideQuests.hallpass.fsm.getState() === 'active' &&
    player.clearance - 2 < rooms.all[player.currRoom].clearance &&
    from_same_room(npcs.returnSecurity(), player.currRoom) != null
  ) {
    // print('thebigelseif@!@!@!')
    novel.cause = 'questioning'
    novel.reason = 'tutsclearance'
    novel.forced = true
    novel.npc = from_same_room(npcs.returnSecurity(), player.currRoom)!
    // print('tutsclearances', novel.reason, novel.npc.name)
    quest.sideQuests.hallpass.fsm.setState('complete')
    quest.sideQuests.hallpass.passed = true
    msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
  } else if (
    novel.item == 'vial02' &&
    meds.passed == true &&
    meds.fsm.getState() == 'active'
  ) {
    novel.forced = true
    //TESTjpf start here
    delivery.fsm.setState('active')
    const waiting = tasks.taskHasOwner('waitingformeds')
    //testjpf doesnt work if you talk to someone else!!! BUG
    if (novel.npc.name == waiting) {
      // print('WAITING DOES ANYHTING???!!!')
      //meds.passed = true
      meds.fsm.setState('complete')
      info.add_interaction(`${waiting} likes that you gave them meds.`)
      doctor.love = doctor.love + 1
      novel.npc = npcs.all[waiting]
      novel.reason = 'docquestcomplete'
      novel.remove_npc_quest(doctor.name)
      tasks.removeTaskByLabel(doctor.name, 'mender')
      npcs.all[injured.name].fsm.setState('infirm')
      npcs.all[doctor.name].fsm.setState('turn')
    } else {
      //testjpf start here
      //set up address)cautions for favors and quests TODO
      // need to really think out logic here
      /**
       * youd talk to them (reason = quest, label queststart)((doctorsScripts!!!))
       * if accept reason = quest: favormedquest
       * this creates favor caution
       * address_cautions should look for nearby docs
       * decide wether to give them meds,
       * (if they even haven't lost the yet)
       * if so, goal passed = true
       * quest complete when talk to doc again?? with timeout??
       * remove any related npcs from npcsWithQuest
       */
      // testjpf this is overwriting my scriptsdialog functions
      novel.npc = doctor
      //novel.forced = true
      /**
       * TODO TESTJPF
       * funcitonality has been replaced by behavior trees
      tasks.append_task({
        label: 'favor',
        turns: 15,
        scope: 'quest',
        cause: 'favordoctorquest',
        owner: doctor.name,
        target: npcs.all[waiting!].name,
        authority: 'player',
      })
        **/
      novel.reason = 'askdocafavor'
    }
    novel.forced = true

    msg.post('worldproxies:/controller#novelcontroller', 'show_scene')
    // removed after scene
    /** 
    if (waiting != null) {
      print('does this get calledhuhuh???')
      tasks.remove_quest_tasks(waiting)
      novel.remove_npc_quest(waiting)
      
    }**/
  } else if (
    novel.reason == 'docquestcomplete' &&
    meds.fsm.getState() == 'complete'
  ) {
    tasks.remove_quest_tasks(doctor.name)
  }
}
function medic_assist_checks() {
  const quest = quests.all.tutorial.medic_assist
  /**  if (quest.passed == false) {
    //overly cautious? TESTJPF make sure injured doesnt get into other trouble???
    tasks.removeHeat(injured.name)
  }**/
  //need doctor checks and "non-doctor" cjecks?
  //testjpf if novel.npc isn't a doctor::: RETURN!!!????
  // const injured = npcs.all[rooms.all.grounds.stations.worker1]
  // BUG::: testjpf I think this will
  // let you interact with any doctor
  //const doctor = npcs.all[novel.npc.name].

  const { conditions } = quest
  //const {"0":injury,"1":doc, "2":apple} = cons
  //const { "0": injury, "1": doc, "2": apple, "3": meds } = cons
  if (conditions['0'].passed == true) injured_checks()
  /**
   * testjpf this conditional sucks. BUG will break things based on who you last talked to.

  print(
    'TUTTTS:: clan:',
    npcs.all[novel.npc.name].clan,
    '| docquest:?',
    tasks.npcHasTask(doctors, [], ['quest']),
    '| currroom:',
    npcs.all[novel.npc.name].currRoom
  )   */
  if (
    npcs.all[novel.npc.name].clan == 'doctors' ||
    tasks.npcHasTask(doctors, [], ['quest']) !== null
  ) {
    doctor_checks()
    //TESTJPF
  }
  if (npcs.all[novel.npc.name].currRoom == 'infirmary') {
    // print('novel reason pre infirm check', novel.reason)
    infirmary_checks(conditions['5'])
  }
  //TESTJPF ELSE if quest complete dialog, xp / money???
}

export function tutorialA(interval = 'turn') {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '2': apple } = cons
  //testjpg NEW move rooms logic to grounds room state?
  //logic makes sense. these are dice rolls
  //add remove item methods for all states!!! todo
  //grounds.fsm.setState('quest')???
  //attach at least some quest stuff to room/rooms makes sense

  const luggage =
    math.random() > 0.5
      ? rooms.all.grounds.actors.player_luggage
      : rooms.all.grounds.actors.other_luggage

  const guest2 = npcs.all[rooms.all['grounds'].stations.guest2]
  if (
    luggage.inventory.length > 0 &&
    interval == 'turn' &&
    guest2 != null &&
    guest2.clan != 'doctors'
  ) {
    const worker2 = npcs.all[rooms.all['grounds'].stations.worker2]

    if (worker2 != null && worker2.cooldown <= 0) {
      const worker2Props: ThiefVictimProps = {
        name: worker2.name,
        traits: worker2.traits,
        inventory: worker2.inventory,
        clan: worker2.clan,
        cooldown: worker2.cooldown,
        crime: 'theft',
        removeInvBonus: worker2.removeInvBonus.bind(worker2),
        addInvBonus: worker2.addInvBonus.bind(worker2),
        updateInventory: worker2.updateInventory.bind(worker2),
        addOrExtendEffect: worker2.addOrExtendEffect.bind(worker2),
        //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
      }
      if (guest2 == null) {
        take_or_stash(worker2Props, rooms.all.grounds.actors.player_luggage)
      } else {
        const guestProps: AttendantProps = {
          name: guest2.name,
          traits: guest2.traits,
          clan: guest2.clan,
          inventory: guest2.inventory,
          updateInventory: guest2.updateInventory.bind(guest2),
          addOrExtendEffect: guest2.addOrExtendEffect.bind(guest2),
        }
        const witness = npcStealCheck(worker2Props, guestProps, luggage)
        if (witness == 'witness') {
          const perp = worker2.getBehaviorProps('question') as QuestionProps
          guest2.addToBehavior(
            'active',
            new SuspectingSequence(
              guest2.getBehaviorProps.bind(guest2),
              perp,
              'theft',
              luggage
            )
          )
        }
      }
    } else if (guest2 != null && guest2.cooldown <= 0) {
      const guest2Props: ThiefVictimProps = {
        name: guest2.name,
        traits: guest2.traits,
        inventory: guest2.inventory,
        clan: guest2.clan,
        cooldown: guest2.cooldown,
        crime: 'theft',
        removeInvBonus: guest2.removeInvBonus.bind(guest2),
        addInvBonus: guest2.addInvBonus.bind(guest2),
        updateInventory: guest2.updateInventory.bind(guest2),
        addOrExtendEffect: guest2.addOrExtendEffect.bind(guest2),
        //  npcHasTask: thiefVictim.parent.npcHasTask.bind(this),
      }
      if (worker2 == null) {
        take_or_stash(guest2Props, rooms.all.grounds.actors.player_luggage)
      } else {
        const workerProps: AttendantProps = {
          name: worker2.name,
          traits: worker2.traits,
          clan: worker2.clan,
          inventory: worker2.inventory,
          updateInventory: worker2.updateInventory.bind(worker2),
          addOrExtendEffect: worker2.addOrExtendEffect.bind(worker2),
        }
        const witness = npcStealCheck(guest2Props, workerProps, luggage)
        if (witness == 'witness') {
          const perp = guest2.getBehaviorProps('question') as QuestionProps
          worker2.addToBehavior(
            'active',
            new SuspectingSequence(
              worker2.getBehaviorProps.bind(worker2),
              perp,
              'theft',
              luggage
            )
          )
        }
      }
    }
  }
  if (apple.passed == false) {
    /**   if (
      injury.passed == true &&
      interval == 'turn' &&
      rooms.all['grounds'].stations.worker1 != ''
    ) {
      const replace = rooms.all.grounds.stations.aid
      if (
        replace != '' &&
        npcs.all[replace].clan != 'doctors' &&
        npcs.all[replace].currRoom != 'grounds'
      ) {
        //const docs = shuffle(npcs.returnDoctors())
        const doc: NpcState = shuffle(npcs.returnDoctors())[0]
        let { currRoom, currStation } = doc
        //BAD should be handled by set doc npc state
        //TODO TESTjpf
        rooms.all[currRoom].stations[currStation] = ''
        rooms.all.grounds.stations.aid = doc.name
        currRoom = 'grounds'
        currStation = 'aid'*/
    /**todo testjpf ≈
        npc_action_move(
          replace,
          surrounding_room_matrix(player.matrix, npcs.all[replace].matrix)
        )√*/
    //   }
    //  }
    /**
     * so testjpf we have a propert that accepts multipl type of export functions and returns
     *
     * we then use one of those export functions, which has a more specific type.
     *
     * lint still thinks it's type is the original vague one
     */
    // eslint-disable-next-line @typescript-eslint/unbound-method
    // const _return_docs = npcs.returnDoctors
    /*
    if (
      injury.passed == true &&
      interval == 'interact' &&
      apple.passed == true &&
      rooms.all['grounds'].stations.worker1 != '' &&
      player.inventory.includes('note') == false &&
      any_has_value([_return_docs, 'vial02']) == false
    ) {
      player.inventory.push('note')
      const params = {
        path: 'grounds/tutorialmeds',
        npc: rooms.all['grounds'].stations.aid,
       cause: 'apple',
        roomName: 'grounds',
      }
      msg.post('worldproxies:/controller#novelcontroller', 'show_scene', params)
    } else if (
      injury.passed == true &&
      interval == 'interact' &&
      apple.passed == true &&
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
  medic_assist_checks()
}
function doctorsScripts() {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '0': injury, '2': apple, '5': delivery } = cons
  // bad??:: if reasonstring.startswith('quest - ')
  //then on novel_main novel.quest.solution = endof(message.reason)

  if (injury.fsm.getState() == 'active' && apple.fsm.getState() == 'new') {
    novel.reason = 'quest'
    novel.forced = true
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    return 'tutorial/tutorialAdoctor'
  } else if (apple.fsm.getState() == 'active') {
    novel.forced = true
    novel.reason = 'quest'
    //testjpf could add conditional if encounters == 0 ) {
    // "I'm going as fast as i can" -doc
    //testjpf future naming files may be better:
    //docAsksForFavor, docActiveFavor
    return apple.passed == false ? 'tutorial/hungrydoc' : 'tutorial/getadoctor'
  } else if (delivery.fsm.getState() == 'active') {
    novel.forced = true
    novel.reason = 'quest'
    return tasks.taskHasOwner('waitingformeds') == null
      ? 'tutorial/askDocAfavor'
      : 'tutorial/medAssistComplete'
  }
  return null
}

function infirmaryScripts() {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '3': meds } = cons
  if (meds.fsm.getState() == 'active' && novel.npc.currStation == 'assistant') {
    novel.forced = true
    novel.reason = 'quest'
    npcs.all[novel.npc.name].fsm.setState('turn')
    player.fsm.setState('turn')
    //testjpf there is no default for resetting these states
    // after player caught 'stealing'
    //may be case by case, will porbably need a new overall solution
    //level repeats this functionality
    return 'tutorial/giveMeMeds'
  }
  return null
}

function worker1Scripts() {
  const quest = quests.all.tutorial.medic_assist
  const { conditions: cons } = quest
  //const {"0":injury,"1":doc,"2": apple, "3": meds} = cons
  const { '0': injury } = cons
  if (injury.passed == false) {
    novel.forced = true
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
    novel.forced = true
    novel.reason = 'quest'
    return 'tutorial/concernLuggage'
  }

  return null
}

const tutorialAlookup: { [key: string]: () => string | null } = {
  //assistant: assistantScripts,
  doctors: doctorsScripts,
  worker2: worker2Scripts,
  worker1: worker1Scripts,
  infirmary: infirmaryScripts,
}

export function tutorialAscripts(actor: string): string[] {
  const scripts = []
  if (tutorialAlookup[actor] != null) scripts.push(tutorialAlookup[actor]())
  if (tutorialAlookup[npcs.all[actor].clan] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].clan]())
  if (tutorialAlookup[npcs.all[actor].currStation] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currStation]())
  if (tutorialAlookup[npcs.all[actor].currRoom] != null)
    scripts.push(tutorialAlookup[npcs.all[actor].currRoom]())

  return scripts.filter((s: string | null): s is string => s != null)
}

export function tutorialB() {
  // tutorialA()
}
