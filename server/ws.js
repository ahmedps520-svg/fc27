/**
 * Minimal RFC 6455 WebSocket server.
 *
 * The whole project is deliberately dependency-free — no bundler, no npm — so
 * rather than pull in `ws` this implements the slice of the protocol the game
 * actually needs: a handshake, text frames, ping/pong and close. Binary frames
 * are parsed too but the game only sends JSON.
 */
const crypto = require('crypto');
const { EventEmitter } = require('events');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MESSAGE = 1 << 20;          // 1 MiB — a snapshot is ~1 KB, so this is generous

let SEQ = 0;

class Socket extends EventEmitter {
  constructor(raw) {
    super();
    this.id = ++SEQ;
    this.raw = raw;
    this.open = true;
    this.buf = Buffer.alloc(0);
    this.fragments = [];
    this.fragmentOp = 0;

    raw.on('data', (chunk) => this._feed(chunk));
    raw.on('close', () => this._down());
    raw.on('error', () => this._down());
    raw.setTimeout(0);
    raw.setNoDelay(true);            // input latency matters more than packet count
  }

  _down() {
    if (!this.open) return;
    this.open = false;
    this.emit('close');
  }

  _feed(chunk) {
    this.buf = this.buf.length ? Buffer.concat([this.buf, chunk]) : chunk;
    // A single TCP read can hold several frames, or half of one.
    for (;;) {
      const frame = this._readFrame();
      if (!frame) break;
      this._handle(frame);
    }
  }

  _readFrame() {
    const b = this.buf;
    if (b.length < 2) return null;

    const fin = (b[0] & 0x80) !== 0;
    const opcode = b[0] & 0x0f;
    const masked = (b[1] & 0x80) !== 0;
    let len = b[1] & 0x7f;
    let off = 2;

    if (len === 126) {
      if (b.length < off + 2) return null;
      len = b.readUInt16BE(off);
      off += 2;
    } else if (len === 127) {
      if (b.length < off + 8) return null;
      const big = b.readBigUInt64BE(off);
      if (big > BigInt(MAX_MESSAGE)) { this.close(1009); return null; }
      len = Number(big);
      off += 8;
    }

    if (len > MAX_MESSAGE) { this.close(1009); return null; }

    let mask = null;
    if (masked) {
      if (b.length < off + 4) return null;
      mask = b.subarray(off, off + 4);
      off += 4;
    }
    if (b.length < off + len) return null;

    const payload = Buffer.from(b.subarray(off, off + len));
    if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];

    this.buf = b.subarray(off + len);
    return { fin, opcode, payload };
  }

  _handle({ fin, opcode, payload }) {
    if (opcode === 0x8) { this.close(1000); return; }
    if (opcode === 0x9) { this._send(0xa, payload); return; }   // ping -> pong
    if (opcode === 0xa) return;                                  // pong

    if (opcode === 0x0) {
      // continuation of a fragmented message
      this.fragments.push(payload);
    } else {
      this.fragments = [payload];
      this.fragmentOp = opcode;
    }
    if (!fin) return;

    const full = this.fragments.length === 1 ? this.fragments[0] : Buffer.concat(this.fragments);
    this.fragments = [];
    if (this.fragmentOp === 0x1) {
      let msg;
      try { msg = JSON.parse(full.toString('utf8')); } catch { return; }
      this.emit('message', msg);
    }
  }

  _send(opcode, payload) {
    if (!this.open) return;
    const len = payload.length;
    let head;
    if (len < 126) {
      head = Buffer.alloc(2);
      head[1] = len;
    } else if (len < 65536) {
      head = Buffer.alloc(4);
      head[1] = 126;
      head.writeUInt16BE(len, 2);
    } else {
      head = Buffer.alloc(10);
      head[1] = 127;
      head.writeBigUInt64BE(BigInt(len), 2);
    }
    head[0] = 0x80 | opcode;          // server frames are never masked
    try { this.raw.write(Buffer.concat([head, payload])); } catch { this._down(); }
  }

  /** Send a JSON object. */
  send(obj) {
    this._send(0x1, Buffer.from(JSON.stringify(obj), 'utf8'));
  }

  close(code = 1000) {
    if (!this.open) return;
    const p = Buffer.alloc(2);
    p.writeUInt16BE(code, 0);
    this._send(0x8, p);
    this.open = false;
    try { this.raw.end(); } catch { /* already gone */ }
    this.emit('close');
  }
}

/**
 * Attach a websocket endpoint to an existing http server.
 * `onConnect(socket, req)` runs once per successful handshake.
 */
function attach(server, path, onConnect) {
  server.on('upgrade', (req, raw) => {
    if (req.url.split('?')[0] !== path) { raw.destroy(); return; }
    const key = req.headers['sec-websocket-key'];
    if (!key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { raw.destroy(); return; }

    const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
    raw.write(
      'HTTP/1.1 101 Switching Protocols\r\n'
      + 'Upgrade: websocket\r\n'
      + 'Connection: Upgrade\r\n'
      + `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
    );
    onConnect(new Socket(raw), req);
  });
}

module.exports = { attach, Socket };
