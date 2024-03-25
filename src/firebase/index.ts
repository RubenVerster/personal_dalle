import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.Firebase_apiKey,
  authDomain: import.meta.env.Firebase_authDomain,
  projectId: import.meta.env.Firebase_projectId,
  storageBucket: import.meta.env.Firebase_storageBucket,
  messagingSenderId: import.meta.env.Firebase_messagingSenderId,
  appId: import.meta.env.Firebase_appId,
};

const app = initializeApp(firebaseConfig);
