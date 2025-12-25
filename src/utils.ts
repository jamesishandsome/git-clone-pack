import type { RepoInfo } from './types.js'

/**
 * Normalize a repo string.
 */
export function normalize(repo: string): RepoInfo {
  let regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/
  let match = regex.exec(repo)

  if (match) {
    const url = match[2]
    const directCheckout = match[3] || 'master'

    return {
      type: 'direct',
      origin: null,
      url: url,
      checkout: directCheckout
    }
  } else {
    regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/
    match = regex.exec(repo)

    if (!match) {
        // If no match, we assume it's a direct url or invalid
        // For now, let's treat it as direct if it looks like a url, otherwise error
        if (/^(https?|git):/.test(repo)) {
             return {
                type: 'direct',
                origin: null,
                url: repo,
                checkout: 'master'
             }
        }
        throw new Error(`Invalid repository string: ${repo}`)
    }

    const type = (match[1] || 'github') as RepoInfo['type']
    let origin = match[2] || null
    const owner = match[3]
    const name = match[4]
    const checkout = match[5] || 'master'

    if (origin == null) {
      if (type === 'github') {
        origin = 'github.com'
      } else if (type === 'gitlab') {
        origin = 'gitlab.com'
      } else if (type === 'bitbucket') {
        origin = 'bitbucket.org'
      }
    }

    return {
      type,
      origin,
      owner,
      name,
      checkout
    }
  }
}

/**
 * Adds protocol to url if none specified
 */
export function addProtocol(origin: string, clone: boolean): string {
  if (!/^(f|ht)tps?:\/\//i.test(origin) && !/^git@/i.test(origin)) {
    // Always use https unless it's already http/https or git@
    origin = 'https://' + origin
  }

  return origin
}

/**
 * Return a zip or git url for a given `repo`.
 */
export function getUrl(repo: RepoInfo, clone: boolean): string {
  let url: string

  // If direct, use the url as is (but direct usually handled separately in normalize)
  if (repo.type === 'direct') {
      return repo.url!
  }

  // Get origin with protocol and add trailing slash or colon (for ssh)
  let origin = addProtocol(repo.origin!, clone)
  
  if (/^git@/i.test(origin)) {
    origin = origin + ':'
  } else {
    origin = origin + '/'
  }

  // Build url
  if (clone) {
    url = origin + repo.owner + '/' + repo.name + '.git'
  } else {
    if (repo.type === 'github') {
      url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip'
    } else if (repo.type === 'gitlab') {
      url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout
    } else if (repo.type === 'bitbucket') {
      url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip'
    } else {
        // Fallback
        url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip'
    }
  }

  return url
}
