const OPCODE = {
    CONTINUE: 0, // 延续帧
    TEXT: 1, // 文本帧
    BINARY: 2, // 二进制帧
    CLOSE: 8, // 连接断开
    PING: 9, // PING
    PONG: 10 // PONG
}

export {
    OPCODE
}