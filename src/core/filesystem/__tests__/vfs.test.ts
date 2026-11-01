import { describe, it, expect, beforeEach } from 'vitest'
import { vfs } from '../vfs'

describe('Virtual File System (VFS)', () => {
  beforeEach(() => {
    vfs.resetToDefault()
  })

  it('should initialize with default desktop files and folders', () => {
    const desktopFiles = vfs.getChildren('folder-desktop')
    expect(desktopFiles.length).toBeGreaterThan(0)

    const welcomeFile = desktopFiles.find((f) => f.name.includes('Welcome'))
    expect(welcomeFile).toBeDefined()
    expect(welcomeFile?.content).toContain('WELCOME TO NOVA OS')
  })

  it('should create new files and update their contents', () => {
    const file = vfs.createFile('folder-documents', 'test-doc.txt', 'Hello NOVA OS!')
    expect(file.id).toBeDefined()
    expect(file.name).toBe('test-doc.txt')
    expect(file.content).toBe('Hello NOVA OS!')

    const retrieved = vfs.getNode(file.id)
    expect(retrieved).toBeDefined()
    expect(retrieved?.content).toBe('Hello NOVA OS!')

    vfs.updateFileContent(file.id, 'Updated Content')
    expect(vfs.getNode(file.id)?.content).toBe('Updated Content')
  })

  it('should create new folders and handle hierarchy', () => {
    const folder = vfs.createFolder('folder-documents', 'My Projects')
    expect(folder.type).toBe('folder')
    expect(folder.parentId).toBe('folder-documents')

    const subFile = vfs.createFile(folder.id, 'app.ts', 'console.log("hi")')
    expect(subFile.parentId).toBe(folder.id)

    const folderChildren = vfs.getChildren(folder.id)
    expect(folderChildren).toHaveLength(1)
    expect(folderChildren[0].name).toBe('app.ts')
  })

  it('should handle move to trash, restore from trash, and empty trash', () => {
    const tempFile = vfs.createFile('folder-desktop', 'temp.txt', 'To be deleted')
    expect(vfs.getChildren('folder-desktop').find((f) => f.id === tempFile.id)).toBeDefined()

    // Move to trash
    vfs.moveToTrash(tempFile.id)
    expect(vfs.getChildren('folder-desktop').find((f) => f.id === tempFile.id)).toBeUndefined()
    expect(vfs.getTrashNodes().find((f) => f.id === tempFile.id)).toBeDefined()

    // Restore from trash
    vfs.restoreFromTrash(tempFile.id)
    expect(vfs.getChildren('folder-desktop').find((f) => f.id === tempFile.id)).toBeDefined()
    expect(vfs.getTrashNodes().find((f) => f.id === tempFile.id)).toBeUndefined()

    // Delete permanently via empty trash
    vfs.moveToTrash(tempFile.id)
    vfs.emptyTrash()
    expect(vfs.getTrashNodes()).toHaveLength(0)
    expect(vfs.getNode(tempFile.id)).toBeUndefined()
  })

  it('should search across file names and text contents', () => {
    vfs.createFile('folder-documents', 'secret-recipe.txt', 'Ingredients: apples, cinnamon')
    const results = vfs.search('apples')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toBe('secret-recipe.txt')
  })

  it('should recursively delete a folder and all its descendants', () => {
    const parentFolder = vfs.createFolder('folder-documents', 'DeepFolder')
    const subFolder = vfs.createFolder(parentFolder.id, 'SubFolder')
    const nestedFile = vfs.createFile(subFolder.id, 'deep.txt', 'Nested content')

    expect(vfs.getNode(parentFolder.id)).toBeDefined()
    expect(vfs.getNode(subFolder.id)).toBeDefined()
    expect(vfs.getNode(nestedFile.id)).toBeDefined()

    const success = vfs.deleteFolderRecursive(parentFolder.id)
    expect(success).toBe(true)

    expect(vfs.getNode(parentFolder.id)).toBeUndefined()
    expect(vfs.getNode(subFolder.id)).toBeUndefined()
    expect(vfs.getNode(nestedFile.id)).toBeUndefined()
  })

  it('should recursively copy a folder with all nested files preserving structure', () => {
    const rootFolder = vfs.createFolder('folder-documents', 'SourceFolder')
    const nestedSub = vfs.createFolder(rootFolder.id, 'ChildDir')
    vfs.createFile(nestedSub.id, 'child.txt', 'Hello Child')

    const copied = vfs.copyFolderRecursive(rootFolder.id, 'folder-desktop')
    expect(copied).toBeDefined()
    expect(copied?.id).not.toBe(rootFolder.id)
    expect(copied?.name).toContain('SourceFolder (Copy)')
    expect(copied?.parentId).toBe('folder-desktop')

    const copiedSubDirs = vfs.getChildren(copied!.id)
    expect(copiedSubDirs).toHaveLength(1)
    expect(copiedSubDirs[0].name).toBe('ChildDir')

    const copiedFiles = vfs.getChildren(copiedSubDirs[0].id)
    expect(copiedFiles).toHaveLength(1)
    expect(copiedFiles[0].name).toBe('child.txt')
    expect(copiedFiles[0].content).toBe('Hello Child')
  })

  it('should prevent circular folder nesting cycles in moveNode', () => {
    const dirA = vfs.createFolder('folder-documents', 'DirA')
    const dirB = vfs.createFolder(dirA.id, 'DirB')
    const dirC = vfs.createFolder(dirB.id, 'DirC')

    // Moving DirA into DirA must fail
    expect(vfs.moveNode(dirA.id, dirA.id)).toBe(false)

    // Moving DirA into its child DirB or grandchild DirC must fail
    expect(vfs.moveNode(dirA.id, dirB.id)).toBe(false)
    expect(vfs.moveNode(dirA.id, dirC.id)).toBe(false)

    // Moving DirC to documents should succeed
    expect(vfs.moveNode(dirC.id, 'folder-documents')).toBe(true)
    expect(vfs.getNode(dirC.id)?.parentId).toBe('folder-documents')
  })

  it('should compute storage statistics correctly', async () => {
    const stats = await vfs.getStorageStats()
    expect(stats.fileCount).toBeGreaterThan(0)
    expect(stats.folderCount).toBeGreaterThan(0)
    expect(stats.usedBytes).toBeGreaterThan(0)
  })

  it('should export and import VFS backup archives', async () => {
    vfs.createFile('folder-documents', 'export-test.txt', 'Exported content data')
    const archiveJson = await vfs.exportArchive()
    expect(archiveJson).toContain('export-test.txt')

    // Reset and verify it's gone
    vfs.resetToDefault()
    expect(vfs.search('Exported content data')).toHaveLength(0)

    // Import and verify restored
    const imported = await vfs.importArchive(archiveJson, 'merge')
    expect(imported).toBe(true)
    expect(vfs.search('Exported content data').length).toBeGreaterThan(0)
  })
})
