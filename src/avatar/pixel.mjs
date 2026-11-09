// Motor de pixel art procedural.
//
// Cada "peça" (rosto, cabelo, roupa, chifre...) é desenhada como uma MÁSCARA de pixels a partir de formas
// simples. Ao carimbar a peça na tela, o motor aplica automaticamente o acabamento de pixel art:
//   • contorno escuro ao redor (separa a peça do que está atrás)
//   • sombra na borda de baixo/direita e luz na borda de cima/esquerda (luz vindo do alto à esquerda)
// Assim, formas geométricas viram sprites com cara de feitos à mão.
//
// Rampa de cor = [contorno, sombra, base, luz] em hex.
import { deflateSync } from "node:zlib";

export class Mascara {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.m = new Uint8Array(w * h);
  }
  dentro(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }
  ponto(x, y, v = 1) {
    x = Math.round(x);
    y = Math.round(y);
    if (this.dentro(x, y)) this.m[y * this.w + x] = v;
    return this;
  }
  tem(x, y) {
    return this.dentro(x, y) && this.m[y * this.w + x] === 1;
  }
  elipse(cx, cy, rx, ry, v = 1) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / (rx + 0.4), dy = (y - cy) / (ry + 0.4);
        if (dx * dx + dy * dy <= 1) this.ponto(x, y, v);
      }
    return this;
  }
  retangulo(x0, y0, x1, y1, v = 1) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.ponto(x, y, v);
    return this;
  }
  // polígono por scanline (pontos [[x,y],...])
  poligono(pts, v = 1) {
    const ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= y + 0.5 && y2 > y + 0.5) || (y2 <= y + 0.5 && y1 > y + 0.5))
          xs.push(x1 + ((y + 0.5 - y1) / (y2 - y1)) * (x2 - x1));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2)
        for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]) - (xs[i + 1] - xs[i] > 0.6 ? 1 : 0); x++) this.ponto(x, y, v);
    }
    return this;
  }
  linha(x0, y0, x1, y1, esp = 1, v = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
      if (esp <= 1) this.ponto(x, y, v);
      else this.elipse(x, y, (esp - 1) / 2, (esp - 1) / 2, v);
    }
    return this;
  }
  // triângulo "espinho" saindo de uma base (x,y) com largura e ponta deslocada
  espinho(bx, by, larg, px, py, v = 1) {
    return this.poligono([[bx - larg / 2, by], [bx + larg / 2, by], [px, py]], v);
  }
  apagar(outra) {
    for (let i = 0; i < this.m.length; i++) if (outra.m[i]) this.m[i] = 0;
    return this;
  }
  intersectar(outra) {
    for (let i = 0; i < this.m.length; i++) if (!outra.m[i]) this.m[i] = 0;
    return this;
  }
  espelhar(cx = (this.w - 1) / 2) {
    const n = new Uint8Array(this.m);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const xm = Math.round(2 * cx - x);
        if (xm >= 0 && xm < this.w && n[y * this.w + x]) this.m[y * this.w + xm] = 1;
      }
    return this;
  }
}

export class Tela {
  constructor(w = 64, h = 64) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null);
  }
  mascara() {
    return new Mascara(this.w, this.h);
  }
  set(x, y, cor) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h && cor) this.px[y * this.w + x] = cor;
  }
  get(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.px[y * this.w + x] : null;
  }
  // Carimba uma peça com acabamento automático.
  // opts: { contorno: true|false|hex, sombra: 1|2|0, luz: 1|0, plano: false }
  carimbar(m, rampa, opts = {}) {
    const [cont, sombra, base, luz] = rampa;
    const { contorno = true, sombra: largS = 1, luz: largL = 1, plano = false } = opts;
    if (contorno) {
      const cc = contorno === true ? cont : contorno;
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++)
          if (!m.tem(x, y) && (m.tem(x + 1, y) || m.tem(x - 1, y) || m.tem(x, y + 1) || m.tem(x, y - 1))) this.set(x, y, cc);
    }
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (!m.tem(x, y)) continue;
        let c = base;
        if (!plano) {
          let borda = false;
          for (let k = 1; k <= largS; k++) if (!m.tem(x + k, y) || !m.tem(x, y + k)) borda = true;
          if (borda) c = sombra;
          else if (largL && (!m.tem(x - 1, y) || !m.tem(x, y - 1)) && !(!m.tem(x + 1, y) || !m.tem(x, y + 1))) c = luz;
        }
        this.set(x, y, c);
      }
    return this;
  }
  // pinta uma máscara com uma cor só, sem acabamento
  pintar(m, cor) {
    for (let i = 0; i < m.m.length; i++) if (m.m[i] && cor) this.px[i] = cor;
    return this;
  }
  // Sprite em ASCII: cada caractere vira uma cor via `cores` ('.' ou ' ' = transparente)
  sprite(linhas, x0, y0, cores, espelhar = false) {
    linhas.forEach((ln, dy) => {
      [...ln].forEach((ch, dx) => {
        const c = cores[ch];
        if (!c) return;
        const x = espelhar ? x0 + (ln.length - 1 - dx) : x0 + dx;
        this.set(x, y0 + dy, c);
      });
    });
    return this;
  }
  // PNG ampliado (nearest neighbor) — sem dependências
  png(escala = 8) {
    const W = this.w * escala, H = this.h * escala;
    const linha = W * 4 + 1;
    const raw = Buffer.alloc(linha * H);
    for (let y = 0; y < H; y++) {
      raw[y * linha] = 0;
      for (let x = 0; x < W; x++) {
        const c = this.px[Math.floor(y / escala) * this.w + Math.floor(x / escala)];
        const o = y * linha + 1 + x * 4;
        if (c) {
          raw[o] = parseInt(c.slice(1, 3), 16);
          raw[o + 1] = parseInt(c.slice(3, 5), 16);
          raw[o + 2] = parseInt(c.slice(5, 7), 16);
          raw[o + 3] = 255;
        }
      }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0);
    ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      bloco("IHDR", ihdr), bloco("IDAT", deflateSync(raw, { level: 9 })), bloco("IEND", Buffer.alloc(0)),
    ]);
  }
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloco(tipo, dados) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dados.length);
  const td = Buffer.concat([Buffer.from(tipo), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// Gerador pseudoaleatório determinístico (mesmo DNA → mesma imagem)
export function rng(semente) {
  let s = typeof semente === "string" ? [...semente].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
