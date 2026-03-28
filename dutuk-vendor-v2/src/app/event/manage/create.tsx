import { useCreateEvent } from '@/features/events/hooks';
import { useImageUpload } from '@/features/profile/hooks';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateEventScreen = () => {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventImageUrl, setEventImageUrl] = useState<string | null>(null);

    const createEventMutation = useCreateEvent();
    const uploadImageMutation = useImageUpload();
    const showToast = useUIStore((state: any) => state.showToast);

    const handlePickImage = async () => {
        try {
            const url = await uploadImageMutation.mutateAsync({ bucket: 'event-images', folder: 'events' });
            if (url) {
                setEventImageUrl(url);
            }
        } catch (error) {
            console.error("Image pick/upload failed:", error);
        }
    };

    const handleSave = async () => {
        if (!eventName.trim() || !eventDate.trim()) {
            showToast({ type: 'error', title: 'Missing Info', message: 'Title and Date are required' });
            return;
        }

        try {
            await createEventMutation.mutateAsync({
                event: eventName.trim(),
                description: description.trim() || undefined,
                date: eventDate.trim() ? [eventDate.trim()] : [],
                start_date: eventDate.trim() || undefined,
                payment: price ? Number.parseFloat(price) : undefined,
                image_url: eventImageUrl || undefined,
                company_name: '',
                customer_id: '',
            });
            router.back();
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#800000" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Create Event</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Event Image</Text>
                        <Pressable style={styles.imagePicker} onPress={handlePickImage} disabled={uploadImageMutation.isPending}>
                            {eventImageUrl ? (
                                <Image source={{ uri: eventImageUrl }} style={styles.imagePreview} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    {uploadImageMutation.isPending ? (
                                        <ActivityIndicator color="#800000" />
                                    ) : (
                                        <>
                                            <Ionicons name="camera-outline" size={40} color="#800000" />
                                            <Text style={styles.imagePlaceholderText}>Upload Event Image</Text>
                                        </>
                                    )}
                                </View>
                            )}
                            {eventImageUrl && !uploadImageMutation.isPending && (
                                <View style={styles.editImageBadge}>
                                    <Ionicons name="pencil" size={12} color="#FFF" />
                                </View>
                            )}
                        </Pressable>

                        <Text style={styles.label}>Event Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={eventName}
                            onChangeText={setEventName}
                            placeholder="e.g. Dream Wedding Reception"
                            placeholderTextColor="#a8a29e"
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.multiline]}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell customers what to expect..."
                            placeholderTextColor="#a8a29e"
                        />

                        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
                        <TextInput
                            style={styles.input}
                            value={eventDate}
                            onChangeText={setEventDate}
                            placeholder="2025-12-25"
                            placeholderTextColor="#a8a29e"
                        />

                        <Text style={styles.label}>Starting Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="0.00"
                            placeholderTextColor="#a8a29e"
                        />
                    </View>

                    <Pressable
                        style={[styles.saveButton, createEventMutation.isPending && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={createEventMutation.isPending}
                    >
                        {createEventMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Create Event</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    content: { padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#800000' },
    backButton: { padding: 4 },
    section: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: "rgba(128, 0, 0, 0.04)", shadowColor: "#800000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 },
    label: { fontSize: 13, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
    input: { borderWidth: 1, borderColor: "#e7e5e4", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", fontSize: 15, color: "#1c1917" },
    multiline: { minHeight: 100, textAlignVertical: "top" },
    imagePicker: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fffcfc', borderWidth: 2, borderColor: 'rgba(128, 0, 0, 0.1)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', position: 'relative' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { marginTop: 8, color: '#800000', fontWeight: '600', fontSize: 14 },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    editImageBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#800000', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    saveButton: { backgroundColor: "#800000", paddingVertical: 18, borderRadius: 16, alignItems: "center", shadowColor: "#800000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4 },
    saveButtonDisabled: { opacity: 0.7 },
    saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
});

export default CreateEventScreen;
