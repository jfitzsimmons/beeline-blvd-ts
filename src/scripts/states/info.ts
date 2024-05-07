import {
  WorldQuests,
  ObjectivesGroup,
  ObjectivesGroupOpt,
} from '../../types/tasks'

function build_objectives(quests: WorldQuests): ObjectivesGroup {
  const objectives: ObjectivesGroupOpt = {}
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

      objectives[cPoint].quest[qKey] = {
        status: checkpoint[qKey].status,
        objective: {},
      }
      const conditions = checkpoint[qKey].conditions
      //
      let cNum: keyof typeof conditions
      for (cNum in conditions) {
        objectives[cPoint].quest[qKey].objective[cNum] = {
          status: conditions[cNum].status,
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
    this.objectives = build_objectives(quests)
    this.rebuild_objectives = this.rebuild_objectives.bind(this)
  }
  rebuild_objectives(quests: WorldQuests) {
    this.objectives = build_objectives(quests)
  }
}
