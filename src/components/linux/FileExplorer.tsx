import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  FILE_MANAGER_PLACE_LABEL,
  FILE_MANAGER_PLACE_ORDER,
  FILE_MANAGER_PLACES,
  FOLDERS,
} from "../../constants";
import { buildFileRows, clamp, filterRowsByPlace } from "../../helpers";
import type { FileManagerRow, FolderId } from "../../types";
import type { DesktopController } from "../../hooks/desktop/useDesktopController";
import { Controls } from "./Controls";

type FileExplorerProps = {
  controller: DesktopController;
};

type GitHubRepo = {
  name: string;
  owner: string;
  private: boolean;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  htmlUrl: string;
  defaultBranch: string;
};

type GitHubRepoResponse = {
  repos: GitHubRepo[];
  counts: {
    total: number;
    public: number;
    private: number;
  };
  fetchedAt: string;
};

type RepoLoadState = "idle" | "loading" | "ready" | "error";
type ProjectVisibilityFilter = "all" | "public" | "private";
type PaneResizeTarget = "sidebar" | "preview";

type FileManagerPaneLayout = {
  sidebarWidthRatio: number;
  previewWidthRatio: number;
  isPreviewHidden: boolean;
};

type PaneDragState = {
  pointerId: number;
  target: PaneResizeTarget;
  startX: number;
  containerWidth: number;
  startSidebarWidthRatio: number;
  startPreviewWidthRatio: number;
};

const PROJECT_OVERVIEW_FILE = "01-repository-overview.html";
const PROJECT_README_FILE = "02-README.md";
const PROJECT_ACTIVITY_FILE = "03-recent-activity.html";

const PROJECT_VISIBILITY_FILTER_LABEL: Record<ProjectVisibilityFilter, string> = {
  all: "all",
  public: "public",
  private: "private",
};

const getKindLabel = (kind: string) => {
  if (kind === "Folder") {
    return "Directory";
  }

  if (kind === "Folder (Public)") {
    return "Repository (Public)";
  }

  if (kind === "Folder (Private)") {
    return "Repository (Private)";
  }

  return kind;
};

const isDirectoryKind = (kind: string) => kind === "Folder" || kind.startsWith("Folder (");

const DEFAULT_FILE_MANAGER_PANE_LAYOUT: FileManagerPaneLayout = {
  sidebarWidthRatio: 0.2,
  previewWidthRatio: 0.27,
  isPreviewHidden: false,
};

const MIN_SIDEBAR_WIDTH_RATIO = 0.14;
const MAX_SIDEBAR_WIDTH_RATIO = 0.36;
const MIN_PREVIEW_WIDTH_RATIO = 0.18;
const MAX_PREVIEW_WIDTH_RATIO = 0.42;
const MAX_SIDE_PANE_RATIO = 0.74;

