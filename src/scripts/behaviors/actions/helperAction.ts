import {
  ActionProps,
  BehaviorKeys,
  HelperProps,
} from '../../../types/behaviors'
import Action from '../action'

export default class HelperAction extends Action {
  a: HelperProps
  victim = ''
  getProps: (behavior: BehaviorKeys) => ActionProps
  constructor(
    getProps: (behavior: BehaviorKeys) => ActionProps,
    victim: string
  ) {
    const props = getProps('helper') as HelperProps
    super(props)
    this.a = props
    this.getProps = getProps
    this.victim = victim
  }
  run(): { (): void } {
    if (
      this.a.returnNpc(this.victim).hp > 0 ||
      this.a.getMendingQueue().includes(this.victim)
    ) {
      this.a.addAdjustMendingQueue(this.victim)
      return () =>
        this.fail(
          `||>> Behavior: HELPERACTION:: injured:${this.victim} has already been helped. AdjustedQueue. Job Done.`
        )
    }

    const prevRoom = Object.values(this.a.getOccupants(this.a.exitRoom)).filter(
      (s: string) =>
        s.slice(0, 3) === 'doc' &&
        this.a.returnNpc(s).exitRoom == this.a.currRoom
    )
    if (prevRoom.length > 0)
      print(
        '|> HelperAction: Helper and Doc are in Separate Rooms, but crossed Paths. TODO! testjpf'
      )
    const currRoom = Object.values(this.a.getOccupants(this.a.currRoom)).filter(
      (s: string) => s.slice(0, 3) === 'doc'
    )

    for (const helper of [...new Set([...prevRoom, ...currRoom])]) {
      if (this.a.returnNpc(helper).turnPriority < 97 && math.random() > 0.4) {
        //available doctor found
        this.a.addAdjustMendingQueue(this.victim)
        print(
          '||>> Behavior: HELPERACTION',
          helper,
          'was told to get help by',
          this.a.name,
          'for:',
          this.victim
        )
        return () => this.success()
      }
    }

    return () =>
      this.continue(
        '|>:: Default - Add Another HelperSequence for:' + this.a.name
      )
  }
  continue(s: string): string {
    print('|||>>> Behavior: HELPERAction:: Continue:', s)
    return 'continue'
  }
}
