import { StatusBar } from "expo-status-bar";
import React, { PureComponent } from "react";
import { Button, TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { RNCamera } from "react-native-camera";
import {cloudVisionApiKey} from "./apiKeys";

export default class App extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          onPictureTaken={() => {
            console.log("Congrats, the picture is taken");
          }}
        />
        <View
          style={{ flex: 0, flexDirection: "row", justifyContent: "center" }}
        >
          <TouchableOpacity
            onPress={this.takePicture.bind(this)}
            style={styles.capture}
          >
            <Text style={{ fontSize: 14 }}> SCAN </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      await this.makeVisionApiRequest(data.base64);
      console.log(data.uri);
    }
  };

  makeVisionApiRequest = async (base64) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      requests: [
        {
          features: [
            {
              maxResults: 50,
              type: "LABEL_DETECTION",
            },
            {
              maxResults: 50,
              type: "TEXT_DETECTION",
            },
            {
              maxResults: 50,
              type: "DOCUMENT_TEXT_DETECTION",
            },
          ],
          image: {
            content: base64,
          },
          imageContext: { cropHintsParams: { aspectRatios: [0.8, 1, 1.2] } },
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${cloudVisionApiKey}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) =>
        console.log("Text annotations:", result.responses[0].textAnnotations)
      )
      .catch((error) => console.log("error", error));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  capture: {
    flex: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
});
