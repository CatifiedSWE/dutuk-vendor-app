import { useDeleteEvent, useEventById, useUpdateEvent } from '@/features/events/hooks';
import { useImageUpload } from '@/features/profile/hooks';
import { useUIStore } from '@/store/uiStore';
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"] as const;

const EventDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: event, isLoading, refetch } = useEventById(id);
    const updateMutation = useUpdateEvent();
    const deleteMutation = useDeleteEvent();
    const uploadImageMutation = useImageUpload();
    const showToast = useUIStore((state: any) => state.showToast);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [payment, setPayment] = useState("");
    const [status, setStatus] = useState<typeof STATUSES[number]>("upcoming");
    const [eventDate, setEventDate] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setTitle(event.event || "");
            setDescription(event.description || "");
            setPayment(event.payment ? String(event.payment) : "");
            setStatus(event.status as any);
            setEventDate(event.start_date || "");
            setImageUrl(event.image_url);
        }
    }, [event]);

    const handlePickImage = async () => {
        try {
            const url = await uploadImageMutation.mutateAsync({ bucket: 'event-images', folder: 'events' });
            if (url) {
                setImageUrl(url);
            }
        } catch (error) {
            console.error("Image pick/upload failed:", error);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !eventDate.trim()) {
            showToast({ type: 'error', title: 'Missing Info', message: 'Title and Date are required' });
            return;
        }

        try {
            await updateMutation.mutateAsync({
                eventId: id,
                params: {
                    event: title.trim(),
                    description: description.trim() || undefined,
                    start_date: eventDate.trim() || undefined,
                    payment: payment ? Number.parseFloat(payment) : undefined,
                    status: status,
                    image_url: imageUrl || undefined,
                }
            });
            setIsEditing(false);
            refetch();
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMutation.mutateAsync(id);
                            router.back();
                        } catch (error) {
                            console.error("Delete failed:", error);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading && !event) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#800000" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={24} color="#800000" />
                        </Pressable>
                        <Text style={styles.headerTitle}>{isEditing ? "Edit Event" : "Event Details"}</Text>
                        <Pressable onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.iconButton}>
                            <Ionicons name={isEditing ? "save" : "create-outline"} size={24} color="#800000" />
                        </Pressable>
                    </View>

                    {/* Image Section */}
                    <Pressable
                        style={[styles.imageContainer, isEditing && styles.imageContainerEditing]}
                        onPress={() => isEditing && handlePickImage()}
                        disabled={!isEditing || uploadImageMutation.isPending}
                    >
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image-outline" size={48} color="#e7e5e4" />
                            </View>
                        )}
                        {isEditing && (
                            <View style={styles.imageOverlay}>
                                {uploadImageMutation.isPending ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Ionicons name="camera" size={32} color="#FFF" />
                                )}
                            </View>
                        )}
                    </Pressable>

                    <View style={styles.card}>
                        {!isEditing ? (
                            <>
                                <View style={styles.detailRow}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.priceText}>₹{payment || "0"}</Text>
                                </View>
                                <Text style={styles.titleText}>{title}</Text>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#57534e" />
                                    <Text style={styles.dateText}>{eventDate}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.descriptionLabel}>About this event</Text>
                                <Text style={styles.descriptionText}>{description || "No description provided."}</Text>
                            </>
                        ) : (
                            <View style={styles.editForm}>
                                <Text style={styles.label}>Event Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Event Title"
                                />

                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.multiline]}
                                    multiline
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Enter description"
                                />

                                <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={eventDate}
                                    onChangeText={setEventDate}
                                    placeholder="YYYY-MM-DD"
                                />

                                <Text style={styles.label}>Payment (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="decimal-pad"
                                    value={payment}
                                    onChangeText={setPayment}
                                    placeholder="0.00"
                                />

                                <Text style={styles.label}>Status</Text>
                                <View style={styles.statusGrid}>
                                    {STATUSES.map((s) => (
                                        <Pressable
                                            key={s}
                                            style={[styles.statusOption, status === s && styles.statusOptionActive]}
                                            onPress={() => setStatus(s)}
                                        >
                                            <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>
                                                {s.toUpperCase()}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {isEditing && (
                        <Pressable style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            <Text style={styles.deleteButtonText}>Delete Event</Text>
                        </Pressable>
                    )}

                    {!isEditing && (
                        <Pressable style={styles.secondaryButton} onPress={() => setIsEditing(true)}>
                            <Text style={styles.secondaryButtonText}>Edit Details</Text>
                        </Pressable>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#faf8f5" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { padding: 24 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#800000' },
    iconButton: { padding: 8, backgroundColor: "#FFF", borderRadius: 12, shadowColor: "#800000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    imageContainer: { width: '100%', height: 250, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFF', marginBottom: 24, shadowColor: "#800000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 },
    imageContainerEditing: { borderWidth: 2, borderColor: '#800000', borderStyle: 'dashed' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffcfc' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: "rgba(128, 0, 0, 0.04)", shadowColor: "#800000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusBadge: { backgroundColor: 'rgba(128, 0, 0, 0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)' },
    statusText: { fontSize: 11, fontWeight: '700', color: '#800000', letterSpacing: 0.5 },
    priceText: { fontSize: 20, fontWeight: '700', color: '#800000' },
    titleText: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginBottom: 8, letterSpacing: -0.5 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
    dateText: { fontSize: 15, color: '#57534e', fontWeight: '500' },
    divider: { height: 1, backgroundColor: 'rgba(128, 0, 0, 0.06)', marginVertical: 20 },
    descriptionLabel: { fontSize: 13, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
    descriptionText: { fontSize: 16, color: "#57534e", lineHeight: 24 },
    editForm: { width: '100%' },
    label: { fontSize: 13, fontWeight: "700", color: "#a8a29e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
    input: { borderWidth: 1, borderColor: "#e7e5e4", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF", fontSize: 15, color: "#1c1917" },
    multiline: { minHeight: 100, textAlignVertical: "top" },
    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    statusOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e7e5e4' },
    statusOptionActive: { backgroundColor: '#800000', borderColor: '#800000' },
    statusOptionText: { fontSize: 12, fontWeight: '600', color: '#57534e' },
    statusOptionTextActive: { color: '#FFF' },
    secondaryButton: { paddingVertical: 18, borderRadius: 16, alignItems: "center", borderWidth: 1.5, borderColor: '#800000' },
    secondaryButtonText: { color: "#800000", fontSize: 16, fontWeight: "700" },
    deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, marginBottom: 16 },
    deleteButtonText: { color: "#FF3B30", fontSize: 16, fontWeight: "700" },
});

export default EventDetailScreen;
