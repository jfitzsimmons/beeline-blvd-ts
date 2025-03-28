export interface url {
  fragment: hash
}
export type NoOptionals<T> = {
  [K in keyof T]-?: T[K]
}

export type WindowHack = {
  get_display_scale(): number
}
