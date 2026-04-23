import { app, BrowserWindow, ipcMain, safeStorage, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

const DATA_PATH = path.join(app.getPath('userData'), 'llmhub-data.json')

interface DbData {
  profiles: Array<{ id: number; name: string; is_active: number; created_at: string }>
  providers: Array<{ id: number; profile_id: number; name: string; type: string; api_base_url: string | null; platform_url: string | null; logo: string | null; created_at: string }>
  models: Array<{ id: number; provider_id: number; name: string; display_name: string | null; input_cost: number; output_cost: number; max_tokens: number | null; context_window: number | null; created_at: string }>
  api_keys: Array<{ id: number; provider_id: number; key_encrypted: string; org_id: string | null; created_at: string }>
  nextIds: { profiles: number; providers: number; models: number; api_keys: number }
}

let data: DbData = {
  profiles: [],
  providers: [],
  models: [],
  api_keys: [],
  nextIds: { profiles: 1, providers: 1, models: 1, api_keys: 1 }
}

function loadData() {
  if (fs.existsSync(DATA_PATH)) {
    try {
      const raw = fs.readFileSync(DATA_PATH, 'utf-8')
      data = JSON.parse(raw)
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }
  
  if (data.profiles.length === 0) {
    data.profiles.push({
      id: data.nextIds.profiles++,
      name: 'Default',
      is_active: 1,
      created_at: new Date().toISOString()
    })
    saveData()
  }
  
  console.log('Data loaded from:', DATA_PATH)
}

function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

function encryptKey(plaintext: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(plaintext)
    return encrypted.toString('base64')
  }
  const key = crypto.scryptSync(app.getPath('userData'), 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

function decryptKey(ciphertext: string): string {
  if (safeStorage.isEncryptionAvailable() && !ciphertext.includes(':')) {
    const buffer = Buffer.from(ciphertext, 'base64')
    return safeStorage.decryptString(buffer)
  }
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted format')
  const [ivHex, authTagHex, encrypted] = parts
  const key = crypto.scryptSync(app.getPath('userData'), 'salt', 32)
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function setupIpcHandlers() {
  // Profiles
  ipcMain.handle('profiles:list', () => {
    return [...data.profiles].sort((a, b) => a.name.localeCompare(b.name))
  })

  ipcMain.handle('profiles:create', (_, name: string) => {
    const profile = {
      id: data.nextIds.profiles++,
      name,
      is_active: 0,
      created_at: new Date().toISOString()
    }
    data.profiles.push(profile)
    saveData()
    return profile
  })

  ipcMain.handle('profiles:setActive', (_, id: number) => {
    data.profiles.forEach(p => p.is_active = p.id === id ? 1 : 0)
    saveData()
    return true
  })

  ipcMain.handle('profiles:delete', (_, id: number) => {
    const providerIds = data.providers.filter(p => p.profile_id === id).map(p => p.id)
    data.api_keys = data.api_keys.filter(k => !providerIds.includes(k.provider_id))
    data.models = data.models.filter(m => !providerIds.includes(m.provider_id))
    data.providers = data.providers.filter(p => p.profile_id !== id)
    data.profiles = data.profiles.filter(p => p.id !== id)
    saveData()
    return true
  })

  ipcMain.handle('profiles:getActive', () => {
    return data.profiles.find(p => p.is_active === 1) || null
  })

  // Providers
  ipcMain.handle('providers:list', (_, profileId: number) => {
    return data.providers
      .filter(p => p.profile_id === profileId)
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  ipcMain.handle('providers:create', (_, input: { profile_id: number; name: string; type: string; api_base_url?: string; platform_url?: string }) => {
    const provider = {
      id: data.nextIds.providers++,
      profile_id: input.profile_id,
      name: input.name,
      type: input.type,
      api_base_url: input.api_base_url || null,
      platform_url: input.platform_url || null,
      logo: null,
      created_at: new Date().toISOString()
    }
    data.providers.push(provider)
    saveData()
    return provider
  })

  ipcMain.handle('providers:update', (_, id: number, updates: { name?: string; type?: string; api_base_url?: string; platform_url?: string }) => {
    const provider = data.providers.find(p => p.id === id)
    if (provider) {
      Object.assign(provider, updates)
      saveData()
    }
    return true
  })

  ipcMain.handle('providers:delete', (_, id: number) => {
    data.api_keys = data.api_keys.filter(k => k.provider_id !== id)
    data.models = data.models.filter(m => m.provider_id !== id)
    data.providers = data.providers.filter(p => p.id !== id)
    saveData()
    return true
  })

  // Models
  ipcMain.handle('models:list', (_, providerId: number) => {
    return data.models
      .filter(m => m.provider_id === providerId)
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  ipcMain.handle('models:create', (_, input: { provider_id: number; name: string; display_name?: string; input_cost?: number; output_cost?: number; max_tokens?: number; context_window?: number }) => {
    const model = {
      id: data.nextIds.models++,
      provider_id: input.provider_id,
      name: input.name,
      display_name: input.display_name || input.name,
      input_cost: input.input_cost || 0,
      output_cost: input.output_cost || 0,
      max_tokens: input.max_tokens || null,
      context_window: input.context_window || null,
      created_at: new Date().toISOString()
    }
    data.models.push(model)
    saveData()
    return model
  })

  ipcMain.handle('models:update', (_, id: number, updates: Partial<{ name: string; display_name: string; input_cost: number; output_cost: number; max_tokens: number; context_window: number }>) => {
    const model = data.models.find(m => m.id === id)
    if (model) {
      Object.assign(model, updates)
      saveData()
    }
    return true
  })

  ipcMain.handle('models:delete', (_, id: number) => {
    data.models = data.models.filter(m => m.id !== id)
    saveData()
    return true
  })

  // API Keys (multiple per provider)
  ipcMain.handle('apikeys:list', (_, providerId: number) => {
    return data.api_keys
      .filter(k => k.provider_id === providerId)
      .map(k => {
        try {
          return {
            id: k.id,
            provider_id: k.provider_id,
            label: (k as any).label || 'Default',
            key: decryptKey(k.key_encrypted),
            org_id: k.org_id,
            created_at: k.created_at
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)
  })

  ipcMain.handle('apikeys:get', (_, providerId: number) => {
    const key = data.api_keys.find(k => k.provider_id === providerId)
    if (!key) return null
    try {
      return { key: decryptKey(key.key_encrypted), org_id: key.org_id }
    } catch {
      return null
    }
  })

  ipcMain.handle('apikeys:add', (_, providerId: number, keyValue: string, label?: string, orgId?: string) => {
    const encrypted = encryptKey(keyValue)
    const newKey = {
      id: data.nextIds.api_keys++,
      provider_id: providerId,
      label: label || `Key ${data.api_keys.filter(k => k.provider_id === providerId).length + 1}`,
      key_encrypted: encrypted,
      org_id: orgId || null,
      created_at: new Date().toISOString()
    }
    data.api_keys.push(newKey as any)
    saveData()
    return { ...newKey, key: keyValue, key_encrypted: undefined }
  })

  ipcMain.handle('apikeys:update', (_, keyId: number, keyValue: string, label?: string, orgId?: string) => {
    const key = data.api_keys.find(k => k.id === keyId)
    if (key) {
      key.key_encrypted = encryptKey(keyValue);
      (key as any).label = label || (key as any).label
      key.org_id = orgId || null
      saveData()
    }
    return true
  })

  ipcMain.handle('apikeys:set', (_, providerId: number, keyValue: string, orgId?: string) => {
    const encrypted = encryptKey(keyValue)
    const existing = data.api_keys.find(k => k.provider_id === providerId)
    if (existing) {
      existing.key_encrypted = encrypted
      existing.org_id = orgId || null
    } else {
      data.api_keys.push({
        id: data.nextIds.api_keys++,
        provider_id: providerId,
        key_encrypted: encrypted,
        org_id: orgId || null,
        created_at: new Date().toISOString()
      } as any)
    }
    saveData()
    return true
  })

  ipcMain.handle('apikeys:delete', (_, keyId: number) => {
    data.api_keys = data.api_keys.filter(k => k.id !== keyId)
    saveData()
    return true
  })

  ipcMain.handle('apikeys:deleteAll', (_, providerId: number) => {
    data.api_keys = data.api_keys.filter(k => k.provider_id !== providerId)
    saveData()
    return true
  })

  // Export
  ipcMain.handle('export:env', (_, profileId: number) => {
    const providers = data.providers.filter(p => p.profile_id === profileId)
    
    let envContent = '# LLMHub Export\n\n'
    for (const provider of providers) {
      const prefix = provider.type.toUpperCase().replace(/[^A-Z0-9]/g, '_')
      const key = data.api_keys.find(k => k.provider_id === provider.id)
      if (key) {
        try {
          envContent += `${prefix}_API_KEY=${decryptKey(key.key_encrypted)}\n`
        } catch {
          envContent += `# ${prefix}_API_KEY=<decryption failed>\n`
        }
        if (key.org_id) {
          envContent += `${prefix}_ORG_ID=${key.org_id}\n`
        }
      }
      if (provider.api_base_url) {
        envContent += `${prefix}_API_BASE_URL=${provider.api_base_url}\n`
      }
      envContent += '\n'
    }
    return envContent
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: '#f5f5f7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.setName('LLMHub')

app.whenReady().then(() => {
  // Set dock icon on macOS
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../public/logo.png')
    if (fs.existsSync(iconPath)) {
      const icon = nativeImage.createFromPath(iconPath)
      app.dock.setIcon(icon)
    }
  }
  
  loadData()
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
