import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';

// ─── Section component ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    
    
    return (
        <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
}

function Para({ children }: { children: React.ReactNode }) {
    
    
    return <Text style={styles.para}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
    
    
    return (
        <View style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{children}</Text>
        </View>
    );
}

// ─── Terms of Service content ─────────────────────────────────────────────────
function TermsContent() {
    
    
    return (
        <>
            <Para>
                These Terms of Service ("Terms") govern your use of the Chama mobile application ("App"), operated by Chama Technologies Ltd ("we", "us", or "our"). By accessing or using the App, you agree to be bound by these Terms.
            </Para>

            <Section title="1. Eligibility">
                <Para>You must be at least 18 years old and a resident of Kenya to use Chama. By registering, you confirm that the information you provide is accurate, current, and complete.</Para>
            </Section>

            <Section title="2. Account Registration">
                <Para>You are responsible for maintaining the security of your account credentials. You agree to:</Para>
                <Bullet>Provide a valid Kenyan phone number for verification.</Bullet>
                <Bullet>Not share your password or account access with any third party.</Bullet>
                <Bullet>Notify us immediately at support@chama.app of any unauthorised access.</Bullet>
                <Bullet>Accept full responsibility for all activity that occurs under your account.</Bullet>
            </Section>

            <Section title="3. Identity Verification">
                <Para>To create or join a Chama, you must complete our identity verification process, which includes uploading a valid Kenyan National ID. This information is processed securely and used solely to verify your identity and comply with Kenya's Anti-Money Laundering (AML) requirements under the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA).</Para>
            </Section>

            <Section title="4. Chama Formation & Governance">
                <Para>Chamas formed on our platform are voluntary savings groups. The Admin of each Chama is responsible for:</Para>
                <Bullet>Setting contribution amounts, schedules, and member limits.</Bullet>
                <Bullet>Managing payouts fairly and in accordance with the group's agreed rules.</Bullet>
                <Bullet>Communicating transparently with members about financial decisions.</Bullet>
                <Para>We are not liable for disputes arising between Chama members. All internal disputes should first be resolved within the group.</Para>
            </Section>

            <Section title="5. Contributions & Payments">
                <Para>All monetary transactions within the App are processed via M-Pesa (Safaricom). Platform fees apply:</Para>
                <Bullet>Ksh 500 one-time onboarding fee per Chama created.</Bullet>
                <Bullet>Ksh 10–30 per member transaction, depending on amount.</Bullet>
                <Para>We do not hold your funds. Contributions are tracked on our platform but transferred via M-Pesa directly. We are not responsible for M-Pesa service interruptions or failures.</Para>
            </Section>

            <Section title="6. Prohibited Conduct">
                <Para>You agree not to use the App to:</Para>
                <Bullet>Engage in fraud, money laundering, or any illegal financial activity.</Bullet>
                <Bullet>Create fake Chamas to collect funds from others deceptively.</Bullet>
                <Bullet>Harass, threaten, or abuse other members.</Bullet>
                <Bullet>Circumvent or attempt to bypass our security measures.</Bullet>
                <Bullet>Use the App for any commercial purpose not explicitly authorised by us.</Bullet>
            </Section>

            <Section title="7. Termination">
                <Para>We reserve the right to suspend or permanently terminate your account if we determine, at our sole discretion, that you have violated these Terms, engaged in fraudulent activity, or posed a risk to the platform or other users. You may delete your account at any time from Settings.</Para>
            </Section>

            <Section title="8. Limitation of Liability">
                <Para>To the fullest extent permitted by Kenyan law, Chama Technologies Ltd shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including loss of funds due to member default, M-Pesa service failures, or unauthorised account access.</Para>
            </Section>

            <Section title="9. Governing Law">
                <Para>These Terms are governed by the laws of the Republic of Kenya. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.</Para>
            </Section>

            <Section title="10. Changes to Terms">
                <Para>We may update these Terms periodically. We will notify you of significant changes via in-app notification or SMS. Continued use of the App after changes constitutes acceptance of the revised Terms.</Para>
            </Section>

            <Section title="11. Contact Us">
                <Para>For questions about these Terms, contact us at:</Para>
                <Bullet>Email: legal@chama.app</Bullet>
                <Bullet>Phone: +254 700 000 000</Bullet>
                <Bullet>Address: Westlands, Nairobi, Kenya</Bullet>
            </Section>

            <Text style={styles.lastUpdated}>Last updated: February 2026</Text>
        </>
    );
}

