type GitHubRepoDetail = {
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
};

type GitHubReadme = {
  content?: string;
  encoding?: string;
};

type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author?: {
      date?: string;
      name?: string;
    };
  };
};

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 300;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "0x3ef8-portfolio",
});

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDateTime = (value: string) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderLayout = (title: string, command: string, body: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --bg: #070b12;
        --panel: rgba(12, 18, 28, 0.84);
        --border: rgba(115, 145, 186, 0.32);
        --text: #e7f0ff;
        --muted: #a6b8d5;
        --accent: #21d0ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(1200px 700px at 80% -10%, rgba(38, 105, 210, 0.2), transparent 62%),
          radial-gradient(900px 600px at 5% 110%, rgba(17, 176, 217, 0.13), transparent 70%),
          var(--bg);
        color: var(--text);
        font-family: "Space Grotesk", "Segoe UI", sans-serif;
      }

      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 1.2rem 1rem 2.4rem;
      }

      .terminal {
        border-radius: 0.9rem;
        border: 1px solid var(--border);
        background: linear-gradient(180deg, rgba(8, 13, 21, 0.9), rgba(7, 12, 19, 0.84));
        box-shadow:
          0 1.2rem 2.8rem rgba(0, 0, 0, 0.46),
          inset 0 1px 0 rgba(182, 212, 255, 0.18);
        overflow: hidden;
      }

      .terminal-head {
        padding: 0.68rem 0.85rem;
        border-bottom: 1px solid rgba(131, 154, 191, 0.3);
        background: rgba(14, 20, 31, 0.8);
      }

      .terminal-command {
        margin: 0;
        font-family: "JetBrains Mono", "Consolas", monospace;
        font-size: 0.8rem;
        color: #7ce8ff;
      }

      .terminal-body {
        padding: 1rem;
      }

      .card {
        border-radius: 0.86rem;
        border: 1px solid var(--border);
        background: var(--panel);
        padding: 0.9rem 1rem 1rem;
      }

      .card + .card {
        margin-top: 0.8rem;
      }

      h1 {
        margin: 0;
        font-size: 1.6rem;
      }

      h2 {
        margin: 0 0 0.65rem;
        font-size: 1.02rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      p,
      li,
      td,
      th {
        color: #d4e3fa;
        line-height: 1.65;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.34rem 0.3rem;
        text-align: left;
        border-bottom: 1px solid rgba(125, 151, 191, 0.24);
        font-size: 0.86rem;
      }

      .muted {
        color: var(--muted);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .chip {
        border-radius: 999px;
        border: 1px solid rgba(123, 150, 189, 0.42);
        padding: 0.18rem 0.56rem;
        background: rgba(19, 29, 45, 0.72);
        color: #cbe0ff;
        font-size: 0.76rem;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: "JetBrains Mono", "Consolas", monospace;
        font-size: 0.82rem;
        line-height: 1.6;
        color: #d4e3fa;
      }

      .markdown-output {
        color: #d7e6ff;
        line-height: 1.7;
      }

      .markdown-output > :first-child {
        margin-top: 0;
      }

      .markdown-output > :last-child {
        margin-bottom: 0;
      }

      .markdown-output h1,
      .markdown-output h2,
      .markdown-output h3,
      .markdown-output h4,
      .markdown-output h5,
      .markdown-output h6 {
        margin: 1rem 0 0.6rem;
        color: #eff5ff;
      }

      .markdown-output p,
      .markdown-output li,
      .markdown-output blockquote {
        color: #d7e6ff;
      }

      .markdown-output ul,
      .markdown-output ol {
        padding-left: 1.2rem;
      }

      .markdown-output blockquote {
        margin: 0.75rem 0;
        padding: 0.1rem 0.8rem;
        border-left: 3px solid rgba(127, 172, 230, 0.48);
        background: rgba(18, 28, 43, 0.62);
        border-radius: 0.32rem;
      }

      .markdown-output code {
        font-family: "JetBrains Mono", "Consolas", monospace;
        font-size: 0.82em;
        border-radius: 0.28rem;
        padding: 0.1rem 0.26rem;
        background: rgba(19, 32, 50, 0.78);
      }

      .markdown-output pre {
        margin: 0.8rem 0;
        padding: 0.72rem 0.8rem;
        border-radius: 0.52rem;
        border: 1px solid rgba(122, 155, 199, 0.34);
        background: rgba(12, 20, 32, 0.82);
      }

      .markdown-output pre code {
        background: transparent;
        padding: 0;
      }

      .markdown-output table {
        margin: 0.75rem 0;
      }

      .markdown-output img {
        max-width: 100%;
        border-radius: 0.5rem;
      }

      a {
        color: #9bc5ff;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="terminal">
        <header class="terminal-head">
          <p class="terminal-command">${escapeHtml(command)}</p>
        </header>
        <div class="terminal-body">
          ${body}
        </div>
      </section>
    </main>
  </body>
</html>`;

const compileMarkdownToHtml = async (
  token: string,
  repoFullName: string,
  markdownContent: string,
) => {
  if (!markdownContent.trim()) {
    return "";
  }

  const response = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers: {
      ...getHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: markdownContent,
      mode: "gfm",
      context: repoFullName,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return "";
  }

  return response.text();
};

const renderOverview = (repo: GitHubRepoDetail) => {
  const topics = repo.topics ?? [];

  return renderLayout(
    `${repo.full_name} overview`,
    `gh repo view ${repo.full_name} --web`,
    `<article class="card">
      <h1>${escapeHtml(repo.full_name)}</h1>
      <p class="muted">${escapeHtml(repo.description || "No repository description provided.")}</p>
      <p>
        Visibility: <strong>${repo.private ? "Private" : "Public"}</strong> ·
        Default branch: <strong>${escapeHtml(repo.default_branch)}</strong>
      </p>
      <p>
        <a href="${escapeHtml(repo.html_url)}">Open on GitHub</a>${repo.homepage ? ` · <a href="${escapeHtml(repo.homepage)}">Homepage</a>` : ""}
      </p>
    </article>
    <article class="card">
      <h2>Repository Metrics</h2>
      <table>
        <tbody>
          <tr><th>Primary language</th><td>${escapeHtml(repo.language ?? "Unknown")}</td></tr>
          <tr><th>Stars</th><td>${repo.stargazers_count}</td></tr>
          <tr><th>Forks</th><td>${repo.forks_count}</td></tr>
          <tr><th>Open issues</th><td>${repo.open_issues_count}</td></tr>
          <tr><th>Updated</th><td>${escapeHtml(formatDateTime(repo.updated_at))}</td></tr>
          <tr><th>Last push</th><td>${escapeHtml(formatDateTime(repo.pushed_at))}</td></tr>
        </tbody>
      </table>
    </article>
    <article class="card">
      <h2>Topics</h2>
      ${topics.length > 0 ? `<div class="chips">${topics.map((topic) => `<span class="chip">${escapeHtml(topic)}</span>`).join("")}</div>` : "<p class=\"muted\">No topics defined.</p>"}
    </article>`,
  );
};

const renderReadme = (
  repo: GitHubRepoDetail,
  renderedReadmeHtml: string,
  readmeContent: string,
) =>
  renderLayout(
    `${repo.full_name} readme`,
    `gh repo view ${repo.full_name} --readme`,
    `<article class="card">
      <h1>${escapeHtml(repo.full_name)} README</h1>
      ${renderedReadmeHtml
        ? `<div class="markdown-output">${renderedReadmeHtml}</div>`
        : `<pre>${escapeHtml(readmeContent || "README not available for this repository.")}</pre>`}
      <p class="muted"><a href="${escapeHtml(repo.html_url)}/blob/${escapeHtml(repo.default_branch)}/README.md">Open README.md on GitHub</a></p>
    </article>`,
  );

const renderActivity = (
  repo: GitHubRepoDetail,
  languages: Record<string, number>,
  commits: GitHubCommit[],
) => {
  const languageItems = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return renderLayout(
    `${repo.full_name} activity`,
    `gh api repos/${repo.full_name}/commits`,
    `<article class="card">
      <h1>${escapeHtml(repo.full_name)} activity</h1>
      <p class="muted">Latest commit activity and language usage snapshot.</p>
    </article>
    <article class="card">
      <h2>Recent Commits</h2>
      ${commits.length > 0 ? `<ul>${commits
        .map((commit) => {
          const message = commit.commit.message.split("\n")[0] ?? "(no message)";
          const author = commit.commit.author?.name ?? "Unknown";
          const date = formatDateTime(commit.commit.author?.date ?? "");
          return `<li><strong>${escapeHtml(message)}</strong><br /><span class=\"muted\">${escapeHtml(author)} · ${escapeHtml(date)}</span></li>`;
        })
        .join("")}</ul>` : "<p class=\"muted\">No recent commits found.</p>"}
    </article>
    <article class="card">
      <h2>Languages</h2>
      ${languageItems.length > 0
        ? `<table><thead><tr><th>Language</th><th>Bytes</th></tr></thead><tbody>${languageItems
            .map(([language, bytes]) => `<tr><td>${escapeHtml(language)}</td><td>${bytes.toLocaleString()}</td></tr>`)
            .join("")}</tbody></table>`
        : "<p class=\"muted\">No language data available.</p>"}
    </article>`,
  );
};

