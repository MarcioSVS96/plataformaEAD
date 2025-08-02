import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Registro feito com sucesso, agora redireciona para login
        alert("Registro realizado com sucesso! Faça login para continuar.");
        navigate("/"); // Redireciona para a tela de login
      } else {
        console.error("Erro ao registrar:", data.message);
        alert("Erro ao registrar: " + data.message);
      }
    } catch (err) {
      console.error("Erro ao registrar:", err);
      alert("Erro inesperado ao registrar.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nome" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Senha" onChange={handleChange} required />
      <button type="submit">Registrar</button>
    </form>
  );
}
