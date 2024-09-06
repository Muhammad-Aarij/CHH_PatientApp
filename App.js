import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homapage from './components/Screens/Homepage';
import DoctorProfile from './components/Screens/DoctorDetails';
import Ambulancepage from './components/Screens/Ambulancepage';
import SignIn from './components/Screens/SignIn';
import SignUp from './components/Screens/SignUp';
import { FirebaseApp, initializeApp } from '@react-native-firebase/app';
import firebaseConfig from './firebaseConfig'

const app = initializeApp(firebaseConfig);
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen
          name="Signin"
          component={SignIn}
          options={{ headerShown: false }} // Hide header
        />
        <Stack.Screen
          name="signup"
          component={SignUp}
          options={{ headerShown: false }} // Hide header
        />
        <Stack.Screen
          name="Home"
          component={Homapage}
          options={{ headerShown: false }} // Hide header
        />
        <Stack.Screen
          name="DoctorProfile"
          component={DoctorProfile}
          options={{ headerShown: false }} // Hide header
        />
        <Stack.Screen
          name="Reviews"
          component={Ambulancepage}
          options={{ headerShown: false }} // Hide header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
