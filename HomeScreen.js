import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?technology,earth" }} // Teknoloji & Dünya temalı arka plan
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="earth" size={80} color="#fff" style={styles.icon} />{" "}
          {/* Dünya simgesi */}
          <Text style={styles.title}>Harita Mühendisliği</Text>
          
          {/* Kirlilik Haritası butonu */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("PollutionMap")}
          >
            <Ionicons name="cloudy-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Kirlilik Haritası</Text>
          </TouchableOpacity>

          {/* Chatbot butonu */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Chatbot")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#fff"
            />
            <Text style={styles.buttonText}>Chatbot</Text>
          </TouchableOpacity>

          {/* Kayıt Ol butonu */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate("Register")}
          >
            
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Karanlık overlay efekti
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Yarı şeffaf beyaz arka plan
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#28a745",  // Yeşil tonları
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  linkButton: {
    marginTop: 20,
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default HomeScreen;
