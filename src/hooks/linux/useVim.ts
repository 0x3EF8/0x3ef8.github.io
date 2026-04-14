import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  SyntheticEvent,
} from "react";
import {
  DEFAULT_VIM_HEIGHT,
  DEFAULT_VIM_WIDTH,
  DOCK_CLEARANCE,
  SIDE_DOCK_CLEARANCE,
  TOP_PANEL_CLEARANCE,
  VIM_INITIAL_CONTENT,
  VIM_MIN_HEIGHT,
  VIM_MIN_WIDTH,
} from "../../constants";
import { clamp, safelyReleasePointerCapture, safelySetPointerCapture } from "../../helpers";
import type {
  LinuxSurfaceId,
  DragState,
  ResizeState,
  LinuxSurfacePosition,
  LinuxSurfaceSize,
} from "../../types";

type VimMode = "NORMAL" | "INSERT" | "COMMAND";

type UseVimParams = {
  stageRef: RefObject<HTMLElement | null>;
  isCompactLayout: boolean;
  getSurfaceZIndex: (surfaceId: LinuxSurfaceId) => number;
  bringAnySurfaceToFront: (surfaceId: LinuxSurfaceId) => void;
  removeSurfaceFromOrder: (surfaceId: LinuxSurfaceId) => void;
};

const VIM_FILE_NAME = "notes.md";
const COMPACT_VIM_MIN_WIDTH = 290;
const COMPACT_VIM_MIN_HEIGHT = 220;

