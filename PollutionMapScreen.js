import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PollutionMapScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?city,pollution" }} // Kirlilik temalı arka plan
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="cloudy-outline" size={80} color="#fff" style={styles.icon} /> {/* Kirlilik simgesi */}
          <Text style={styles.title}>Kirlilik Haritası</Text>

          <Text style={styles.description}>
            Kirlilik seviyelerini harita üzerinde görüntüleyin ve bölgenizdeki çevresel durumu öğrenin.
          </Text>

          {/* Harita yüklenmesi ve kirlilik verileri buraya eklenebilir */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => alert("Harita Yükleniyor...")} // Burada gerçek harita yükleme fonksiyonu olmalı
          >
            <Ionicons name="map-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Haritayı Görüntüle</Text>
          </TouchableOpacity>

          {/* Ana ekranına dönüş */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkButtonText}>Ana Ekrana Dön</Text>
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
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff", // Mavi tonları
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
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

export default PollutionMapScreen;
