import { ImmobileProps } from '../../../types/behaviors'
import Action from '../action'

export default class ImmobileAction extends Action {
  a: ImmobileProps
  constructor(a: ImmobileProps) {
    super()
    this.a = a
    this.fail = this.fail.bind(this)
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
