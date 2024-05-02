import { WorldQuests, ObjectivesGroup } from '../../types/tasks'

function build_objectives(quests: WorldQuests): ObjectivesGroup {
  const objectives: ObjectivesGroup | null = {
    tutorial: {
      status: '',
      quest: {
        ['medic_assist']: {
          status: '',
          objective: {
            [0]: {
              status: '',
              label: '',
            },
          },
        },
      },
    },
  }
  //ex tutorial
  let cPoint: keyof typeof quests
  for (cPoint in quests) {
    print('INFO::: cPoint in quests::', cPoint)
    objectives[cPoint] = {
      status: 'none',
      quest: {},
    }
    const checkpoint = quests[cPoint]
    //ex med_assist
    let qKey: keyof typeof checkpoint
    for (qKey in checkpoint) {
      print('INFO::: qKey in checkpoint::', qKey)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      objectives[cPoint].quest[qKey] = {
        status: 'none',
        objective: {},
      }
      const conditions = checkpoint[qKey].conditions
      //
      let cNum: keyof typeof conditions
      for (cNum in conditions) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        objectives[cPoint].quest[qKey].objective[cNum] = {
          status: 'none',
          label: conditions[cNum].label,
        }
      }
    }
  }
  return objectives
}
export default class WorldInfo {
  objectives: ObjectivesGroup

  constructor(quests: WorldQuests) {
    //testjpf
    //need a function that uses the quests arg and
    // builds objectives
    this.objectives = build_objectives(quests)
    //this._cautions = []
    // this._quests = build_quests(this.questmethods)
    // this._spawn = 'grounds'
    // this.medicQueue = []
  }
}
