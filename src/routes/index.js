// backend/index.js ou app.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Aqui pode ser sua lógica real, com banco de dados
  if (email === 'admin@example.com' && password === '123456') {
    return res.json({
      token: 'fake-jwt-token',
      user: {
        name: 'Admin',
        email,
      },
    });
  }

  return res.status(401).json({ message: 'Credenciais inválidas' });
});

app.listen(3001, () => {
  console.log('API rodando em http://localhost:3001');
});
