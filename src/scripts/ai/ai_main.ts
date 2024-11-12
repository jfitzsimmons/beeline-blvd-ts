//import { aidCheck } from './ai_checks'
import { baggage_checks } from './levels/baggage'
import { customs_checks } from './levels/customs'
import { reception_checks } from './levels/reception'
export interface RoomChecks {
  // aid: () => void
  reception: () => void
  customs: () => void
  baggage: () => void
}
export const aiActions: RoomChecks = {
  //testjpf can move to task fsm injured
  // aid: aidCheck,
  //these should be room fsm
  //maybe i should start form there.testjpf
  //would be cool if so checks happen before leaving room
  // some after
  reception: reception_checks,
  customs: customs_checks,
  baggage: baggage_checks,
}
