import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'
import QuestionSequence from '../sequences/questionSequence'

export default class SnitchAction extends Action {
  a: HelperProps
  perp: HelperProps
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    perp: HelperProps
  ) {
    const props = getProps('helper') as HelperProps
    super(props)
    this.a = props
    this.getProps = getProps
    this.perp = perp
  }
  run(): { (): void } {
    print(
      'INCASE THERES AN EXIT ROOM CRASH:::',
      this.a.exitRoom,
      this.a.name,
      this.a.currRoom,
      this.a.currStation
    )
    const prevRoom = Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
      (s: string) =>
        s.slice(0, 4) === 'secu' &&
        this.a.returnNpc(s).exitRoom == this.a.currRoom
    )
    const currRoom = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
      (s: string) => s.slice(0, 4) === 'secu'
    )

    for (const c of [...new Set([...prevRoom, ...currRoom])]) {
      const cop = this.a.returnNpc(c)
      if (cop.turnPriority < 96 && math.random() > 0.1) {
        //available doctor found
        // this.a.addAdjustMendingQueue(this.perp.name)
        print(
          'SnitchACTION',
          cop.name,
          'was told to get help by',
          this.a.name,
          'for questioning:',
          this.perp.name
        )
        const perp =
          this.perp.name === 'player'
            ? cop.parent.returnPlayer()
            : cop.parent.returnNpc(this.perp.name)
        cop.addToBehavior(
          'active',
          new QuestionSequence(
            cop.getBehaviorProps.bind(cop),
            perp.getBehaviorProps.bind(perp)
          )
        )
        return () => this.success()
      }
    }

    return () =>
      this.continue(
        'Snitchaction:: Default - Add Another HelperSequence for:' + this.a.name
      )
  }
  continue(s: string): string {
    print('SnitchAction:: Continue:', s)
    return 'continue'
  }
}
