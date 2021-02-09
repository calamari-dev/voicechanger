import { AudioData, FileInspector } from "../types";

export class WaveInspector implements FileInspector {
  private view: DataView;

  constructor(view: DataView) {
    this.view = view;
  }

  is16bitLPCM() {
    return this.view.getUint16(20, true) === 1;
  }

  isMonoral() {
    return this.view.getUint16(22, true) === 1;
  }

  getSampleRate() {
    return this.view.getUint32(24, true);
  }

  getDataSize() {
    const offset = 44;
    const filesize = this.view.getUint32(4, true) + 8;
    return filesize - offset;
  }

  getAudioData(): AudioData {
    if (!this.is16bitLPCM()) {
      throw new Error("This file is not 16bit LPCM.");
    }

    const offset = 44;
    const view = this.view;
    const isMonoral = this.isMonoral();
    const datasize = this.getDataSize();
    const sampleRate = this.getSampleRate();

    const normalize = (x: number) => {
      const y = sampleRate === 44100 ? x / 32768 : (x - 128) / 128;
      return y > 1 ? 1 : y < -1 ? -1 : y;
    };

    if (isMonoral) {
      const source: number[] = [];

      for (let byte = 0; byte + 2 < datasize; byte += 2) {
        source.push(normalize(view.getInt16(offset + byte, true)));
      }

      return { type: "monoral", sampleRate, source };
    }

    const left: number[] = [];
    const right: number[] = [];

    for (let byte = 0; byte + 4 < datasize; byte += 4) {
      left.push(normalize(view.getInt16(offset + byte, true)));
      right.push(normalize(view.getInt16(offset + byte + 2, true)));
    }

    return { type: "stereo", sampleRate, left, right };
  }
}
