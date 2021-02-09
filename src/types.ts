export type NumericList = number[] | Float32Array | Float64Array;

export type ComplexList = ReturnType<
  <T extends NumericList>(x: T) => T extends infer U ? [U, U] : never
>;
