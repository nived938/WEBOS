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
})
