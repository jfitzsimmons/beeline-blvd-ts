import { Unlock } from '../../../types/tasks'
import { wtm0injured } from '../tasks/checkpoints/tutorial/stage0'

export default {
  wtm0injured: {
    id: 'wtm0injured',
    unlock: (p: string) => wtm0injured({ patient: p }),
  },
} as { [key: string]: Unlock }
