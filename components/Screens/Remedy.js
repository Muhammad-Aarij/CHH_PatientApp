import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { HeartAttackFAQs, SeizureFAQs, AsthmaAttackFAQs, StrokeFAQs } from './RemedyList';

const { width, height } = Dimensions.get('window');

export default function Help({ navigation, disease }) {
    const [expandedId, setExpandedId] = useState(null);

    const handlePress = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Function to get FAQs based on the disease prop
    const getFAQs = () => {
        switch (disease) {
            case 'heart-attack':
                return HeartAttackFAQs;
            case 'seizure':
                return SeizureFAQs;
            case 'asthma':
                return AsthmaAttackFAQs;
            case 'stroke':
                return StrokeFAQs;
            default:
                return HeartAttackFAQs; // Fallback to heart attack FAQs
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.tiles}>
            <TouchableOpacity style={styles.tileleft} onPress={() => handlePress(item.id)}>
                <View style={styles.tileheader}>
                    <Text style={styles.title}>{item.question}</Text>
                    <Icon name={expandedId === item.id ? "up" : "down"} size={18} color="#222222" />
                </View>
                {expandedId === item.id && (
                    <Text style={styles.content}>{item.answer}</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <>
        <View style={styles.header}>
            <Text style={styles.headerText}>Help</Text>
        </View>
            <FlatList
                data={getFAQs()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.maincontainer}
            />
        </>
    );
}

const styles = StyleSheet.create({
    maincontainer: {
        flexGrow: 1,
        paddingHorizontal: width * 0.06,
        paddingVertical: width * 0.05,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 30,
        paddingHorizontal: 25,
    },
    headerText: {
        fontSize: 35,
        fontFamily: "sans-serif-condensed",
        fontWeight: "bold",
        color: "red",
    },
    btnContainer: {
        height: height * 0.1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: width * 0.024,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: width * 0.003,
        },
        shadowOpacity: 0.22,
        shadowRadius: width * 0.005,
        elevation: width * 0.007,
    },
    btn: {
        backgroundColor: "#C52026",
        borderRadius: width * 0.07,
        padding: width * 0.04,
        width: width * 0.5,
        elevation: width * 0.005,
        marginTop: width * 0.05,
        justifyContent: "center",
        alignItems: "center",
    },
    btnText: {
        color: "white",
        fontFamily: "sans-serif-black",
        fontSize: width * 0.035,
    },
    tiles: {
        flexDirection: "row",
        width: "100%",
        minHeight: width * 0.16,
        padding: width * 0.025,
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: width * 0.024,
        borderBottomWidth: width * 0.0038,
        borderColor: "#E5E4E2",
    },
    tileheader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
    },
    tileleft: {
        width: "100%",
    },
    title: {
        color: '#000000',
        fontSize: width * 0.035,
        fontFamily: "sans-serif-medium",
        fontWeight: '800',
        width: "90%",
    },
    content: {
        marginTop: width * 0.013,
        color: '#555555',
        fontFamily: 'Arial',
        fontSize: width * 0.031,
    },
});
