import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Bem-vindo, {user?.email}</h2>
      <button style={styles.button} onClick={handleLogout}>
        Sair
      </button>
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
  button: {
    padding: 12,
    fontSize: 16,
    borderRadius: 4,
    border: "none",
    backgroundColor: "#dc3545",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
}
