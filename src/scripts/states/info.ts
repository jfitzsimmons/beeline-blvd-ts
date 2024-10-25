import {
  ObjectivesGroup,
  ObjectivesGroupOpt,
  QuestsState,
} from '../../types/tasks'

export default class WorldInfo {
  private _objectives: ObjectivesGroup
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

  constructor(quests: QuestsState) {
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
    this.build_objectives = this.build_objectives.bind(this)
    this._objectives = {}
    this.build_objectives({ ...quests })
  }
  public set objectives(o: ObjectivesGroup) {
    this._objectives = { ...o }
  }
  public get objectives() {
    return this._objectives
  }

  build_objectives(quests: QuestsState) {
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
          status: checkpoint[qKey].fsm.getState(),
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
    this.objectives = { ...objectives }
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
