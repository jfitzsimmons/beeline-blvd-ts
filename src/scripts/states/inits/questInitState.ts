import { Quests, Unlocks } from '../../../types/tasks'

export const UnlockInitState: Unlocks = {
  quest_world_example: {
    id: '',
    unlock: () => false,
  },
}

export const QuestsInitState: Quests = {
  world_example_start: {
    id: '',
    // nextId: '',
    checkpoint: '',
    scope: '',
    unlockSubKeys: [],
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
