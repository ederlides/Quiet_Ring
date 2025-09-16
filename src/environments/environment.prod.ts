export const environment = {
  production: true,
  api: {
    baseUrl: 'https://app.quietring.us:8443/api-quiet-ring',
    socketUrl: 'https://app.quietring.us:3000',
    otp: {
      generate: 'https://app.quietring.us:8443/api-quiet-ring/otp/generate',
      validate: 'https://app.quietring.us:8443/api-quiet-ring/otp/validate'
    }
  },
  external: {
    flagCdn: 'https://flagcdn.com/w40',
    fonts: {
      google: 'https://fonts.googleapis.com',
      googleStatic: 'https://fonts.gstatic.com'
    }
  },
  app: {
    name: 'Quiet Ring',
    version: '1.0.0',
    activateUrl: 'https://quietring.com/activate'
  }
};
