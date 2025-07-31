// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
    authority: process.env.REACT_APP_AZURE_AUTHORITY || '',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// MSAL request configuration
export const loginRequest = {
  scopes: ['User.Read'],
};

// Azure Speech Service configuration
export const speechConfig = {
  url: process.env.REACT_APP_SPEECH_URL || '',
  region: process.env.REACT_APP_SPEECH_REGION || '',
  resourceId: process.env.REACT_APP_SPEECH_RESOURCE_ID || '',
};
