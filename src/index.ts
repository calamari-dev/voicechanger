import "tslib";
import { createVoiceChanger } from "./createVoiceChanger";
import { createWave } from "./io";
import { getAudioData } from "./io/getAudioDataFromFile";

const alpha = 2;

const voiceChanger = createVoiceChanger({
  sampleRate: 44100,
  pitchshift: alpha,
  envelopeTransform: (f) => f / Math.pow(alpha, 1 / 3),
  EQ: () => 1,
});

const elm = document.querySelector("input");

elm?.addEventListener("change", async () => {
  const file = elm.files?.[0];

  if (!file) {
    return;
  }

  const input = await getAudioData(file);

  if (input.type !== "monoral") {
    return;
  }

  const result: number[] = [];

  for (let i = 0; i < input.source.length; i++) {
    const { value } = voiceChanger.next(input.source[i]);
    result.push(value || 0);
  }

  input.source = result;
  const output = createWave(input);
  console.log(URL.createObjectURL(output));
});
