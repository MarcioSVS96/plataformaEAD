import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Simulação de cadastro
    if (email && password.length >= 6) {
      setSuccess("Cadastro realizado com sucesso!")
      setTimeout(() => {
        navigate("/")
      }, 1500)
    } else {
      setError("Senha deve ter pelo menos 6 caracteres.")
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Crie sua conta</h2>
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
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button style={styles.button} type="submit">
          Registrar
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <p style={styles.text}>
        Já tem conta?{" "}
        <Link to="/" style={styles.link}>
          Faça login
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
    backgroundColor: "#28a745",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  error: {
    marginTop: 12,
    color: "red",
  },
  success: {
    marginTop: 12,
    color: "green",
  },
  text: {
    marginTop: 20,
    color: "#555",
  },
  link: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "bold",
  },
}
