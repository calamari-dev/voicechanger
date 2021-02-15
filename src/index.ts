import "tslib";
import { createVoiceChanger } from "./vocodic/createVoiceChanger";
import { createWave } from "./io";
import { getAudioData } from "./io/getAudioDataFromFile";
import { VoiceChanger } from "./psola/VoiceChanger";
import { BiquadFilter } from "./filter/BiquadFilter";
import DFT from "fft";

const rs = 2;
const rh = Math.pow(rs, 1 / 3);

/*\
const voiceChanger = createVocodic({
  sampleRate: 44100,
  pitchshift: rs,
  envelopeTransform: (f) => f / rh,
});
\*/

const voiceChanger = new VoiceChanger({
  sampleRate: 44100,
  dftSize: 1024,
  f0Range: [80, 700],
  pitchshift: rs,
  envelopeTransform: (f) => f / rh,
});

const filter = new BiquadFilter({
  type: "bandstop",
  sampleRate: 44100,
  frequency: 1000,
  gain: 0,
  Q: 10,
});

const dft = new DFT(1024);
const x = dft.createVec("Float64Array");

for (let t = 0; t < 1024; t++) {
  x[t] = filter.next(t === 0 ? 1 : 0);
}

const X = dft.realDFT(x);
const amp = X[0].map((re, f) => Math.hypot(re, X[1][f]));
console.log([...amp]);

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

  /*\
  for (let i = 0; i < input.source.length; i++) {
    const { value } = voiceChanger.next(input.source[i]);
    result.push(value || 0);
  }
  \*/

  for (let i = 0; i < input.source.length; i++) {
    const value = voiceChanger.next(input.source[i]);
    result.push(value);
  }

  input.source = result;
  const output = createWave(input);
  console.log(URL.createObjectURL(output));
});
