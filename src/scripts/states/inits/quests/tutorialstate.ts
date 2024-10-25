import { AllQuestsMethods } from '../../../../types/tasks'
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
  questmethods: AllQuestsMethods
): { [key: string]: QuestState } => {
  //const { nq, tq, nvq } = questmethods
  const { nq, nvq } = questmethods
  //testjpf tod need to add options to class params
  return {
    medic_assist: new QuestState({
      passed: false,
      conditions: {
        //testjfpf like new QuestState but new QuestStep()
        ['0']: new QuestStep({
          label: 'Agree to help injured man',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'helpthatman']],
        }), //have you talked to a doctor?
        ['1']: new QuestStep({
          label: 'What is up doctor?!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'getadoctor']],
        }), //have you talked to a doctor?
        ['2']: new QuestStep({
          label: 'Apple a day!',
          solution: '',
          passed: false,
          interval: ['interact'],
          //testjpf need to rethink this!! TODO!!!
          // use this if takes to long??? auto pass, last default?!!
          func: [returnfalse],
          args: [[returnfalse, false]],
        }),
        ['3']: new QuestStep({
          label: 'Get some meds!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [any_has_value],
          args: [[nq.return_doctors, 'vial02']],
        }), //gets keycard, goes to infirmary, gets meds
        ['4']: new QuestStep({
          label: 'Got those meds!',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'favormedsquest']],
        }), //have you talked to a doctor?
        ['5']: new QuestStep({
          label: 'Delive these meds?',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [returnfalse],
          args: [[returnfalse, false]],
        }), //have you talked to a doctor?
        ['6']: new QuestStep({
          label: 'Meds delivered',
          solution: '',
          passed: false,
          interval: ['interact'],
          func: [does_equal],
          args: [[nvq.get_reason, 'medassistcomplete']],
        }), //have you talked to a doctor?
      },
      /** 
      side_quests: {
        ['1']: {
          label: 'Basically a doctor.',
          solution: '',
          passed: false,
          interval: ['turn'],
          func: [returnfalse],
          args: [[returnfalse, false]],
        },
      },*/
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
          args: [[nq.return_order_all, 5]],
        }, //1st // labor003
      },
    },
  })*/
}
