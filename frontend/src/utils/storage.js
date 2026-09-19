// Safe localStorage helpers — handle null, undefined, corrupt JSON, and string "null"

export function getUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw || raw === 'null' || raw === 'undefined') return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function setUser(user) {
  if (!user || typeof user !== 'object') {
    localStorage.removeItem('user')
    return
  }
  localStorage.setItem('user', JSON.stringify(user))
}

export function getToken() {
  return localStorage.getItem('token') || null
}