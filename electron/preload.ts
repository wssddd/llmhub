import { contextBridge, ipcRenderer } from 'electron'

export interface Profile {
  id: number
  name: string
  is_active: number
  created_at: string
}

export interface Provider {
  id: number
  profile_id: number
  name: string
  type: string
  api_base_url: string | null
  platform_url: string | null
  logo: string | null
  created_at: string
}

export interface Model {
  id: number
  provider_id: number
  name: string
  display_name: string | null
  input_cost: number
  output_cost: number
  max_tokens: number | null
  context_window: number | null
  created_at: string
}

export interface ApiKey {
  id: number
  provider_id: number
  label: string
  key: string
  org_id: string | null
  created_at: string
}

const api = {
  profiles: {
    list: (): Promise<Profile[]> => ipcRenderer.invoke('profiles:list'),
    create: (name: string): Promise<Profile> => ipcRenderer.invoke('profiles:create', name),
    setActive: (id: number): Promise<boolean> => ipcRenderer.invoke('profiles:setActive', id),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('profiles:delete', id),
    getActive: (): Promise<Profile | null> => ipcRenderer.invoke('profiles:getActive'),
  },
  providers: {
    list: (profileId: number): Promise<Provider[]> => ipcRenderer.invoke('providers:list', profileId),
    create: (data: Omit<Provider, 'id' | 'created_at' | 'logo'>): Promise<Provider> => ipcRenderer.invoke('providers:create', data),
    update: (id: number, data: Partial<Provider>): Promise<boolean> => ipcRenderer.invoke('providers:update', id, data),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('providers:delete', id),
  },
  models: {
    list: (providerId: number): Promise<Model[]> => ipcRenderer.invoke('models:list', providerId),
    create: (data: Omit<Model, 'id' | 'created_at'>): Promise<Model> => ipcRenderer.invoke('models:create', data),
    update: (id: number, data: Partial<Model>): Promise<boolean> => ipcRenderer.invoke('models:update', id, data),
    delete: (id: number): Promise<boolean> => ipcRenderer.invoke('models:delete', id),
  },
  apikeys: {
    list: (providerId: number): Promise<ApiKey[]> => ipcRenderer.invoke('apikeys:list', providerId),
    get: (providerId: number): Promise<{ key: string; org_id: string | null } | null> => ipcRenderer.invoke('apikeys:get', providerId),
    add: (providerId: number, key: string, label?: string, orgId?: string): Promise<ApiKey> => ipcRenderer.invoke('apikeys:add', providerId, key, label, orgId),
    update: (keyId: number, key: string, label?: string, orgId?: string): Promise<boolean> => ipcRenderer.invoke('apikeys:update', keyId, key, label, orgId),
    set: (providerId: number, key: string, orgId?: string): Promise<boolean> => ipcRenderer.invoke('apikeys:set', providerId, key, orgId),
    delete: (keyId: number): Promise<boolean> => ipcRenderer.invoke('apikeys:delete', keyId),
    deleteAll: (providerId: number): Promise<boolean> => ipcRenderer.invoke('apikeys:deleteAll', providerId),
  },
  export: {
    env: (profileId: number): Promise<string> => ipcRenderer.invoke('export:env', profileId),
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
