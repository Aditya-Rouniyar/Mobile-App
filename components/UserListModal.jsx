import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from 'react-native-eva-icons';
import { BlurView } from 'expo-blur';
import theme from '../constants/theme';
import { hp, wp } from '../helpers/common';

const UserListModal = ({ visible, onClose, users, loading, type }) => {
  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfoContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.profileImageUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
        </View>
      </View>
    </View>
  );

  const getTitle = () => {
    switch (type) {
      case 'followers':
        return 'Followers';
      case 'following':
        return 'Following';
      case 'visitors':
        return 'Visitors';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView
        intensity={90}
        tint="dark"
        style={styles.container}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close-outline" width={24} height={24} fill="#fff" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.dark.colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No {type} yet</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.userId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: wp(90),
    height: hp(70),
    backgroundColor: theme.dark.colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.2,
    borderColor: theme.dark.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserListModal;
