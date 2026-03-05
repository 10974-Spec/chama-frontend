import { TextStyle } from 'react-native';

export const fonts = {
    bold: 'Poppins_700Bold',
    semiBold: 'Poppins_600SemiBold',
    medium: 'Poppins_500Medium',
    regular: 'Poppins_400Regular',
    light: 'Poppins_300Light',
} as const;

export const typography: Record<string, TextStyle> = {
    h1: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36 },
    h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30 },
    h3: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 26 },
    h4: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 24 },
    body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
    bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 22 },
    small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
    smallMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
    caption: { fontFamily: fonts.light, fontSize: 11, lineHeight: 16 },
    button: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 22 },
    amount: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32 },
};
