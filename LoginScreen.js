import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => { // navigation prop'u al
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    } else {
      // Giriş işlemi başarılı olduğunda HomeScreen'e yönlendir
      navigation.navigate("Home");
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?map,earth,green" }} // Yeşil harita temalı arka plan
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="map" size={80} color="#fff" style={styles.icon} /> {/* Harita simgesi */}
          <Text style={styles.title}>Harita Mühendisliği Giriş</Text>

          <TextInput
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#ddd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            placeholderTextColor="#ddd"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Şifremi Unuttum?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Henüz hesabınız yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}> {/* Kayıt Ol butonuna basıldığında RegisterScreen'e git */}
              <Text style={styles.signUpLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",  // Koyu geçiş rengi, içerikleri daha belirgin yapar
    width: "100%",
    height: "100%",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",  // Yarı şeffaf beyaz arka plan
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
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
  input: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#28a745",  // Yeşil tonları
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    marginBottom: 15,
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  signUpLink: {
    color: "#28a745",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default LoginScreen;
