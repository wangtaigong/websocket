const { Buffer } = require('buffer')

const parser = (buf) => {
    let counter = 0;
    const fin = buf[counter] >> 7;
    const opcode = buf[counter] & 0x0f;
    counter++;

    const mask = buf[counter] >> 7;
    let payloadLen = buf[counter] & 0x7f;
    console.log(payloadLen);
    counter++;
    if (payloadLen === 126) {
        payloadLen = buf.readUInt16BE(counter)
        counter += 2;
    }
    if (payloadLen === 127) {
        payloadLen = buf.readUInt32BE(counter + 4)
        counter += 8;
    }

    let mask_key = ''
    if (mask) {
        mask_key = buf.slice(counter, counter + 4)
        counter += 4;
    }
    const payload = buf.slice(counter, counter + payloadLen)
    for(let i = 0; i < payloadLen; i++) {
        payload[i] ^=  mask_key[i % 4]
    }
    return { payload: payload.toString('utf8') }
}

const encodeMsg = (msg) => {
    const frame = {
        FIN: 1,
        Opcode: 1, // text
        MASK: 0
    }

    let preBytes = [];
    let payload = Buffer.from(msg);
    const payloadLen = payload.length;
    preBytes.push((frame.FIN << 7) + frame.Opcode);
    if (payloadLen < 126) {
        preBytes.push((frame['MASK'] << 7) + payloadLen);
    } else if (payloadLen < 65536) {
        preBytes.push(
            (frame['MASK'] << 7) + 126, 
            (dataLength & 0xFF00) >> 8,
            dataLength & 0xFF
          );
    } else {
        preBytes.push(
            (frame['MASK'] << 7) + 127,
            0, 0, 0, 0,
            (dataLength & 0xFF000000) >> 24,
            (dataLength & 0xFF0000) >> 16,
            (dataLength & 0xFF00) >> 8,
            dataLength & 0xFF
          );
    }
    preBytes = Buffer.from(preBytes);
    return Buffer.concat([preBytes, payload])
}

module.exports = {
    parser,
    encodeMsg
}