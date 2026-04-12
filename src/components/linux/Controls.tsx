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
  return (
    <div className="window-controls" role="group" aria-label="Window controls">
      <button
        type="button"
        className="window-dot window-close"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label={closeLabel}
      />
      <button
        type="button"
        className="window-dot window-minimize"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onMinimize();
        }}
        aria-label={minimizeLabel}
      />
      <button
        type="button"
        className="window-dot window-expand"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onMaximize();
        }}
        aria-label={maximizeLabel}
      />
    </div>
  );
}
