import { Moment } from '../../../types/tasks'
import {
  admin1StealStash1,
  baggageStealStash1,
  customsStealStash1,
  groundsStealStash1,
  infirmaryStealStash1,
  receptionsStealStash1,
} from '../schedules/roomMoments'
//import { wtm0injured, wtm1procure } from '../tasks/checkpoints/tutorial/stage0'

export default {
  //testjpf. can probably abstract stealstash to be more universal
  moments: {
    receptionsStealStash1: {
      id: 'receptionsStealStash1',
      tick: () => receptionsStealStash1(),
    },
    infirmaryStealStash1: {
      id: 'infirmaryStealStash1',
      tick: () => infirmaryStealStash1(),
    },
    groundsStealStash1: {
      id: 'groundsStealStash1',
      tick: () => groundsStealStash1(),
    },
    customsStealStash1: {
      id: 'customsStealStash1',
      tick: () => customsStealStash1(),
    },
    baggageStealStash1: {
      id: 'baggageStealStash1',
      tick: () => baggageStealStash1(),
    },
    admin1StealStash1: {
      id: 'admin1StealStash1',
      tick: () => admin1StealStash1(),
    },
  },
} as { [key: string]: { [key: string]: Moment } }
