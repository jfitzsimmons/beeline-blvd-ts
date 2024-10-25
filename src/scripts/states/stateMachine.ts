interface IState {
  name: string
  //testjpf might need more specific turn based thing.
  onEnter?: () => void
  onUpdate?: (dt: number) => void
  onExit?: () => void
}

// simple global id counter
let idCount = 0

export default class StateMachine {
  private states = new Map<string, IState>()
  private currentState?: IState
  private id = (++idCount).toString()
  private context?: object
  private isChangingState = false
  private changeStateQueue: string[] = []

  constructor(context?: object, id?: string) {
    this.id = id ?? this.id
    this.context = context
  }

  isCurrentState(name: string) {
    if (!this.currentState) {
      return false
    }

    return this.currentState.name === name
  }

  addState(
    name: string,
    config?: {
      onEnter?: () => void
      onUpdate?: (dt: number) => void
      onExit?: () => void
    }
  ) {
    const context = this.context

    this.states.set(name, {
      name,
      onEnter: config?.onEnter?.bind(context),
      onUpdate: config?.onUpdate?.bind(context),
      onExit: config?.onExit?.bind(context),
    })

    return this
  }
  getState(): string {
    if (!this.currentState) {
      return ''
    }

    return this.currentState.name
  }
  setState(name: string) {
    if (!this.states.has(name)) {
      print(`Tried to change to unknown state: ${name}`)
      return
    }

    if (this.isCurrentState(name)) {
      return
    }

    if (this.isChangingState) {
      this.changeStateQueue.push(name)
      return
    }

    this.isChangingState = true

    print(
      `[StateMachine (${this.id})] change from ${
        this.currentState?.name ?? 'none'
      } to ${name}`
    )

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit()
    }

    this.currentState = this.states.get(name)!

    if (this.currentState.onEnter) {
      this.currentState.onEnter()
    }

    this.isChangingState = false
  }

  update(dt: number) {
    if (this.changeStateQueue.length > 0) {
      this.setState(this.changeStateQueue.shift()!)
      return
    }

    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(dt)
    }
  }
}
