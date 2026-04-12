import { FOLDERS } from "../../constants";
import type { DesktopController } from "../../hooks/desktop/useDesktopController";
import type { FolderId } from "../../types";

type DesktopDockProps = {
  controller: DesktopController;
};

type DockShortcutApp = {
  id: string;
  label: string;
  folderId: FolderId;
  iconClass: string;
  toneClass: string;
};

const DOCK_SHORTCUT_APPS: readonly DockShortcutApp[] = [
  {
    id: "home",
    label: "Home",
    folderId: "dumps",
    iconClass: "dock-shortcut-home",
    toneClass: "quick-home",
  },
  {
    id: "code",
    label: "Code",
    folderId: "wishlist",
    iconClass: "dock-shortcut-code",
    toneClass: "quick-code",
  },
  {
    id: "chat",
    label: "Chat",
    folderId: "favorites",
    iconClass: "dock-shortcut-chat",
    toneClass: "quick-chat",
  },
] as const;

export function DesktopDock({ controller }: DesktopDockProps) {
  const shortcutFolderIds = new Set<FolderId>(DOCK_SHORTCUT_APPS.map((app) => app.folderId));

  return (
    <nav className="linux-dock" aria-label="Application dock">
      <div className="linux-dock-track">
        <button
          type="button"
          onClick={controller.openTerminal}
          className={`dock-item terminal-app${controller.isTerminalOpen ? " is-running" : ""}${
            controller.isTerminalMinimized ? " is-minimized" : ""
          }`}
          data-label="Terminal"
          aria-label={controller.isTerminalMinimized ? "Restore terminal" : "Open terminal"}
        >
          <span className="dock-terminal-icon" aria-hidden />
          <span className="dock-running-dot" aria-hidden />
        </button>

        <button
          type="button"
          onClick={controller.restoreViewer}
          className={`dock-item viewer-app${controller.isViewerOpen ? " is-running" : ""}${
            controller.isViewerMinimized ? " is-minimized" : ""
          }`}
          data-label={controller.openedFile ? "Viewer" : "No file"}
          aria-label={controller.openedFile ? "Open file viewer" : "No open file yet"}
          disabled={!controller.openedFile}
        >
          <span className="dock-viewer-icon" aria-hidden />
          <span className="dock-running-dot" aria-hidden />
        </button>

        <button
          type="button"
          onClick={controller.openVim}
          className={`dock-item vim-app${controller.isVimOpen ? " is-running" : ""}${
            controller.isVimMinimized ? " is-minimized" : ""
          }`}
          data-label={controller.isVimMinimized ? "Restore Vim" : "Vim"}
          aria-label={controller.isVimMinimized ? "Restore vim" : "Open vim"}
        >
          <span className="dock-vim-icon" aria-hidden />
          <span className="dock-running-dot" aria-hidden />
        </button>

        {DOCK_SHORTCUT_APPS.map((app) => {
          const isRunning = controller.openFolderIds.includes(app.folderId);
          const isMinimized = controller.minimizedFolderIds.includes(app.folderId);

          return (
            <button
              key={`quick-${app.id}`}
              type="button"
              onClick={() => controller.openFolder(app.folderId)}
              className={`dock-item dock-shortcut ${app.toneClass}${isRunning ? " is-running" : ""}${
                isMinimized ? " is-minimized" : ""
              }`}
              data-label={app.label}
              aria-label={`${isMinimized ? "Restore" : "Open"} ${app.label}`}
            >
              <span className={`dock-shortcut-icon ${app.iconClass}`} aria-hidden />
              <span className="dock-running-dot" aria-hidden />
            </button>
          );
        })}

        {FOLDERS.filter((folder) => !shortcutFolderIds.has(folder.id)).map((folder) => {
          const isRunning = controller.openFolderIds.includes(folder.id);
          const isMinimized = controller.minimizedFolderIds.includes(folder.id);

          return (
            <button
              key={`dock-${folder.id}`}
              type="button"
              onClick={() => controller.openFolder(folder.id)}
              className={`dock-item ${folder.tone}${isRunning ? " is-running" : ""}${
                isMinimized ? " is-minimized" : ""
              }`}
              data-label={folder.name}
              aria-label={`${isMinimized ? "Restore" : "Open"} ${folder.name}`}
            >
              <span className="dock-item-icon" aria-hidden />
              <span className="dock-running-dot" aria-hidden />
            </button>
          );
        })}

        <span className="dock-divider" aria-hidden />

        <button type="button" className="dock-item dock-trash" data-label="Trash" aria-label="Trash">
          <span className="dock-trash-icon" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
