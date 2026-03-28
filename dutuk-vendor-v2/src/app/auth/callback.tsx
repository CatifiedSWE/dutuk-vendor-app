import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

// Ensure the web browser auth session is completed (resolves openAuthSessionAsync)
WebBrowser.maybeCompleteAuthSession();

/**
 * OAuth callback screen.
 * This screen exists as the deep-link target for the OAuth redirect.
 * The actual session exchange is handled by the useGoogleAuth hook in
 * response to openAuthSessionAsync resolving. This screen just ensures
 * maybeCompleteAuthSession() fires to dismiss the Chrome Custom Tab.
 */
export default function CallbackScreen() {
    useEffect(() => {
        // maybeCompleteAuthSession at module level handles dismissing
        // the Chrome Custom Tab. This screen will briefly flash during
        // the redirect, then the useGoogleAuth hook navigates away.
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-background">
            <ActivityIndicator size="large" color="#7C2A2A" />
            <Text className="mt-4 text-muted">Completing sign in...</Text>
        </View>
    );
}
