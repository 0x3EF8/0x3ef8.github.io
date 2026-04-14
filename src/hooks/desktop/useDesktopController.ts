import { useEffect, useRef, useState } from "react";
import { useFileExplorerWindows } from "../linux/useFileExplorerWindows";
import { useTerminal } from "../linux/useTerminal";
import { useVim } from "../linux/useVim";
import { useViewer } from "../linux/useViewer";
import { useStack } from "../linux/useStack";

const COMPACT_LAYOUT_QUERY = "(max-width: 980px), (max-height: 720px)";

export function useDesktopController() {
  const stageRef = useRef<HTMLElement | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [dockTime, setDockTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_LAYOUT_QUERY);

    const syncLayout = () => {
      setIsCompactLayout(mediaQuery.matches);
    };

    syncLayout();
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDockTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 15000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const { activeSurfaceId, bringAnySurfaceToFront, removeSurfaceFromOrder, getSurfaceZIndex } =
    useStack();

  const fileExplorerWindows = useFileExplorerWindows({
    stageRef,
    isCompactLayout,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
  });

  const vimWindow = useVim({
    stageRef,
    isCompactLayout,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
  });

  const terminalWindow = useTerminal({
    stageRef,
    isCompactLayout,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
    openFolder: fileExplorerWindows.openFolder,
    openVim: vimWindow.openVim,
  });

  const viewerWindow = useViewer({
    stageRef,
    isCompactLayout,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
    openVimFile: vimWindow.openVimFile,
  });

  return {
    stageRef,
    isCompactLayout,
    dockTime,
    activeSurfaceId,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    ...fileExplorerWindows,
    ...vimWindow,
    ...terminalWindow,
    ...viewerWindow,
  };
}

export type DesktopController = ReturnType<typeof useDesktopController>;
