import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
import {
  DOCK_CLEARANCE,
  HTML_FILE_EXTENSIONS,
  IMAGE_FILE_EXTENSIONS,
  PORTFOLIO_FILE_PROFILES,
  SIDE_DOCK_CLEARANCE,
  TEXT_FILE_EXTENSIONS,
  TOP_PANEL_CLEARANCE,
  VIEWER_MIN_HEIGHT,
  VIEWER_MIN_WIDTH,
} from "../constants";
import { clamp, getFileExtension, getPathExtension } from "../helpers";
import type {
  LinuxSurfaceId,
  DragState,
  FileManagerRow,
  OpenedPortfolioFile,
  ResizeState,
  ViewerContentStatus,
  LinuxSurfacePosition,
  LinuxSurfaceSize,
} from "../types";

const VIM_EDITABLE_EXTENSIONS = new Set([
  "txt",
  "md",
  "log",
  "json",
  ...HTML_FILE_EXTENSIONS,
  "csv",
  "tsv",
  "xml",
  "yaml",
  "yml",
  "ini",
  "conf",
  "toml",
  "js",
  "jsx",
  "ts",
  "tsx",
  "css",
  "scss",
  "less",
  "py",
  "sh",
  "bash",
  "zsh",
  "sql",
  "java",
  "go",
  "rs",
  "c",
  "cpp",
  "h",
  "hpp",
  "php",
  "rb",
  "swift",
  "kt",
]);

type UseLinuxViewerParams = {
  stageRef: RefObject<HTMLElement | null>;
  isCompactLayout: boolean;
  getSurfaceZIndex: (surfaceId: LinuxSurfaceId) => number;
  bringAnySurfaceToFront: (surfaceId: LinuxSurfaceId) => void;
  removeSurfaceFromOrder: (surfaceId: LinuxSurfaceId) => void;
  openVimFile: (fileName: string, filePath: string) => void;
};

