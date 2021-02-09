import { solveByLevinsonDurbin } from "./solveByLevinsonDurbin";

it("Levinson Durbin Algorithm", () => {
  const autoCor = [4, 3, 2, 1];
  const trueValues = [1, -5 / 6, 0, 1 / 6];
  const calculated = solveByLevinsonDurbin(autoCor, 3);

  expect(calculated.length).toBe(trueValues.length);

  for (let i = 0; i < calculated.length; i++) {
    expect(calculated[i]).toBeCloseTo(trueValues[i], 3);
  }
});
