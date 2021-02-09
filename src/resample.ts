export const resample = (
  y: Array<{ [i: number]: number }>,
  x: Array<ArrayLike<number>>,
  fn: (i: number) => number
): void => {
  const width = x.length;
  const height = x[0].length;

  for (let row = 0; row < width; row++) {
    for (let col = 0; col < height; col++) {
      y[row][col] = linearAt(x[row], fn(col));
    }
  }
};

const linearAt = (fn: ArrayLike<number>, x: number) => {
  const max = fn.length - 1;

  if (x < 0) return fn[0];
  if (x >= max) return fn[max];

  const floor = Math.floor(x);
  const r = x - floor;
  return (1 - r) * fn[floor] + r * fn[floor + 1];
};
