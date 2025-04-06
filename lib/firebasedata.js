import { doc, getDoc, setDoc, updateDoc ,getFirestore } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

// const addUserDetails = async (userId, userDetails) => {
//   try {
//     await setDoc(doc(db, "users", userId), userDetails);
//     console.log("User details added successfully!");
//   } catch (error) {
//     console.error("Error adding user details:", error);
//   }
// };

const getUserDetails = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log("User data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such user found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
};

// const updateUserDetails = async (userId, updatedData) => {
//   try {
//     const userRef = doc(db, "users", userId);
//     await updateDoc(userRef, updatedData);
//     console.log("User details updated successfully!");
//   } catch (error) {
//     console.error("Error updating user details:", error);
//   }
// };

import { deleteDoc } from "firebase/firestore";

const deleteUserDetails = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    console.log("User details deleted successfully!");
  } catch (error) {
    console.error("Error deleting user details:", error);
  }
};

// /**
//  * Updates user details in Firestore.
//  * @param {string} userId - The user's unique ID.
//  * @param {Object} formData - The user's updated data.
//  */
// const updateUserDetails = async (userId, formData) => {
//   try {
//     // Ensure the user is authenticated with Firebase
//     if (!auth.currentUser) {
//       throw new Error("User not authenticated with Firebase.");
//     }

//     // Ensure the authenticated user is updating their own data
//     if (auth.currentUser.uid !== userId) {
//       throw new Error("Permission denied: Cannot update another user's data.");
//     }

//     // Reference to Firestore document
//     const userRef = doc(db, "users", userId);

//     // Update Firestore document with new data
//     await updateDoc(userRef, formData);

//     console.log("✅ User details updated successfully!");
//   } catch (error) {
//     console.error("❌ Error updating user details:", error);
//   }
// };

/**
 * Adds user details to Firestore.
* @param {string} userId - The unique user ID.
* @param {Object} userDetails - The user details to store.
*/
const addUserDetails = async (userId, userDetails) => {
 try {
   // Reference to the Firestore document
   await setDoc(doc(db, "users", userId), userDetails);

   // Save the user details
  //  await setDoc(userRef, userDetails);

   console.log("✅ User details added successfully!");
 } catch (error) {
   console.error("❌ Error adding user details:", error);
 }
};




export { addUserDetails, deleteUserDetails, getUserDetails };

