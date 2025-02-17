import ActorState from '../states/actor'

export default class Action {
  action?: { (): void }
  actor: ActorState
  constructor(actorProps: ActorState) {
    this.actor = actorProps
    this.run = this.run.bind(this)
  }
  run() {
    print(this.actor.name)
    // return this.action
  }
}
