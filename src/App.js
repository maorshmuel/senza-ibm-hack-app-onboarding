import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import shaka from 'shaka-player';

// List of assets with poster and video URLs from Shaka samples:
const assets = [
  {
    id: 'angel-one',
    title: 'Angel One',
    videoUrl: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
    posterUrl: 'https://shaka-player-demo.appspot.com/assets/images/angel-one.jpg'
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream',
    videoUrl: 'https://storage.googleapis.com/shaka-demo-assets/elephants-dream/dash.mpd',
    posterUrl: 'https://shaka-player-demo.appspot.com/assets/images/elephants-dream.jpg'
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    videoUrl: 'https://storage.googleapis.com/shaka-demo-assets/bbb/dash.mpd',
    posterUrl: 'https://shaka-player-demo.appspot.com/assets/images/bbb.jpg'
  }
];

//
// Home Component: shows the three assets with remote control navigation
//
function Home() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Set up a keydown event listener to handle remote control keys:
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowRight":
          setSelectedIndex((prevIndex) => (prevIndex + 1) % assets.length);
          break;
        case "ArrowLeft":
          setSelectedIndex((prevIndex) =>
            (prevIndex - 1 + assets.length) % assets.length
          );
          break;
        case "Enter":
          navigate(`/player/${assets[selectedIndex].id}`);
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, navigate]);

  const handleClick = (id) => {
    navigate(`/player/${id}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          onClick={() => handleClick(asset.id)}
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            border: index === selectedIndex ? '3px solid #007acc' : 'none',
            padding: '5px'
          }}
        >
          <img src={asset.posterUrl} alt={asset.title} style={{ width: '300px' }} />
          <h3>{asset.title}</h3>
        </div>
      ))}
    </div>
  );
}

//
// Player Component: loads and plays the selected asset in fullscreen using Shaka Player
//
function Player() {
  const { id } = useParams();
  const videoRef = React.useRef(null);

  useEffect(() => {
    // Find the asset by id
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    // Initialize Shaka Player
    const player = new shaka.Player(videoRef.current);

    // Listen for error events.
    player.addEventListener('error', onErrorEvent);

    // Try to load the manifest.
    player.load(asset.videoUrl).then(() => {
      // Autoplay video once loaded.
      videoRef.current.play();
    }).catch(onError);

    function onErrorEvent(event) {
      onError(event.detail);
    }
    function onError(error) {
      console.error('Error code', error.code, 'object', error);
    }

    // Cleanup on unmount:
    return () => {
      player.destroy();
    };
  }, [id]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
      <video ref={videoRef} style={{ width: '100%', height: '100%' }} controls autoPlay />
    </div>
  );
}

//
// App Component: sets up routing
//
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/player/:id" element={<Player />} />
      </Routes>
    </Router>
  );
}

export default App;
