import "jest";
import { add } from ".";

test("should add correctly positive numbers", () => {
  const result = add(2, 3);
  expect(result).toBe(5);
});
