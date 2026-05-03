let step = 1;
let context = {};

// Function to add messages
function addMessage(sender, text) {
  const chat = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = sender === "bot" ? "bot-message" : "user-message";
  msg.innerHTML = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// Function to show buttons
function showOptions(options) {
  const area = document.getElementById("optionsArea");
  area.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => handleUserChoice(opt);
    area.appendChild(btn);
  });
}

async function handleUserChoice(choice) {
  addMessage("user", choice);
  document.getElementById("optionsArea").innerHTML = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: choice, step, context })
  });
  
  const data = await res.json();
  addMessage("bot", data.reply);

  step = data.next_step || 1;
  context = data.context || {};

  if (data.options && data.options.length > 0) {
    showOptions(data.options);
  }
}

// Initialize chatbot
window.onload = () => {
  addMessage("bot", "Hi there! 🐾 I’m your Pawfect Aid helper. Let’s find help for your furry friend 💜");
  showOptions(["🐕 Injured or bleeding", "🐈 Weak or sick", "🏥 General visit"]);
};
