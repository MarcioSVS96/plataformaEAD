const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const { pool } = require("../config/database")

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password, role = "student" } = req.body

    // Verificar se usuário já existe
    const [existingUser] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email já está em uso" })
    }

    // Hash da senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar usuário
    const [result] = await pool.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      role,
    ])

    // Buscar usuário criado
    const [newUser] = await pool.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [
      result.insertId,
    ])

    const token = generateToken(newUser[0])

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: newUser[0],
      token,
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Buscar usuário
    const [users] = await pool.execute("SELECT id, name, email, password, role, is_active FROM users WHERE email = ?", [
      email,
    ])

    if (users.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    const user = users[0]

    if (!user.is_active) {
      return res.status(401).json({ error: "Conta desativada" })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" })
    }

    const token = generateToken(user)

    // Remover senha da resposta
    delete user.password

    res.json({
      message: "Login realizado com sucesso",
      user,
      token,
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?", [
      req.user.id,
    ])

    if (users.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    res.json({ user: users[0] })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name } = req.body
    const userId = req.user.id

    await pool.execute("UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [name, userId])

    const [updatedUser] = await pool.execute(
      "SELECT id, name, email, role, avatar, updated_at FROM users WHERE id = ?",
      [userId],
    )

    res.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
}
