print('n controller top 3rd???')

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
  //init from bootstrap (proxy.collection)
  this.current_proxy = null
  // this.script_path = ''
}

export function on_message(
  this: props,
  messageId: hash,
  _message: unknown,
  _sender: url
): void {
  if (messageId == hash('show_scene')) {
    // again, get all "this." from Novel class TESTJPF
    // this.script_path = message.path
    //this.roomname = message.roomname
    //  this.npc = message.npc
    // this.reason = message.reason // testjpf makes a single table
    show(this.current_proxy, '#novel')
  } else if (messageId == hash('unload_novel')) {
    // <4>
    if (this.current_proxy != null) {
      // <6>
      msg.post(this.current_proxy, 'disable')
      msg.post(this.current_proxy, 'final')
      msg.post(this.current_proxy, 'unload') // <7>
      this.current_proxy = null
    }
  } else if (messageId == hash('proxy_loaded')) {
    // <9>
    this.current_proxy = _sender // <10>

    if (_sender.fragment == hash('novel')) {
      msg.post('novel:/main#main', 'wake_up')
    }
    msg.post(this.current_proxy, 'enable') // <11>
  } //else if( messageId == hash("proxy_unloaded") ){}
}
