import DFT from "fft";
import { NumericList } from "../types";

export const toSpectrum = <T extends NumericList>(C: T, dft: DFT): [T, T] => {
  const X = dft.realDFT(C);

  for (let F = 0; F < X[0].length; F++) {
    const amp = Math.exp(X[0][F]);
    const Arg = X[1][F];
    X[0][F] = amp * Math.cos(Arg);
    X[1][F] = amp * Math.sin(Arg);
  }

  return X;
};
