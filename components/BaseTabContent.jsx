import React from 'react';
import { View, FlatList, RefreshControl } from 'react-native';

const HEADER_OFFSET = 110;
const BaseTabContent = ({
  style,                   // Style for the container view
  contentContainerStyle,   // Style for the FlatList content container
  data,                    // Data for the FlatList
  renderItem,              // Custom render function for each item
  keyExtractor,            // (Optional) Custom key extractor
  refreshing,              // Boolean indicating if the list is currently refreshing
  onRefresh,               // Function to call when a pull-to-refresh is triggered
  showsVerticalScrollIndicator = false, // You can provide default props, too
  ...flatListProps         // Spread the rest of props to FlatList
}) => {
  return (
    <View style={[{ flex: 1 }, style]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        // Pull-to-refresh:
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentInset={{ top: HEADER_OFFSET }} // Ensures scrolling behind the header
        contentOffset={{ y: -HEADER_OFFSET }} // Fixes initial position so list starts below the header
        {...flatListProps}
      />
    </View>
  );
};

export default BaseTabContent;
