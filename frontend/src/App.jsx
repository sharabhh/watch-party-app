import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  console.log(youtubeUrl);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
      socket.on("users", (users) => {
        console.log("users", users);
        setConnectedUsers(users);
      });
    });
  }, []);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-blue-500 underline">
          Hello World {connectedUsers.length} users connected
        </h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Youtube url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <Button>Start 🎉</Button>
        </div>
        {youtubeUrl && <ReactPlayer src={youtubeUrl} />}
      </div>
    </>
  );
}

export default App;
