const { pool } = require("../config/database")
const bcrypt = require("bcryptjs")

async function createUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10)

  const sql = "INSERT INTO users (email, password) VALUES (?, ?)"
  const params = [email, hashedPassword]

  try {
    const [result] = await pool.execute(sql, params)
    return result.insertId
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("E-mail já cadastrado")
    }
    throw error
  }
}

async function findUserByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ?"
  const [rows] = await pool.execute(sql, [email])
  return rows[0]
}

module.exports = { createUser, findUserByEmail }
