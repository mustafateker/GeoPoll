import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getOpenAIResponse, getWeatherData } from './services';

const ANTALYA_LOCATION = {
  coords: {
    latitude: 36.88694620848809,
    longitude: 30.67620094252119,
    altitude: 30
  }
};

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Merhaba! Size nasıl yardımcı olabilirim?', isBot: true },
  ]);
  const [inputText, setInputText] = useState('');
  const [location] = useState(ANTALYA_LOCATION);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="map-marker-radius" size={28} color="#FFF" />
          <MaterialCommunityIcons name="chat-processing" size={24} color="#FFF" style={styles.chatIcon} />
        </View>
        <Text style={styles.headerTitle}>GeoChat Asistan</Text>
      </View>
      <Text style={styles.headerSubtitle}>Konum ve Hava Durumu Bilgileri</Text>
    </View>
  );

  const addMessage = (text, isBot = false, weatherData = null) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isBot,
      weatherData,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');
    addMessage(userMessage, false);
    setLoading(true);

    try {
      const lowerMessage = userMessage.toLowerCase();

      // Hava durumu kontrolü
      if (lowerMessage.includes('hava') || lowerMessage.includes('sıcaklık')) {
        const weatherData = await getWeatherData(location.coords.latitude, location.coords.longitude);
        const weatherResponse = `🌤 Antalya, ÖZkaymak Falez Hotel Hava Durumu:\nSıcaklık: ${weatherData.temperature}°C\nDurum: ${weatherData.description}\nNem: %${weatherData.humidity}\nRüzgar: ${weatherData.windSpeed} m/s`;
        addMessage(weatherResponse, true, weatherData);
      }
      // Konum kontrolü
      else if (lowerMessage.includes('konum') || lowerMessage.includes('nerede') || lowerMessage.includes('koordinat')) {
        const { latitude, longitude, altitude } = location.coords;
        addMessage(`📍 ÖZkaymak Falez Hotel Konumu:\nEnlem: ${latitude}\nBoylam: ${longitude}\nRakım: ${altitude || 'Bilinmiyor'} metre\n\nOtelimiz Antalya'nın merkezinde, Konyaaltı sahilinde bulunmaktadır.`, true);
      }
      // Diğer mesajlar için
      else {
        const response = await getOpenAIResponse(userMessage);
        addMessage(response, true);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', true);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
      <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
        {item.text}
      </Text>
      {item.weatherData?.icon && (
        <Image
          source={{ uri: `http://openweathermap.org/img/w/${item.weatherData.icon}.png` }}
          style={styles.weatherIcon}
        />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.safeArea} />
      {renderHeader()}
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          style={styles.messageList}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={inputText.trim() ? "#4CAF50" : "#666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  safeArea: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    backgroundColor: '#4CAF50',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  },
  chatIcon: {
    marginLeft: -8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  botBubble: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  botText: {
    color: '#000',
  },
  userText: {
    color: '#FFF',
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginTop: 5,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});

export default ChatbotScreen;
