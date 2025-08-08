import React, { useState } from "react";

function ProfileSetup({ onSave }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ displayName, bio, profilePic });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "450px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        border: "1px solid #475569",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
        textAlign: "left",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Set Up Your Profile</h2>

      <label style={{ display: "block", marginBottom: "8px" }}>Display Name:</label>
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #475569",
          backgroundColor: "#0f172a",
          color: "white",
          fontSize: "1rem",
          marginBottom: "20px",
        }}
      />

      <label style={{ display: "block", marginBottom: "8px" }}>Bio:</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={160}
        placeholder="Tell us about yourself"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "1px solid #475569",
          backgroundColor: "#0f172a",
          color: "white",
          fontSize: "1rem",
          resize: "vertical",
          marginBottom: "20px",
        }}
      />

      <label style={{ display: "block", marginBottom: "8px" }}>Profile Picture:</label>
      <input type="file" accept="image/*" onChange={handlePicChange} style={{ marginBottom: "20px" }} />

      {profilePic && (
        <img
          src={profilePic}
          alt="Profile Preview"
          style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "20px", display: "block", marginLeft: "auto", marginRight: "auto" }}
        />
      )}

      <button
        type="submit"
        style={{
          backgroundColor: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "12px",
          padding: "14px 0",
          cursor: "pointer",
          fontSize: "1.1rem",
          width: "100%",
          fontWeight: "600",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.5)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#4f46e5")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#6366f1")}
      >
        Save Profile
      </button>
    </form>
  );
}

export default ProfileSetup;