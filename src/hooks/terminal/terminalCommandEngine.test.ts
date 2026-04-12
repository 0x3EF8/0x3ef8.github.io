import assert from "node:assert/strict";
import test from "node:test";
import { executeTerminalCommand } from "./terminalCommandEngine";
import type { FolderId, TerminalLineKind } from "../../types";

type AppendCall = {
  kind: TerminalLineKind;
  texts: string[];
};

const createHarness = () => {
  const appendCalls: AppendCall[] = [];
  const clearCalls: number[] = [];
  const presetIndices: number[] = [];
  const openTerminalCalls: number[] = [];
  const openVimCalls: number[] = [];
  const openedFolders: FolderId[] = [];
  const closeTerminalCalls: number[] = [];

  return {
    appendCalls,
    clearCalls,
    presetIndices,
    openTerminalCalls,
    openVimCalls,
    openedFolders,
    closeTerminalCalls,
    handlers: {
      appendTerminalLines: (kind: TerminalLineKind, texts: string[]) => {
        appendCalls.push({ kind, texts });
      },
      clearTerminalLines: () => {
        clearCalls.push(1);
      },
      setTerminalColorPresetIndex: (index: number) => {
        presetIndices.push(index);
      },
      openTerminal: () => {
        openTerminalCalls.push(1);
      },
      openVim: () => {
        openVimCalls.push(1);
      },
      openFolder: (folderId: FolderId) => {
        openedFolders.push(folderId);
      },
      closeTerminal: () => {
        closeTerminalCalls.push(1);
      },
    },
  };
};

test("ignores empty command input", () => {
  const harness = createHarness();

  executeTerminalCommand("   ", harness.handlers);

  assert.equal(harness.appendCalls.length, 0);
  assert.equal(harness.clearCalls.length, 0);
  assert.equal(harness.presetIndices.length, 0);
  assert.equal(harness.openTerminalCalls.length, 0);
  assert.equal(harness.openVimCalls.length, 0);
  assert.equal(harness.openedFolders.length, 0);
  assert.equal(harness.closeTerminalCalls.length, 0);
});

test("prints help output", () => {
  const harness = createHarness();

  executeTerminalCommand("help", harness.handlers);

  assert.deepEqual(harness.appendCalls[0], { kind: "input", texts: ["help"] });
  assert.equal(harness.appendCalls[1]?.kind, "output");
  assert.equal(harness.appendCalls[1]?.texts[0], "Available commands:");
});

test("clears terminal on clear command", () => {
  const harness = createHarness();

  executeTerminalCommand("clear", harness.handlers);

  assert.deepEqual(harness.appendCalls[0], { kind: "input", texts: ["clear"] });
  assert.equal(harness.clearCalls.length, 1);
});

test("updates color preset for a valid color command", () => {
  const harness = createHarness();

  executeTerminalCommand("color 3", harness.handlers);

  assert.deepEqual(harness.presetIndices, [3]);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "system",
    texts: ["Applied color preset [3]"],
  });
});

test("shows usage for invalid color command", () => {
  const harness = createHarness();

  executeTerminalCommand("color 99", harness.handlers);

  assert.equal(harness.presetIndices.length, 0);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "system",
    texts: ["Usage: color <0-7>"],
  });
});

test("opens terminal from open terminal command", () => {
  const harness = createHarness();

  executeTerminalCommand("open terminal", harness.handlers);

  assert.equal(harness.openTerminalCalls.length, 1);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["terminal focused"],
  });
});

test("opens vim from vim command", () => {
  const harness = createHarness();

  executeTerminalCommand("vim", harness.handlers);

  assert.equal(harness.openVimCalls.length, 1);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["vim opened"],
  });
});

test("opens vim from open vim command", () => {
  const harness = createHarness();

  executeTerminalCommand("open vim", harness.handlers);

  assert.equal(harness.openVimCalls.length, 1);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["vim opened"],
  });
});

test("opens folder by folder display name", () => {
  const harness = createHarness();

  executeTerminalCommand("open about me", harness.handlers);

  assert.deepEqual(harness.openedFolders, ["dumps"]);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["opened about me"],
  });
});

test("shows error for unknown folder", () => {
  const harness = createHarness();

  executeTerminalCommand("open unknown-folder", harness.handlers);

  assert.equal(harness.openedFolders.length, 0);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "error",
    texts: ["folder not found: unknown-folder"],
  });
});

test("closes terminal on exit", () => {
  const harness = createHarness();

  executeTerminalCommand("exit", harness.handlers);

  assert.equal(harness.closeTerminalCalls.length, 1);
});

test("prints command-not-found for unknown commands", () => {
  const harness = createHarness();

  executeTerminalCommand("doesnotexist", harness.handlers);

  assert.deepEqual(harness.appendCalls[1], {
    kind: "error",
    texts: ["command not found: doesnotexist"],
  });
});
