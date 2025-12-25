# git-clone-pack

[![NPM Version](https://img.shields.io/npm/v/git-clone-pack.svg?style=flat-square)](https://www.npmjs.com/package/git-clone-pack)
[![NPM Downloads](https://img.shields.io/npm/dm/git-clone-pack.svg?style=flat-square)](https://www.npmjs.com/package/git-clone-pack)
[![License](https://img.shields.io/npm/l/git-clone-pack.svg?style=flat-square)](https://github.com/jamesishandsome/git-clone-pack/blob/master/LICENSE)
[![TypeScript](https://img.shields.io/badge/written%20in-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

**git-clone-pack** is a modern, Promise-based utility to download and extract git repositories. It serves as a robust successor to older tools, rewritten in TypeScript with modern tooling (Bun, execa) and improved error handling.

It supports downloading via **HTTP download (zip)** or **git clone**, working seamlessly with GitHub, GitLab, and Bitbucket, as well as custom repository URLs.

## Features

- 🚀 **Modern & Fast**: Built with TypeScript and modern Node.js APIs.
- 📦 **Promise-based**: Fully async/await compatible.
- 🛠 **Flexible Strategies**: Choose between downloading a zip archive (faster) or a full git clone.
- 🌐 **Multi-Provider**: Native support for GitHub, GitLab, and Bitbucket.
- 🔒 **Secure**: Default HTTPS protocol handling.
- 🧹 **Clean**: Automatic cleanup of temporary files.
- 📂 **Filter Support**: Optional extraction filtering (extract only what you need).

## Installation

```bash
# npm
npm install git-clone-pack

# bun
bun add git-clone-pack

# yarn
yarn add git-clone-pack

# pnpm
pnpm add git-clone-pack
```

## Usage

### Basic Usage

```typescript
import download from 'git-clone-pack';

// Download 'master' branch of a GitHub repo to './my-project'
try {
  await download('jamesishandsome/git-clone-pack', './my-project');
  console.log('Done!');
} catch (err) {
  console.error('Failed to download:', err);
}
```

### Advanced Usage with Options

```typescript
import download from 'git-clone-pack';

await download('gitlab:my-gitlab-user/my-repo#v1.0.0', './dist', {
  clone: true, // Use 'git clone' instead of zip download
  filter: (file) => file.path.endsWith('.json'), // Only extract JSON files (zip mode only)
  headers: {
    'Authorization': 'token MY_SECRET_TOKEN' // Custom headers for private repos (zip mode)
  }
});
```

### Supported Source Formats

The `repository` argument accepts a shorthand string:

- **GitHub**: `user/repo` (defaults to master/main)
- **GitHub (branch/tag)**: `user/repo#v1.0.0`
- **GitLab**: `gitlab:user/repo`
- **Bitbucket**: `bitbucket:user/repo`
- **Custom / Direct**: `direct:https://my-server.com/repo.zip` (must provide full URL)

## API

### `download(repository, destination, options?)`

Downloads a git repository to the destination folder.

#### Arguments

- **repository** `string`: The repository string (e.g., `user/repo`).
- **destination** `string`: The local folder path to download/extract to.
- **options** `DownloadOptions` (optional):
    - `clone` (boolean): If `true`, uses `git clone`. If `false` (default), downloads a zip archive.
    - `filter` (function): A function to filter files during extraction (zip mode only). Receives a file object and returns boolean.
    - `headers` (object): Custom HTTP headers for the request.

#### Returns

- `Promise<void>`: Resolves when the download and extraction are complete.

## License

MIT
