export const nuttallWindow = (x: number) => {
  return a - b * cos(2 * PI * x) + c * cos(4 * PI * x) - d * cos(6 * PI * x);
};

const { cos, PI } = Math;
const a = 0.355768;
const b = 0.487396;
const c = 0.144232;
const d = 0.012604;
