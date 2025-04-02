import { View, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ImageBackground } from "expo-image";
import { hp } from "../helpers/common";
import { blurhash } from "../utils/common";
import { Icon } from "react-native-eva-icons";
import { BottomSheetContext } from "../app/(app)/_layout";
import UploadImageBottomSheet from "./UploadImageBottomSheet";

const ProfileImageEdit = ({startingImageUrl = '', onImagePicked = () => { } }) => {
  const bottomSheetRef = useContext(BottomSheetContext);
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  // Handler to set the selected image URI
  const handleImageSelected = (uri) => {
    onImagePicked(uri);
  };

  const size = hp(10); // Define size for circular dimensions

  return (
    <View style={{ position: "relative", width: size, height: size }}>
      {/* Touchable Profile Image */}
      <TouchableOpacity
        style={{
          height: size,
          width: size,
          borderRadius: size / 2, // Circular shape
          overflow: "hidden", // Clip content within the circle
        }}
        onPress={() => {
          openBottomSheet();
        }}
      >
        <ImageBackground
          source={startingImageUrl ? { uri: startingImageUrl } : require("../assets/images/missingProfileImage.jpg")} // todo: use firebase result
          style={{
            height: "100%",
            width: "100%",
          }}
          placeholder={blurhash}
          transition={200}
        />
      </TouchableOpacity>
      <View style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 3 }}>
        <Icon
          name={"image"}
          width={size * 0.3}
          height={size * 0.3}
          fill={"white"}
        />
      </View>
      <UploadImageBottomSheet ref={bottomSheetRef} onImageSelected={handleImageSelected} />
    </View>
  );
};

export default ProfileImageEdit;
