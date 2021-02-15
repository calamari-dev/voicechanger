type List = {
  [n: number]: number;
  readonly length: number;
};

export const resampler = (output: List, input: ArrayLike<number>): void => {
  const insize = input.length;
  const outsize = output.length;

  for (let i = 0; i < outsize; i++) {
    output[i] = linearAt(input, insize * (i / outsize));
  }
};

const linearAt = (x: ArrayLike<number>, at: number): number => {
  const max = x.length - 1;
  if (at < 0) return x[0];
  if (at >= max) return x[max];
  const floor = Math.floor(at);
  const r = at - floor;
  return (1 - r) * x[floor] + r * x[floor + 1];
};
