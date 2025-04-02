import React, { memo, useEffect, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import MessageItem from './MessageItem'

const SCROLL_THRESHOLD = 600;

const MessageList = memo(({ messages, currentUser, otherUser }) => {
    const scrollViewRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true); // Track if user is at the bottom
    const [firstLoad, setFirstLoad] = useState(true);

    // Function to scroll to bottom
    const scrollToBottom = (animated = false) => {
        scrollViewRef.current?.scrollToEnd({ animated });
    };

    // Detect when new messages arrive and auto-scroll if user is at the bottom
    useEffect(() => {
        if (isAtBottom && messages.length > 0) {
            scrollToBottom(!firstLoad);
            setFirstLoad(false);
        }
    }, [messages]); // Re-run when messages update

    // Track user's scrolling behavior
    const handleScroll = (event) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const isUserAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - SCROLL_THRESHOLD;
        setIsAtBottom(isUserAtBottom);
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() => {
                if (isAtBottom) scrollToBottom(!firstLoad);
            }}
            onScroll={handleScroll}
            scrollEventThrottle={100} // Adjust for performance
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 10 }}
        >
            {messages.map((message, index) => (
                <MessageItem message={message} currentUser={currentUser} key={index} otherUser={otherUser} />
            ))}
        </ScrollView>
    );
});

export default MessageList;
