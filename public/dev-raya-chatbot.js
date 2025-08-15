/**
 * Raya Chatbot Library
 * A complete, reusable chatbot component that can be embedded in any HTML application
 * Compatible with vanilla JS, React, Vue, Angular, Next.js, etc.
 */

(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : ((global = global || self), (global.RayaChatbot = factory()));
})(this, function () {
  "use strict";

  class RayaChatbot {
    constructor(options = {}) {
      // Configuration options with defaults
      this.config = {
        apiUrl:
          options.apiUrl ||
          "https://langflow.dev.internal.rayain.net/api/v1/run/aa032f57-c478-40ce-941e-620099e3985b",
        apiKey:
          options.apiKey || "sk-dCg8QJblKdVNHnQJ_N9-_HvFjg0TkplPZZ2mM306rhk",
        messagesApiUrl:
          options.messagesApiUrl ||
          "https://langflow.dev.internal.rayain.net/api/v1/monitor/messages?flow_id=aa032f57-c478-40ce-941e-620099e3985b",
        container: options.container || document.body,
        position: options.position || "bottom-left", // bottom-left, bottom-right, top-left, top-right
        title: options.title || "Raya RAG (Chat Only) (Testing)",
        subtitle: options.subtitle || "We'll reply as soon as we can",
        welcomeTitle: options.welcomeTitle || "Welcome to Raya RAG Chat",
        welcomeSubtitle:
          options.welcomeSubtitle ||
          "Start a new conversation or browse your previous chat sessions. How can I help you today?",
        primaryColor: options.primaryColor || "#3b82f6",
        enableMorphing: options.enableMorphing !== false, // default true
        ...options,
      };

      // State management
      this.state = {
        isOpen: false,
        isNewChatMode: true,
        currentSessionId: null,
        allMessagesData: [],
        senderName: "User",
        isAnimating: false,
        morphingEnabled: false,
      };

      // DOM elements
      this.elements = {};

      // Morph functions for Flubber
      this.morphFunctions = {
        chatToClose: null,
        closeToChat: null,
      };

      // Initialize the chatbot
      this.init();
    }

    init() {
      this.injectStyles();
      this.createHTML();
      this.bindEvents();
      this.initializeAPI();
      this.loadFlubber();
    }

    injectStyles() {
      const styleId = "raya-chatbot-styles";
      if (document.getElementById(styleId)) return;

      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = this.getCSS();
      document.head.appendChild(style);
    }

    getCSS() {
      const { primaryColor } = this.config;
      const hoverColor = this.darkenColor(primaryColor, 10);

      return `
                /* Raya Chatbot Styles */
                .raya-chatbot-container {
                    font-family: system-ui, sans-serif;
                    position: fixed;
                    z-index: 10000;
                }

                .raya-chatbot-container.bottom-left {
                    bottom: 32px;
                    left: 32px;
                }

                .raya-chatbot-container.bottom-right {
                    bottom: 32px;
                    right: 32px;
                }

                .raya-chatbot-container.top-left {
                    top: 32px;
                    left: 32px;
                }

                .raya-chatbot-container.top-right {
                    top: 32px;
                    right: 32px;
                }

                .cl-trigger {
                    display: flex;
                    height: 3rem;
                    width: 3rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    background: ${primaryColor};
                    color: #fff;
                    font-weight: 700;
                    border: none;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .cl-trigger:hover {
                    background: ${hoverColor};
                }

                .cl-trigger-icon {
                    position: absolute;
                    height: 50%;
                    width: 50%;
                }

                .cl-chat-window {
                    position: absolute;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .cl-chat-window.bottom-left {
                    left: 0;
                    bottom: 64px;
                }

                .cl-chat-window.bottom-right {
                    right: 0;
                    bottom: 64px;
                }

                .cl-chat-window.top-left {
                    left: 0;
                    top: 64px;
                }

                .cl-chat-window.top-right {
                    right: 0;
                    top: 64px;
                }

                .cl-window {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border-radius: 1rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
                    background: #fff;
                    width: 450px;
                    height: 650px;
                    position: relative;
                }

                .cl-header {
                    background: ${primaryColor};
                    color: #fff;
                    padding: 1rem 1.5rem 0.5rem 1.5rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .cl-header-subtitle {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 400;
                    color: #dbeafe;
                    margin-top: 0.25rem;
                }

                .cl-online-message {
                    height: 0.5rem;
                    width: 0.5rem;
                    border-radius: 9999px;
                    background: #22c55e;
                }

                .cl-messages_container {
                    flex: 1;
                    overflow-y: auto;
                    background: #f9fafb;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .cl-chat-message {
                    display: flex;
                    width: 100%;
                }

                .cl-justify-end {
                    justify-content: flex-end;
                }

                .cl-justify-start {
                    justify-content: flex-start;
                }

                .cl-user_message {
                    background: ${primaryColor};
                    color: #fff;
                    border-radius: 0.75rem 0.125rem 0.75rem 0.75rem;
                    padding: 0.5rem 1rem;
                    max-width: 80%;
                    font-size: 1rem;
                }

                .cl-bot_message {
                    background: #e5e7eb;
                    color: #1f2937;
                    border-radius: 0.125rem 0.75rem 0.75rem 0.75rem;
                    padding: 0.5rem 1rem;
                    max-width: 80%;
                    font-size: 1rem;
                }

                .cl-input_container {
                    display: flex;
                    align-items: center;
                    border-top: 1px solid #e5e7eb;
                    background: #fff;
                    padding: 0.5rem 1rem;
                }

                .cl-input-element {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                    border-radius: 0.5rem;
                    background: #f3f4f6;
                    color: #1f2937;
                    margin-right: 0.5rem;
                }

                .cl-input-element:focus {
                    background: #fff;
                    box-shadow: 0 0 0 2px ${primaryColor};
                }

                .cl-input-element:disabled {
                    background: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                .cl-send-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .cl-send-icon {
                    height: 1.5rem;
                    width: 1.5rem;
                    stroke: ${primaryColor};
                    transition: stroke 0.2s;
                }

                .cl-notsending-message:hover {
                    stroke: ${hoverColor};
                }

                .cl-scale-0 {
                    pointer-events: none;
                    opacity: 0;
                    transform: scale(0.95);
                }

                .cl-scale-100 {
                    pointer-events: auto;
                    opacity: 1;
                    transform: scale(1);
                }

                .cl-messages_container::-webkit-scrollbar {
                    width: 6px;
                    background: #f3f4f6;
                }

                .cl-messages_container::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 3px;
                }

                .cl-sessions-toggle-header {
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff;
                    border: none;
                    border-radius: 0.375rem;
                    padding: 0.5rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cl-sessions-toggle-header:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .cl-sessions-view {
                    flex: 1;
                    overflow-y: auto;
                    background: #f9fafb;
                    padding: 1rem;
                    position: absolute;
                    top: 0;
                    left: 100%;
                    width: 75%;
                    height: 100%;
                    transform: translateX(0);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 10;
                    border-radius: 0 0 0 1rem;
                    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
                }

                .cl-sessions-view.active {
                    transform: translateX(-100%);
                }

                .cl-sessions-header-internal {
                    position: sticky;
                    top: 0;
                    background: #f9fafb;
                    z-index: 11;
                }

                .cl-sessions-container-internal {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding-bottom: 1rem;
                }

                .cl-session-button {
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    word-break: break-all;
                }

                .cl-session-button:hover {
                    background: #f3f4f6;
                    border-color: ${primaryColor};
                    color: #1f2937;
                }

                .cl-session-button.active {
                    background: ${primaryColor};
                    border-color: ${primaryColor};
                    color: #fff;
                }

                .cl-typing-indicator {
                    display: flex;
                    justify-content: flex-start;
                    width: 100%;
                }

                .cl-typing-bubble {
                    background: #e5e7eb;
                    color: #6b7280;
                    border-radius: 0.125rem 0.75rem 0.75rem 0.75rem;
                    padding: 0.75rem 1rem;
                    max-width: 80%;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .cl-typing-dots {
                    display: flex;
                    gap: 0.25rem;
                }

                .cl-typing-dot {
                    width: 0.375rem;
                    height: 0.375rem;
                    background: #9ca3af;
                    border-radius: 50%;
                    animation: typingAnimation 1.4s infinite ease-in-out;
                }

                .cl-typing-dot:nth-child(1) {
                    animation-delay: 0s;
                }

                .cl-typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .cl-typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typingAnimation {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.5;
                    }
                    30% {
                        transform: translateY(-0.5rem);
                        opacity: 1;
                    }
                }

                .cl-welcome-page {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 2rem;
                    text-align: center;
                    background: #f9fafb;
                }

                .cl-welcome-icon {
                    width: 4rem;
                    height: 4rem;
                    background: ${primaryColor};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .cl-welcome-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .cl-welcome-subtitle {
                    font-size: 1rem;
                    color: #6b7280;
                    margin-bottom: 2rem;
                    line-height: 1.5;
                }

                .cl-start-chat-button {
                    background: ${primaryColor};
                    color: #fff;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .cl-start-chat-button:hover {
                    background: ${hoverColor};
                }

                .cl-new-chat-button {
                    background: #10b981;
                    color: #fff;
                    border: 1px solid #10b981;
                    border-radius: 0.5rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .cl-new-chat-button:hover {
                    background: #059669;
                    border-color: #059669;
                }

                @media (max-width: 500px) {
                    .cl-window {
                        width: 98vw;
                        height: 70vh;
                    }

                    .raya-chatbot-container.bottom-left,
                    .raya-chatbot-container.bottom-right {
                        left: 1vw;
                        right: auto;
                        bottom: 16px;
                    }

                    .cl-chat-window.bottom-left,
                    .cl-chat-window.bottom-right {
                        left: 0;
                        right: auto;
                        bottom: 64px;
                    }
                }
            `;
    }

    createHTML() {
      const container = document.createElement("div");
      container.className = `raya-chatbot-container ${this.config.position}`;

      container.innerHTML = `
                <button class="cl-trigger">
                    <!-- The morphing SVG icon will be injected by JS -->
                </button>
                <div class="cl-chat-window ${this.config.position} cl-scale-0">
                    <div class="cl-window">
                        <div class="cl-header">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span>${this.config.title}</span>
                                <button class="cl-sessions-toggle-header">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                        <path d="M3 21v-5h5" />
                                    </svg>
                                </button>
                            </div>
                            <div class="cl-header-subtitle">
                                <div class="cl-online-message"></div>${this.config.subtitle}
                            </div>
                        </div>
                        <div class="cl-messages_container">
                            <div class="cl-welcome-page">
                                <div class="cl-welcome-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                                        fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h2 class="cl-welcome-title">${this.config.welcomeTitle}</h2>
                                <p class="cl-welcome-subtitle">${this.config.welcomeSubtitle}</p>
                                <button class="cl-start-chat-button">Start New Chat</button>
                            </div>
                        </div>

                        <div class="cl-input_container">
                            <input type="text" placeholder="Type your message..." class="cl-input-element" value="">
                            <button class="cl-send-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="cl-send-icon cl-notsending-message">
                                    <line x1="22" x2="11" y1="2" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>

                        <div class="cl-sessions-view">
                            <div class="cl-sessions-header-internal">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 1rem 0 1rem 0; border-bottom: 1px solid #e5e7eb;">
                                    <button class="cl-sessions-back-button" style="background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; transition: background 0.2s;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                            fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <path d="m15 18-6-6 6-6" />
                                        </svg>
                                    </button>
                                    <h3 style="margin: 0; color: #374151; font-size: 1.1rem; font-weight: 600;">Chat Sessions</h3>
                                </div>
                            </div>
                            <div class="cl-sessions-container-internal">
                                <button class="cl-new-chat-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <path d="M12 5v14" />
                                        <path d="M5 12h14" />
                                    </svg>
                                    Start New Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Store element references
      this.elements.container = container;
      this.elements.trigger = container.querySelector(".cl-trigger");
      this.elements.chatWindow = container.querySelector(".cl-chat-window");
      this.elements.messagesContainer = container.querySelector(
        ".cl-messages_container"
      );
      this.elements.welcomePage = container.querySelector(".cl-welcome-page");
      this.elements.inputElement = container.querySelector(".cl-input-element");
      this.elements.sendButton = container.querySelector(".cl-send-button");
      this.elements.sessionsView = container.querySelector(".cl-sessions-view");
      this.elements.sessionsToggle = container.querySelector(
        ".cl-sessions-toggle-header"
      );
      this.elements.sessionsBack = container.querySelector(
        ".cl-sessions-back-button"
      );
      this.elements.startChatButton = container.querySelector(
        ".cl-start-chat-button"
      );
      this.elements.newChatButton = container.querySelector(
        ".cl-new-chat-button"
      );
      this.elements.sessionsContainer = container.querySelector(
        ".cl-sessions-container-internal"
      );

      // Append to specified container
      this.config.container.appendChild(container);

      // Initialize morphing SVG
      this.initializeMorphingSVG();
    }

    initializeMorphingSVG() {
      this.elements.trigger.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="cl-trigger-icon">
                  <path id="morph-path" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            `;

      this.elements.morphPath =
        this.elements.container.querySelector("#morph-path");
    }
    bindEvents() {
      // Trigger button click
      this.elements.trigger.addEventListener("click", () => this.toggleChat());

      // Send button click
      this.elements.sendButton.addEventListener("click", () =>
        this.sendMessage()
      );

      // Input enter key
      this.elements.inputElement.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Start chat button
      this.elements.startChatButton.addEventListener("click", () =>
        this.startNewChat()
      );

      // New chat button
      this.elements.newChatButton.addEventListener("click", () =>
        this.startNewChatFromSessions()
      );

      // Sessions toggle
      this.elements.sessionsToggle.addEventListener("click", () =>
        this.toggleSessionsView()
      );

      // Sessions back button
      this.elements.sessionsBack.addEventListener("click", () =>
        this.toggleSessionsView()
      );
    }

    toggleChat() {
      if (this.state.isAnimating) return;

      this.state.isOpen = !this.state.isOpen;

      // Handle morphing animation
      this.handleMorphing();

      // Toggle chat window visibility
      if (this.state.isOpen) {
        this.elements.chatWindow.classList.remove("cl-scale-0");
        this.elements.chatWindow.classList.add("cl-scale-100");
      } else {
        this.elements.chatWindow.classList.remove("cl-scale-100");
        this.elements.chatWindow.classList.add("cl-scale-0");
      }
    }

    handleMorphing() {
      if (
        !this.config.enableMorphing ||
        !this.state.morphingEnabled ||
        !this.morphFunctions.chatToClose ||
        !this.morphFunctions.closeToChat
      ) {
        // Fallback to instant switch
        const chatPath =
          "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";
        const closePath = "M18 6L6 18M6 6L18 18";
        this.elements.morphPath.setAttribute(
          "d",
          this.state.isOpen ? closePath : chatPath
        );
        return;
      }

      // Use smooth morphing animation
      this.state.isAnimating = true;
      const interpolate = this.state.isOpen
        ? this.morphFunctions.chatToClose
        : this.morphFunctions.closeToChat;
      const duration = 200;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.elements.morphPath.setAttribute("d", interpolate(progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.state.isAnimating = false;
        }
      };

      requestAnimationFrame(animate);
    }

    async initializeAPI() {
      try {
        const response = await fetch(this.config.messagesApiUrl, {
          method: "GET",
          headers: {
            "x-api-key": this.config.apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.state.allMessagesData = data;

          if (data.length > 0 && data[0].sender_name) {
            this.state.senderName = data[0].sender_name;
          }

          const sessionIds = [
            ...new Set(data.map((message) => message.session_id)),
          ];
          this.populateSessionsPopup(sessionIds);
        } else {
          this.populateSessionsPopup([]);
        }
      } catch (error) {
        console.error("❌ API call error:", error);
        this.populateSessionsPopup([]);
      }
    }

    populateSessionsPopup(sessionIds) {
      const container = this.elements.sessionsContainer;
      const newChatButton = container.querySelector(".cl-new-chat-button");

      // Clear existing session buttons but keep the new chat button
      const sessionButtons = container.querySelectorAll(".cl-session-button");
      sessionButtons.forEach((button) => button.remove());

      if (sessionIds.length === 0) {
        const noSessionsDiv = document.createElement("div");
        noSessionsDiv.style.cssText =
          "text-align: center; color: #6b7280; padding: 2rem;";
        noSessionsDiv.textContent = "No sessions found";
        container.appendChild(noSessionsDiv);
        return;
      }

      // Remove "no sessions" message if it exists
      const noSessionsMsg = container.querySelector(
        'div[style*="text-align: center"]'
      );
      if (
        noSessionsMsg &&
        noSessionsMsg.textContent.includes("No sessions found")
      ) {
        noSessionsMsg.remove();
      }

      sessionIds.forEach((sessionId) => {
        const button = document.createElement("button");
        button.className = "cl-session-button";
        button.textContent = sessionId;
        button.title = `Session: ${sessionId}`;
        button.onclick = () => this.selectSession(sessionId, button);
        container.appendChild(button);
      });
    }

    selectSession(sessionId, buttonElement) {
      // Remove active class from all buttons
      this.elements.container
        .querySelectorAll(".cl-session-button")
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      // Add active class to clicked button
      buttonElement.classList.add("active");

      // Store the current session ID and exit new chat mode
      this.state.currentSessionId = sessionId;
      this.state.isNewChatMode = false;

      // Close the sessions view
      this.elements.sessionsView.classList.remove("active");

      // Load chat history for this session
      this.loadChatHistory(sessionId);
    }

    loadChatHistory(sessionId) {
      const sessionMessages = this.state.allMessagesData.filter(
        (message) => message.session_id === sessionId
      );
      this.displayChatHistory(sessionMessages);
    }

    displayChatHistory(messages) {
      const messagesContainer = this.elements.messagesContainer;
      const welcomePage = this.elements.welcomePage;

      if (welcomePage) {
        welcomePage.style.display = "none";
      }

      messagesContainer.innerHTML = "";

      if (messages.length === 0) {
        messagesContainer.innerHTML =
          '<div style="text-align: center; color: #6b7280; padding: 2rem;">No messages found for this session</div>';
      } else {
        messages.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(a.timestamp) - new Date(b.timestamp);
          }
          return 0;
        });

        messages.forEach((message) => {
          const messageDiv = document.createElement("div");
          messageDiv.className = "cl-chat-message";

          const isUserMessage =
            message.sender === "User" ||
            message.type === "human" ||
            message.message_type === "user";

          if (isUserMessage) {
            messageDiv.classList.add("cl-justify-end");
            messageDiv.innerHTML = `<div class="cl-user_message">${this.escapeHtml(
              message.message || message.text || message.content
            )}</div>`;
          } else {
            messageDiv.classList.add("cl-justify-start");
            const formattedMessage = this.markdownToHtml(
              message.message || message.text || message.content
            );
            messageDiv.innerHTML = `
                            <div class="cl-bot_message">
                                <div class="markdown-body prose flex flex-col word-break-break-word">
                                    ${formattedMessage}
                                </div>
                            </div>
                        `;
          }
          messagesContainer.appendChild(messageDiv);
        });
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    markdownToHtml(markdown) {
      if (!markdown) return "";

      let html = markdown;

      // First, handle code blocks (must be done before other processing to avoid conflicts)
      html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        const escapedCode = this.escapeHtml(code.trim());
        return `<pre style="background: #f3f4f6; padding: 0.75rem; border-radius: 0.375rem; overflow-x: auto; margin: 0.5rem 0; white-space: pre-wrap;"><code style="font-family: monospace; font-size: 0.875em;">${escapedCode}</code></pre>`;
      });

      // Handle inline code (after code blocks to avoid conflicts)
      html = html.replace(/`([^`]+)`/g, (match, code) => {
        const escapedCode = this.escapeHtml(code);
        return `<code style="background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">${escapedCode}</code>`;
      });

      // Handle headings (h1-h6)
      html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: #1f2937;">$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: #1f2937;">$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem 0; color: #1f2937;">$1</h1>');

      // Convert the remaining text to HTML-safe format (but preserve already processed HTML)
      const parts = [];
      let currentIndex = 0;
      
      // Find all HTML tags that we've already created
      const htmlTagRegex = /<(pre|code|h[1-6])[^>]*>[\s\S]*?<\/\1>/g;
      let match;
      
      while ((match = htmlTagRegex.exec(html)) !== null) {
        // Add text before this HTML tag (escaped)
        if (match.index > currentIndex) {
          const textBefore = html.slice(currentIndex, match.index);
          parts.push({ type: 'text', content: textBefore });
        }
        
        // Add the HTML tag as-is
        parts.push({ type: 'html', content: match[0] });
        currentIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (currentIndex < html.length) {
        const remainingText = html.slice(currentIndex);
        parts.push({ type: 'text', content: remainingText });
      }

      // Process each part
      html = parts.map(part => {
        if (part.type === 'html') {
          return part.content; // Return HTML as-is
        }
        
        let processedText = this.escapeHtml(part.content);
        
        // Apply markdown formatting to text parts only
        // Bold and italic
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        processedText = processedText.replace(/__(.*?)__/g, "<strong>$1</strong>");
        processedText = processedText.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
        processedText = processedText.replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");
        
        // Links
        processedText = processedText.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" style="color: #3b82f6; text-decoration: underline;">$1</a>'
        );

        // Handle unordered lists (*, -, +)
        const lines = processedText.split('\n');
        let inUnorderedList = false;
        let inOrderedList = false;
        const processedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmedLine = line.trim();
          
          // Check for unordered list items
          const unorderedMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
          if (unorderedMatch) {
            if (inOrderedList) {
              processedLines.push('</ol>');
              inOrderedList = false;
            }
            if (!inUnorderedList) {
              processedLines.push('<ul style="margin: 0.5rem 0; padding-left: 1.5rem; list-style-type: disc;">');
              inUnorderedList = true;
            }
            processedLines.push(`<li style="margin: 0.25rem 0;">${unorderedMatch[1]}</li>`);
            continue;
          }
          
          // Check for ordered list items
          const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
          if (orderedMatch) {
            if (inUnorderedList) {
              processedLines.push('</ul>');
              inUnorderedList = false;
            }
            if (!inOrderedList) {
              processedLines.push('<ol style="margin: 0.5rem 0; padding-left: 1.5rem;">');
              inOrderedList = true;
            }
            processedLines.push(`<li style="margin: 0.25rem 0;">${orderedMatch[2]}</li>`);
            continue;
          }
          
          // Not a list item, close any open lists
          if (inUnorderedList) {
            processedLines.push('</ul>');
            inUnorderedList = false;
          }
          if (inOrderedList) {
            processedLines.push('</ol>');
            inOrderedList = false;
          }
          
          // Regular line
          if (trimmedLine === '') {
            processedLines.push(''); // Preserve empty lines
          } else {
            processedLines.push(line);
          }
        }
        
        // Close any remaining open lists
        if (inUnorderedList) {
          processedLines.push('</ul>');
        }
        if (inOrderedList) {
          processedLines.push('</ol>');
        }
        
        return processedLines.join('\n');
      }).join('');

      // Convert line breaks to <br> tags, but avoid breaking HTML tags
      html = html.replace(/\n(?![^\n]*<\/(?:ul|ol|pre|h[1-6])>)/g, '<br>');
      
      // Clean up extra line breaks around block elements
      html = html.replace(/<br>\s*(<(?:ul|ol|pre|h[1-6])[^>]*>)/g, '$1');
      html = html.replace(/(<\/(?:ul|ol|pre|h[1-6])>)\s*<br>/g, '$1');

      return html;
    }

    showTypingIndicator() {
      const messagesContainer = this.elements.messagesContainer;

      const existingIndicator = this.elements.container.querySelector(
        ".cl-typing-indicator"
      );
      if (existingIndicator) {
        existingIndicator.remove();
      }

      const typingDiv = document.createElement("div");
      typingDiv.className = "cl-chat-message cl-typing-indicator";
      typingDiv.innerHTML = `
                <div class="cl-typing-bubble">
                    <span style="margin-right: 0.5rem;">AI is typing</span>
                    <div class="cl-typing-dots">
                        <div class="cl-typing-dot"></div>
                        <div class="cl-typing-dot"></div>
                        <div class="cl-typing-dot"></div>
                    </div>
                </div>
            `;

      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
      const typingIndicator = this.elements.container.querySelector(
        ".cl-typing-indicator"
      );
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    startNewChat() {
      const messagesContainer = this.elements.messagesContainer;
      messagesContainer.innerHTML = "";
      this.showWelcomePage();
    }

    startNewChatFromSessions() {
      this.elements.sessionsView.classList.remove("active");
      this.startNewChat();
    }

    showWelcomePage() {
      const messagesContainer = this.elements.messagesContainer;
      const welcomePage = this.elements.welcomePage;

      messagesContainer.innerHTML = "";

      if (!welcomePage) {
        messagesContainer.innerHTML = `
                    <div class="cl-welcome-page">
                        <div class="cl-welcome-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <h2 class="cl-welcome-title">${this.config.welcomeTitle}</h2>
                        <p class="cl-welcome-subtitle">${this.config.welcomeSubtitle}</p>
                        <button class="cl-start-chat-button">Start New Chat</button>
                    </div>
                `;

        // Re-bind the start chat button
        const newStartButton = messagesContainer.querySelector(
          ".cl-start-chat-button"
        );
        newStartButton.addEventListener("click", () => this.startNewChat());
      } else {
        welcomePage.style.display = "flex";
      }

      this.state.isNewChatMode = true;
      this.state.currentSessionId = null;

      this.elements.container
        .querySelectorAll(".cl-session-button")
        .forEach((btn) => {
          btn.classList.remove("active");
        });
    }

    async sendMessage() {
      const messageText = this.elements.inputElement.value.trim();
      if (!messageText) return;

      let isFirstMessageInNewSession = false;

      if (this.state.isNewChatMode || !this.state.currentSessionId) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        const timeStr = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        this.state.currentSessionId = `${this.state.senderName} - ${dateStr}, ${timeStr}`;
        this.state.isNewChatMode = false;
        isFirstMessageInNewSession = true;
      }

      // Store the session ID that this message belongs to
      const messageSessionId = this.state.currentSessionId;

      this.elements.inputElement.value = "";
      this.addMessageToChat(messageText, true);
      this.showTypingIndicator();

      try {
        const response = await fetch(this.config.apiUrl + "?stream=false", {
          method: "POST",
          headers: {
            "x-api-key": this.config.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            output_type: "chat",
            input_type: "chat",
            input_value: messageText,
            session_id: messageSessionId,
          }),
        });

        this.hideTypingIndicator();

        if (response.ok) {
          const data = await response.json();
          const botResponse =
            data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
            "No response received";

          // Only add the response to chat if we're still viewing the same session
          if (this.state.currentSessionId === messageSessionId) {
            this.addMessageToChat(botResponse, false);
          }

          if (isFirstMessageInNewSession) {
            this.addNewSessionToList(messageSessionId);
          }

          await this.refreshMessagesData();
        } else {
          // Only show error message if we're still in the same session
          if (this.state.currentSessionId === messageSessionId) {
            this.addMessageToChat(
              "Sorry, there was an error sending your message. Please try again.",
              false
            );
          }
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
        this.hideTypingIndicator();
        // Only show error message if we're still in the same session
        if (this.state.currentSessionId === messageSessionId) {
          this.addMessageToChat(
            "Sorry, there was an error sending your message. Please try again.",
            false
          );
        }
      }
    }

    addMessageToChat(messageText, isUser) {
      const messagesContainer = this.elements.messagesContainer;
      const welcomePage = this.elements.welcomePage;

      if (welcomePage) {
        welcomePage.style.display = "none";
      }

      const messageDiv = document.createElement("div");
      messageDiv.className = "cl-chat-message";

      if (isUser) {
        messageDiv.classList.add("cl-justify-end");
        messageDiv.innerHTML = `<div class="cl-user_message">${this.escapeHtml(
          messageText
        )}</div>`;
      } else {
        messageDiv.classList.add("cl-justify-start");
        const formattedMessage = this.markdownToHtml(messageText);
        messageDiv.innerHTML = `
                    <div class="cl-bot_message">
                        <div class="markdown-body prose flex flex-col word-break-break-word">
                            ${formattedMessage}
                        </div>
                    </div>
                `;
      }

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addNewSessionToList(sessionId) {
      const container = this.elements.sessionsContainer;

      const noSessionsMsg = container.querySelector(
        'div[style*="text-align: center"]'
      );
      if (
        noSessionsMsg &&
        noSessionsMsg.textContent.includes("No sessions found")
      ) {
        noSessionsMsg.remove();
      }

      const existingButtons = container.querySelectorAll(".cl-session-button");
      for (let button of existingButtons) {
        if (button.textContent === sessionId) {
          this.elements.container
            .querySelectorAll(".cl-session-button")
            .forEach((btn) => {
              btn.classList.remove("active");
            });
          button.classList.add("active");
          return;
        }
      }

      const button = document.createElement("button");
      button.className = "cl-session-button active";
      button.textContent = sessionId;
      button.title = `Session: ${sessionId}`;
      button.onclick = () => this.selectSession(sessionId, button);

      this.elements.container
        .querySelectorAll(".cl-session-button")
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      container.appendChild(button);
    }

    async refreshMessagesData() {
      try {
        const response = await fetch(this.config.messagesApiUrl, {
          method: "GET",
          headers: {
            "x-api-key": this.config.apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.state.allMessagesData = data;
        }
      } catch (error) {
        console.error("❌ Error refreshing messages:", error);
      }
    }

    toggleSessionsView() {
      const sessionsView = this.elements.sessionsView;

      if (sessionsView.classList.contains("active")) {
        sessionsView.classList.remove("active");
      } else {
        sessionsView.classList.add("active");
      }
    }

    loadFlubber() {
      if (!this.config.enableMorphing) return;

      const cdnSources = [
        "https://unpkg.com/flubber@0.4.2/build/flubber.min.js",
        "https://cdn.jsdelivr.net/npm/flubber@0.4.2/build/flubber.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/flubber/0.4.2/flubber.min.js",
      ];

      let currentIndex = 0;

      const tryNextSource = () => {
        if (currentIndex >= cdnSources.length) {
          console.warn("❌ All Flubber CDN sources failed to load");
          return;
        }

        const script = document.createElement("script");
        script.src = cdnSources[currentIndex];

        script.onload = () => {
          this.initializeMorphing();
        };

        script.onerror = () => {
          currentIndex++;
          tryNextSource();
        };

        document.head.appendChild(script);
      };

      tryNextSource();
    }

    initializeMorphing() {
      let flubberObj = null;

      if (typeof flubber !== "undefined") {
        flubberObj = flubber;
      } else if (typeof window.flubber !== "undefined") {
        flubberObj = window.flubber;
      } else if (typeof window.Flubber !== "undefined") {
        flubberObj = window.Flubber;
      }

      if (flubberObj && typeof flubberObj === "object") {
        let morphFunc = null;

        if (typeof flubberObj.interpolate === "function") {
          morphFunc = flubberObj.interpolate;
        } else if (typeof flubberObj.morph === "function") {
          morphFunc = flubberObj.morph;
        } else if (typeof flubberObj.default === "function") {
          morphFunc = flubberObj.default;
        } else if (typeof flubberObj.flubber === "function") {
          morphFunc = flubberObj.flubber;
        }

        if (morphFunc) {
          try {
            const chatPath =
              "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z";
            const closePath = "M18 6L6 18M6 6L18 18";

            this.morphFunctions.chatToClose = morphFunc(chatPath, closePath);
            this.morphFunctions.closeToChat = morphFunc(closePath, chatPath);
            this.state.morphingEnabled = true;
          } catch (error) {
            console.warn("❌ Flubber morphing failed:", error);
            this.state.morphingEnabled = false;
          }
        }
      }
    }

    darkenColor(color, percent) {
      // Simple color darkening utility
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = ((num >> 8) & 0x00ff) - amt;
      const B = (num & 0x0000ff) - amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    }

    // Public API methods
    open() {
      if (!this.state.isOpen) {
        this.toggleChat();
      }
    }

    close() {
      if (this.state.isOpen) {
        this.toggleChat();
      }
    }

    destroy() {
      if (this.elements.container && this.elements.container.parentNode) {
        this.elements.container.parentNode.removeChild(this.elements.container);
      }

      const styleElement = document.getElementById("raya-chatbot-styles");
      if (styleElement) {
        styleElement.remove();
      }
    }

    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      // Re-initialize with new config if needed
      // This is a simplified version - you might want to implement more granular updates
    }
  }

  // Return the class for use
  return RayaChatbot;
});
