// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDYU8CauRrpGhjOyd_PeBVF96iSf4SAQS4",
    authDomain: "lets-order-a88ea.firebaseapp.com",
    projectId: "lets-order-a88ea",
    storageBucket: "lets-order-a88ea.appspot.com",
    messagingSenderId: "830345864855",
    appId: "1:830345864855:web:6fb6d99e39b4dfef86abd2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            document.getElementById("userName").textContent = `${userData.firstName || "Unknown"} ${userData.lastName || "User"}`;
            document.getElementById("userEmail").textContent = userData.email || "Not available";
            document.getElementById("userPhone").textContent = userData.phone || "Not available";
            document.getElementById("userAddress").textContent = userData.address || "Not available";
            document.getElementById("userPincode").textContent = userData.pincode || "Not available";
        }else {
            alert("User data not found.");
        }
    } else {
        window.location.href = "login.html"; // Redirect to login if not logged in
    }
});

// Logout Functionality
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Error: " + error.message);
    });
});
