export interface RepoInfo {
  type: 'github' | 'gitlab' | 'bitbucket' | 'direct';
  origin: string | null;
  owner?: string;
  name?: string;
  checkout: string;
  url?: string;
}

export interface DownloadOptions {
  /**
   * If true, use `git clone` instead of downloading an archive.
   * Default: false
   */
  clone?: boolean;
  
  /**
   * Headers to send with the HTTP request (when downloading archive).
   */
  headers?: Record<string, string>;
  
  /**
   * Only used when clone is true.
   * If true, uses --depth 1.
   * Default: true if checkout is 'master' or 'main', otherwise false (unless overridden).
   */
  shallow?: boolean;

  /**
   * Number of leading paths to strip when extracting archive.
   * Default: 1
   */
  strip?: number;

  /**
   * Filter function for extracted files.
   * Return true to include the file, false to exclude.
   * Note: This only works when downloading (not cloning).
   */
  filter?: (file: { path: string; isDirectory: boolean }) => boolean;
}
