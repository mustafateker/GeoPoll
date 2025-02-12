import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./HomeScreen"; // HomeScreen'iniz
import LoginScreen from "./LoginScreen"; // LoginScreen'iniz
import PollutionMapScreen from "./PollutionMapScreen"; // PollutionMapScreen'iniz
import RegisterScreen from "./RegisterScreen"; // RegisterScreen'iniz

// Stack Navigator'ı oluştur
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login ekranı */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        {/* Home ekranı */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        
        {/* PollutionMap ekranı */}
        <Stack.Screen name="PollutionMapScreen" component={PollutionMapScreen} options={{ headerShown: false }} />
      
        
        {/* Register ekranı */}
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
