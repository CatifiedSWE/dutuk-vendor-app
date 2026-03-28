import { useMarkRead, useMessages, useSendMessage, useTypingIndicator } from '@/features/chat/hooks';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, Send } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

const ConversationScreen = () => {
    const { id, name, avatar } = useLocalSearchParams<{ id: string; name?: string; avatar?: string }>();
    const { user } = useAuthStore();
    const { data: messages = [], isLoading } = useMessages(id);
    const sendMessage = useSendMessage(id);
    const markRead = useMarkRead(id);
    const { startTyping, stopTyping } = useTypingIndicator(id);

    useEffect(() => {
        markRead.mutate();
    }, [id]);

    const onSend = useCallback(
        (newMessages: IMessage[] = []) => {
            const text = newMessages[0]?.text;
            if (text) {
                sendMessage.mutate(text);
            }
        },
        [sendMessage]
    );

    const renderSend = useCallback((props: any) => (
        <Send {...props} containerStyle={styles.sendContainer}>
            <View style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
            </View>
        </Send>
    ), []);

    const renderBubble = useCallback((props: any) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: '#800000',
                    borderRadius: 18,
                    padding: 4,
                },
                left: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 4,
                    borderWidth: 1,
                    borderColor: 'rgba(128, 0, 0, 0.04)',
                },
            }}
            textStyle={{
                right: { color: '#FFFFFF', fontSize: 15 },
                left: { color: '#1c1917', fontSize: 15 },
            }}
        />
    ), []);

    const handleInputTextChanged = useCallback((text: string) => {
        if (text.length > 0) startTyping();
        else stopTyping();
    }, [startTyping, stopTyping]);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#800000" />
                    </Pressable>
                    <View style={styles.userInfo}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{(name || 'C').charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View>
                            <Text style={styles.userName}>{name || 'Customer'}</Text>
                            <Text style={styles.userStatus}>Online</Text>
                        </View>
                    </View>
                    <Pressable style={styles.callButton}>
                        <Ionicons name="call-outline" size={20} color="#800000" />
                    </Pressable>
                </View>
            </SafeAreaView>

            <View style={styles.chatContainer}>
                <GiftedChat
                    messages={messages as IMessage[]}
                    onSend={onSend}
                    user={{
                        _id: user?.id || '',
                        name: 'Vendor',
                    }}
                    renderAvatar={null}
                    renderSend={renderSend}
                    renderBubble={renderBubble}
                    alwaysShowSend
                    onInputTextChanged={handleInputTextChanged}
                    placeholder="Type a message..."
                    isLoadingEarlier={isLoading}
                    infiniteScroll
                    bottomOffset={Platform.OS === 'ios' ? 0 : 0}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf8f5' },
    header: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(128, 0, 0, 0.04)', shadowColor: "#800000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
    backButton: { padding: 4, marginRight: 12 },
    userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(128, 0, 0, 0.08)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#800000', fontWeight: '700', fontSize: 16 },
    userName: { fontSize: 16, fontWeight: '700', color: '#1c1917' },
    userStatus: { fontSize: 12, color: '#34c759', fontWeight: '600' },
    callButton: { padding: 10, backgroundColor: 'rgba(128, 0, 0, 0.05)', borderRadius: 12 },
    chatContainer: { flex: 1 },
    sendContainer: { justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginRight: 10, marginBottom: 5 },
    sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center' },
});

export default ConversationScreen;
