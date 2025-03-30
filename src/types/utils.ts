export interface url {
  fragment: hash
}
export type NoOptionals<T> = {
  [K in keyof T]-?: T[K]
}

export type WindowHack = {
  get_display_scale(): number
}

export function toFixed(num: number, fixed = 1) {
  fixed = Math.pow(10, fixed)
  return Math.floor(num * fixed) / fixed
}
