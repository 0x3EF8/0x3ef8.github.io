import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import {
  ARCH_NEOFETCH_TEXT,
  DOCK_CLEARANCE,
  SIDE_DOCK_CLEARANCE,
  TERMINAL_COLOR_PRESETS,
  TERMINAL_MIN_HEIGHT,
  TERMINAL_MIN_WIDTH,
  TOP_PANEL_CLEARANCE,
} from "../constants";
import { clamp } from "../helpers";
import type {
  LinuxSurfaceId,
  DragState,
  FolderId,
  ResizeState,
  TerminalLine,
  TerminalLineKind,
  LinuxSurfacePosition,
  LinuxSurfaceSize,
} from "../types";
import { executeTerminalCommand } from "./terminalCommandEngine";

type UseLinuxTerminalParams = {
  stageRef: RefObject<HTMLElement | null>;
  isCompactLayout: boolean;
  getSurfaceZIndex: (surfaceId: LinuxSurfaceId) => number;
  bringAnySurfaceToFront: (surfaceId: LinuxSurfaceId) => void;
  removeSurfaceFromOrder: (surfaceId: LinuxSurfaceId) => void;
  openFolder: (folderId: FolderId) => void;
  openVim: () => void;
};

export function useLinuxTerminal({
  stageRef,
  isCompactLayout,
  getSurfaceZIndex,
  bringAnySurfaceToFront,
  removeSurfaceFromOrder,
  openFolder,
  openVim,
}: UseLinuxTerminalParams) {
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const terminalLineIdRef = useRef(2);
  const terminalDragStateRef = useRef<DragState | null>(null);
  const terminalResizeStateRef = useRef<ResizeState | null>(null);

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [isTerminalDragging, setIsTerminalDragging] = useState(false);
  const [isTerminalResizing, setIsTerminalResizing] = useState(false);
  const [terminalPosition, setTerminalPosition] = useState<LinuxSurfacePosition>({ x: 200, y: 165 });
  const [terminalSize, setTerminalSize] = useState<LinuxSurfaceSize>({ width: 620, height: 360 });
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalHistoryIndex, setTerminalHistoryIndex] = useState(-1);
  const [terminalColorPresetIndex, setTerminalColorPresetIndex] = useState(0);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { id: 0, kind: "system", text: "Welcome to Jay Terminal. Type 'help' to see commands." },
    { id: 1, kind: "neofetch", text: ARCH_NEOFETCH_TEXT },
  ]);

  useEffect(() => {
    if (!isTerminalOpen || isTerminalMinimized) {
      return;
    }

    terminalInputRef.current?.focus();
  }, [isTerminalOpen, isTerminalMinimized, isTerminalMaximized]);

  useEffect(() => {
    if (!isTerminalOpen || isTerminalMinimized) {
      return;
    }

    const scrollContainer = terminalScrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [terminalLines, isTerminalOpen, isTerminalMinimized]);

  const appendTerminalLines = (kind: TerminalLineKind, texts: string[]) => {
    setTerminalLines((current) => [
      ...current,
      ...texts.map((text) => ({
        id: terminalLineIdRef.current++,
        kind,
        text,
      })),
    ]);
  };

  const openTerminal = () => {
    setIsTerminalOpen(true);
    setIsTerminalMinimized(false);
    bringAnySurfaceToFront("terminal");
  };

  const closeTerminal = () => {
    setIsTerminalOpen(false);
    setIsTerminalMinimized(false);
    setIsTerminalMaximized(false);
    setIsTerminalDragging(false);
    setIsTerminalResizing(false);
    terminalDragStateRef.current = null;
    terminalResizeStateRef.current = null;
    removeSurfaceFromOrder("terminal");
  };

  const minimizeTerminal = () => {
    setIsTerminalMinimized(true);
    setIsTerminalMaximized(false);
    setIsTerminalDragging(false);
    setIsTerminalResizing(false);
    terminalDragStateRef.current = null;
    terminalResizeStateRef.current = null;
    removeSurfaceFromOrder("terminal");
  };

  const toggleMaximizeTerminal = () => {
    if (isCompactLayout || !isTerminalOpen) {
      return;
    }

    setIsTerminalMinimized(false);
    bringAnySurfaceToFront("terminal");
    setIsTerminalMaximized((current) => !current);
  };

  const runTerminalCommand = (rawCommand: string) => {
    executeTerminalCommand(rawCommand, {
      appendTerminalLines,
      clearTerminalLines: () => setTerminalLines([]),
      setTerminalColorPresetIndex,
      openTerminal,
      openFolder,
      openVim,
      closeTerminal,
    });
  };

  const handleTerminalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const command = terminalInput.trim();
    if (!command) {
      return;
    }

    setTerminalHistory((current) => [...current, command]);
    setTerminalHistoryIndex(-1);
    setTerminalInput("");
    runTerminalCommand(command);
  };

  const handleTerminalInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setTerminalLines([]);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (terminalHistory.length === 0) {
        return;
      }

      const nextIndex =
        terminalHistoryIndex === -1
          ? terminalHistory.length - 1
          : Math.max(0, terminalHistoryIndex - 1);

      setTerminalHistoryIndex(nextIndex);
      setTerminalInput(terminalHistory[nextIndex] ?? "");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (terminalHistory.length === 0 || terminalHistoryIndex === -1) {
        return;
      }

      if (terminalHistoryIndex >= terminalHistory.length - 1) {
        setTerminalHistoryIndex(-1);
        setTerminalInput("");
        return;
      }

      const nextIndex = terminalHistoryIndex + 1;
      setTerminalHistoryIndex(nextIndex);
      setTerminalInput(terminalHistory[nextIndex] ?? "");
    }
  };

  const handleTerminalDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !isTerminalOpen ||
      isTerminalMinimized ||
      isTerminalMaximized ||
      isCompactLayout ||
      isTerminalResizing ||
      event.button !== 0
    ) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    bringAnySurfaceToFront("terminal");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setTerminalPosition({ x: leftInStage, y: topInStage });

    terminalDragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - windowRect.left,
      offsetY: event.clientY - windowRect.top,
    };

    setIsTerminalDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTerminalDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = terminalDragStateRef.current;
    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (
      !dragState ||
      dragState.pointerId !== event.pointerId ||
      !stageElement ||
      !(windowElement instanceof HTMLElement)
    ) {
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const minX = SIDE_DOCK_CLEARANCE;
    const minY = TOP_PANEL_CLEARANCE;
    const maxX = Math.max(minX, stageRect.width - windowElement.offsetWidth);
    const maxY = Math.max(minY, stageRect.height - windowElement.offsetHeight - DOCK_CLEARANCE);

    const x = clamp(event.clientX - stageRect.left - dragState.offsetX, minX, maxX);
    const y = clamp(event.clientY - stageRect.top - dragState.offsetY, minY, maxY);

    setTerminalPosition({ x, y });
  };

  const handleTerminalDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = terminalDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    terminalDragStateRef.current = null;
    setIsTerminalDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleTerminalResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      !isTerminalOpen ||
      isTerminalMinimized ||
      isTerminalMaximized ||
      isCompactLayout ||
      event.button !== 0
    ) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    event.stopPropagation();
    bringAnySurfaceToFront("terminal");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setTerminalPosition({ x: leftInStage, y: topInStage });

    terminalResizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowElement.offsetWidth,
      startHeight: windowElement.offsetHeight,
      leftInStage,
      topInStage,
    };

    setIsTerminalResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTerminalResizeMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = terminalResizeStateRef.current;
    const stageElement = stageRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId || !stageElement) {
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;

    const maxWidth = Math.max(TERMINAL_MIN_WIDTH, stageRect.width - resizeState.leftInStage - 8);
    const maxHeight = Math.max(
      TERMINAL_MIN_HEIGHT,
      stageRect.height - resizeState.topInStage - DOCK_CLEARANCE,
    );

    const width = clamp(resizeState.startWidth + deltaX, TERMINAL_MIN_WIDTH, maxWidth);
    const height = clamp(resizeState.startHeight + deltaY, TERMINAL_MIN_HEIGHT, maxHeight);

    setTerminalSize({ width, height });
  };

  const handleTerminalResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = terminalResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    terminalResizeStateRef.current = null;
    setIsTerminalResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const isTerminalVisible = isTerminalOpen && !isTerminalMinimized;
  const activeTerminalPreset =
    TERMINAL_COLOR_PRESETS[terminalColorPresetIndex] ?? TERMINAL_COLOR_PRESETS[0];

  const terminalStyle: CSSProperties = {
    zIndex: getSurfaceZIndex("terminal"),
  };

  const terminalStyleWithVars = terminalStyle as CSSProperties & Record<string, string | number>;
  terminalStyleWithVars["--terminal-accent"] = activeTerminalPreset.accent;
  terminalStyleWithVars["--terminal-prompt"] = activeTerminalPreset.prompt;
  terminalStyleWithVars["--terminal-text"] = activeTerminalPreset.text;
  terminalStyleWithVars["--terminal-system"] = activeTerminalPreset.system;
  terminalStyleWithVars["--terminal-error"] = activeTerminalPreset.error;
  terminalStyleWithVars["--terminal-glow"] = activeTerminalPreset.glow;
  terminalStyleWithVars["--terminal-neofetch-glow"] = activeTerminalPreset.neofetchGlow;

  if (!isCompactLayout && !isTerminalMaximized) {
    terminalStyle.left = `${terminalPosition.x}px`;
    terminalStyle.top = `${terminalPosition.y}px`;
    terminalStyle.right = "auto";
    terminalStyle.bottom = "auto";
    terminalStyle.width = `${terminalSize.width}px`;
    terminalStyle.height = `${terminalSize.height}px`;
  }

  return {
    terminalScrollRef,
    terminalInputRef,
    isTerminalOpen,
    isTerminalMinimized,
    isTerminalMaximized,
    isTerminalDragging,
    isTerminalResizing,
    terminalStyle,
    terminalInput,
    terminalLines,
    terminalColorPresetIndex,
    isTerminalVisible,
    openTerminal,
    closeTerminal,
    minimizeTerminal,
    toggleMaximizeTerminal,
    setTerminalInput,
    setTerminalColorPresetIndex,
    handleTerminalSubmit,
    handleTerminalInputKeyDown,
    handleTerminalDragStart,
    handleTerminalDragMove,
    handleTerminalDragEnd,
    handleTerminalResizeStart,
    handleTerminalResizeMove,
    handleTerminalResizeEnd,
  };
}