export function useLinuxViewer({
  stageRef,
  isCompactLayout,
  getSurfaceZIndex,
  bringAnySurfaceToFront,
  removeSurfaceFromOrder,
  openVimFile,
}: UseLinuxViewerParams) {
  const viewerDragStateRef = useRef<DragState | null>(null);
  const viewerResizeStateRef = useRef<ResizeState | null>(null);

  const [openedFile, setOpenedFile] = useState<OpenedPortfolioFile | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerMinimized, setIsViewerMinimized] = useState(false);
  const [isViewerMaximized, setIsViewerMaximized] = useState(false);
  const [isViewerDragging, setIsViewerDragging] = useState(false);
  const [isViewerResizing, setIsViewerResizing] = useState(false);
  const [viewerPosition, setViewerPosition] = useState<LinuxSurfacePosition>({ x: 255, y: 110 });
  const [viewerSize, setViewerSize] = useState<LinuxSurfaceSize>({ width: 720, height: 460 });
  const [viewerTextContent, setViewerTextContent] = useState("");
  const [viewerContentStatus, setViewerContentStatus] = useState<ViewerContentStatus>("idle");
  const [viewerError, setViewerError] = useState("");

  useEffect(() => {
    if (!openedFile) {
      return;
    }

    const extension = getPathExtension(openedFile.path);
    const shouldLoadAsText = TEXT_FILE_EXTENSIONS.includes(extension);

    if (!shouldLoadAsText) {
      return;
    }

    let isCanceled = false;

    fetch(openedFile.path)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load file content");
        }

        return response.text();
      })
      .then((content) => {
        if (isCanceled) {
          return;
        }

        setViewerTextContent(content);
        setViewerContentStatus("ready");
      })
      .catch(() => {
        if (isCanceled) {
          return;
        }

        setViewerTextContent("");
        setViewerContentStatus("error");
        setViewerError("Unable to load this file in the viewer.");
      });

    return () => {
      isCanceled = true;
    };
  }, [openedFile]);

  const closeViewer = () => {
    setIsViewerOpen(false);
    setIsViewerMinimized(false);
    setIsViewerMaximized(false);
    setIsViewerDragging(false);
    setIsViewerResizing(false);
    viewerDragStateRef.current = null;
    viewerResizeStateRef.current = null;
    removeSurfaceFromOrder("viewer");
  };

  const minimizeViewer = () => {
    if (!isViewerOpen) {
      return;
    }

    setIsViewerMinimized(true);
    setIsViewerMaximized(false);
    setIsViewerDragging(false);
    setIsViewerResizing(false);
    viewerDragStateRef.current = null;
    viewerResizeStateRef.current = null;
    removeSurfaceFromOrder("viewer");
  };

  const restoreViewer = () => {
    if (!openedFile) {
      return;
    }

    setIsViewerOpen(true);
    setIsViewerMinimized(false);
    bringAnySurfaceToFront("viewer");
  };

  const toggleMaximizeViewer = () => {
    if (isCompactLayout || !isViewerOpen) {
      return;
    }

    setIsViewerMinimized(false);
    bringAnySurfaceToFront("viewer");
    setIsViewerMaximized((current) => !current);
  };

  const openPortfolioFile = (folderName: string, row: FileManagerRow) => {
    const profile = PORTFOLIO_FILE_PROFILES[row.name];
    const mappedPath = profile?.realFilePath ?? "/files/system/file-missing.txt";
    const mappedExtension = getPathExtension(mappedPath);
    const sourceExtension = getFileExtension(row.name);

    const shouldOpenInVim = sourceExtension
      ? VIM_EDITABLE_EXTENSIONS.has(sourceExtension)
      : VIM_EDITABLE_EXTENSIONS.has(mappedExtension);

    if (shouldOpenInVim) {
      openVimFile(row.name, mappedPath);
      return;
    }

    if (TEXT_FILE_EXTENSIONS.includes(mappedExtension)) {
      setViewerTextContent("");
      setViewerContentStatus("loading");
      setViewerError("");
    } else {
      setViewerTextContent("");
      setViewerContentStatus("idle");
      setViewerError("");
    }

    const opened: OpenedPortfolioFile = {
      folderName,
      name: row.name,
      kind: row.kind,
      title: profile?.title ?? row.name,
      summary: profile?.summary ?? "Portfolio file preview.",
      path: mappedPath,
    };

    setOpenedFile(opened);
    setIsViewerOpen(true);
    setIsViewerMinimized(false);
    bringAnySurfaceToFront("viewer");
  };

  const handleViewerDragStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      !isViewerOpen ||
      isViewerMinimized ||
      isViewerMaximized ||
      isCompactLayout ||
      isViewerResizing ||
      event.button !== 0
    ) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    bringAnySurfaceToFront("viewer");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setViewerPosition({ x: leftInStage, y: topInStage });

    viewerDragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - windowRect.left,
      offsetY: event.clientY - windowRect.top,
    };

    setIsViewerDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewerDragMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = viewerDragStateRef.current;
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

    setViewerPosition({ x, y });
  };

  const handleViewerDragEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const dragState = viewerDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    viewerDragStateRef.current = null;
    setIsViewerDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleViewerResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      !isViewerOpen ||
      isViewerMinimized ||
      isViewerMaximized ||
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
    bringAnySurfaceToFront("viewer");

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setViewerPosition({ x: leftInStage, y: topInStage });

    viewerResizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowElement.offsetWidth,
      startHeight: windowElement.offsetHeight,
      leftInStage,
      topInStage,
    };

    setIsViewerResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewerResizeMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = viewerResizeStateRef.current;
    const stageElement = stageRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId || !stageElement) {
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;

    const maxWidth = Math.max(VIEWER_MIN_WIDTH, stageRect.width - resizeState.leftInStage - 8);
    const maxHeight = Math.max(
      VIEWER_MIN_HEIGHT,
      stageRect.height - resizeState.topInStage - DOCK_CLEARANCE,
    );

    const width = clamp(resizeState.startWidth + deltaX, VIEWER_MIN_WIDTH, maxWidth);
    const height = clamp(resizeState.startHeight + deltaY, VIEWER_MIN_HEIGHT, maxHeight);

    setViewerSize({ width, height });
  };

  const handleViewerResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = viewerResizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    viewerResizeStateRef.current = null;
    setIsViewerResizing(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const isViewerVisible = isViewerOpen && !isViewerMinimized && Boolean(openedFile);
  const viewerExtension = openedFile ? getPathExtension(openedFile.path) : "";
  const viewerIsImage = IMAGE_FILE_EXTENSIONS.includes(viewerExtension);
  const viewerIsText = TEXT_FILE_EXTENSIONS.includes(viewerExtension);
  const viewerIsHtml = HTML_FILE_EXTENSIONS.includes(viewerExtension);

  const viewerStyle: CSSProperties = {
    zIndex: getSurfaceZIndex("viewer"),
  };

  if (!isCompactLayout && !isViewerMaximized) {
    viewerStyle.left = `${viewerPosition.x}px`;
    viewerStyle.top = `${viewerPosition.y}px`;
    viewerStyle.right = "auto";
    viewerStyle.bottom = "auto";
    viewerStyle.width = `${viewerSize.width}px`;
    viewerStyle.height = `${viewerSize.height}px`;
  }

  return {
    openedFile,
    isViewerOpen,
    isViewerMinimized,
    isViewerMaximized,
    isViewerDragging,
    isViewerResizing,
    viewerStyle,
    viewerTextContent,
    viewerContentStatus,
    viewerError,
    isViewerVisible,
    viewerIsImage,
    viewerIsText,
    viewerIsHtml,
    closeViewer,
    minimizeViewer,
    restoreViewer,
    toggleMaximizeViewer,
    openPortfolioFile,
    handleViewerDragStart,
    handleViewerDragMove,
    handleViewerDragEnd,
    handleViewerResizeStart,
    handleViewerResizeMove,
    handleViewerResizeEnd,
  };
}
