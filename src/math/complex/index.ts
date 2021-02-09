export type Complex = [re: number, im: number];

export const from = (x: number): Complex => {
  return [x, 0];
};

export const cis = (theta: number): Complex => {
  return [Math.cos(theta), Math.sin(theta)];
};

export const exp = ([x, y]: Complex): Complex => {
  const r = Math.exp(x);
  return [r * Math.cos(y), r * Math.sin(y)];
};

export const log = (z: Complex): Complex | undefined => {
  if (z[0] === 0 && z[1] === 0) {
    return undefined;
  } else {
    return [0.5 * Math.log(z[0] ** 2 + z[1] ** 2), arg(z) ?? 0];
  }
};

export const abs = ([x, y]: Complex): number => {
  return Math.sqrt(x ** 2 + y ** 2);
};

export const arg = ([x, y]: Complex): number | undefined => {
  if (x > 0) {
    return Math.atan(y / x);
  }

  if (x < 0) {
    return y < 0 ? Math.atan(y / x) - Math.PI : Math.atan(y / x) + Math.PI;
  }

  if (y === 0) {
    return undefined;
  }

  return y < 0 ? -Math.PI / 2 : Math.PI / 2;
};

export const add = ([x, y]: Complex, [u, v]: Complex): Complex => {
  return [x + u, y + v];
};

export const sub = ([x, y]: Complex, [u, v]: Complex): Complex => {
  return [x - u, y - v];
};

export const mul = ([x, y]: Complex, [u, v]: Complex): Complex => {
  return [x * u - y * v, x * v + u * y];
};

export const div = ([x, y]: Complex, [u, v]: Complex): Complex => {
  const r = Math.sqrt(u ** 2 + v ** 2);
  return [(x * u + y * v) / r, (y * u - x * v) / r];
};
