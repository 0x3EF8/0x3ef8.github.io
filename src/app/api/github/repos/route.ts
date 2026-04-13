import { NextResponse } from "next/server";

type GitHubApiRepo = {
  name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
  };
};

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 300;

const PER_PAGE = 100;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "0x3ef8-portfolio",
});

const fetchAllRepos = async (token: string) => {
  const repos: GitHubApiRepo[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const url = `https://api.github.com/user/repos?per_page=${PER_PAGE}&page=${page}&sort=updated&direction=desc&visibility=all&affiliation=owner`;

    const response = await fetch(url, {
      headers: getHeaders(token),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const batch = (await response.json()) as GitHubApiRepo[];
    repos.push(...batch);

    if (batch.length < PER_PAGE) {
      break;
    }
  }

  return repos;
};

export async function GET() {
  const token = process.env.GH_TOKEN;

  if (!token) {
    return NextResponse.json({ message: "GitHub token is not configured" }, { status: 503 });
  }

  try {
    const repos = await fetchAllRepos(token);

    const normalized = repos
      .map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        private: repo.private,
        description: repo.description ?? "",
        language: repo.language ?? "Unknown",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        updatedAt: repo.updated_at,
        htmlUrl: repo.html_url,
        defaultBranch: repo.default_branch,
      }))
      .sort((a, b) => {
        if (a.private !== b.private) {
          return Number(a.private) - Number(b.private);
        }

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    const counts = {
      total: normalized.length,
      public: normalized.filter((repo) => !repo.private).length,
      private: normalized.filter((repo) => repo.private).length,
    };

    return NextResponse.json({
      repos: normalized,
      counts,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ message: "Unable to fetch GitHub repositories" }, { status: 502 });
  }
}
