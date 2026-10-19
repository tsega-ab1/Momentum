import test from "node:test";
import assert from "node:assert/strict";
import { initStudio, studioReducer as r, canUndo, canRedo, COALESCE_MS } from "../lib/studio-reducer.js";

test("starts with the lime default and an empty history", () => {
  const s = initStudio();
  assert.equal(s.present.base, "#c9f27a");
  assert.equal(canUndo(s), false);
  assert.equal(canRedo(s), false);
});

test("an invalid hex is ignored", () => {
  const s = initStudio();
  assert.equal(r(s, { type: "set_base", value: "nope", at: 1 }), s);
});

test("undo and redo walk through changes", () => {
  let s = initStudio({ base: "#111111" });
  s = r(s, { type: "set_count", value: 9, at: 1 });
  s = r(s, { type: "set_base", value: "#222222", at: 5000 });
  assert.equal(s.present.base, "#222222");
  s = r(s, { type: "undo" });
  assert.equal(s.present.base, "#111111");
  assert.equal(s.present.count, 9);
  s = r(s, { type: "undo" });
  assert.equal(s.present.count, 11);
  assert.equal(canUndo(s), false);
  s = r(s, { type: "redo" });
  assert.equal(s.present.count, 9);
  s = r(s, { type: "redo" });
  assert.equal(s.present.base, "#222222");
  assert.equal(canRedo(s), false);
});

test("a new change after undo clears the redo history", () => {
  let s = initStudio();
  s = r(s, { type: "set_count", value: 9, at: 1 });
  s = r(s, { type: "undo" });
  assert.equal(canRedo(s), true);
  s = r(s, { type: "set_count", value: 7, at: 2 });
  assert.equal(canRedo(s), false);
});

test("rapid base changes (dragging the picker) merge into ONE undo step", () => {
  let s = initStudio({ base: "#000000" });
  s = r(s, { type: "set_base", value: "#101010", at: 1000 });
  s = r(s, { type: "set_base", value: "#202020", at: 1000 + COALESCE_MS - 1 });
  s = r(s, { type: "set_base", value: "#303030", at: 1000 + COALESCE_MS - 1 });
  assert.equal(s.past.length, 1);
  s = r(s, { type: "undo" });
  assert.equal(s.present.base, "#000000");
});

test("base changes further apart than the window are separate steps", () => {
  let s = initStudio({ base: "#000000" });
  s = r(s, { type: "set_base", value: "#101010", at: 1000 });
  s = r(s, { type: "set_base", value: "#202020", at: 1000 + COALESCE_MS + 1 });
  assert.equal(s.past.length, 2);
});

test("setting the same value again does not add a history entry", () => {
  const s = initStudio({ base: "#123456" });
  assert.equal(r(s, { type: "set_base", value: "#123456", at: 1 }), s);
  assert.equal(r(s, { type: "set_count", value: 11, at: 1 }), s);
});

test("the name is not part of the undo history", () => {
  let s = initStudio();
  s = r(s, { type: "set_name", value: "Hello" });
  assert.equal(canUndo(s), false);
  s = r(s, { type: "set_count", value: 5, at: 1 });
  s = r(s, { type: "undo" });
  assert.equal(s.name, "Hello");
});

test("undo and redo do nothing when there is nothing to do", () => {
  const s = initStudio();
  assert.equal(r(s, { type: "undo" }), s);
  assert.equal(r(s, { type: "redo" }), s);
});

test("initStudio ignores a tampered shade count or visibility", () => {
  const s = initStudio({ base: "#2563eb", count: 99, isPublic: "yes" });
  assert.equal(s.present.count, 11);
  assert.equal(s.present.isPublic, true);
});
