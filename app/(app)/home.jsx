import { View, Text } from "react-native";
import React, { useState } from "react";
import Button from "../../components/Button";
import { useAuth } from "../../context/authContext";
import BaseTabContent from "../../components/BaseTabContent";

const home = () => {
  const { logout, user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {

    }
    catch (error) {

    }
    finally {
      // Use finally to set to false
      setRefreshing(false);
    }
  };


  const handleLogOut = async () => {
    await logout();
  };


  // Define the header component
  const ListHeader = () => (
    <View className="flex-1">
      <Text className="text-xl">Home</Text>
      <Button title="Sign Out" onPress={handleLogOut} />
    </View>
  );

  return (
    <View className='flex-1'>
      <BaseTabContent refreshing={refreshing}
        onRefresh={onRefresh} ListHeaderComponent={<ListHeader />}>
      </BaseTabContent>
    </View>
  );
};

export default home;
