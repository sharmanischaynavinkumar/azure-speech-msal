import React from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from '@azure/msal-react';
import SignInButton from './components/SignInButton';
import SignOutButton from './components/SignOutButton';
import SpeechRecognition from './components/SpeechRecognition';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();

  const userName = isAuthenticated && accounts.length > 0 
    ? accounts[0].name || accounts[0].username 
    : '';

  return (
    <div className="app">
      <header className="header">
        <h1>Azure Speech MSAL App</h1>
        <AuthenticatedTemplate>
          <div className="user-info">
            <span className="user-name">Welcome, {userName}!</span>
            <SignOutButton />
          </div>
        </AuthenticatedTemplate>
      </header>

      <main>
        <UnauthenticatedTemplate>
          <div className="auth-container">
            <h2>🔐 Authentication Required</h2>
            <p>
              Please sign in with your Microsoft account to access the speech recognition features.
              This app uses Azure Active Directory for secure authentication.
            </p>
            <SignInButton />
          </div>
        </UnauthenticatedTemplate>

        <AuthenticatedTemplate>
          <SpeechRecognition />
        </AuthenticatedTemplate>
      </main>
    </div>
  );
}

export default App;
