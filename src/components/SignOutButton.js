import React from 'react';
import { useMsal } from '@azure/msal-react';

const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error('Logout failed:', e);
    });
  };

  return (
    <button className="btn btn-secondary" onClick={handleLogout}>
      Sign Out
    </button>
  );
};

export default SignOutButton;
