import { useLogout } from '@/features/auth/hooks';
import { useCompanyInfo } from '@/features/profile/hooks';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const companyQuery = useCompanyInfo();
    const logout = useLogout();
    const showToast = useUIStore((state: any) => state.showToast);

    const menuItems = [
        {
            icon: 'person-outline',
            title: 'Edit Profile',
            subtitle: 'Update your information',
            onPress: () => router.push('/profile/edit')
        },
        {
            icon: 'briefcase-outline',
            title: 'Portfolio',
            subtitle: 'Showcase your work',
            onPress: () => router.push('/profile/portfolio')
        },
        {
            icon: 'star-outline',
            title: 'Reviews & History',
            subtitle: 'View your reputation',
            onPress: () => router.push('/profile/reviews')
        },
        {
            icon: 'document-text-outline',
            title: 'Services',
            subtitle: 'Manage your offerings',
            onPress: () => router.push('/profile/services')
        },
        {
            icon: 'lock-closed-outline',
            title: 'Change Password',
            subtitle: 'Update security settings',
            onPress: () => router.push('/profile/change-password')
        },
        {
            icon: 'chatbubbles-outline',
            title: 'Help & Support',
            subtitle: 'Get assistance from us',
            onPress: () => router.push('/profile/help')
        },
    ];

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
            showToast({ type: 'success', title: 'Logout Successful', message: 'Logged out successfully' });
            router.replace('/auth/login');
        } catch (error) {
            showToast({ type: 'error', title: 'Logout Failed', message: 'Failed to logout' });
        }
    };

    if (companyQuery.isLoading && !companyQuery.data) {
        return (
            <View className="flex-1 justify-center items-center bg-[#FDFCFB]">
                <ActivityIndicator size="large" color="#7C2A2A" />
            </View>
        );
    }

    const companyData = companyQuery.data;

    return (
        <View className="flex-1 bg-[#FDFCFB]">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top + 40,
                    paddingBottom: insets.bottom + 40,
                    paddingHorizontal: 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View className="items-center mb-10">
                    <Pressable
                        onPress={() => router.push("/profile/edit")}
                        className="mb-4"
                    >
                        <View className="relative w-[120px] h-[120px] rounded-full p-1 bg-white border border-gray-100 items-center justify-center shadow-sm">
                            <Image
                                source={{ uri: companyData?.logo_url || PLACEHOLDER_AVATAR }}
                                className="w-[108px] h-[108px] rounded-full bg-gray-50"
                            />
                            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#7C2A2A] border-4 border-[#FDFCFB] items-center justify-center shadow-lg">
                                <Ionicons name="camera" size={16} color="#FFF" />
                            </View>
                        </View>
                    </Pressable>

                    <Text className="text-3xl font-bold text-gray-900 tracking-tighter mb-1">
                        {companyData?.name || "Vendor Name"}
                    </Text>
                    <Text className="text-gray-500 text-center px-6">
                        {companyData?.description || "Professional Service Provider"}
                    </Text>
                </View>

                {/* Settings Items */}
                <View className="mb-6">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">
                        Account & Settings
                    </Text>
                    {menuItems.map((item, index) => (
                        <Pressable
                            key={index}
                            className="flex-row items-center p-4 bg-white rounded-2xl mb-3 border border-gray-50 shadow-sm active:bg-gray-50 active:scale-[0.99]"
                            onPress={item.onPress}
                        >
                            <View className="w-11 h-11 rounded-xl bg-[#7C2A2A]/5 items-center justify-center mr-4">
                                <Ionicons name={item.icon as any} size={22} color="#7C2A2A" />
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-base font-semibold text-gray-900 leading-tight">
                                    {item.title}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-0.5">
                                    {item.subtitle}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                        </Pressable>
                    ))}
                </View>

                {/* Logout Button */}
                <Pressable
                    className="flex-row items-center justify-center py-4 bg-white rounded-2xl border border-[#7C2A2A]/10 active:bg-[#7C2A2A]/5 active:scale-[0.99]"
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#7C2A2A" className="mr-2" />
                    <Text className="text-base font-semibold text-[#7C2A2A]">
                        Sign Out
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;
