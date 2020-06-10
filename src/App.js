import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  Text,
  StatusBar,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import * as RNFS from 'react-native-fs';

import { Colors } from 'react-native/Libraries/NewAppScreen';

class App extends Component {
  constructor() {
    super();
    this.state = {
      view: 'photos',
      photos: [],
    };
  }

  componentDidMount() {}

  render() {
    const { view, photos } = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {view === 'photos' && (
            <TouchableOpacity
              style={styles.capture}
              onPress={() => this.setState({ view: 'camera' })}
            >
              <Text>Take A New Photo</Text>
            </TouchableOpacity>
          )}
          {view === 'photos' && (
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={styles.scrollView}
            >
              <View style={styles.sectionContainer}>
                {photos.map(photo => {
                  return (
                    <Image
                      style={{ width: 200, height: 200, margin: 10, }}
                      source={{
                        uri: photo,
                      }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          )}
          {view === 'camera' && (
            <Camera
              onCancel={() => {
                this.setState({ view: 'photos' });
              }}
              onCapture={data => {
                const imagePath = `${
                  RNFS.DocumentDirectoryPath
                }/${new Date().toISOString()}.jpg`.replace(/:/g, '-');
                console.log('capture', data.uri);

                try {
                  if (Platform.OS === 'ios') {
                    RNFS.copyFile(data.uri, imagePath)
                      .then(res => {
                        console.log({ res });
                        this.setState({
                          view: 'photos',
                          photos: [imagePath, ...this.state.photos],
                        });
                      })
                      .catch(err => {
                        console.log('ERROR: image file write failed!!!');
                        console.log(err.message, err.code);
                      });
                  } else if (Platform.OS === 'android') {
                    RNFS.copyFile(data.uri, imagePath)
                      .then(res => {
                        this.setState({
                          view: 'photos',
                          photos: [imagePath, ...this.state.photos],
                        });
                      })
                      .catch(err => {
                        console.log('ERROR: image file write failed!!!');
                        console.log(err.message, err.code);
                      });
                  }
                } catch (err) {
                  console.log({ err });
                }
              }}
            />
          )}
        </SafeAreaView>
      </>
    );
  }
}

const Camera = ({ onCapture, onCancel }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <RNCamera
        ref={ref => {
          this.camera = ref;
        }}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        androidRecordAudioPermissionOptions={{
          title: 'Permission to use audio recording',
          message: 'We need your permission to use your audio',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      />
      <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
        <TouchableOpacity onPress={onCancel} style={styles.capture}>
          <Text style={{ fontSize: 14 }}> Cancel </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (this.camera) {
              const options = { quality: 0.5, base64: true };
              const data = await this.camera.takePictureAsync(options);
              try {
                onCapture(data);
              } catch (err) {
                console.log({ err });
              }
            }
          }}
          style={styles.capture}
        >
          <Text style={{ fontSize: 14 }}> Capture </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
    flex: 1,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 5,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
