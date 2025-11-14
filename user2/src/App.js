import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
 
const currentUser = "user2";
const otherUser = currentUser === "user1" ? "user2" : "user1";
 
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [userLanguageMap, setUserLanguageMap] = useState("english");
  const userLanguageMapRef = useRef(userLanguageMap);
  const [stompClient, setStompClient] = useState(null);
  const lastMessageRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
 
  useEffect(() => {
  const socket = new SockJS("http://localhost:8080/ws");
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 2000,
    onConnect: () => {
      console.log("✅ Connected as", currentUser);

      // Reset user's language to English on reload
      const resetLanguage = {
        username: currentUser,
        language: "english",
      };

      client.publish({
        destination: "/app/language",
        body: JSON.stringify(resetLanguage),
      });

      console.log("🔄 Resetting user's language to English");

      client.subscribe(`/topic/messages/${currentUser}`, (message) => {
        const received = JSON.parse(message.body);
        setMessages((prev) => [
          ...prev,
          {
            sender: received.sender,
            content: received.translatedContent || received.content,
            timestamp: received.timestamp || new Date().toISOString(),
          },
        ]);
      });

      client.subscribe(`/topic/language/${otherUser}`, (msg) => {
        const update = JSON.parse(msg.body);
        setUserLanguageMap((prev) => {
          const updated = {
            ...prev,
            [update.username]: update.language,
          };
          userLanguageMapRef.current = updated;
          return updated;
        });
      });
    },
  });

  client.activate();
  setStompClient(client);
  return () => client.deactivate();
}, []);

  useEffect(() => {
    userLanguageMapRef.current = userLanguageMap;
  }, [userLanguageMap]);
 
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
 
  const sendMessage = () => {
    if (!input.trim()) return;
 
    if (stompClient && stompClient.connected) {
      const receiverLanguage = userLanguageMapRef.current[otherUser];
 
      const msgObj = {
        sender: currentUser,
        receiver: otherUser,
        content: input,
        targetLanguage: receiverLanguage,
      };
 
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify(msgObj),
      });
 
      setMessages((prev) => [
        ...prev,
        { sender: currentUser, content: input, timestamp: new Date().toISOString() },
      ]);
      setInput("");
    } else {
      console.warn("⚠️ STOMP not connected yet!");
    }
  };
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
 
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
 
    setUserLanguageMap((prev) => {
      const updatedMap = {
        ...prev,
        [currentUser]: newLang,
      };
 
      userLanguageMapRef.current = updatedMap; 
 
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/language",
          body: JSON.stringify({
            username: currentUser,
            language: newLang,
          }),
        });
      }
 
      return updatedMap;
    });
  };
 
 const playAudio = (text) => {
  if (!text) return;

  if (!("speechSynthesis" in window)) {
    console.warn("🔇 Your browser does not support speech synthesis.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Get all voices
  const voices = window.speechSynthesis.getVoices();

  // Map selectedLanguage dropdown to language codes
  const languageMap = {
    english: "en",
    hindi: "hi",
    bengali: "bn",
    korean: "ko",
    japanese: "ja",
    chinese: "zh",
    spanish: "es",
    russian: "ru",
    german: "de",
    french: "fr"
  };

  const langCode = languageMap[selectedLanguage.toLowerCase()] || "en";
  const selectedVoice = voices.find(v => v.lang.startsWith(langCode)) || voices[0];

  utterance.voice = selectedVoice;
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
};


const toggleListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  if (!recognitionRef.current) {
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    const languageMap = {
      english: "en-US",
      hindi: "hi-IN",
      bengali: "bn-IN",
      korean: "ko-KR",
      japanese: "ja-JP",
      chinese: "zh-CN",
      spanish: "es-ES",
      russian: "ru-RU",
      german: "de-DE",
      french: "fr-FR"
    };

    const langCode = languageMap[selectedLanguage.toLowerCase()] || "en-US";
    recognitionRef.current.lang = langCode;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }

  if (!isListening) {
    recognitionRef.current.start();
    setIsListening(true);
  } else {
    recognitionRef.current.stop();
    setIsListening(false);
  }
};
 
  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.userText}>Hi, {currentUser}</div>
        <select
          style={styles.dropdown}
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="bengali">Bengali</option>
          <option value="korean">Korean</option>
          <option value="japanese">Japanese</option>
          <option value="chinese">Chinese</option>
          <option value="spanish">Spanish</option>
          <option value="russian">Russian</option>
          <option value="german">German</option>
          <option value="french">French</option>
        </select>
      </div>
 
      <div style={styles.separator} />
 
      <div style={styles.chatBox}>
  {messages.map((msg, index) => {
    const isLast = index === messages.length - 1;
    return (
      <div
        key={index}
        ref={isLast ? lastMessageRef : null}
        style={{
          display: "flex",
          flexDirection: msg.sender === currentUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: "10px",
          padding: "0 6px",
          alignSelf: msg.sender === currentUser ? "flex-end" : "flex-start",
        }}
      >
        <div style={styles.userIcon}>🧑‍💻</div>
        <div
          style={{
            ...styles.message,
            background: msg.sender === currentUser
              ? "linear-gradient(135deg, #002fffff 20%, #9400D3 100%)"
              : "linear-gradient(135deg, #FF0000 20%, #9400D3 100%)",
            color: "#ffffff",
          }}
        >
          {msg.content}
          <div style={styles.timestamp}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
 
        {msg.sender !== currentUser && (
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#fff",
            }}
            onClick={() => playAudio(msg.content)}
          >
            🔊
          </button>
        )}
      </div>
    );
  })}
</div>
 
      <div style={styles.inputBox}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        /> 
        <button style={styles.button} onClick={toggleListening}>
          {isListening ? "..." : "🎙️"}
        </button>

        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
 
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: "20px",
    backgroundColor: "#000000",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    padding: "0 10px",
  },
  separator: {
    height: "4px",
    backgroundColor: "#6917d4ff",
    marginBottom: "10px",
    borderRadius: "2px",
  },
  userText: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
  },
  dropdown: {
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "16px",
    color: "white",
    backgroundColor: "black",
    border: "2px solid white",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "0 6px",
    borderRadius: "12px",
    backgroundColor: "#111",
    boxSizing: "border-box",
  },
  message: {
    padding: "16px 24px",
    borderRadius: "25px",
    maxWidth: "70%",
    wordBreak: "break-word",
    fontSize: "20px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  timestamp: {
    color: "#ccc",
    fontSize: "10px",
    marginTop: "5px",
    alignSelf: "flex-end",
  },
  inputBox: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "18px",
    backgroundColor: "#222",
    color: "#fff",
  },
  button: {
    padding: "10px 18px",
    borderRadius: "10px",
    backgroundColor: "#6917d4ff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
  userIcon: {
    fontSize: "28px",
    color: "#fff",
  },
};
 
export default App;
 