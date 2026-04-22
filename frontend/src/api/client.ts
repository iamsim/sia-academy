const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const fallback = `Request failed: ${response.status}`
    try {
      const data = (await response.json()) as { message?: string }
      throw new Error(data.message ?? fallback)
    } catch {
      throw new Error(fallback)
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
