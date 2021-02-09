type Point = [number, number];
type Norm1<T> = (x: T, i: number) => number;
type Norm2<T> = (x: T, y: T, i: number) => number;

export const getMaxIndex = <T extends ArrayLike<unknown>>(
  ...arg:
    | [ArrayLike<number> | Point[]]
    | [T, Norm1<T[number]>]
    | [T, T, Norm2<T[number]>]
): number => {
  if (arg.length === 3) {
    const [fn1, fn2, norm] = arg;
    let max = 0;
    let index = 0;

    for (let k = 0; k < fn1.length; k++) {
      const abs = norm(fn1[k], fn2[k], k);

      if (abs > max) {
        max = abs;
        index = k;
      }
    }

    return index;
  }

  if (arg.length === 2) {
    const [fn, norm] = arg;
    let max = 0;
    let index = 0;

    for (let k = 0; k < fn.length; k++) {
      const abs = norm(fn[k], k);

      if (abs > max) {
        max = abs;
        index = k;
      }
    }

    return index;
  }

  const fn = arg[0];
  let max = 0;
  let index = 0;

  if (isPoints(fn)) {
    for (let k = 0; k < fn.length; k++) {
      if (fn[k][1] > max) {
        max = fn[k][1];
        index = k;
      }
    }
  } else {
    for (let k = 0; k < fn.length; k++) {
      if (fn[k] > max) {
        max = fn[k];
        index = k;
      }
    }
  }

  return index;
};

const isPoints = (fn: ArrayLike<unknown>): fn is Point[] => {
  return Array.isArray(fn[0]);
};
