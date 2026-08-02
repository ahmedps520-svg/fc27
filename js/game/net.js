/**
 * Verlet cloth for the goal netting. A grid of particles held together by
 * distance constraints, pinned along the frame, free everywhere else — so a ball
 * driven into it punches a bulge that ripples out and settles.
 */
export class NetCloth {
  /**
   * @param {number} cols across the goal
   * @param {number} rows top to bottom
   * @param {(c:number, r:number) => [number,number,number]} place world position of each node
   * @param {(c:number, r:number) => boolean} pin which nodes are fixed to the frame
   */
  constructor(cols, rows, place, pin) {
    this.cols = cols;
    this.rows = rows;
    this.n = cols * rows;
    this.pos = new Float32Array(this.n * 3);
    this.prev = new Float32Array(this.n * 3);
    this.home = new Float32Array(this.n * 3);
    this.pinned = new Uint8Array(this.n);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 3;
        const [x, y, z] = place(c, r);
        this.pos[i] = x; this.pos[i + 1] = y; this.pos[i + 2] = z;
        this.prev[i] = x; this.prev[i + 1] = y; this.prev[i + 2] = z;
        this.home[i] = x; this.home[i + 1] = y; this.home[i + 2] = z;
        this.pinned[r * cols + c] = pin(c, r) ? 1 : 0;
      }
    }

    // structural links right and down, plus shear links for a bit of stiffness
    this.links = [];
    const add = (a, b) => {
      const ia = a * 3;
      const ib = b * 3;
      const d = Math.hypot(
        this.pos[ia] - this.pos[ib], this.pos[ia + 1] - this.pos[ib + 1],
        this.pos[ia + 2] - this.pos[ib + 2]);
      this.links.push(a, b, d);
    };
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) add(i, i + 1);
        if (r < rows - 1) add(i, i + cols);
        if (c < cols - 1 && r < rows - 1) add(i, i + cols + 1);
      }
    }
  }

  /** Shove nodes near a point — the ball hitting the net. */
  impulse(x, y, z, radius, ix, iy, iz) {
    const r2 = radius * radius;
    for (let i = 0; i < this.n; i++) {
      if (this.pinned[i]) continue;
      const p = i * 3;
      const dx = this.pos[p] - x;
      const dy = this.pos[p + 1] - y;
      const dz = this.pos[p + 2] - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > r2) continue;
      const f = 1 - Math.sqrt(d2) / radius;
      this.prev[p] -= ix * f;
      this.prev[p + 1] -= iy * f;
      this.prev[p + 2] -= iz * f;
    }
  }

  step(dt, iterations = 3) {
    const drag = 0.965;
    const g = -9.5 * dt * dt;
    // verlet integrate, with a gentle pull back to the rest shape so the net
    // recovers instead of hanging bagged out after every strike
    for (let i = 0; i < this.n; i++) {
      if (this.pinned[i]) continue;
      const p = i * 3;
      for (let k = 0; k < 3; k++) {
        const cur = this.pos[p + k];
        let next = cur + (cur - this.prev[p + k]) * drag;
        if (k === 2) next += g;
        next += (this.home[p + k] - cur) * 0.06;
        this.prev[p + k] = cur;
        this.pos[p + k] = next;
      }
    }

    const L = this.links;
    for (let it = 0; it < iterations; it++) {
      for (let l = 0; l < L.length; l += 3) {
        const a = L[l] * 3;
        const b = L[l + 1] * 3;
        const rest = L[l + 2];
        const dx = this.pos[b] - this.pos[a];
        const dy = this.pos[b + 1] - this.pos[a + 1];
        const dz = this.pos[b + 2] - this.pos[a + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-5;
        const diff = ((d - rest) / d) * 0.5;
        const mx = dx * diff;
        const my = dy * diff;
        const mz = dz * diff;
        const pa = this.pinned[L[l]];
        const pb = this.pinned[L[l + 1]];
        if (!pa) { this.pos[a] += mx; this.pos[a + 1] += my; this.pos[a + 2] += mz; }
        if (!pb) { this.pos[b] -= mx; this.pos[b + 1] -= my; this.pos[b + 2] -= mz; }
      }
    }
  }

  /** Flat index pairs for drawing the mesh as line segments. */
  lineIndices() {
    const idx = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        if (c < this.cols - 1) idx.push(i, i + 1);
        if (r < this.rows - 1) idx.push(i, i + this.cols);
      }
    }
    return idx;
  }
}
