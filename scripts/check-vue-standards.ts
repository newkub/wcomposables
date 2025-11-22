#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { glob } from 'glob'

interface ValidationError {
  file: string
  type: 'style' | 'script-order' | 'folder-structure'
  message: string
}

class VueStandardsChecker {
  private errors: ValidationError[] = []
  private srcDir = join(process.cwd(), 'src')

  async checkAll(): Promise<void> {
    console.log('🔍 Checking Vue file standards...\n')

    await this.checkVueFiles()
    await this.checkFolderStructure()

    this.reportResults()
  }

  private async checkVueFiles(): Promise<void> {
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() })
    
    for (const file of vueFiles) {
      const filePath = join(process.cwd(), file)
      const content = readFileSync(filePath, 'utf-8')
      
      this.checkStyleUsage(content, file)
      this.checkScriptOrder(content, file)
    }
  }

  private checkStyleUsage(content: string, file: string): void {
    // Check for style scoped or style tags
    const styleScopedRegex = /<style[^>]*scoped[^>]*>/g
    const styleRegex = /<style[^>]*>/g
    
    if (styleScopedRegex.test(content) || (styleRegex.test(content) && !content.includes('uno.css'))) {
      this.errors.push({
        file,
        type: 'style',
        message: '❌ Should use UnoCSS instead of <style> or <style scoped>'
      })
    } else if (content.includes('uno.css') || !styleRegex.test(content)) {
      console.log(`✅ ${file} - Using UnoCSS correctly`)
    }
  }

  private checkScriptOrder(content: string, file: string): void {
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
    
    if (!scriptMatch || !templateMatch) return
    
    const scriptIndex = content.indexOf(scriptMatch[0])
    const templateIndex = content.indexOf(templateMatch[0])
    
    if (scriptIndex > templateIndex) {
      this.errors.push({
        file,
        type: 'script-order',
        message: '❌ <script> should come before <template>'
      })
    } else {
      console.log(`✅ ${file} - Script order correct`)
    }
  }

  private async checkFolderStructure(): Promise<void> {
    const folders = await this.getAllFolders(this.srcDir)
    
    for (const folder of folders) {
      await this.checkFolderCompleteness(folder)
    }
  }

  private async getAllFolders(dir: string): Promise<string[]> {
    const folders: string[] = []
    const items = readdirSync(dir)
    
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        folders.push(fullPath)
        folders.push(...await this.getAllFolders(fullPath))
      }
    }
    
    return folders
  }

  private async checkFolderCompleteness(folder: string): Promise<void> {
    const items = readdirSync(folder)
    const hasFile = items.some(item => {
      const ext = extname(item)
      return ['.ts', '.js'].includes(ext)
    })
    const hasTest = items.some(item => item.includes('.test.') || item.includes('.spec.'))
    const hasVue = items.some(item => extname(item) === '.vue')
    
    const folderName = folder.replace(this.srcDir, '').replace(/\\/g, '/') || 'root'
    
    if (!hasFile && !hasTest && !hasVue) {
      // Skip empty folders or utility folders
      if (folderName !== '/utils' && folderName !== '/types' && folderName !== '/constants') {
        this.errors.push({
          file: folder,
          type: 'folder-structure',
          message: `❌ Folder ${folderName} should contain at least one of: .ts/.js file, test file, or .vue file`
        })
      }
    } else {
      const missing: string[] = []
      if (!hasFile) missing.push('implementation file')
      if (!hasTest) missing.push('test file')
      if (!hasVue) missing.push('.vue file')
      
      if (missing.length === 0) {
        console.log(`✅ ${folderName} - Complete folder structure`)
      } else if (missing.length < 3) {
        this.errors.push({
          file: folder,
          type: 'folder-structure',
          message: `⚠️  Folder ${folderName} missing: ${missing.join(', ')}`
        })
      }
    }
  }

  private reportResults(): void {
    console.log('\n📊 Results Summary:')
    console.log('==================\n')
    
    if (this.errors.length === 0) {
      console.log('🎉 All Vue files meet the standards!')
      process.exit(0)
    }
    
    const styleErrors = this.errors.filter(e => e.type === 'style')
    const scriptOrderErrors = this.errors.filter(e => e.type === 'script-order')
    const folderStructureErrors = this.errors.filter(e => e.type === 'folder-structure')
    
    if (styleErrors.length > 0) {
      console.log(`\n🎨 Style Issues (${styleErrors.length}):`)
      styleErrors.forEach(error => {
        console.log(`  ${error.file}: ${error.message}`)
      })
    }
    
    if (scriptOrderErrors.length > 0) {
      console.log(`\n📝 Script Order Issues (${scriptOrderErrors.length}):`)
      scriptOrderErrors.forEach(error => {
        console.log(`  ${error.file}: ${error.message}`)
      })
    }
    
    if (folderStructureErrors.length > 0) {
      console.log(`\n📁 Folder Structure Issues (${folderStructureErrors.length}):`)
      folderStructureErrors.forEach(error => {
        console.log(`  ${error.file}: ${error.message}`)
      })
    }
    
    console.log(`\n❌ Found ${this.errors.length} issues total`)
    process.exit(1)
  }
}

// Run the checker
if (import.meta.main) {
  const checker = new VueStandardsChecker()
  checker.checkAll().catch(console.error)
}
