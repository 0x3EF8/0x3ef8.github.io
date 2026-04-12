import type { CSSProperties } from "react";
import {
  FILE_MANAGER_PLACE_LABEL,
  FILE_MANAGER_PLACE_ORDER,
  FILE_MANAGER_PLACES,
  FOLDERS,
} from "../../constants";
import { buildFileRows, filterRowsByPlace } from "../../helpers";
import type { DesktopController } from "../../hooks/desktop/useDesktopController";
import { Controls } from "./Controls";

type FoldersProps = {
  controller: DesktopController;
};

export function Folders({ controller }: FoldersProps) {
  return (
    <>
      {controller.visibleSurfaceIds.map((folderId) => {
        const folder = FOLDERS.find((item) => item.id === folderId);
        if (!folder) {
          return null;
        }

        const isFocused = controller.activeSurfaceId === folder.id;
        const isMaximized = controller.maximizedFolderIds.includes(folder.id);
        const isDragging = controller.draggingFolderId === folder.id;
        const isResizing = controller.resizingFolderId === folder.id;
        const position = controller.surfacePositions[folder.id];
        const size = controller.surfaceSizes[folder.id];
        const fileRows = buildFileRows(folder.files);
        const activePlace = controller.activePlaceByFolder[folder.id] ?? "home";
        const viewMode = controller.viewModeByFolder[folder.id] ?? "list";
        const searchText = controller.searchByFolder[folder.id] ?? "";
        const placeRows = filterRowsByPlace(fileRows, activePlace);
        const trimmedSearch = searchText.trim().toLowerCase();
        const filteredRows = placeRows.filter((row) => {
          if (!trimmedSearch) {
            return true;
          }

          return (
            row.name.toLowerCase().includes(trimmedSearch) ||
            row.kind.toLowerCase().includes(trimmedSearch)
          );
        });
        const selectedFileName = controller.selectedFileByFolder[folder.id] ?? fileRows[0]?.name ?? "";
        const selectedRowFromState = fileRows.find((row) => row.name === selectedFileName) ?? null;
        const selectedRow =
          selectedRowFromState && filteredRows.some((row) => row.name === selectedRowFromState.name)
            ? selectedRowFromState
            : filteredRows[0] ?? null;
        const placeIndex = FILE_MANAGER_PLACE_ORDER.indexOf(activePlace);
        const safePlaceIndex = placeIndex === -1 ? 0 : placeIndex;
        const canGoBack = safePlaceIndex > 0;
        const canGoForward = safePlaceIndex < FILE_MANAGER_PLACE_ORDER.length - 1;

        const windowStyle: CSSProperties = {
          zIndex: controller.getSurfaceZIndex(folder.id),
        };

        if (!controller.isCompactLayout && !isMaximized) {
          if (position) {
            windowStyle.left = `${position.x}px`;
            windowStyle.top = `${position.y}px`;
            windowStyle.right = "auto";
            windowStyle.bottom = "auto";
          }

          if (size) {
            windowStyle.width = `${size.width}px`;
            windowStyle.height = `${size.height}px`;
          }
        }

        return (
          <article
            key={folder.id}
            className={`folder-window ${folder.surfacePosition}${
              isFocused ? " is-focused" : ""
            }${isMaximized ? " is-maximized" : ""}${
              isDragging ? " is-dragging" : ""
            }${isResizing ? " is-resizing" : ""}`}
            style={windowStyle}
            onMouseDown={() => controller.bringSurfaceToFront(folder.id)}
          >
            <header
              className="folder-window-bar"
              onPointerDown={(event) => controller.handleFolderDragStart(event, folder.id)}
              onPointerMove={(event) => controller.handleFolderDragMove(event, folder.id)}
              onPointerUp={(event) => controller.handleFolderDragEnd(event, folder.id)}
              onPointerCancel={(event) => controller.handleFolderDragEnd(event, folder.id)}
            >
              <Controls
                closeLabel={`Close ${folder.name}`}
                minimizeLabel={`Minimize ${folder.name}`}
                maximizeLabel={`${isMaximized ? "Restore" : "Maximize"} ${folder.name}`}
                onClose={() => controller.closeFolder(folder.id)}
                onMinimize={() => controller.minimizeFolder(folder.id)}
                onMaximize={() => controller.toggleMaximizeFolder(folder.id)}
              />
              <p className="folder-window-title">{folder.name}</p>
              <span className="window-spacer" aria-hidden />
            </header>

            <div className="folder-window-body file-manager-body">
              <div className="file-manager-toolbar" role="toolbar" aria-label="File manager toolbar">
                <div className="file-manager-nav-group" role="group" aria-label="Navigation">
                  <button
                    type="button"
                    className="file-manager-icon-btn"
                    aria-label="Back"
                    onClick={() => controller.cycleFolderPlace(folder.id, -1)}
                    disabled={!canGoBack}
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    className="file-manager-icon-btn"
                    aria-label="Forward"
                    onClick={() => controller.cycleFolderPlace(folder.id, 1)}
                    disabled={!canGoForward}
                  >
                    &rarr;
                  </button>
                  <button
                    type="button"
                    className="file-manager-icon-btn"
                    aria-label="Up folder"
                    onClick={() => controller.setFolderPlace(folder.id, "home")}
                    disabled={activePlace === "home"}
                  >
                    &uarr;
                  </button>
                  <span className="file-manager-divider" aria-hidden />
                  <button
                    type="button"
                    className="file-manager-icon-btn"
                    aria-label="Refresh"
                    onClick={() => controller.clearFolderSearch(folder.id)}
                  >
                    &#x27f3;
                  </button>
                </div>

                <div className="file-manager-location" role="group" aria-label="Location bar">
                  <span className="file-manager-location-icon" aria-hidden>
                    &#x25a3;
                  </span>
                  <span className="file-manager-crumb">home</span>
                  <span className="file-manager-crumb-sep" aria-hidden>
                    &#x203a;
                  </span>
                  <span className="file-manager-crumb">linux desktop portfolio</span>
                  <span className="file-manager-crumb-sep" aria-hidden>
                    &#x203a;
                  </span>
                  <span className="file-manager-crumb current">{FILE_MANAGER_PLACE_LABEL[activePlace]}</span>
                </div>

                <div className="file-manager-right-tools">
                  <div className="file-manager-view-switch" role="group" aria-label="View mode">
                    <button
                      type="button"
                      className={`file-manager-view-btn${viewMode === "list" ? " is-active" : ""}`}
                      onClick={() => controller.setFolderViewMode(folder.id, "list")}
                      aria-label="List view"
                    >
                      list
                    </button>
                    <button
                      type="button"
                      className={`file-manager-view-btn${viewMode === "grid" ? " is-active" : ""}`}
                      onClick={() => controller.setFolderViewMode(folder.id, "grid")}
                      aria-label="Grid view"
                    >
                      grid
                    </button>
                  </div>

                  <label className="file-manager-searchbox">
                    <span className="file-manager-search-icon" aria-hidden>
                      &#x2315;
                    </span>
                    <input
                      className="file-manager-search-input"
                      type="text"
                      value={searchText}
                      onChange={(event) => controller.setFolderSearch(folder.id, event.target.value)}
                      placeholder="Search in folder"
                      aria-label="Search files"
                    />
                  </label>
                </div>
              </div>

              <div className="file-manager-split">
                <aside className="file-manager-sidebar" aria-label="Places">
                  <p className="file-manager-sidebar-title">places</p>
                  {FILE_MANAGER_PLACES.map((place) => (
                    <button
                      key={`${folder.id}-${place.id}`}
                      type="button"
                      className={`file-manager-sidebar-item${activePlace === place.id ? " is-active" : ""}`}
                      onClick={() => controller.setFolderPlace(folder.id, place.id)}
                    >
                      <span className="file-manager-sidebar-glyph" aria-hidden>
                        {place.glyph}
                      </span>
                      {place.label}
                    </button>
                  ))}
                </aside>

                <section className="file-manager-main">
                  <p className="file-manager-path">
                    Home / Linux Desktop Portfolio / {folder.name} / {FILE_MANAGER_PLACE_LABEL[activePlace]}
                  </p>
                  {viewMode === "list" ? (
                    <div className="file-manager-header" role="presentation">
                      <span>Name</span>
                      <span>Type</span>
                      <span>Size</span>
                      <span>Modified</span>
                    </div>
                  ) : null}

                  <ul className={`file-manager-list${viewMode === "grid" ? " is-grid" : ""}`}>
                    {filteredRows.map((row) => (
                      <li
                        key={row.name}
                        className={`file-manager-row${
                          selectedRow?.name === row.name ? " is-selected" : ""
                        }${viewMode === "grid" ? " is-grid" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => controller.setSelectedFolderFile(folder.id, row.name)}
                        onDoubleClick={() => controller.openPortfolioFile(folder.name, row)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            controller.openPortfolioFile(folder.name, row);
                          }

                          if (event.key === " ") {
                            event.preventDefault();
                            controller.setSelectedFolderFile(folder.id, row.name);
                          }
                        }}
                      >
                        <span className="file-manager-cell file-manager-cell-name">
                          <span className={`file-manager-dot ${row.tone}`} aria-hidden />
                          <button
                            type="button"
                            className="file-manager-file-link"
                            onClick={(event) => {
                              event.stopPropagation();
                              controller.openPortfolioFile(folder.name, row);
                            }}
                          >
                            {row.name}
                          </button>
                        </span>
                        <span className="file-manager-cell">{row.kind}</span>
                        <span className="file-manager-cell">{row.size}</span>
                        <span className="file-manager-cell">{row.modified}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="file-manager-status">
                    {filteredRows.length} items
                    {trimmedSearch ? " (filtered)" : ""}
                  </p>
                </section>

                <aside className="file-manager-preview" aria-label="Selection preview">
                  {selectedRow ? (
                    <>
                      <p className="file-manager-preview-title">Preview</p>
                      <span className={`file-manager-preview-icon ${selectedRow.tone}`} aria-hidden />
                      <p className="file-manager-preview-name">{selectedRow.name}</p>
                      <dl className="file-manager-preview-meta">
                        <div>
                          <dt>Type</dt>
                          <dd>{selectedRow.kind}</dd>
                        </div>
                        <div>
                          <dt>Size</dt>
                          <dd>{selectedRow.size}</dd>
                        </div>
                        <div>
                          <dt>Modified</dt>
                          <dd>{selectedRow.modified}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        className="file-manager-open-btn"
                        onClick={() => controller.openPortfolioFile(folder.name, selectedRow)}
                      >
                        Open File
                      </button>
                    </>
                  ) : (
                    <p className="file-manager-preview-empty">No file selected</p>
                  )}
                </aside>
              </div>
            </div>

            <button
              type="button"
              className="window-resizer"
              onPointerDown={(event) => controller.handleFolderResizeStart(event, folder.id)}
              onPointerMove={(event) => controller.handleFolderResizeMove(event, folder.id)}
              onPointerUp={(event) => controller.handleFolderResizeEnd(event, folder.id)}
              onPointerCancel={(event) => controller.handleFolderResizeEnd(event, folder.id)}
              aria-label={`Resize ${folder.name}`}
            />
          </article>
        );
      })}
    </>
  );
}
