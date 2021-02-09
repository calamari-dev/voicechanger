export const hammingWindow = (x: number) => {
  return 0.54 - 0.46 * Math.cos(2 * Math.PI * x);
};
