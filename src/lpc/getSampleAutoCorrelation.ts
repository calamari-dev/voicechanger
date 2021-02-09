export const getSampleAutoCorrelation = (
  segment: ArrayLike<number>,
  size: number
) => {
  const width = segment.length;
  const autoCor = new Float64Array(size);

  for (let d = 0; d < size; d++) {
    for (let t = d; t < width - d; t++) {
      autoCor[d] += segment[t] * segment[t - d];
    }

    autoCor[d] /= width;
  }

  return autoCor;
};
