interface props {
  currentProxy: url | null
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
  this.currentProxy = null
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('show_scene')) {
    show(this.currentProxy, '#novel')
  } else if (messageId == hash('unload_novel')) {
    if (this.currentProxy != null) {
      msg.post(this.currentProxy, 'disable')
      msg.post(this.currentProxy, 'final')
      msg.post(this.currentProxy, 'unload')
      this.currentProxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    this.currentProxy = _sender
    //testjpf here you could have conditionals based on novel state.
    // not just use wake up.!!!
    if (_sender.fragment == hash('novel')) {
      msg.post('novel:/main#main', 'wake_up')
    }
    msg.post(this.currentProxy, 'enable')
  }
}
