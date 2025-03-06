import { Traits } from './state'

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

  traits: Traits
  inventory: string[]
  cooldown: number
  clan: string
}

export interface AttendantProps {
  name: string
  traits: Traits
  clan: string
  taskBuilder(o: string, label: string, target: string, cause: string): void
}
