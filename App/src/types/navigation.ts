export type AppRoutes = {
  '/(auth)': {
    register: undefined;
    login: undefined;
  };
  '/(landing)': {
    index: undefined;
  };
  '/(tabs)': {
    index: undefined;
    explore: undefined;
    'room-sharing': undefined;
  };
  'modal': undefined;
};

export type RouteParams = {
  role?: 'student' | 'owner';
};