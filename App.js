import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const App = () => {
  const [location, setLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState('');

  // Kullanıcının konumunu al
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Konum izni reddedildi.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      // Google Haritalar URL'sini oluştur
      const apiKey = 'AIzaSyBSveqk2_17IIOVIYZZ2v56d_nYzRjIshk'; // API key'inizi buraya ekleyin
      const url = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${location.coords.latitude},${location.coords.longitude}&zoom=15`;
      setMapUrl(url);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <WebView
          style={styles.webview}
          source={{ uri: mapUrl }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <Text>Konum yükleniyor...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default App;