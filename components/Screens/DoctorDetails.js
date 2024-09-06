import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import doc2 from '../Images/doc2.png';
const DoctorProfile = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => {
                navigation.goBack();
            }}>
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            {/* Doctor Image */}
            <Image
                source={doc2} // Replace with the actual image link
                style={styles.doctorImage}
            />
            {/* Doctor Details */}
            <View style={styles.detailsContainer}>
                <View style={styles.line}></View>
                <Text style={styles.doctorName}>Dr. Hira Kanwal</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Specialization</Text>
                    <Text style={styles.value}>Cardiologist</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Experience</Text>
                    <Text style={styles.value}>5+ Years</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Specialization</Text>
                    <Text style={styles.value}>Cardiologist</Text>
                </View>

                {/* Appointment Button */}
                <TouchableOpacity style={styles.appointButton}>
                    <Text style={styles.appointButtonText}>Appoint</Text>
                </TouchableOpacity>
            </View>

            {/* Reviews Section */}
            <ScrollView style={styles.reviewsContainer}>
                <Text style={styles.reviewsTitle}>Reviews</Text>

                {[
                    { name: 'Muhammad Aarij', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ali Haider', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ayesha Abbas', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Muhammad Aarij', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ali Haider', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ayesha Abbas', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Muhammad Aarij', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ali Haider', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ayesha Abbas', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Muhammad Aarij', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ali Haider', review: 'The doctor is very kind and experienced', rating: 3 },
                    { name: 'Ayesha Abbas', review: 'The doctor is very kind and experienced', rating: 3 },
                ].map((item, index) => (
                    <View key={index} style={styles.reviewCard}>
                        <View style={styles.reviewtop}>
                            <Text style={styles.reviewerName}>{item.name}</Text>

                            <View style={styles.ratingContainer}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Text key={i} style={[styles.star, { color: i < item.rating ? '#ffd700' : '#d3d3d3' }]}>★</Text>
                                ))}
                            </View>
                        </View>
                        <Text style={styles.reviewText}>{item.review}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',

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
    doctorImage: {
        // paddingTop:50,
        width: '100%',
        height: 280,
        resizeMode: 'contain',
    },
    detailsContainer: {
        paddingHorizontal: 30,
        paddingTop: 20,
        backgroundColor: '#1F1E30',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -10,
        // borderWidth: 2,

    },
    doctorName: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "sans-serif-black",
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoContainer: {
        paddingHorizontal: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 15,
        color: '#fff',
        fontWeight: 'bold',
    },
    value: {
        fontSize: 15,
        color: '#fff',
    },
    appointButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        width: "55%",
        alignSelf: "center",
    },
    appointButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1F1E30',
    },
    reviewsContainer: {
        padding: 20,
        backgroundColor: '#1F1E30',
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "sans-serif-black",
        color: '#fff',
        // textAlign: 'center',
        marginBottom: 20,
    },
    reviewCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    reviewtop: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: "center",
        gap: 10,
    },
    reviewerName: {
        fontSize: 15,
        fontFamily: "sans-serif-black",
        color: '#1F1E30',
    },
    reviewText: {
        fontSize: 14,
        color: '#555',
        marginVertical: 3,
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    star: {
        fontSize: 20,
    },
    line: {
        alignSelf:"center",
        width: '30%',
        height: 3,
        backgroundColor: '#FFFFFF',
        marginBottom: 15,
        opacity:0.8,
    }
});

export default DoctorProfile;
