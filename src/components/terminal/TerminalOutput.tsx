import type { TerminalColorPreset, TerminalLine } from "../../types";

type TerminalOutputProps = {
  lines: TerminalLine[];
  prompt: string;
  colorPresets: TerminalColorPreset[];
  activePresetIndex: number;
  onSelectPreset: (index: number) => void;
};

export function TerminalOutput({
  lines,
  prompt,
  colorPresets,
  activePresetIndex,
  onSelectPreset,
}: TerminalOutputProps) {
  return (
    <>
      {lines.map((line) => {
        if (line.kind === "input") {
          return (
            <p key={line.id} className="terminal-line terminal-line-input">
              <span className="terminal-prompt">{prompt}</span>
              <span>{line.text}</span>
            </p>
          );
        }

        if (line.kind === "neofetch") {
          return (
            <div key={line.id} className="terminal-line terminal-line-neofetch">
              <pre className="terminal-neofetch-text">{line.text}</pre>
            </div>
          );
        }

        if (line.kind === "color-help") {
          return (
            <div key={line.id} className="terminal-line terminal-line-color-help">
              <p className="terminal-color-help-title">{line.text}</p>
              <div className="terminal-color-row" role="group" aria-label="Terminal color presets">
                <span className="terminal-color-label">Colors:</span>
                {colorPresets.map((preset, index) => (
                  <button
                    key={`terminal-color-${index}`}
                    type="button"
                    className={`terminal-color-chip${activePresetIndex === index ? " is-active" : ""}`}
                    onClick={() => onSelectPreset(index)}
                    aria-label={`Apply color preset ${index}`}
                  >
                    <span
                      className="terminal-color-swatch"
                      aria-hidden
                      style={{ backgroundColor: preset.accent }}
                    />
                    [{index}]
                  </button>
                ))}
              </div>
            </div>
          );
        }

        return (
          <p key={line.id} className={`terminal-line terminal-line-${line.kind}`}>
            {line.text}
          </p>
        );
      })}
    </>
  );
}
