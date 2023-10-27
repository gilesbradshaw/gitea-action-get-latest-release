const core = require('@actions/core');
const github = require('@actions/github');

const { giteaApi } = require("gitea-js");
const fetch = require('cross-fetch');
const repository = core.getInput('repository');
const token = core.getInput('token');
var owner = core.getInput('owner');
var repo = core.getInput('repo');
var excludes = core.getInput('excludes').trim().split(",");

async function run() {
  try {
    const api = new giteaApi(
      github.context.serverUrl,
      {
        token,
        customFetch: fetch,
      },
    );
    
    if (repository) {
      [owner, repo] = repository.split("/");
    }    
    var releases = await api.repos.repoListReleases(owner, repo);
    releases = releases.data;
    if (excludes.includes('prerelease')) {
      releases = releases.filter(x => x.prerelease != true);
    }
    if (excludes.includes('draft')) {
      releases = releases.filter(x => x.draft != true);
    }
    console.log(releases.length)
    console.log(JSON.stringify({ releases }, null, 2))
    if (releases.length) {
      core.setOutput('release', releases[0].tag_name);
      core.setOutput('id', String(releases[0].id));
      core.setOutput('description', String(releases[0].body));
    } else {
      core.setFailed("No valid releases");
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
