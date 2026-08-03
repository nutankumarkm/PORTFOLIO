/**
 * Image → ASCII conversion.
 *
 * Downsamples an image into a character grid: each cell becomes a glyph picked
 * from a density ramp plus a level the UI uses for colour. Runs of same-level
 * cells are grouped so an 80×45 grid renders as a few hundred spans instead of
 * a few thousand.
 *
 * "Ink" is the working unit — 0 leaves the cell blank, 1 fills it with the
 * densest glyph. On a light surface ink follows darkness; on a dark surface it
 * follows brightness (`invert`), so the portrait reads the right way round in
 * both cases.
 */

/** Density ramp, most ink → least. */
export const ASCII_RAMP = "@#W$9876543210?!abc;:+=-,._ ";

/** Number of ink levels exposed to the renderer, 0 = strongest. */
export const ASCII_LEVELS = 4;

export type AsciiRun = { text: string; level: number };

export interface AsciiOptions {
  /** Aspect ratio (w/h) of the area the art will fill — drives the crop. */
  aspect: number;
  /** Vertical crop anchor, 0 = top, 1 = bottom. Default 0.5. */
  focusY?: number;
  /** Contrast applied after auto-levels. Default 1.25. */
  contrast?: number;
  /**
   * Gamma on the final ink value. Below 1 lays down more ink in the midtones,
   * which is what keeps a face from reading as an empty outline.
   */
  inkGamma?: number;
  /** Ink follows brightness instead of darkness — for dark surfaces. */
  invert?: boolean;
  /**
   * Fraction of the source shaved off each edge before cropping. Scanned or
   * printed photos often carry a pale border that survives backdrop keying and
   * prints as a solid column of glyphs.
   */
  trim?: number;
  /**
   * Fade out cells matching the colour sampled from the frame's edges, so a
   * flat studio backdrop drops away and leaves the subject cut out. Set false
   * for photos whose edges are part of the picture.
   */
  keyBackdrop?: boolean;
}

/** Normalised RGB distance at which a cell counts as fully backdrop / subject. */
const KEY_LO = 0.18;
const KEY_HI = 0.32;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (n: number) => n * n * (3 - 2 * n);
const median = (values: number[]) =>
  values.slice().sort((a, b) => a - b)[values.length >> 1];

/**
 * Returns one array of runs per row, or null if the image can't be read
 * (zero-sized source, no 2D context).
 */
export function imageToAscii(
  img: HTMLImageElement,
  cols: number,
  rows: number,
  {
    aspect,
    focusY = 0.5,
    contrast = 1.25,
    inkGamma = 1,
    invert = false,
    keyBackdrop = true,
    trim = 0,
  }: AsciiOptions
): AsciiRun[][] | null {
  if (!img.naturalWidth || !img.naturalHeight || cols < 2 || rows < 2) return null;

  const inset = clamp01(trim);
  const ox = img.naturalWidth * inset;
  const oy = img.naturalHeight * inset;
  const iw = img.naturalWidth - ox * 2;
  const ih = img.naturalHeight - oy * 2;

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  // Cover-crop the source to the target aspect, anchored at focusY.
  let sw = iw;
  let sh = iw / aspect;
  if (sh > ih) {
    sh = ih;
    sw = ih * aspect;
  }
  const sx = ox + (iw - sw) / 2;
  const sy = oy + (ih - sh) * focusY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);

  const { data } = ctx.getImageData(0, 0, cols, rows);
  const channel = (i: number, c: number) => data[i * 4 + c];

  // Backdrop reference: median of the top edge and the upper thirds of the
  // sides — the region a head-and-shoulders frame leaves to the background.
  let alpha: Float32Array | null = null;
  if (keyBackdrop) {
    const edge: number[] = [];
    for (let x = 0; x < cols; x++) edge.push(x);
    for (let y = 1; y < Math.floor(rows / 3); y++) {
      edge.push(y * cols, y * cols + cols - 1);
    }
    const ref = [0, 1, 2].map((c) => median(edge.map((i) => channel(i, c))));

    alpha = new Float32Array(cols * rows);
    for (let i = 0; i < alpha.length; i++) {
      const dr = channel(i, 0) - ref[0];
      const dg = channel(i, 1) - ref[1];
      const db = channel(i, 2) - ref[2];
      // 441.67 = distance between black and white in RGB space.
      const dist = Math.sqrt(dr * dr + dg * dg + db * db) / 441.67;
      alpha[i] = smoothstep(clamp01((dist - KEY_LO) / (KEY_HI - KEY_LO)));
    }
  }

  const lum = new Float32Array(cols * rows);
  const subject: number[] = [];
  for (let i = 0; i < lum.length; i++) {
    lum[i] =
      (0.2126 * channel(i, 0) + 0.7152 * channel(i, 1) + 0.0722 * channel(i, 2)) /
      255;
    if (!alpha || alpha[i] > 0.5) subject.push(lum[i]);
  }

  // Auto-levels over the subject only, on the 2nd/98th percentiles: a flat
  // backdrop otherwise drags the range and the portrait turns to mush.
  const pool = (subject.length > cols ? subject : Array.from(lum)).sort(
    (a, b) => a - b
  );
  const lo = pool[Math.floor(pool.length * 0.02)];
  const hi = pool[Math.floor(pool.length * 0.98)];
  const span = hi - lo || 1;

  const lastRamp = ASCII_RAMP.length - 1;
  const out: AsciiRun[][] = [];

  for (let y = 0; y < rows; y++) {
    const runs: AsciiRun[] = [];
    let current: AsciiRun | null = null;

    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const stretched = clamp01((lum[i] - lo) / span);
      const v = clamp01(0.5 + (stretched - 0.5) * contrast);
      const ink = Math.pow(
        (invert ? v : 1 - v) * (alpha ? alpha[i] : 1),
        inkGamma
      );

      const char = ASCII_RAMP[Math.round((1 - ink) * lastRamp)];
      const level = Math.min(ASCII_LEVELS - 1, Math.floor((1 - ink) * ASCII_LEVELS));

      if (current && current.level === level) {
        current.text += char;
      } else {
        current = { text: char, level };
        runs.push(current);
      }
    }
    out.push(runs);
  }

  return out;
}
