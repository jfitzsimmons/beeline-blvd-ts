import ActorState from '../../states/actor'
import Action from '../action'

export default class EffectsAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): () => void {
    const { effects, traits } = this.actor
    if (effects.length < 1) return () => this.fail('No FX to remove')
    for (const effect of effects) {
      if (effect.turns < 0) {
        traits[effect.fx.type]![effect.fx.stat] =
          traits[effect.fx.type]![effect.fx.stat] - effect.fx.adjustment
        effects.splice(effects.indexOf(effect), 1)
      } else {
        effect.turns = effect.turns - 1
      }
    }

    return () => this.success()
  }
}
