// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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

// Function to fetch and display users
async function loadUsers() {
    const userTable = document.querySelector("#userTable tbody");
    userTable.innerHTML = "";

    const usersSnapshot = await getDocs(collection(db, "users"));
    usersSnapshot.forEach((docSnapshot) => {
        const user = docSnapshot.data();
        const userId = docSnapshot.id;
        addUserToTable(userId, user.email, user.phone, user.firstName, user);
    });
}

// Function to fetch last item ID and set new one sequentially
async function getNextItemId() {
    const itemsSnapshot = await getDocs(collection(db, "menuItems"));
    let maxId = 0;
    itemsSnapshot.forEach((docSnapshot) => {
        const item = docSnapshot.data();
        if (item.id && item.id > maxId) {
            maxId = item.id;
        }
    });
    return maxId + 1;
}

// Function to add user data to the table
function addUserToTable(userId, email, phone, firstName, userDetails) {
    const userTable = document.querySelector("#userTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${email}</td>
        <td>${phone || 'N/A'}</td>
        <td>${firstName}</td>
        <td>
            <button class="view-btn" data-userid="${userId}">View</button>
            <button class="delete-user-btn" data-userid="${userId}">Delete</button>
        </td>
    `;
    userTable.appendChild(row);

    const detailRow = document.createElement("tr");
    detailRow.id = `details-${userId}`;
    detailRow.classList.add("hidden");
    detailRow.innerHTML = `
        <td colspan="4">
            <div class="user-details">
                <p><strong>First Name:</strong> ${userDetails.firstName || 'N/A'}</p>
                <p><strong>Last Name:</strong> ${userDetails.lastName || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${userDetails.address || 'N/A'}</p>
                <p><strong>Pincode:</strong> ${userDetails.pincode || 'N/A'}</p>
            </div>
        </td>
    `;
    userTable.appendChild(detailRow);
}

// Function to toggle user details
function toggleUserDetails(userId) {
    const detailRow = document.getElementById(`details-${userId}`);
    if (detailRow) {
        detailRow.classList.toggle("hidden");
    }
}

// Function to delete user from Firestore
async function deleteUserAccount(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await deleteDoc(doc(db, "users", userId));
            alert("User deleted successfully!");
            loadUsers();
        } catch (error) {
            alert("Error deleting user: " + error.message);
        }
    }
}

window.showAddItemForm = function () {
    // Ensure the Manage Menu Items section is displayed
    document.querySelector(".item-management").style.display = "block";

    // Display the Add Item Form
    document.getElementById("addItemForm").classList.remove("hidden");
};

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("admin-addItem").addEventListener("click", function () {
        document.getElementById("addItemForm").classList.remove("hidden");
    });
});

document.addEventListener("DOMContentLoaded", function () {
});

document.getElementById("addItemButton").addEventListener("click", addItem);

// Function to add a new menu item
async function addItem(event) {
    event.preventDefault();
    // Get input fields
    const itemNameInput = document.getElementById("itemName");
    const itemPriceInput = document.getElementById("itemPrice");
    const itemImageInput = document.getElementById("itemImage");
    const itemCategoryInput = document.getElementById("itemCategory");

    // Check if elements exist
    if (!itemNameInput || !itemPriceInput || !itemImageInput || !itemCategoryInput) {
        alert("Error: One or more input fields are missing.");
        return;
    }
    
    const itemName = itemNameInput.value.trim();
    const itemPrice = itemPriceInput.value.trim();
    const itemImage = itemImageInput.value.trim();
    const itemCategory = itemCategoryInput.value.trim();

    // Check for empty values
    if (!itemName || !itemPrice || !itemImage || !itemCategory) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const itemId = await getNextItemId();

        console.log("Adding item:", { id: itemId, name: itemName, price: itemPrice, image: itemImage, category: itemCategory });

        await setDoc(doc(db, "menuItems", itemId.toString()), {
            id: itemId,
            name: itemName,
            price: parseFloat(itemPrice),
            image: itemImage,
            category: itemCategory  
        });

        alert("Item added successfully!");
        addItemToTable(itemId, itemName, itemPrice, itemImage, itemCategory);
        loadItems();

       // Clear input fields after adding item
       itemNameInput.value = "";
       itemPriceInput.value = "";
       itemImageInput.value = "";
       itemCategoryInput.value = "";
       
    } catch (error) {
        alert("Error adding item: " + error.message);
    }
}

// Event listener for "Add Item" button
document.getElementById("admin-addItem").addEventListener("click", function () {
    document.getElementById("addItemForm").classList.toggle("hidden");
});

// Function to add item data to the table
function addItemToTable(itemId, name, price, image, category) {
    const itemTable = document.querySelector("#itemTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${itemId}</td>
        <td>${name}</td>
        <td>${price}</td>
        <td><img src="${image}" alt="${name}" width="50"></td>
        <td>${category}</td>
        <td>
            <button class="delete-item-btn" data-itemid="${itemId}">Delete</button>
        </td>
    `;
    itemTable.appendChild(row);
}

async function loadItems() {
    const itemTable = document.querySelector("#itemTable tbody");
    itemTable.innerHTML = "";

    const itemsSnapshot = await getDocs(collection(db, "menuItems"));
    itemsSnapshot.forEach((docSnapshot) => {
        const item = docSnapshot.data();
        addItemToTable(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category || "Uncategorized" // ✅ Ensure category is displayed
        );
    });
}


// Function to delete an item from Firestore
async function deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
        try {
            await deleteDoc(doc(db, "menuItems", itemId.toString()));
            alert("Item deleted successfully!");
            loadItems();
        } catch (error) {
            alert("Error deleting item: " + error.message);
        }
    }
}

// Event delegation for all buttons
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("view-btn")) {
        toggleUserDetails(event.target.dataset.userid);
    } else if (event.target.classList.contains("delete-user-btn")) {
        await deleteUserAccount(event.target.dataset.userid);
    } else if (event.target.classList.contains("delete-item-btn")) {
        await deleteItem(event.target.dataset.itemid);
    }
});

// Function to show a specific section
function showSection(sectionClass) {
    document.querySelectorAll(".admin-container section").forEach(section => {
        section.style.display = "none";
    });
    
    const selectedSection = document.querySelector(sectionClass);
    if (selectedSection) {
        selectedSection.style.display = "block";
    }
}

// Function to show Manage Menu Items
function showAddItemForm() {
    showSection(".item-management");
    document.getElementById("addItemForm").classList.remove("hidden");
}

// Handle navigation clicks
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".sidebar-menus a:nth-child(2)").addEventListener("click", () => {
        showSection(".item-management");
        loadItems();
    });

    showSection(".user-management");
});

// Navigation menu toggle for mobile
const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');

mobile.addEventListener("click", function () {
    mobile.classList.toggle("is-active");
    mobileLink.classList.toggle("active");
});

mobileLink.addEventListener("click", function () {
    if (window.innerWidth <= 768 && mobile.classList.contains("is-active")) {
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    }
});

// Ensure user authentication state
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadUsers();
        loadItems();
    }
});

// Logout function
document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Error logging out: " + error.message);
    });
});

// Load items when the page loads
document.addEventListener("DOMContentLoaded", loadItems);
