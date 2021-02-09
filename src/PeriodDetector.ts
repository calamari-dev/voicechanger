import DFT from "fft";
import { LPCAnalyzer } from "./lpc";
import { hammingWindow } from "./math/window";

interface Config {
  fftSize: number;
}

const lpcAnalyzer = new LPCAnalyzer({
  degree: 30,
  window: hammingWindow,
});

export class PeriodDetector {
  private fftSize: number;
  private fft: DFT;
  private prev: number | null = null;

  constructor({ fftSize }: Config) {
    this.fftSize = fftSize;
    this.fft = new DFT(fftSize);
  }

  getPeriod(input: ArrayLike<number>, from: number) {
    const { fft, fftSize } = this;
    const x = fft.createVec("Float64Array");
    const r = lpcAnalyzer.getResidue(input, from, fftSize);

    let mean = 0;
    let variant = 0;

    let rmean = 0;
    let rvariant = 0;

    let zeroCross = 0;

    for (let t = 0; t < fftSize; t++) {
      const w = hammingWindow(t / fftSize);
      x[t] = w * input[from + t];
      r[t] = w * r[t];

      mean += x[t];
      variant += x[t] ** 2;

      rmean += r[t];
      rvariant += r[t] ** 2;

      if (t >= 1 && x[t] * x[t - 1] < 0) {
        zeroCross++;
      }
    }

    mean /= fftSize;
    variant = variant / fftSize - mean ** 2;

    rmean /= fftSize;
    rvariant = rvariant / fftSize - rmean ** 2;

    zeroCross /= fftSize;

    const X = fft.realDFT(x);
    const R = fft.realDFT(r);
    const PS = fft.createVec("Float64Array");
    const tmp = fft.createVec("Float64Array");

    for (let F = 0; F < X[0].length; F++) {
      PS[F] = X[0][F] ** 2 + X[1][F] ** 2;
      X[0][F] = Math.log(PS[F]);
      X[1][F] = 0;
      R[0][F] = R[0][F] ** 2 + R[1][F] ** 2;
      R[1][F] = 0;
    }

    const acf = fft.realIDFT(PS, tmp);
    const macf = fft.realIDFT(R[0], R[1]);
    const cepstrum = fft.realIDFT(X[0], X[1]);

    let cT0 = 0;
    let aT0 = 0;
    let mT0 = 0;

    let cMax = 0;
    let aMax = 0;
    let mMax = 0;

    for (let t = 80, h = fftSize >> 1; t < h; t++) {
      if (cepstrum[t] > cMax) {
        cMax = cepstrum[t];
        cT0 = t;
      }

      if (acf[t] > aMax) {
        aMax = acf[t];
        aT0 = t;
      }

      if (macf[t] > mMax) {
        mMax = macf[t];
        mT0 = t;
      }
    }

    let T0 = 0;

    if (this.prev === null) {
      T0 = aT0;
    } else {
      const candicates = [cT0, aT0, mT0];
      let index = 0;

      for (let i = 0, min = 100000; i < 3; i++) {
        if (Math.abs(this.prev / candicates[i] - 2) < 0.1) {
          candicates[i] *= 2;
        }

        const d = Math.abs(candicates[i] - this.prev);

        if (d < min) {
          min = d;
          index = i;
        }
      }

      T0 = candicates[index];
    }

    this.prev = T0;

    let jump = Math.abs(T0 - (this.prev || 0)) / T0;
    if (jump > 0.1) jump = 1;
    const acc = (acf[T0] - mean ** 2) / (fftSize * variant);
    const macc = (macf[T0] - rmean ** 2) / (fftSize * rvariant);
    const index = 0.4 * acc + 0.01 * macc + -0.15 * zeroCross + -0.91 * jump;

    return index > 0 ? T0 : 0;
  }
}
