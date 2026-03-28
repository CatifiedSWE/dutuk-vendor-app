import { useOrderNotifications } from '@/features/orders/hooks';
import { Badge } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
    const { newOrderCount, markOrdersAsSeen } = useOrderNotifications();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#7C2A2A',
                tabBarInactiveTintColor: '#808080',
                freezeOnBlur: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                    height: 80,
                    paddingBottom: 16,
                    paddingTop: 16,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '400',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, focused }) => (
                        <View>
                            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
                            <Badge count={newOrderCount} />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        if (newOrderCount > 0) markOrdersAsSeen();
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
