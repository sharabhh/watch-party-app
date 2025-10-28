import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  console.log(youtubeUrl);
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-blue-500 underline">
          Hello World
        </h1>
        <div className="flex gap-2">
          <Input type="text" placeholder="Enter Youtube url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          <Button>Start 🎉</Button>
        </div>
      </div>
    </>
  );
}

export default App;
