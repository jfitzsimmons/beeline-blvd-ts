import ActorState from '../../states/actor'
import { RoomsInitLayout } from '../../states/inits/roomsInitState'
import Action from '../action'

export default class EffectsAction extends Action {
  constructor(a: ActorState) {
    super(a)
  }
  run(): { (): void } {
    //move func logic here
    // this.actor.remove_effects(this.actor.effects)
    const { effects } = this.actor
    if (this.actor.effects.length < 1) return fail('nofx')
    //let eKey: keyof typeof
    for (const effect of effects) {
      if (effect.turns < 0) {
        this.actor.traits[effect.fx.type]![effect.fx.stat] =
          this.actor.traits[effect.fx.type]![effect.fx.stat] -
          effect.fx.adjustment
        effects.splice(effects.indexOf(effect), 1)
      } else {
        effect.turns = effect.turns - 1
      }
    }

    if (testjpfimmobile) return alternate(ImmobileAction(this))
    if (testjpf) return fail('youfailed')
    return success()
  }
}
