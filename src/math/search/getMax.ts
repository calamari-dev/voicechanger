import { getMaxIndex } from "./getMaxIndex";

export const getMax = (...arg: number[] | [ArrayLike<number>]): number => {
  if (isNumeric(arg)) {
    const index = getMaxIndex(arg);
    return arg[index];
  }

  const index = getMaxIndex(arg[0]);
  return arg[0][index];
};

const isNumeric = (fn: unknown[]): fn is number[] => {
  return typeof fn[0] === "number";
};
