import { hannWindow } from "../math/window";

interface Config {
  pitchshift: number;
  quantile: number;
}

export class TD_PSOLA {
  readonly pitchshift: number;
  readonly quantile: number;

  constructor({ pitchshift, quantile }: Config) {
    this.pitchshift = pitchshift;
    this.quantile = quantile;
  }

  run(input: ArrayLike<number>) {
    const insize = input.length;
    const r = 1 / this.pitchshift;
    const q = this.quantile;
    const T0 = Math.floor(insize / q);

    const outsize = Math.ceil((insize / q) * ((q - 2) * r + 2));
    const output = new Float64Array(outsize);

    for (let i = 0; i < q - 1; i++) {
      const is = i * T0;
      const os = i * Math.floor(r * T0);

      for (let k = 0; k < 2 * T0; k++) {
        output[os + k] += input[is + k] * hannWindow(k / (2 * T0));
      }
    }

    return output;
  }
}
