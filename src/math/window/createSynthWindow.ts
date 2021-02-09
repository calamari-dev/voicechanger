export const createSynthWindow = (window: (x: number) => number, q: number) => {
  return (x: number) => {
    let denom = 0;

    for (let i = -(q - 1); i <= q - 1; i++) {
      const t = shrink(x - i / q);
      denom += window(t) ** 2;
    }

    return window(x) / denom;
  };
};

const shrink = (x: number) => {
  return x < 0 ? x + 1 : x > 1 ? x - 1 : x;
};
