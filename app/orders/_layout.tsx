import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="index" options={{ presentation: 'card' }} />
      <Stack.Screen 
        name="customerApproval" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="customerDetails" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
    </Stack>
  );
}