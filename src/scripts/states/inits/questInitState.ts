import { Quests } from '../../../types/tasks'

export const QuestsInitState: Quests = {
  world_example_start: {
    id: '',
    // nextId: '',
    checkpoint: '',
    scope: '',
    unlocks: [],
    stage: 0,
    stages: [
      {
        status: {
          active: false,
          passed: false,
          see: false,
          archive: false,
        },
        note: '',
        tasks: [{ type: '', subtype: '', name: '', operator: '', value: '' }],
      },
    ],
    status: {
      active: false,
      passed: false,
      see: false,
      archive: false,
    },
  },
}
