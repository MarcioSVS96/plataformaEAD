const { body } = require("express-validator")

const registerValidation = [
  body("name").trim().isLength({ min: 2, max: 255 }).withMessage("Nome deve ter entre 2 e 255 caracteres"),

  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter pelo menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"),

  body("role")
    .optional()
    .isIn(["admin", "instructor", "student"])
    .withMessage("Role deve ser admin, instructor ou student"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),

  body("password").notEmpty().withMessage("Senha é obrigatória"),
]

const updateProfileValidation = [
  body("name").trim().isLength({ min: 2, max: 255 }).withMessage("Nome deve ter entre 2 e 255 caracteres"),
]

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
}
