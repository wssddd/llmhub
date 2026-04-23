import type { Provider, Model, ProviderType } from '../types'

interface CodeGenOptions {
  provider: Provider
  model: Model
  apiKey: string
  prompt?: string
}

export function generatePythonCode({ provider, model, apiKey, prompt = 'Hello, how are you?' }: CodeGenOptions): string {
  const type = provider.type as ProviderType
  
  if (type === 'openai' || type === 'azure' || type === 'lmstudio' || type === 'openrouter') {
    const baseUrl = provider.api_base_url || 'https://api.openai.com/v1'
    return `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${baseUrl}"
)

response = client.chat.completions.create(
    model="${model.name}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ]
)

print(response.choices[0].message.content)`
  }
  
  if (type === 'anthropic') {
    return `from anthropic import Anthropic

client = Anthropic(api_key="${apiKey}")

message = client.messages.create(
    model="${model.name}",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "${prompt}"}
    ]
)

print(message.content[0].text)`
  }
  
  if (type === 'google') {
    return `import google.generativeai as genai

genai.configure(api_key="${apiKey}")
model = genai.GenerativeModel("${model.name}")

response = model.generate_content("${prompt}")
print(response.text)`
  }
  
  if (type === 'ollama') {
    return `import ollama

response = ollama.chat(
    model="${model.name}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ]
)

print(response["message"]["content"])`
  }
  
  return `# Custom provider - implement as needed
# API Base URL: ${provider.api_base_url}
# Model: ${model.name}`
}

export function generateCurlCode({ provider, model, apiKey, prompt = 'Hello, how are you?' }: CodeGenOptions): string {
  const type = provider.type as ProviderType
  
  if (type === 'openai' || type === 'lmstudio' || type === 'openrouter') {
    const baseUrl = provider.api_base_url || 'https://api.openai.com/v1'
    return `curl ${baseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${model.name}",
    "messages": [
      {"role": "user", "content": "${prompt}"}
    ]
  }'`
  }
  
  if (type === 'anthropic') {
    return `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "${model.name}",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "${prompt}"}
    ]
  }'`
  }
  
  if (type === 'google') {
    return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {"parts": [{"text": "${prompt}"}]}
    ]
  }'`
  }
  
  if (type === 'ollama') {
    return `curl http://localhost:11434/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.name}",
    "messages": [
      {"role": "user", "content": "${prompt}"}
    ]
  }'`
  }
  
  if (type === 'azure') {
    const baseUrl = provider.api_base_url || 'https://{resource}.openai.azure.com'
    return `curl "${baseUrl}/openai/deployments/${model.name}/chat/completions?api-version=2024-02-01" \\
  -H "Content-Type: application/json" \\
  -H "api-key: ${apiKey}" \\
  -d '{
    "messages": [
      {"role": "user", "content": "${prompt}"}
    ]
  }'`
  }
  
  return `# Custom provider - implement as needed
# API Base URL: ${provider.api_base_url}
# Model: ${model.name}`
}

export function generateJavaScriptCode({ provider, model, apiKey, prompt = 'Hello, how are you?' }: CodeGenOptions): string {
  const type = provider.type as ProviderType
  
  if (type === 'openai' || type === 'lmstudio' || type === 'openrouter') {
    const baseUrl = provider.api_base_url || 'https://api.openai.com/v1'
    return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '${apiKey}',
  baseURL: '${baseUrl}'
});

const response = await openai.chat.completions.create({
  model: '${model.name}',
  messages: [
    { role: 'user', content: '${prompt}' }
  ]
});

console.log(response.choices[0].message.content);`
  }
  
  if (type === 'anthropic') {
    return `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: '${apiKey}'
});

const message = await anthropic.messages.create({
  model: '${model.name}',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '${prompt}' }
  ]
});

console.log(message.content[0].text);`
  }
  
  if (type === 'google') {
    return `import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('${apiKey}');
const model = genAI.getGenerativeModel({ model: '${model.name}' });

const result = await model.generateContent('${prompt}');
console.log(result.response.text());`
  }
  
  if (type === 'ollama') {
    return `import ollama from 'ollama';

const response = await ollama.chat({
  model: '${model.name}',
  messages: [
    { role: 'user', content: '${prompt}' }
  ]
});

console.log(response.message.content);`
  }
  
  return `// Custom provider - implement as needed
// API Base URL: ${provider.api_base_url}
// Model: ${model.name}`
}

export function generateTypeScriptCode(options: CodeGenOptions): string {
  return generateJavaScriptCode(options).replace(
    /^import/,
    '// TypeScript version\nimport'
  )
}

export function generateStreamingPythonCode({ provider, model, apiKey, prompt = 'Hello, how are you?' }: CodeGenOptions): string {
  const type = provider.type as ProviderType
  
  if (type === 'openai' || type === 'lmstudio' || type === 'openrouter') {
    const baseUrl = provider.api_base_url || 'https://api.openai.com/v1'
    return `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="${baseUrl}"
)

stream = client.chat.completions.create(
    model="${model.name}",
    messages=[
        {"role": "user", "content": "${prompt}"}
    ],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`
  }
  
  if (type === 'anthropic') {
    return `from anthropic import Anthropic

client = Anthropic(api_key="${apiKey}")

with client.messages.stream(
    model="${model.name}",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "${prompt}"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)`
  }
  
  return generatePythonCode({ provider, model, apiKey, prompt })
}
