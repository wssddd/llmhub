/// <reference types="vite/client" />

interface Profile {
  id: number
  name: string
  is_active: number
  created_at: string
}

interface Provider {
  id: number
  profile_id: number
  name: string
  type: string
  api_base_url: string | null
  platform_url: string | null
  logo: string | null
  created_at: string
}

interface Model {
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

interface ApiKey {
  id: number
  provider_id: number
  label: string
  key: string
  org_id: string | null
  created_at: string
}

interface WindowApi {
  profiles: {
    list: () => Promise<Profile[]>
    create: (name: string) => Promise<Profile>
    setActive: (id: number) => Promise<boolean>
    delete: (id: number) => Promise<boolean>
    getActive: () => Promise<Profile | null>
  }
  providers: {
    list: (profileId: number) => Promise<Provider[]>
    create: (data: Omit<Provider, 'id' | 'created_at' | 'logo'>) => Promise<Provider>
    update: (id: number, data: Partial<Provider>) => Promise<boolean>
    delete: (id: number) => Promise<boolean>
  }
  models: {
    list: (providerId: number) => Promise<Model[]>
    create: (data: Omit<Model, 'id' | 'created_at'>) => Promise<Model>
    update: (id: number, data: Partial<Model>) => Promise<boolean>
    delete: (id: number) => Promise<boolean>
  }
  apikeys: {
    list: (providerId: number) => Promise<ApiKey[]>
    get: (providerId: number) => Promise<{ key: string; org_id: string | null } | null>
    add: (providerId: number, key: string, label?: string, orgId?: string) => Promise<ApiKey>
    update: (keyId: number, key: string, label?: string, orgId?: string) => Promise<boolean>
    set: (providerId: number, key: string, orgId?: string) => Promise<boolean>
    delete: (keyId: number) => Promise<boolean>
    deleteAll: (providerId: number) => Promise<boolean>
  }
  export: {
    env: (profileId: number) => Promise<string>
  }
}

declare global {
  interface Window {
    api: WindowApi
  }
}

export {}
