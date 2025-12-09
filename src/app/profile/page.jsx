// app/settings/page.jsx  or  app/profile/page.jsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth } from "@/firebase.config";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { Camera, Save, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setPhotoPreview(currentUser.photoURL || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name Required!",
        text: "Please enter your name to continue",
        confirmButtonColor: "#8b5cf6",
      });
      return;
    }

    setSaving(true);

    try {
      let finalPhotoURL = user.photoURL;

      // Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);

        const token = await auth.currentUser.getIdToken();
        const uploadRes = await fetch(`${API_URL}/api/upload-avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalPhotoURL = uploadData.url;
      }

      // Update Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: finalPhotoURL,
      });

      // Sync with backend
      const token = await auth.currentUser.getIdToken();
      await fetch(`${API_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName, photoURL: finalPhotoURL }),
      });

      // SUCCESS SWEET ALERT
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        html: `
          <div class="text-center">
            <img src="${
              finalPhotoURL || photoPreview
            }" class="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-purple-500"/>
            <p class="text-lg font-bold">${displayName}</p>
            <p class="text-sm text-gray-600">You're all set!</p>
          </div>
        `,
        confirmButtonText: "Awesome!",
        confirmButtonColor: "#8b5cf6",
        allowOutsideClick: false,
      });
    } catch (err) {
      console.error(err);
      // ERROR SWEET ALERT
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update profile. Try again!",
        confirmButtonColor: "#ef4444",
      });
    }

    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {/* Photo */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative cursor-pointer" onClick={handlePhotoClick}>
              <img
                src={
                  photoPreview ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=8b5cf6&color=fff&size=128`
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-xl hover:opacity-90 transition"
              />
              <div className="absolute bottom-0 right-0 bg-purple-600 p-3 rounded-full text-white shadow-lg hover:bg-purple-700 transition">
                <Camera className="w-6 h-6" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-3">Tap to change photo</p>
          </div>

          {/* Name */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none text-lg"
              placeholder="Enter your name"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className={`w-full py-5 rounded-2xl font-bold text-white text-lg transition flex items-center justify-center gap-3 ${
              saving || !displayName.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-2xl transform hover:scale-105"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Profile
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Name and photo help us personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
}
