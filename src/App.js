import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
  Text,
  StatusBar,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-community/async-storage';

import { Colors } from 'react-native/Libraries/NewAppScreen';

class App extends Component {
  constructor() {
    super();
    this.state = {
      view: 'photos',
      photos: [],
      uploadedPhotos: [],
      uploading: false,
    };
  }

  componentDidMount = async () => {
    const photoPaths = await AsyncStorage.getItem('photos');
    const uploadedPhotoPaths = await AsyncStorage.getItem('uploadedPhotos');

    console.log({ photoPaths, uploadedPhotoPaths });

    photoPaths &&
      this.setState({
        photos: JSON.parse(photoPaths || []),
        uploadedPhotos:
          (uploadedPhotoPaths && JSON.parse(uploadedPhotoPaths)) || [],
      });
  };

  setPhoto = imagePath => {
    this.setState(
      {
        view: 'photos',
        photos: [imagePath, ...this.state.photos],
      },
      () => {
        AsyncStorage.setItem('photos', JSON.stringify(this.state.photos));
      }
    );
  };

  queNextUpload = () => {
    const error = false;

    if (this.state.photos.length && !error) {
      this.setState({ uploading: true }, () => {
        this.uploadPhoto(this.state.photos[0]);
      });
    }
  };

  uploadPhoto = async photo => {
    setTimeout(() => {
      const success = true;
      if (success) {
        this.setState(
          {
            uploading: false,
            photos: this.state.photos.filter(url => url !== photo),
            uploadedPhotos: [photo, ...this.state.uploadedPhotos],
          },
          () => {
            AsyncStorage.setItem('photos', JSON.stringify(this.state.photos));
            AsyncStorage.setItem(
              'uploadedPhotos',
              JSON.stringify(this.state.uploadedPhotos)
            );
            // delete photo here from system as well if not saving uploaded list

            // try next upload
            this.queNextUpload();
          }
        );
      }
      return true;
    }, 2000);
  };

  handleImageCapture = data => {
    const imagePath = `${
      RNFS.DocumentDirectoryPath
    }/${new Date().toISOString()}.jpg`.replace(/:/g, '-');

    try {
      if (Platform.OS === 'ios') {
        RNFS.copyFile(data.uri, imagePath)
          .then(res => {
            console.log('saved path: ', imagePath);
            this.setPhoto(imagePath);
          })
          .catch(err => {
            console.log('ERROR: image file write failed!!!');
            console.log(err.message, err.code);
          });
      } else if (Platform.OS === 'android') {
        RNFS.copyFile(data.uri, imagePath)
          .then(res => {
            this.setPhoto(imagePath);
          })
          .catch(err => {
            console.log('ERROR: image file write failed!!!');
            console.log(err.message, err.code);
          });
      }
    } catch (err) {
      console.log({ err });
    }
  };

  render() {
    const { view, photos, uploadedPhotos, uploading } = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {(view === 'photos' || view === 'uploaded') && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={styles.capture}
                onPress={() => this.setState({ view: 'camera' })}
              >
                <Text>Take A New Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.capture}
                onPress={() => {
                  this.setState({
                    view: view === 'photos' ? 'uploaded' : 'photos',
                  });
                }}
              >
                <Text>{view === 'photos' ? 'View Uploaded' : 'View Que'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.capture}
                onPress={this.queNextUpload}
                disabled={this.state.uploading}
              >
                <Text>Try Upload</Text>
              </TouchableOpacity>
            </View>
          )}
          {view === 'photos' && (
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={styles.scrollView}
            >
              <Text style={styles.sectionDescription}>Photos To Upload</Text>
              {uploading && (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <ActivityIndicator size="small" />
                  <Text>Uploading...</Text>
                </View>
              )}
              <View style={styles.sectionContainer}>
                {photos.map(photo => {
                  return (
                    <Image
                      style={styles.image}
                      source={{
                        uri: photo,
                      }}
                    />
                  );
                })}
              </View>
            </ScrollView>
          )}
          {view === 'uploaded' && (
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              style={styles.scrollView}
            >
              <Text style={styles.sectionDescription}>Uploaded Photos</Text>
              <View style={styles.sectionContainer}>
                {uploadedPhotos.map(photo => {
                  return (
                    <Image
                      style={styles.image}
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
              onCapture={this.handleImageCapture}
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
    paddingHorizontal: 10,
    alignSelf: 'center',
    margin: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 5,
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
    marginHorizontal: 10,
  },
  highlight: {
    fontWeight: '700',
  },
  image: {
    width: 200,
    height: 200,
    margin: 5,
  },
});

export default App;
