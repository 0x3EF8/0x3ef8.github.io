import { FOLDERS } from "../../constants";
import type { FolderId } from "../../types";

type DesktopFoldersProps = {
  activeFolderId: FolderId;
  onOpenFolder: (folderId: FolderId) => void;
};

export function DesktopFolders({ activeFolderId, onOpenFolder }: DesktopFoldersProps) {
  return (
    <>
      {FOLDERS.map((folder) => (
        <button
          key={folder.id}
          type="button"
          onClick={() => onOpenFolder(folder.id)}
          aria-pressed={activeFolderId === folder.id}
          className={`folder-card ${folder.tone} ${folder.position}${
            activeFolderId === folder.id ? " is-active" : ""
          }`}
        >
          <div className="folder-icon" aria-hidden />
          <span className="folder-label">{folder.name}</span>
        </button>
      ))}
    </>
  );
}
