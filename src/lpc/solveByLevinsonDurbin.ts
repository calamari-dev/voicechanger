export const solveByLevinsonDurbin = (
  autoCor: ArrayLike<number>,
  degree: number
): Float64Array => {
  const A = new Float64Array(degree + 1);
  let V = autoCor[0] - autoCor[1] ** 2 / autoCor[0];

  A[0] = 1;
  A[1] = -autoCor[1] / autoCor[0];

  for (let n = 1; n < degree; n++) {
    const nh = n >> 1;
    let k = autoCor[n + 1];

    for (let i = 1; i <= n; i++) {
      k += autoCor[i] * A[n + 1 - i];
    }

    k /= -V;

    for (let i = 1; i <= nh; i++) {
      const tmp = A[i];
      A[i] += k * A[n + 1 - i];
      A[n + 1 - i] += k * tmp;
    }

    if (n & 1) {
      A[nh + 1] *= 1 + k;
    }

    A[n + 1] = k;
    V *= 1 - k ** 2;
  }

  return A;
};
