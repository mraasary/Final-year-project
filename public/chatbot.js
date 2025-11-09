import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
const micButton = document.getElementById('mic-button');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

document.getElementById("questionnaire-form").onsubmit = function(event) {
  event.preventDefault();
  const moodRating = document.getElementById("mood-rating").value;
  const mainConcerns = document.getElementById("main-concerns").value;
  const recentEvents = document.getElementById("recent-events").value;
  const sessionGoals = document.getElementById("session-goals").value;
  document.getElementById("initial-mood").value = moodRating;
  const modal = document.getElementById("questionnaire-modal");
  modal.classList.add("hiding");
  setTimeout(() => (modal.style.display = "none"), 300);
};

document.getElementById("questionnaire-form").onsubmit = function(event) {
  event.preventDefault();

  const moodRating = document.getElementById("mood-rating").value;
  const mainConcerns = document.getElementById("main-concerns").value;
  const recentEvents = document.getElementById("recent-events").value;
  const sessionGoals = document.getElementById("session-goals").value;

  document.getElementById("initial-mood").value = moodRating;

  const modal = document.getElementById("questionnaire-modal");
  modal.classList.add("hiding");
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("hiding");
  }, 300);
};

const API_KEY = "AIzaSyDfJkO67U6q_JifjzK4t2i4GTwsxcemnGE";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const languageData = {
  en: { name: "English", code: "en", placeholder: "Type your message..." },
  hi: { name: "Hindi", code: "hi", placeholder: "अपना संदेश टाइप करें..." },
  te: { name: "Telugu", code: "te", placeholder: "మీ సందేశాన్ని టైప్ చేయండి..." },
  ta: { name: "Tamil", code: "ta", placeholder: "உங்கள் செய்தியை தட்டச்சு செய்யவும்..." },
  bn: { name: "Bengali", code: "bn", placeholder: "আপনার বার্তা টাইপ করুন..." },
  mr: { name: "Marathi", code: "mr", placeholder: "आपला संदेश टाइप करा..." },
  pa: { name: "Punjabi", code: "pa", placeholder: "ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ..." },
  ur: { name: "Urdu", code: "ur", placeholder: "اپنا پیغام ٹائپ کریں..." },
  kn: { name: "Kannada", code: "kn", placeholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..." },
  ml: { name: "Malayalam", code: "ml", placeholder: "നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക..." },
};


let currentLang = "en";

const languageSelect = document.getElementById("language-select");
languageSelect.addEventListener("change", (e) => {
  currentLang = e.target.value;
  userInput.placeholder = languageData[currentLang].placeholder;
});

let typingTimeout;
let activeRequest = null;

const translatorStatus = document.createElement("div");
translatorStatus.style.fontSize = "12px";
translatorStatus.style.color = "#888";
translatorStatus.style.marginTop = "3px";
translatorStatus.style.transition = "opacity 0.2s";
translatorStatus.style.opacity = "0";
userInput.insertAdjacentElement("afterend", translatorStatus);

userInput.addEventListener("input", async () => {
  clearTimeout(typingTimeout);
  const text = userInput.value.trim();
  if (!text) {
    translatorStatus.style.opacity = "0";
    return;
  }

  translatorStatus.textContent = "Translating...";
  translatorStatus.style.opacity = "0.8";

  typingTimeout = setTimeout(async () => {
    if (currentLang !== "en") {
      try {
        if (activeRequest && typeof activeRequest.abort === "function") {
          activeRequest.abort();
        }
        const controller = new AbortController();
        activeRequest = controller;

        const translated = await translateText(text, currentLang, controller.signal);

        if (userInput.value.trim() === text) {
          userInput.value = translated;
          translatorStatus.textContent = "✓ Translated";
          setTimeout(() => (translatorStatus.style.opacity = "0"), 800);
        }
      } catch (err) {
        translatorStatus.textContent = "⚠️ Translation failed";
        console.error("Translation error:", err);
      }
    } else {
      translatorStatus.style.opacity = "0";
    }
  }, 400); 
});

async function translateText(text, targetLang, signal) {
  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`,
    { signal }
  );
  const data = await res.json();
  return data[0].map((item) => item[0]).join("");
}

sendButton.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  const typing = appendTypingIndicator();

  try {
    const result = await model.generateContent(`
  Respond in 1-3 short sentences only.
  Keep it concise, clear, and to the point — no paragraphs or long explanations.
  Question: ${text}
`);

    const reply = result.response.text();
    typing.remove();
    appendMessage("bot", reply);

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = currentLang === "auto" ? "en-US" : languageData[currentLang].code;

    startLipSync();

    utterance.onend = () => {
      stopLipSync();
    };

    speechSynthesis.speak(utterance);
  } catch (error) {
    typing.remove();
    appendMessage("bot", "⚠️ Sorry, something went wrong.");
    console.error("Gemini error:", error);
  }
});

const robotMouth = document.querySelector(".robot-mouth");

function startLipSync() {
  if (robotMouth) {
    robotMouth.style.animation = "lipSync 0.2s infinite alternate";
  } else {
    console.warn("Robot mouth element not found.");
  }
}

function stopLipSync() {
  if (robotMouth) {
    robotMouth.style.animation = "none";
  }
}

const style = document.createElement("style");
style.textContent = `
  @keyframes lipSync {
    0% { transform: scaleY(1); }
    100% { transform: scaleY(0.3); }
  }
`;
document.head.appendChild(style);
let isRecording = false;
micButton.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser does not support speech recognition. Please use Chrome.");
    return;
  }

  if (isRecording) {
    recognition.stop();
    isRecording = false;
    micButton.textContent = "🎤";
    translatorStatus.textContent = "";
  } else {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "auto"; // Allow user to input in any language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    isRecording = true;
    micButton.textContent = "⏹️";
    translatorStatus.textContent = "Listening...";

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;

      appendMessage("user", transcript);

      const typing = appendTypingIndicator();
      try {
        const translatedInput = await translateText(transcript, "en");

        const result = await model.generateContent(`
Provide a concise and clear response (maximum 2–3 short sentences, no paragraphs):
${translatedInput}
`);

let reply = result.response.text();

        const translatedReply = await translateText(reply, currentLang);

        typing.remove();
        appendMessage("bot", translatedReply);

        startLipSync();

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(translatedReply);
        utterance.lang = languageData[currentLang].code; // Use selected language for audio output
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.lang.startsWith(languageData[currentLang].code));

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        } else {
          console.warn(`No voice found for language: ${currentLang}. Using default voice.`);
        }

        utterance.onend = () => {
          stopLipSync();
        };

        speechSynthesis.speak(utterance);
      } catch (error) {
        typing.remove();
        appendMessage("bot", "⚠️ Sorry, something went wrong.");
        console.error("Gemini error:", error);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecording = false;
      micButton.textContent = "🎤";
      translatorStatus.textContent = "Error occurred. Try again.";
    };

    recognition.onend = () => {
      isRecording = false;
      micButton.textContent = "🎤";
      translatorStatus.textContent = "";
    };
  }
});

let chatHistory = [];

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", `${sender}-message`);
  msg.innerHTML = `
    <div class="message-avatar">
      ${
        sender === "bot"
          ? '<img src="https://cdn-icons-png.flaticon.com/512/4712/4712108.png" class="avatar-img">'
          : '<img src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png" class="avatar-img">'
      }
    </div>
    <div class="message-content">${text}</div>
  `;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  chatHistory.push({ sender, text });
}

function appendTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return typing;
}

document.getElementById("questionnaire-form").onsubmit = async function (event) {
  event.preventDefault();

  const moodRating = document.getElementById("mood-rating").value;
  const mainConcerns = document.getElementById("main-concerns").value;
  const recentEvents = document.getElementById("recent-events").value;
  const sessionGoals = document.getElementById("session-goals").value;

  document.getElementById("initial-mood").value = moodRating;

  const modal = document.getElementById("questionnaire-modal");
  modal.classList.add("hiding");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);

};

async function fetchCBTSummary() {
  try {
    const {response} = await model.generateContent(`Summarize this CBT session in JSON format with the following fields: initialMood, situation, automaticThought, emotions, cognitiveDistortion, reframedThought, and currentMood. Here is the session data: ${JSON.stringify(chatHistory)}`);
    const summary = await response.text();
    console.log('Raw summary response:', summary);

    try {
        const cleanedSummary = summary.replace(/```json|```/g, '').trim();
        const parsedSummary = JSON.parse(cleanedSummary);

        document.getElementById('initial-mood').value = parsedSummary.initialMood || '';
        document.getElementById('situation').value = parsedSummary.situation || '';
        document.getElementById('automatic-thought').value = parsedSummary.automaticThought || '';
        document.getElementById('emotions').value = parsedSummary.emotions || '';
        document.getElementById('cognitive-distortion').value = parsedSummary.cognitiveDistortion || '';
        document.getElementById('reframed-thought').value = parsedSummary.reframedThought || '';
        document.getElementById('current-mood').value = parsedSummary.currentMood || '';
    } catch (error) {
        console.error('Error parsing JSON summary:', error, summary);
    }
  } catch (error) {
    console.error('Error fetching CBT summary:', error);
  }
}

function endChatSession() {
  const endMessage = 'Thank you for sharing. Generating your CBT session summary...';
  const botMessage = document.createElement('div');
  botMessage.className = 'bot-message';
  botMessage.textContent = endMessage;
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  fetchCBTSummary();
}

const endChatButton = document.getElementById('end-chat-button');
endChatButton?.addEventListener('click', endChatSession);

let recognition;

// Clear speech synthesis queue and reset variables on page load
window.addEventListener("load", () => {
  speechSynthesis.cancel(); // Clear any queued utterances
  isRecording = false; // Reset recording state
});

// Enable continuous audio chat with context retention
let conversationHistory = ""; // To store the context of the conversation
let isChatActive = false; // To track if the chat is active

const startContinuousChat = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser does not support speech recognition. Please use Chrome.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = "auto"; // Allow user to input in any language
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;

    appendMessage("user", transcript);

    conversationHistory += `User: ${transcript}\n`;

    const typing = appendTypingIndicator();
    try {
      // Translate user input to English (or bot's processing language)
      const translatedInput = await translateText(transcript, "en");

     const result = await model.generateContent(`
${conversationHistory}
Bot: Respond in 1–3 short sentences only.
Be concise, clear, and natural — no paragraphs or long explanations.
User: ${translatedInput}
`);
 let reply = result.response.text();

      // Translate bot response to the selected language
      const translatedReply = await translateText(reply, currentLang);

      conversationHistory += `Bot: ${reply}\n`;

      typing.remove();
      appendMessage("bot", translatedReply);

      startLipSync();

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(translatedReply);
      utterance.lang = languageData[currentLang].code; // Use selected language for audio output
      utterance.pitch = 1.1;
      utterance.rate = 0.95;

      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.lang.startsWith(languageData[currentLang].code));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`No voice found for language: ${currentLang}. Using default voice.`);
      }

      utterance.onend = () => {
        stopLipSync();
        if (isChatActive) {
          recognition.start(); // Restart recognition for continuous chat
        }
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      typing.remove();
      appendMessage("bot", "⚠️ Sorry, something went wrong.");
      console.error("Gemini error:", error);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (isChatActive) {
      recognition.start(); // Restart recognition on error
    }
  };

  recognition.onend = () => {
    if (isChatActive) {
      recognition.start(); // Restart recognition if chat is active
    }
  };

  recognition.start();
  isChatActive = true;
  micButton.textContent = "⏹️ Stop Chat";
};

const stopContinuousChat = () => {
  isChatActive = false;
  recognition.stop();
  micButton.textContent = "🎤 Start Chat";
};

// Update mic button to toggle between start and stop icons during conversation
micButton.addEventListener("click", () => {
  if (isChatActive) {
    stopContinuousChat();
    micButton.textContent = "🎤 Start Chat"; // Change back to start icon
  } else {
    startContinuousChat();
    micButton.textContent = "⏹️ Stop Chat"; // Change to stop icon
  }
});
const analysisButton = document.createElement("button");
analysisButton.textContent = "Analysis";
analysisButton.style.padding = "0.8rem 1.5rem";
analysisButton.style.background = "var(--pause-blue)";
analysisButton.style.color = "var(--white)";
analysisButton.style.border = "none";
analysisButton.style.borderRadius = "8px";
analysisButton.style.cursor = "pointer";
analysisButton.style.fontWeight = "500";
analysisButton.style.transition = "all 0.3s ease";
analysisButton.style.marginTop = "1rem";

analysisButton.addEventListener("click", () => {
  window.location.href = "analysis.html";
});

document.querySelector(".chat-controls").appendChild(analysisButton);

document.getElementById('save-report').addEventListener('click', () => {
    console.log("buton cliced");
    
  const report = {
    initialMood: document.getElementById('initial-mood').value,
    situation: document.getElementById('situation').value,
    automaticThought: document.getElementById('automatic-thought').value,
    emotions: document.getElementById('emotions').value,
    cognitiveDistortion: document.getElementById('cognitive-distortion').value,
    reframedThought: document.getElementById('reframed-thought').value,
    currentMood: document.getElementById('current-mood').value,
  };

  let savedReports = JSON.parse(localStorage.getItem('savedReports')) || [];
  savedReports.push(report);
  localStorage.setItem('savedReports', JSON.stringify(savedReports));

  alert('Report saved successfully!');
});
