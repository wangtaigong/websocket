import EventEmitter from "events"
import crypto from "crypto"
import { OPCODE } from './frame-constance.js'
import { parser, encodeMsg } from './frame.js'

const KEY_SUFFIX = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const hashWebSocketKey = (key) => {
  const sha1 = crypto.createHash('sha1')
  sha1.update(key + KEY_SUFFIX)
  return sha1.digest('base64')
};

class WebSocket extends EventEmitter {
  socket
  constructor(req, socket) {
    super();

    this.socket = socket;

    const resHeader = this.handShakeHeader(req)
    socket.write(resHeader);

    // 监听data,close事件
    socket.on("data", (data) => {
        data = parser(data)

        const opcode = data.opcode
        if (opcode === OPCODE.CLOSE) { // 返回close握手信息并销毁socket
          this.send('close', 8)
          this.socket.destroy()
          this.emit('close')
          return
        }
        if (opcode === OPCODE.PING) { // ping--pong
          this.send('pong', OPCODE.PONG)
          return
        }
        this.emit('data', data)
        this.send('I received!')
    });
  }

  handShakeHeader(req) {
    // 构造响应头
    const resKey = hashWebSocketKey(req.headers["sec-websocket-key"]);
    const resHeaders = ([
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Accept: ' + resKey
      ]).concat('', '').join('\r\n');
    return resHeaders
  }

  send(msg, opcode) {
    this.socket.write(encodeMsg(msg, opcode))
    if (opcode === 8) {
    }
  }
}

export default WebSocket
