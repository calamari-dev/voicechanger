import DFT from "fft";
import { abs, arg, Complex } from "../math/complex";
import { NumericList } from "../types";

export const toCepstrum = <T extends NumericList>(X: [T, T], dft: DFT): T => {
  for (let F = 0; F < X[0].length; F++) {
    const z: Complex = [X[0][F], X[1][F]];
    const amp = abs(z);
    X[0][F] = amp > 0 ? Math.log(amp) : -1000;
    X[1][F] = arg(z) || 0;
  }

  return dft.realIDFT(X[0], X[1]);
};
