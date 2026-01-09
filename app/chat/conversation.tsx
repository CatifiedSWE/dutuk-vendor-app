import { useConversation } from '@/hooks/chat/useConversations';
import { Message, useMarkAsRead, useMessages, useSendMessage } from '@/hooks/chat/useMessages';
import getUser from '@/hooks/getUser';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { AlertCircle, ArrowLeft, CheckCircle, Send } from 'react-native-feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ConversationScreen() {
    const params = useLocalSearchParams<{
        conversationId: string;
        customerName: string;
        customerId: string;
        paymentCompleted: string;
    }>();

    const { conversationId, customerName, customerId, paymentCompleted: paymentCompletedParam } = params;
    const paymentCompleted = paymentCompletedParam === 'true';

    const [message, setMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Hooks
    const { messages, loading: messagesLoading, error: messagesError } = useMessages(
        conversationId || null,
        paymentCompleted
    );
    const { conversation } = useConversation(conversationId || null);
    const { sendMessage, loading: sending } = useSendMessage();
    const { markAsRead } = useMarkAsRead();

    // Get current user ID
    useEffect(() => {
        const fetchUser = async () => {
            const user = await getUser();
            if (user?.id) {
                setCurrentUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    // Mark messages as read when entering conversation
    useEffect(() => {
        if (conversationId) {
            markAsRead(conversationId);
        }
    }, [conversationId, markAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = async () => {
        if (!message.trim() || !conversationId || !customerId) return;

        const result = await sendMessage(
            {
                conversationId,
                receiverId: customerId,
                text: message.trim(),
            },
            paymentCompleted
        );

        if (result.success) {
            setMessage('');
        } else if (result.error) {
            Toast.show({
                type: 'error',
                text1: 'Cannot send message',
                text2: result.error,
                position: 'top',
            });
        }
    };

    const formatMessageTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isOwn = item.sender_id === currentUserId;
        const showTimestamp = true; // Could optimize to show only for first/last in group

        return (
            <View style={[styles.messageWrapper, isOwn ? styles.ownMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
                        {item.message_text}
                    </Text>
                </View>
                {showTimestamp && (
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
                        {isOwn && item.is_read && (
                            <CheckCircle width={12} height={12} stroke="#22C55E" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyMessages = () => (
        <View style={styles.emptyMessagesContainer}>
            <Text style={styles.emptyMessagesText}>No messages yet. Start the conversation!</Text>
        </View>
    );

    // Loading state
    if (messagesLoading && messages.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft width={24} height={24} stroke="#1A1A1A" />
                    </Pressable>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>{customerName}</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C2A2A" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft width={24} height={24} stroke="#1A1A1A" />
                </Pressable>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{customerName}</Text>
                    {paymentCompleted && (
                        <View style={styles.paymentBadge}>
                            <CheckCircle width={12} height={12} stroke="#22C55E" />
                            <Text style={styles.paymentBadgeText}>Payment Verified</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Contact Info Warning */}
            {!paymentCompleted && (
                <View style={styles.warningBanner}>
                    <AlertCircle width={16} height={16} stroke="#B45309" />
                    <Text style={styles.warningText}>
                        Contact sharing is blocked until payment is completed
                    </Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
            >
                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={[
                        styles.messagesContainer,
                        messages.length === 0 && styles.emptyListStyle,
                    ]}
                    ListEmptyComponent={renderEmptyMessages}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                />

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#999999"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={1000}
                        editable={!sending}
                    />
                    <Pressable
                        style={[
                            styles.sendButton,
                            (!message.trim() || sending) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!message.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Send width={20} height={20} stroke="#FFFFFF" />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    paymentBadgeText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#22C55E',
        fontWeight: '500',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF3C7',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    warningText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#B45309',
    },
    keyboardContainer: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        flexGrow: 1,
    },
    emptyListStyle: {
        justifyContent: 'center',
    },
    messageWrapper: {
        marginVertical: 4,
        maxWidth: '80%',
    },
    ownMessageWrapper: {
        alignSelf: 'flex-end',
    },
    otherMessageWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    ownBubble: {
        backgroundColor: '#7C2A2A',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#1A1A1A',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    messageTime: {
        fontSize: 11,
        color: '#999999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1A1A1A',
        marginRight: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#7C2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#C0C0C0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessagesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMessagesText: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
    },
});
