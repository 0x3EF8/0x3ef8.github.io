"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GitHubActivity = {
  id: string;
  kind: "commit" | "pull-request" | "issue" | "release" | "repo" | "general";
  title: string;
  detail: string;
  repo: string;
  url: string;
  occurredAt: string;
};

type GitHubActivityResponse = {
  activity: GitHubActivity;
  actor: string;
  fetchedAt: string;
};

type ToastPayload = {
  activity: GitHubActivity;
  actor: string;
  fetchedAt: string;
};

const POP_DURATION_MS = 6500;
const POP_PULSE_MS = 520;
const POLL_INTERVAL_MS = 5 * 60 * 1000;

const formatRelativeTime = (value: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const elapsedMs = Date.now() - date.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  if (elapsedMinutes < 1) {
    return "just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}m ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours}h ago`;
  }

  return date.toLocaleDateString([], { month: "short", day: "2-digit" });
};

const formatSyncTime = (value: string, actor: string) => {
  if (!value) {
    return "Waiting for GitHub sync";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return actor ? `Synced as ${actor}` : "GitHub synced";
  }

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return actor ? `Synced ${time} as ${actor}` : `Synced ${time}`;
};

export function DesktopGithubNotification() {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const popTimerRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  const clearPopTimer = useCallback(() => {
    if (popTimerRef.current !== null) {
      window.clearTimeout(popTimerRef.current);
      popTimerRef.current = null;
    }
  }, []);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismissNotification = useCallback(() => {
    clearDismissTimer();
    setIsVisible(false);
    setIsPopping(false);
  }, [clearDismissTimer]);

  const showNotification = useCallback(
    (payload: ToastPayload) => {
      setToast(payload);
      setIsVisible(true);

      clearPopTimer();
      setIsPopping(false);

      window.requestAnimationFrame(() => {
        setIsPopping(true);
      });

      popTimerRef.current = window.setTimeout(() => {
        setIsPopping(false);
      }, POP_PULSE_MS);

      clearDismissTimer();
      dismissTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, POP_DURATION_MS);
    },
    [clearDismissTimer, clearPopTimer],
  );

  const loadActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/github/activity", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as GitHubActivityResponse;
      if (!payload?.activity) {
        return;
      }

      showNotification({
        activity: payload.activity,
        actor: payload.actor || "",
        fetchedAt: payload.fetchedAt || "",
      });
    } catch {
      // Silent failure: notifications resume automatically on next poll.
    }
  }, [showNotification]);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadActivity();
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadActivity();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(intervalId);
      clearPopTimer();
      clearDismissTimer();
    };
  }, [clearDismissTimer, clearPopTimer, loadActivity]);

  const occurredText = useMemo(
    () => formatRelativeTime(toast?.activity.occurredAt || ""),
    [toast?.activity.occurredAt],
  );
  const syncText = useMemo(
    () => formatSyncTime(toast?.fetchedAt || "", toast?.actor || ""),
    [toast?.actor, toast?.fetchedAt],
  );

  if (!isVisible || !toast) {
    return null;
  }

  return (
    <aside
      className={`desktop-github-toast${isPopping ? " is-popping" : ""}`}
      aria-live="polite"
      aria-label="Latest GitHub activity"
    >
      <div className="desktop-github-toast-head">
        <p className="desktop-github-toast-eyebrow">GitHub activity</p>
        <button
          type="button"
          className="desktop-github-toast-close"
          onClick={dismissNotification}
          aria-label="Dismiss GitHub notification"
        >
          ×
        </button>
      </div>

      <div className="desktop-github-toast-content">
        <h2 className="desktop-github-toast-title">{toast.activity.title}</h2>
        <p className="desktop-github-toast-detail">{toast.activity.detail}</p>
        <p className="desktop-github-toast-meta">
          {toast.activity.repo} | {occurredText}
        </p>

        <div className="desktop-github-toast-actions">
          <a
            className="desktop-github-toast-link"
            href={toast.activity.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open on GitHub
          </a>
        </div>

        <p className="desktop-github-toast-sync">{syncText}</p>
      </div>
    </aside>
  );
}
