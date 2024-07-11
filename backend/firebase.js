const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc, arrayUnion, arrayRemove } = require('firebase/firestore');
const { getAnalytics } = require('firebase/analytics');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();



const app = express();
app.use(cors());
app.use(bodyParser.json());

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

let analytics;
try {
  analytics = getAnalytics(firebaseApp);
} catch (error) {
  console.warn("Analytics couldn't be initialized. This is expected in a Node.js environment:", error.message);
}

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Attempting to sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user.uid);
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      res.status(200).json({ user: userCredential.user, userData: userDocSnap.data() });
    } else {
      await setDoc(userDocRef, {
        email: userCredential.user.email,
        createdAt: new Date()
      });
      res.status(201).json({ user: userCredential.user, newUser: true });
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(401).json({ error: error.message });
  }
});


app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create a new user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date(),
      likedDestinations: [],
      lists: []
    });

    res.status(201).json({ user: userCredential.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.post('/signout', async (req, res) => {
  try {
    await signOut(auth);
    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/addLikedDestination', async (req, res) => {
  const { userId, destination } = req.body;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedDestinations: arrayUnion(destination)
    });
    res.status(200).json({ message: 'Destination added to likes' });
  } catch (error) {
    console.error('Error adding liked destination:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/removeLikedDestination', async (req, res) => {
  const { userId, destination } = req.body;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      likedDestinations: arrayRemove(destination)
    });
    res.status(200).json({ message: 'Destination removed from likes' });
  } catch (error) {
    console.error('Error removing liked destination:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/getLikedDestinations/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      res.status(200).json({ likedDestinations: userData.likedDestinations || [] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting liked destinations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/updateUserLists', async (req, res) => {
  const { userId } = req.body;
  console.log('Received request to update lists for user:', userId);

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data:', userData);

      const updatedLists = (userData.lists || []).map(list => {
        if (!list.id) {
          list.id = uuidv4();
        }
        return list;
      });

      await updateDoc(userRef, { lists: updatedLists });
      console.log('Updated user document with new list IDs');
      console.log('Updated lists:', updatedLists);

      res.status(200).json({ message: 'User lists updated successfully', lists: updatedLists });
    } else {
      console.log('User not found');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user lists:', error);
    res.status(500).json({ error: error.message });
  }
});
 
app.post('/addList', async (req, res) => {
  const { userId, listName } = req.body;
  console.log('Received request to add list:', { userId, listName });

  try {
    const userRef = doc(db, 'users', userId);
    console.log('Getting user document reference');

    const userDoc = await getDoc(userRef);
    console.log('User document exists:', userDoc.exists());

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data:', userData);

      const newList = {
        id: uuidv4(),
        name: listName,
        destinations: []
      };

      console.log('id:', uuidv4());

      const updatedLists = [...(userData.lists || []), newList];
      await updateDoc(userRef, { lists: updatedLists });
      console.log('Updated user document with new list');
      console.log('Updated lists:', updatedLists);

      res.status(200).json({ message: 'List added successfully', list: newList });
    } else {
      console.log('User not found');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error adding list:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/addDestinationToList', async (req, res) => {
  const { userId, listId, destination } = req.body;
  console.log('Received data:', { userId, listId, destination });
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedLists = userData.lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            destinations: [...(list.destinations || []), destination]
          };
        }
        return list;
      });
      await updateDoc(userRef, { lists: updatedLists });
      res.status(200).json({ message: 'Destination added to list successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error adding destination to list:', error);
    res.status(500).json({ error: error.message });
  }
});



app.get('/getLists/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const lists = userData.lists || [];
      res.status(200).json(lists);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting lists:', error);
    res.status(500).json({ error: error.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
