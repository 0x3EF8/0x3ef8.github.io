import { NextResponse } from "next/server";

type GitHubUser = {
  login: string;
};

type GitHubEvent = {
  id: string;
  type: string;
  repo?: {
    name?: string;
  };
  payload?: unknown;
  created_at: string;
};

type PushPayload = {
  ref?: string;
  commits?: Array<{
    sha: string;
    message: string;
  }>;
};

type PullRequestPayload = {
  action?: string;
  pull_request?: {
    title?: string;
    html_url?: string;
    merged?: boolean;
  };
};

type IssuesPayload = {
  action?: string;
  issue?: {
    title?: string;
    html_url?: string;
  };
};

type ReleasePayload = {
  action?: string;
  release?: {
    name?: string;
    tag_name?: string;
    html_url?: string;
  };
};

type RefPayload = {
  ref_type?: string;
  ref?: string;
};

type NormalizedActivity = {
  id: string;
  kind: "commit" | "pull-request" | "issue" | "release" | "repo" | "general";
  title: string;
  detail: string;
  repo: string;
  url: string;
  occurredAt: string;
};

export const runtime = "nodejs";

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "0x3ef8-portfolio",
});

const squeezeText = (value: string, maxLength = 130) => {
  const singleLine = value.replace(/\s+/g, " ").trim();

  if (singleLine.length <= maxLength) {
    return singleLine;
  }

  return `${singleLine.slice(0, maxLength - 3)}...`;
};

const toBranchName = (ref: string | undefined) => {
  if (!ref) {
    return "";
  }

  const segments = ref.split("/");
  return segments[segments.length - 1] || ref;
};

const toReadableEventType = (eventType: string) =>
  eventType
    .replace(/Event$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();

const fetchJson = async <T>(url: string, token: string) => {
  const response = await fetch(url, {
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

const normalizeEvent = (event: GitHubEvent): NormalizedActivity => {
  const repo = event.repo?.name || "unknown/repo";
  const repoUrl = `https://github.com/${repo}`;
  const occurredAt = event.created_at || new Date().toISOString();
  const id = event.id || `${repo}-${occurredAt}`;

  if (event.type === "PushEvent") {
    const payload = event.payload as PushPayload | undefined;
    const commits = Array.isArray(payload?.commits) ? payload.commits : [];
    const latestCommit = commits.length > 0 ? commits[commits.length - 1] : null;
    const branchName = toBranchName(payload?.ref);

    if (latestCommit) {
      return {
        id,
        kind: "commit",
        title: "Latest commit pushed",
        detail: squeezeText(
          `${branchName ? `[${branchName}] ` : ""}${latestCommit.message || "Repository updated"}`,
        ),
        repo,
        url: `${repoUrl}/commit/${latestCommit.sha}`,
        occurredAt,
      };
    }

    return {
      id,
      kind: "commit",
      title: "Repository updated",
      detail: branchName ? `Updated branch ${branchName}` : "Pushed new changes",
      repo,
      url: repoUrl,
      occurredAt,
    };
  }

  if (event.type === "PullRequestEvent") {
    const payload = event.payload as PullRequestPayload | undefined;
    const actionLabel = payload?.pull_request?.merged ? "merged" : payload?.action || "updated";

    return {
      id,
      kind: "pull-request",
      title: `Pull request ${actionLabel}`,
      detail: squeezeText(payload?.pull_request?.title || "Pull request activity recorded"),
      repo,
      url: payload?.pull_request?.html_url || repoUrl,
      occurredAt,
    };
  }

  if (event.type === "IssuesEvent" || event.type === "IssueCommentEvent") {
    const payload = event.payload as IssuesPayload | undefined;
    const prefix = event.type === "IssueCommentEvent" ? "Issue comment" : "Issue";

    return {
      id,
      kind: "issue",
      title: `${prefix} ${payload?.action || "updated"}`,
      detail: squeezeText(payload?.issue?.title || "Issue activity recorded"),
      repo,
      url: payload?.issue?.html_url || repoUrl,
      occurredAt,
    };
  }

  if (event.type === "ReleaseEvent") {
    const payload = event.payload as ReleasePayload | undefined;
    const releaseName = payload?.release?.name || payload?.release?.tag_name || "new release";

    return {
      id,
      kind: "release",
      title: `Release ${payload?.action || "published"}`,
      detail: squeezeText(releaseName),
      repo,
      url: payload?.release?.html_url || repoUrl,
      occurredAt,
    };
  }

  if (event.type === "CreateEvent" || event.type === "DeleteEvent") {
    const payload = event.payload as RefPayload | undefined;
    const refType = payload?.ref_type || "resource";
    const refName = payload?.ref || repo;
    const verb = event.type === "CreateEvent" ? "created" : "deleted";

    return {
      id,
      kind: "repo",
      title: `Repository ${verb}`,
      detail: squeezeText(`${verb} ${refType} ${refName}`),
      repo,
      url: repoUrl,
      occurredAt,
    };
  }

  return {
    id,
    kind: "general",
    title: `${toReadableEventType(event.type)} detected`,
    detail: `Recent activity in ${repo}`,
    repo,
    url: repoUrl,
    occurredAt,
  };
};

export async function GET() {
  const token = process.env.GH_TOKEN;

  if (!token) {
    return NextResponse.json({ message: "GitHub token is not configured" }, { status: 503 });
  }

  try {
    const user = await fetchJson<GitHubUser>("https://api.github.com/user", token);
    let events: GitHubEvent[] = [];

    try {
      events = await fetchJson<GitHubEvent[]>(
        `https://api.github.com/users/${encodeURIComponent(user.login)}/events/private?per_page=30`,
        token,
      );
    } catch {
      events = await fetchJson<GitHubEvent[]>(
        `https://api.github.com/users/${encodeURIComponent(user.login)}/events?per_page=30`,
        token,
      );
    }

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ message: "No recent GitHub activity was found" }, { status: 404 });
    }

    const activity = normalizeEvent(events[0]);

    return NextResponse.json({
      activity,
      actor: user.login,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ message: "Unable to fetch GitHub activity" }, { status: 502 });
  }
}
