/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//local npcs = require "main.states.npcstates"
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
//const questutils = require('../../../main.utils.quest')
import { AllQuestsMethods, Quests } from '../../../../types/state'
//TESTJPF THESE util imports require state
//STATE hasnt been CREATED!
import {
  any_has_value,
  convos_check,
  has_value,
  max_skills,
  returnfalse,
  max_love,
} from '../../../utils/quest'
//TESTJPF abovenot loaded yet on GAME STATE CREAT new game
//local player = require "main.states.playerstate"

export const tutorialQuests = (questmethods: AllQuestsMethods): Quests => {
  const { pq, nq } = questmethods
  return {
    medic_assist: {
      passed: false,
      //testjpf for TS: so abstract
      //the binary passed: true/false
      // or pupulate the func and args from the World level??
      conditions: {
        [1]: {
          // testjpf whatif
          label: 'Somebody help that man!',
          solution: '',
          passed: false,
          interval: 'interact',
          func: [convos_check],
          // what if instead of nq.return_docs
          // its quest.return doctors?
          args: [[nq.return_doctors, 1]],
        }, //have you talked to a doctor?
        [2]: {
          label: 'get an apple!',
          solution: '',
          passed: false,
          interval: 'interact',
          func: [any_has_value],
          args: [[nq.return_doctors, 'apple01']],
        }, // doc needs some item
        [3]: {
          label: 'Get some meds!',
          solution: '',
          passed: false,
          interval: 'interact',
          func: [any_has_value],
          args: [[nq.return_doctors, 'vial02']],
        }, //gets keycard, goes to infirmary, gets meds
      },
    }, // charmer
    npcs_like_you: {
      passed: false,
      conditions: {
        [1]: {
          label: 'Make them like you!',
          solution: '',
          passed: false,
          interval: 'interact',
          func: [max_love],
          args: [[nq.return_order_all, 5]],
        }, //1st // labor003
      },
    }, // charmer
    maxout_skill: {
      passed: false,
      conditions: {
        [1]: {
          passed: false,
          interval: 'interact',
          func: [max_skills],
          args: [[pq.return_skills, 3]],
        }, // speed
      },
    }, // go getter
    ai_puzzle: {
      passed: false,
      conditions: {
        [1]: {
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // flag maintenance
        [2]: {
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // "unscrew monitor"
        [3]: {
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // help maintenance
      },
    }, // technician
    obtain_luggage: {
      passed: false,
      conditions: {
        [1]: {
          passed: false,
          interval: 'interact',
          func: [has_value],
          args: [[pq.return_inventory, 'berry01']],
        },
        [2]: {
          passed: false,
          interval: 'interact',
          func: [has_value],
          args: [[pq.return_inventory, 'feather01']],
        },
        [3]: {
          passed: false,
          interval: 'interact',
          func: [has_value],
          args: [[pq.return_inventory, 'magica1']],
        },
      },
    }, // DIY
    key_card: {
      passed: false,
      conditions: {
        [1]: {
          passed: false,
          interval: 'interact',
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // steal a key card
        [2]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // find blank id form
        [3]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // learn to make a forgery
      },
    }, // fake id
    charm_authority: {
      passed: false,
      conditions: {
        [1]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // pass a "perfect" charm check
        [2]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // complete a side quest
        [3]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // at least 1 church, security and corps love
      },
      side_quests: {
        [1]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        },
        [2]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // key card
      },
    }, // vouged for
    charm_gangs: {
      passed: false,
      conditions: {
        [1]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // pass a "perfect" charm check
        [2]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // complete a side quest
        [3]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // 3 of 4 gang loves
      },
      side_quests: {
        [1]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        },
        [2]: {
          interval: 'turn',
          passed: false,
          func: [returnfalse],
          args: [[returnfalse, false]],
        }, // ai maintenace
      },
    }, // vouged for
  }
}
