import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerStyle: {
        backgroundColor: '#0a0a0b',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        color: '#fff',
      },
    }}>
      <Stack.Screen name="student" options={{ headerTitle: 'Student Access' }} />
      <Stack.Screen name="owner" options={{ headerTitle: 'Owner Access' }} />
    </Stack>
  );
}