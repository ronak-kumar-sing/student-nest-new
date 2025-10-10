const ENV = {
  development: {
    APP_NAME: 'Student Nest',
    APP_URL: 'https://student-nest-for.vercel.app/',
    API_URL: 'https://student-nest-for.vercel.app/api',
    MONGODB_URI: 'mongodb+srv://ronakkumar20062006:WcQd5ZksggAwO1oT@cluster0.969t4yr.mongodb.net/student-nest',
    JWT_SECRET: '2b9ecfec7253b488efd94bc40594b63f',
    JWT_REFRESH_SECRET: '2b9ecfec7253b488efd94bc40594b63f',
    JWT_EXPIRES_IN: '7d',
  },
  production: {
    APP_NAME: 'Student Nest',
    APP_URL: 'https://student-nest-for.vercel.app/',
    API_URL: 'https://student-nest-for.vercel.app/api',
    MONGODB_URI: 'mongodb+srv://ronakkumar20062006:WcQd5ZksggAwO1oT@cluster0.969t4yr.mongodb.net/student-nest',
    JWT_SECRET: '2b9ecfec7253b488efd94bc40594b63f',
    JWT_REFRESH_SECRET: '2b9ecfec7253b488efd94bc40594b63f',
    JWT_EXPIRES_IN: '7d',
  }
};

export default function getEnvVars() {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, false when published.
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
}