export function useVim({
  stageRef,
  isCompactLayout,
  getSurfaceZIndex,
  bringAnySurfaceToFront,
  removeSurfaceFromOrder,
}: UseVimParams) {
  const vimEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const vimCommandInputRef = useRef<HTMLInputElement | null>(null);
  const vimLineNumbersRef = useRef<HTMLOListElement | null>(null);
  const vimDragStateRef = useRef<DragState | null>(null);
  const vimResizeStateRef = useRef<ResizeState | null>(null);
  const vimPreferredColumnRef = useRef<number | null>(null);
  const vimOpenFileRequestRef = useRef(0);

  const [isVimOpen, setIsVimOpen] = useState(false);
  const [isVimMinimized, setIsVimMinimized] = useState(false);
  const [isVimMaximized, setIsVimMaximized] = useState(false);
  const [isVimDragging, setIsVimDragging] = useState(false);
  const [isVimResizing, setIsVimResizing] = useState(false);
  const [vimPosition, setVimPosition] = useState<LinuxSurfacePosition>({ x: 236, y: 108 });
  const [vimSize, setVimSize] = useState<LinuxSurfaceSize>({
    width: DEFAULT_VIM_WIDTH,
    height: DEFAULT_VIM_HEIGHT,
  });
  const [vimMode, setVimMode] = useState<VimMode>("NORMAL");
  const [vimFileName, setVimFileName] = useState(VIM_FILE_NAME);
  const [vimBuffer, setVimBuffer] = useState(VIM_INITIAL_CONTENT);
  const [vimSavedBuffer, setVimSavedBuffer] = useState(VIM_INITIAL_CONTENT);
  const [vimCommandInput, setVimCommandInput] = useState("");
  const [vimStatusMessage, setVimStatusMessage] = useState("-- NORMAL --");
  const [vimShowLineNumbers, setVimShowLineNumbers] = useState(true);
  const [vimRelativeLineNumbers, setVimRelativeLineNumbers] = useState(false);
  const [vimCursorLine, setVimCursorLine] = useState(1);
  const [vimCursorColumn, setVimCursorColumn] = useState(1);
  const [vimCommandHistory, setVimCommandHistory] = useState<string[]>([]);
  const [vimCommandHistoryIndex, setVimCommandHistoryIndex] = useState(-1);

  const vimIsDirty = vimBuffer !== vimSavedBuffer;
  const vimLineCount = useMemo(() => Math.max(1, vimBuffer.split("\n").length), [vimBuffer]);

  const syncCursorPosition = (selectionStart: number) => {
    const textBeforeCursor = vimBuffer.slice(0, selectionStart);
    const line = textBeforeCursor.split("\n").length;
    const lastLineBreak = textBeforeCursor.lastIndexOf("\n");
    const column = selectionStart - (lastLineBreak + 1) + 1;

    setVimCursorLine(line);
    setVimCursorColumn(column);
  };

  const getCursorLineContext = (selectionStart: number) => {
    const lineStarts = [0];

    for (let index = 0; index < vimBuffer.length; index += 1) {
      if (vimBuffer[index] === "\n") {
        lineStarts.push(index + 1);
      }
    }

    let lineIndex = 0;
    while (lineIndex + 1 < lineStarts.length && lineStarts[lineIndex + 1] <= selectionStart) {
      lineIndex += 1;
    }

    const lineStart = lineStarts[lineIndex] ?? 0;
    const nextLineStart = lineStarts[lineIndex + 1] ?? vimBuffer.length + 1;
    const lineEnd = Math.max(lineStart, nextLineStart - 1);
    const column = selectionStart - lineStart;

    return {
      lineStarts,
      lineIndex,
      lineStart,
      lineEnd,
      column,
    };
  };

  const setEditorCursor = (nextIndex: number) => {
    const editor = vimEditorRef.current;
    if (!editor) {
      return;
    }

    const safeIndex = clamp(nextIndex, 0, vimBuffer.length);
    editor.setSelectionRange(safeIndex, safeIndex);
    syncCursorPosition(safeIndex);
  };

  const saveVimBuffer = () => {
    setVimSavedBuffer(vimBuffer);
    setVimStatusMessage(`\"${vimFileName}\" ${vimLineCount}L, ${vimBuffer.length}C written`);
  };

  const focusVimBufferStart = () => {
    window.requestAnimationFrame(() => {
      const editor = vimEditorRef.current;
      if (!editor) {
        return;
      }

      editor.focus();
      editor.setSelectionRange(0, 0);
      syncCursorPosition(0);

      if (vimLineNumbersRef.current) {
        vimLineNumbersRef.current.scrollTop = 0;
      }
    });
  };

  useEffect(() => {
    if (!isVimOpen || isVimMinimized) {
      return;
    }

    if (vimMode === "COMMAND") {
      vimCommandInputRef.current?.focus();
      return;
    }

    vimEditorRef.current?.focus();
  }, [isVimOpen, isVimMinimized, vimMode, isVimMaximized]);

  const openVim = () => {
    setIsVimOpen(true);
    setIsVimMinimized(false);
    setVimMode("NORMAL");
    setVimStatusMessage("-- NORMAL --");
    setVimCommandInput("");
    setVimCommandHistoryIndex(-1);
    vimPreferredColumnRef.current = null;

    const stageRect = stageRef.current?.getBoundingClientRect();

    if (stageRect) {
      const minWidth = isCompactLayout ? COMPACT_VIM_MIN_WIDTH : VIM_MIN_WIDTH;
      const minHeight = isCompactLayout ? COMPACT_VIM_MIN_HEIGHT : VIM_MIN_HEIGHT;

      const maxWidth = Math.max(minWidth, stageRect.width - SIDE_DOCK_CLEARANCE - 8);
      const maxHeight = Math.max(
        minHeight,
        stageRect.height - TOP_PANEL_CLEARANCE - DOCK_CLEARANCE - 10,
      );

      const width = clamp(DEFAULT_VIM_WIDTH, minWidth, maxWidth);
      const height = clamp(DEFAULT_VIM_HEIGHT, minHeight, maxHeight);

      const x = clamp(
        (stageRect.width - width) / 2,
        SIDE_DOCK_CLEARANCE,
        Math.max(SIDE_DOCK_CLEARANCE, stageRect.width - width - 8),
      );

      const y = clamp(
        (stageRect.height - height) / 2,
        TOP_PANEL_CLEARANCE,
        Math.max(TOP_PANEL_CLEARANCE, stageRect.height - height - DOCK_CLEARANCE),
      );

      setVimSize({ width, height });
      setVimPosition({ x, y });
    }

    bringAnySurfaceToFront("vim");
  };

  const openVimFile = (fileName: string, filePath: string) => {
    const safeFileName = fileName.trim() || VIM_FILE_NAME;
    const requestId = ++vimOpenFileRequestRef.current;

    openVim();
    setVimFileName(safeFileName);
    setVimCommandInput("");
    setVimCommandHistoryIndex(-1);
    setVimStatusMessage(`Opening ${safeFileName}...`);

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load file");
        }

        return response.text();
      })
      .then((content) => {
        if (vimOpenFileRequestRef.current !== requestId) {
          return;
        }

        setVimBuffer(content);
        setVimSavedBuffer(content);
        setVimMode("NORMAL");
        setVimStatusMessage(`\"${safeFileName}\" loaded`);
        vimPreferredColumnRef.current = null;
        focusVimBufferStart();
      })
      .catch(() => {
        if (vimOpenFileRequestRef.current !== requestId) {
          return;
        }

        setVimBuffer("");
        setVimSavedBuffer("");
        setVimMode("NORMAL");
        setVimStatusMessage(`Unable to load \"${safeFileName}\". Opened empty buffer.`);
        vimPreferredColumnRef.current = null;
        focusVimBufferStart();
      });
  };

  const closeVim = () => {
    setIsVimOpen(false);
    setIsVimMinimized(false);
    setIsVimMaximized(false);
    setIsVimDragging(false);
    setIsVimResizing(false);
    setVimMode("NORMAL");
    setVimCommandInput("");
    setVimCommandHistoryIndex(-1);
    vimPreferredColumnRef.current = null;
    vimDragStateRef.current = null;
    vimResizeStateRef.current = null;
    removeSurfaceFromOrder("vim");
  };

  const minimizeVim = () => {
    if (!isVimOpen) {
      return;
    }

    setIsVimMinimized(true);
    setIsVimMaximized(false);
    setIsVimDragging(false);
    setIsVimResizing(false);
    setVimMode("NORMAL");
    setVimCommandInput("");
    setVimCommandHistoryIndex(-1);
    vimPreferredColumnRef.current = null;
    vimDragStateRef.current = null;
    vimResizeStateRef.current = null;
    removeSurfaceFromOrder("vim");
  };

  const toggleMaximizeVim = () => {
    if (!isVimOpen) {
      return;
    }

    setIsVimMinimized(false);
    bringAnySurfaceToFront("vim");
    setIsVimMaximized((current) => !current);
  };

  const runVimCommand = (commandRaw: string) => {
    const command = commandRaw.trim().replace(/^:/, "").toLowerCase();

    if (!command) {
      setVimMode("NORMAL");
      setVimStatusMessage("-- NORMAL --");
      return;
    }

    if (command === "w" || command === "w!") {
      saveVimBuffer();
      setVimMode("NORMAL");
      return;
    }

    if (command === "q") {
      if (vimIsDirty) {
        setVimStatusMessage("No write since last change (add ! to override)");
        setVimMode("NORMAL");
        return;
      }

      closeVim();
      return;
    }

    if (command === "q!") {
      closeVim();
      return;
    }

    if (command === "wq" || command === "x") {
      saveVimBuffer();
      closeVim();
      return;
    }

    if (["set nu", "set number"].includes(command)) {
      setVimShowLineNumbers(true);
      setVimRelativeLineNumbers(false);
      setVimStatusMessage("Line numbers enabled");
      setVimMode("NORMAL");
      return;
    }

    if (["set nonu", "set nonumber"].includes(command)) {
      setVimShowLineNumbers(false);
      setVimRelativeLineNumbers(false);
      setVimStatusMessage("Line numbers disabled");
      setVimMode("NORMAL");
      return;
    }

    if (["set rnu", "set relativenumber"].includes(command)) {
      setVimShowLineNumbers(true);
      setVimRelativeLineNumbers(true);
      setVimStatusMessage("Relative numbers enabled");
      setVimMode("NORMAL");
      return;
    }

    if (["set nornu", "set norelativenumber"].includes(command)) {
      setVimRelativeLineNumbers(false);
      setVimStatusMessage("Relative numbers disabled");
      setVimMode("NORMAL");
      return;
    }

    if (command === "help") {
      setVimStatusMessage(
        "Commands: :w, :q, :q!, :wq, :set number, :set nonumber, :set relativenumber, :set norelativenumber",
      );
      setVimMode("NORMAL");
      return;
    }

    setVimStatusMessage(`Not an editor command: ${commandRaw}`);
    setVimMode("NORMAL");
  };

  const handleVimCommandSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedCommand = vimCommandInput.trim();
    const normalizedHistoryCommand = submittedCommand.replace(/^:/, "").trim();

    if (normalizedHistoryCommand) {
      setVimCommandHistory((current) => [...current, submittedCommand]);
      setVimCommandHistoryIndex(-1);
    }

    runVimCommand(vimCommandInput);
    setVimCommandInput("");
  };

  const handleVimCommandInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      if (vimCommandHistory.length === 0) {
        return;
      }

      event.preventDefault();

      const nextIndex =
        vimCommandHistoryIndex === -1
          ? vimCommandHistory.length - 1
          : Math.max(0, vimCommandHistoryIndex - 1);

      setVimCommandHistoryIndex(nextIndex);
      setVimCommandInput(vimCommandHistory[nextIndex] ?? ":");
      return;
    }

    if (event.key === "ArrowDown") {
      if (vimCommandHistory.length === 0 || vimCommandHistoryIndex === -1) {
        return;
      }

      event.preventDefault();

      if (vimCommandHistoryIndex >= vimCommandHistory.length - 1) {
        setVimCommandHistoryIndex(-1);
        setVimCommandInput(":");
        return;
      }

      const nextIndex = vimCommandHistoryIndex + 1;
      setVimCommandHistoryIndex(nextIndex);
      setVimCommandInput(vimCommandHistory[nextIndex] ?? ":");
      return;
    }

    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    setVimCommandInput("");
    setVimCommandHistoryIndex(-1);
    setVimMode("NORMAL");
    setVimStatusMessage("-- NORMAL --");
  };

  const handleVimEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setVimBuffer(event.target.value);
    syncCursorPosition(event.target.selectionStart);
  };

  const handleVimEditorSelect = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    syncCursorPosition(event.currentTarget.selectionStart);
  };

  const handleVimEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isMetaSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";

    if (isMetaSave) {
      event.preventDefault();
      saveVimBuffer();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setVimMode("NORMAL");
      setVimStatusMessage("-- NORMAL --");
      setVimCommandInput("");
      setVimCommandHistoryIndex(-1);
      vimPreferredColumnRef.current = null;
      return;
    }

    if (vimMode === "INSERT") {
      return;
    }

    if (event.key.toLowerCase() === "i" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setVimMode("INSERT");
      setVimStatusMessage("-- INSERT --");
      return;
    }

    if (event.key === ":" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setVimMode("COMMAND");
      setVimCommandInput(":");
      setVimCommandHistoryIndex(-1);
      setVimStatusMessage(":");
      return;
    }

    const editor = vimEditorRef.current;
    if (!editor) {
      return;
    }

    const selectionStart = editor.selectionStart;
    const { lineStarts, lineIndex, lineStart, lineEnd, column } = getCursorLineContext(selectionStart);

    if (event.key === "h") {
      event.preventDefault();
      vimPreferredColumnRef.current = null;
      setEditorCursor(selectionStart - 1);
      return;
    }

    if (event.key === "l") {
      event.preventDefault();
      vimPreferredColumnRef.current = null;
      setEditorCursor(selectionStart + 1);
      return;
    }

    if (event.key === "j" || event.key === "k") {
      event.preventDefault();

      const delta = event.key === "j" ? 1 : -1;
      const targetLineIndex = clamp(lineIndex + delta, 0, lineStarts.length - 1);
      const preferredColumn = vimPreferredColumnRef.current ?? column;
      const targetLineStart = lineStarts[targetLineIndex] ?? 0;
      const targetNextLineStart = lineStarts[targetLineIndex + 1] ?? vimBuffer.length + 1;
      const targetLineEnd = Math.max(targetLineStart, targetNextLineStart - 1);
      const targetIndex = Math.min(targetLineStart + preferredColumn, targetLineEnd);

      vimPreferredColumnRef.current = preferredColumn;
      setEditorCursor(targetIndex);
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      vimPreferredColumnRef.current = null;
      setEditorCursor(lineStart);
      return;
    }

    if (event.key === "$") {
      event.preventDefault();
      vimPreferredColumnRef.current = null;
      setEditorCursor(lineEnd);
      return;
    }

    const allowedNavigationKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown",
      "Tab",
    ];

    if (allowedNavigationKeys.includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    event.preventDefault();
  };

  const handleVimEditorScroll = () => {
    if (!vimEditorRef.current || !vimLineNumbersRef.current) {
      return;
    }

    vimLineNumbersRef.current.scrollTop = vimEditorRef.current.scrollTop;
  };

  const handleVimDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !isVimOpen ||
      isVimMinimized ||
      isVimMaximized ||
      isVimResizing ||
      event.button !== 0
    ) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    bringAnySurfaceToFront("vim");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setVimPosition({ x: leftInStage, y: topInStage });

    vimDragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - windowRect.left,
      offsetY: event.clientY - windowRect.top,
    };

    setIsVimDragging(true);
    safelySetPointerCapture(event.currentTarget, event.pointerId);
  };

  const handleVimDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = vimDragStateRef.current;
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

    setVimPosition({ x, y });
  };

  const handleVimDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = vimDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    vimDragStateRef.current = null;
    setIsVimDragging(false);

    safelyReleasePointerCapture(event.currentTarget, event.pointerId);
  };

  const handleVimResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      !isVimOpen ||
      isVimMinimized ||
      isVimMaximized ||
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
    bringAnySurfaceToFront("vim");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setVimPosition({ x: leftInStage, y: topInStage });

    vimResizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowElement.offsetWidth,
      startHeight: windowElement.offsetHeight,
      leftInStage,
      topInStage,
    };

    setIsVimResizing(true);
    safelySetPointerCapture(event.currentTarget, event.pointerId);
  };

  const handleVimResizeMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = vimResizeStateRef.current;
    const stageElement = stageRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId || !stageElement) {
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;

    const maxWidth = Math.max(VIM_MIN_WIDTH, stageRect.width - resizeState.leftInStage - 8);
    const maxHeight = Math.max(VIM_MIN_HEIGHT, stageRect.height - resizeState.topInStage - DOCK_CLEARANCE);

    const width = clamp(resizeState.startWidth + deltaX, VIM_MIN_WIDTH, maxWidth);
    const height = clamp(resizeState.startHeight + deltaY, VIM_MIN_HEIGHT, maxHeight);

    setVimSize({ width, height });
  };

  const handleVimResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = vimResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    vimResizeStateRef.current = null;
    setIsVimResizing(false);

    safelyReleasePointerCapture(event.currentTarget, event.pointerId);
  };

  const isVimVisible = isVimOpen && !isVimMinimized;

  const vimStyle: CSSProperties = {
    zIndex: getSurfaceZIndex("vim"),
  };

  if (!isVimMaximized) {
    vimStyle.left = `${vimPosition.x}px`;
    vimStyle.top = `${vimPosition.y}px`;
    vimStyle.right = "auto";
    vimStyle.bottom = "auto";
    vimStyle.width = `${vimSize.width}px`;
    vimStyle.height = `${vimSize.height}px`;
  }

  return {
    vimEditorRef,
    vimCommandInputRef,
    vimLineNumbersRef,
    isVimOpen,
    isVimMinimized,
    isVimMaximized,
    isVimDragging,
    isVimResizing,
    isVimVisible,
    vimStyle,
    vimMode,
    vimFileName,
    vimBuffer,
    vimIsDirty,
    vimCommandInput,
    vimStatusMessage,
    vimShowLineNumbers,
    vimRelativeLineNumbers,
    vimLineCount,
    vimCursorLine,
    vimCursorColumn,
    openVim,
    openVimFile,
    closeVim,
    minimizeVim,
    toggleMaximizeVim,
    setVimBuffer,
    setVimCommandInput,
    handleVimCommandSubmit,
    handleVimCommandInputKeyDown,
    handleVimEditorChange,
    handleVimEditorSelect,
    handleVimEditorKeyDown,
    handleVimEditorScroll,
    handleVimDragStart,
    handleVimDragMove,
    handleVimDragEnd,
    handleVimResizeStart,
    handleVimResizeMove,
    handleVimResizeEnd,
  };
}
