export const linearAt = (fn: ArrayLike<number>, x: number) => {
  const max = fn.length - 1;
  if (x < 0) return fn[0];
  if (x >= max) return fn[max];
  const floor = Math.floor(x);
  const r = x - floor;
  return (1 - r) * fn[floor] + r * fn[floor + 1];
};
