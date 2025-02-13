const predefinedResponses = {
    merhaba: "Merhaba! Size nasıl yardımcı olabilirim?",
    nasilsin: "İyiyim, teşekkür ederim. Size nasıl yardımcı olabilirim?",
    neYapabilirsin: "Size konum ve hava durumu hakkında bilgi verebilirim. Başka ne öğrenmek istersiniz?",
    tesekkur: "Rica ederim! Başka bir şey sormak ister misiniz?",
    iyiAksamlar: "İyi akşamlar, iyi geceler!",
    iyiGunler: "Size de iyi günler!",
    gunaydın: "Günaydın! Nasıl yardımcı olabilirim?",
    default: "Üzgünüm, tam anlayamadım. Konum veya hava durumu hakkında bilgi almak ister misiniz?"
};

export const getOpenAIResponse = async (message) => {
    try {
        const lowerMessage = message.toLowerCase();

        // Temel selamlaşma ve vedalaşma
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
            return predefinedResponses.merhaba;
        }
        if (lowerMessage.includes('nasılsın')) {
            return predefinedResponses.nasilsin;
        }
        if (lowerMessage.includes('ne yapabilirsin') || lowerMessage.includes('yardım')) {
            return predefinedResponses.neYapabilirsin;
        }
        if (lowerMessage.includes('teşekkür')) {
            return predefinedResponses.tesekkur;
        }
        if (lowerMessage.includes('iyi akşamlar')) {
            return predefinedResponses.iyiAksamlar;
        }
        if (lowerMessage.includes('iyi günler')) {
            return predefinedResponses.iyiGunler;
        }
        if (lowerMessage.includes('günaydın')) {
            return predefinedResponses.gunaydın;
        }

        // Eğer özel bir eşleşme bulunamazsa
        return predefinedResponses.default;
    } catch (error) {
        console.error('Response Error:', error);
        return 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.';
    }
};

export const getWeatherData = async (latitude, longitude) => {
    try {
        const API_KEY = '33c8e4cb3fa6c93648cef3608ad3380c'; // OpenWeather API Key
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=tr`
        );

        if (!response.ok) {
            throw new Error('Weather API error');
        }

        const data = await response.json();

        if (data.cod === 200) {
            return {
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: data.weather[0].icon
            };
        } else {
            throw new Error('Weather data not available');
        }
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
}; 