import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Simulação de login
    if (email === "admin@example.com" && password === "123456") {
      login({ email })
      navigate("/dashboard")
    } else {
      setError("E-mail ou senha incorretos.")
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Entrar na Plataforma</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="E-mail"
          value={email}
          autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">
          Entrar
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p style={styles.text}>
        Não tem conta?{" "}
        <Link to="/register" style={styles.link}>
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "60px auto",
    padding: 20,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: 8,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
  },
  title: {
    marginBottom: 24,
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 12,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: 12,
    fontSize: 16,
    borderRadius: 4,
    border: "none",
    backgroundColor: "#007BFF",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    marginTop: 12,
    color: "red",
  },
  text: {
    marginTop: 20,
    color: "#555",
  },
  link: {
    color: "#007BFF",
    textDecoration: "none",
    fontWeight: "bold",
  },
}
