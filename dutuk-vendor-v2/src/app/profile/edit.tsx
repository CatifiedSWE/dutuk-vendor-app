import { useCompanyInfo, useImageUpload, useUpdateCompany } from '@/features/profile/hooks';
import { Avatar, Button, Input, Screen } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const editSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditProfileScreen() {
    const companyQuery = useCompanyInfo();
    const updateCompany = useUpdateCompany();
    const imageUpload = useImageUpload();

    const company = companyQuery.data;

    const { control, handleSubmit, formState: { errors } } = useForm<EditForm>({
        resolver: zodResolver(editSchema),
        values: {
            name: company?.name || '',
            description: company?.description || '',
            phone: company?.phone || '',
            email: company?.email || '',
            website: company?.website || '',
            address: company?.address || '',
            city: company?.city || '',
        },
    });

    const onSubmit = (data: EditForm) => {
        updateCompany.mutate(data);
    };

    const handlePhotoChange = async () => {
        const url = await imageUpload.mutateAsync({ bucket: 'profile-images' });
        if (url) {
            updateCompany.mutate({ logo_url: url });
        }
    };

    return (
        <Screen safeArea scrollable padded>
            <View className="flex-row items-center justify-between py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
                <View className="w-6" />
            </View>

            {/* Profile Photo */}
            <TouchableOpacity className="items-center mt-4 mb-6" onPress={handlePhotoChange}>
                <Avatar source={company?.logo_url} name={company?.name} size="xl" />
                <Text className="mt-2 text-sm text-primary font-medium">Change Photo</Text>
            </TouchableOpacity>

            <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Company Name" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.name?.message} />
            )} />

            <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Description" multiline numberOfLines={4} onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />

            <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Phone" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />

            <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Business Email" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
            )} />

            <Controller control={control} name="website" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Website" keyboardType="url" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />

            <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Address" onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />

            <Controller control={control} name="city" render={({ field: { onChange, onBlur, value } }) => (
                <Input label="City" onBlur={onBlur} onChangeText={onChange} value={value} />
            )} />

            <Button
                title="Save Changes"
                onPress={handleSubmit(onSubmit)}
                isLoading={updateCompany.isPending}
                fullWidth
                size="lg"
                className="mt-4 mb-8"
            />
        </Screen>
    );
}
