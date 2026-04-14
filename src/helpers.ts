import { FILE_TIMESTAMPS } from "./constants";
import type { FileManagerPlace, FileManagerRow } from "./types";

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const safelySetPointerCapture = (element: Element, pointerId: number) => {
  if (!(element instanceof HTMLElement) || typeof element.setPointerCapture !== "function") {
    return;
  }

  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Ignore capture failures on environments where pointer capture is not active.
  }
};

export const safelyReleasePointerCapture = (element: Element, pointerId: number) => {
  if (
    !(element instanceof HTMLElement) ||
    typeof element.hasPointerCapture !== "function" ||
    typeof element.releasePointerCapture !== "function"
  ) {
    return;
  }

  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release failures to keep drag/resize interactions resilient.
  }
};

export const normalizeLabel = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.slice(dotIndex + 1).toLowerCase();
};

export const getPathExtension = (filePath: string) => {
  const cleanPath = filePath.split(/[?#]/)[0] ?? filePath;
  const dotIndex = cleanPath.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === cleanPath.length - 1) {
    return "";
  }

  return cleanPath.slice(dotIndex + 1).toLowerCase();
};

export const buildFileRows = (files: readonly string[]): FileManagerRow[] => {
  return files.map((fileName, index) => {
    const extension = getFileExtension(fileName);

    if (["mp4", "mov", "mkv"].includes(extension)) {
      return {
        name: fileName,
        kind: "Video",
        size: `${(72 + index * 18.6).toFixed(1)} MB`,
        modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
        tone: "video",
      };
    }

    if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
      return {
        name: fileName,
        kind: "Image",
        size: `${(1.9 + index * 0.7).toFixed(1)} MB`,
        modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
        tone: "image",
      };
    }

    if (["txt", "md", "log"].includes(extension)) {
      return {
        name: fileName,
        kind: "Text",
        size: `${16 + index * 5} KB`,
        modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
        tone: "text",
      };
    }

    if (["zip", "rar", "7z"].includes(extension)) {
      return {
        name: fileName,
        kind: "Archive",
        size: `${(34 + index * 12.2).toFixed(1)} MB`,
        modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
        tone: "archive",
      };
    }

    if (["doc", "docx", "pdf", "html", "htm"].includes(extension)) {
      return {
        name: fileName,
        kind: "Document",
        size: `${(2.8 + index * 1.1).toFixed(1)} MB`,
        modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
        tone: "document",
      };
    }

    return {
      name: fileName,
      kind: "File",
      size: `${(1.2 + index * 0.8).toFixed(1)} MB`,
      modified: FILE_TIMESTAMPS[index % FILE_TIMESTAMPS.length],
      tone: "generic",
    };
  });
};

export const filterRowsByPlace = (rows: FileManagerRow[], place: FileManagerPlace): FileManagerRow[] => {
  if (place === "home") {
    return rows;
  }

  if (place === "desktop") {
    const desktopRows = rows.filter((row) => row.kind === "Image" || row.kind === "Video");
    return desktopRows.length > 0 ? desktopRows : rows;
  }

  if (place === "documents") {
    const documentRows = rows.filter((row) => row.kind === "Document" || row.kind === "Text");
    return documentRows.length > 0 ? documentRows : rows;
  }

  if (place === "downloads") {
    const downloadRows = rows.filter((row) => row.kind === "Archive" || row.kind === "Document");
    return downloadRows.length > 0 ? downloadRows : rows;
  }

  const favoriteRows = rows.slice(0, Math.min(2, rows.length));
  return favoriteRows.length > 0 ? favoriteRows : rows;
};
