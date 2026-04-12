type DesktopTopBarProps = {
  dockTime: string;
  onOpenTerminal: () => void;
};

export function DesktopTopBar({ dockTime, onOpenTerminal }: DesktopTopBarProps) {
  return (
    <header className="linux-topbar" aria-label="Linux top panel">
      <div className="linux-topbar-left">
        <button type="button" className="linux-panel-button" aria-label="Activities">
          Activities
        </button>
        <button
          type="button"
          className="linux-panel-button"
          onClick={onOpenTerminal}
          aria-label="Open terminal"
        >
          Terminal
        </button>
      </div>

      <p className="linux-topbar-center">{dockTime}</p>

      <div className="linux-topbar-right">
        <span className="linux-status-item">NET</span>
        <span className="linux-status-item">VOL</span>
        <span className="linux-status-item">PWR</span>
      </div>
    </header>
  );
}
