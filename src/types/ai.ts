import { Traits } from './state'
import { Effect } from './tasks'

export interface Direction {
  center: { x: number; y: number }
  front: { x: number; y: number }
  back: { x: number; y: number }
  left: { x: number; y: number }
  right: { x: number; y: number }
}

export interface ThiefVictimProps {
  name: string
  addInvBonus: (chest_item: string) => void
  removeInvBonus: (chest_item: string) => void
  updateInventory: (addDelete: 'add' | 'delete', item: string) => void
  addOrExtendEffect(e: Effect): void
  crime: string
  traits: Traits
  inventory: string[]
  cooldown: number
  clan: string
}

export interface AttendantProps {
  name: string
  traits: Traits
  clan: string
  inventory: string[]
  updateInventory: (addDelete: 'add' | 'delete', item: string) => void
  addOrExtendEffect(e: Effect): void
}
