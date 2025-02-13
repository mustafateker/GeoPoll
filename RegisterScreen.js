import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Parolalar eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Hata", "Parola en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);
      console.log('Kayıt işlemi başlatılıyor...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Kullanıcı başarıyla oluşturuldu:', userCredential.user.email);
      Alert.alert(
        "Başarılı",
        "Hesabınız başarıyla oluşturuldu!",
        [
          {
            text: "Giriş Yap",
            onPress: () => navigation.replace("Login")
          }
        ]
      );
    } catch (error) {
      console.error('Kayıt hatası:', error.code, error.message);
      let errorMessage = "Kayıt sırasında bir hata oluştu.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Bu e-posta adresi zaten kullanımda.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Geçerli bir e-posta adresi giriniz.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "E-posta/şifre girişi etkin değil.";
          break;
        case 'auth/weak-password':
          errorMessage = "Daha güçlü bir parola kullanın.";
          break;
        default:
          errorMessage = `Kayıt işlemi başarısız oldu: ${error.message}`;
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="map" size={60} color="#28a745" />
        </View>
        <Text style={styles.title}>GeoPoll</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Parola"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Parolayı Tekrar Girin"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Zaten hesabınız var mı? <Text style={styles.loginLink}>Giriş Yapın</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93cb9f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    color: '#28a745',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;