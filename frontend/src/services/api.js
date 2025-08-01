const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001"

export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Erro ao fazer login" }
    }

    return data
  } catch (err) {
    return { error: "Erro de conexão com o servidor" }
  }
}
