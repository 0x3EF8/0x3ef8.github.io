import { useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

type ControlsProps = {
  closeLabel: string;
  minimizeLabel: string;
  maximizeLabel: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
};

export function Controls({
  closeLabel,
  minimizeLabel,
  maximizeLabel,
  onClose,
  onMinimize,
  onMaximize,
}: ControlsProps) {
  const consumedPointerActivationRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handlePointerUp = (
    event: PointerEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.stopPropagation();

    if (event.pointerType === "mouse") {
      return;
    }

    // Trigger actions directly for touch/pen because click synthesis can be unreliable on compact layouts.
    event.preventDefault();
    consumedPointerActivationRef.current = true;
    action();
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.stopPropagation();

    if (consumedPointerActivationRef.current) {
      consumedPointerActivationRef.current = false;
      return;
    }

    action();
  };

  return (
    <div className="window-controls" role="group" aria-label="Window controls">
      <button
        type="button"
        className="window-dot window-close"
        onPointerDown={handlePointerDown}
        onPointerUp={(event) => handlePointerUp(event, onClose)}
        onClick={(event) => handleClick(event, onClose)}
        aria-label={closeLabel}
      />
      <button
        type="button"
        className="window-dot window-minimize"
        onPointerDown={handlePointerDown}
        onPointerUp={(event) => handlePointerUp(event, onMinimize)}
        onClick={(event) => handleClick(event, onMinimize)}
        aria-label={minimizeLabel}
      />
      <button
        type="button"
        className="window-dot window-expand"
        onPointerDown={handlePointerDown}
        onPointerUp={(event) => handlePointerUp(event, onMaximize)}
        onClick={(event) => handleClick(event, onMaximize)}
        aria-label={maximizeLabel}
      />
    </div>
  );
}
