import { aidCheck, clearance_checks } from './ai_checks'
import { baggage_checks } from './levels/baggage'
import { customs_checks } from './levels/customs'
import { reception_checks } from './levels/reception'

export function aiActions() {
  clearance_checks()
  aidCheck()

  reception_checks()
  customs_checks()
  baggage_checks()
}
