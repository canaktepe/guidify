import assert from "node:assert";
import { generateGuid, generateGuids, isGuid } from "../src/guidGenerator.js";

function testSingleGuid() {
  const guid = generateGuid();
  assert.ok(isGuid(guid), `Generated GUID is invalid: ${guid}`);
}

function testMultipleGuids() {
  const count = 20;
  const guids = generateGuids(count);
  assert.strictEqual(guids.length, count, "GUID count mismatch");
  const unique = new Set(guids);
  assert.strictEqual(unique.size, count, "GUIDs are not unique");
  guids.forEach((g) => assert.ok(isGuid(g), `Invalid GUID in list: ${g}`));
}

function testInvalidCount() {
  assert.throws(() => generateGuids(0), /count must be a positive integer/);
  assert.throws(() => generateGuids(-1), /count must be a positive integer/);
  assert.throws(() => generateGuids(1.2), /count must be a positive integer/);
}

testSingleGuid();
testMultipleGuids();
testInvalidCount();

console.log("All GUID tests passed.");
