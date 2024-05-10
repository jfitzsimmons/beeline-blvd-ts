interface props {
  current_proxy: url | null
}
interface url {
  fragment: hash
}

function show(curr_proxy: url | null, proxy: string) {
  if (curr_proxy != null) {
    msg.post(curr_proxy, 'unload')
    curr_proxy = null
  }
  msg.post(proxy, 'async_load')
}

export function init(this: props) {
  this.current_proxy = null
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('show_scene')) {
    show(this.current_proxy, '#novel')
  } else if (messageId == hash('unload_novel')) {
    if (this.current_proxy != null) {
      msg.post(this.current_proxy, 'disable')
      msg.post(this.current_proxy, 'final')
      msg.post(this.current_proxy, 'unload')
      this.current_proxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.current_proxy = _sender

    if (_sender.fragment == hash('novel')) {
      msg.post('novel:/main#main', 'wake_up')
    }
    msg.post(this.current_proxy, 'enable')
  }
}
