let generated_id_count = 1
const events: {
  [key: string]: {
    hooks: {
      [key: string]: {
        id: number
        url: hash
        messages: string[]
        handler?: { (message_id: hash, message: any): void } | null
      } | null
    }
    subs: {
      [key: string]: {
        id: number
        url: hash
        messages: string[]
        handler?: { (message_id: hash, message: any): void } | null
      } | null
    }
  }
} = {}
const subscribers: {
  [key: string]: {
    id: number
    url: hash
    messages: string[]
    handler?: { (message_id: hash, message: any): void }
  } | null
} = {}

let message_queue: [string, any][] = []
let message_queue_active = 0

//const unsubscribe: any

function generate_id() {
  const id_count = generated_id_count
  generated_id_count = id_count + 1
  return id_count
}

function subscribe_(
  messages: string[],
  hook_on_message?: { (message_id: hash, message: any): void }
) {
  const id = generate_id()
  const url = msg.url()

  if (subscribers[id]) {
    print(
      'WARNING: Subscriber ' +
        id +
        ' already registered. Overwriting subscription'
    )
    unsubscribe(id)
  }

  const sub = {
    id: id,
    url: url,
    messages: messages,
    handler: hook_on_message,
  }
  subscribers[id] = sub

  for (const message_id of messages) {
    let event = events[message_id]
    if (event == null) {
      event = { hooks: {}, subs: {} }
      events[message_id] = event
    }

    if (hook_on_message !== null) {
      event.hooks[id] = sub
    } else {
      event.subs[id] = sub
    }
  }

  return id
}

export function subscribe(messages: string[]) {
  return subscribe_(messages)
}

export function subscribe_hook(
  messages: string[],
  on_message: { (message_id: hash, message: any): void }
) {
  if (typeof on_message !== 'function') {
    error('Second argument to subscribe_hook must be an on_message function')
  }
  return subscribe_(messages, on_message)
}

export function unsubscribe(id: number) {
  if (id == null) return
  const sub = subscribers[id]
  if (sub == null) {
    print('WARNING: Cannot unsubscribe unsubscribed subscriber ' + id + '.')
    return
  }

  for (const message of sub.messages) {
    const event = events[message]
    if (event !== null) {
      event.subs[id] = null
      event.hooks[id] = null
    }
  }

  subscribers[id] = null
}

function dispatch_(message_id: string, message: any) {
  const mid: hash = hash(message_id)

  const event = events[message_id]
  if (event == null) return

  const msgUnknown: unknown | object = message == null ? {} : message

  message_queue_active = message_queue_active + 1
  if (event.hooks !== null) {
    let ek: keyof typeof event.hooks
    for (ek in event.hooks) {
      if (event.hooks[ek] !== null) event.hooks[ek]!.handler!(mid, msgUnknown)
    }
  }
  if (event.subs !== null) {
    let ek: keyof typeof event.subs
    for (ek in event.subs) {
      if (event.subs[ek] !== null)
        msg.post(event.subs[ek]!.url, mid, msgUnknown)
    }

    if (message_queue_active == 1 && message_queue.length > 0) {
      for (const msgPair of message_queue) {
        dispatch_(msgPair[0], msgPair[1])
      }
      message_queue = []
    }
    message_queue_active = message_queue_active - 1
  }
}

export function dispatch(message_id: string, message: any) {
  if (message_queue_active > 0) {
    message_queue.push([message_id, message])
  } else {
    dispatch_(message_id, message)
  }
}
/**
 * export all these functons instead.
 * create on sys init?
 *
 * testjpf
 */
