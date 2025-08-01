import React, { useState } from 'react';
import { loginUser } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser({ email, password });
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" onChange={e => setEmail(e.target.value)} value={email} placeholder="Email" />
      <input type="password" onChange={e => setPassword(e.target.value)} value={password} placeholder="Senha" />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;
