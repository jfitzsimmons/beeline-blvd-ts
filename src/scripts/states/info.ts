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
    objectives[cPoint] = {
      status: 'none',
      quest: {},
    }
    const checkpoint = quests[cPoint]
    //ex med_assist
    let qKey: keyof typeof checkpoint
    for (qKey in checkpoint) {
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
  interactions: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ]
  rumors: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ]

  constructor(quests: WorldQuests) {
    this.interactions = [
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
    ]
    this.rumors = [
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
      'asdf',
    ]
    this.objectives = build_objectives(quests)
    this.rebuild_objectives = this.rebuild_objectives.bind(this)
  }
  rebuild_objectives(quests: WorldQuests) {
    this.objectives = build_objectives(quests)
  }
  add_interaction(i: string) {
    this.interactions.pop()
    this.interactions.unshift(i)
  }
  add_rumor(r: string) {
    this.rumors.pop()
    this.rumors.unshift(r)
  }
}
