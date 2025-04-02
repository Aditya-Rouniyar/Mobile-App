import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RichEditor } from 'react-native-pell-rich-editor';

const RichTextEditor = ({ editorRef, onChange}) => {

    // Function to check and remove <img> tags
    const removeImgTags = (text) => {
        const hasImg = /<img[^>]*>/gi.test(text);
        if (hasImg) {
            const sanitizedText = text.replace(/<img[^>]*>/gi, '');
            return { sanitizedText, hasImg };
        }
        return { sanitizedText: text, hasImg: false };
    };

    // Handle content change and check for <img> tags
    const handleContentChange = (text) => {
        const { sanitizedText, hasImg } = removeImgTags(text);
        onChange(sanitizedText);
        if (hasImg && editorRef?.current) {
            editorRef.current.setContentHTML(sanitizedText); // Update content if <img> was found
        }
    };

    // Handle paste event and sanitize after pasting
    const handlePaste = (text) => {
        editorRef.current.insertText(text);
        const { sanitizedText, hasImg } = removeImgTags(text);
        if (hasImg && editorRef?.current) {
            onChange(sanitizedText);
            editorRef.current.setContentHTML(sanitizedText); // Update sanitized content
        }
    };

    return (
        <View style={{ minHeight: 126 }}>
            <RichEditor
                ref={editorRef}
                containerStyle={styles.richContainer}
                editorStyle={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    contentCSSText: `
                        font-family: sans-serif; 
                        font-size: 18px;
                    `,
                }}
                placeholder="What's on your mind 👀"
                onChange={handleContentChange} // Handle content change
                onPaste={handlePaste} // Handle paste event
                nestedScrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    richContainer: {
        minHeight: 240,
        flex: 1,
        padding: 5,
    },
});

export default RichTextEditor;
