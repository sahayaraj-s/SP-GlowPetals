// SP GlowPetals - Firebase Configuration & CRUD Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore, collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  onSnapshot, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgKKArWbkYIW83qJ0UkIlEQVd0yQxpn0s",
  authDomain: "sp-glowpetals.firebaseapp.com",
  projectId: "sp-glowpetals",
  storageBucket: "sp-glowpetals.firebasestorage.app",
  messagingSenderId: "394344825584",
  appId: "1:394344825584:web:82f02b5eb387a36df3b835",
  measurementId: "G-18NC48XCZX"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

// ============ AUTH ============
export const adminLogin = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
export const adminLogout = async () => await signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ============ CLOUDINARY IMAGE UPLOAD ============
export const uploadImage = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  formData.append("upload_preset", "spglowpetals");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dcn5q6uhx/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  console.log(data);

  if (!data.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return data.secure_url;
};
// ============ PRODUCTS ============
export const addProduct = async (data) => await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
export const updateProduct = async (id, data) => await updateDoc(doc(db, "products", id), data);
export const deleteProduct = async (id) => await deleteDoc(doc(db, "products", id));
export const getProduct = async (id) => { const d = await getDoc(doc(db, "products", id)); return d.exists() ? { id: d.id, ...d.data() } : null; };
export const getProducts = async (filters = {}) => {

  let ref = collection(db, "products");

  let q;

  if (filters.category) {

    q = query(
      ref,
      where("category", "==", filters.category)
    );

  } else {

    q = query(
      ref,
      orderBy("createdAt", "desc")
    );

  }

  const snap = await getDocs(q);

  let products = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // extra filters
  if (filters.featured) {
    products = products.filter(p => p.featured);
  }

  if (filters.trending) {
    products = products.filter(p => p.trending);
  }

  if (filters.limit) {
    products = products.slice(0, filters.limit);
  }

  return products;
};
// ============ CATEGORIES ============

// Default Built-in Categories
const defaultCategories = [
  {
    id: "candles",
    name: "Gift Candles",
    slug: "candles",
    icon: "🕯️",
    description: "Luxury scented candles",
    active: true,
    builtIn: true,
    sort: 1
  },
  {
    id: "flowers",
    name: "Flowers",
    slug: "flowers",
    icon: "🌹",
    description: "Fresh flower collections",
    active: true,
    builtIn: true,
    sort: 2
  },
  {
    id: "surprise-boxes",
    name: "Surprise Boxes",
    slug: "surprise-boxes",
    icon: "🎁",
    description: "Mystery surprise gifts",
    active: true,
    builtIn: true,
    sort: 3
  },
  {
    id: "romantic",
    name: "Romantic Gifts",
    slug: "romantic",
    icon: "💕",
    description: "Romantic collections",
    active: true,
    builtIn: true,
    sort: 4
  },
  {
    id: "personalized",
    name: "Personalized Gifts",
    slug: "personalized",
    icon: "✨",
    description: "Custom gifts",
    active: true,
    builtIn: true,
    sort: 5
  },
  {
    id: "teddy",
    name: "Teddy Bears",
    slug: "teddy",
    icon: "🧸",
    description: "Cute teddy bears",
    active: true,
    builtIn: true,
    sort: 6
  },
  {
    id: "chocolates",
    name: "Chocolates",
    slug: "chocolates",
    icon: "🍫",
    description: "Chocolate collections",
    active: true,
    builtIn: true,
    sort: 7
  },
  {
    id: "hampers",
    name: "Hampers",
    slug: "hampers",
    icon: "🎀",
    description: "Gift hampers",
    active: true,
    builtIn: true,
    sort: 8
  },
  {
    id: "premium",
    name: "Premium Gifts",
    slug: "premium",
    icon: "👑",
    description: "Luxury premium gifts",
    active: true,
    builtIn: true,
    sort: 9
  }
];

export const seedBuiltInCategories = async () => {

  for (const cat of defaultCategories) {

    await setDoc(
      doc(db, "categories", cat.id),
      cat,
      { merge: true }
    );

  }

};

export const addCategory = async (data) => {

  return await addDoc(
    collection(db, "categories"),
    {
      ...data,
      builtIn: false,
      createdAt: serverTimestamp()
    }
  );

};

export const updateCategory = async (id, data) => {

  return await updateDoc(
    doc(db, "categories", id),
    data
  );

};

export const deleteCategory = async (id) => {

  return await deleteDoc(
    doc(db, "categories", id)
  );

};

export const getCategories = async () => {

  await seedBuiltInCategories();

  const snap = await getDocs(
    query(collection(db, "categories"))
  );

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

};

// ============ BANNERS ============
export const addBanner = async (data) => await addDoc(collection(db, "banners"), { ...data, createdAt: serverTimestamp() });
export const updateBanner = async (id, data) => await updateDoc(doc(db, "banners", id), data);
export const deleteBanner = async (id) => await deleteDoc(doc(db, "banners", id));
export const getBanners = async () => { const snap = await getDocs(query(collection(db, "banners"), orderBy("createdAt", "desc"))); return snap.docs.map(d => ({ id: d.id, ...d.data() })); };

// ============ ORDERS ============
export const addOrder = async (data) => await addDoc(collection(db, "orders"), { ...data, createdAt: serverTimestamp(), status: "pending" });
export const updateOrder = async (id, data) => await updateDoc(doc(db, "orders", id), data);
export const getOrders = async () => { const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))); return snap.docs.map(d => ({ id: d.id, ...d.data() })); };
export const getOrder = async (id) => { const d = await getDoc(doc(db, "orders", id)); return d.exists() ? { id: d.id, ...d.data() } : null; };
export const listenOrders = (cb) => onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

// ============ USERS/CUSTOMERS ============
export const saveUser = async (id, data) => await setDoc(doc(db, "users", id), data, { merge: true });
export const getUsers = async () => { const snap = await getDocs(collection(db, "users")); return snap.docs.map(d => ({ id: d.id, ...d.data() })); };

export { db, auth };
