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
  const [showHotels, setShowHotels] = useState(false);
  const [showAirQuality, setShowAirQuality] = useState(false);
  const [showDetailedAirQuality, setShowDetailedAirQuality] = useState(false);
  const [customMapVisible, setCustomMapVisible] = useState(false);

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
    const gridSize = 0.001; // Daha yüksek çözünürlük için

    for (let lat = ANTALYA_BOUNDS.minLat; lat <= ANTALYA_BOUNDS.maxLat; lat += gridSize) {
      for (let lng = ANTALYA_BOUNDS.minLng; lng <= ANTALYA_BOUNDS.maxLng; lng += gridSize) {
        let totalWeight = 0;
        let weightedPollution = 0;

        points.forEach(point => {
          const distance = calculateDistance(lat, lng, point.latitude, point.longitude);
          if (distance <= 5) { // Etki alanını 5km'ye çıkardık
            // Gaussian dağılım ile daha yumuşak geçişler
            const sigma = 1.5;
            const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
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

    return interpolatedPoints;
  };

  const getStarRating = (rating) => {
    return '⭐'.repeat(rating);
  };

  const getPollutionColor = (level) => {
    if (level <= 100) {
      // Yeşil tonları
      const ratio = level / 100;
      const red = Math.round(150 * ratio);
      const green = 255;
      const blue = Math.round(150 * ratio);
      return `rgba(${red}, ${green}, ${blue}, 0.35)`;
    } else if (level <= 200) {
      // Sarı-turuncu tonları
      const ratio = (level - 100) / 100;
      const red = Math.round(150 + (105 * ratio));
      const green = Math.round(255 - (90 * ratio));
      const blue = Math.round(150 * (1 - ratio));
      return `rgba(${red}, ${green}, ${blue}, 0.35)`;
    } else {
      // Kırmızı tonları
      const ratio = Math.min((level - 200) / 100, 1);
      const red = 255;
      const green = Math.round(165 * (1 - ratio));
      const blue = 0;
      return `rgba(${red}, ${green}, ${blue}, 0.35)`;
    }
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

  // Harita tipini değiştiren fonksiyon
  const handleMapTypeChange = (newType) => {
    setMapType(newType);
    setCustomMapVisible(newType === 'custom');

    // Özel harita seçildiğinde hava kalitesi katmanını otomatik göster
    if (newType === 'custom') {
      setShowAirQuality(true);
    }
  };

  // Hava kalitesi butonuna tıklandığında
  const handleAirQualityToggle = () => {
    if (!showAirQuality) {
      setShowAirQuality(true);
      setShowDetailedAirQuality(true);
    } else {
      setShowAirQuality(false);
      setShowDetailedAirQuality(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={ANTALYA_CENTER}
        region={location}
        mapType={mapType === 'satellite' ? 'satellite' : 'standard'}
        onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
        customMapStyle={mapType === 'dark' ? darkMapStyle : null}
      >
        {/* Özel harita katmanı */}
        {customMapVisible && (
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            zIndex={-1}
            tileSize={256}
          />
        )}

        {/* Hava kalitesi katmanı */}
        {(showAirQuality || customMapVisible) && interpolatedPoints.map((point, index) => (
          <Circle
            key={`air-${index}`}
            center={{
              latitude: point.latitude,
              longitude: point.longitude
            }}
            radius={300}
            strokeColor={getPollutionColor(point.pollution_level)}
            fillColor={getPollutionColor(point.pollution_level)}
            strokeWidth={0}
            zIndex={customMapVisible ? 1 : 0}
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
            zIndex={2}
          >
            <View style={[
              styles.hotelMarker,
              mapType === 'dark' && styles.darkModeMarker,
              customMapVisible && styles.customMapMarker
            ]}>
              <Text style={[
                styles.hotelRating,
                mapType === 'dark' && styles.darkModeText,
                customMapVisible && styles.customMapText
              ]}>
                {getStarRating(hotel.rating)}
              </Text>
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
              zIndex={1}
            />
            <Marker
              coordinate={selectedLocation}
              title="Seçilen Konum"
              zIndex={2}
            >
              <View style={[styles.selectedMarker, mapType === 'dark' && styles.darkModeMarker]}>
                <Ionicons name="location" size={24} color={mapType === 'dark' ? '#fff' : '#3498db'} />
              </View>
            </Marker>
          </>
        )}

        {/* En iyi otel */}
        {bestHotel && showHotels && (
          <Marker
            coordinate={{
              latitude: bestHotel.latitude,
              longitude: bestHotel.longitude
            }}
            title={bestHotel.name}
            description={`${getStarRating(bestHotel.rating)} - En İyi Seçenek`}
            zIndex={3}
          >
            <View style={[styles.bestHotelMarker, mapType === 'dark' && styles.darkModeMarker]}>
              <Text style={[styles.hotelRating, mapType === 'dark' && styles.darkModeText]}>
                {getStarRating(bestHotel.rating)}
              </Text>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.controlButton, showHotels && styles.activeButton]}
              onPress={() => setShowHotels(!showHotels)}
            >
              <Text style={[styles.buttonText, showHotels && styles.activeButtonText]}>
                🏨 Oteller
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, showAirQuality && styles.activeButton]}
              onPress={handleAirQualityToggle}
            >
              <Text style={[styles.buttonText, showAirQuality && styles.activeButtonText]}>
                🌬 Hava Kalitesi
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRadius}>
            <Text style={styles.label}>Arama Yarıçapı (km)</Text>
            <TextInput
              style={styles.input}
              value={radius}
              onChangeText={(text) => setRadius(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.mapTypeContainer}>
            <TouchableOpacity
              style={[styles.mapTypeOption, mapType === 'standard' && styles.selectedMapType]}
              onPress={() => handleMapTypeChange('standard')}
            >
              <View style={styles.radioButton}>
                {mapType === 'standard' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={styles.mapTypeText}>OpenStreetMap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapTypeOption, mapType === 'satellite' && styles.selectedMapType]}
              onPress={() => handleMapTypeChange('satellite')}
            >
              <View style={styles.radioButton}>
                {mapType === 'satellite' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={styles.mapTypeText}>Uydu Görüntüsü</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapTypeOption, mapType === 'dark' && styles.selectedMapType]}
              onPress={() => handleMapTypeChange('dark')}
            >
              <View style={styles.radioButton}>
                {mapType === 'dark' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={styles.mapTypeText}>Koyu Tema</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapTypeOption, mapType === 'custom' && styles.selectedMapType]}
              onPress={() => handleMapTypeChange('custom')}
            >
              <View style={styles.radioButton}>
                {mapType === 'custom' && <View style={styles.radioButtonSelected} />}
              </View>
              <Text style={styles.mapTypeText}>Özel Harita</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.airQualityLegend}>
            <Text style={styles.legendTitle}>Hava Kalitesi Seviyeleri</Text>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: 'rgba(0, 255, 0, 0.3)' }]} />
              <Text style={styles.legendText}>İyi (0-100)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: 'rgba(255, 165, 0, 0.3)' }]} />
              <Text style={styles.legendText}>Orta (101-200)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: 'rgba(255, 0, 0, 0.3)' }]} />
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
    flex: 1,
  },
  menu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  activeButtonText: {
    color: '#fff',
  },
  searchRadius: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  mapTypeContainer: {
    marginBottom: 20,
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28a745',
  },
  mapTypeText: {
    fontSize: 16,
    color: '#000',
  },
  airQualityLegend: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
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
  darkModeMarker: {
    backgroundColor: '#333',
    borderColor: '#fff',
  },
  darkModeText: {
    color: '#fff',
  },
  customMapMarker: {
    backgroundColor: 'white',
    borderColor: '#28a745',
  },
  customMapText: {
    color: '#333',
  },
});

// Koyu tema stil tanımı - component dışında tanımlanmalı
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

export default PollutionMap;