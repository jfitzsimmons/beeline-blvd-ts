//const dt = math.randomseed(os.time())

import { ActorProps } from '../../types/state'

export default class Storage {
  inventory: string[]
  watcher?: string
  actions: string[]
  name: string

  constructor(actor: ActorProps) {
    this.name = actor.name
    this.inventory = actor.inventory
    this.watcher = actor.watcher
    this.actions = actor.actions

    //this._spawn = 'grounds'
    //this.mendingQueue = []
    this.updateInventory = this.updateInventory.bind(this)
  }

  updateInventory(addDelete: 'add' | 'delete', item: string) {
    const inventory = this.inventory

    addDelete == 'add'
      ? inventory.push(item)
      : inventory.splice(1, inventory.indexOf(item))
  }
}
