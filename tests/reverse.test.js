import { reverse } from "../utils/testing.js";

//Describe blocks can be used for grouping tests into logical collections.
//The test output of Jest also uses the name of the describe block:

describe("reverse", () => {
  test("reverse of a", () => {
    const result = reverse("a");

    expect(result).toBe("a");
  });

  test("reverse of react", () => {
    const result = reverse("react");

    expect(result).toBe("tcaer");
  });

  test("reverse of releveler", () => {
    const result = reverse("releveler");

    expect(result).toBe("releveler");
  });
});
