import { evalPolynomial } from "./evalPolynomial";
import { getSampleAutoCorrelation } from "./getSampleAutoCorrelation";
import { solveByLevinsonDurbin } from "./solveByLevinsonDurbin";

interface Config {
  degree: number;
  window: (x: number) => number;
}

export class LPCAnalyzer {
  private degree: number;
  private window: (x: number) => number;

  constructor({ degree, window }: Config) {
    this.degree = degree;
    this.window = window;
  }

  getLPC(input: ArrayLike<number>, from: number, width: number) {
    const { degree, window } = this;
    const segment = new Float64Array(width);

    for (let t = 0; t < width; t++) {
      segment[t] = input[from + t] * window(t / width);
    }

    const autoCor = getSampleAutoCorrelation(segment, degree + 1);
    return solveByLevinsonDurbin(autoCor, degree);
  }

  getResidue(input: ArrayLike<number>, from: number, width: number) {
    const lpc = this.getLPC(input, from, width);
    const residue = new Float64Array(width);

    for (let t = 0; t < width; t++) {
      const min = Math.min(t + 1, lpc.length);

      for (let d = 0; d < min; d++) {
        residue[t] += lpc[d] * input[from + t - d];
      }
    }

    return residue;
  }

  getSpectralEnvelope(input: ArrayLike<number>, from: number, width: number) {
    const lpc = this.getLPC(input, from, width);
    const half = (width >> 1) + (width & 1);
    const envelope = new Float64Array(half);

    for (let i = 0; i < half; i++) {
      const re = Math.cos((2 * Math.PI * i) / width);
      const im = Math.sin((2 * Math.PI * i) / width);
      const ev = evalPolynomial(lpc, re, im);
      envelope[i] = 1 / Math.hypot(ev[0], ev[1]);
    }

    return envelope;
  }
}
