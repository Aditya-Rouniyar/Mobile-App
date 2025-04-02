import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React from 'react'
const ios = Platform.OS == 'ios';
const KeyboardView = ({ children, inChat }) => {
    let scrollConfig = {};
    if (inChat) {
        scrollConfig = { contentContainerStyle: { flex: 1 } };
    }
    return (
        <KeyboardAvoidingView behavior={ios ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} bounces={false} showsVerticalScrollIndicator={false}{...scrollConfig}>
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default KeyboardView