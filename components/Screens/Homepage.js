import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, Switch, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For disease picker
import { getAuth, signOut } from 'firebase/auth'; // For user authentication
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // For location permissions
import { getFirestore, doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore'; // Firestore functions
import Slider from '@react-native-community/slider'; // Emergency level slider
import ambulance from '../Images/ambulance.png'; // Ambulance image
import Geolocation from '@react-native-community/geolocation'; // Geolocation package
// import Geolocation from 'react-native-geolocation-service';
import out from '../Images/out.png'; // Sign out image
import { db } from '../../firebaseConfig';
import LoaderModal from './LoaderModal';

const Homepage = ({ navigation }) => {
  const [disease, setDisease] = useState('Select');
  const [emergencyLevel, setEmergencyLevel] = useState(0.5);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [nearestAmbulanceId, setNearestAmbulanceId] = useState('');
  const [phonenumber, setphonenumber] = useState('');
  const [locationUnabled, setLocationUnabled] = useState('');

  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    getCoordinates();
  }, []);

  useEffect(() => {
    const locationchecker = () => {
      if (toggle)
        unableLocation();
      else
        getCoordinates();
    };

    locationchecker();
  }, [toggle]);

  const getCoordinates = async () => {
    Geolocation.getCurrentPosition((info) => {
      setTimeout(() => {
        setLat(info.coords.latitude);
        setLong(info.coords.longitude);
        console.log("Latitude" + lat + " and Longitude" + long);
      }, 2000);

    });
  };

  const unableLocation = async () => {
    const permissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    setLocationUnabled(permissionResult == RESULTS.GRANTED);
    console.log("Permission granted" + locationUnabled);
    if (permissionResult !== RESULTS.GRANTED) {
      Alert.alert('Location Permission Denied', 'Permission to access location was denied.');
      return;
    }
  };

  const handleSOS = async () => {
    if ((locationUnabled == true) && (toggle == true)) {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Authentication Required', 'You must be logged in to use the SOS feature.');
        return;
      }
      console.log("Auth: " + user.uid);
      setLoading(true);

      try {
        console.log('Location fetched:', long, lat);
        if (long != null && lat != null) {

          const nearestAmbulance = await findNearestAmbulance(lat, long);

          if (nearestAmbulance) {
            const userDoc = doc(db, 'patients', user.uid);
            await setDoc(userDoc, {
              disease,
              symptoms,
              emergencyLevel,
              nearestAmbulance,
              location: { long, lat },
            });

            navigation.navigate('Reviews', {
              driverName: nearestAmbulance.driverName,
              distance: nearestAmbulance.distance,
              time: nearestAmbulance.time,
              driverId: nearestAmbulanceId,
              disease: disease,
              phonenumber: phonenumber,
              long: long,
              lat: lat,
            });

          } else {
            setLoading(false);
            Alert.alert('No Available Ambulances', 'No ambulances are available at the moment.');
          }
        }
        else{
          getCoordinates();
          Alert.alert('Location Unavailable', 'Please try again');
          return;
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', 'Failed to get location: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    else {
      Alert.alert('Location Unavailable', 'Unable the Live Location');
      return;
    }
  };

  const findNearestAmbulance = async (patientLat, patientLon) => {
    try {
      const ambulancesQuery = query(
        collection(db, 'ambulances'),
        where('status', '==', 'free')
      );

      const querySnapshot = await getDocs(ambulancesQuery);
      let nearestAmbulance = null;
      let minDistance = Infinity;

      querySnapshot.forEach((doc) => {
        const ambulanceData = doc.data();
        console.log("Ambulance Data: ", ambulanceData);

        if (!ambulanceData.driverLocation) {
          console.warn('Missing driverLocation for ambulance:', doc.id);
          return;
        }

        const latitude = ambulanceData.driverLocation.latitude;
        const longitude = ambulanceData.driverLocation.longitude;

        if (latitude === undefined || longitude === undefined) {
          console.warn('Missing latitude or longitude for ambulance:', doc.id);
          return;
        }

        const number = ambulanceData.phoneNumber;
        setphonenumber(number);
        console.log("Phone Number: ", number);

        const distance = calculateDistance(patientLat, patientLon, latitude, longitude);
        const time = calculateTime(distance, averageSpeedKmph);

        if (distance < minDistance) {
          minDistance = distance;
          nearestAmbulance = { ...ambulanceData, distance, time };
          setNearestAmbulanceId(doc.id);
        }
      });

      if (nearestAmbulance) {
        const ambulanceDocRef = doc(db, 'ambulances', nearestAmbulanceId);
        await updateDoc(ambulanceDocRef, {
          status: 'busy',
          patientLocation: {
            latitude: lat,
            longitude: long,
          },
        });
      }

      return nearestAmbulance;
    } catch (error) {
      console.error('Error finding nearest ambulance:', error);
      Alert.alert('Error', 'Failed to find nearest ambulance.');
      return null;
    }
  };


  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const averageSpeedKmph = 80;

  const calculateTime = (distance, averageSpeedKmph) => {
    return (distance / averageSpeedKmph) * 60;
  };


  return (
    <>
      {loading ?
        <LoaderModal />
        :
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
          <Image source={ambulance} style={styles.headerImage} />

          <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
            <Text style={styles.sosButtonText}>Execute SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              signOut(auth)
                .then(() => {
                  console.log('User signed out successfully!');
                  navigation.navigate('Signin');
                })
                .catch((error) => {
                  console.error('Sign-out error: ', error);
                });
            }}
          >
            <Image style={styles.signOutButtonText} source={out} />
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Share live location</Text>
            <Switch
              value={toggle}
              onValueChange={() => setToggle(!toggle)}
              thumbColor={toggle ? 'white' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
            />
          </View>

          <View style={styles.optionalContainer}>
            <View style={styles.optional}>
              <Text style={styles.optionalText}>Optional</Text>
            </View>

            <TouchableOpacity style={styles.diseaseButton}>
              <Text style={styles.sliderLabel}>Select Disease</Text>
              <View style={styles.pickercontainer}>
                <Picker
                  selectedValue={disease}
                  style={styles.picker}
                  onValueChange={(itemValue) => setDisease(itemValue)}
                >
                  <Picker.Item label="Heart Attack" value="heart-attack" />
                  <Picker.Item label="Seizure" value="seizure" />
                  <Picker.Item label="Stroke" value="stroke" />
                </Picker>
              </View>
            </TouchableOpacity>

            <View style={styles.slidermaincontainer}>
              <Text style={styles.sliderLabel}>Emergency level</Text>
              <View style={styles.slidermid}>
                <Text style={styles.sliderLabel}>Low</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={emergencyLevel}
                  onValueChange={setEmergencyLevel}
                  minimumTrackTintColor="#1F1E30"
                  maximumTrackTintColor="#1F1E30"
                  thumbTintColor="#1F1E30"
                />
                <Text style={styles.sliderLabel}>High</Text>
              </View>
            </View>

            <Text style={styles.sliderLabel}>Describe Symptoms</Text>
            <TextInput
              style={styles.textInput}
              placeholderTextColor={"grey"}
              placeholder="What you are feeling ..... "
              multiline
              onChangeText={setSymptoms}
              value={symptoms}
            />
          </View>
        </ScrollView>}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1E30',
    padding: 20,
    paddingHorizontal: 25,
    // alignItems: 'center',
  },
  signOutButton: {
    // backgroundColor: '#FF0000',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    right: 5,
    zIndex: 1,
    borderWidth: 2,
    borderRadius: 50,
    borderColor: "#FF0000",
  },
  signOutButtonText: {
    width: 25,
    height: 25,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  optional: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#1F1E30",
    borderRadius: 10,
    marginBottom: 20,
    width: "55%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    position: "absolute",
    top: -20,
    left: 90,
    zIndex: 1,
  },
  optionalText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: "sans-serif-condensed",
  },
  emergencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sosButton: {
    backgroundColor: '#FFFFFF',
    marginTop: 5,
    width: "60%",
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  sosButtonText: {
    color: '#1F1E30',
    fontFamily: "sans-serif-black",
    fontWeight: 'bold',
    fontSize: 13,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontFamily: "sans-serif-light",
    fontSize: 14,
  },
  optionalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 45,
    paddingTop: 40,
    position: "relative",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 5,
  },

  diseaseButton: {
    // backgroundColor: '#1F1E30',
    // padding: 10,
    // borderRadius: 10,
    // alignItems: 'center',
    marginTop: 5,
    width: "100%",
    // alignItems: 'center',
    // marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // borderWidth:2,
  },
  pickercontainer: {

    borderWidth: 1,
    borderColor: '#1F1E30',
    borderRadius: 10,
    width: "60%",
    // height:50,
  },
  picker: {
    width: "100%",
    borderRadius: 10,
    // padding: 7,
    alignItems: 'center',
    // marginTop: 5,
    color: '#1F1E30',
  },
  pickeriTEMS: {
    borderRadius: 10,
    color: '#1F1E30',
    fontSize: 15,
    // marginLeft:10,
  },
  diseaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sliderLabel: {
    color: '#1F1E30',
    fontSize: 17,
    fontFamily: "sans-serif-condensed",
    // fontWeight: 'bold',
  },
  slidermaincontainer: {
    borderWidth: 0.5,
    borderColor: "#1F1E30",
    borderRadius: 10,
    paddingVertical: 5,
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
    marginVertical: 15,
  },
  slidermid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    // borderWidth:2,
  },
  slider: {
    // borderWidth:2,
    width: 200,
    height: 40,
    // marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 10,
    color: '#1F1E30',
    fontSize: 15,
    fontFamily: "sans-serif-medium",
  },
  textInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#1F1E30',
    marginTop: 5,
    width: "60%",
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
    alignSelf: "center",
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: "sans-serif-black",
    fontWeight: 'bold',
  },
});

export default Homepage;
