import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import { LogBox, Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

// LogBox.ignoreLogs(
//     'Non-serializable values were found in the navigation state'
// );

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>   
  )
}
