const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const ACCESS_TOKEN_KEY = "bts_access_token"
const REFRESH_TOKEN_KEY = "bts_refresh_token"
const USER_KEY = "bts_user"

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  status: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function isBrowser() {
  return typeof window !== "undefined"
}

function setCookie(name: string, value: string, days: number) {
  if (!isBrowser()) return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
}

function clearCookie(name: string) {
  if (!isBrowser()) return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

export const authStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  getUser(): AuthUser | null {
    if (!isBrowser()) return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },
  setAuth(auth: AuthResponse) {
    if (!isBrowser()) return
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
    setCookie("auth_token", auth.accessToken, 7)
    setCookie("auth_role", auth.user.role, 7)
  },
  clear() {
    if (!isBrowser()) return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearCookie("auth_token")
    clearCookie("auth_role")
  },
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const refreshToken = authStorage.getRefreshToken()
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false
        const data = (await res.json()) as AuthResponse
        authStorage.setAuth(data)
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function notifyUnauthorized() {
  if (isBrowser()) {
    window.dispatchEvent(new Event("bts:unauthorized"))
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  formData?: FormData
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, formData } = options
  const url = `${API_URL}${path}`

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  }

  const accessToken = authStorage.getAccessToken()
  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`
  }

  let requestBody: BodyInit | undefined
  if (formData) {
    requestBody = formData
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json"
    requestBody = JSON.stringify(body)
  }

  const doFetch = (): Promise<Response> =>
    fetch(url, { method, headers: finalHeaders, body: requestBody })

  let response = await doFetch()

  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const newToken = authStorage.getAccessToken()
      if (newToken) finalHeaders.Authorization = `Bearer ${newToken}`
      response = await doFetch()
    } else {
      authStorage.clear()
      notifyUnauthorized()
    }
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      if (data && typeof data.message === "string") {
        message = data.message
      } else if (data && Array.isArray(data.message)) {
        message = data.message.join(", ")
      } else if (data && typeof data.error === "string") {
        message = data.error
      }
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(response.status, message)
  }

  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }
  return undefined as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", formData }),
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const auth = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  })
  authStorage.setAuth(auth)
  return auth
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const auth = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  })
  authStorage.setAuth(auth)
  return auth
}

export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me")
}

export async function logout(): Promise<void> {
  authStorage.clear()
  notifyUnauthorized()
}