// ─── Privacy Policy content ───────────────────────────────────────────────────
function PrivacyContent() {
    
    
    return (
        <>
            <Para>
                Chama Technologies Ltd ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share your data when you use the Chama App.
            </Para>

            <Section title="1. Information We Collect">
                <Para>We collect the following categories of information:</Para>
                <Bullet><Text style={{ fontWeight: '700' }}>Identity data:</Text> Full name, national ID number, date of birth, ID card photos.</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Contact data:</Text> Phone number, email address (optional).</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Financial data:</Text> Contribution amounts, M-Pesa transaction references (not full payment credentials).</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Usage data:</Text> App activity, device type, OS version, crash logs.</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Communications:</Text> Messages sent within Chama group chats.</Bullet>
            </Section>

            <Section title="2. How We Use Your Information">
                <Para>We use your data to:</Para>
                <Bullet>Verify your identity and prevent fraud.</Bullet>
                <Bullet>Create and manage your account and Chama memberships.</Bullet>
                <Bullet>Process and track financial contributions and payouts.</Bullet>
                <Bullet>Send you notifications about Chama activity and updates.</Bullet>
                <Bullet>Comply with legal obligations under Kenyan law (e.g. AML/KYC).</Bullet>
                <Bullet>Improve and personalise the App experience.</Bullet>
            </Section>

            <Section title="3. Identity Verification & OCR">
                <Para>When you upload your National ID, our system uses optical character recognition (OCR) powered by Google Cloud Vision to extract and verify your name and ID number. Your ID images are processed securely and are not shared with unauthorised third parties. Images are deleted from our servers after verification is complete.</Para>
            </Section>

            <Section title="4. M-Pesa Integration">
                <Para>Payment processing is handled by Safaricom's M-Pesa platform. We receive only transaction confirmation references. We do not store your M-Pesa PIN or full payment credentials. Please refer to Safaricom's Privacy Policy for how they handle your payment data.</Para>
            </Section>

            <Section title="5. Data Sharing">
                <Para>We do not sell your personal data. We may share data with:</Para>
                <Bullet><Text style={{ fontWeight: '700' }}>Service providers:</Text> Google Cloud (OCR/Vision), MongoDB Atlas (database hosting), Safaricom (payments).</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Legal authorities:</Text> When required by Kenyan law or a valid court order.</Bullet>
                <Bullet><Text style={{ fontWeight: '700' }}>Other Chama members:</Text> Your name and profile photo are visible to members of Chamas you join.</Bullet>
            </Section>

            <Section title="6. Data Retention">
                <Para>We retain your personal data for as long as your account is active or as required by law. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law (e.g. financial transaction records, which we retain for 7 years under the Kenya Revenue Authority's requirements).</Para>
            </Section>

            <Section title="7. Your Rights">
                <Para>Under the Kenya Data Protection Act, 2019, you have the right to:</Para>
                <Bullet>Access the personal data we hold about you.</Bullet>
                <Bullet>Request correction of inaccurate data.</Bullet>
                <Bullet>Request deletion of your data (subject to legal obligations).</Bullet>
                <Bullet>Object to or restrict processing of your data.</Bullet>
                <Bullet>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC).</Bullet>
                <Para>To exercise your rights, contact privacy@chama.app.</Para>
            </Section>

            <Section title="8. Security">
                <Para>We use industry-standard security measures including:</Para>
                <Bullet>TLS/HTTPS encryption for all data in transit.</Bullet>
                <Bullet>Encrypted storage for sensitive data at rest.</Bullet>
                <Bullet>JWT-based authentication with token expiry.</Bullet>
                <Bullet>Access controls limiting who can view your data internally.</Bullet>
                <Para>Despite these measures, no system is completely secure. In the event of a data breach, we will notify affected users within 72 hours as required by the Kenya Data Protection Act.</Para>
            </Section>

            <Section title="9. Children's Privacy">
                <Para>Chama is not intended for use by persons under the age of 18. We do not knowingly collect personal data from children. If we discover a minor has registered, we will promptly delete their account.</Para>
            </Section>

            <Section title="10. Changes to This Policy">
                <Para>We may update this Privacy Policy from time to time. We will notify you of material changes via in-app notification or SMS. Your continued use of the App following notification constitutes your acceptance of the updated policy.</Para>
            </Section>

            <Section title="11. Contact & Data Controller">
                <Para>Chama Technologies Ltd is the data controller. For privacy enquiries:</Para>
                <Bullet>Email: privacy@chama.app</Bullet>
                <Bullet>Phone: +254 700 000 000</Bullet>
                <Bullet>Address: Westlands, Nairobi, Kenya</Bullet>
                <Bullet>ODPC Registration: (pending)</Bullet>
            </Section>

            <Text style={styles.lastUpdated}>Last updated: February 2026</Text>
        </>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function TermsPrivacyScreen({ navigation, route }: any) {
    
    
    const initialTab = route?.params?.tab || 'terms';
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} />

            {/* Watermark */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.06 }}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {(['terms', 'privacy'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={tab === 'terms' ? 'document-text-outline' : 'shield-checkmark-outline'}
                            size={16}
                            color={activeTab === tab ? BG_WHITE : PRIMARY_GREEN}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Page title */}
                <View style={styles.pageTitleWrap}>
                    <View style={styles.pageTitleBadge}>
                        <Ionicons
                            name={activeTab === 'terms' ? 'document-text' : 'shield-checkmark'}
                            size={28}
                            color={PRIMARY_GREEN}
                        />
                    </View>
                    <Text style={styles.pageTitle}>
                        {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                    </Text>
                    <Text style={styles.pageSubtitle}>
                        {activeTab === 'terms'
                            ? 'Please read these terms carefully before using Chama.'
                            : 'We take your privacy seriously. Here is how we protect your data.'}
                    </Text>
                </View>

                {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}

                <View style={{ height: 48 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_WHITE },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: BG_WHITE,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F4F4F4',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },

    /* Tabs */
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 4,
        backgroundColor: '#EEF4EF',
        borderRadius: 14,
        padding: 4,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 11,
    },
    tabActive: {
        backgroundColor: PRIMARY_GREEN,
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tabText: { fontSize: 13, fontWeight: '700', color: PRIMARY_GREEN },
    tabTextActive: { color: BG_WHITE },

    /* Scroll */
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

    /* Page title block */
    pageTitleWrap: { alignItems: 'center', paddingTop: 28, paddingBottom: 24 },
    pageTitleBadge: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
    },
    pageTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    pageSubtitle: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

    /* Sections */
    section: { marginBottom: 20 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    sectionDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: PRIMARY_GREEN,
        marginRight: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', flex: 1 },

    /* Text */
    para: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 10 },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingLeft: 4 },
    bulletDot: { fontSize: 14, color: PRIMARY_GREEN, marginRight: 10, lineHeight: 22 },
    bulletText: { fontSize: 14, color: '#555', lineHeight: 22, flex: 1 },

    lastUpdated: {
        fontSize: 12, color: '#AAAAAA', textAlign: 'center',
        marginTop: 28, marginBottom: 4,
        fontStyle: 'italic',
    },
});
