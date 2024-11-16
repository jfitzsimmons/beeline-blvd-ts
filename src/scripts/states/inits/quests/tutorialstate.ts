import { WorldQuestsMethods } from '../../../../types/world'
import {
  any_has_value,
  // max_love,
  does_equal,
  //greater_than,
  returnfalse,
} from '../../../utils/quest'
import QuestState from '../../quest'
import QuestStep from '../../questStep'

export const tutorialQuests = (
  questmethods: WorldQuestsMethods
): { [key: string]: QuestState } => {
  const { nq, nvq } = questmethods
  return {
    medic_assist: new QuestState({
      id: 'qma',
      passed: false,
      conditions: {
        ['0']: new QuestStep({
          id: 'qmahtm',
          label: 'Agree to help injured man',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'helpthatman']],
        }), //have you talked to a doctor?
        ['1']: new QuestStep({
          id: 'qmagad',
          label: 'What is up doctor?!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'getadoctor']],
        }), //have you talked to a doctor?
        ['2']: new QuestStep({
          id: 'qmaaad',
          label: 'Apple a day!',
          solution: '',
          passed: false,
          interval: ['interact'],
          //testjpf need to rethink this!! TODO!!!
          // use this if takes to long??? auto pass, last default?!!
          func: [does_equal],
          args: [[nvq.get_novel_item, 'apple01']],
        }),
        ['3']: new QuestStep({
          id: 'qmagsm',
          label: 'Get some meds!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [any_has_value],
          args: [[nq.returnDoctors, 'vial02']],
        }), //gets keycard, goes to infirmary, gets meds
        ['4']: new QuestStep({
          id: 'qmafmq',
          label: 'Got those meds!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'favormedsquest']],
        }), //have you talked to a doctor?
        ['5']: new QuestStep({
          id: 'qmadtm',
          label: 'Delive these meds?',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [returnfalse],
          args: [[returnfalse, false]],
        }), //have you talked to a doctor?
        ['6']: new QuestStep({
          id: 'qmamac',
          label: 'Meds delivered',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'medassistcomplete']],
        }), //have you talked to a doctor?
      },
      side_quests: {
        hallpass: {
          label: 'Aquire temporary clearance',
          solution: '',
          passed: false,
        },
      },
    }),
  }

  /** 
  new QuestState({
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
    },
  })

  new QuestState({
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
          args: [[nq.returnOrderAll, 5]],
        }, //1st // labor003
      },
    },
  })*/
}
