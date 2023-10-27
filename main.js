const core = require('@actions/core');
const github = require('@actions/github');

const { giteaApi } = require("gitea-js");
const fetch = require('cross-fetch');
const token = core.getInput('token');
const excludes = core.getInput('excludes').trim().split(",");

async function run() {
  try {
    const api = new giteaApi(
      github.context.serverUrl,
      {
        token,
        customFetch: fetch,
      },
    );
    
    const [owner, repo] = (
      core.getInput('repository')
        || github.context.repository
    ).split("/");

    const releases = (
      await api.repos.repoListReleases(owner, repo)
    )
      .data
      .filter(
        (release) => excludes
          .reduce(
            (acc, exclude) => acc
              && !release[exclude],
            true,
          ),
      );    
    if (releases.length) {
      core.setOutput('release', releases[0].tag_name);
      core.setOutput('id', String(releases[0].id));
      core.setOutput('description', String(releases[0].body));
      // core.setOutput('releases', releases);
    } else {
      core.setFailed("No valid releases");
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
