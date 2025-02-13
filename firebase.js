// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCIsfrGelqQ2fKYGf3P19A4vHeJCPgIB5U",
    authDomain: "geopoll-91bc0.firebaseapp.com",
    projectId: "geopoll-91bc0",
    storageBucket: "geopoll-91bc0.firebasestorage.app",
    messagingSenderId: "714095267708",
    appId: "1:714095267708:web:ff66e6a02445398df5def9",
    measurementId: "G-LNV50CTJQN"
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        // Eğer uygulama zaten başlatılmışsa, mevcut uygulamayı al
        app = getApp();
    } else {
        console.error('Firebase başlatma hatası:', error);
    }
}

const analytics = getAnalytics(app);

// Auth nesnesini oluştur
const auth = getAuth(app);

export { auth };
export default app;