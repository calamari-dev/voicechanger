import { TD_PSOLA } from "./TD_PSOLA";
import { NumericList } from "./types";
import { EnvelopeTransformer } from "./EnvelopeTransformer";
import { createSynthWindow, hannWindow } from "./math/window";
import { PeriodDetector } from "./PeriodDetector";

interface Config {
  sampleRate: number;
  pitchshift: number;
  envelopeTransform: (y: number) => number;
  EQ: (x: number) => number;
}

const defaultT0 = 130;
const quantile = 3;
const synthWindow = createSynthWindow(hannWindow, quantile);

export const createVoiceChanger = function* (config: Config) {
  const stft = new EnvelopeTransformer(config);
  const td_psola = new TD_PSOLA({
    ...config,
    quantile,
  });

  const periodDetector = new PeriodDetector({ fftSize: 1024 });

  let input: number[] = [];
  const output: number[] = [];

  let segment: ArrayLike<number> = Array(1024).fill(0);
  let windowstart = 0;
  let t0 = 0;

  // 分析に要する遅延
  while (input.length < 1024) {
    input.push(yield 0);
  }

  while (1) {
    const delta = input.length - windowstart;

    // バッファ管理
    {
      const segsize = segment.length;
      const frameshift = Math.round(segsize / quantile);
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
      t0 = periodDetector.getPeriod(input, windowstart);
      if (t0 === 0) t0 = defaultT0;
    }

    if (delta < 1024 || delta < quantile * t0) {
      continue;
    }

    // フォルマントシフト
    let formantshifted: NumericList;
    const width = quantile * t0;

    let peak = 0;

    for (let i = 0, max = 0; i < t0 && i >= 0; i++) {
      const amp = Math.abs(input[windowstart - i]);
      if (amp > max) {
        max = amp;
        peak = windowstart - i;
      }
    }

    formantshifted = stft.getGlottalSegment(input, peak, width);

    // STFTの合成窓を掛ける
    for (let t = 0; t < width; t++) {
      formantshifted[t] *= synthWindow(t / width);
    }

    // TD-PSOLA
    const pitchshifted = td_psola.run(formantshifted);

    // 更新処理
    const frameshift = Math.round(width / quantile);
    segment = pitchshifted;
    input = input.slice(windowstart);
    windowstart = frameshift;
  }
};
