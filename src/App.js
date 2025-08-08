import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // your firebase config file
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

export default function App() {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState('feed'); // 'feed' or 'profile'

  const [profile, setProfile] = useState({
    displayName: 'Zeoraex',
    bio: 'Blockchain lover and dev',
    profilePic: '',
  });

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load Google Fonts once
  useEffect(() => {
    const font = document.createElement('link');
    font.href = 'https://fonts.googleapis.com/css2?family=Poppins&display=swap';
    font.rel = 'stylesheet';
    document.head.appendChild(font);
  }, []);

  // Firestore real-time listener for posts (load feed)
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time listener for notifications (new posts)
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifs = snapshot.docChanges()
        .filter((change) => change.type === 'added')
        .map((change) => {
          const data = change.doc.data();
          return {
            id: change.doc.id,
            sender: data.user,
            text: data.text.length > 30 ? data.text.slice(0, 30) + '...' : data.text,
          };
        });

      if (newNotifs.length > 0) {
        setNotifications((prev) => [...newNotifs, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch {
        alert('Connection failed!');
      }
    } else {
      alert('MetaMask not detected. Please install it!');
    }
  }

  async function handlePost() {
    if (message.trim() === '') return;

    try {
      await addDoc(collection(db, 'posts'), {
        user: profile.displayName,
        text: message,
        createdAt: new Date(),
      });
      setMessage('');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfile((p) => ({ ...p, profilePic: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: 'white',
        minHeight: '100vh',
        fontFamily: "'Poppins', sans-serif",
        padding: 20,
        boxSizing: 'border-box',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* Fixed Profile Icon top-left */}
      <div
        onClick={() => {
          setPage('profile');
          setShowNotifications(false);
        }}
        title="Your Profile"
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: '#64748b',
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: profile.profilePic ? '0 0 8px #14b8a6' : 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        {profile.profilePic ? (
          <img
            src={profile.profilePic}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 30, color: '#cbd5e1', userSelect: 'none' }}>?</span>
        )}
      </div>

      {/* Notification icon below profile */}
      <div
        onClick={() => {
          setShowNotifications(!showNotifications);
        }}
        title="Notifications"
        style={{
          position: 'fixed',
          top: 80, // 20 + 50 (profile icon height) + 10 margin
          left: 33, // aligned center below 50px wide icon (20 + (50-24)/2)
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#14b8a6',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: 16,
          userSelect: 'none',
          zIndex: 9999,
          boxShadow: '0 0 8px #14b8a6',
          position: 'fixed',
        }}
      >
        🔔
        {notifications.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: 18,
              textAlign: 'center',
              lineHeight: '1',
              userSelect: 'none',
            }}
          >
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </div>

      {/* Notification list dropdown */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            top: 110,
            left: 10,
            width: 250,
            maxHeight: 300,
            overflowY: 'auto',
            backgroundColor: '#1e293b',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            padding: 12,
            zIndex: 9999,
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#14b8a6' }}>Notifications</h4>
          {notifications.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>No new notifications.</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  borderBottom: '1px solid #475569',
                  padding: '6px 0',
                  fontSize: '1rem',
                  color: 'white',
                  cursor: 'default',
                }}
              >
                <strong>{notif.sender}</strong>: {notif.text}
              </div>
            ))
          )}
        </div>
      )}

      {/* Main content wrapper */}
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <img
          src="https://www.megaeth.com/assets/img/thefluffle/home/rabbit-poster.png"
          alt="MegaETH Bunny"
          style={{
            width: 120,
            marginBottom: 15,
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
            userSelect: 'none',
          }}
        />

        {/* Header with centered title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            marginBottom: 15,
            paddingLeft: 60, // so title isn’t overlapped by fixed icon
            paddingRight: 50, // balance right side
          }}
        >
          <h1
            style={{
              flexGrow: 1,
              textAlign: 'center',
              fontSize: '3rem',
              margin: 0,
              userSelect: 'none',
            }}
          >
            🧠 MegaBoard V2
          </h1>
        </div>

        {page === 'feed' && (
          <>
            <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: 25, fontSize: '1.25rem' }}>
              Built with love by Zeoraex
            </p>

            {!account ? (
              <button
                onClick={connectWallet}
                style={{
                  display: 'block',
                  margin: '0 auto 20px auto',
                  padding: '14px 28px',
                  backgroundColor: '#14b8a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                🔌 Connect Wallet
              </button>
            ) : (
              <p style={{ textAlign: 'center', marginBottom: 20, fontSize: '1.25rem' }}>
                ✅ Connected as{' '}
                <span style={{ color: '#38bdf8' }}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </p>
            )}

            <textarea
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={280}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: 'white',
                fontSize: '1.25rem',
                resize: 'none',
                marginBottom: 12,
              }}
            />
            <button
              onClick={handlePost}
              style={{
                display: 'block',
                margin: '0 auto 30px auto',
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: '1.25rem',
                cursor: 'pointer',
              }}
            >
              ➕ Post
            </button>

            <section style={{ textAlign: 'left', width: '100%' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  borderBottom: '2px solid #475569',
                  paddingBottom: 10,
                  marginBottom: 20,
                }}
              >
                📝 MegaBoard Feed
              </h3>

              {posts.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                  No posts yet. Be the first to post something!
                </p>
              ) : (
                posts.map((post, index) => (
                  <article
                    key={post.id || index}
                    style={{
                      backgroundColor: '#1e293b',
                      padding: 15,
                      marginBottom: 15,
                      borderRadius: 12,
                      border: '1px solid #334155',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontSize: '1.25rem',
                    }}
                  >
                    <p style={{ marginBottom: 8, fontSize: '1.1rem' }}>
                      <strong>{post.user}</strong>{' '}
                      <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
                        · {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : new Date(post.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p>{post.text}</p>
                  </article>
                ))
              )}
            </section>
          </>
        )}

        {page === 'profile' && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            {/* Back Button */}
            <button
              onClick={() => setPage('feed')}
              style={{
                marginBottom: 20,
                padding: '10px 20px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: '1.25rem',
              }}
            >
              ← Back to Feed
            </button>

            {/* Profile Pic */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                backgroundColor: '#64748b',
                margin: '0 auto 12px auto',
                overflow: 'hidden',
                boxShadow: profile.profilePic ? '0 0 15px #14b8a6' : 'none',
              }}
            >
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 60,
                    color: '#cbd5e1',
                    userSelect: 'none',
                    display: 'inline-block',
                    lineHeight: '140px',
                  }}
                >
                  ?
                </span>
              )}
            </div>

            {/* Upload Photo */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: 20, fontSize: '1.25rem' }}
            />

            {/* Display Name */}
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="Display Name"
              style={{
                width: '100%',
                padding: 14,
                fontSize: '1.25rem',
                borderRadius: 10,
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: 'white',
                marginBottom: 12,
              }}
            />

            {/* Bio */}
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              placeholder="Write your bio..."
              style={{
                width: '100%',
                padding: 14,
                fontSize: '1.25rem',
                borderRadius: 10,
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: 'white',
                resize: 'vertical',
                marginBottom: 20,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            />

            {/* Save Profile */}
            <button
              onClick={() => alert('Profile saved! (You can hook this to backend/blockchain later)')}
              style={{
                padding: '12px 28px',
                backgroundColor: '#14b8a6',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: '1.25rem',
                cursor: 'pointer',
                marginBottom: 25,
              }}
            >
              💾 Save Profile
            </button>

            {/* Your Posts Section */}
            <section style={{ textAlign: 'left', width: '100%' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  borderBottom: '2px solid #475569',
                  paddingBottom: 10,
                  marginBottom: 20,
                }}
              >
                📝 Your Posts
              </h3>

              {posts.filter((post) => post.user === profile.displayName).length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                  You haven’t posted anything yet.
                </p>
              ) : (
                posts
                  .filter((post) => post.user === profile.displayName)
                  .map((post, index) => (
                    <article
                      key={post.id || index}
                      style={{
                        backgroundColor: '#1e293b',
                        padding: 15,
                        marginBottom: 15,
                        borderRadius: 12,
                        border: '1px solid #334155',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontSize: '1.25rem',
                      }}
                    >
                      <p style={{ marginBottom: 8, fontSize: '1.1rem' }}>
                        <strong>{post.user}</strong>{' '}
                        <span style={{ color: '#94a3b8', fontSize: '1rem' }}>
                          · {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : new Date(post.createdAt).toLocaleString()}
                        </span>
                      </p>
                      <p>{post.text}</p>
                    </article>
                  ))
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}