// Environment and config constants
// ⚠️  Change this to your production domain before building an APK for release.
//     e.g. 'https://api.speedcopy.in'
const DEV_API_URL = 'https://speedcopy-backend-sms7.onrender.com';
const PROD_API_URL = 'https://speedcopy-backend-sms7.onrender.com'; // TODO: set your production URL here

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
