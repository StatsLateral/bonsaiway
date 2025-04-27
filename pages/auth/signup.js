import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await signUp({ email, password });
      if (error) throw error;
      setMessage('Check your email for the confirmation link.');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Sign Up</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <Link href="/auth/signin">
          <a>Sign In</a>
        </Link>
      </p>
    </div>
  );
}
