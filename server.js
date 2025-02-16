const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// PostgreSQL bağlantı havuzu
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'antalya_air_quality',
    password: '276288380Bh.',  // Kurulum sırasında belirlediğiniz şifreyi buraya yazın
    port: 5432,
});

// Veritabanı bağlantısını test et
pool.connect((err, client, release) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err);
        return;
    }
    console.log('PostgreSQL veritabanına başarıyla bağlandı');
    release();
});

// Statik dosyaları serve et
app.use(express.static('public'));
app.use(express.json());

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.js'));
});

// Tüm otelleri getir
app.get('/api/hotels', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hotels');
        res.json(result.rows);
    } catch (err) {
        console.error('Otel verisi çekme hatası:', err);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});

// Tüm hava kalitesi noktalarını getir
app.get('/api/air-quality', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM air_quality_points');
        res.json(result.rows);
    } catch (err) {
        console.error('Hava kalitesi verisi çekme hatası:', err);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});

// Belirli bir yarıçap içindeki en iyi oteli bul
app.get('/api/best-hotel', async (req, res) => {
    const { lat, lng, radius } = req.query;

    try {
        // Önce verilen yarıçap içindeki otelleri bul
        const hotelsQuery = `
            SELECT 
                id, name, latitude, longitude, rating,
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(latitude::float)) *
                        cos(radians(longitude::float) - radians($2)) +
                        sin(radians($1)) * sin(radians(latitude::float))
                    )
                ) as distance
            FROM hotels
            WHERE (    
                6371 * acos(
                    cos(radians($1)) * cos(radians(latitude::float)) *
                    cos(radians(longitude::float) - radians($2)) +
                    sin(radians($1)) * sin(radians(latitude::float))
                )
            ) <= $3
            ORDER BY distance ASC;
        `;

        const hotels = await pool.query(hotelsQuery, [lat, lng, radius]);

        if (hotels.rows.length === 0) {
            return res.json(null);
        }

        // Her otel için çevresindeki hava kalitesi noktalarını kontrol et
        const airQualityQuery = `
            SELECT 
                id, latitude, longitude, pollution_level,
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(latitude::float)) *
                        cos(radians(longitude::float) - radians($2)) +
                        sin(radians($1)) * sin(radians(latitude::float))
                    )
                ) as distance
            FROM air_quality_points
            WHERE (
                6371 * acos(
                    cos(radians($1)) * cos(radians(latitude::float)) *
                    cos(radians(longitude::float) - radians($2)) +
                    sin(radians($1)) * sin(radians(latitude::float))
                )
            ) <= 2
            ORDER BY distance ASC;
        `;

        let bestHotel = null;
        let bestScore = -1;

        for (const hotel of hotels.rows) {
            const airQualityPoints = await pool.query(airQualityQuery, [hotel.latitude, hotel.longitude]);
            let totalScore = 0;
            let count = 0;

            for (const point of airQualityPoints.rows) {
                if (point.distance <= 2) {
                    const weight = 1 - (point.distance / 2);
                    totalScore += (300 - point.pollution_level) * weight;
                    count++;
                }
            }

            const airQualityScore = count > 0 ? totalScore / count : 0;
            const hotelScore = (hotel.rating / 5) * 0.3 + (airQualityScore / 300) * 0.7;

            if (hotelScore > bestScore) {
                bestScore = hotelScore;
                bestHotel = hotel;
            }
        }

        res.json(bestHotel);
    } catch (err) {
        console.error('En iyi otel arama hatası:', err);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});

// İki nokta arasındaki mesafeyi hesaplayan yardımcı fonksiyon
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Sunucuyu başlat
let server;
try {
    server = app.listen(port, () => {
        console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
    });
} catch (error) {
    console.error('Sunucu başlatma hatası:', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
    server.close(() => {
        console.log('Sunucu kapatıldı');
        pool.end();
    });
}); 