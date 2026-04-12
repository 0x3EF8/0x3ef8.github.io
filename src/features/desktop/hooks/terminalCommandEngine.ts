import { ARCH_NEOFETCH_TEXT, FOLDERS, TERMINAL_COLOR_PRESETS } from "../constants";
import { normalizeLabel } from "../helpers";
import type { FolderId, TerminalLineKind } from "../types";

type TerminalCommandHandlers = {
  appendTerminalLines: (kind: TerminalLineKind, texts: string[]) => void;
  clearTerminalLines: () => void;
  setTerminalColorPresetIndex: (index: number) => void;
  openTerminal: () => void;
  openFolder: (folderId: FolderId) => void;
  openVim: () => void;
  closeTerminal: () => void;
};

const resolveFolderFromInput = (input: string): FolderId | null => {
  const normalizedInput = normalizeLabel(input);

  for (const folder of FOLDERS) {
    if (normalizeLabel(folder.name) === normalizedInput || normalizeLabel(folder.id) === normalizedInput) {
      return folder.id;
    }
  }

  return null;
};

export const executeTerminalCommand = (
  rawCommand: string,
  {
    appendTerminalLines,
    clearTerminalLines,
    setTerminalColorPresetIndex,
    openTerminal,
    openFolder,
    openVim,
    closeTerminal,
  }: TerminalCommandHandlers,
) => {
  const commandText = rawCommand.trim();
  if (!commandText) {
    return;
  }

  appendTerminalLines("input", [commandText]);

  const [commandName, ...args] = commandText.split(/\s+/);
  const baseCommand = commandName.toLowerCase();
  const argumentText = args.join(" ");

  if (baseCommand === "clear") {
    clearTerminalLines();
    return;
  }

  if (baseCommand === "help") {
    appendTerminalLines("output", [
      "Available commands:",
      "help, clear, ls, pwd, whoami, hostname, date, neofetch, color <0-7>, color --help, echo <text>, vim, open <name>, exit",
    ]);
    return;
  }

  if (baseCommand === "vim" || baseCommand === "vi") {
    openVim();
    appendTerminalLines("output", ["vim opened"]);
    return;
  }

  if (baseCommand === "ls") {
    appendTerminalLines("output", [...FOLDERS.map((folder) => folder.name.replace(/\s+/g, "_")), "terminal.log"]);
    return;
  }

  if (baseCommand === "pwd") {
    appendTerminalLines("output", ["/home/linuxiac"]);
    return;
  }

  if (baseCommand === "whoami") {
    appendTerminalLines("output", ["linuxiac"]);
    return;
  }

  if (baseCommand === "hostname") {
    appendTerminalLines("output", ["arch"]);
    return;
  }

  if (baseCommand === "date") {
    appendTerminalLines("output", [new Date().toString()]);
    return;
  }

  if (baseCommand === "neofetch") {
    appendTerminalLines("neofetch", [ARCH_NEOFETCH_TEXT]);
    return;
  }

  if (["color", "colors", "colo", "colour"].includes(baseCommand)) {
    const colorArg = args[0]?.toLowerCase();

    if (colorArg === "--help" || colorArg === "-h" || colorArg === "help") {
      appendTerminalLines("color-help", ["Terminal color presets"]);
      return;
    }

    if (!colorArg) {
      appendTerminalLines("system", ["Usage: color <0-7> (or color --help)"]);
      return;
    }

    const colorIndex = Number.parseInt(colorArg, 10);
    const isValidPreset =
      Number.isInteger(colorIndex) && colorIndex >= 0 && colorIndex < TERMINAL_COLOR_PRESETS.length;

    if (!isValidPreset) {
      appendTerminalLines("system", ["Usage: color <0-7>"]);
      return;
    }

    setTerminalColorPresetIndex(colorIndex);
    appendTerminalLines("system", [`Applied color preset [${colorIndex}]`]);
    return;
  }

  if (baseCommand === "echo") {
    appendTerminalLines("output", [argumentText]);
    return;
  }

  if (baseCommand === "open") {
    if (!argumentText) {
      appendTerminalLines("error", ["usage: open <folder-name>"]);
      return;
    }

    if (normalizeLabel(argumentText) === "terminal") {
      openTerminal();
      appendTerminalLines("output", ["terminal focused"]);
      return;
    }

    if (["vim", "vi", "editor"].includes(normalizeLabel(argumentText))) {
      openVim();
      appendTerminalLines("output", ["vim opened"]);
      return;
    }

    const folderId = resolveFolderFromInput(argumentText);
    if (!folderId) {
      appendTerminalLines("error", [`folder not found: ${argumentText}`]);
      return;
    }

    openFolder(folderId);
    const folder = FOLDERS.find((item) => item.id === folderId);
    appendTerminalLines("output", [`opened ${folder?.name ?? folderId}`]);
    return;
  }

  if (baseCommand === "exit") {
    closeTerminal();
    return;
  }

  appendTerminalLines("error", [`command not found: ${commandName}`]);
};
