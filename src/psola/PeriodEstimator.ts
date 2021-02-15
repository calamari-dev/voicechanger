import DFT from "fft";
import { LPCAnalyzer } from "../lpc";
import { hammingWindow } from "../math/window";

interface Config {
  sampleRate: number;
  dftSize: number;
  f0Range: [number, number];
}

const lpcAnalyzer = new LPCAnalyzer({
  degree: 30,
  window: hammingWindow,
});

export class PeriodEstimator {
  private dft: DFT;
  private prev: number | null = null;
  private t0Range: [number, number];

  constructor({ sampleRate, dftSize, f0Range }: Config) {
    const infT0 = sampleRate / (0.5 * dftSize);
    const minT0 = Math.round(Math.max(sampleRate / f0Range[1], infT0));
    const maxT0 = Math.round(Math.max(sampleRate / f0Range[0], infT0));
    this.dft = new DFT(dftSize);
    this.t0Range = [minT0, maxT0];
  }

  reset() {
    this.prev = null;
  }

  getPeriod(input: ArrayLike<number>, from: number) {
    const dft = this.dft;
    const { size } = dft;
    const x = dft.createVec("Float64Array");
    const r = lpcAnalyzer.getResidue(input, from, size);

    for (let t = 0; t < size; t++) {
      const w = hammingWindow(t / size);
      x[t] = w * input[from + t];
      r[t] = w * r[t];
    }

    const X = dft.realDFT(x);
    const R = dft.realDFT(r);
    const PS = dft.createVec("Float64Array");
    const tmp = dft.createVec("Float64Array");

    for (let F = 0; F < X[0].length; F++) {
      PS[F] = X[0][F] ** 2 + X[1][F] ** 2;
      X[0][F] = Math.log(PS[F]);
      X[1][F] = 0;
      R[0][F] = R[0][F] ** 2 + R[1][F] ** 2;
      R[1][F] = 0;

      if (!Number.isFinite(X[0][F])) {
        X[0][F] = -1000;
      }
    }

    const acf = dft.realIDFT(PS, tmp);
    const macf = dft.realIDFT(R[0], R[1]);
    const cep = dft.realIDFT(X[0], X[1]);

    let aT0 = 0;
    let mT0 = 0;
    let cT0 = 0;

    let aMax = 0;
    let mMax = 0;
    let cMax = 0;

    const [minT0, maxT0] = this.t0Range;

    for (let t = minT0; t < maxT0; t++) {
      if (acf[t] > aMax) {
        aMax = acf[t];
        aT0 = t;
      }

      if (macf[t] > mMax) {
        mMax = macf[t];
        mT0 = t;
      }

      if (cep[t] > cMax) {
        cMax = cep[t];
        cT0 = t;
      }
    }

    if (this.prev === null) {
      this.prev = aT0;
      return aT0;
    }

    const candidates = [aT0, mT0, cT0];
    let index = 0;

    for (let i = 0, min = Infinity; i < 3; i++) {
      if (Math.abs(this.prev / candidates[i] - 2) < 0.1) {
        candidates[i] *= 2;
      }

      const jump = Math.abs(candidates[i] - this.prev);

      if (jump < min) {
        min = jump;
        index = i;
      }
    }

    const t0 = candidates[index];
    this.prev = t0;
    return t0 > minT0 ? t0 : 0;
  }
}
