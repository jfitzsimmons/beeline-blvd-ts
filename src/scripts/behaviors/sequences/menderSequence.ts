import ActorState from '../../states/actor'
import { isNpc } from '../../utils/ai'
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
    if (isNpc(this.a))
      print(
        'MENDERSEQ CREATED!!!:: DOC,a::',
        a.name,
        mendee,
        this.a.sincePlayerRoom,
        this.a.currRoom,
        this.a.currStation
      )
  }
  run(): 'REMOVE' | '' {
    if (isNpc(this.a)) this.a.sincePlayerRoom = 98

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
