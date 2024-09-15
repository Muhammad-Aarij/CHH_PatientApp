import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Homapage from './components/Screens/Homepage';
import DoctorProfile from './components/Screens/DoctorDetails';
import Ambulancepage from './components/Screens/Ambulancepage';
import SignIn from './components/Screens/SignIn';
import SignUp from './components/Screens/SignUp';
import Help from './components/Screens/Remedy';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    // Unsubscribe from the listener when unmounting
    return () => unsubscribe();
  }, [initializing]);

  if (initializing) return null; // Optionally, add a loading screen here

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // If the user is signed in, navigate to the Homepage
          <>
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
            <Stack.Screen
              name="Remedy"
              component={Help}
              options={{ headerShown: false }} // Hide header
            />
          </>
        ) : (
          // If the user is not signed in, navigate to the SignIn or SignUp screen
          <>
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
