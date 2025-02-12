import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = () => {
    if (!username || !email || !password || !phone) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
    } else {
      Alert.alert("Başarılı", "Kayıt başarılı!");
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/featured/?map,earth,green" }} // Doğa & Harita temalı arka plan
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="person-add" size={80} color="#fff" style={styles.icon} /> {/* Kullanıcı ekleme simgesi */}
          <Text style={styles.title}>Harita Mühendisliği Kayıt</Text>

          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#ddd"
            value={username}
            onChangeText={setUsername}
          />

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
            placeholderTextColor="#ddd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Telefon Numarası"
            placeholderTextColor="#ddd"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}> {/* Giriş yapmaya yönlendir */}
              <Text style={styles.signInLink}>Giriş Yap</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Koyu geçiş rengi
    width: "100%",
    height: "100%",
  },
  container: {
    width: "85%",
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Yarı şeffaf beyaz arka plan
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
    backgroundColor: "#28a745", // Yeşil tonları
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  signInLink: {
    color: "#28a745", // Yeşil renkli bağlantı
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default RegisterScreen;
