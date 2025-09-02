import { Quests } from '../../../types/tasks'

export const QuestsInitState: Quests = {
  world_example_start: {
    id: '',
    nextId: '',
    checkpoint: '',
    scope: '',
    status: {
      active: false,
      passed: false,
      see: false,
      archive: false,
    },
  },
}
