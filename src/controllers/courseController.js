const { validationResult } = require("express-validator")
const { pool } = require("../config/database")

const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, category, level, price } = req.body
    const instructorId = req.user.id

    const [result] = await pool.execute(
      "INSERT INTO courses (title, description, instructor_id, category, level, price) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, instructorId, category, level, price || 0],
    )

    const [newCourse] = await pool.execute(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c 
       JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = ?`,
      [result.insertId],
    )

    res.status(201).json({
      message: "Curso criado com sucesso",
      course: newCourse[0],
    })
  } catch (error) {
    console.error("Erro ao criar curso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, instructor_id } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE c.is_published = true"
    const params = []

    if (category) {
      whereClause += " AND c.category = ?"
      params.push(category)
    }

    if (level) {
      whereClause += " AND c.level = ?"
      params.push(level)
    }

    if (instructor_id) {
      whereClause += " AND c.instructor_id = ?"
      params.push(instructor_id)
    }

    // Se for admin, mostrar todos os cursos
    if (req.user && req.user.role === "admin") {
      whereClause = whereClause.replace("WHERE c.is_published = true", "WHERE 1=1")
    }

    const query = `
      SELECT c.*, u.name as instructor_name,
             COUNT(e.id) as enrolled_students
      FROM courses c 
      JOIN users u ON c.instructor_id = u.id 
      LEFT JOIN enrollments e ON c.id = e.course_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [courses] = await pool.execute(query, params)

    // Contar total de cursos
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM courses c 
      JOIN users u ON c.instructor_id = u.id 
      ${whereClause.replace("LIMIT ? OFFSET ?", "")}
    `

    const [countResult] = await pool.execute(
      countQuery,
      params.slice(0, -2), // Remove limit e offset
    )

    res.json({
      courses,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar cursos:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params

    const [courses] = await pool.execute(
      `SELECT c.*, u.name as instructor_name, u.avatar as instructor_avatar
       FROM courses c 
       JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = ?`,
      [id],
    )

    if (courses.length === 0) {
      return res.status(404).json({ error: "Curso não encontrado" })
    }

    const course = courses[0]

    // Buscar módulos e aulas
    const [modules] = await pool.execute(
      `SELECT m.*, 
              COUNT(l.id) as lessons_count,
              SUM(l.duration) as total_duration
       FROM modules m 
       LEFT JOIN lessons l ON m.id = l.module_id
       WHERE m.course_id = ?
       GROUP BY m.id
       ORDER BY m.order_index`,
      [id],
    )

    // Buscar estatísticas do curso
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(DISTINCT e.student_id) as enrolled_students,
         AVG(ea.score) as average_score,
         COUNT(DISTINCT cert.id) as certificates_issued
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN exams ex ON c.id = ex.course_id
       LEFT JOIN exam_attempts ea ON ex.id = ea.exam_id AND ea.passed = true
       LEFT JOIN certificates cert ON c.id = cert.course_id
       WHERE c.id = ?`,
      [id],
    )

    res.json({
      course: {
        ...course,
        modules,
        stats: stats[0],
      },
    })
  } catch (error) {
    console.error("Erro ao buscar curso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { title, description, category, level, price } = req.body

    // Verificar se o curso existe e se o usuário tem permissão
    const [courses] = await pool.execute("SELECT instructor_id FROM courses WHERE id = ?", [id])

    if (courses.length === 0) {
      return res.status(404).json({ error: "Curso não encontrado" })
    }

    if (req.user.role !== "admin" && courses[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    await pool.execute(
      "UPDATE courses SET title = ?, description = ?, category = ?, level = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [title, description, category, level, price, id],
    )

    const [updatedCourse] = await pool.execute(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c 
       JOIN users u ON c.instructor_id = u.id 
       WHERE c.id = ?`,
      [id],
    )

    res.json({
      message: "Curso atualizado com sucesso",
      course: updatedCourse[0],
    })
  } catch (error) {
    console.error("Erro ao atualizar curso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se o curso existe e se o usuário tem permissão
    const [courses] = await pool.execute("SELECT instructor_id FROM courses WHERE id = ?", [id])

    if (courses.length === 0) {
      return res.status(404).json({ error: "Curso não encontrado" })
    }

    if (req.user.role !== "admin" && courses[0].instructor_id !== req.user.id) {
      return res.status(403).json({ error: "Acesso negado" })
    }

    await pool.execute("DELETE FROM courses WHERE id = ?", [id])

    res.json({ message: "Curso excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir curso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const approveCourse = async (req, res) => {
  try {
    const { id } = req.params
    const { approved } = req.body

    await pool.execute("UPDATE courses SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      approved,
      id,
    ])

    res.json({
      message: `Curso ${approved ? "aprovado" : "rejeitado"} com sucesso`,
    })
  } catch (error) {
    console.error("Erro ao aprovar curso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  approveCourse,
}
