import { ImmobileProps } from '../../../types/behaviors'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ImmobileProps
  constructor(a: ImmobileProps) {
    super(a)
    this.a = a
    this.fail = this.fail.bind(this)

    // if (isNpc(this.a))
    // print('NEWIMMOBILEACT::: FOR::', this.a.name, 'SPR:::', this.a.turnPriority)
  }
  run(): { (): void } {
    return () => this.success()
  }
  success() {
    print(
      '>>> => Behavior: success: IMMOBILEACT::: 4::',
      this.a.name,
      this.a.turnPriority,
      this.a.currRoom,
      this.a.currStation
    )
    this.a.pruneStationMap(this.a.currRoom, this.a.currStation)
  }
}
