import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { auth } from '../../firebaseConfig'; // Import the Firebase auth object
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the sign-in function
import ambulance from '../Images/ambulance.png';

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password); // Use the correct function
      console.log('Signed in successfully');
      navigation.navigate("Home");
      // Redirect user to homepage or dashboard
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
      <Image source={ambulance} style={styles.headerImage} />
      <Text style={styles.welcomeText}>Welcome Back!</Text>
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
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
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
  signInButton: { backgroundColor: '#FFFFFF', paddingVertical: 12, width: '60%', borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  signInButtonText: { color: '#1F1E30', fontWeight: 'bold', fontSize: 14 },
  forgotPasswordText: { color: '#FFFFFF', fontSize: 13, marginBottom: 30 },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signUpText: { color: '#FFFFFF', fontSize: 14 },
  signUpLink: { color: '#81b0ff', fontSize: 14, marginLeft: 5 },
});

export default SignIn;
