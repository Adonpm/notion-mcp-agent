const BACKEND_URL = "http://localhost:7001/run"; // change to ngrok URL if remote

async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatBox");
  const message = input.value.trim();

  if (!message) return;

  // Add user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user-message";
  userMsg.textContent = message;
  chatWindow.appendChild(userMsg);

  input.value = "";
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Send to backend
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: message })
    });

    const data = await response.json();

    // Add bot message
    const botMsg = document.createElement("div");
    botMsg.className = "message bot-message";
    botMsg.textContent = data.result || "No response.";
    chatWindow.appendChild(botMsg);

    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (err) {
    console.error(err);
    const errorMsg = document.createElement("div");
    errorMsg.className = "message bot-message";
    errorMsg.textContent = "⚠️ Error connecting to server.";
    chatWindow.appendChild(errorMsg);
  }
}
