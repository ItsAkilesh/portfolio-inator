/**
 * File: git_data_fetcher.mjs
 * Purpose: Fetches GitHub data (pull requests, issues, organisations, pinned and public repositories)
 *          into src/shared/opensource/*.json. Reads GITHUB_TOKEN and GITHUB_USERNAME from .env.
 *          Run with `pnpm fetch-data` or from the admin console's Projects page.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
// Uses the built-in fetch available in Node 18+ (node-fetch is no longer a dependency).
import fs from "fs";
import dotenv from "dotenv";

// dotenv@6 ignores existing env vars and has no `override` option.
// Cursor/shell may already set GITHUB_TOKEN, so clear them first.
delete process.env.GITHUB_TOKEN;
delete process.env.GITHUB_USERNAME;
dotenv.config();

const openSource = {
  githubConvertedToken: (process.env.GITHUB_TOKEN || "").trim(),
  githubUserName: (process.env.GITHUB_USERNAME || "").trim(),
};

if (!openSource.githubConvertedToken || !openSource.githubUserName) {
  console.error(
    "Missing GITHUB_TOKEN or GITHUB_USERNAME in .env. Add both and try again."
  );
  process.exit(1);
}

const query_pr = {
  query: `
	query {
	  user(login: "${openSource.githubUserName}"){
	    pullRequests(last: 100, orderBy: {field: CREATED_AT, direction: DESC}){
      totalCount
      nodes{
        id
        title
        url
        state
	      mergedBy {
	          avatarUrl
	          url
	          login
	      }
	      createdAt
	      number
        changedFiles
	      additions
	      deletions
        baseRepository {
	          name
	          url
	          owner {
	            avatarUrl
	            login
	            url
	          }
	        }
      }
    }
	}
}
	`,
};

const query_issue = {
  query: `query{

		user(login: "${openSource.githubUserName}") {
    issues(last: 100, orderBy: {field:CREATED_AT, direction: DESC}){
      totalCount
      nodes{
      	id
        closed
        title
        createdAt
        url
        number
        assignees(first:100){
          nodes{
            avatarUrl
            name
            url
          }
        }
        repository{
          name
          url
          owner{
            login
            avatarUrl
            url
          }
        }
      }
    }
  }

	}`,
};

const query_org = {
  query: `query{
	user(login: "${openSource.githubUserName}") {
	    repositoriesContributedTo(last: 100){
	      totalCount
	      nodes{
	        owner{
	          login
	          avatarUrl
	          __typename
	        }
	      }
	    }
	  }
	}`,
};

const query_pinned_projects = {
  query: `
	query { 
	  user(login: "${openSource.githubUserName}") { 
	    pinnedItems(first: 6, types: REPOSITORY) {
	      totalCount
	      nodes{
	        ... on Repository{
	          id
		          name
		          createdAt,
		          url,
		          description,
		          isFork,
		          languages(first:10){
		            nodes{
		              name
		            }
		          }
	        }
	      }
		  }
	  }
	}
	`,
};

const baseUrl = "https://api.github.com/graphql";

const headers = {
  "Content-Type": "application/json",
  Authorization: "bearer " + openSource.githubConvertedToken,
};

function formatError(error) {
  if (!error) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function parseGraphQL(txt, label) {
  let data;
  try {
    data = JSON.parse(txt);
  } catch {
    throw new Error(`${label}: invalid JSON response: ${txt.slice(0, 200)}`);
  }

  if (data.message) {
    throw new Error(`${label}: ${data.message}`);
  }

  if (data.errors?.length) {
    throw new Error(
      `${label}: ${data.errors.map((e) => e.message).join("; ")}`
    );
  }

  if (!data.data?.user) {
    throw new Error(
      `${label}: user "${openSource.githubUserName}" not found or unauthorized`
    );
  }

  return data;
}

function writeJson(path, value) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(value), (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function fetchPullRequests() {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(query_pr),
  });
  const txt = await response.text();
  const data = parseGraphQL(txt, "Pull requests");
  const cropped = { data: data.data.user.pullRequests.nodes };

  let open = 0;
  let closed = 0;
  let merged = 0;
  for (let i = 0; i < cropped.data.length; i++) {
    if (cropped.data[i].state === "OPEN") open++;
    else if (cropped.data[i].state === "MERGED") merged++;
    else closed++;
  }

  cropped.open = open;
  cropped.closed = closed;
  cropped.merged = merged;
  cropped.totalCount = cropped.data.length;

  await writeJson("./src/shared/opensource/pull_requests.json", cropped);
  console.log("Fetched pull request data.");
}

async function fetchIssues() {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(query_issue),
  });
  const txt = await response.text();
  const data = parseGraphQL(txt, "Issues");
  const cropped = { data: data.data.user.issues.nodes };

  let open = 0;
  let closed = 0;
  for (let i = 0; i < cropped.data.length; i++) {
    if (cropped.data[i].closed === false) open++;
    else closed++;
  }

  cropped.open = open;
  cropped.closed = closed;
  cropped.totalCount = cropped.data.length;

  await writeJson("./src/shared/opensource/issues.json", cropped);
  console.log("Fetched issues data.");
}

async function fetchOrganizations() {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(query_org),
  });
  const txt = await response.text();
  const data = parseGraphQL(txt, "Organizations");
  const orgs = data.data.user.repositoriesContributedTo.nodes;
  const newOrgs = { data: [] };

  for (let i = 0; i < orgs.length; i++) {
    const obj = orgs[i].owner;
    if (obj.__typename === "Organization") {
      let flag = 0;
      for (let j = 0; j < newOrgs.data.length; j++) {
        if (JSON.stringify(obj) === JSON.stringify(newOrgs.data[j])) {
          flag = 1;
          break;
        }
      }
      if (flag === 0) {
        newOrgs.data.push(obj);
      }
    }
  }

  await writeJson("./src/shared/opensource/organizations.json", newOrgs);
  console.log("Fetched contributed organization data.");
}

const query_repositories = {
  query: `
	query {
	  user(login: "${openSource.githubUserName}") {
	    repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
	      nodes {
	        id
	        name
	        createdAt
	        url
	        description
	        isFork
	        stargazerCount
	        languages(first: 10) { nodes { name } }
	      }
	    }
	  }
	}
	`,
};

/** Keeps the fields the site reads; language names are mapped to icons by the site's content. */
function toProject(node, isPinned) {
  return {
    id: node.id,
    name: node.name,
    createdAt: node.createdAt,
    url: node.url,
    description: node.description ?? "",
    isFork: node.isFork === true,
    stars: node.stargazerCount ?? 0,
    isPinned,
    languages: (node.languages?.nodes ?? []).map((lang) => ({ name: lang.name })),
  };
}

