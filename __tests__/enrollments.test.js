const request = require("supertest")
const app = require("../src/app")
const { pool } = require("../src/config/database")

describe("Enrollments Endpoints", () => {
  let studentToken
  let instructorToken
  let courseId
  let lessonId

  beforeAll(async () => {
    // Limpar dados de teste
    await pool.execute("DELETE FROM enrollments WHERE id > 0")
    await pool.execute('DELETE FROM courses WHERE title LIKE "%Enrollment Test%"')
    await pool.execute('DELETE FROM users WHERE email LIKE "%enrolltest%"')

    // Criar usuários de teste
    const studentResponse = await request(app).post("/api/auth/register").send({
      name: "Test Student Enroll",
      email: "student.enrolltest@example.com",
      password: "Test123456",
      role: "student",
    })
    studentToken = studentResponse.body.token

    const instructorResponse = await request(app).post("/api/auth/register").send({
      name: "Test Instructor Enroll",
      email: "instructor.enrolltest@example.com",
      password: "Test123456",
      role: "instructor",
    })
    instructorToken = instructorResponse.body.token

    // Criar curso de teste
    const courseResponse = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({
        title: "Enrollment Test Course",
        description: "Curso para testar matrículas",
        category: "Test",
        level: "beginner",
      })
    courseId = courseResponse.body.course.id

    // Publicar o curso
    await pool.execute("UPDATE courses SET is_published = true WHERE id = ?", [courseId])

    // Criar módulo e aula de teste
    const [moduleResult] = await pool.execute(
      "INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)",
      [courseId, "Módulo Teste", "Descrição do módulo", 1],
    )

    const [lessonResult] = await pool.execute(
      "INSERT INTO lessons (module_id, title, content, duration, order_index) VALUES (?, ?, ?, ?, ?)",
      [moduleResult.insertId, "Aula Teste", "Conteúdo da aula", 600, 1],
    )
    lessonId = lessonResult.insertId
  })

  afterAll(async () => {
    // Limpar dados de teste
    await pool.execute("DELETE FROM enrollments WHERE id > 0")
    await pool.execute('DELETE FROM courses WHERE title LIKE "%Enrollment Test%"')
    await pool.execute('DELETE FROM users WHERE email LIKE "%enrolltest%"')
    await pool.end()
  })

  describe("POST /api/enrollments/courses/:courseId", () => {
    it("deve matricular estudante em curso", async () => {
      const response = await request(app)
        .post(`/api/enrollments/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(201)

      expect(response.body).toHaveProperty("message", "Matrícula realizada com sucesso")
      expect(response.body).toHaveProperty("enrollment")
      expect(response.body.enrollment.course_id).toBe(courseId)
    })

    it("deve retornar erro para matrícula duplicada", async () => {
      const response = await request(app)
        .post(`/api/enrollments/courses/${courseId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(409)

      expect(response.body).toHaveProperty("error", "Já matriculado neste curso")
    })

    it("deve retornar erro para curso inexistente", async () => {
      const response = await request(app)
        .post("/api/enrollments/courses/99999")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(404)

      expect(response.body).toHaveProperty("error", "Curso não encontrado ou não disponível")
    })
  })

  describe("GET /api/enrollments/my-courses", () => {
    it("deve listar cursos do estudante", async () => {
      const response = await request(app)
        .get("/api/enrollments/my-courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("enrollments")
      expect(response.body).toHaveProperty("pagination")
      expect(Array.isArray(response.body.enrollments)).toBe(true)
      expect(response.body.enrollments.length).toBeGreaterThan(0)
    })
  })

  describe("GET /api/enrollments/courses/:courseId/progress", () => {
    it("deve retornar progresso do curso", async () => {
      const response = await request(app)
        .get(`/api/enrollments/courses/${courseId}/progress`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200)

      expect(response.body).toHaveProperty("modules")
      expect(response.body).toHaveProperty("stats")
      expect(Array.isArray(response.body.modules)).toBe(true)
    })

    it("deve retornar erro para curso não matriculado", async () => {
      // Criar outro curso
      const anotherCourseResponse = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({
          title: "Another Test Course",
          description: "Outro curso para teste",
          category: "Test",
          level: "beginner",
        })

      const response = await request(app)
        .get(`/api/enrollments/courses/${anotherCourseResponse.body.course.id}/progress`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(404)

      expect(response.body).toHaveProperty("error", "Matrícula não encontrada")
    })
  })

  describe("PUT /api/enrollments/lessons/:lessonId/progress", () => {
    it("deve atualizar progresso da aula", async () => {
      const progressData = {
        completed: true,
        watchedDuration: 600,
      }

      const response = await request(app)
        .put(`/api/enrollments/lessons/${lessonId}/progress`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send(progressData)
        .expect(200)

      expect(response.body).toHaveProperty("message", "Progresso atualizado com sucesso")
    })

    it("deve retornar erro para aula inexistente", async () => {
      const response = await request(app)
        .put("/api/enrollments/lessons/99999/progress")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ completed: true })
        .expect(404)

      expect(response.body).toHaveProperty("error", "Aula não encontrada ou acesso negado")
    })
  })
})
