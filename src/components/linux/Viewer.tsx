import Image from "next/image";
import type { DesktopController } from "../../hooks/desktop/useDesktopController";
import { Controls } from "./Controls";

type ViewerProps = {
  controller: DesktopController;
};

export function Viewer({ controller }: ViewerProps) {
  const openedFile = controller.openedFile;

  const applyViewerScrollbarTheme = (iframe: HTMLIFrameElement) => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      if (doc.getElementById("viewer-scrollbar-theme")) {
        return;
      }

      const style = doc.createElement("style");
      style.id = "viewer-scrollbar-theme";
      style.textContent = `
        :root {
          --viewer-scrollbar-track: rgba(18, 22, 30, 0.72);
          --viewer-scrollbar-thumb: rgba(184, 196, 217, 0.42);
          --viewer-scrollbar-thumb-hover: rgba(214, 225, 242, 0.58);
        }

        html,
        body {
          scrollbar-width: thin;
          scrollbar-color: var(--viewer-scrollbar-thumb) var(--viewer-scrollbar-track);
        }

        *::-webkit-scrollbar {
          width: 0.68rem;
          height: 0.68rem;
        }

        *::-webkit-scrollbar-track {
          border-radius: 999px;
          background: var(--viewer-scrollbar-track);
        }

        *::-webkit-scrollbar-thumb {
          border: 2px solid var(--viewer-scrollbar-track);
          border-radius: 999px;
          background: var(--viewer-scrollbar-thumb);
        }

        *::-webkit-scrollbar-thumb:hover {
          background: var(--viewer-scrollbar-thumb-hover);
        }
      `;

      const styleHost = doc.head ?? doc.documentElement;
      styleHost.appendChild(style);
    } catch {
      // Ignore cross-origin frames and keep the viewer functional.
    }
  };

  const handleFrameLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    applyViewerScrollbarTheme(event.currentTarget);
  };

  if (!openedFile) {
    return null;
  }

  const normalizedImagePath = openedFile.path.startsWith("./")
    ? `/${openedFile.path.slice(2)}`
    : openedFile.path;

  return (
    <article
      className={`folder-window viewer-window${
        controller.activeSurfaceId === "viewer" ? " is-focused" : ""
      }${controller.isViewerMaximized ? " is-maximized" : ""}${
        controller.isViewerDragging ? " is-dragging" : ""
      }${controller.isViewerResizing ? " is-resizing" : ""}`}
      style={controller.viewerStyle}
      onMouseDown={() => controller.bringAnySurfaceToFront("viewer")}
    >
      <header
        className="folder-window-bar"
        onPointerDown={controller.handleViewerDragStart}
        onPointerMove={controller.handleViewerDragMove}
        onPointerUp={controller.handleViewerDragEnd}
        onPointerCancel={controller.handleViewerDragEnd}
      >
        <Controls
          closeLabel="Close file viewer"
          minimizeLabel="Minimize file viewer"
          maximizeLabel={controller.isViewerMaximized ? "Restore file viewer" : "Maximize file viewer"}
          onClose={controller.closeViewer}
          onMinimize={controller.minimizeViewer}
          onMaximize={controller.toggleMaximizeViewer}
        />
        <p className="folder-window-title">{openedFile.name}</p>
        <span className="window-spacer" aria-hidden />
      </header>

      <div className="folder-window-body viewer-body">
        <p className="viewer-path">{openedFile.folderName} / {openedFile.name}</p>
        <div className="viewer-content-wrap">
          {controller.viewerIsImage ? (
            <Image
              className="viewer-image"
              src={normalizedImagePath}
              alt={openedFile.title}
              fill
              sizes="(max-width: 900px) 82vw, 720px"
            />
          ) : null}

          {controller.viewerIsText ? (
            <>
              {controller.viewerContentStatus === "loading" ? (
                <p className="viewer-loading">Loading file...</p>
              ) : null}
              {controller.viewerContentStatus === "error" ? (
                <p className="viewer-error">{controller.viewerError}</p>
              ) : null}
              {controller.viewerContentStatus === "ready" ? (
                <pre className="viewer-text">{controller.viewerTextContent}</pre>
              ) : null}
            </>
          ) : null}

          {controller.viewerIsHtml ? (
            <iframe
              key={openedFile.path}
              className="viewer-frame"
              src={openedFile.path}
              title={openedFile.title}
              onLoad={handleFrameLoad}
            />
          ) : null}

          {!controller.viewerIsImage && !controller.viewerIsText && !controller.viewerIsHtml ? (
            <iframe
              key={openedFile.path}
              className="viewer-frame"
              src={openedFile.path}
              title={openedFile.title}
              onLoad={handleFrameLoad}
            />
          ) : null}
        </div>
        <p className="viewer-summary">{openedFile.summary}</p>
      </div>

      <button
        type="button"
        className="window-resizer"
        onPointerDown={controller.handleViewerResizeStart}
        onPointerMove={controller.handleViewerResizeMove}
        onPointerUp={controller.handleViewerResizeEnd}
        onPointerCancel={controller.handleViewerResizeEnd}
        aria-label="Resize file viewer"
      />
    </article>
  );
}
