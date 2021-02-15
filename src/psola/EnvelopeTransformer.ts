import DFT from "fft";
import { hannWindow } from "../math/window";
import { linearAt } from "../linearAt";

interface Config {
  sampleRate: number;
  envelopeTransform: (fy: number) => number;
}

export class EnvelopeTransformer {
  private sampleRate: number;
  private resampler: (f: number) => number;

  constructor({ sampleRate, envelopeTransform }: Config) {
    this.sampleRate = sampleRate;
    this.resampler = envelopeTransform;
  }

  transform(input: ArrayLike<number>, from: number, width: number) {
    const dft = new DFT(width);
    const x = dft.createVec("Float64Array");

    for (let t = 0; t < width; t++) {
      x[t] = input[t + from] * hannWindow(t / width);
    }

    const [Xr, Xi] = dft.realDFT(x);
    const Yr = dft.createVec("Float64Array");
    const Yi = dft.createVec("Float64Array");
    const normalizer = this.sampleRate / dft.size;

    for (let Fy = 0; Fy < Xr.length; Fy++) {
      const fy = Fy * normalizer;
      const fx = this.resampler(fy);
      const Fx = fx / normalizer;
      Yr[Fy] = linearAt(Xr, Fx);
      Yi[Fy] = linearAt(Xi, Fx);
    }

    const y = dft.realIDFT(Yr, Yi);
    return y;
  }
}
