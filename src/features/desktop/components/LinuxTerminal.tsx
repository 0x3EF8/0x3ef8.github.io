import { TERMINAL_COLOR_PRESETS, TERMINAL_PROMPT } from "../constants";
import type { DesktopController } from "../hooks/useDesktopController";
import { TerminalOutput } from "./TerminalOutput";
import { LinuxControls } from "./LinuxControls";

type LinuxTerminalProps = {
  controller: DesktopController;
};

export function LinuxTerminal({ controller }: LinuxTerminalProps) {
  const {
    activeSurfaceId,
    isTerminalMaximized,
    isTerminalDragging,
    isTerminalResizing,
    terminalStyle,
    bringAnySurfaceToFront,
    handleTerminalDragStart,
    handleTerminalDragMove,
    handleTerminalDragEnd,
    closeTerminal,
    minimizeTerminal,
    toggleMaximizeTerminal,
    terminalScrollRef,
    terminalLines,
    terminalColorPresetIndex,
    setTerminalColorPresetIndex,
    handleTerminalSubmit,
    terminalInputRef,
    terminalInput,
    setTerminalInput,
    handleTerminalInputKeyDown,
    handleTerminalResizeStart,
    handleTerminalResizeMove,
    handleTerminalResizeEnd,
  } = controller;

  return (
    <article
      className={`folder-window terminal-window${
        activeSurfaceId === "terminal" ? " is-focused" : ""
      }${isTerminalMaximized ? " is-maximized" : ""}${
        isTerminalDragging ? " is-dragging" : ""
      }${isTerminalResizing ? " is-resizing" : ""}`}
      style={terminalStyle}
      onMouseDown={() => bringAnySurfaceToFront("terminal")}
    >
      <header
        className="folder-window-bar"
        onPointerDown={handleTerminalDragStart}
        onPointerMove={handleTerminalDragMove}
        onPointerUp={handleTerminalDragEnd}
        onPointerCancel={handleTerminalDragEnd}
      >
        <LinuxControls
          closeLabel="Close terminal"
          minimizeLabel="Minimize terminal"
          maximizeLabel={isTerminalMaximized ? "Restore terminal" : "Maximize terminal"}
          onClose={closeTerminal}
          onMinimize={minimizeTerminal}
          onMaximize={toggleMaximizeTerminal}
        />
        <p className="folder-window-title">terminal</p>
        <span className="window-spacer" aria-hidden />
      </header>

      <div ref={terminalScrollRef} className="folder-window-body terminal-body">
        <TerminalOutput
          lines={terminalLines}
          prompt={TERMINAL_PROMPT}
          colorPresets={TERMINAL_COLOR_PRESETS}
          activePresetIndex={terminalColorPresetIndex}
          onSelectPreset={setTerminalColorPresetIndex}
        />

        <form className="terminal-input-row" onSubmit={handleTerminalSubmit}>
          <span className="terminal-prompt">{TERMINAL_PROMPT}</span>
          <input
            ref={terminalInputRef}
            value={terminalInput}
            onChange={(event) => setTerminalInput(event.target.value)}
            onKeyDown={handleTerminalInputKeyDown}
            className="terminal-input"
            placeholder="type a command"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
        </form>
      </div>

      <button
        type="button"
        className="window-resizer"
        onPointerDown={handleTerminalResizeStart}
        onPointerMove={handleTerminalResizeMove}
        onPointerUp={handleTerminalResizeEnd}
        onPointerCancel={handleTerminalResizeEnd}
        aria-label="Resize terminal"
      />
    </article>
  );
}
