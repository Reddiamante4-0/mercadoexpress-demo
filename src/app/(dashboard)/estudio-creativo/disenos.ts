// Motor de diseño del Estudio Creativo: dibuja el cuadrado, el volante y el afiche en un <canvas>.
// No usa IA para dibujar: así el texto y el código QR siempre salen nítidos y legibles.

export type Formato = 'cuadrado' | 'volante' | 'afiche';
export type Estilo = 'clasico' | 'oscuro' | 'minimalista';

export const MEDIDAS: Record<Formato, { w: number; h: number }> = {
  cuadrado: { w: 1080, h: 1080 }, // redes sociales
  volante: { w: 1650, h: 2550 }, // media carta vertical (5,5 x 8,5 in) a 300 ppp
  afiche: { w: 2480, h: 3508 }, // A3 vertical (alta calidad en A4)
};

export type EspecDiseno = {
  formato: Formato;
  estilo?: Estilo;
  negocio: string;
  titular: string;
  subtitulo: string;
  puntos: string[];
  cta: string;
  oferta: string;
  whatsapp: string;
  direccion: string;
  color: string;
  qr: HTMLImageElement | null;
  logo: HTMLImageElement | null;
};

const FUENTE = 'Arial, Helvetica, sans-serif';
const COLOR_RESPALDO = '#0F766E';
const COLOR_OFERTA = '#FACC15';

type Distribucion = {
  encabezado: number; // alto del bloque de color, como fracción del alto total
  pieConQr: number; // alto del pie con QR
  pieSinQr: number; // alto del pie sin QR
  qr: number; // lado del QR, como fracción del ancho
  puntos: boolean;
  titularMax: number; // tamaño máximo del titular, como fracción del ancho
};

const DISTRIBUCION: Record<Formato, Distribucion> = {
  cuadrado: { encabezado: 0.4, pieConQr: 0.26, pieSinQr: 0.2, qr: 0.165, puntos: false, titularMax: 0.105 },
  volante: { encabezado: 0.36, pieConQr: 0.27, pieSinQr: 0.2, qr: 0.25, puntos: true, titularMax: 0.105 },
  afiche: { encabezado: 0.42, pieConQr: 0.28, pieSinQr: 0.21, qr: 0.27, puntos: false, titularMax: 0.125 },
};

