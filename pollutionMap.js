import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import MapView, { Marker, Circle, UrlTile, Overlay } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from "@expo/vector-icons";

// API URL'lerini platform bazlı ayarlıyoruz
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
});

// Antalya sınırları
const ANTALYA_BOUNDS = {
  minLat: 36.8,
  maxLat: 37.0,
  minLng: 30.6,
  maxLng: 30.9
};

const ANTALYA_CENTER = {
  latitude: (ANTALYA_BOUNDS.minLat + ANTALYA_BOUNDS.maxLat) / 2,
  longitude: (ANTALYA_BOUNDS.minLng + ANTALYA_BOUNDS.maxLng) / 2,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const PollutionMap = () => {
  const [location, setLocation] = useState(ANTALYA_CENTER);
  const [hotels, setHotels] = useState([]);
  const [airQualityPoints, setAirQualityPoints] = useState([]);
  const [interpolatedPoints, setInterpolatedPoints] = useState([]);
  const [radius, setRadius] = useState('2');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bestHotel, setBestHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [showHotels, setShowHotels] = useState(true);
  const [showAirQuality, setShowAirQuality] = useState(true);

  // İki nokta arasındaki mesafeyi hesapla (km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Noktaları interpole et
  const interpolatePoints = (points) => {
    const interpolatedPoints = [];
    const gridSize = 0.005; // Yaklaşık 500m aralıklarla grid oluştur

    for (let lat = ANTALYA_BOUNDS.minLat; lat <= ANTALYA_BOUNDS.maxLat; lat += gridSize) {
      for (let lng = ANTALYA_BOUNDS.minLng; lng <= ANTALYA_BOUNDS.maxLng; lng += gridSize) {
        let totalWeight = 0;
        let weightedPollution = 0;

        points.forEach(point => {
          const distance = calculateDistance(lat, lng, point.latitude, point.longitude);
          if (distance <= 2) {
            const weight = 1 / Math.pow(distance + 0.1, 2);
            totalWeight += weight;
            weightedPollution += point.pollution_level * weight;
          }
        });

        if (totalWeight > 0) {
          interpolatedPoints.push({
            latitude: lat,
            longitude: lng,
            pollution_level: weightedPollution / totalWeight
          });
        }
      }
    }

    points.forEach(point => {
      interpolatedPoints.push({
        ...point,
        isOriginal: true
      });
    });

    return interpolatedPoints;
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating);
  };

  const getPollutionColor = (level) => {
    if (level <= 100) return 'rgba(0, 255, 0, 0.3)';  // Açık yeşil
    if (level <= 200) return 'rgba(255, 0, 0, 0.3)'; // Açık kırmızı
    return 'rgba(255, 0, 0, 0.7)';  // Koyu kırmızı
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni Gerekli', 'Lütfen uygulamaya konum izni verin.');
        return;
      }

      setLoading(true);
      await loadData();

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        ...ANTALYA_CENTER,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Otelleri yükle
      const hotelsResponse = await fetch(`${API_BASE_URL}/api/hotels`);
      const hotelsData = await hotelsResponse.json();
      const processedHotels = hotelsData.map(hotel => ({
        ...hotel,
        latitude: parseFloat(hotel.latitude),
        longitude: parseFloat(hotel.longitude)
      }));
      setHotels(processedHotels);

      // Hava kalitesi verilerini yükle
      const airQualityResponse = await fetch(`${API_BASE_URL}/api/air-quality`);
      const airQualityData = await airQualityResponse.json();
      const processedPoints = airQualityData.map(point => ({
        ...point,
        latitude: parseFloat(point.latitude),
        longitude: parseFloat(point.longitude)
      }));
      setAirQualityPoints(processedPoints);

      // Interpolasyon uygula
      const interpolated = interpolatePoints(processedPoints);
      setInterpolatedPoints(interpolated);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    }
  };

  const findBestHotel = async () => {
    if (!selectedLocation) {
      Alert.alert('Uyarı', 'Lütfen haritadan bir konum seçin.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/best-hotel?lat=${selectedLocation.latitude}&lng=${selectedLocation.longitude}&radius=${radius}`
      );
      const bestHotel = await response.json();
      if (bestHotel) {
        setBestHotel({
          ...bestHotel,
          latitude: parseFloat(bestHotel.latitude),
          longitude: parseFloat(bestHotel.longitude)
        });
        Alert.alert('Başarılı', `En uygun otel bulundu: ${bestHotel.name}`);
      } else {
        Alert.alert('Bilgi', 'Seçilen bölgede uygun otel bulunamadı.');
      }
    } catch (error) {
      console.error('Otel arama hatası:', error);
      Alert.alert('Hata', 'En uygun otel aranırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={ANTALYA_CENTER}
        region={location}
        mapType={mapType}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
      >
        {/* Özel harita katmanı */}
        <UrlTile
          urlTemplate={`${API_BASE_URL}/tiles/Mapnik/{z}/{x}/{y}.png`}
          maximumZ={20}
          minimumZ={12}
          flipY={false}
        />

        {/* Hava kalitesi katmanı */}
        {showAirQuality && interpolatedPoints.map((point, index) => (
          <Circle
            key={`air-${index}`}
            center={{
              latitude: point.latitude,
              longitude: point.longitude
            }}
            radius={250}
            strokeColor={getPollutionColor(point.pollution_level)}
            fillColor={getPollutionColor(point.pollution_level)}
            strokeWidth={1}
          />
        ))}

        {/* Otel işaretleri */}
        {showHotels && hotels.map((hotel, index) => (
          <Marker
            key={`hotel-${index}`}
            coordinate={{
              latitude: hotel.latitude,
              longitude: hotel.longitude
            }}
            title={hotel.name}
            description={getStarRating(hotel.rating)}
          >
            <View style={styles.hotelMarker}>
              <Text style={styles.hotelRating}>{getStarRating(hotel.rating)}</Text>
            </View>
          </Marker>
        ))}

        {/* Seçili konum ve arama yarıçapı */}
        {selectedLocation && (
          <>
            <Circle
              center={selectedLocation}
              radius={parseFloat(radius) * 1000}
              strokeColor="rgba(52, 152, 219, 0.8)"
              fillColor="rgba(52, 152, 219, 0.1)"
              strokeWidth={2}
            />
            <Marker
              coordinate={selectedLocation}
              title="Seçilen Konum"
            >
              <View style={styles.selectedMarker}>
                <Ionicons name="location" size={24} color="#3498db" />
              </View>
            </Marker>
          </>
        )}

        {/* En iyi otel */}
        {bestHotel && (
          <Marker
            coordinate={{
              latitude: bestHotel.latitude,
              longitude: bestHotel.longitude
            }}
            title={bestHotel.name}
            description={`${getStarRating(bestHotel.rating)} - En İyi Seçenek`}
          >
            <View style={styles.bestHotelMarker}>
              <Text style={styles.hotelRating}>{getStarRating(bestHotel.rating)}</Text>
              <Ionicons name="star" size={16} color="#ffc107" style={styles.bestHotelIcon} />
            </View>
          </Marker>
        )}
      </MapView>

      <ScrollView style={styles.menu}>
        <View style={styles.header}>
          <Text style={styles.title}>Antalya</Text>
          <Text style={styles.subtitle}>Hava Kalitesi ve Otel Haritası</Text>
        </View>

        <View style={styles.controlsSection}>
          <View style={styles.dataControls}>
            <TouchableOpacity
              style={[styles.secondaryButton, showHotels && styles.activeButton]}
              onPress={() => setShowHotels(!showHotels)}
            >
              <Text style={[styles.buttonText, showHotels && styles.activeButtonText]}>
                🏨 Oteller
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, showAirQuality && styles.activeButton]}
              onPress={() => setShowAirQuality(!showAirQuality)}
            >
              <Text style={[styles.buttonText, showAirQuality && styles.activeButtonText]}>
                🌬 Hava Kalitesi
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRadius}>
            <Text style={styles.label}>Arama Yarıçapı (km)</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={radius}
                onChangeText={(text) => setRadius(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={findBestHotel}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Aranıyor...' : 'En Uygun Oteli Bul'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Hava Kalitesi Seviyeleri</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.good]} />
              <Text style={styles.legendText}>İyi (0-100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.moderate]} />
              <Text style={styles.legendText}>Orta (101-200)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, styles.bad]} />
              <Text style={styles.legendText}>Kötü (201+)</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  dataControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },
  searchRadius: {
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  legend: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
  },
  legendItems: {
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    marginLeft: 10,
    fontSize: 14,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  hotelMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  hotelRating: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedMarker: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bestHotelMarker: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bestHotelIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  good: {
    backgroundColor: "rgba(0, 255, 0, 0.3)",
  },
  moderate: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
  },
  bad: {
    backgroundColor: "rgba(255, 0, 0, 0.7)",
  },
});

export default PollutionMap;