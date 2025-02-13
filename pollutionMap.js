import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";

const PollutionMap = () => {
  const [location, setLocation] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [airQualityPoints, setAirQualityPoints] = useState([]);
  const [radius, setRadius] = useState(2);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bestHotel, setBestHotel] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const hotelsResponse = await fetch('http://localhost:3000/api/hotels');
      const hotels = await hotelsResponse.json();
      setHotels(hotels);

      const airQualityResponse = await fetch('http://localhost:3000/api/air-quality');
      const airQualityPoints = await airQualityResponse.json();
      setAirQualityPoints(airQualityPoints);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error loading data');
    }
  };

  const findBestHotel = async () => {
    if (!selectedLocation) {
      Alert.alert('Please select a location on the map');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/best-hotel?lat=${selectedLocation.latitude}&lng=${selectedLocation.longitude}&radius=${radius}`);
      const bestHotel = await response.json();
      setBestHotel(bestHotel);
    } catch (error) {
      console.error('Error finding best hotel:', error);
      Alert.alert('Error finding best hotel');
    }
  };

  const getAirQualityText = (level) => {
    if (level <= 100) return 'Good';
    if (level <= 200) return 'Moderate';
    return 'Bad';
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : 36.9,
          longitude: location ? location.longitude : 30.7,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
      >
        {hotels.map((hotel, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: hotel.latitude, longitude: hotel.longitude }}
            title={hotel.name}
            description={`Rating: ${hotel.rating}`}
          />
        ))}
        {airQualityPoints.map((point, index) => (
          <Circle
            key={index}
            center={{ latitude: point.latitude, longitude: point.longitude }}
            radius={250}
            strokeColor={point.color}
            fillColor={point.color}
          />
        ))}
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
          />
        )}
        {bestHotel && (
          <Marker
            coordinate={{ latitude: bestHotel.latitude, longitude: bestHotel.longitude }}
            title={bestHotel.name}
            description="Best Choice"
          />
        )}
      </MapView>

      <ScrollView style={styles.menu}>
        <View style={styles.header}>
          <Ionicons name="cloudy-outline" size={80} color="#fff" style={styles.icon} />
          <Text style={styles.title}>Kirlilik Haritası</Text>
          <Text style={styles.description}>
            Kirlilik seviyelerini harita üzerinde görüntüleyin ve bölgenizdeki çevresel durumu öğrenin.
          </Text>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.dataControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setHotels([])}>
              <Text>🏨 Otelleri Göster</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setAirQualityPoints([])}>
              <Text>🌬 Hava Kalitesi Verilerini Göster</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRadius}>
            <Text style={styles.label}>Arama Yarıçapı</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={String(radius)}
                onChangeText={setRadius}
                keyboardType="numeric"
              />
              <Text style={styles.unit}>km</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={findBestHotel}>
            <Text>En Uygun Oteli Bul</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Hava Kalitesi Seviyeleri</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.good]} />
              <Text>İyi (0-100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.moderate]} />
              <Text>Orta (101-200)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.bad]} />
              <Text>Kötü (201+)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 2,
  },
  menu: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  controlsSection: {
    width: "100%",
    marginBottom: 20,
  },
  dataControls: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  searchRadius: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  unit: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
  },
  primaryButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: "#ecf0f1",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  legend: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
  },
  legendTitle: {
    color: "#2c3e50",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  legendItems: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  legendItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#2c3e50",
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  good: {
    backgroundColor: "#90EE90",
  },
  moderate: {
    backgroundColor: "#FFB6C1",
  },
  bad: {
    backgroundColor: "#DDA0DD",
  },
});

export default PollutionMap;