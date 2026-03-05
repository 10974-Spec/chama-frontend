import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PRIMARY_GREEN = '#2A5C3F';
const PRIMARY_GREEN_LIGHT = '#3A7D54';
const BG_WHITE = '#FFFFFF';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    type?: AlertType;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
}

const TYPE_CONFIG: Record<AlertType, { icon: string; colors: [string, string, string]; iconBg: string }> = {
    success: {
        icon: 'checkmark-circle',
        colors: [PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28'],
        iconBg: '#E8F5E9',
    },
    error: {
        icon: 'close-circle',
        colors: ['#E53935', '#C62828', '#B71C1C'],
        iconBg: '#FFEBEE',
    },
    warning: {
        icon: 'warning',
        colors: ['#FB8C00', '#E65100', '#BF360C'],
        iconBg: '#FFF3E0',
    },
    info: {
        icon: 'information-circle',
        colors: ['#1E88E5', '#1565C0', '#0D47A1'],
        iconBg: '#E3F2FD',
    },
};

export default function CustomAlert({
    visible,
    type = 'info',
    title,
    message,
    buttons,
    onDismiss,
}: CustomAlertProps) {
    const config = TYPE_CONFIG[type];

    const defaultButtons: AlertButton[] = buttons?.length
        ? buttons
        : [{ text: 'OK', onPress: onDismiss }];

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Icon header with gradient strip */}
                    <LinearGradient
                        colors={config.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.topBar}
                    />

                    {/* Icon badge */}
                    <View style={[styles.iconBadge, { backgroundColor: config.iconBg }]}>
                        <Ionicons
                            name={config.icon as any}
                            size={36}
                            color={config.colors[1]}
                        />
                    </View>

                    {/* Text content */}
                    <View style={styles.body}>
                        <Text style={styles.title}>{title}</Text>
                        {!!message && <Text style={styles.message}>{message}</Text>}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Action buttons */}
                    <View style={[
                        styles.btnRow,
                        defaultButtons.length === 1 && { justifyContent: 'center' }
                    ]}>
                        {defaultButtons.map((btn, i) => {
                            const isDestructive = btn.style === 'destructive';
                            const isCancel = btn.style === 'cancel';
                            const isPrimary = !isCancel && !isDestructive;

                            if (isPrimary) {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.primaryBtnWrap}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            btn.onPress?.();
                                            onDismiss?.();
                                        }}
                                    >
                                        <LinearGradient
                                            colors={config.colors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.primaryBtn}
                                        >
                                            <Text style={styles.primaryBtnText}>{btn.text}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                );
                            }

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.secondaryBtn,
                                        isDestructive && styles.destructiveBtn,
                                    ]}
                                    activeOpacity={0.75}
                                    onPress={() => {
                                        btn.onPress?.();
                                        onDismiss?.();
                                    }}
                                >
                                    <Text style={[
                                        styles.secondaryBtnText,
                                        isDestructive && { color: '#E53935' },
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ── Hook for imperative usage ── */
export function useCustomAlert() {
    const [alertState, setAlertState] = React.useState<{
        visible: boolean;
        type: AlertType;
        title: string;
        message?: string;
        buttons?: AlertButton[];
    }>({ visible: false, type: 'info', title: '' });

    const showAlert = React.useCallback((
        type: AlertType,
        title: string,
        message?: string,
        buttons?: AlertButton[],
    ) => {
        setAlertState({ visible: true, type, title, message, buttons });
    }, []);

    const hideAlert = React.useCallback(() => {
        setAlertState(s => ({ ...s, visible: false }));
    }, []);

    const AlertComponent = React.useCallback(() => (
        <CustomAlert
            visible={alertState.visible}
            type={alertState.type}
            title={alertState.title}
            message={alertState.message}
            buttons={alertState.buttons}
            onDismiss={hideAlert}
        />
    ), [alertState, hideAlert]);

    return { showAlert, hideAlert, AlertComponent };
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    card: {
        width: '100%',
        backgroundColor: BG_WHITE,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
    },
    topBar: {
        height: 6,
        width: '100%',
    },
    iconBadge: {
        alignSelf: 'center',
        marginTop: 24,
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 19,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 0,
    },
    btnRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    primaryBtnWrap: {
        flex: 1,
        borderRadius: 999,
        overflow: 'hidden',
    },
    primaryBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    primaryBtnText: {
        color: BG_WHITE,
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        backgroundColor: '#F2F2F2',
    },
    destructiveBtn: {
        backgroundColor: '#FFEBEE',
    },
    secondaryBtnText: {
        color: '#555',
        fontSize: 15,
        fontWeight: '600',
    },
});
