// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const resetLink = document.getElementById("reset");
    const adminLogoutBtn = document.getElementById("adminLogout");

    // Admin Credentials
    const ADMIN_EMAIL = "admin@letsorder.com";
    const ADMIN_PASSWORD = "admin123";

    // User Login
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            if (!validateEmail(email)) {
                alert("Enter a valid email.");
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                sessionStorage.setItem("userLoggedIn", "true");

                if (email === ADMIN_EMAIL) {
                    sessionStorage.setItem("adminLoggedIn", "true");
                    alert("Admin login successful!");
                    window.location.href = "adminPanel.html";
                } else {
                    alert("Login successful!");
                    window.location.href = "index.html";
                }
            } catch (error) {
                handleAuthErrors(error);
            }
        });
    }

    // Forgot Password
    if (resetLink) {
        resetLink.addEventListener("click", async function (e) {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            
            if (!email) {
                alert("Please enter your email in the email field before clicking forgot password.");
                return;
            }
            
            if (!validateEmail(email)) {
                alert("Enter a valid email.");
                return;
            }
            
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Password reset email sent successfully. Please check your inbox.");
            } catch (error) {
                handleAuthErrors(error);
            }
        });
    }

    // User Signup
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const firstName = document.getElementById("firstName").value.trim();
            const lastName = document.getElementById("lastName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();
            const address = document.getElementById("address").value.trim();
            const pincode = document.getElementById("pincode").value.trim();

            if (!firstName || !lastName || !phone || !email || !password || !confirmPassword || !address || !pincode) {
                alert("Please fill in all fields.");
                return;
            }

            if (!validateEmail(email)) {
                alert("Enter a valid email.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    firstName,
                    lastName,
                    phone,
                    email,
                    address,
                    pincode,
                });
                alert("Successfully Signed Up! Please log in.");
                window.location.href = "login.html";
            } catch (error) {
                handleAuthErrors(error);
            }
        });
    }

    // Admin Logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", function () {
            logout();
        });
    }
});

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function logout() {
    signOut(auth).then(() => {
        sessionStorage.removeItem("adminLoggedIn");
        sessionStorage.removeItem("userLoggedIn");
        alert("Successfully logged out.");
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Error logging out: " + error.message);
    });
}

function handleAuthErrors(error) {
    const errorMessages = {
        "auth/user-not-found": "User not found. Please sign up first.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-email": "Invalid email format.",
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many failed attempts. Try again later."
    };
    alert(errorMessages[error.code] || "Error: " + error.message);
}
