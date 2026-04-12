import { useEffect, useRef, useState } from "react";
import { useLinuxFolders } from "./useLinuxFolders";
import { useLinuxTerminal } from "./useLinuxTerminal";
import { useLinuxVim } from "./useLinuxVim";
import { useLinuxViewer } from "./useLinuxViewer";
import { useLinuxStack } from "./useLinuxStack";

export function useDesktopController() {
  const stageRef = useRef<HTMLElement | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [dockTime, setDockTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");

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
    useLinuxStack();

  const folderWindows = useLinuxFolders({
    stageRef,
    isCompactLayout,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
  });

  const vimWindow = useLinuxVim({
    stageRef,
    isCompactLayout,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
  });

  const terminalWindow = useLinuxTerminal({
    stageRef,
    isCompactLayout,
    getSurfaceZIndex,
    bringAnySurfaceToFront,
    removeSurfaceFromOrder,
    openFolder: folderWindows.openFolder,
    openVim: vimWindow.openVim,
  });

  const viewerWindow = useLinuxViewer({
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
    ...folderWindows,
    ...vimWindow,
    ...terminalWindow,
    ...viewerWindow,
  };
}

export type DesktopController = ReturnType<typeof useDesktopController>;
