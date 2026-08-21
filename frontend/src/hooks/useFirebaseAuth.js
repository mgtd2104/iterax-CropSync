import { useState, useEffect } from "react";
import { 
  auth, 
  rtdb, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "../services/firebase";
import { ref, get, set } from "firebase/database";

export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setError(null);
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.isAnonymous) {
          setProfile({
            state: "",
            district: "",
            language: "English",
            farming_type: "Seasonal",
            is_guest: true
          });
        } else {
          try {
            const profileRef = ref(rtdb, `users/${currentUser.uid}/profile`);
            const snapshot = await get(profileRef);
            if (snapshot.exists()) {
              setProfile(snapshot.val());
            } else {
              setProfile(null);
            }
          } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError("Failed to load user profile. Please try again.");
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      setError(err.message || "Failed to sign in");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      setError(err.message || "Failed to sign up");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await signInAnonymously(auth);
      setProfile({
        state: "",
        district: "",
        language: "English",
        farming_type: "Seasonal",
        is_guest: true
      });
      return res.user;
    } catch (err) {
      setError(err.message || "Failed guest login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message || "Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      if (user?.isAnonymous) {
        setProfile({
          ...profileData,
          is_guest: true
        });
      } else if (user?.uid) {
        const fullProfile = {
          state: profileData.state || "",
          district: profileData.district || "",
          language: profileData.language || "English",
          farming_type: profileData.farming_type || "Seasonal",
          is_guest: false
        };
        const profileRef = ref(rtdb, `users/${user.uid}/profile`);
        await set(profileRef, fullProfile);
        setProfile(fullProfile);
      }
    } catch (err) {
      setError(err.message || "Failed to save profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    loginWithEmail,
    signupWithEmail,
    loginAsGuest,
    logout,
    saveProfile
  };
}
