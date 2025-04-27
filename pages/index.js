import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="container">
      <header>
        <h1>BonsaiWay</h1>
        <nav>
          {user ? (
            <button onClick={signOut}>Sign Out</button>
          ) : (
            <div>
              <Link href="/auth/signin">
                <a className="nav-link">Sign In</a>
              </Link>
              <Link href="/auth/signup">
                <a className="nav-link">Sign Up</a>
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main>
        {user ? (
          <div>
            <h2>Welcome, {user.email}!</h2>
            <p>You are signed in to BonsaiWay.</p>
            {/* Add your authenticated content here */}
          </div>
        ) : (
          <div>
            <h2>Welcome to BonsaiWay</h2>
            <p>Please sign in to access your bonsai dashboard.</p>
            {/* Add your public content here */}
          </div>
        )}
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BonsaiWay. All rights reserved.</p>
      </footer>
    </div>
  );
}
