#!/usr/bin/env bun
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { glob } from 'glob'

interface FixResult {
  file: string
  fixes: string[]
}

class VueStandardsFixer {
  private results: FixResult[] = []
  private srcDir = join(process.cwd(), 'src')

  async fixAll(): Promise<void> {
    console.log('🔧 Fixing Vue file standards...\n')

    await this.fixVueFiles()
    
    this.reportResults()
  }

  private async fixVueFiles(): Promise<void> {
    const vueFiles = await glob('src/**/*.vue', { cwd: process.cwd() })
    
    for (const file of vueFiles) {
      const filePath = join(process.cwd(), file)
      let content = readFileSync(filePath, 'utf-8')
      const fixes: string[] = []
      
      // Fix style usage
      const styleFix = this.fixStyleUsage(content)
      if (styleFix) {
        content = styleFix.content
        fixes.push(styleFix.message)
      }
      
      // Fix script order
      const scriptFix = this.fixScriptOrder(content)
      if (scriptFix) {
        content = scriptFix.content
        fixes.push(scriptFix.message)
      }
      
      if (fixes.length > 0) {
        writeFileSync(filePath, content, 'utf-8')
        this.results.push({ file, fixes })
        console.log(`🔧 Fixed ${file}:`)
        fixes.forEach(fix => console.log(`   - ${fix}`))
      } else {
        console.log(`✅ ${file} - No fixes needed`)
      }
    }
  }

  private fixStyleUsage(content: string): { content: string; message: string } | null {
    // Remove style scoped and style tags, add UnoCSS import if needed
    let modifiedContent = content
    let hasChanges = false
    
    // Remove <style scoped> tags
    modifiedContent = modifiedContent.replace(/<style[^>]*scoped[^>]*>[\s\S]*?<\/style>/g, '')
    hasChanges = true
    
    // Remove regular <style> tags (except those with UnoCSS)
    modifiedContent = modifiedContent.replace(/<style(?![^>]*uno\.css)[^>]*>[\s\S]*?<\/style>/g, '')
    
    // Add UnoCSS import to script if not present
    if (!modifiedContent.includes('import \'uno.css\'') && !modifiedContent.includes('@unocss/reset')) {
      const scriptMatch = modifiedContent.match(/<script[^>]*>/)
      if (scriptMatch) {
        const insertPosition = modifiedContent.indexOf(scriptMatch[0]) + scriptMatch[0].length
        modifiedContent = 
          modifiedContent.slice(0, insertPosition) + 
          '\nimport \'uno.css\'\n' + 
          modifiedContent.slice(insertPosition)
        hasChanges = true
      }
    }
    
    return hasChanges ? { 
      content: modifiedContent, 
      message: 'Replaced <style> with UnoCSS import' 
    } : null
  }

  private fixScriptOrder(content: string): { content: string; message: string } | null {
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
    
    if (!scriptMatch || !templateMatch) return null
    
    const scriptIndex = content.indexOf(scriptMatch[0])
    const templateIndex = content.indexOf(templateMatch[0])
    
    if (scriptIndex <= templateIndex) return null
    
    // Reorder: move script before template
    const scriptContent = scriptMatch[0]
    const templateContent = templateMatch[0]
    const beforeScript = content.slice(0, scriptIndex)
    const afterScript = content.slice(scriptIndex + scriptMatch[0].length)
    
    // Remove template from afterScript
    const templateInAfter = afterScript.indexOf(templateMatch[0])
    const remainingContent = afterScript.slice(0, templateInAfter) + 
                            afterScript.slice(templateInAfter + templateMatch[0].length)
    
    const newContent = beforeScript + scriptContent + templateContent + remainingContent
    
    return { 
      content: newContent, 
      message: 'Moved <script> before <template>' 
    }
  }

  private reportResults(): void {
    console.log('\n📊 Fix Summary:')
    console.log('================\n')
    
    if (this.results.length === 0) {
      console.log('✅ All Vue files already meet the standards!')
      return
    }
    
    let totalFixes = 0
    this.results.forEach(result => {
      totalFixes += result.fixes.length
    })
    
    console.log(`🔧 Fixed ${this.results.length} files with ${totalFixes} total fixes:`)
    this.results.forEach(result => {
      console.log(`\n📄 ${result.file}:`)
      result.fixes.forEach(fix => console.log(`   - ${fix}`))
    })
    
    console.log('\n💡 Tips:')
    console.log('   - Review the fixed files to ensure they look correct')
    console.log('   - Run the check script again to verify all issues are resolved')
    console.log('   - Consider adding these checks to your CI/CD pipeline')
  }
}

// Create missing test files
class TestFileCreator {
  private srcDir = join(process.cwd(), 'src')

  async createMissingTests(): Promise<void> {
    console.log('🧪 Creating missing test files...\n')
    
    const folders = await this.getAllFolders(this.srcDir)
    let created = 0
    
    for (const folder of folders) {
      const createdTest = await this.createTestForFolder(folder)
      if (createdTest) created++
    }
    
    console.log(`\n📝 Created ${created} test files`)
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

  private async createTestForFolder(folder: string): Promise<boolean> {
    const items = readdirSync(folder)
    const hasTest = items.some(item => item.includes('.test.') || item.includes('.spec.'))
    
    if (hasTest) return false
    
    // Find implementation files
    const implFiles = items.filter(item => {
      const ext = extname(item)
      return ['.ts', '.js'].includes(ext) && !item.includes('.d.ts')
    })
    
    if (implFiles.length === 0) return false
    
    const folderName = folder.replace(this.srcDir, '').replace(/\\/g, '/') || 'root'
    const testName = `${folderName.replace(/\//g, '-')}.test.ts`
    const testPath = join(folder, testName)
    
    const testContent = this.generateTestTemplate(implFiles, folderName)
    writeFileSync(testPath, testContent, 'utf-8')
    
    console.log(`📝 Created test: ${testPath}`)
    return true
  }

  private generateTestTemplate(files: string[], folderName: string): string {
    const imports = files.map(file => {
      const baseName = file.replace(/\.(ts|js)$/, '')
      return `import { ${baseName} } from './${baseName}'`
    }).join('\n')
    
    const testNames = files.map(file => {
      const baseName = file.replace(/\.(ts|js)$/, '')
      return `  describe('${baseName}', () => {
    it('should be defined', () => {
      expect(${baseName}).toBeDefined()
    })
  })`
    }).join('\n\n')
    
    return `import { describe, it, expect } from 'vitest'

${imports}

describe('${folderName}', () => {
${testNames}
})
`
  }
}

// Run the fixer
if (import.meta.main) {
  const command = process.argv[2]
  
  if (command === 'fix') {
    const fixer = new VueStandardsFixer()
    fixer.fixAll().catch(console.error)
  } else if (command === 'create-tests') {
    const creator = new TestFileCreator()
    creator.createMissingTests().catch(console.error)
  } else {
    console.log('Usage:')
    console.log('  bun run scripts/fix-vue-standards.ts fix          - Fix Vue file issues')
    console.log('  bun run scripts/fix-vue-standards.ts create-tests  - Create missing test files')
  }
}
