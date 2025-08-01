const { pool } = require("../config/database")

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user.id

    // Verificar se o curso existe e está publicado
    const [courses] = await pool.execute(
      "SELECT id, title, is_published FROM courses WHERE id = ? AND is_published = true",
      [courseId],
    )

    if (courses.length === 0) {
      return res.status(404).json({ error: "Curso não encontrado ou não disponível" })
    }

    // Verificar se já está matriculado
    const [existingEnrollment] = await pool.execute(
      "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
      [studentId, courseId],
    )

    if (existingEnrollment.length > 0) {
      return res.status(409).json({ error: "Já matriculado neste curso" })
    }

    // Criar matrícula
    const [result] = await pool.execute("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)", [
      studentId,
      courseId,
    ])

    const [enrollment] = await pool.execute(
      `SELECT e.*, c.title as course_title, u.name as student_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON e.student_id = u.id
       WHERE e.id = ?`,
      [result.insertId],
    )

    res.status(201).json({
      message: "Matrícula realizada com sucesso",
      enrollment: enrollment[0],
    })
  } catch (error) {
    console.error("Erro ao matricular:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const [enrollments] = await pool.execute(
      `SELECT e.*, c.title, c.description, c.thumbnail, c.level,
              u.name as instructor_name,
              COUNT(DISTINCT l.id) as total_lessons,
              COUNT(DISTINCT lp.id) as completed_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN modules m ON c.id = m.course_id
       LEFT JOIN lessons l ON m.id = l.module_id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = e.student_id AND lp.completed = true
       WHERE e.student_id = ?
       GROUP BY e.id
       ORDER BY e.enrolled_at DESC
       LIMIT ? OFFSET ?`,
      [studentId, Number.parseInt(limit), Number.parseInt(offset)],
    )

    // Calcular progresso
    const enrollmentsWithProgress = enrollments.map((enrollment) => ({
      ...enrollment,
      progress:
        enrollment.total_lessons > 0 ? Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100) : 0,
    }))

    res.json({
      enrollments: enrollmentsWithProgress,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar matrículas:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user.id

    // Verificar matrícula
    const [enrollment] = await pool.execute("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?", [
      studentId,
      courseId,
    ])

    if (enrollment.length === 0) {
      return res.status(404).json({ error: "Matrícula não encontrada" })
    }

    // Buscar progresso detalhado
    const [progress] = await pool.execute(
      `SELECT 
         m.id as module_id,
         m.title as module_title,
         m.order_index as module_order,
         l.id as lesson_id,
         l.title as lesson_title,
         l.duration,
         l.order_index as lesson_order,
         lp.completed,
         lp.watched_duration,
         lp.completed_at
       FROM modules m
       JOIN lessons l ON m.id = l.module_id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
       WHERE m.course_id = ?
       ORDER BY m.order_index, l.order_index`,
      [studentId, courseId],
    )

    // Organizar por módulos
    const moduleMap = new Map()

    progress.forEach((item) => {
      if (!moduleMap.has(item.module_id)) {
        moduleMap.set(item.module_id, {
          id: item.module_id,
          title: item.module_title,
          order_index: item.module_order,
          lessons: [],
        })
      }

      moduleMap.get(item.module_id).lessons.push({
        id: item.lesson_id,
        title: item.lesson_title,
        duration: item.duration,
        order_index: item.lesson_order,
        completed: !!item.completed,
        watched_duration: item.watched_duration || 0,
        completed_at: item.completed_at,
      })
    })

    const modules = Array.from(moduleMap.values())

    // Calcular estatísticas
    const totalLessons = progress.length
    const completedLessons = progress.filter((p) => p.completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    res.json({
      modules,
      stats: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar progresso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params
    const { completed, watchedDuration } = req.body
    const studentId = req.user.id

    // Verificar se a aula existe e se o estudante está matriculado
    const [lesson] = await pool.execute(
      `SELECT l.id, l.duration, m.course_id
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN enrollments e ON m.course_id = e.course_id
       WHERE l.id = ? AND e.student_id = ?`,
      [lessonId, studentId],
    )

    if (lesson.length === 0) {
      return res.status(404).json({ error: "Aula não encontrada ou acesso negado" })
    }

    // Atualizar ou criar progresso
    await pool.execute(
      `INSERT INTO lesson_progress (student_id, lesson_id, completed, watched_duration, completed_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       completed = VALUES(completed),
       watched_duration = VALUES(watched_duration),
       completed_at = VALUES(completed_at)`,
      [studentId, lessonId, completed, watchedDuration || 0, completed ? new Date() : null],
    )

    // Atualizar progresso geral do curso
    const courseId = lesson[0].course_id
    await updateCourseProgress(studentId, courseId)

    res.json({ message: "Progresso atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar progresso:", error)
    res.status(500).json({ error: "Erro interno do servidor" })
  }
}

const updateCourseProgress = async (studentId, courseId) => {
  try {
    // Calcular progresso do curso
    const [progressData] = await pool.execute(
      `SELECT 
         COUNT(l.id) as total_lessons,
         COUNT(lp.id) as completed_lessons
       FROM modules m
       JOIN lessons l ON m.id = l.module_id
       LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ? AND lp.completed = true
       WHERE m.course_id = ?`,
      [studentId, courseId],
    )

    const { total_lessons, completed_lessons } = progressData[0]
    const progress = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0

    // Atualizar matrícula
    await pool.execute(
      `UPDATE enrollments 
       SET progress = ?, completed_at = ?
       WHERE student_id = ? AND course_id = ?`,
      [progress, progress === 100 ? new Date() : null, studentId, courseId],
    )
  } catch (error) {
    console.error("Erro ao atualizar progresso do curso:", error)
  }
}

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getCourseProgress,
  updateLessonProgress,
}
