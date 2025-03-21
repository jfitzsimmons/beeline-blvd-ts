import { EffectsProps, GetProps } from '../../../types/behaviors'
import Action from '../action'

export default class EffectsAction extends Action {
  a: EffectsProps
  constructor(getProps: GetProps) {
    const props = getProps('effects') as EffectsProps
    super()
    this.a = props
  }
  run(): () => void {
    const { effects, traits } = this.a
    if (effects.length < 1)
      return () =>
        this.fail('||>> Behavior: Action: EFFECTaction:: No FX to remove')
    //if (effects.length < 1) return () => this.fail()

    for (let i = effects.length; i-- !== 0; ) {
      const e = effects[i]
      if (e.turns < 0) {
        print('> Behavior: Action: EFFECTaction:: removed:', e.label)
        traits[e.fx.type]![e.fx.stat] =
          traits[e.fx.type]![e.fx.stat] - e.fx.adjustment
        effects.splice(i, 1)
      } else {
        e.turns = e.turns - 1
      }
    }

    return () =>
      this.success(
        `||>> Behavior: Success EffectAction: Next FX, length: ${
          effects.length > 0 ? effects[0].label : 'empty'
        } ${effects.length}`
      )
  }
  success(s?: string): void {
    print('|||>>> Behavior: TrespassAction:: Success:', s)
  }
}
