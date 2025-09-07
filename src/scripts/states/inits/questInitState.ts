import { Novels } from '../../../types/novel'
import { Quests, Unlocks } from '../../../types/tasks'

export const NovelsInitState: Novels = {
  quest_wtm0_default: {
    type: '',
    name: '',
    id: '',
    stage: 0,
    mood: '',
    owned: false,
    last: Infinity,
    read: 0,
  },
}

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
    novelKeys: [],
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
