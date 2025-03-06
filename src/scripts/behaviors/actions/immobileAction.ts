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
    print(
      'IMMOBILEACT::: SPR::',
      this.a.name,
      this.a.turnPriority,
      this.a.currRoom,
      this.a.currStation
    )
    this.a.pruneStationMap(this.a.currRoom, this.a.currStation)

    return () => this.fail()
  }
  fail() {
    print(`ImmobileAction:: ${this.a.name}: DidNotPlace.`)
  }
}
