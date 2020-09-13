import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { Button, StyleSheet, Text, View } from "react-native";
import irisTraining from "./training.json";
import irisTesting from "./testing.json";

type State = {
  isTfReady: boolean;
  irisModelOutput: string;
  irisModel?: tf.Sequential;
};

const irisSpecies = ["setosa", "virginica", "versicolor"];

const getIrisTypeByTensor = (tensor: number[]) => {
  return irisSpecies[tensor.indexOf(Math.max(...tensor))];
};

export class TensorFlow extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isTfReady: false,
      irisModelOutput: "No output",
      irisModel: undefined,
    };
  }

  runModel = () => {
    console.log("Lets run model");

    const trainingData = tf.tensor2d(
      irisTraining.map((item) => [
        item.sepal_length,
        item.sepal_width,
        item.petal_length,
        item.petal_width,
      ]),
      [130, 4]
    );

    const testingData = tf.tensor2d(
      irisTesting.map((item) => [
        item.sepal_length,
        item.sepal_width,
        item.petal_length,
        item.petal_width,
      ]),
      [14, 4]
    );

    const outputData = tf.tensor2d(
      irisTraining.map((item) => [
        item.species === "setosa" ? 1 : 0,
        item.species === "virginica" ? 1 : 0,
        item.species === "versicolor" ? 1 : 0,
      ]),
      [130, 3]
    );

    const train_data = async (model: tf.Sequential) => {
      for (let i = 0; i < 15; i++) {
        const res = await model.fit(trainingData, outputData, { epochs: 40 });
        this.setState({
          irisModelOutput: "Training #" + i + " " + res.history.loss[0],
        });
        console.log("Training #", i, res.history.loss[0]);
      }
    };

    const runIrisModel = async () => {
      const model = tf.sequential();

      model.add(
        tf.layers.dense({
          inputShape: [4],
          activation: "sigmoid",
          units: 10,
        })
      );
      model.add(
        tf.layers.dense({
          inputShape: [10],
          activation: "softmax",
          units: 3,
        })
      );

      model.compile({
        loss: "categoricalCrossentropy",
        optimizer: tf.train.adam(),
      });

      await train_data(model);

      (model.predict(testingData) as tf.Tensor).print();

      this.setState({ irisModel: model });
      this.setState({
        irisModelOutput: "Finished training",
      });

      return model;
    };

    console.log("Run iris");

    runIrisModel()
      .then((model: tf.Sequential) => {
        console.log("Ran model");
        return model;
      })
      .catch((err) => console.log(err));
  };

  async componentDidMount() {
    // Wait for tf to be ready.
    await tf.ready();
    // Signal to the app that tensorflow.js can now be used.
    this.setState({
      isTfReady: true,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          {this.state.isTfReady ? "TF is ready!" : "TF is not ready:("}
        </Text>
        <Button title={"Run model"} onPress={this.runModel} />
        <Text>{this.state.irisModelOutput}</Text>
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
