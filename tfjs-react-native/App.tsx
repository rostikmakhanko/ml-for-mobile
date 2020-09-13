import React, { useState } from "react";
import {
  Button,
  Image,
  ImageLoadEventData,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ImagePicker from "react-native-image-picker";
import { MobileNet } from "./MobileNet";

type Options = {
  title: string;
  storageOptions: { skipBackup: boolean; path: string };
};

export default function App() {
  const [imageUri, setImageUri] = useState({ uri: "" });
  const [imageData, setImageData] = useState("");

  const openPhotoImagePickerOptions = {
    title: "Open Photo",
    storageOptions: {
      skipBackup: true,
      path: "images",
    },
  };

  const onOpenPhotoButtonPress = (options: Options) => {
    console.log("Choose photo");
    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        console.log(response.uri);
        setImageUri({ uri: response.uri });
        setImageData(response.data);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/*<TensorFlow />*/}
      <Button
        title={"Pick photo"}
        onPress={() => {
          onOpenPhotoButtonPress(openPhotoImagePickerOptions);
        }}
      />
      {imageUri.uri ? (
        <Image
          style={{ width: 200, height: 200 }}
          source={imageUri}
        />
      ) : (
        <></>
      )}
      <MobileNet imageUri={imageUri.uri} imageData={imageData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
