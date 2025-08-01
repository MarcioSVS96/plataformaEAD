const express = require("express")
const {
  enrollInCourse,
  getMyEnrollments,
  getCourseProgress,
  updateLessonProgress,
} = require("../controllers/enrollmentController")
const { authenticateToken, authorize } = require("../middleware/auth")

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(authenticateToken)

// Rotas para estudantes
router.post("/courses/:courseId", authorize("student", "admin"), enrollInCourse)
router.get("/my-courses", authorize("student", "admin"), getMyEnrollments)
router.get("/courses/:courseId/progress", authorize("student", "admin"), getCourseProgress)
router.put("/lessons/:lessonId/progress", authorize("student", "admin"), updateLessonProgress)

module.exports = router
