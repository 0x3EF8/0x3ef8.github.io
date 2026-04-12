"use client";

import Image from "next/image";
import { DesktopDock } from "./components/DesktopDock";
import { DesktopFolders } from "./components/DesktopFolders";
import { DesktopTopBar } from "./components/DesktopTopBar";
import { LinuxFolders } from "./components/LinuxFolders";
import { LinuxTerminal } from "./components/LinuxTerminal";
import { LinuxVim } from "./components/LinuxVim";
import { LinuxViewer } from "./components/LinuxViewer";
import { useDesktopController } from "./hooks/useDesktopController";

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

  return (
    <main className="desk-page">
      <section ref={stageRef} className="desktop-stage">
        <DesktopTopBar dockTime={dockTime} onOpenTerminal={openTerminal} />

        <DesktopFolders activeFolderId={activeFolderId} onOpenFolder={openFolder} />

        <div className="window-layer" aria-live="polite">
          <LinuxFolders controller={controller} />
          {isTerminalVisible ? <LinuxTerminal controller={controller} /> : null}
          {isVimVisible ? <LinuxVim controller={controller} /> : null}
          {isViewerVisible ? <LinuxViewer controller={controller} /> : null}
        </div>

        <DesktopDock controller={controller} />

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
