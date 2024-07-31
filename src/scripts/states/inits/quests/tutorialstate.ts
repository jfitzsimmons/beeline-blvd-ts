import { AllQuestsMethods, Quests } from '../../../../types/tasks'
import {
  any_has_value,
  max_love,
  does_equal,
  greater_than,
  returnfalse,
  // greater_than,
} from '../../../utils/quest'

export const tutorialQuests = (questmethods: AllQuestsMethods): Quests => {
  //const { nq, tq, nvq } = questmethods
  const { nq, nvq, tq } = questmethods

  return {
    medic_assist: {
      passed: false,
      status: 'inactive',
      conditions: {
        [0]: {
          label: 'Agree to help injured man',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'helpthatman']],
        }, //have you talked to a doctor?
        [1]: {
          label: 'What is up doctor?!',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'getadoctor']],
        }, //have you talked to a doctor?
        [2]: {
          label: 'Apple a day!',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          //testjpf need to rethink this!! TODO!!!
          // use this if takes to long??? auto pass, last default?!!
          func: [returnfalse],
          args: [[returnfalse, false]],
        },
        /** 
        [2]: {
          label: 'get an apple!',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          func: [any_has_value],
          args: [[nq.return_doctors, 'apple01']],
        },*/ // doc needs some item
        [3]: {
          label: 'Get some meds!',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          func: [any_has_value],
          args: [[nq.return_doctors, 'vial02']],
        }, //gets keycard, goes to infirmary, gets meds
      },
    },
    pass_customs: {
      passed: false,
      status: 'active',
      conditions: {
        [0]: {
          label: 'I need some ID!',
          solution: '',
          passed: false,
          status: 'active',
          interval: ['turn'],
          func: [greater_than],
          args: [[tq.percent_tutorial, 90]],
        }, //have you talked to a doctor?
      },
    }, // charmer

    npcs_like_you: {
      passed: false,
      status: 'inactive',
      conditions: {
        [1]: {
          label: 'Make them like you!',
          solution: '',
          passed: false,
          status: 'inactive',
          interval: ['interact'],
          func: [max_love],
          args: [[nq.return_order_all, 5]],
        }, //1st // labor003
      },
    }, // charmer
    /** 
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
    **/
  }
}
