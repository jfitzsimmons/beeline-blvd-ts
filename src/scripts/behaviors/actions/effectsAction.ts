import ActorState from '../../states/actor'
import Action from '../action'

export default class EffectsAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  fail() {
    // no log
  }
  run(): () => void {
    const { effects, traits } = this.actor
    // if (effects.length < 1) return () => this.fail('No FX to remove')
    if (effects.length < 1) return () => this.fail()

    for (let i = effects.length; i-- !== 0; ) {
      const e = effects[i]
      if (e.turns < 0) {
        traits[e.fx.type]![e.fx.stat] =
          traits[e.fx.type]![e.fx.stat] - e.fx.adjustment
        effects.splice(i, 1)
      } else {
        e.turns = e.turns - 1
      }
    }

    return () => this.success()
  }
}
