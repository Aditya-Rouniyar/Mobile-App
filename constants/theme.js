// themes.js
const theme = {
    dark: {
        colors: {
            // Primary colors
            primary: '#875cf6',
            primaryBlur: '#442170',
            primary10: '#ff7cff',
            primary20: '#ff8fff',
            primary30: '#ffa1ff',
            primary40: '#ffb1ff',
            primary50: '#ffc1ff',

            modal: '#1d1d2a',
            // Surface colors
            surface: '#090110',
            surface10: '#1A0B20',
            surface15: '#14081A',
            surface20: '#36353a',
            surface30: '#22122E',
            surface40: '#0D0216',
            surface50: '#251735',
            surface60: '#302040',
            // Tonal surface colors
            surfaceTonal: '#1d1220', // Equivalent to --clr-surface-tonal-a0
            surfaceTonal10: '#322735', // Equivalent to --clr-surface-tonal-a10
            surfaceTonal20: '#483e4b', // Equivalent to --clr-surface-tonal-a20
            surfaceTonal30: '#605762', // Equivalent to --clr-surface-tonal-a30
            surfaceTonal40: '#78717a', // Equivalent to --clr-surface-tonal-a40
            surfaceTonal50: '#928b93', // Equivalent to --clr-surface-tonal-a50

            // Additional colors (placeholders from your example)
            background: '#121212', // Dark background
            card: '#1E1E2E', // Slightly lighter dark color for cards or containers
            text: '#E1E1E1', // Light gray for text
            accent: '#8A2BE2', // Bright purple accent color
            placeholder: '#757575', // Muted gray for placeholders
            border: '#333', // Subtle border color
            notification: '#FF4081', // Pink for notifications or badges

            badge: 'rgba(79, 69, 77, 0.5)',
        },
        typography: {
            medium: '500',
            semiBold: '600',
            bold: '700',
            extraBold: '800',

            header: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#E1E1E1',
            },
            subheader: {
                fontSize: 18,
                fontWeight: '600',
                color: '#B3B3B3',
            },
            body: {
                fontSize: 14,
                fontWeight: '400',
                color: '#E1E1E1',
            },
            small: {
                fontSize: 12,
                fontWeight: '300',
                color: '#757575',
            },
        },
        buttons: {
            primary: {
                backgroundColor: '#8A2BE2',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: 12,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
            },
            secondary: {
                backgroundColor: 'transparent',
                color: '#8A2BE2',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#8A2BE2',
                padding: 12,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
            },
        },
        input: {
            backgroundColor: '#1E1E2E',
            color: '#E1E1E1',
            borderWidth: 1,
            borderColor: '#333',
            borderRadius: 8,
            padding: 12,
            placeholderTextColor: '#757575',
            fontSize: 16,
        },
    },
    radius: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 22,
    }
};

export default theme;
