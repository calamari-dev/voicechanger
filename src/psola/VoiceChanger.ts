import { PeriodEstimator } from "./PeriodEstimator";
import { EnvelopeTransformer } from "./EnvelopeTransformer";

interface Config {
  sampleRate: number;
  dftSize: number;
  f0Range: [number, number];
  pitchshift: number;
  envelopeTransform: (y: number) => number;
}

export class VoiceChanger {
  private sampleRate: number;
  private pitchshift: number;
  private dftSize: number;
  private periodEstimator: PeriodEstimator;
  private envelopeTransformer: EnvelopeTransformer;

  private input: number[] = [];
  private output: number[] = [];
  private segment: Float64Array = new Float64Array(1024);
  private pitchmark = 0;
  private T0 = 200;

  constructor({
    sampleRate,
    dftSize,
    f0Range,
    pitchshift,
    envelopeTransform,
  }: Config) {
    this.sampleRate = sampleRate;
    this.pitchshift = pitchshift;
    this.dftSize = dftSize;
    this.periodEstimator = new PeriodEstimator({
      dftSize,
      sampleRate,
      f0Range,
    });
    this.envelopeTransformer = new EnvelopeTransformer({
      envelopeTransform,
      sampleRate,
    });
  }

  next(x: number): number {
    const { input, output, dftSize, pitchmark, T0 } = this;
    input.push(x);

    if (input.length < dftSize) {
      return 0;
    }

    if (input.length - pitchmark >= 2 * T0) {
      this.update();
    }

    this.OLA();
    return output.shift() || 0;
  }

  private OLA() {
    const { segment, pitchshift, output } = this;
    const segsize = segment.length;
    const frameshift = Math.round(segsize / (2 * pitchshift));
    const overlap = segsize - frameshift;

    while (output.length <= overlap) {
      const olastart = output.length - overlap;

      for (let t = 0; t < overlap; t++) {
        output[t - olastart] += segment[t];
      }

      for (let t = overlap; t < segsize; t++) {
        output.push(segment[t]);
      }
    }
  }

  private update() {
    const { input, pitchmark, T0 } = this;
    const width = 2 * T0;

    this.segment = this.envelopeTransformer.transform(input, pitchmark, width);
    this.T0 = this.periodEstimator.getPeriod(input, input.length - 1024);

    if (this.T0 === 0) {
      this.T0 = Math.round(this.sampleRate / 300);
    }

    const infT0 = Math.round(this.sampleRate / 1200);
    let nextPitchmark = 0;

    for (let t = infT0, max = 0; t < 2 * T0 - infT0; t++) {
      const amp = Math.abs(input[pitchmark + t]);
      if (amp > max) {
        max = amp;
        nextPitchmark = pitchmark + t;
      }
    }

    const needless = input.length - this.dftSize;
    this.input.splice(0, needless);
    this.pitchmark = nextPitchmark - needless;
  }
}
