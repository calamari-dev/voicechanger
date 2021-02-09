export const evalPolynomial = (
  coef: ArrayLike<number>,
  re: number,
  im: number
): [number, number] => {
  const n = coef.length;
  let zr = coef[n - 1];
  let zi = 0;

  for (let i = n - 2; i >= 0; i--) {
    const tr = zr;
    zr = zr * re - zi * im;
    zi = zi * re + tr * im;
    zr += coef[i];
  }

  return [zr, zi];
};
