import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, isValidName } from "../src/index.js";

test("normalizes case, whitespace and the .qms suffix", () => {
  assert.equal(normalize("Alice.QMS"), "alice");
  assert.equal(normalize("  bob  "), "bob");
  assert.equal(normalize("a-b-c.qms"), "a-b-c");
});

test("rejects invalid names", () => {
  for (const bad of ["ab", "-abc", "abc-", "al ice", "al.ice", "café", "", "a".repeat(64), null, 5]) {
    assert.equal(normalize(bad), null, String(bad));
  }
  assert.equal(isValidName("a".repeat(63)), true);
});
