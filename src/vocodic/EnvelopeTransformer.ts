import DFT from "fft";
import { hammingWindow, hannWindow } from "../math/window";
import { toSpectrum } from "../cepstrum/toSpectrum";
import { toCepstrum } from "../cepstrum/toCepstrum";
import { ComplexList } from "../types";
import { linearAt } from "../linearAt";
import { resample } from "./resample";
import { LPCAnalyzer } from "../lpc/LPCAnalyzer";

interface Config {
  sampleRate: number;
  pitchshift: number;
  envelopeTransform: (y: number) => number;
}

const threshould = 80;
const lpcAnalyzer = new LPCAnalyzer({
  degree: 40,
  window: hannWindow,
});

export class EnvelopeTransformer {
  private sampleRate: number;
  private pitchshift: number;
  private resampler: (f: number) => number;

  constructor({ sampleRate, pitchshift, envelopeTransform }: Config) {
    this.sampleRate = sampleRate;
    this.pitchshift = pitchshift;
    this.resampler = envelopeTransform;
  }

  transform(input: ArrayLike<number>, from: number, width: number) {
    /*\
    const dft = new DFT(width);
    const segment = dft.createVec("Float64Array");
    const envelope = lpcAnalyzer.getSpectralEnvelope(input, from, width);

    for (let t = 0; t < width; t++) {
      segment[t] = input[t + from] * hannWindow(t / width);
    }

    const spectrum = dft.realDFT(segment);

    // スペクトル包絡の正規化
    {
      const min = Math.min(spectrum[0].length, envelope.length);
      let s1 = 0;
      let s2 = 0;

      for (let F = 0; F < min; F++) {
        s1 += Math.hypot(spectrum[0][F], spectrum[1][F]);
        s2 += envelope[F];
      }

      const normalizer = s1 / s2;

      for (let F = 0; F < envelope.length; F++) {
        envelope[F] *= normalizer;
      }
    }

    const nextEnvelope = new Float64Array(envelope.length);
    const normalizer = this.sampleRate / dft.size;

    resample([nextEnvelope], [envelope], (Fy) => {
      const fy = Fy * normalizer;
      const fx = this.resampler(fy);
      const Fx = fx / normalizer;
      return Fx;
    });

    // スペクトル包絡の伸縮
    {
      for (let F = 0; F < envelope.length; F++) {
        spectrum[0][F] /= envelope[F];
        spectrum[1][F] /= envelope[F];
      }

      for (let F = 0; F < envelope.length; F++) {
        spectrum[0][F] *= nextEnvelope[F];
        spectrum[1][F] *= nextEnvelope[F];
      }
    }

    const formantshifted = dft.realIDFT(spectrum[0], spectrum[1]);
    return formantshifted;
    \*/

    /*\
    const dft = new DFT(width);
    const segment = dft.createVec("Float64Array");

    for (let i = 0; i < width; i++) {
      segment[i] = input[i + from] * hannWindow(i / width);
    }

    const Envelope = dft.realDFT(segment);
    const NextSpectrum = this.resample(Envelope, dft);
    const formantshifted = dft.realIDFT(NextSpectrum[0], NextSpectrum[1]);
    return formantshifted;
    \*/

    const dft = new DFT(width);
    const segment = dft.createVec("Float64Array");

    for (let i = 0; i < width; i++) {
      segment[i] = input[i + from] * hannWindow(i / width);
    }

    const lowCepstrum = toCepstrum(dft.realDFT(segment), dft);
    const highCepstrum = dft.createVec("Float64Array");

    for (let t = 0; t < threshould; t++) {
      highCepstrum[t] = 0;
      highCepstrum[width - t - 1] = 0;
    }

    for (let t = threshould; t < width / 2; t++) {
      highCepstrum[t] = lowCepstrum[t];
      highCepstrum[width - t - 1] = lowCepstrum[width - t - 1];
      lowCepstrum[t] = 0;
      lowCepstrum[width - t - 1] = 0;
    }

    const Envelope = toSpectrum(lowCepstrum, dft);
    const NextEnvelope = this.resample(Envelope, dft);
    const envelopeCepstrum = toCepstrum(NextEnvelope, dft);

    for (let t = 0; t < width; t++) {
      highCepstrum[t] += envelopeCepstrum[t];
    }

    const NextSpectrum = toSpectrum(highCepstrum, dft);
    const formantshifted = dft.realIDFT(NextSpectrum[0], NextSpectrum[1]);
    return formantshifted;
  }

  private resample(X: ComplexList, dft: DFT): [Float64Array, Float64Array] {
    const Yr = dft.createVec("Float64Array");
    const Yi = dft.createVec("Float64Array");
    const normalizer = this.sampleRate / dft.size;

    resample([Yr, Yi], X, (Fy) => {
      const fy = Fy * normalizer;
      const fx = this.resampler(fy);
      const Fx = fx / normalizer;
      return Fx;
    });

    return [Yr, Yi];
  }
}
