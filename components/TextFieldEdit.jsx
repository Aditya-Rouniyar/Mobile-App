import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from 'react-native-eva-icons';
import { hp } from '../helpers/common';

const TextFieldEdit = ({
  text = '',
  isEditing,
  setIsEditing,
  onChangeText = () => {},
  onSubmitEditing = () => {},
}) => {
  const editButtonSize = hp(2.5);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingLeft: editButtonSize, // offset text to keep it centered
      }}
    >
      {/* Show TextInput if editing, otherwise just text */}
      {isEditing ? (
        <TextInput
          style={{
            fontSize: hp(2),
            color: 'white',
            borderBottomWidth: 1,
            borderBottomColor: 'white',
            minWidth: 100,
            textAlign: 'center',
          }}
          autoFocus
          defaultValue={text}
          // Make sure to actually call onChangeText with 'text':
          onChangeText={(text) => onChangeText(text)}
          onSubmitEditing={(e) => {
            // e.nativeEvent.text is the typed text
            onSubmitEditing?.(e.nativeEvent.text);
          }}
          onBlur={() => setIsEditing(false)} // optional: stop editing on blur
        />
      ) : (
        <Text style={{ fontSize: hp(2) }} className="font-bold text-neutral-50">
          {text}
        </Text>
      )}

      {/* Edit icon */}
      <TouchableOpacity onPress={() => setIsEditing(true)}>
        <Icon
          name="edit-outline"
          pack="eva"
          style={{
            height: editButtonSize,
            width: editButtonSize,
            fill: 'grey',
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default TextFieldEdit;
