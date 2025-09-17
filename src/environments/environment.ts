// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: {
    baseUrl: 'http://localhost:8080',
    socketUrl: 'https://app.quietring.us:3000',
    otp: {
      generate: 'http://127.0.0.1:8080/api-quiet-ring/otp/generate',
      validate: 'http://127.0.0.1:8080/api-quiet-ring/otp/validate'
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