const renderError = (title: string, message: string) =>
  renderLayout(
    title,
    "$ github api error",
    `<article class=\"card\"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></article>`,
  );

export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const token = process.env.GH_TOKEN;

  if (!token) {
    return new Response(renderError("Repository unavailable", "GitHub token is not configured."), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const { owner, repo } = await context.params;
  const repoOwner = decodeURIComponent(owner);
  const repoName = decodeURIComponent(repo);
  const view = new URL(request.url).searchParams.get("view") ?? "overview";

  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (!repoResponse.ok) {
      throw new Error("Unable to load repository metadata");
    }

    const repoDetail = (await repoResponse.json()) as GitHubRepoDetail;
    let html = "";

    if (view === "readme") {
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/readme`,
        {
          headers: getHeaders(token),
          cache: "no-store",
        },
      );

      let readmeContent = "README not available for this repository.";
      let renderedReadmeHtml = "";

      if (readmeResponse.ok) {
        const readme = (await readmeResponse.json()) as GitHubReadme;

        if (readme.content && readme.encoding === "base64") {
          readmeContent = Buffer.from(readme.content, "base64").toString("utf8");
          renderedReadmeHtml = await compileMarkdownToHtml(
            token,
            repoDetail.full_name,
            readmeContent,
          );
        }
      }

      html = renderReadme(repoDetail, renderedReadmeHtml, readmeContent);
    } else if (view === "activity") {
      const [languagesResponse, commitsResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/languages`, {
          headers: getHeaders(token),
          cache: "no-store",
        }),
        fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=10`, {
          headers: getHeaders(token),
          cache: "no-store",
        }),
      ]);

      const languages = languagesResponse.ok
        ? ((await languagesResponse.json()) as Record<string, number>)
        : {};
      const commits = commitsResponse.ok ? ((await commitsResponse.json()) as GitHubCommit[]) : [];

      html = renderActivity(repoDetail, languages, commits);
    } else {
      html = renderOverview(repoDetail);
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(
      renderError("Repository unavailable", "Unable to load repository content from GitHub."),
      {
        status: 502,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
