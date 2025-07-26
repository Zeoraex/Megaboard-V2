import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function App() {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const font = document.createElement("link");
    font.href = "https://fonts.googleapis.com/css2?family=Poppins&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        alert('Connection failed!');
      }
    } else {
      alert('MetaMask not detected. Please install it!');
    }
  }

  function handlePost() {
    if (message.trim() === '') return;
    const newPost = {
      user: account || '🧑 Anonymous',
      text: message,
      time: new Date().toLocaleString(),
    };
    setPosts([newPost, ...posts]);
    setMessage('');
  }

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <img
        src="https://www.megaeth.com/assets/img/thefluffle/home/rabbit-poster.png"
        alt="MegaETH Bunny"
        style={{
          width: '120px',
          marginBottom: '15px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
        }}
      />

      <h1 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>
        🧠 MegaBoard V2
      </h1>
      <p style={{ fontSize: '1rem', color: '#cbd5e1' }}>
        Built with love by Zeoraex
      </p>

      {!account ? (
        <button
          onClick={connectWallet}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          🔌 Connect Wallet
        </button>
      ) : (
        <p style={{ marginTop: '20px', fontSize: '1rem' }}>
          ✅ Connected as{' '}
          <span style={{ color: '#38bdf8' }}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </p>
      )}

      <div style={{ marginTop: '30px' }}>
        <textarea
          placeholder="What's on your mind?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={280}
          style={{
            width: '90%',
            maxWidth: '450px',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #475569',
            backgroundColor: '#1e293b',
            color: 'white',
            fontSize: '1rem',
            resize: 'none',
          }}
        ></textarea>
        <br />
        <button
          onClick={handlePost}
          style={{
            marginTop: '12px',
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          ➕ Post
        </button>
      </div>

      <div
        style={{
          marginTop: '40px',
          textAlign: 'left',
          maxWidth: '600px',
          marginInline: 'auto',
        }}
      >
        <h3
          style={{
            fontSize: '1.3rem',
            borderBottom: '2px solid #475569',
            paddingBottom: '10px',
            marginBottom: '20px',
          }}
        >
          📝 MegaBoard Feed
        </h3>

        {posts.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No posts yet. Be the first to post something!</p>
        ) : (
          posts.map((post, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#1e293b',
                padding: '15px',
                marginBottom: '15px',
                borderRadius: '12px',
                border: '1px solid #334155',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              <p style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                <strong>{post.user}</strong>{' '}
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>· {post.time}</span>
              </p>
              <p style={{ fontSize: '1.05rem' }}>{post.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;