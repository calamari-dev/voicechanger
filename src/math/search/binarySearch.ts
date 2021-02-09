export const binarySearch = <T>(x: ArrayLike<T>, cond: (x: T) => boolean) => {
  let NG = -1;
  let OK = x.length;

  while (Math.abs(OK - NG) > 1) {
    const median = Math.floor((OK + NG) / 2);

    if (cond(x[median])) {
      OK = median;
    } else {
      NG = median;
    }
  }

  return OK;
};
