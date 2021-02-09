export type AudioData = StereoAudioData | MonoralAudioData;

export type Source = () => Generator<number, void, void>;

export type StereoAudioData = {
  type: "stereo";
  sampleRate: number;
  left: number[];
  right: number[];
};

export type MonoralAudioData = {
  type: "monoral";
  sampleRate: number;
  source: number[];
};

export abstract class FileInspector {
  constructor(dataView: DataView) {}
  abstract getAudioData(): AudioData;
}

export type FileBuilder = (audioData: AudioData) => Blob;
