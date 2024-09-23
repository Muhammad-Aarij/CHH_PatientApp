import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import map from '../Images/map.png';
import driver from '../Images/driver.png';
import doc1 from '../Images/doc1.png';
import doc2 from '../Images/doc2.png';
import doc3 from '../Images/doc3.png';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'; // Import Firestore snapshot listener
import { db } from '../../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';


const Ambulancepage = ({ navigation, route }) => {
    const { driverName, distance, time, driverId, disease, phonenumber, long, lat } = route.params;
    console.log("ID" + driverId);
    const [updatedDistance, setUpdatedDistance] = useState(distance);
    const [updatedTime, setUpdatedTime] = useState(time);

   

    useFocusEffect(
        React.useCallback(() => {
            const getDriverUpdate = async () => {
                try {
                    const driverDocRef = doc(db, 'ambulances', driverId);
                    const docSnapshot = await getDoc(driverDocRef);

                    if (docSnapshot.exists()) {
                        const ambulanceData = docSnapshot.data();
                        const driverLat = ambulanceData.driverLocation.latitude;
                        const driverLon = ambulanceData.driverLocation.longitude;

                        // Patient's location (static for now, could also be dynamic)
                        const patientLat = lat; // Replace with actual patient latitude
                        const patientLon = long;  // Replace with actual patient longitude

                        const newDistance = calculateDistance(patientLat, patientLon, driverLat, driverLon);
                        const newTime = calculateTime(newDistance, 80); // Assume 60 km/h average speed

                        setUpdatedDistance(newDistance);
                        console.log("Updated Distance: " + newDistance);
                        setUpdatedTime(newTime);
                    } else {
                        Alert.alert('Error', 'Driver not found.');
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to fetch driver data.');
                }
            };

            const intervalId = setInterval(() => {
                getDriverUpdate();
            }, 2000);

            return () => clearInterval(intervalId); // Cleanup interval when the component is unfocused
        }, [driverId, lat, long])
    );

    useFocusEffect(() => {
        const handleBackPress = () => {
            Alert.alert(
                "Back Button Pressed",
                "Do you want to exit the app?",
                [
                    {
                        text: "Cancel",
                        onPress: () => null, // Do nothing
                        style: "cancel"
                    },
                    { text: "OK", onPress: () => BackHandler.exitApp() } // Exit the app
                ]
            );
            return true; // Prevent default back action
        };

        // Add event listener for back button
        BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        // Cleanup interval and back button event listener on component unmount
        return () => {

            BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        };
    });

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceInKm = R * c; // Distance in km
        const distanceInM = distanceInKm * 1000; // Convert km to meters

        return distanceInM;
    };

    const displayDistance = (distanceInM) => {
        if (distanceInM >= 1000) {
            return `${(distanceInM / 1000).toFixed(1)} km`;
        } else {
            return `${distanceInM.toFixed(0)} m`;
        }
    };

    const calculateTime = (distance, averageSpeedKmph) => {
        let distanceinKm=distance/1000;
        console.log(`calculating time`+((distanceinKm / averageSpeedKmph) * 60));
        return (distanceinKm / averageSpeedKmph) * 60; // Time in minutes
    };

    const displayTime = (timeInMinutes) => {
        if (timeInMinutes > 100) {
            const hours = Math.floor(timeInMinutes / 60);
            const minutes = Math.round(timeInMinutes % 60);
            return `${hours} hr ${minutes} min`;
        } else {
            return `${Math.round(timeInMinutes)} min`;
        }
    };

    const doctors = [
        { name: 'Dr. Hira Kanwal', specialty: 'Cardiologist', rating: 4.3, image: doc2 },
        { name: 'Dr. Ali Mughal', specialty: 'Cardiologist', rating: 4.1, image: doc1 },
        { name: 'Dr. Sameena Tahir', specialty: 'Cardiologist', rating: 4.0, image: doc3 },
    ];

    const updateDriverStatus = async (status) => {
        try {
            const driverDocRef = doc(db, 'ambulances', driverId);
            const docSnapshot = await getDoc(driverDocRef);

            if (docSnapshot.exists()) {
                await updateDoc(driverDocRef, {
                    status: status, // Set driver status to the passed parameter
                    patientLocation: [0, 0], // Reset patient location to [0, 0]
                });
                console.log('SuccessDriver status updated to  and patient location reset.');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Driver not found.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update driver data.' + error);
        }
    };


    return (
        <ScrollView style={styles.container}>
            {/* Map Image at the Top */}
            <Image
                source={map} // Replace with your map image URL
                style={styles.mapImage}
                resizeMode="cover"
            />
            <TouchableOpacity style={styles.backButton} onPress={() => {
                navigation.goBack();
            }}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: "#1F1E30", borderTopLeftRadius: 30, borderTopRightRadius: 30, flex: 1 }}>
                <View style={styles.line}></View>

                {/* Driving Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.drivingText}>Driving to your destination</Text>
                    <Text style={styles.distanceText}>{displayDistance(updatedDistance)}</Text>
                    <Text style={styles.timeTextt}>Arriving in {displayTime(updatedTime)}</Text>
                </View>

                {/* Driver Info */}
                <View style={styles.driverContainer}>
                    <Image source={driver} style={styles.driverImage} />
                    <View style={styles.driverInfo}>
                        <Text style={styles.driverName}>{driverName}</Text>
                        <Text style={styles.hospitalName}>Shifa Hospital F10</Text>
                        <View style={styles.ratingContainer}>
                            {[...Array(3)].map((_, i) => (
                                <Text key={i} style={styles.star}>★</Text>
                            ))}
                            {[...Array(2)].map((_, i) => (
                                <Text key={i} style={styles.starEmpty}>★</Text>
                            ))}
                        </View>
                    </View>
                    <View style={styles.contactIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => {
                            Alert.alert("Note", "Message service is unavailable")
                        }}>
                            <Text style={styles.icon}>💬</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} >
                            <Text style={styles.icon}>📞</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ width: "100%", alignItems: "flex-end", paddingHorizontal: 20, marginVertical: 5, }}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('Remedy', { disease: disease });
                    }}>
                        <Text style={{ color: "#33ccee", fontFamily: "sans-serif-condensed" }}>+ Get Precautinary Measures</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 20, marginVertical: 10, }}>
                    <TouchableOpacity style={styles.btn} onPress={() => updateDriverStatus("free")}>
                        <Text style={styles.btnText}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ ...styles.btn, backgroundColor: "white" }} onPress={() => updateDriverStatus("free")}>
                        <Text style={{ ...styles.btnText, color: "#1F1E30" }}>
                            Complete
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* Available Doctors Section */}
                <Text style={styles.availableDoctorsText}>Available Doctors</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.doctorsContainer}
                    style={{ paddingBottom: 10, }}
                >
                    {doctors.map((doctor, index) => (
                        <TouchableOpacity key={index} style={styles.doctorCard} onPress={() => {
                            navigation.navigate("DoctorProfile");
                        }}>
                            <Image source={doctor.image} style={styles.doctorImage} />
                            <Text style={styles.doctorName} numberOfLines={1}>{doctor.name}</Text>
                            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                            <View style={styles.ratingContainer}>
                                {[...Array(Math.floor(doctor.rating))].map((_, i) => (
                                    <Text key={i} style={styles.star}>★</Text>
                                ))}
                                {[...Array(5 - Math.floor(doctor.rating))].map((_, i) => (
                                    <Text key={i} style={styles.starEmpty}>★</Text>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#1F1E30',
    },
    btn: {
        paddingVertical: 7,
        // paddingHorizontal:20,
        width: 150,
        borderWidth: 1.5,
        borderColor: "white",
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: 14,
        fontFamily: "sans-serif-medium",
        color: "white",
    },
    mapImage: {
        width: '100%',
        height: 380,
    },
    infoContainer: {
        paddingVertical: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    drivingText: {
        fontSize: 15,
        fontFamily: "sans-serif-light",
        // fontWeight: 'bold',
        color: '#FFFFFF',
    },
    drivingTextt: {
        fontSize: 18,
        fontFamily: "sans-serif-light",
        // fontWeight: 'bold',
        color: '#FFFFFF',
    },
    timeTextt: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: "sans-serif-light",
        // fontWeight: 'bold',
        color: '#FFFFFF',
    },
    distanceText: {
        fontSize: 30,
        fontFamily: "sans-serif-condensed",
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    driverContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 10,
        elevation: 4,
    },
    driverImage: {
        width: 70,
        height: 70,
        borderRadius: 13,
        // borderWidth:2,
        objectFit: "contain",

    },
    driverInfo: {
        flex: 1,
        marginLeft: 10,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: "sans-serif-condensed",
        color: '#1F1E30',
    },
    hospitalName: {
        fontFamily: "sans-serif-condensed",
        fontSize: 14,
        color: '#1F1E30',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    star: {
        color: '#feca57',
        fontSize: 16,
    },
    starEmpty: {
        color: '#dcdde1',
        fontSize: 16,
    },
    contactIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        // borderWidth:2,
        // borderRadius:50,
        // borderColor:"#1F1E30",
        marginLeft: 10,
        padding: 3,
    },
    icon: {
        fontSize: 20,
        color: '#1F1E30',
    },
    availableDoctorsText: {
        fontSize: 16,
        fontFamily: "sans-serif-condensed",
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 10,
        color: '#FFFFFF',
    },
    doctorsContainer: {
        paddingHorizontal: 20,
    },
    doctorCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 10,
        elevation: 4,
        width: 150,
    },
    doctorImage: {
        width: 90,
        height: 90,
        objectFit: "contain",
        // borderRadius: 40,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2f3542',
        marginTop: 10,
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#57606f',
    },
    doctorRating: {
        fontSize: 14,
        color: '#57606f',
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 20,
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 30,
        color: '#1F1E30',
    },
    line: {
        alignSelf: "center",
        width: '35%',
        height: 3,
        backgroundColor: '#FFFFFF',
        marginTop: 15,
        opacity: 0.8,
    }
});

export default Ambulancepage;
