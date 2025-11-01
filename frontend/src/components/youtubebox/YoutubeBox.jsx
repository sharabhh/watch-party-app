import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { io } from 'socket.io-client';
const socket = io("http://localhost:3000");
function YoutubeBox({ youtubeUrl, duration = 0, seekToDuration = 0, initialPlaying = true }) {
 console.log("youtubeUrl in YoutubeBox", youtubeUrl);
 const playerRef = useRef(null);
 const [playing, setPlaying] = useState(initialPlaying);
 const [currentTime, setCurrentTime] = useState(0);
 const [seekToTime, setSeekToTime] = useState(seekToDuration);
 const [totalDuration, setTotalDuration] = useState(duration);
 const [isReady, setIsReady] = useState(false);
 const [hasSynced, setHasSynced] = useState(false);
const [playerSettings, setPlayerSettings] = useState({
  playing: true,
  seekTo: 0,
  videoUrl: youtubeUrl,
});

  const handlePlayerProgress = (progress) => {
    console.log('progress', progress);
    const newSettings = {
      playing: playing, // Use current playing state instead of progress.playing
      seekTo: Math.floor(progress.playedSeconds),
      videoUrl: youtubeUrl,
    };
    setPlayerSettings(newSettings);
    socket.emit('player-settings', newSettings);
  }
  useEffect(() => {
    socket.on('player-settings', (settings) => {
      console.log('player-settings received in YoutubeBox', settings);
      if (settings.seekTo !== undefined) {
        setSeekToTime(settings.seekTo);
        if (playerRef.current && isReady) {
          playerRef.current.seekTo(settings.seekTo);
        }
      }
      if (settings.playing !== undefined) {
        setPlaying(settings.playing);
      }
    });

    return () => {
      socket.off('player-settings');
    };
  }, [isReady]);

  // Handle initial sync when player is ready
  useEffect(() => {
    if (isReady && !hasSynced && playerRef.current) {
      if (seekToDuration > 0) {
        console.log('syncing to provided seek duration:', seekToDuration);
        playerRef.current.seekTo(seekToDuration);
        setCurrentTime(seekToDuration);
      }
      setPlaying(initialPlaying);
      setHasSynced(true);
    }
  }, [isReady, hasSynced, seekToDuration, initialPlaying]);
//   const handleDuration = (duration) => {
//     console.log('duration', duration);
//   }

  const handleReady = () => {
    console.log('player ready');
    setIsReady(true);
    playerRef.current.seekTo(seekToTime);
  }

  const handlePlay = () => {
    console.log('video played');
    setPlaying(true);
    socket.emit('player-settings', {
      playing: true,
      seekTo: currentTime,
      videoUrl: youtubeUrl,
    });
  }

  const handlePause = () => {
    console.log('video paused');
    setPlaying(false);
    socket.emit('player-settings', {
      playing: false,
      seekTo: currentTime,
      videoUrl: youtubeUrl,
    });
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Video Player */}
      <div className="w-full text-white flex flex-col items-center justify-center">
        {/* <h1>hi there{youtubeUrl}</h1> */}
        <ReactPlayer 
          ref={playerRef} 
          url={youtubeUrl} 
          controls={true} 
          width="400px" 
          height="300px" 
          onProgress={handlePlayerProgress} 
          onReady={handleReady} 
          onPlay={handlePlay}
          onPause={handlePause}
          playing={playing} 
        />
      </div>
    </div>
  )
}

export default YoutubeBox