import "./App.css";

import { useEffect, useState } from "react";

import WebSocket from "./components/WebSocket";
import { io } from "socket.io-client";

function App() {
  const [socketInstance, setSocketInstance] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  useEffect(() => {
    if (buttonStatus === true) {
      const socket = io("http://localhost:5000/", {
        transports: ["polling"],
        cors: {
          origin: "http://localhost:3000/",
        },
      });

      setSocketInstance(socket);

      
      socket.on("connect", (data) => {
        console.log(data);
      });

      setLoading(false);

      socket.on("disconnect", (data) => {
        console.log(data)
      });

      return function cleanup() {
        socket.disconnect();
      };
    }

  }, [buttonStatus]);

  return (
    <div className="App">
      {!buttonStatus ? (
        <button className="chat-button " onClick={handleClick}>Enter Chat</button>
      ) : (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
          <button className="chat-button exit"  onClick={handleClick}>Exit Chat</button>
          <div className="line">
            {!loading && <WebSocket socket={socketInstance} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;