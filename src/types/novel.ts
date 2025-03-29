import { Traits } from './state'

export interface Typewriter {
  state: string
  textspeed: number
  letter_fadein: number
  letter_fadeout: number
  line_spacing_scale: number
  zoom_speed: number
  scale: number
  node: node
  auto: boolean
  letter_nodes: { [key: string]: node }
  text: string
  parent: node
  instant_node: node | null
  init: (arg: string) => void
  set_node: () => void
  set_options: (arg: any) => void
  start: (arg: string) => void
  set_instant_text: (arg: string) => void
  hide_instant_text: () => void
  next: () => void
  set_scale: (arg: number) => void
  redraw: () => void
  get_state: () => string
}

export interface NovelNpc {
  name: string
  clan: string
  convos: number
  traits: Traits
  sincePlayerConvo: number
  love: number
  currStation: string
}
