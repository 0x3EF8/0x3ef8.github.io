export type FolderId = "dumps" | "wishlist" | "content" | "favorites";

export type LinuxSurfaceId = FolderId | "terminal" | "viewer" | "vim";

export type LinuxSurfacePosition = {
  x: number;
  y: number;
};

export type LinuxSurfaceSize = {
  width: number;
  height: number;
};

export type DragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

export type ResizeState = {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  leftInStage: number;
  topInStage: number;
};

export type TerminalLineKind = "input" | "output" | "error" | "system" | "neofetch" | "color-help";

export type TerminalLine = {
  id: number;
  kind: TerminalLineKind;
  text: string;
};

export type FileTone = "video" | "image" | "text" | "archive" | "document" | "generic";

export type FileManagerRow = {
  name: string;
  kind: string;
  size: string;
  modified: string;
  tone: FileTone;
};

export type FileManagerPlace = "home" | "desktop" | "documents" | "downloads" | "favorites";

export type FileManagerView = "list" | "grid";

export type PortfolioFileProfile = {
  title: string;
  summary: string;
  realFilePath: string;
};

export type OpenedPortfolioFile = {
  folderName: string;
  name: string;
  kind: string;
  title: string;
  summary: string;
  path: string;
};

export type ViewerContentStatus = "idle" | "loading" | "ready" | "error";

export type TerminalColorPreset = {
  accent: string;
  prompt: string;
  text: string;
  system: string;
  error: string;
  glow: string;
  neofetchGlow: string;
};

export type FolderDefinition = {
  id: FolderId;
  name: string;
  tone: "charcoal" | "silver" | "steel" | "ink";
  position: "folder-1" | "folder-2" | "folder-3" | "folder-4";
  surfacePosition: "window-1" | "window-2" | "window-3" | "window-4";
  files: readonly string[];
};

export type FileManagerPlaceItem = {
  id: FileManagerPlace;
  label: string;
  glyph: string;
};
