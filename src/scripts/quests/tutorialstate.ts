/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
//local npcs = require "main.states.npcstates"
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const questutils = require('../../../main.utils.quest')
import { AllQuestsMethods, Quests } from '../../types/state'

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
          passed: false,
          interval: 'interact',
          func: questutils.convos_check,
          // what if instead of nq.return_docs
          // its quest.return doctors?
          args: [nq.return_doctors, 1],
        }, //have you talked to a doctor?
        [2]: {
          passed: false,
          interval: 'interact',
          func: questutils.any_has_value,
          args: [nq.return_doctors, hash('apple01')],
        }, // doc needs some item
        [3]: {
          passed: false,
          interval: 'interact',
          func: questutils.any_has_value,
          args: [nq.return_doctors, hash('vial02')],
        }, //gets keycard, goes to infirmary, gets meds
      },
    }, // charmer
    npcs_like_you: {
      passed: false,
      conditions: {
        [1]: {
          interval: 'interact',
          func: questutils.max_love,
          args: [nq.return_all, 5],
        }, //1st // labor003
      },
    }, // charmer
    maxout_skill: {
      passed: false,
      conditions: {
        [1]: {
          interval: 'interact',
          func: questutils.max_skills,
          args: [pq.return_skills, 3],
        }, // speed
      },
    }, // go getter
    ai_puzzle: {
      passed: false,
      conditions: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        }, // flag maintenance
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // "unscrew monitor"
        [3]: {
          func: questutils.returnfalse,
          args: [],
        }, // help maintenance
      },
    }, // technician
    obtain_luggage: {
      passed: false,
      conditions: {
        [1]: {
          interval: 'interact',
          func: questutils.has_value,
          args: [pq.return_inventory, hash('berry01')],
        },
        [2]: {
          interval: 'interact',
          func: questutils.has_value,
          args: [pq.return_inventory, hash('feather01')],
        },
        [3]: {
          interval: 'interact',
          func: questutils.has_value,
          args: [pq.return_inventory, hash('magica1')],
        },
      },
    }, // DIY
    key_card: {
      passed: false,
      conditions: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        }, // steal a key card
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // find blank id form
        [3]: {
          func: questutils.returnfalse,
          args: [],
        }, // learn to make a forgery
      },
    }, // fake id
    charm_authority: {
      passed: false,
      conditions: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        }, // pass a "perfect" charm check
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // complete a side quest
        [3]: {
          func: questutils.returnfalse,
          args: [],
        }, // at least 1 church, security and corps love
      },
      side_quests: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        },
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // key card
      },
    }, // vouged for
    charm_gangs: {
      passed: false,
      conditions: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        }, // pass a "perfect" charm check
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // complete a side quest
        [3]: {
          func: questutils.returnfalse,
          args: [],
        }, // 3 of 4 gang loves
      },
      side_quests: {
        [1]: {
          func: questutils.returnfalse,
          args: [],
        },
        [2]: {
          func: questutils.returnfalse,
          args: [],
        }, // ai maintenace
      },
    }, // vouged for
  }
}
