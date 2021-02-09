import { evalPolynomial } from "./evalPolynomial";

describe("Horner's Method", () => {
  it("degree = 0", () => {
    const z = evalPolynomial([1], 1, 2);
    expect(z.length).toBe(2);
    expect(z[0]).toBeCloseTo(1, 3);
    expect(z[1]).toBeCloseTo(0, 3);
  });

  it("degree > 0", () => {
    const z = evalPolynomial([1, 2, 3, 4], 1, 2);
    expect(z.length).toBe(2);
    expect(z[0]).toBeCloseTo(-50, 3);
    expect(z[1]).toBeCloseTo(8, 3);
  });
});
