import ActorState from '../../states/actor'
import Action from '../action'
import MenderAction from '../actions/menderAction'
import Sequence from '../sequence'
import ImmobileSequence from './immobileSequence'
import PlaceSequence from './placeSequence'

export default class MenderSequence extends Sequence {
  a: ActorState
  mendee: string
  constructor(a: ActorState, mendee: string) {
    const turnActions: Action[] = []

    turnActions.push(...[new MenderAction(a, mendee)]) //ne to add MoveNpcAction?

    super(turnActions)
    this.a = a
    this.mendee = mendee
    //print('INJUREDSEQ CREATED!!!')
  }
  run(): 'REMOVE' | '' {
    // print('INJUREDSEQ RUNRUNRUN!!!')
    print('Mend-ER-Sequence:: Running for:', this.a.name)

    for (const child of this.children) {
      const proceed = child.run()()
      if (proceed === 'continue') {
        this.a.behavior.active.children.push(
          new MenderSequence(this.a, this.mendee)
        )
        this.a.behavior.place.children.push(new ImmobileSequence(this.a))
      } else {
        this.a.behavior.place.children.push(new PlaceSequence(this.a))
      }
      //testjpf ex::!!!!
      //this.a.behavior.active.children.push(
      // new ImmobileSequence(this.a, this.mendee)
      //)
    }

    //  const hurt = npcs.all[ts[i].target].hp < 5

    /**
    if (hurt == false) {
      ts[i].turns = 0
      npcs.all[ts[i].owner].fsm.setState('turn')
    }
      */
    return 'REMOVE'
  }
}
