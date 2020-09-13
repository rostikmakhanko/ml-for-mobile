import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import * as tf_rn from "@tensorflow/tfjs-react-native";
import { decode } from "base64-arraybuffer";

type Props = {
  imageUri: string;
  imageData: string;
};

type State = {
  isTfReady: boolean;
  mobileNetModel?: any;
  imageTensor: string;
  imageClassNamePrediction: string;
};

export class MobileNet extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isTfReady: false,
      mobileNetModel: undefined,
      imageTensor: "No imageTensor yet",
      imageClassNamePrediction: "Didn't classify anything yet",
    };
  }

  async loadMobileNetModel() {
    const mobilenet = await require("@tensorflow-models/mobilenet");
    const model = await mobilenet.load();

    this.setState({
      mobileNetModel: model,
    });
  }

  async componentDidMount() {
    await tf.ready();
    await this.loadMobileNetModel();
    this.setState({
      isTfReady: true,
    });
  }

  async convertImageToTensor() {
    const imageTensor = tf_rn.decodeJpeg(
      new Uint8Array(decode(this.props.imageData))
    );
    this.setState({ imageTensor: imageTensor.toString() });
    return imageTensor;
  }

  async classifyImage() {
    this.setState({
      imageClassNamePrediction: "Wait, we are classifying image",
    });
    const tensor = await this.convertImageToTensor();

    const mobileNet = await require("@tensorflow-models/mobilenet");
    const model = await mobileNet.load();
    const predictions = await model.classify(tensor);

    if (predictions.length === 0) {
      this.setState({ imageClassNamePrediction: "Veeery unique image" });
    } else {
      this.setState({
        imageClassNamePrediction:
          "It is a " +
          predictions[0].className +
          " with a probability " +
          predictions[0].probability.toFixed(2),
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          {this.state.isTfReady ? "TF is ready!" : "TF is not ready:("}
        </Text>
        {/*<Text>{this.state.imageTensor}</Text>*/}
        <Text style={{ fontSize: 18 }}>
          {this.state.imageClassNamePrediction}
        </Text>
        <Button
          title={"Classify image"}
          onPress={() => this.classifyImage()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
  },
});
