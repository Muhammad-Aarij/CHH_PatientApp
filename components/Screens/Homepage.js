import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For disease picker
import { getAuth } from 'firebase/auth'; // For user authentication
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // For location permissions
import { getFirestore, doc, setDoc, getDocs, collection, query, where,updateDoc } from 'firebase/firestore'; // Firestore functions
import Slider from '@react-native-community/slider'; // Emergency level slider
import ambulance from '../Images/ambulance.png'; // Ambulance image
import Geolocation from '@react-native-community/geolocation'; // Import the geolocation package
import { db } from '../../firebaseConfig';
const Homepage = ({ navigation }) => {
  const [disease, setDisease] = useState('Select');
  const [emergencyLevel, setEmergencyLevel] = useState(0.5);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [long, setLong] = useState(false); // Loading state
  const [lat, setLat] = useState(false); // Loading state
  const [toggle, setToggle] = useState(false); // Loading state
  const [nearestAmbulanceId, setNearestAmbulanceId] = useState(""); // State to store documentId

  const auth = getAuth();
  const firestore = getFirestore();

  // Function to get the current location coordinates
  const getCoordinates = async () => {

    Geolocation.getCurrentPosition(info => {
      console.log(info);
      const latitude = info.coords.latitude;
      const longitude = info.coords.longitude;
      setLat(latitude);
      setLong(longitude);
    }
    );
  };


  // Function to handle SOS
  // Function to handle SOS
  const handleSOS = async () => {
    const user = auth.currentUser; // Get the current authenticated user

    if (!user) {
      Alert.alert('Authentication Required', 'You must be logged in to use the SOS feature.');
      return;
    }

    const userId = user.uid;

    // Request location permission for Android
    const permissionResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if (permissionResult !== RESULTS.GRANTED) {
      Alert.alert('Location Permission Denied', 'Permission to access location was denied.');
      return;
    }

    setLoading(true); // Start loading
    console.log('Getting location...');

    try {
      // Get patient's location
      const location = await getCoordinates();
      console.log('Location fetched:', long, lat);

      // Call the second function to handle saving data and finding the nearest ambulance
      const nearestAmbulance = await findNearestAmbulance(lat, long);

      if (nearestAmbulance) {
        const userDoc = doc(db, 'patients', userId);
        await setDoc(userDoc, {
          disease,
          symptoms,
          emergencyLevel,
          nearestAmbulance,
          location: { long, lat },

        });



        // Send the ambulance details to the next screen
        navigation.navigate('Reviews', {
          driverName: nearestAmbulance.driverName,
          distance: nearestAmbulance.distance,
          time: nearestAmbulance.time,
          driverId: nearestAmbulanceId,
        });
      } else {
        Alert.alert('No Available Ambulances', 'No ambulances are available at the moment.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location: ' + error.message);
      console.log('Error getting location:', error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to process the SOS request (save data and find nearest ambulance)
  // const processSOSRequest = async (userId, latitude, longitude) => {
  //   try {
  //     // Save location and emergency details in Firestore
  //     const userDoc = doc(db, 'patients', userId);
  //     await setDoc(userDoc, {
  //       disease,
  //       symptoms,
  //       emergencyLevel,
  //       location: { latitude, longitude },
  //     });

  //     // Find the nearest available ambulance
  //     await findNearestAmbulance(latitude, longitude);

  //     Alert.alert('SOS Sent', 'Your SOS request has been sent successfully!');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to process SOS request: ' + error.message);
  //     console.error('Error processing SOS request:', error);
  //   }
  // };


  const findNearestAmbulance = async (patientLat, patientLon) => {
    try {
      // Create a query to get free ambulances
      const ambulancesQuery = query(
        collection(db, 'ambulances'),
        where('status', '==', 'free') // Fetch only available ambulances
      );
  
      // Execute the query
      const querySnapshot = await getDocs(ambulancesQuery);
  
      let ambulancesList = [];
      let nearestAmbulance = null;
      let minDistance = Infinity;
      let nearestAmbulanceId = null; // Variable to store nearest ambulance's documentId
  
      // Iterate over the query results
      querySnapshot.forEach((doc) => {
        // Get data from each document
        const ambulanceData = doc.data();
        const latitude = ambulanceData.location[0];
        const longitude = ambulanceData.location[1];
  
        // Calculate distance from patient to ambulance
        const distance = calculateDistance(patientLat, patientLon, latitude, longitude);
        const time = calculateTime(distance, averageSpeedKmph); // Calculate time in hours
  
        // Store ambulance data and distance
        ambulancesList.push({ ...ambulanceData, distance, time });
  
        // Find the nearest ambulance
        if (distance < minDistance) {
          minDistance = distance;
          nearestAmbulance = { ...ambulanceData, distance, time };
  
          // Store nearest ambulance documentId
          nearestAmbulanceId = doc.id; // Save the documentId for later
        }
      });
  
      // Show each ambulance's distance
      if (ambulancesList.length > 0) {
        ambulancesList.forEach((ambulance) => {
          console.log(`Ambulance ${ambulance.driverName}: ${ambulance.distance.toFixed(2)} km away`);
        });
      } else {
        console.log('No available ambulances.');
      }
  
      // If nearest ambulance is found, update its status to "busy" and assign the patient's location
      if (nearestAmbulanceId) {
        const ambulanceDocRef = doc(db, 'ambulances', nearestAmbulanceId);
  
        // Update the ambulance's status to "busy" and assign the patient's location
        await updateDoc(ambulanceDocRef, {
          status: 'free', // Update the status to "busy"
          assignedPatientLocation: [lat, long] // Assign the patient's coordinates to the ambulance
        });
        setNearestAmbulanceId(nearestAmbulanceId);
        console.log("driverid in 1 page"+nearestAmbulanceId);
        console.log(`Ambulance with ID ${nearestAmbulanceId} status updated to busy and assigned patient's location.`);
      }
  
      return nearestAmbulance; // Return the nearest ambulance details
    } catch (error) {
      console.error('Error finding nearest ambulance:', error);
      Alert.alert('Error', 'Failed to find nearest ambulance.');
      return null;
    }
  };
  


  // Now you can access the nearest driver's documentId using nearestAmbulanceId



  // // Function to assign ambulance to patient
  // const assignAmbulanceToPatient = async (ambulance) => {
  //   const user = getAuth().currentUser;
  //   if (!user) {
  //     Alert.alert('Authentication Required', 'You must be logged in to assign an ambulance.');
  //     return;
  //   }

  //   try {
  //     // Update the Firestore document to assign the ambulance to the patient
  //     const userDoc = doc(db, 'patients', user.uid);
  //     await setDoc(userDoc, {
  //       assignedAmbulance: ambulance,
  //       // You might want to include additional data such as status, etc.
  //     }, { merge: true }); // Use merge to keep existing data

  //     Alert.alert('Ambulance Assigned', `Ambulance ${ambulance.driverName} has been assigned to you.`);
  //   } catch (error) {
  //     console.error('Error assigning ambulance:', error);
  //     Alert.alert('Error', 'Failed to assign ambulance.');
  //   }
  // };

  // Example function to calculate distance between two points (lat, lon)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log("================================");
    console.log(`Calculating distance between ${lat1}, ${lon1} and ${lat2}, ${lon2}`);
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  const averageSpeedKmph = 80;

  const calculateTime = (distance, averageSpeedKmph) => {
    return (distance / averageSpeedKmph) * 60;
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
      <Image
        source={ambulance}
        style={styles.headerImage}
      />

      {/* Execute SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Text style={styles.sosButtonText}>Execute SOS</Text>
      </TouchableOpacity>

      {/* Share Location Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Share live location</Text>
        <Switch
          value={toggle}
          onValueChange={() => { setToggle(!toggle) }}
          thumbColor={toggle ? "white" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      {/* Optional Section */}
      <View style={styles.optionalContainer}>
        <View style={styles.optional}>
          <Text style={styles.optionalText}>Optional</Text>
        </View>

        {/* Select Disease Button */}
        <TouchableOpacity style={styles.diseaseButton}>
          <Text style={styles.sliderLabel}>Select Disease</Text>
          <View style={styles.pickercontainer}>
            <Picker
              selectedValue={disease}
              style={styles.picker}
              onValueChange={(itemValue) => setDisease(itemValue)}
            >
              <Picker.Item style={styles.pickeriTEMS} label="Heart Attack" value="Heart Attack" />
              <Picker.Item label="Stroke" value="Stroke" />
              <Picker.Item label="Diabetes" value="Diabetes" />
              <Picker.Item label="Allergies" value="Allergies" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </TouchableOpacity>

        {/* Emergency Level Slider */}
        <View style={styles.slidermaincontainer}>
          <Text style={{ ...styles.sliderLabel, width: "100%", marginBottom: 10, textAlign: "center" }}>Emergency level</Text>
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
              // thumbImage={circle}
              thumbTintColor='#1F1E30'
            />
            <Text style={styles.sliderLabel}>High</Text>
          </View>

        </View>
        {/* Describe Symptoms Input */}
        <Text style={styles.sliderLabel}>Describe Symptoms</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What you are feeling ....."
          multiline
          onChangeText={setSymptoms}
          value={symptoms}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => {
          navigation.navigate("Reviews", {

          });
        }}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    height: 80,
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
