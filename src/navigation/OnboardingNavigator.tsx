import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import IdentitySetupScreen from '../screens/onboarding/IdentitySetupScreen';
import OnboardingQuestionsScreen from '../screens/onboarding/OnboardingQuestionsScreen';
import CreateChamaFlow from '../screens/onboarding/CreateChamaFlow';
import JoinChamaFlow from '../screens/onboarding/JoinChamaFlow';
import FeatureWalkthroughScreen from '../screens/onboarding/FeatureWalkthroughScreen';
import FirstActionPromptScreen from '../screens/onboarding/FirstActionPromptScreen';
import TermsPrivacyScreen from '../screens/main/TermsPrivacyScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="IdentitySetupScreen" component={IdentitySetupScreen} />
            <Stack.Screen name="OnboardingQuestionsScreen" component={OnboardingQuestionsScreen} />

            {/* The final specific flows */}
            <Stack.Screen name="CreateChamaFlow" component={CreateChamaFlow} />
            <Stack.Screen name="JoinChamaFlow" component={JoinChamaFlow} />
            <Stack.Screen name="FeatureWalkthroughScreen" component={FeatureWalkthroughScreen} />
            <Stack.Screen name="FirstActionPromptScreen" component={FirstActionPromptScreen} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
        </Stack.Navigator>
    );
}
