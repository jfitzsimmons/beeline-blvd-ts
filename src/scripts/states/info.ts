import { WorldQuests, ObjectivesGroup } from '../../types/tasks'

function build_objectives(quests: WorldQuests): ObjectivesGroup {
  const objectives: ObjectivesGroup = {
    status: '',
  }
  //ex tutorial
  let cPoint: keyof typeof quests
  for (cPoint in quests) {
    objectives[cPoint] = {
      status: 'none',
    }
    const checkpoint = quests[cPoint]
    //ex med_assist
    let qKey: keyof typeof checkpoint
    for (qKey in checkpoint) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      objectives[cPoint][qKey] = {
        status: 'none',
        conditions: {},
      }
      const conditions = checkpoint[qKey].conditions
      //
      let cNum: keyof typeof conditions
      for (cNum in conditions) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        objectives[cPoint][qKey].conditions[cNum] = {
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
