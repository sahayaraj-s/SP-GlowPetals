// SP GlowPetals — Firebase Configuration & CRUD Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore, collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where, orderBy,
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
export const adminLogin = async (email, password) =>
  await signInWithEmailAndPassword(auth, email, password);
export const adminLogout = async () => await signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ============ CLOUDINARY IMAGE UPLOAD ============
export const uploadImage = async (file, options = {}) => {
  // Validate file
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'spglowpetals');

  // Responsive transformations
  if (options.folder) formData.append('folder', options.folder);
  // Quality auto + format auto for fast loading
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/dcn5q6uhx/image/upload',
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  // Return optimized URL with auto quality/format
  const url = data.secure_url;
  // Insert Cloudinary transformations: auto quality, auto format, limit width
  const optimized = url.replace('/upload/', '/upload/q_auto,f_auto,w_1200,c_limit/');
  return optimized;
};

// Get responsive srcset URL from Cloudinary URL
export const getResponsiveUrl = (url, width = 800) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_limit/`);
};

// ============ PRODUCTS ============
export const addProduct = async (data) =>
  await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });

export const updateProduct = async (id, data) =>
  await updateDoc(doc(db, 'products', id), data);

export const deleteProduct = async (id) =>
  await deleteDoc(doc(db, 'products', id));

export const getProduct = async (id) => {
  const d = await getDoc(doc(db, 'products', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};

export const getProducts = async (filters = {}) => {
  let ref = collection(db, 'products');
  let q;

  if (filters.category) {
    q = query(ref, where('category', '==', filters.category));
  } else {
    q = query(ref, orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  let products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (filters.featured) products = products.filter(p => p.featured);
  if (filters.trending) products = products.filter(p => p.trending);
  if (filters.limit)    products = products.slice(0, filters.limit);

  return products;
};

// Real-time products listener
export const listenProducts = (cb) =>
  onSnapshot(
    query(collection(db, 'products'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

// ============ CATEGORIES — Firebase only, no defaults ============
export const addCategory = async (data) =>
  await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp()
  });

export const updateCategory = async (id, data) =>
  await updateDoc(doc(db, 'categories', id), data);

export const deleteCategory = async (id) => {
  // Hard delete from Firestore — permanent
  await deleteDoc(doc(db, 'categories', id));
};

export const getCategories = async () => {
  // Pure Firebase — no seeding, no defaults
  const snap = await getDocs(
    query(collection(db, 'categories'), orderBy('sort', 'asc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Real-time categories listener — propagates deletes/adds everywhere instantly
export const listenCategories = (cb) =>
  onSnapshot(
    query(collection(db, 'categories'), orderBy('sort', 'asc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

// ============ BANNERS ============
export const addBanner = async (data) =>
  await addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp() });

export const updateBanner = async (id, data) =>
  await updateDoc(doc(db, 'banners', id), data);

export const deleteBanner = async (id) =>
  await deleteDoc(doc(db, 'banners', id));

export const getBanners = async () => {
  const snap = await getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ============ ORDERS ============
export const addOrder = async (data) =>
  await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: serverTimestamp(),
    status: 'pending'
  });

export const updateOrder = async (id, data) =>
  await updateDoc(doc(db, 'orders', id), data);

export const getOrders = async () => {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getOrder = async (id) => {
  const d = await getDoc(doc(db, 'orders', id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
};

export const listenOrders = (cb) =>
  onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

// ============ USERS/CUSTOMERS ============
export const saveUser = async (id, data) =>
  await setDoc(doc(db, 'users', id), data, { merge: true });

export const getUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export { db, auth };
