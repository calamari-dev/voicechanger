import DFT from "fft";
import { LPCAnalyzer } from "../lpc";
import { hammingWindow } from "../math/window";

interface Config {
  sampleRate: number;
  dftSize: number;
}

const lpcAnalyzer = new LPCAnalyzer({
  degree: 30,
  window: hammingWindow,
});

export class PeriodDetector {
  private dft: DFT;
  private prev: number | null = null;
  private minT0: number;

  constructor({ sampleRate, dftSize }: Config) {
    const minF0 = 100;
    this.dft = new DFT(dftSize);
    this.minT0 = Math.round(dftSize / 2 - sampleRate / minF0);
  }

  reset() {
    this.prev = null;
  }

  getPeriod(input: ArrayLike<number>, from: number) {
    const dft = this.dft;
    const dftSize = dft.size;
    const x = dft.createVec("Float64Array");
    const r = lpcAnalyzer.getResidue(input, from, dftSize);

    for (let t = 0; t < dftSize; t++) {
      const w = hammingWindow(t / dftSize);
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

    for (let t = this.minT0, h = dftSize >> 1; t < h; t++) {
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

    for (let i = 0, min = 100000; i < 3; i++) {
      if (Math.abs(this.prev / candidates[i] - 2) < 0.1) {
        candidates[i] *= 2;
      }

      const jump = Math.abs(candidates[i] - this.prev);

      if (jump < min) {
        min = jump;
        index = i;
      }
    }

    const T0 = candidates[index];
    this.prev = T0;
    return T0;
  }
}
