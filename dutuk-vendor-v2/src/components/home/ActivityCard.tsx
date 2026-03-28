import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ActivityCardProps {
    title: string;
    count: number;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    pendingCount?: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, count, icon, onPress, pendingCount }) => {
    return (
        <Pressable style={styles.requestsCard} onPress={onPress}>
            <View style={styles.requestsContent}>
                <View style={styles.requestsIconWrapper}>
                    <Ionicons name={icon} size={22} color="#800000" />
                    {pendingCount !== undefined && pendingCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>
                                {pendingCount > 99 ? '99+' : pendingCount}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.requestsText}>
                    <Text style={styles.requestsTitle}>{title}</Text>
                    <Text style={styles.requestsCount}>{count} {title.toLowerCase().includes('inquir') ? 'pending' : 'new'}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    requestsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 22, padding: 26, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.06)', shadowColor: '#800000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06, shadowRadius: 16, elevation: 3,
    },
    requestsContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    requestsIconWrapper: {
        position: 'relative', width: 50, height: 50, backgroundColor: 'rgba(128, 0, 0, 0.08)',
        borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    },
    notificationBadge: {
        position: 'absolute', top: -5, right: -5, backgroundColor: '#FF3B30', borderRadius: 12,
        minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
        borderWidth: 2, borderColor: '#faf8f5',
    },
    notificationBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
    requestsText: { marginLeft: 18, flex: 1 },
    requestsTitle: { fontSize: 16, fontWeight: '700', color: '#1c1917', marginBottom: 6, letterSpacing: -0.2 },
    requestsCount: { fontSize: 14, color: '#57534e', fontWeight: '500' },
});

export default React.memo(ActivityCard);
