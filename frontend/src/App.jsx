import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { io } from "socket.io-client";
import YoutubeBox from "./components/youtubebox/YoutubeBox";

const socket = io("http://localhost:3000");

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [duration, setDuration] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [playerSettings, setPlayerSettings] = useState({
    playing: true,
    seekTo: 0,
    videoUrl: youtubeUrl,
  });
  const handleStartWatchParty = () => {
    if (youtubeUrl.trim()) {
      socket.emit("youtube-url", youtubeUrl);
      setIsVideoActive(true);
      console.log("Sent YouTube URL to server:", youtubeUrl);
    }
  };

  const handleDisconnectParty = () => {
    // Clear local state
    setYoutubeUrl("");
    setIsVideoActive(false);
    setPlayerSettings({
      playing: true,
      seekTo: 0,
      videoUrl: "",
    });
    
    // Notify server to clear party state
    socket.emit("disconnect-party");
    console.log("Disconnected from watch party");
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
    });

    socket.on("users", (users) => {
      // console.log("users", users);
      setConnectedUsers(users);
    });

    socket.on("youtube-url", (url) => {
      console.log("youtube-url received from server", url);
      setYoutubeUrl(url);
      setIsVideoActive(true);
    });

    socket.on("video-state-sync", (videoState) => {
      console.log("video-state-sync received from server", videoState);
      setYoutubeUrl(videoState.videoUrl);
      setPlayerSettings({
        playing: videoState.isPlaying,
        seekTo: videoState.currentTime,
        videoUrl: videoState.videoUrl,
      });
      setIsVideoActive(true);
    });

    socket.on("player-settings", (settings) => {
      console.log("player-settings received from server", settings);
      setPlayerSettings(settings);
    });

    socket.on("party-disconnected", () => {
      console.log("Party disconnected by another user");
      setYoutubeUrl("");
      setIsVideoActive(false);
      setPlayerSettings({
        playing: true,
        seekTo: 0,
        videoUrl: "",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("users");
      socket.off("youtube-url");
      socket.off("video-state-sync");
      socket.off("player-settings");
      socket.off("party-disconnected");
    };
  }, [socket]);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 relative">
        {/* Header with disconnect button */}
        <div className="absolute top-4 right-4">
          {isVideoActive && (
            <Button 
              onClick={handleDisconnectParty}
              variant="destructive"
              size="sm"
            >
              Disconnect Party ❌
            </Button>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-blue-500 underline">
          Watch Party - {connectedUsers.length} users connected
        </h1>
        {!isVideoActive && (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Youtube url to start a watch party"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Button onClick={handleStartWatchParty}>Start Watch Party 🎉</Button>
          </div>
        )}
        {isVideoActive && (
          <p className="text-green-600 font-medium">
            🎬 Watch party in progress! You've been synced to the current video.
          </p>
        )}
        <div className="w-full h-full">
          {youtubeUrl && (
            <YoutubeBox 
              youtubeUrl={playerSettings.videoUrl} 
              duration={30} 
              seekToDuration={playerSettings.seekTo}
              initialPlaying={playerSettings.playing}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
