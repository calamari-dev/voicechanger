import { TD_PSOLA } from "./TD_PSOLA";
import { EnvelopeTransformer } from "./EnvelopeTransformer";
import { createSynthWindow, hannWindow } from "../math/window";
import { PeriodDetector } from "./PeriodDetector";

interface Config {
  sampleRate: number;
  pitchshift: number;
  envelopeTransform: (y: number) => number;
}

const quantile = 3;
const synthWindow = createSynthWindow(hannWindow, quantile);

export const createVoiceChanger = function* (config: Config) {
  const { pitchshift } = config;
  const stft = new EnvelopeTransformer(config);
  const td_psola = new TD_PSOLA({
    ...config,
    quantile,
  });

  const periodDetector = new PeriodDetector({
    sampleRate: 44100,
    dftSize: 1024,
  });

  let input: number[] = [];
  const output: number[] = [];

  let segment: ArrayLike<number> = Array(1024).fill(0);
  let windowstart = 0;
  let T0 = 0;

  // 分析に要する遅延
  while (input.length < 1024) {
    input.push(yield 0);
  }

  while (1) {
    const delta = input.length - windowstart;

    // バッファ管理
    {
      const segsize = segment.length;
      const frameshift = Math.round(segsize / (pitchshift * quantile));
      const overlap = segsize - frameshift;

      if (output.length <= overlap) {
        const olastart = output.length - overlap;

        for (let t = 0; t < overlap; t++) {
          output[t - olastart] += segment[t];
        }

        for (let t = overlap; t < segsize; t++) {
          output.push(segment[t]);
        }
      }

      input.push(yield output.shift() || 0);
    }

    if (delta === 1024) {
      T0 = periodDetector.getPeriod(input, windowstart);
    }

    if (delta < 1024 || delta < quantile * T0) {
      continue;
    }

    // フォルマントシフト
    const width = quantile * T0;
    let pitchmark = 0;

    for (let t = 0, max = 0; t < T0 && t >= 0; t++) {
      const amp = Math.abs(input[windowstart - t]);
      if (amp > max) {
        max = amp;
        pitchmark = windowstart - t;
      }
    }

    const formantshifted = stft.transform(input, pitchmark, width);

    for (let t = 0; t < width; t++) {
      formantshifted[t] *= synthWindow(t / width);
    }

    const pitchshifted = td_psola.run(formantshifted);

    const frameshift = Math.round(width / quantile);
    segment = pitchshifted;
    input = input.slice(windowstart);
    windowstart = frameshift;
  }
};
