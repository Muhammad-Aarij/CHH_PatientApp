import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';


export default function LoaderModal({ message}) {
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.maincontainer]}>
            <View style={styles.modal}>
                <LottieView
                    style={styles.animation}
                    source={require('../Images/loading.json')}
                    autoPlay
                    loop={true} 
                    />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        width: 200, height: 200,
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        flexDirection: "column",
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    text: {
        marginTop: 10,
        textAlign: 'center',
    },
    animation: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
});
