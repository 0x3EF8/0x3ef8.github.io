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

test("accepts mixed-case command names", () => {
  const harness = createHarness();

  executeTerminalCommand("HeLp", harness.handlers);

  assert.deepEqual(harness.appendCalls[0], { kind: "input", texts: ["HeLp"] });
  assert.equal(harness.appendCalls[1]?.kind, "output");
  assert.equal(harness.appendCalls[1]?.texts[0], "Available commands:");
});

test("supports color aliases", () => {
  const harness = createHarness();

  executeTerminalCommand("colour 2", harness.handlers);

  assert.deepEqual(harness.presetIndices, [2]);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "system",
    texts: ["Applied color preset [2]"],
  });
});

test("supports color help through aliases", () => {
  const harness = createHarness();

  executeTerminalCommand("colors --help", harness.handlers);

  assert.equal(harness.presetIndices.length, 0);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "color-help",
    texts: ["Terminal color presets"],
  });
});

test("normalizes whitespace in commands", () => {
  const harness = createHarness();

  executeTerminalCommand("   open    about   me   ", harness.handlers);

  assert.deepEqual(harness.appendCalls[0], {
    kind: "input",
    texts: ["open    about   me"],
  });
  assert.deepEqual(harness.openedFolders, ["dumps"]);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["opened about me"],
  });
});

test("normalizes folder ids with punctuation and case", () => {
  const harness = createHarness();

  executeTerminalCommand("open WISH-LIST", harness.handlers);

  assert.deepEqual(harness.openedFolders, ["wishlist"]);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["opened projects"],
  });
});

test("supports vi alias for vim", () => {
  const harness = createHarness();

  executeTerminalCommand("vi", harness.handlers);

  assert.equal(harness.openVimCalls.length, 1);
  assert.deepEqual(harness.appendCalls[1], {
    kind: "output",
    texts: ["vim opened"],
  });
});
