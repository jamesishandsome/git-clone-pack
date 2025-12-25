import { execa } from 'execa'
import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { DownloadOptions } from './types.js'

async function rmWithRetry(dir: string, retries = 3, delay = 100) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.rm(dir, { recursive: true, force: true })
      return
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'EBUSY' || error.code === 'EPERM') {
        if (i === retries - 1) throw err
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      } else {
        throw err
      }
    }
  }
}

export async function gitClone(url: string, dest: string, checkout: string, opts: DownloadOptions = {}) {
  // Determine if we should shallow clone
  // Default logic: shallow if checkout is master/main, unless specified otherwise
  let shallow = opts.shallow
  if (shallow === undefined) {
    shallow = checkout === 'master' || checkout === 'main'
  }

  const cloneArgs = ['clone']
  
  if (shallow) {
    cloneArgs.push('--depth', '1')
  }
  
  cloneArgs.push(url, dest)
  
  // Clone
  await execa('git', cloneArgs, { stdio: 'inherit' })
  
  // Checkout if needed
  if (checkout && checkout !== 'master' && checkout !== 'main') {
    // We assume full clone if we are checking out something else, unless user forced shallow.
    // If user forced shallow and tries to checkout an old commit, it will fail.
    await execa('git', ['checkout', checkout], { cwd: dest, stdio: 'inherit' })
  }
  
  // Remove .git
  await rmWithRetry(path.join(dest, '.git'))
}

export async function downloadZip(url: string, dest: string, opts: DownloadOptions = {}) {
  const response = await fetch(url, {
    headers: opts.headers || {}
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const zip = new AdmZip(buffer)
  
  const strip = opts.strip ?? 1
  const filter = opts.filter
  
  // If we need to strip or filter, we extract to temp first (or iterate entries manually)
  // AdmZip extractAllTo doesn't support filter/strip natively in one go easily.
  // To support filter and strip properly, manual iteration is best.
  
  if (strip > 0 || filter) {
    const tempDir = path.join(dest, '.tmp_download_' + Date.now())
    zip.extractAllTo(tempDir, true)
    
    // Find the root dir (if strip > 0)
    let sourceDir = tempDir
    
    if (strip > 0) {
      const items = await fs.readdir(tempDir)
      // If there is only one directory, that's likely the root (e.g. repo-master)
      if (items.length === 1 && items[0]) {
         const itemPath = path.join(tempDir, items[0])
         const stat = await fs.stat(itemPath)
         if (stat.isDirectory()) {
           sourceDir = itemPath
         }
      }
    }
    
    // Move contents of sourceDir to dest
    // Ensure dest exists
    await fs.mkdir(dest, { recursive: true })
    
    // Recursive copy/move function to handle nested files if filter is applied or if we just want to move everything
    // But since we extracted everything, we can just walk the tree.
    // However, if we move directories, we might break iteration if we are not careful.
    // A simpler approach for "strip=1" which is common is just moving the children of the root folder.
    
    // If we have a filter, we need to apply it.
    // The filter in download-git-repo usually takes { path, type } or similar.
    // We defined it as { path: string, isDirectory: boolean }.
    
    async function moveContents(src: string, dst: string, relativePath: string = '') {
      const items = await fs.readdir(src, { withFileTypes: true })
      
      for (const item of items) {
        const itemRelativePath = path.join(relativePath, item.name)
        const srcPath = path.join(src, item.name)
        const dstPath = path.join(dst, item.name)
        
        if (filter) {
           const shouldInclude = filter({ 
             path: itemRelativePath, 
             isDirectory: item.isDirectory() 
           })
           if (!shouldInclude) continue
        }
        
        if (item.isDirectory()) {
           await fs.mkdir(dstPath, { recursive: true })
           await moveContents(srcPath, dstPath, itemRelativePath)
        } else {
           await fs.rename(srcPath, dstPath)
        }
      }
    }
    
    await moveContents(sourceDir, dest)
    
    // Cleanup temp
    await rmWithRetry(tempDir)
    
  } else {
    zip.extractAllTo(dest, true)
  }
}
