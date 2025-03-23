//import { aidCheck } from './ai_checks'
import { baggage_checks } from './levels/baggage'
import { customs_checks } from './levels/customs'
import { grounds_checks } from './levels/grounds'
import { reception_checks } from './levels/reception'
export interface RoomChecks {
  reception: () => void
  customs: () => void
  baggage: () => void
  grounds: () => void
}
export const aiActions: RoomChecks = {
  reception: reception_checks,
  customs: customs_checks,
  grounds: grounds_checks,
  baggage: baggage_checks,
}
