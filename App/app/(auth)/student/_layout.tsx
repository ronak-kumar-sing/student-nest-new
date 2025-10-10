import { Stack } from 'expo-router';

export default function StudentAuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerStyle: {
        backgroundColor: '#0a0a0b',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        color: '#fff',
      },
    }}>
      <Stack.Screen 
        name="login"
        options={{ 
          headerTitle: 'Student Login',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="signup"
        options={{ 
          headerTitle: 'Student Registration',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}