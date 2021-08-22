const EventEmitter = require("events");
const crypto = require("crypto");
const { parser, encodeMsg } = require('./frame')

const KEY_SUFFIX = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const hashWebSocketKey = (key) => {
  const sha1 = crypto.createHash('sha1')
  sha1.update(key + KEY_SUFFIX)
  return sha1.digest('base64')
};

class WebSocket extends EventEmitter {
  socket
  constructor(req, socket, upgradeHeader) {
    super();

    this.socket = socket;

    const resHeader = this.handShakeHeader(req)
    socket.write(resHeader);

    // 监听data,close事件
    socket.on("data", (data) => {
        data = parser(data)
        if (data.Opcode === 8) {
          this.send('close', 8)
          this.socket.destroy()
        }
        this.emit('data', data)
        this.send('I received!')
    });
    socket.on("close", () => {
        this.emit('close')
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

module.exports = WebSocket;
