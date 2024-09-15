import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { auth, db } from '../../firebaseConfig'; // Import firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import ambulance from '../Images/ambulance.png';

const SignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Initialize default values for the patient document
      const patientData = {
        disease: '', // String
        emergencyLevel: 5, // Number
        location: [13.432, 24321.325], // Array with two numbers
        symptoms: '' // String
      };

      // Create a document in 'patients' collection with the user's UID as the document ID
      await setDoc(doc(db, 'patients', user.uid), patientData);

      console.log('Account and patient document created successfully');
      navigation.navigate("Home");
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert(`Error signing up: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Image source={ambulance} style={styles.headerImage} />
      <Text style={styles.welcomeText}>Create an Account</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Email"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.textInput}
        placeholder="Confirm Password"
        placeholderTextColor="#B0B0B0"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F1E30', padding: 20 },
  headerImage: { width: '100%', height: 200, resizeMode: 'contain', marginTop: 20 },
  welcomeText: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  textInput: { backgroundColor: '#F0F0F0', borderRadius: 10, padding: 15, width: '100%', marginBottom: 20, color: '#1F1E30' },
  signUpButton: { backgroundColor: '#FFFFFF', paddingVertical: 12, width: '60%', borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  signUpButtonText: { color: '#1F1E30', fontWeight: 'bold', fontSize: 14 },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signInText: { color: '#FFFFFF', fontSize: 14 },
  signInLink: { color: '#81b0ff', fontSize: 14, marginLeft: 5 },
});

export default SignUp;
