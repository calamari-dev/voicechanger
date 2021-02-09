import { AudioData } from "./types";
import { WaveInspector } from "./wave/WaveInspector";

export const getAudioData = async (blob: Blob): Promise<AudioData> => {
  if (!isWave(blob)) {
    throw new Error(`The MIME type "${blob.type}" is not supported.`);
  }

  const buffer = await blob.arrayBuffer();
  const view = new DataView(buffer);
  return new WaveInspector(view).getAudioData();
};

const isWave = ({ type }: Blob) => {
  return /^audio\/((wave?)|(x-(pn-)?wav))$/.test(type);
};
