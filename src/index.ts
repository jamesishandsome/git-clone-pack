import { normalize, getUrl } from './utils.js'
import { gitClone, downloadZip } from './strategies.js'
import type { DownloadOptions } from './types.js'

/**
 * Download `repo` to `dest`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} [opts]
 */
export default async function download(repo: string, dest: string, opts: DownloadOptions = {}): Promise<void> {
  const clone = opts.clone || false
  
  // Normalize repo
  const repoObj = normalize(repo)
  const url = repoObj.url || getUrl(repoObj, clone)
  
  if (clone) {
    await gitClone(url, dest, repoObj.checkout, opts)
  } else {
    const downloadOptions = {
      strip: 1,
      ...opts,
      headers: {
        accept: 'application/zip',
        ...(opts.headers || {})
      }
    }
    await downloadZip(url, dest, downloadOptions)
  }
}

// Re-export types
export * from './types.js'
export { normalize, getUrl } from './utils.js'