// ── Colores ────────────────────────────────────────────────────
export function normalizarColor(c: string | null | undefined): string {
  const v = (c || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
  return COLOR_RESPALDO;
}

function aRgb(hex: string): [number, number, number] {
  const h = normalizarColor(hex).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mezclar(hex: string, con: string, t: number): string {
  const a = aRgb(hex);
  const b = aRgb(con);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + m.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function luminancia(hex: string): number {
  const [r, g, b] = aRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textoSobre(hex: string): string {
  return luminancia(hex) > 0.4 ? '#111827' : '#FFFFFF';
}

// Aclara el color de la tienda hasta que se lea bien sobre un fondo oscuro.
function acentoParaOscuro(hex: string): string {
  let c = normalizarColor(hex);
  for (let i = 0; i < 10 && luminancia(c) < 0.22; i++) c = mezclar(c, '#FFFFFF', 0.14);
  return c;
}

// Oscurece el color de la tienda hasta que se lea bien como texto sobre blanco.
function acentoParaClaro(hex: string, maxLum: number): string {
  let c = normalizarColor(hex);
  for (let i = 0; i < 10 && luminancia(c) > maxLum; i++) c = mezclar(c, '#000000', 0.14);
  return c;
}

// ── Texto ──────────────────────────────────────────────────────
function partirEnLineas(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? actual + ' ' + p : p;
    if (ctx.measureText(prueba).width <= ancho || !actual) {
      actual = prueba;
    } else {
      lineas.push(actual);
      actual = p;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

type Ajuste = { size: number; lineas: string[]; alto: number };

// Busca el tamaño de letra más grande que cabe en el ancho y en el máximo de líneas.
function ajustar(
  ctx: CanvasRenderingContext2D,
  texto: string,
  ancho: number,
  maxLineas: number,
  tamMax: number,
  tamMin: number,
  peso: string,
  interlineado = 1.18,
  maxAlto = Infinity
): Ajuste {
  let size = Math.round(tamMax);
  let lineas: string[] = [];
  while (size >= tamMin) {
    ctx.font = `${peso} ${size}px ${FUENTE}`;
    lineas = partirEnLineas(ctx, texto, ancho);
    const cabe =
      lineas.length <= maxLineas &&
      lineas.length * size * interlineado <= maxAlto &&
      lineas.every((l) => ctx.measureText(l).width <= ancho);
    if (cabe) return { size, lineas, alto: lineas.length * size * interlineado };
    size -= 2;
  }
  size = Math.round(tamMin);
  ctx.font = `${peso} ${size}px ${FUENTE}`;
  lineas = partirEnLineas(ctx, texto, ancho).slice(0, maxLineas);
  if (lineas.length > 0) {
    let ultima = lineas[lineas.length - 1];
    while (ultima.length > 1 && ctx.measureText(ultima + '…').width > ancho) ultima = ultima.slice(0, -1);
    lineas[lineas.length - 1] = ultima + '…';
  }
  return { size, lineas, alto: lineas.length * size * interlineado };
}

function escribir(
  ctx: CanvasRenderingContext2D,
  a: Ajuste,
  peso: string,
  x: number,
  y: number,
  color: string,
  alinear: CanvasTextAlign = 'left',
  interlineado = 1.18
) {
  ctx.font = `${peso} ${a.size}px ${FUENTE}`;
  ctx.fillStyle = color;
  ctx.textAlign = alinear;
  ctx.textBaseline = 'top';
  a.lineas.forEach((l, i) => ctx.fillText(l, x, y + i * a.size * interlineado));
}

function rectRedondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}


// ── Temas (colores de cada estilo) ─────────────────────────────
type Tema = {
  textoSub: string;
  textoPunto: string;
  colPunto: string;
  ofertaFondo: string;
  ofertaTexto: string;
  ofertaBarra: string | null; // barra lateral de la oferta (solo minimalista)
  pieFondo: string | null;
  pieLinea: string | null;
  pieCta: string;
  pieWa: string;
  pieDir: string;
  pieEtiqueta: string;
  qrBorde: string | null;
};

type Geom = {
  w: number;
  h: number;
  m: number;
  anchoUtil: number;
  d: Distribucion;
  conQr: boolean;
  yPie: number;
  hPie: number;
};

// ── Pie: contacto + QR ─────────────────────────────────────────
function pintarPie(ctx: CanvasRenderingContext2D, e: EspecDiseno, g: Geom, t: Tema) {
  const { w, h, m, anchoUtil, d, conQr, yPie, hPie } = g;

  if (t.pieFondo) {
    ctx.fillStyle = t.pieFondo;
    ctx.fillRect(0, yPie, w, hPie);
  }
  if (t.pieLinea) {
    ctx.fillStyle = t.pieLinea;
    ctx.fillRect(m, yPie, w - 2 * m, Math.max(2, h * 0.003));
  }

  let anchoTextoPie = anchoUtil;
  if (conQr && e.qr) {
    const q = w * d.qr;
    const etiqueta = ajustar(ctx, 'Escanea y compra', q + w * 0.04, 1, w * 0.032, w * 0.022, 'bold');
    const total = q + w * 0.015 + etiqueta.alto;
    const yQ = yPie + (hPie - total) / 2;
    const xQ = w - m - q;
    const pad = w * 0.012;
    ctx.fillStyle = '#FFFFFF';
    rectRedondeado(ctx, xQ - pad, yQ - pad, q + pad * 2, q + pad * 2, w * 0.018);
    ctx.fill();
    if (t.qrBorde) {
      ctx.strokeStyle = t.qrBorde;
      ctx.lineWidth = Math.max(2, w * 0.002);
      ctx.stroke();
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(e.qr, xQ, yQ, q, q);
    ctx.imageSmoothingEnabled = true;
    escribir(ctx, etiqueta, 'bold', xQ + q / 2, yQ + q + w * 0.015 + pad, t.pieEtiqueta, 'center');
    anchoTextoPie = xQ - pad - w * 0.04 - m;
  }

  // Bloque de contacto (llamado, WhatsApp, dirección). Si no cabe en el pie, se reduce el tamaño.
  type ItemPie = { a: Ajuste; peso: string; color: string; sep: number };
  const armarItems = (factor: number): ItemPie[] => {
    const lista: ItemPie[] = [];
    const gg = (conQr ? 1 : 1.15) * factor;
    if (e.cta.trim()) {
      lista.push({ a: ajustar(ctx, e.cta.trim(), anchoTextoPie, 2, w * 0.052 * gg, w * 0.02, '900', 1.12), peso: '900', color: t.pieCta, sep: w * 0.022 * factor });
    }
    if (e.whatsapp.trim()) {
      lista.push({ a: ajustar(ctx, 'WhatsApp: ' + e.whatsapp.trim(), anchoTextoPie, 1, w * 0.056 * gg, w * 0.02, 'bold'), peso: 'bold', color: t.pieWa, sep: w * 0.016 * factor });
    }
    if (e.direccion.trim()) {
      lista.push({ a: ajustar(ctx, e.direccion.trim(), anchoTextoPie, 2, w * 0.034 * gg, w * 0.018, 'normal'), peso: 'normal', color: t.pieDir, sep: 0 });
    }
    return lista;
  };
  const altoDe = (lista: ItemPie[]) => lista.reduce((s2, it) => s2 + it.a.alto + it.sep, 0) - (lista.length ? lista[lista.length - 1].sep : 0);
  let items = armarItems(1);
  for (const f of [0.85, 0.7, 0.55, 0.45]) {
    if (altoDe(items) <= hPie * 0.86) break;
    items = armarItems(f);
  }
  const altoBloque = altoDe(items);
  let yBloque = yPie + Math.max(h * 0.01, (hPie - altoBloque) / 2);
  for (const it of items) {
    escribir(ctx, it.a, it.peso, m, yBloque, it.color, 'left', 1.12);
    yBloque += it.a.alto + it.sep;
  }
}

// ── Zona central: subtítulo, puntos y oferta (se reparte el espacio y se centra) ──
function pintarZonaCentral(ctx: CanvasRenderingContext2D, e: EspecDiseno, g: Geom, t: Tema, yZonaIni: number) {
  const { w, h, m, anchoUtil, d, yPie } = g;
  const yZonaFin = yPie - h * 0.025;
  const zona = Math.max(1, yZonaFin - yZonaIni);
  const hueco = h * 0.02;

  // 1) Oferta: ocupa como máximo el 35 % de la zona.
  let ofertaAjuste: Ajuste | null = null;
  let altoOferta = 0;
  const padOf = w * 0.024;
  const barra = t.ofertaBarra ? w * 0.012 : 0;
  if (e.oferta.trim()) {
    ofertaAjuste = ajustar(ctx, e.oferta.trim(), anchoUtil - padOf * 2 - barra, 2, w * 0.065, w * 0.026, '900', 1.12, zona * 0.35 - padOf * 2);
    altoOferta = ofertaAjuste.alto + padOf * 2;
  }
  const restante = zona - (altoOferta ? altoOferta + hueco : 0);

  const listaPuntos = d.puntos ? e.puntos.map((v) => v.trim()).filter(Boolean).slice(0, 3) : [];

  // 2) Subtítulo: si hay puntos, usa un 40 % del espacio restante para que los tres quepan.
  let sub: Ajuste | null = null;
  if (e.subtitulo.trim()) {
    const maxLineasSub = listaPuntos.length > 0 ? 2 : e.formato === 'cuadrado' ? 2 : 3;
    const topeSub = listaPuntos.length > 0 ? restante * 0.4 : restante;
    sub = ajustar(ctx, e.subtitulo.trim(), anchoUtil, maxLineasSub, w * 0.05, w * 0.024, '600', 1.25, topeSub);
  }

  // 3) Puntos (solo volante): los tres, reduciendo el tamaño si hace falta.
  const radio = w * 0.011;
  const huecoPunto = h * 0.012;
  const bloquesPuntos: Ajuste[] = [];
  if (listaPuntos.length > 0) {
    const espacioPuntos = restante - (sub ? sub.alto + hueco : 0);
    const porPunto = Math.max(1, espacioPuntos / listaPuntos.length - huecoPunto);
    for (const p of listaPuntos) {
      bloquesPuntos.push(ajustar(ctx, p, anchoUtil - radio * 3, 2, w * 0.038, w * 0.018, '600', 1.2, porPunto));
    }
  }

  // 4) Se centra todo el bloque dentro de la zona para que no queden huecos desparejos.
  const altoPuntos = bloquesPuntos.reduce((s2, b) => s2 + b.alto + huecoPunto, 0);
  const altoContenido =
    (sub ? sub.alto + hueco : 0) + (altoPuntos ? altoPuntos + hueco - huecoPunto : 0) + altoOferta;
  let y = yZonaIni + Math.max(0, (zona - altoContenido) / 2);

  if (sub) {
    escribir(ctx, sub, '600', m, y, t.textoSub, 'left', 1.25);
    y += sub.alto + hueco;
  }

  for (let i = 0; i < bloquesPuntos.length; i++) {
    const pt = bloquesPuntos[i];
    ctx.fillStyle = t.colPunto;
    ctx.beginPath();
    ctx.arc(m + radio, y + pt.size * 0.55, radio, 0, Math.PI * 2);
    ctx.fill();
    escribir(ctx, pt, '600', m + radio * 3, y, t.textoPunto, 'left', 1.2);
    y += pt.alto + huecoPunto;
  }
  if (bloquesPuntos.length > 0) y += hueco - huecoPunto;

  // 5) Oferta justo debajo del contenido.
  if (ofertaAjuste) {
    let anchoTexto = 0;
    ctx.font = `900 ${ofertaAjuste.size}px ${FUENTE}`;
    for (const l of ofertaAjuste.lineas) anchoTexto = Math.max(anchoTexto, ctx.measureText(l).width);
    const anchoCaja = Math.min(anchoUtil, anchoTexto + padOf * 2 + barra);
    ctx.fillStyle = t.ofertaFondo;
    rectRedondeado(ctx, m, y, anchoCaja, altoOferta, w * 0.025);
    ctx.fill();
    if (t.ofertaBarra) {
      ctx.save();
      rectRedondeado(ctx, m, y, anchoCaja, altoOferta, w * 0.025);
      ctx.clip();
      ctx.fillStyle = t.ofertaBarra;
      ctx.fillRect(m, y, barra, altoOferta);
      ctx.restore();
    }
    escribir(ctx, ofertaAjuste, '900', m + padOf + barra, y + padOf, t.ofertaTexto, 'left', 1.12);
  }
}

// ── Logo y nombre del negocio ──────────────────────────────────
function pintarMarca(ctx: CanvasRenderingContext2D, e: EspecDiseno, g: Geom, colorNombre: string, cajaLogo: boolean) {
  const { w, h, m } = g;
  const yCursor = h * 0.045;
  let xNombre = m;
  const altoLogo = e.formato === 'cuadrado' ? h * 0.07 : h * 0.062;
  if (e.logo && e.logo.naturalWidth > 0) {
    const pad = w * 0.012;
    let lh = altoLogo;
    let lw = (lh * e.logo.naturalWidth) / e.logo.naturalHeight;
    if (lw > w * 0.28) {
      lw = w * 0.28;
      lh = (lw * e.logo.naturalHeight) / e.logo.naturalWidth;
    }
    if (cajaLogo) {
      ctx.fillStyle = '#FFFFFF';
      rectRedondeado(ctx, m, yCursor, lw + pad * 2, lh + pad * 2, w * 0.018);
      ctx.fill();
    }
    ctx.drawImage(e.logo, m + pad, yCursor + pad, lw, lh);
    xNombre = m + lw + pad * 2 + w * 0.03;
  }
  if (e.negocio.trim()) {
    const anchoNombre = w - m - xNombre;
    const nom = ajustar(ctx, e.negocio.trim(), anchoNombre, 1, w * 0.045, w * 0.026, 'bold');
    const altoCaja = altoLogo + w * 0.024;
    const yNombre = yCursor + (altoCaja - nom.size) / 2;
    escribir(ctx, nom, 'bold', xNombre, yNombre, colorNombre);
  }
  return { altoLogo };
}

// ── Dibujo principal ───────────────────────────────────────────
export function dibujarDiseno(canvas: HTMLCanvasElement, e: EspecDiseno) {
  const { w, h } = MEDIDAS[e.formato];
  const d = DISTRIBUCION[e.formato];
  const estilo: Estilo = e.estilo || 'clasico';
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const color = normalizarColor(e.color);
  const m = w * 0.07; // margen lateral
  const anchoUtil = w - 2 * m;
  const conQr = !!e.qr;
  const hEnc = h * d.encabezado;
  const hPie = h * (conQr ? d.pieConQr : d.pieSinQr);
  const g: Geom = { w, h, m, anchoUtil, d, conQr, yPie: h - hPie, hPie };
  const altoLogoRef = e.formato === 'cuadrado' ? h * 0.07 : h * 0.062;

  if (estilo === 'oscuro') {
    const fondo = '#0B0F14';
    const acento = acentoParaOscuro(color);

    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, w, h);

    // Resplandores suaves del color de la tienda
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = acento;
    ctx.beginPath();
    ctx.arc(w * 0.98, h * 0.02, w * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.09;
    ctx.beginPath();
    ctx.arc(w * 0.02, h * 0.62, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    pintarMarca(ctx, e, g, '#FFFFFF', true);

    // Barra de acento y titular
    const yBarra = h * 0.045 + altoLogoRef + w * 0.034;
    ctx.fillStyle = acento;
    rectRedondeado(ctx, m, yBarra, w * 0.14, Math.max(4, w * 0.009), w * 0.005);
    ctx.fill();
    const yTitIni = h * 0.045 + altoLogoRef + w * 0.056;
    const yTitFin = hEnc - h * 0.01;
    const tit = ajustar(ctx, e.titular.trim(), anchoUtil, 4, w * d.titularMax, w * 0.03, '900', 1.1, Math.max(1, yTitFin - yTitIni));
    const yTit = yTitIni + Math.max(0, (yTitFin - yTitIni - tit.alto) / 2);
    escribir(ctx, tit, '900', m, yTit, '#FFFFFF', 'left', 1.1);

    const tema: Tema = {
      textoSub: '#D1D5DB',
      textoPunto: '#E5E7EB',
      colPunto: acento,
      ofertaFondo: acento,
      ofertaTexto: textoSobre(acento),
      ofertaBarra: null,
      pieFondo: mezclar(fondo, '#FFFFFF', 0.07),
      pieLinea: null,
      pieCta: acento,
      pieWa: '#FFFFFF',
      pieDir: '#9CA3AF',
      pieEtiqueta: '#D1D5DB',
      qrBorde: null,
    };
    // Línea fina de acento sobre el pie
    pintarPie(ctx, e, g, tema);
    ctx.fillStyle = acento;
    ctx.fillRect(0, g.yPie, w, Math.max(3, h * 0.004));
    pintarZonaCentral(ctx, e, g, tema, hEnc + h * 0.02);
    return;
  }

  if (estilo === 'minimalista') {
    const fondo = '#FFFFFF';
    const acento = acentoParaClaro(color, 0.6);
    const acentoTexto = acentoParaClaro(color, 0.3);

    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, w, h);

    pintarMarca(ctx, e, g, '#111827', false);

    // Barra gruesa de acento y titular grande
    const yBarra = h * 0.045 + altoLogoRef + w * 0.034;
    ctx.fillStyle = acento;
    ctx.fillRect(m, yBarra, w * 0.16, Math.max(5, w * 0.012));
    const yTitIni = h * 0.045 + altoLogoRef + w * 0.06;
    const yTitFin = hEnc - h * 0.01;
    const tit = ajustar(ctx, e.titular.trim(), anchoUtil, 4, w * d.titularMax, w * 0.03, '900', 1.1, Math.max(1, yTitFin - yTitIni));
    const yTit = yTitIni + Math.max(0, (yTitFin - yTitIni - tit.alto) / 2);
    escribir(ctx, tit, '900', m, yTit, '#111827', 'left', 1.1);

    const tema: Tema = {
      textoSub: '#4B5563',
      textoPunto: '#374151',
      colPunto: acento,
      ofertaFondo: mezclar(acento, '#FFFFFF', 0.88),
      ofertaTexto: '#111827',
      ofertaBarra: acento,
      pieFondo: null,
      pieLinea: '#E5E7EB',
      pieCta: acentoTexto,
      pieWa: '#111827',
      pieDir: '#6B7280',
      pieEtiqueta: '#6B7280',
      qrBorde: '#D1D5DB',
    };
    pintarPie(ctx, e, g, tema);
    pintarZonaCentral(ctx, e, g, tema, hEnc + h * 0.02);
    return;
  }

  // ── Clásico: bloque de color arriba con borde diagonal y pie oscuro ──
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  const diag = h * 0.04;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, hEnc - diag);
  ctx.lineTo(0, hEnc + diag * 0.2);
  ctx.closePath();
  ctx.fill();

  // Círculos decorativos suaves dentro del encabezado
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = textoSobre(color);
  ctx.beginPath();
  ctx.arc(w * 0.95, hEnc * 0.12, w * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.78, hEnc * 0.95, w * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const textoEnc = textoSobre(color);
  pintarMarca(ctx, e, g, textoEnc, true);

  const yTitIni = h * 0.045 + altoLogoRef + w * 0.04;
  const yTitFin = hEnc - diag - h * 0.02;
  const tit = ajustar(ctx, e.titular.trim(), anchoUtil, 4, w * d.titularMax, w * 0.03, '900', 1.1, Math.max(1, yTitFin - yTitIni));
  const yTit = yTitIni + Math.max(0, (yTitFin - yTitIni - tit.alto) / 2);
  escribir(ctx, tit, '900', m, yTit, textoEnc, 'left', 1.1);

  const colorPie = mezclar(color, '#000000', 0.28);
  const textoPie = textoSobre(colorPie);
  const tema: Tema = {
    textoSub: '#1F2937',
    textoPunto: '#374151',
    colPunto: color,
    ofertaFondo: COLOR_OFERTA,
    ofertaTexto: '#111827',
    ofertaBarra: null,
    pieFondo: colorPie,
    pieLinea: null,
    pieCta: textoPie,
    pieWa: textoPie,
    pieDir: textoPie,
    pieEtiqueta: textoPie,
    qrBorde: null,
  };
  pintarPie(ctx, e, g, tema);
  pintarZonaCentral(ctx, e, g, tema, hEnc + h * 0.03);
}
