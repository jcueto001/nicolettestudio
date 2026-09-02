// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDmSkLajhKyjTbPKMYjmiuUzzYo4EuY6E",
  authDomain: "nicolett-studio.firebaseapp.com",
  databaseURL: "https://nicolett-studio-default-rtdb.firebaseio.com",
  projectId: "nicolett-studio",
  storageBucket: "nicolett-studio.firebasestorage.app",
  messagingSenderId: "880165823498",
  appId: "1:880165823498:web:b248b2d0fa9242b1f72bf3",
  measurementId: "G-MR0FZJD9LV"
};

// Initialize Firebase using compat mode to easily integrate with vanilla JS
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
