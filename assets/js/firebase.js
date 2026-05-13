// =========================================
// SP GlowPetals Firebase Config
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

  apiKey: "AIzaSyCgKKArWbkYIW83qJ0UkIlEQVd0yQxpn0s",

  authDomain: "sp-glowpetals.firebaseapp.com",

  projectId: "sp-glowpetals",

  storageBucket: "sp-glowpetals.firebasestorage.app",

  messagingSenderId: "394344825584",

  appId: "1:394344825584:web:82f02b5eb387a36df3b835",

  measurementId: "G-18NC48XCZX"

};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const db = getFirestore(app);

const storage = getStorage(app);

const auth = getAuth(app);


// =========================================
// EXPORTS
// =========================================

export {

  app,

  analytics,

  db,

  storage,

  auth,

  collection,

  addDoc,

  getDocs,

  getDoc,

  updateDoc,

  deleteDoc,

  doc,

  ref,

  uploadBytes,

  getDownloadURL,

  deleteObject,

  signInWithEmailAndPassword,

  signOut

};