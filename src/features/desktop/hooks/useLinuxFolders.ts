import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import {
  DEFAULT_FOLDER_HEIGHT,
  DEFAULT_FOLDER_WIDTH,
  DOCK_CLEARANCE,
  FILE_MANAGER_PLACE_ORDER,
  FOLDERS,
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  SIDE_DOCK_CLEARANCE,
  TOP_PANEL_CLEARANCE,
} from "../constants";
import { clamp } from "../helpers";
import type {
  LinuxSurfaceId,
  DragState,
  FileManagerPlace,
  FileManagerView,
  FolderId,
  ResizeState,
  LinuxSurfacePosition,
  LinuxSurfaceSize,
} from "../types";

type UseLinuxFoldersParams = {
  stageRef: RefObject<HTMLElement | null>;
  isCompactLayout: boolean;
  bringAnySurfaceToFront: (surfaceId: LinuxSurfaceId) => void;
  removeSurfaceFromOrder: (surfaceId: LinuxSurfaceId) => void;
};

export function useLinuxFolders({
  stageRef,
  isCompactLayout,
  bringAnySurfaceToFront,
  removeSurfaceFromOrder,
}: UseLinuxFoldersParams) {
  const [activeFolderId, setActiveFolderId] = useState<FolderId>(FOLDERS[0].id);

  const [openFolderIds, setOpenFolderIds] = useState<FolderId[]>([]);
  const [minimizedFolderIds, setMinimizedFolderIds] = useState<FolderId[]>([]);
  const [maximizedFolderIds, setMaximizedFolderIds] = useState<FolderId[]>([]);
  const [surfacePositions, setSurfacePositions] = useState<Partial<Record<FolderId, LinuxSurfacePosition>>>({});
  const [surfaceSizes, setSurfaceSizes] = useState<Partial<Record<FolderId, LinuxSurfaceSize>>>({});
  const [selectedFileByFolder, setSelectedFileByFolder] = useState<Partial<Record<FolderId, string>>>({});
  const [activePlaceByFolder, setActivePlaceByFolder] = useState<
    Partial<Record<FolderId, FileManagerPlace>>
  >({});
  const [searchByFolder, setSearchByFolder] = useState<Partial<Record<FolderId, string>>>({});
  const [viewModeByFolder, setViewModeByFolder] = useState<Partial<Record<FolderId, FileManagerView>>>({});
  const [draggingFolderId, setDraggingFolderId] = useState<FolderId | null>(null);
  const [resizingFolderId, setResizingFolderId] = useState<FolderId | null>(null);

  const folderDragStateRef = useRef<Record<FolderId, DragState | null>>({
    dumps: null,
    wishlist: null,
    content: null,
    favorites: null,
  });
  const folderResizeStateRef = useRef<Record<FolderId, ResizeState | null>>({
    dumps: null,
    wishlist: null,
    content: null,
    favorites: null,
  });

  const openFolder = (folderId: FolderId) => {
    const isAlreadyOpen = openFolderIds.includes(folderId);

    setActiveFolderId(folderId);
    setMinimizedFolderIds((current) => current.filter((id) => id !== folderId));
    setOpenFolderIds((current) => (current.includes(folderId) ? current : [...current, folderId]));

    if (!isCompactLayout && !isAlreadyOpen) {
      const stageRect = stageRef.current?.getBoundingClientRect();

      if (stageRect) {
        const maxWidth = Math.max(MIN_WINDOW_WIDTH, stageRect.width - SIDE_DOCK_CLEARANCE - 12);
        const maxHeight = Math.max(
          MIN_WINDOW_HEIGHT,
          stageRect.height - TOP_PANEL_CLEARANCE - DOCK_CLEARANCE - 12,
        );

        const width = clamp(DEFAULT_FOLDER_WIDTH, MIN_WINDOW_WIDTH, maxWidth);
        const height = clamp(DEFAULT_FOLDER_HEIGHT, MIN_WINDOW_HEIGHT, maxHeight);

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

        setSurfaceSizes((current) => ({
          ...current,
          [folderId]: { width, height },
        }));

        setSurfacePositions((current) => ({
          ...current,
          [folderId]: { x, y },
        }));
      }
    }

    setSelectedFileByFolder((current) => {
      if (current[folderId]) {
        return current;
      }

      const folder = FOLDERS.find((item) => item.id === folderId);
      const firstFile = folder?.files[0];

      if (!firstFile) {
        return current;
      }

      return {
        ...current,
        [folderId]: firstFile,
      };
    });

    bringAnySurfaceToFront(folderId);
  };

  const bringSurfaceToFront = (folderId: FolderId) => {
    setActiveFolderId(folderId);
    bringAnySurfaceToFront(folderId);
  };

  const closeFolder = (folderId: FolderId) => {
    setOpenFolderIds((current) => current.filter((id) => id !== folderId));
    setMinimizedFolderIds((current) => current.filter((id) => id !== folderId));
    setMaximizedFolderIds((current) => current.filter((id) => id !== folderId));
    setDraggingFolderId((current) => (current === folderId ? null : current));
    setResizingFolderId((current) => (current === folderId ? null : current));

    if (folderDragStateRef.current[folderId]) {
      folderDragStateRef.current[folderId] = null;
    }

    if (folderResizeStateRef.current[folderId]) {
      folderResizeStateRef.current[folderId] = null;
    }

    removeSurfaceFromOrder(folderId);
    setActiveFolderId((current) => (current === folderId ? FOLDERS[0].id : current));
  };

  const minimizeFolder = (folderId: FolderId) => {
    setMinimizedFolderIds((current) => {
      if (current.includes(folderId)) {
        return current;
      }
      return [...current, folderId];
    });
    setMaximizedFolderIds((current) => current.filter((id) => id !== folderId));
    setDraggingFolderId((current) => (current === folderId ? null : current));
    setResizingFolderId((current) => (current === folderId ? null : current));
    removeSurfaceFromOrder(folderId);
  };

  const toggleMaximizeFolder = (folderId: FolderId) => {
    if (isCompactLayout) {
      return;
    }

    bringSurfaceToFront(folderId);
    setMinimizedFolderIds((current) => current.filter((id) => id !== folderId));
    setMaximizedFolderIds((current) => {
      if (current.includes(folderId)) {
        return current.filter((id) => id !== folderId);
      }
      return [...current, folderId];
    });
  };

  const setFolderPlace = (folderId: FolderId, place: FileManagerPlace) => {
    setActivePlaceByFolder((current) => ({
      ...current,
      [folderId]: place,
    }));
  };

  const cycleFolderPlace = (folderId: FolderId, direction: -1 | 1) => {
    setActivePlaceByFolder((current) => {
      const activePlace = current[folderId] ?? "home";
      const currentIndex = FILE_MANAGER_PLACE_ORDER.indexOf(activePlace);
      const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = clamp(safeCurrentIndex + direction, 0, FILE_MANAGER_PLACE_ORDER.length - 1);

      return {
        ...current,
        [folderId]: FILE_MANAGER_PLACE_ORDER[nextIndex],
      };
    });
  };

  const clearFolderSearch = (folderId: FolderId) => {
    setSearchByFolder((current) => ({
      ...current,
      [folderId]: "",
    }));
  };

  const setFolderViewMode = (folderId: FolderId, viewMode: FileManagerView) => {
    setViewModeByFolder((current) => ({
      ...current,
      [folderId]: viewMode,
    }));
  };

  const setFolderSearch = (folderId: FolderId, searchText: string) => {
    setSearchByFolder((current) => ({
      ...current,
      [folderId]: searchText,
    }));
  };

  const setSelectedFolderFile = (folderId: FolderId, fileName: string) => {
    setSelectedFileByFolder((current) => ({
      ...current,
      [folderId]: fileName,
    }));
  };

  const handleFolderDragStart = (event: ReactPointerEvent<HTMLElement>, folderId: FolderId) => {
    if (
      isCompactLayout ||
      maximizedFolderIds.includes(folderId) ||
      resizingFolderId === folderId ||
      event.button !== 0
    ) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    bringSurfaceToFront(folderId);

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setSurfacePositions((current) => ({
      ...current,
      [folderId]: { x: leftInStage, y: topInStage },
    }));

    folderDragStateRef.current[folderId] = {
      pointerId: event.pointerId,
      offsetX: event.clientX - windowRect.left,
      offsetY: event.clientY - windowRect.top,
    };

    setDraggingFolderId(folderId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFolderDragMove = (event: ReactPointerEvent<HTMLElement>, folderId: FolderId) => {
    const dragState = folderDragStateRef.current[folderId];
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

    setSurfacePositions((current) => ({
      ...current,
      [folderId]: { x, y },
    }));
  };

  const handleFolderDragEnd = (event: ReactPointerEvent<HTMLElement>, folderId: FolderId) => {
    const dragState = folderDragStateRef.current[folderId];

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    folderDragStateRef.current[folderId] = null;
    setDraggingFolderId((current) => (current === folderId ? null : current));

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleFolderResizeStart = (event: ReactPointerEvent<HTMLButtonElement>, folderId: FolderId) => {
    if (isCompactLayout || maximizedFolderIds.includes(folderId) || event.button !== 0) {
      return;
    }

    const stageElement = stageRef.current;
    const windowElement = event.currentTarget.parentElement;

    if (!stageElement || !(windowElement instanceof HTMLElement)) {
      return;
    }

    event.stopPropagation();
    bringSurfaceToFront(folderId);

    const stageRect = stageElement.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const leftInStage = windowRect.left - stageRect.left;
    const topInStage = windowRect.top - stageRect.top;

    setSurfacePositions((current) => ({
      ...current,
      [folderId]: { x: leftInStage, y: topInStage },
    }));

    folderResizeStateRef.current[folderId] = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowElement.offsetWidth,
      startHeight: windowElement.offsetHeight,
      leftInStage,
      topInStage,
    };

    setResizingFolderId(folderId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFolderResizeMove = (event: ReactPointerEvent<HTMLButtonElement>, folderId: FolderId) => {
    const resizeState = folderResizeStateRef.current[folderId];
    const stageElement = stageRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId || !stageElement) {
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const deltaX = event.clientX - resizeState.startX;
    const deltaY = event.clientY - resizeState.startY;

    const maxWidth = Math.max(MIN_WINDOW_WIDTH, stageRect.width - resizeState.leftInStage - 8);
    const maxHeight = Math.max(MIN_WINDOW_HEIGHT, stageRect.height - resizeState.topInStage - 12);

    const width = clamp(resizeState.startWidth + deltaX, MIN_WINDOW_WIDTH, maxWidth);
    const height = clamp(resizeState.startHeight + deltaY, MIN_WINDOW_HEIGHT, maxHeight);

    setSurfaceSizes((current) => ({
      ...current,
      [folderId]: { width, height },
    }));
  };

  const handleFolderResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>, folderId: FolderId) => {
    const resizeState = folderResizeStateRef.current[folderId];

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    folderResizeStateRef.current[folderId] = null;
    setResizingFolderId((current) => (current === folderId ? null : current));

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const visibleSurfaceIds = useMemo(
    () => openFolderIds.filter((folderId) => !minimizedFolderIds.includes(folderId)),
    [openFolderIds, minimizedFolderIds],
  );

  return {
    activeFolderId,
    openFolderIds,
    minimizedFolderIds,
    maximizedFolderIds,
    surfacePositions,
    surfaceSizes,
    selectedFileByFolder,
    activePlaceByFolder,
    searchByFolder,
    viewModeByFolder,
    draggingFolderId,
    resizingFolderId,
    visibleSurfaceIds,
    openFolder,
    bringSurfaceToFront,
    closeFolder,
    minimizeFolder,
    toggleMaximizeFolder,
    setFolderPlace,
    cycleFolderPlace,
    clearFolderSearch,
    setFolderViewMode,
    setFolderSearch,
    setSelectedFolderFile,
    handleFolderDragStart,
    handleFolderDragMove,
    handleFolderDragEnd,
    handleFolderResizeStart,
    handleFolderResizeMove,
    handleFolderResizeEnd,
  };
}
