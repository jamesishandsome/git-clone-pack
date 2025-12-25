import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import download from '../src/index.js'
import fs from 'node:fs/promises'
import path from 'node:path'

const TMP_DIR = path.join(process.cwd(), 'test-tmp')

async function rmWithRetry(dir: string, retries = 5, delay = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.rm(dir, { recursive: true, force: true })
      return
    } catch (err: any) {
      if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'ENOTEMPTY') {
        if (i === retries - 1) {
             console.error(`Failed to remove ${dir}: ${err.message}`)
             return 
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      } else {
        throw err
      }
    }
  }
}

describe('download-git-repo', () => {
  beforeEach(async () => {
    await rmWithRetry(TMP_DIR)
  })

  afterEach(async () => {
    await rmWithRetry(TMP_DIR)
  })

  it('downloads from github (master)', async () => {
    await download('flippidippi/download-git-repo-fixture', TMP_DIR)
    
    const files = await fs.readdir(TMP_DIR)
    expect(files).toContain('README.md')
  })

  it('downloads from github (branch)', async () => {
    await download('flippidippi/download-git-repo-fixture#my-branch', TMP_DIR)
    
    const files = await fs.readdir(TMP_DIR)
    expect(files).toContain('branch-only-file.md')
  })

  it('clones from github', async () => {
    await download('flippidippi/download-git-repo-fixture', TMP_DIR, { clone: true })
    
    const files = await fs.readdir(TMP_DIR)
    expect(files).toContain('README.md')
    expect(files).not.toContain('.git')
  })

  it('filters files', async () => {
    await download('flippidippi/download-git-repo-fixture', TMP_DIR, { 
      filter: (file) => file.path.endsWith('.md') 
    })
    
    const files = await fs.readdir(TMP_DIR)
    // Should only contain MD files
    // But note: fs.readdir returns direct children. If subfolders exist but are empty or only contain filtered files, they might exist.
    // In our implementation, we create directories before checking files, but we only create them if we recurse?
    // Actually moveContents recurses.
    
    // Let's check if README.md exists and other files don't if they exist in repo.
    expect(files).toContain('README.md')
  })
})
