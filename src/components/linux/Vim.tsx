import type { DesktopController } from "../../hooks/desktop/useDesktopController";
import { Controls } from "./Controls";

type VimProps = {
  controller: DesktopController;
};

export function Vim({ controller }: VimProps) {
  const {
    activeSurfaceId,
    isVimVisible,
    isVimMaximized,
    isVimDragging,
    isVimResizing,
    vimStyle,
    bringAnySurfaceToFront,
    handleVimDragStart,
    handleVimDragMove,
    handleVimDragEnd,
    closeVim,
    minimizeVim,
    toggleMaximizeVim,
    vimMode,
    vimFileName,
    vimIsDirty,
    vimLineNumbersRef,
    vimLineCount,
    vimEditorRef,
    vimBuffer,
    handleVimEditorChange,
    handleVimEditorSelect,
    handleVimEditorScroll,
    handleVimEditorKeyDown,
    handleVimCommandSubmit,
    vimCommandInputRef,
    vimCommandInput,
    setVimCommandInput,
    handleVimCommandInputKeyDown,
    vimStatusMessage,
    vimCursorLine,
    vimCursorColumn,
    vimRelativeLineNumbers,
    handleVimResizeStart,
    handleVimResizeMove,
    handleVimResizeEnd,
    vimShowLineNumbers,
  } = controller;

  if (!isVimVisible) {
    return null;
  }

  const statusLeftText = vimMode === "COMMAND" ? vimCommandInput || ":" : vimStatusMessage;

  return (
    <article
      className={`folder-window vim-window${activeSurfaceId === "vim" ? " is-focused" : ""}${
        isVimMaximized ? " is-maximized" : ""
      }${isVimDragging ? " is-dragging" : ""}${isVimResizing ? " is-resizing" : ""
      }`}
      style={vimStyle}
      onMouseDown={() => bringAnySurfaceToFront("vim")}
    >
      <header
        className="folder-window-bar"
        onPointerDown={handleVimDragStart}
        onPointerMove={handleVimDragMove}
        onPointerUp={handleVimDragEnd}
        onPointerCancel={handleVimDragEnd}
      >
        <Controls
          closeLabel="Close vim"
          minimizeLabel="Minimize vim"
          maximizeLabel={isVimMaximized ? "Restore vim" : "Maximize vim"}
          onClose={closeVim}
          onMinimize={minimizeVim}
          onMaximize={toggleMaximizeVim}
        />
        <p className="folder-window-title">vim - {vimFileName}</p>
        <span className="window-spacer" aria-hidden />
      </header>

      <div className="folder-window-body vim-body">
        <div className="vim-toolbar">
          <span className={`vim-mode-chip ${vimMode.toLowerCase()}`}>{vimMode}</span>
          <p className="vim-file-name">{vimFileName}</p>
          <span className="vim-dirty-flag" aria-live="polite">
            {vimIsDirty ? "[+]" : "[ ]"}
          </span>
        </div>

        <div className="vim-editor-shell">
          {vimShowLineNumbers ? (
            <ol ref={vimLineNumbersRef} className="vim-line-numbers" aria-hidden>
              {Array.from({ length: vimLineCount }, (_, index) => (
                <li key={`vim-line-${index + 1}`}>
                  {vimRelativeLineNumbers
                    ? index + 1 === vimCursorLine
                      ? index + 1
                      : Math.abs(index + 1 - vimCursorLine)
                    : index + 1}
                </li>
              ))}
            </ol>
          ) : null}

          <textarea
            ref={vimEditorRef}
            className="vim-editor"
            value={vimBuffer}
            onChange={handleVimEditorChange}
            onSelect={handleVimEditorSelect}
            onScroll={handleVimEditorScroll}
            onKeyDown={handleVimEditorKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label="Vim editor"
          />
        </div>

        {vimMode === "COMMAND" ? (
          <form className="vim-command-row" onSubmit={handleVimCommandSubmit}>
            <span className="vim-command-prefix">:</span>
            <input
              ref={vimCommandInputRef}
              className="vim-command-input"
              value={vimCommandInput}
              onChange={(event) => setVimCommandInput(event.target.value)}
              onKeyDown={handleVimCommandInputKeyDown}
              placeholder="w, q, q!, wq, set number"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              aria-label="Vim command input"
            />
          </form>
        ) : null}

        <p className="vim-statusline">
          <span>{statusLeftText}</span>
          <span>
            {vimMode}
            {vimRelativeLineNumbers ? " | rnu" : ""}
            {vimShowLineNumbers ? " | nu" : ""} | {vimCursorLine}:{vimCursorColumn}
            {vimIsDirty ? " | modified" : ""}
          </span>
        </p>
      </div>

      <button
        type="button"
        className="window-resizer"
        onPointerDown={handleVimResizeStart}
        onPointerMove={handleVimResizeMove}
        onPointerUp={handleVimResizeEnd}
        onPointerCancel={handleVimResizeEnd}
        aria-label="Resize vim"
      />
    </article>
  );
}
