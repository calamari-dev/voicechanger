import { getSampleAutoCorrelation } from "./getSampleAutoCorrelation";

it("Sample Auto Correlation", () => {
  const signal = [1, 2, 3, 4, 5, 6];
  const trueValues = [91, 40, 11].map((x) => x / 6);
  const calculated = getSampleAutoCorrelation(signal, 3);

  expect(calculated.length).toBe(trueValues.length);

  for (let i = 0; i < calculated.length; i++) {
    expect(calculated[i]).toBeCloseTo(trueValues[i], 3);
  }
});
