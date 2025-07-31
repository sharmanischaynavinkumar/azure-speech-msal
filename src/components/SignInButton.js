import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config';

const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error('Login failed:', e);
    });
  };

  return (
    <button className="btn" onClick={handleLogin}>
      Sign In with Microsoft
    </button>
  );
};

export default SignInButton;
