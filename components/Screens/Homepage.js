import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For disease picker
import { getAuth } from 'firebase/auth'; // For user authentication
import { getFirestore, doc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore'; // Firestore functions
import Slider from '@react-native-community/slider'; // Emergency level slider
import * as Location from 'expo-location'; // Location API for patient
import ambulance from '../Images/ambulance.png';

const Homepage = ({ navigation }) => {
  const [disease, setDisease] = useState('Select');
  const [emergencyLevel, setEmergencyLevel] = useState(0.5);
  const [symptoms, setSymptoms] = useState('');
  const [patientLocation, setPatientLocation] = useState(null);

  const auth = getAuth();
  const firestore = getFirestore();

  // Function to handle SOS
  const handleSOS = async () => {
    const user = auth.currentUser; // Get the current authenticated user

    if (!user) {
      Alert.alert('Authentication Required', 'You must be logged in to use the SOS feature.');
      return;
    }

    const userId = user.uid;

    // Get the patient's location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Permission', 'Permission to access location is required.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const patientCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setPatientLocation(patientCoords);

    try {
      // Query for free drivers
      const driversQuery = query(
        collection(firestore, 'drivers'),
        where('status', '==', 'free')
      );
      const driversSnapshot = await getDocs(driversQuery);

      if (driversSnapshot.empty) {
        Alert.alert('No Free Drivers', 'No free drivers available at the moment.');
        return;
      }

      let nearestDriver = null;
      let shortestDistance = Infinity;

      // Loop through available drivers and find the nearest one
      driversSnapshot.forEach((doc) => {
        const driverData = doc.data();
        const driverLocation = driverData.location;

        const distance = calculateDistance(
          patientCoords.latitude,
          patientCoords.longitude,
          driverLocation.latitude,
          driverLocation.longitude
        );

        if (distance < shortestDistance) {
          nearestDriver = { id: doc.id, data: driverData };
          shortestDistance = distance;
        }
      });

      if (nearestDriver) {
        // Update the selected driver's status and assign the patient
        await updateDoc(doc(firestore, 'drivers', nearestDriver.id), {
          status: 'busy',
          assignedPatient: userId,
        });

        // Add a request record in Firestore
        await setDoc(doc(firestore, 'requests', userId), {
          location: patientCoords,
          timestamp: new Date(),
          assignedDriver: nearestDriver.id,
          symptoms: symptoms,
          emergencyLevel: emergencyLevel,
        });

        Alert.alert('SOS Request Sent', 'The nearest driver has been assigned.');
        navigation.navigate('AmbulancePage', { driverId: nearestDriver.id });
      }
    } catch (error) {
      Alert.alert('Error', 'Error processing SOS request. Please try again later.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Image source={ambulance} style={styles.headerImage} />
      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Text style={styles.sosButtonText}>Execute SOS</Text>
      </TouchableOpacity>
      {/* Other UI elements: Select Disease, Emergency Level, etc. */}
    </ScrollView>
  );
};

// Function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}
// import React, { useState } from 'react';
// import {
//   View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert,TextInput
// } from 'react-native';

// import { Picker } from '@react-native-picker/picker'; // Import Picker
// import { getAuth } from 'firebase/auth'; // Import Firebase Auth
// import { getFirestore, doc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore'; // Import Firestore functions

// import Slider from '@react-native-community/slider'; // Updated import
// import ambulance from '../Images/ambulance.png';

// const Homapage = ({ navigation }) => {
//   const [disease, setDisease] = useState('Select');
//   const [emergencyLevel, setEmergencyLevel] = useState(0.5);
//   const [symptoms, setSymptoms] = useState('');

//   // Initialize Firestore
//   const firestore = getFirestore();

//   const handleSOS = async () => {
//     const auth = getAuth(); // Initialize Firebase Auth
//     const user = auth.currentUser; // Get the current authenticated user

//     if (!user) {
//       console.log('No authenticated user found');
//       Alert.alert('Authentication Required', 'You must be logged in to use the SOS feature.');
//       return;
//     }

//     const userId = user.uid;

//     try {
//       // Query to find free drivers
//       const driversQuery = query(
//         collection(firestore, 'drivers'),
//         where('status', '==', 'free')
//       );

//       const driversSnapshot = await getDocs(driversQuery);

//       if (driversSnapshot.empty) {
//         console.log('No free drivers available');
//         Alert.alert('No Free Drivers', 'No free drivers available at the moment.');
//         return;
//       }

//       let nearestDriver = null;
//       let shortestDistance = Infinity;

//       // Mock location data since Geolocation is removed
//       const patientLocation = {
//         latitude: 0, // Mock value
//         longitude: 0, // Mock value
//       };

//       driversSnapshot.forEach(doc => {
//         const driverData = doc.data();
//         const driverLocation = driverData.location;

//         const distance = calculateDistance(
//           patientLocation.latitude,
//           patientLocation.longitude,
//           driverLocation.latitude,
//           driverLocation.longitude
//         );

//         if (distance < shortestDistance) {
//           nearestDriver = { id: doc.id, data: driverData };
//           shortestDistance = distance;
//         }
//       });

//       if (nearestDriver) {
//         // Update the selected driver's status to 'busy' and assign the patient
//         await updateDoc(doc(firestore, 'drivers', nearestDriver.id), {
//           status: 'busy',
//           assignedPatient: userId,
//         });

//         // Add a request record to Firestore
//         await setDoc(doc(firestore, 'requests', userId), {
//           location: patientLocation,
//           timestamp: new Date(),
//           assignedDriver: nearestDriver.id,
//         });

//         console.log('SOS request sent. Nearest driver assigned:', nearestDriver.id);
//         Alert.alert('SOS Request Sent', 'Nearest driver has been assigned.');
//         navigation.navigate('AmbulancePage', { driverId: nearestDriver.id });
//       } else {
//         console.log('No suitable driver found');
//         Alert.alert('No Suitable Driver', 'No suitable driver found.');
//       }
//     } catch (error) {
//       console.error('Error handling SOS request:', error);
//       Alert.alert('Error', 'Error processing SOS request. Please try again later.');
//     }
//   };

//   // Function to calculate the distance between two geographical points
//   function calculateDistance(lat1, lon1, lat2, lon2) {
//     const toRadians = (degree) => (degree * Math.PI) / 180;
//     const R = 6371; // Radius of Earth in kilometers
//     const dLat = toRadians(lat2 - lat1);
//     const dLon = toRadians(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Distance in kilometers
//   }


//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
//       <Image
//         source={ambulance}
//         style={styles.headerImage}
//       />

//       {/* Execute SOS Button */}
//       <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
//         <Text style={styles.sosButtonText}>Execute SOS</Text>
//       </TouchableOpacity>


//       {/* Share Location Switch */}
//       {/* <View style={styles.switchContainer}>
//         <Text style={styles.switchLabel}>Share live location</Text>
//         <Switch
//           value={shareLocation}
//           onValueChange={setShareLocation}
//           thumbColor={shareLocation ? "#f5dd4b" : "#f4f3f4"}
//           trackColor={{ false: "#767577", true: "#81b0ff" }}
//         />
//       </View> */}

//       {/* Optional Section */}
//       <View style={styles.optionalContainer}>
//         <View style={styles.optional}>
//           <Text style={styles.optionalText}>Optional</Text>
//         </View>

//         {/* Select Disease Button */}
//         <TouchableOpacity style={styles.diseaseButton}>
//           <Text style={styles.sliderLabel}>Select Disease</Text>
//           <View style={styles.pickercontainer}>
//             <Picker
//               selectedValue={disease}
//               style={styles.picker}
//               onValueChange={(itemValue) => setDisease(itemValue)}
//             >
//               <Picker.Item style={styles.pickeriTEMS} label="Heart Attack" value="Heart Attack" />
//               <Picker.Item label="Stroke" value="Stroke" />
//               <Picker.Item label="Diabetes" value="Diabetes" />
//               <Picker.Item label="Allergies" value="Allergies" />
//               <Picker.Item label="Other" value="Other" />
//             </Picker>
//           </View>
//         </TouchableOpacity>

//         {/* Emergency Level Slider */}
//         <View style={styles.slidermaincontainer}>
//           <Text style={{ ...styles.sliderLabel, width: "100%", marginBottom: 10, textAlign: "center" }}>Emergency level</Text>
//           <View style={styles.slidermid}>
//             <Text style={styles.sliderLabel}>Low</Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={1}
//               value={emergencyLevel}
//               onValueChange={setEmergencyLevel}
//               minimumTrackTintColor="#1F1E30"
//               maximumTrackTintColor="#1F1E30"
//               // thumbImage={circle}
//               thumbTintColor='#1F1E30'
//             />
//             <Text style={styles.sliderLabel}>High</Text>
//           </View>

//         </View>
//         {/* Describe Symptoms Input */}
//         <Text style={styles.sliderLabel}>Describe Symptoms</Text>
//         <TextInput
//           style={styles.textInput}
//           placeholder="What you are feeling ....."
//           multiline
//           onChangeText={setSymptoms}
//           value={symptoms}
//         />

//         {/* Submit Button */}
//         <TouchableOpacity style={styles.submitButton} onPress={() => {
//           navigation.navigate("Reviews");
//         }}>
//           <Text style={styles.submitButtonText}>Submit</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

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
    height: 230,
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

export default Homapage;
