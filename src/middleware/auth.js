const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token de acesso requerido" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const [rows] = await pool.execute(
      "SELECT id, name, email, role, is_active FROM users WHERE id = ? AND is_active = true",
      [decoded.id],
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo" })
    }

    req.user = rows[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuário não autenticado" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Acesso negado. Permissões insuficientes",
      })
    }

    next()
  }
}

const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id
      const userId = req.user.id

      let query
      let params

      switch (resourceType) {
        case "course":
          query = "SELECT instructor_id FROM courses WHERE id = ?"
          params = [resourceId]
          break
        case "enrollment":
          query = "SELECT student_id FROM enrollments WHERE id = ?"
          params = [resourceId]
          break
        default:
          return res.status(400).json({ error: "Tipo de recurso inválido" })
      }

      const [rows] = await pool.execute(query, params)

      if (rows.length === 0) {
        return res.status(404).json({ error: "Recurso não encontrado" })
      }

      const ownerId = rows[0].instructor_id || rows[0].student_id

      if (req.user.role === "admin" || ownerId === userId) {
        next()
      } else {
        res.status(403).json({ error: "Acesso negado ao recurso" })
      }
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" })
    }
  }
}

module.exports = {
  authenticateToken,
  authorize,
  checkOwnership,
}