const formatRepoDate = (value: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export function FileExplorer({ controller }: FileExplorerProps) {
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [repoLoadState, setRepoLoadState] = useState<RepoLoadState>("idle");
  const [repoError, setRepoError] = useState("");
  const [repoCounts, setRepoCounts] = useState({ total: 0, public: 0, private: 0 });
  const [paneLayoutByFolder, setPaneLayoutByFolder] = useState<
    Partial<Record<FolderId, FileManagerPaneLayout>>
  >({});
  const [projectVisibilityFilterByFolder, setProjectVisibilityFilterByFolder] = useState<
    Partial<Record<FolderId, ProjectVisibilityFilter>>
  >({});
  const [activeProjectRepoByFolder, setActiveProjectRepoByFolder] = useState<
    Partial<Record<FolderId, string>>
  >({});
  const paneDragStateRef = useRef<Record<FolderId, PaneDragState | null>>({
    dumps: null,
    wishlist: null,
    content: null,
    favorites: null,
  });

  const loadGitHubRepos = useCallback(async () => {
    try {
      setRepoLoadState("loading");
      setRepoError("");

      const response = await fetch("/api/github/repos", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch GitHub repositories");
      }

      const payload = (await response.json()) as GitHubRepoResponse;
      const repos = payload.repos ?? [];

      setGithubRepos(repos);
      setRepoCounts(
        payload.counts ?? {
          total: repos.length,
          public: repos.filter((repo) => !repo.private).length,
          private: repos.filter((repo) => repo.private).length,
        },
      );
      setRepoLoadState("ready");
    } catch {
      setRepoLoadState("error");
      setRepoError("Unable to load repositories. Check your token and try refresh.");
    }
  }, []);

  useEffect(() => {
    void loadGitHubRepos();
  }, [loadGitHubRepos]);

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
        const isProjectsFolder = folder.id === "wishlist";
        const activeProjectRepoName = activeProjectRepoByFolder[folder.id] ?? null;
        const activeProjectRepo = isProjectsFolder
          ? githubRepos.find((repo) => repo.name === activeProjectRepoName) ?? null
          : null;
        const activeProjectVisibilityFilter =
          projectVisibilityFilterByFolder[folder.id] ?? "all";
        const filteredProjectRepos = isProjectsFolder
          ? githubRepos.filter((repo) => {
              if (activeProjectVisibilityFilter === "all") {
                return true;
              }

              if (activeProjectVisibilityFilter === "public") {
                return !repo.private;
              }

              return repo.private;
            })
          : [];
        const activePlace = controller.activePlaceByFolder[folder.id] ?? "home";
        const viewMode = controller.viewModeByFolder[folder.id] ?? "list";
        const searchText = controller.searchByFolder[folder.id] ?? "";
        const paneLayout = paneLayoutByFolder[folder.id] ?? DEFAULT_FILE_MANAGER_PANE_LAYOUT;
        const canUseThreePane = !controller.isCompactLayout && (isMaximized || (size?.width ?? 610) >= 620);
        const sidebarWidthRatio = clamp(
          paneLayout.sidebarWidthRatio,
          MIN_SIDEBAR_WIDTH_RATIO,
          MAX_SIDEBAR_WIDTH_RATIO,
        );
        const previewWidthRatio = clamp(
          paneLayout.previewWidthRatio,
          MIN_PREVIEW_WIDTH_RATIO,
          MAX_PREVIEW_WIDTH_RATIO,
        );
        const showPreviewPane = canUseThreePane && !paneLayout.isPreviewHidden;
        const desktopRows: FileManagerRow[] = FOLDERS.map((desktopFolder, index) => ({
          name: desktopFolder.name,
          kind: "Folder",
          size: "--",
          modified: "Desktop",
          tone: index % 2 === 0 ? "document" : "generic",
        }));

        const projectRepoRows: FileManagerRow[] = isProjectsFolder
          ? filteredProjectRepos.map((repo) => ({
              name: repo.name,
              kind: repo.private ? "Folder (Private)" : "Folder (Public)",
              size: repo.language || "Unknown",
              modified: formatRepoDate(repo.updatedAt),
              tone: repo.private ? "archive" : "document",
              title: `${repo.owner}/${repo.name}`,
              summary:
                repo.description ||
                `${repo.private ? "Private" : "Public"} repository with ${repo.language || "Unknown"} stack.`,
            }))
          : [];

        const projectRepoContentRows: FileManagerRow[] = activeProjectRepo
          ? [
              {
                name: "..",
                kind: "Folder",
                size: "--",
                modified: "Back",
                tone: "generic",
                title: "Back to repositories",
                summary: "Return to the repository list.",
              },
              {
                name: PROJECT_OVERVIEW_FILE,
                kind: "Document",
                size: "--",
                modified: formatRepoDate(activeProjectRepo.updatedAt),
                tone: "document",
                path: `/api/github/repo/${encodeURIComponent(activeProjectRepo.owner)}/${encodeURIComponent(activeProjectRepo.name)}?view=overview`,
                title: `${activeProjectRepo.owner}/${activeProjectRepo.name} overview`,
                summary: "Repository profile, metadata, visibility, and key project statistics.",
              },
              {
                name: PROJECT_README_FILE,
                kind: "Document",
                size: "--",
                modified: formatRepoDate(activeProjectRepo.updatedAt),
                tone: "text",
                path: `/api/github/repo/${encodeURIComponent(activeProjectRepo.owner)}/${encodeURIComponent(activeProjectRepo.name)}?view=readme`,
                title: `${activeProjectRepo.owner}/${activeProjectRepo.name} README`,
                summary: "Compiled Markdown view of the repository README.",
              },
              {
                name: PROJECT_ACTIVITY_FILE,
                kind: "Document",
                size: "--",
                modified: formatRepoDate(activeProjectRepo.updatedAt),
                tone: "video",
                path: `/api/github/repo/${encodeURIComponent(activeProjectRepo.owner)}/${encodeURIComponent(activeProjectRepo.name)}?view=activity`,
                title: `${activeProjectRepo.owner}/${activeProjectRepo.name} activity`,
                summary: "Recent commit activity and language distribution summary.",
              },
            ]
          : [];

        const projectFallbackRows: FileManagerRow[] =
          isProjectsFolder && !activeProjectRepo
            ? repoLoadState === "loading"
              ? [
                  {
                    name: "Loading repositories...",
                    kind: "System",
                    size: "--",
                    modified: "Now",
                    tone: "generic",
                  },
                ]
              : repoLoadState === "error"
                ? [
                    {
                      name: "refresh repositories",
                      kind: "Action",
                      size: "--",
                      modified: "Retry",
                      tone: "generic",
                    },
                  ]
                : [
                    {
                      name: "No repositories found",
                      kind: "System",
                      size: "--",
                      modified: "--",
                      tone: "generic",
                    },
                  ]
            : [];

        const placeRows = isProjectsFolder
          ? activeProjectRepo
            ? projectRepoContentRows
            : projectRepoRows.length > 0
              ? projectRepoRows
              : projectFallbackRows
          : activePlace === "desktop"
            ? desktopRows
            : filterRowsByPlace(fileRows, activePlace);

        const trimmedSearch = searchText.trim().toLowerCase();
        const filteredRows = placeRows.filter((row) => {
          if (!trimmedSearch) {
            return true;
          }

          const kindLabel = getKindLabel(row.kind).toLowerCase();

          return (
            row.name.toLowerCase().includes(trimmedSearch) ||
            row.kind.toLowerCase().includes(trimmedSearch) ||
            kindLabel.includes(trimmedSearch)
          );
        });
        const selectedFileName = controller.selectedFileByFolder[folder.id] ?? placeRows[0]?.name ?? "";
        const selectedRowFromState = placeRows.find((row) => row.name === selectedFileName) ?? null;
        const selectedRow =
          selectedRowFromState && filteredRows.some((row) => row.name === selectedRowFromState.name)
            ? selectedRowFromState
            : filteredRows[0] ?? null;
        const placeIndex = FILE_MANAGER_PLACE_ORDER.indexOf(activePlace);
        const safePlaceIndex = placeIndex === -1 ? 0 : placeIndex;
        const isProjectRepoOpen = isProjectsFolder && Boolean(activeProjectRepo);
        const canGoBack = isProjectRepoOpen || safePlaceIndex > 0;
        const canGoForward = !isProjectRepoOpen && safePlaceIndex < FILE_MANAGER_PLACE_ORDER.length - 1;
        const locationCurrentLabel = isProjectsFolder
          ? activeProjectRepo
            ? activeProjectRepo.name
            : "repositories"
          : FILE_MANAGER_PLACE_LABEL[activePlace];
        const showLocationCurrentCrumb = isProjectsFolder || activePlace !== "home";
        const fileManagerPath = isProjectsFolder
          ? `Home / 0x3EF8 / ${folder.name} / ${locationCurrentLabel}`
          : activePlace === "home"
            ? `Home / 0x3EF8 / ${folder.name}`
            : `Home / 0x3EF8 / ${folder.name} / ${FILE_MANAGER_PLACE_LABEL[activePlace]}`;

        const resetProjectRepoView = () => {
          setActiveProjectRepoByFolder((current) => {
            const next = { ...current };
            delete next[folder.id];
            return next;
          });

          controller.setSelectedFolderFile(folder.id, projectRepoRows[0]?.name ?? "");
        };

        const goToFolderHome = () => {
          if (isProjectsFolder) {
            resetProjectRepoView();
          }

          controller.setFolderPlace(folder.id, "home");
        };

        const handlePaneResizeStart = (
          event: ReactPointerEvent<HTMLButtonElement>,
          target: PaneResizeTarget,
        ) => {
          if (!canUseThreePane || event.button !== 0) {
            return;
          }

          const splitElement = event.currentTarget.parentElement;

          if (!(splitElement instanceof HTMLElement)) {
            return;
          }

          event.stopPropagation();

          const splitRect = splitElement.getBoundingClientRect();

          paneDragStateRef.current[folder.id] = {
            pointerId: event.pointerId,
            target,
            startX: event.clientX,
            containerWidth: splitRect.width,
            startSidebarWidthRatio: sidebarWidthRatio,
            startPreviewWidthRatio: previewWidthRatio,
          };

          event.currentTarget.setPointerCapture(event.pointerId);
        };

        const handlePaneResizeMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
          const dragState = paneDragStateRef.current[folder.id];

          if (!dragState || dragState.pointerId !== event.pointerId) {
            return;
          }

          const deltaRatio = (event.clientX - dragState.startX) / Math.max(1, dragState.containerWidth);

          let nextSidebarWidthRatio = dragState.startSidebarWidthRatio;
          let nextPreviewWidthRatio = dragState.startPreviewWidthRatio;

          if (dragState.target === "sidebar") {
            nextSidebarWidthRatio = clamp(
              dragState.startSidebarWidthRatio + deltaRatio,
              MIN_SIDEBAR_WIDTH_RATIO,
              MAX_SIDEBAR_WIDTH_RATIO,
            );
          } else {
            nextPreviewWidthRatio = clamp(
              dragState.startPreviewWidthRatio - deltaRatio,
              MIN_PREVIEW_WIDTH_RATIO,
              MAX_PREVIEW_WIDTH_RATIO,
            );
          }

          if (nextSidebarWidthRatio + nextPreviewWidthRatio > MAX_SIDE_PANE_RATIO) {
            if (dragState.target === "sidebar") {
              nextSidebarWidthRatio = MAX_SIDE_PANE_RATIO - nextPreviewWidthRatio;
            } else {
              nextPreviewWidthRatio = MAX_SIDE_PANE_RATIO - nextSidebarWidthRatio;
            }
          }

          setPaneLayoutByFolder((current) => ({
            ...current,
            [folder.id]: {
              ...(current[folder.id] ?? DEFAULT_FILE_MANAGER_PANE_LAYOUT),
              sidebarWidthRatio: nextSidebarWidthRatio,
              previewWidthRatio: nextPreviewWidthRatio,
            },
          }));
        };

        const handlePaneResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
          const dragState = paneDragStateRef.current[folder.id];

          if (!dragState || dragState.pointerId !== event.pointerId) {
            return;
          }

          paneDragStateRef.current[folder.id] = null;

          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        };

        const fileManagerSplitStyle: CSSProperties | undefined = canUseThreePane
          ? showPreviewPane
            ? {
                gridTemplateColumns: `${(sidebarWidthRatio * 100).toFixed(2)}% 6px minmax(0, 1fr) 6px ${(previewWidthRatio * 100).toFixed(2)}%`,
              }
            : {
                gridTemplateColumns: `${(sidebarWidthRatio * 100).toFixed(2)}% 6px minmax(0, 1fr)`,
              }
          : undefined;

        const openRow = (row: (typeof filteredRows)[number]) => {
          if (isProjectsFolder) {
            if (!activeProjectRepo) {
              if (row.name === "refresh repositories") {
                void loadGitHubRepos();
                return;
              }

              const repo = githubRepos.find((item) => item.name === row.name);

              if (!repo) {
                return;
              }

              setActiveProjectRepoByFolder((current) => ({
                ...current,
                [folder.id]: repo.name,
              }));
              controller.setSelectedFolderFile(folder.id, PROJECT_OVERVIEW_FILE);
              return;
            }

            if (row.name === "..") {
              resetProjectRepoView();
              return;
            }

            if (row.path) {
              controller.openPortfolioFile(folder.name, row);
            }

            return;
          }

          if (row.kind === "Folder") {
            const targetFolder = FOLDERS.find((item) => item.name === row.name);

            if (!targetFolder) {
              return;
            }

            controller.openFolder(targetFolder.id);
            controller.setFolderPlace(targetFolder.id, "home");
            return;
          }

          controller.openPortfolioFile(folder.name, row);
        };

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
                closeLabel={`Close ${folder.name} File Explorer`}
                minimizeLabel={`Minimize ${folder.name} File Explorer`}
                maximizeLabel={`${isMaximized ? "Restore" : "Maximize"} ${folder.name} File Explorer`}
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
                    onClick={() => {
                      if (isProjectRepoOpen) {
                        resetProjectRepoView();
                        return;
                      }

                      controller.cycleFolderPlace(folder.id, -1);
                    }}
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
                    aria-label="Up one level"
                    onClick={() => {
                      if (isProjectRepoOpen) {
                        resetProjectRepoView();
                        return;
                      }

                      controller.setFolderPlace(folder.id, "home");
                    }}
                    disabled={isProjectRepoOpen ? false : activePlace === "home"}
                  >
                    &uarr;
                  </button>
                  <span className="file-manager-divider" aria-hidden />
                  <button
                    type="button"
                    className="file-manager-icon-btn"
                    aria-label="Refresh"
                    onClick={() => {
                      controller.clearFolderSearch(folder.id);

                      if (isProjectsFolder) {
                        void loadGitHubRepos();
                      }
                    }}
                  >
                    &#x27f3;
                  </button>
                </div>

                <div className="file-manager-location" role="group" aria-label="Location bar">
                  <span className="file-manager-location-icon" aria-hidden>
                    &#x25a3;
                  </span>
                  <button
                    type="button"
                    className="file-manager-crumb-btn"
                    onClick={goToFolderHome}
                  >
                    home
                  </button>
                  <span className="file-manager-crumb-sep" aria-hidden>
                    &#x203a;
                  </span>
                  <button
                    type="button"
                    className="file-manager-crumb-btn"
                    onClick={goToFolderHome}
                  >
                    0x3EF8
                  </button>
                  {showLocationCurrentCrumb ? (
                    <span className="file-manager-crumb-sep" aria-hidden>
                      &#x203a;
                    </span>
                  ) : null}
                  {isProjectsFolder && activeProjectRepo ? (
                    <>
                      <button
                        type="button"
                        className="file-manager-crumb-btn"
                        onClick={resetProjectRepoView}
                      >
                        repositories
                      </button>
                      <span className="file-manager-crumb-sep" aria-hidden>
                        &#x203a;
                      </span>
                    </>
                  ) : null}
                  {showLocationCurrentCrumb ? (
                    <span className="file-manager-crumb current">{locationCurrentLabel}</span>
                  ) : null}
                </div>

                <div className="file-manager-right-tools">
                  {isProjectsFolder && !activeProjectRepo ? (
                    <label className="file-manager-filterbox">
                      <span className="file-manager-filter-label">visibility</span>
                      <select
                        className="file-manager-filter-select"
                        value={activeProjectVisibilityFilter}
                        onChange={(event) => {
                          const nextFilter = event.target.value as ProjectVisibilityFilter;

                          setProjectVisibilityFilterByFolder((current) => ({
                            ...current,
                            [folder.id]: nextFilter,
                          }));

                          controller.setSelectedFolderFile(folder.id, "");
                        }}
                        aria-label="Filter repositories by visibility"
                      >
                        <option value="all">all repositories</option>
                        <option value="public">public only</option>
                        <option value="private">private only</option>
                      </select>
                    </label>
                  ) : null}

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

                  {canUseThreePane ? (
                    <button
                      type="button"
                      className="file-manager-view-btn"
                      onClick={() => {
                        setPaneLayoutByFolder((current) => ({
                          ...current,
                          [folder.id]: {
                            ...(current[folder.id] ?? DEFAULT_FILE_MANAGER_PANE_LAYOUT),
                            isPreviewHidden: !paneLayout.isPreviewHidden,
                          },
                        }));
                      }}
                      aria-label={showPreviewPane ? "Hide details panel" : "Show details panel"}
                    >
                      {showPreviewPane ? "hide details" : "show details"}
                    </button>
                  ) : null}

                  <label className="file-manager-searchbox">
                    <span className="file-manager-search-icon" aria-hidden>
                      &#x2315;
                    </span>
                    <input
                      className="file-manager-search-input"
                      type="text"
                      value={searchText}
                      onChange={(event) => controller.setFolderSearch(folder.id, event.target.value)}
                      placeholder="Search in File Explorer"
                      aria-label="Search files"
                    />
                  </label>
                </div>
              </div>

              <div className="file-manager-split" style={fileManagerSplitStyle}>
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

                {canUseThreePane ? (
                  <button
                    type="button"
                    className="file-manager-pane-splitter is-sidebar"
                    aria-label="Resize left panel"
                    onPointerDown={(event) => handlePaneResizeStart(event, "sidebar")}
                    onPointerMove={handlePaneResizeMove}
                    onPointerUp={handlePaneResizeEnd}
                    onPointerCancel={handlePaneResizeEnd}
                  />
                ) : null}

                <section className="file-manager-main">
                  <p className="file-manager-path">{fileManagerPath}</p>
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
                        onDoubleClick={() => openRow(row)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            openRow(row);
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
                              openRow(row);
                            }}
                          >
                            {row.name}
                          </button>
                        </span>
                        <span className="file-manager-cell">{getKindLabel(row.kind)}</span>
                        <span className="file-manager-cell">{row.size}</span>
                        <span className="file-manager-cell">{row.modified}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="file-manager-status">
                    {isProjectsFolder && !activeProjectRepo && repoLoadState === "ready"
                      ? `${projectRepoRows.length} shown (${repoCounts.public} public / ${repoCounts.private} private total, filter: ${PROJECT_VISIBILITY_FILTER_LABEL[activeProjectVisibilityFilter]})`
                      : `${filteredRows.length}${isProjectRepoOpen ? " files" : " items"}`}
                    {trimmedSearch ? " (filtered)" : ""}
                    {isProjectsFolder && repoLoadState === "error" && repoError ? ` • ${repoError}` : ""}
                  </p>
                </section>

                {showPreviewPane ? (
                  <button
                    type="button"
                    className="file-manager-pane-splitter is-preview"
                    aria-label="Resize details panel"
                    onPointerDown={(event) => handlePaneResizeStart(event, "preview")}
                    onPointerMove={handlePaneResizeMove}
                    onPointerUp={handlePaneResizeEnd}
                    onPointerCancel={handlePaneResizeEnd}
                  />
                ) : null}

                {showPreviewPane ? (
                  <aside className="file-manager-preview" aria-label="Selection preview">
                    {selectedRow ? (
                      <>
                        <p className="file-manager-preview-title">Preview</p>
                        <span className={`file-manager-preview-icon ${selectedRow.tone}`} aria-hidden />
                        <p className="file-manager-preview-name">{selectedRow.name}</p>
                        <dl className="file-manager-preview-meta">
                          <div>
                            <dt>Type</dt>
                            <dd>{getKindLabel(selectedRow.kind)}</dd>
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
                          onClick={() => openRow(selectedRow)}
                        >
                          {isDirectoryKind(selectedRow.kind) ? "Open Directory" : "Open File"}
                        </button>
                      </>
                    ) : (
                      <p className="file-manager-preview-empty">No file selected</p>
                    )}
                  </aside>
                ) : null}
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
