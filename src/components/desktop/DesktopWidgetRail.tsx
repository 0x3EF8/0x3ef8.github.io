"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WakaLanguage = {
  name: string;
  percent: number;
  percentLabel: string;
  time: string;
};

type WakaTimeStats = {
  total: string;
  dailyAverage: string;
  topLanguage: string;
  topLanguagePercent: string;
  topEditor: string;
  topEditorPercent: string;
  topOs: string;
  topOsPercent: string;
  languages: WakaLanguage[];
  updatedAt: string;
};

type LoadState = "idle" | "loading" | "ready" | "error";

const POLL_INTERVAL_MS = 15 * 60 * 1000;

export function DesktopWidgetRail() {
  const [state, setState] = useState<LoadState>("idle");
  const [stats, setStats] = useState<WakaTimeStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setStatusMessage("");
      setState((current) => (current === "ready" ? current : "loading"));
      setIsRefreshing(true);

      const response = await fetch("/api/wakatime", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load WakaTime stats");
      }

      const payload = (await response.json()) as WakaTimeStats;
      setStats(payload);
      setState("ready");
      setStatusMessage("Live sync active");
    } catch {
      setState((current) => (current === "ready" ? "ready" : "error"));
      setStatusMessage("Using last successful sync");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();

    const intervalId = window.setInterval(() => {
      void loadStats();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadStats]);

  const updatedText = useMemo(() => {
    if (!stats?.updatedAt) {
      return "--";
    }

    return new Date(stats.updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [stats?.updatedAt]);

  return (
    <aside className="desktop-widget-rail" aria-label="Desktop widgets">
      <article className="desktop-widget wakatime-widget">
        <header className="desktop-widget-header is-compact">
          <div>
            <p className="desktop-widget-eyebrow">Engineering Pulse</p>
            <h2 className="desktop-widget-title">WakaTime Insights</h2>
          </div>
          <p className="desktop-widget-badge">LIVE</p>
        </header>

        {state === "loading" || state === "idle" ? (
          <div className="desktop-widget-loading" aria-live="polite">
            <p className="desktop-widget-message">Loading activity...</p>
            <div className="desktop-widget-skeleton" />
            <div className="desktop-widget-skeleton" />
            <div className="desktop-widget-skeleton short" />
          </div>
        ) : null}

        {state === "error" ? (
          <div className="desktop-widget-message-wrap">
            <p className="desktop-widget-message is-error">Unable to load WakaTime data.</p>
            <button type="button" className="desktop-widget-refresh" onClick={() => void loadStats()}>
              Retry
            </button>
          </div>
        ) : null}

        {state === "ready" && stats ? (
          <div className="desktop-widget-content">
            <div className="desktop-widget-kpis">
              <div className="desktop-widget-kpi-card">
                <span className="desktop-widget-label">Last 7 Days</span>
                <strong className="desktop-widget-value">{stats.total}</strong>
              </div>
              <div className="desktop-widget-kpi-card">
                <span className="desktop-widget-label">Daily Avg</span>
                <strong className="desktop-widget-value">{stats.dailyAverage}</strong>
              </div>
            </div>

            <div className="desktop-widget-row">
              <span className="desktop-widget-label">Top Focus</span>
              <strong className="desktop-widget-value">
                {stats.topLanguage} ({stats.topLanguagePercent})
              </strong>
            </div>

            <div className="desktop-widget-row">
              <span className="desktop-widget-label">Language Distribution</span>
              <div className="desktop-widget-language-list">
                {stats.languages.map((language) => (
                  <div key={language.name} className="desktop-widget-language-item">
                    <div className="desktop-widget-language-head">
                      <span>{language.name}</span>
                      <span>
                        {language.percentLabel} · {language.time}
                      </span>
                    </div>
                    <div className="desktop-widget-meter">
                      <span
                        className="desktop-widget-meter-fill"
                        style={{ width: `${Math.max(4, language.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="desktop-widget-row is-split">
              <span className="desktop-widget-label">Environment</span>
              <strong className="desktop-widget-value">
                Editor: {stats.topEditor} ({stats.topEditorPercent})
                <br />
                OS: {stats.topOs} ({stats.topOsPercent})
              </strong>
            </div>

            <div className="desktop-widget-footer">
              <p className="desktop-widget-updated">Updated {updatedText}</p>
              <button
                type="button"
                className="desktop-widget-refresh"
                onClick={() => void loadStats()}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Syncing..." : "Refresh"}
              </button>
            </div>

            {statusMessage ? <p className="desktop-widget-status">{statusMessage}</p> : null}
          </div>
        ) : null}
      </article>
    </aside>
  );
}
