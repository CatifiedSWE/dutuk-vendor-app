import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Events", headerShown: true }} />
            <Stack.Screen name="pastEvents" options={{ title: "Past Events", headerShown: true }} />
            <Stack.Screen name="currentEvents" options={{ title: "Current Events", headerShown: true }} />
            <Stack.Screen name="upcomingEvents" options={{ title: "Upcoming Events", headerShown: true }} />
            <Stack.Screen name="manage/create" options={{ title: "Create Event", headerShown: false }} />
            <Stack.Screen name="manage/createStepOne" options={{ title: "Create Event Step 1", headerShown: false }} />
            <Stack.Screen name="manage/createStepTwo" options={{ title: "Create Event Step 2", headerShown: false }} />
            <Stack.Screen name="manage/[eventId]" options={{ title: "Edit Event", headerShown: false }} />
        </Stack>
    );
};
export default Layout;