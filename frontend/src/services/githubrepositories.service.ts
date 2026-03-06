import axios from "axios"

// ── Helpers ──────────────────────────────────────────────────
function parseRepoUrl(url: string): { owner: string; repo: string } {
    const parts = url.trim().replace(/\/$/, "").split("github.com/")[1]?.split("/")
    if (!parts || parts.length < 2) throw new Error("URL inválida")
    return { owner: parts[0], repo: parts[1] }
}

// ── Types ─────────────────────────────────────────────────────
export type GithubCommit = {
    sha: string
    html_url: string
    commit: {
        message: string
        author: {
            name: string
            date: string
        }
    }
    author: {
        login: string
        avatar_url: string
        html_url: string
    } | null
}

export type GithubRepo = {
    name: string
    full_name: string
    description: string | null
    html_url: string
    stargazers_count: number
    forks_count: number
    open_issues_count: number
    language: string | null
    default_branch: string
    updated_at: string
    visibility: string
}

export type GithubBranch = {
    name: string
    commit: { sha: string; url: string }
    protected: boolean
}

export type GithubContributor = {
    login: string
    avatar_url: string
    html_url: string
    contributions: number
}

// ── API calls ─────────────────────────────────────────────────
export async function getCommitsFromRepository(repoUrl: string): Promise<GithubCommit[]> {
    const { owner, repo } = parseRepoUrl(repoUrl)
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`
    )
    return data
}

export async function getRepositoryInfo(repoUrl: string): Promise<GithubRepo> {
    const { owner, repo } = parseRepoUrl(repoUrl)
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`
    )
    return data
}

export async function getBranchesFromRepository(repoUrl: string): Promise<GithubBranch[]> {
    const { owner, repo } = parseRepoUrl(repoUrl)
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=20`
    )
    return data
}

export async function getContributorsFromRepository(repoUrl: string): Promise<GithubContributor[]> {
    const { owner, repo } = parseRepoUrl(repoUrl)
    const { data } = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`
    )
    return data
}

// ── Batch (todos de uma vez) ──────────────────────────────────
export async function getFullRepositoryData(repoUrl: string) {
    const [info, commits, branches, contributors] = await Promise.all([
        getRepositoryInfo(repoUrl),
        getCommitsFromRepository(repoUrl),
        getBranchesFromRepository(repoUrl),
        getContributorsFromRepository(repoUrl),
    ])
    return { info, commits, branches, contributors }
}