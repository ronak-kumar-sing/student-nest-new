import { Stack } from 'expo-router';

export default function OwnerAuthLayout() {
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
          headerTitle: 'Owner Login',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="signup"
        options={{ 
          headerTitle: 'Owner Registration',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}