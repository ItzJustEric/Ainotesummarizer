import React, { useState } from "react";
import "./App.css";
import "./inputField.css";
import upArrow from "./up-arrow.png";

function InputField() {
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    setIsLoading(true);

    try {
      const res = await fetch("https://api.cohere.ai/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command",
          prompt: `Summarize this: ${value}`,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await res.json();

      if (data.text) {
        const cleaned = data.text.trim();
        setResponse(cleaned);

        const title = value.split(" ").slice(0, 4).join(" ") + "...";
        setHistory((prev) => [
          ...prev,
          { title, prompt: value, response: cleaned },
        ]);
        setSelectedChatIndex(history.length);
      } else {
        setResponse("No summary generated.");
      }
    } catch (err) {
      console.error("Cohere API error:", err);
      setResponse("Something went wrong. Try again.");
    } finally {
      setIsDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="history-sidebar">
        <h2>Chats</h2>
        {history.map((entry, index) => (
          <div
            key={index}
            className={`chat-title ${
              selectedChatIndex === index ? "selected" : ""
            }`}
            onClick={() => setSelectedChatIndex(index)}
          >
            {entry.title}
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div className="chat-main">
        <h1>Let's make those messy notes crystal clear.</h1>

        {selectedChatIndex !== null && (
          <div className="chat-details">
            <p>
              <strong>You:</strong> {history[selectedChatIndex].prompt}
            </p>
            <p>
              <strong>Response:</strong> {history[selectedChatIndex].response}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="response-container">
            <h3>generating...</h3>
          </div>
        )}

        {!isLoading && selectedChatIndex === null && response && (
          <div className="response-container">
            <h3>{response}</h3>
          </div>
        )}

        {/* Wrapped the form in input-container */}
        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <textarea
              className="input-field"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter notes..."
              rows={4}
            />
            <button type="submit" className="input-btn" disabled={isDisabled}>
              <img src={upArrow} alt="Send" className="arrow-icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InputField;
