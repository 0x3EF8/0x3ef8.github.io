"use client";

import Image from "next/image";
import { DesktopDock } from "./components/desktop/DesktopDock";
import { DesktopFolders } from "./components/desktop/DesktopFolders";
import { DesktopWidgetRail } from "@/components/desktop/DesktopWidgetRail";
import { DesktopGithubNotification } from "./components/desktop/DesktopGithubNotification";
import { DesktopTopBar } from "./components/desktop/DesktopTopBar";
import { FileExplorer } from "./components/linux/FileExplorer";
import { Terminal } from "./components/linux/Terminal";
import { Vim } from "./components/linux/Vim";
import { Viewer } from "./components/linux/Viewer";
import { useDesktopController } from "./hooks/desktop/useDesktopController";

export default function DesktopScene() {
  const controller = useDesktopController();
  const {
    stageRef,
    dockTime,
    openTerminal,
    activeFolderId,
    openFolder,
    isTerminalVisible,
    isVimVisible,
    isViewerVisible,
  } = controller;
  const hasMaximizedSurface =
    controller.maximizedFolderIds.length > 0 ||
    controller.isTerminalMaximized ||
    controller.isVimMaximized ||
    controller.isViewerMaximized;

  return (
    <main className="desk-page">
      <section ref={stageRef} className="desktop-stage">
        <DesktopTopBar dockTime={dockTime} onOpenTerminal={openTerminal} />

        <DesktopGithubNotification />

        <DesktopWidgetRail />

        <DesktopFolders activeFolderId={activeFolderId} onOpenFolder={openFolder} />

        <div className="window-layer" aria-live="polite">
          <FileExplorer controller={controller} />
          {isTerminalVisible ? <Terminal controller={controller} /> : null}
          {isVimVisible ? <Vim controller={controller} /> : null}
          {isViewerVisible ? <Viewer controller={controller} /> : null}
        </div>

        {hasMaximizedSurface ? null : <DesktopDock controller={controller} />}

        <figure className="profile-wrap">
          <Image
            src="/pat.png"
            alt="Profile portrait"
            className="profile-photo"
            width={1024}
            height={1536}
            priority
          />
        </figure>
      </section>
    </main>
  );
}