async function graphQL(query, label) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(query),
  });
  return parseGraphQL(await response.text(), label);
}

/**
 * Pinned repositories first (the site shows these by default), then the rest of the public
 * repositories so the admin console can choose others.
 */
async function fetchProjects() {
  const [pinned, owned] = await Promise.all([
    graphQL(query_pinned_projects, "Pinned projects"),
    graphQL(query_repositories, "Repositories"),
  ]);
  const pinnedNodes = pinned.data.user.pinnedItems.nodes.filter((n) => n?.id);
  const pinnedIds = new Set(pinnedNodes.map((n) => n.id));
  const others = owned.data.user.repositories.nodes.filter((n) => n?.id && !pinnedIds.has(n.id));
  const data = [
    ...pinnedNodes.map((n) => toProject(n, true)),
    ...others.map((n) => toProject(n, false)),
  ];
  await writeJson("./src/shared/opensource/projects.json", { data });
  console.log(`Fetched ${pinnedNodes.length} pinned and ${others.length} other repositories.`);
}

try {
  await Promise.all([
    fetchPullRequests(),
    fetchIssues(),
    fetchOrganizations(),
    fetchProjects(),
  ]);
  console.log("Done.");
} catch (error) {
  console.error(formatError(error));
  process.exit(1);
}
