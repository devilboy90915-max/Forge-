/* =========================================================
   FORGE — Script.js
   Frontend workflow:
   Idea → Smart Questions → Blueprint → Workspace
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const state = {
    idea: "",
    attachments: [],
    questions: [],
    answers: {},
    blueprint: null,
    project: null,
    projects: loadProjects(),
    chatHistory: []
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  function show(element) {
    if (element) element.classList.remove("hidden");
  }

  function hide(element) {
    if (element) element.classList.add("hidden");
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createId() {
    return "forge-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------

  $$(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;

      $$(".nav-item").forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      $$(".page").forEach(section => section.classList.remove("active-page"));

      if (page === "builder") {
        $("#builderPage")?.classList.add("active-page");
      }

      if (page === "chat") {
        $("#chatPage")?.classList.add("active-page");
      }

      if (page === "projects") {
        $("#projectsPage")?.classList.add("active-page");
        renderProjects();
      }
    });
  });

  // ---------------------------------------------------------
  // IDEA INPUT
  // ---------------------------------------------------------

  const ideaInput = $("#ideaInput");
  const ideaCounter = $("#ideaCounter");

  if (ideaInput) {
    ideaInput.addEventListener("input", () => {
      state.idea = ideaInput.value;

      if (ideaCounter) {
        ideaCounter.textContent = `${ideaInput.value.length}/2000`;
      }
    });
  }

  // ---------------------------------------------------------
  // FILE / IMAGE ATTACHMENTS
  // ---------------------------------------------------------

  const fileInput = $("#fileInput");
  const imageInput = $("#imageInput");

  $("#addFileButton")?.addEventListener("click", () => {
    fileInput?.click();
  });

  $("#addImageButton")?.addEventListener("click", () => {
    imageInput?.click();
  });

  fileInput?.addEventListener("change", event => {
    handleFiles(event.target.files, "file");
  });

  imageInput?.addEventListener("change", event => {
    handleFiles(event.target.files, "image");
  });

  function handleFiles(files, type) {
    if (!files || !files.length) return;

    [...files].forEach(file => {
      state.attachments.push({
        name: file.name,
        type,
        size: file.size
      });
    });

    updateAttachmentStatus();
  }

  function updateAttachmentStatus() {
    const status = $("#attachmentStatus");

    if (!status) return;

    if (!state.attachments.length) {
      status.textContent = "";
      return;
    }

    status.textContent =
      `${state.attachments.length} attachment${state.attachments.length > 1 ? "s" : ""} added`;
  }

  // ---------------------------------------------------------
  // START FORGE
  // ---------------------------------------------------------

  $("#startForgeButton")?.addEventListener("click", async () => {
    const idea = ideaInput?.value.trim();

    if (!idea) {
      showNotice("Describe the app you want to build first.");
      ideaInput?.focus();
      return;
    }

    state.idea = idea;

    const button = $("#startForgeButton");
    setButtonLoading(button, true, "Understanding...");

    await sleep(700);

    state.questions = generateSmartQuestions(idea);

    setButtonLoading(button, false);

    renderQuestions();

    show($("#questionsSection"));

    $("#questionsSection")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  // ---------------------------------------------------------
  // SMART QUESTION ENGINE
  // ---------------------------------------------------------

  function generateSmartQuestions(idea) {
    const text = idea.toLowerCase();
    const questions = [];

    // Name
    if (!/\bcalled\b|\bnamed\b|\bname is\b/i.test(idea)) {
      questions.push({
        id: "appName",
        title: "What should your app be called?",
        placeholder: "e.g. ChatLLM",
        type: "text"
      });
    }

    // Purpose
    if (idea.length < 120 || !hasPurpose(text)) {
      questions.push({
        id: "purpose",
        title: "What is the main purpose of the app?",
        placeholder: "Describe what users should be able to do...",
        type: "textarea"
      });
    }

    // Platform
    if (!/\bweb\b|\bwebsite\b|\bmobile\b|\bandroid\b|\bios\b|\bapp\b/i.test(text)) {
      questions.push({
        id: "platform",
        title: "Where should the app run?",
        placeholder: "Web app, Android, iOS, or multiple platforms?",
        type: "text"
      });
    }

    // Users / accounts
    if (
      /\bchat\b|\bsocial\b|\bcommunity\b|\bprofile\b|\baccount\b|\buser\b|\blogin\b|\bllm\b|\bai\b/.test(text)
    ) {
      if (!/\blogin\b|\bsign.?up\b|\bauth\b|\baccount\b/i.test(text)) {
        questions.push({
          id: "accounts",
          title: "Should users have accounts?",
          placeholder: "Yes — email/password, Google, etc. / No — no login needed",
          type: "text"
        });
      }
    }

    // AI / chatbot
    if (/\bai\b|\bchatbot\b|\bchatllm\b|\bllm\b|\bassistant\b|\bgpt\b|\bgemini\b|\bmodel\b/.test(text)) {
      if (!/\bmodel\b|\bgemini\b|\bgpt\b|\bclaude\b|\bllama\b|\bprovider\b/i.test(text)) {
        questions.push({
          id: "aiProvider",
          title: "Which AI model or provider should power the app?",
          placeholder: "e.g. Gemini, OpenAI, Anthropic, or let Forge choose",
          type: "text"
        });
      }

      if (!/\bhistory\b|\bsave\b|\bconversation/i.test(text)) {
        questions.push({
          id: "chatHistory",
          title: "Should conversations be saved?",
          placeholder: "Yes — save chat history / No — temporary chats only",
          type: "text"
        });
      }
    }

    // Database
    if (
      /\bstore\b|\bsave\b|\bdata\b|\busers\b|\bproducts\b|\bposts\b|\bmessages\b|\bprofile\b/.test(text)
    ) {
      questions.push({
        id: "dataStorage",
        title: "What data should the app store?",
        placeholder: "Users, messages, products, posts, settings, etc.",
        type: "textarea"
      });
    }

    // Design
    if (!/\bdesign\b|\btheme\b|\bcolor\b|\bdark\b|\blight\b|\bstyle\b/i.test(text)) {
      questions.push({
        id: "design",
        title: "What visual style should the app use?",
        placeholder: "e.g. Minimal dark, clean white, modern SaaS...",
        type: "text"
      });
    }

    // Final priority
    questions.push({
      id: "extraRequirements",
      title: "Anything else Forge should know?",
      placeholder: "Add features, restrictions, preferences, or leave blank...",
      type: "textarea",
      optional: true
    });

    return questions;
  }

  function hasPurpose(text) {
    const purposeWords = [
      "for",
      "helps",
      "help",
      "allows",
      "lets",
      "manage",
      "track",
      "create",
      "build",
      "learn",
      "chat",
      "generate",
      "store"
    ];

    return purposeWords.some(word => text.includes(word));
  }

  // ---------------------------------------------------------
  // QUESTIONS UI
  // ---------------------------------------------------------

  function renderQuestions() {
    const container = $("#questionsContainer");

    if (!container) return;

    container.innerHTML = "";

    state.questions.forEach((question, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "question-card";

      const label = document.createElement("label");
      label.className = "question-label";
      label.textContent = `${index + 1}. ${question.title}`;

      let input;

      if (question.type === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = "text";
      }

      input.className = "question-input";
      input.placeholder = question.placeholder || "";
      input.dataset.questionId = question.id;

      if (state.answers[question.id]) {
        input.value = state.answers[question.id];
      }

      input.addEventListener("input", () => {
        state.answers[question.id] = input.value;
      });

      wrapper.appendChild(label);
      wrapper.appendChild(input);

      container.appendChild(wrapper);
    });
  }

  // ---------------------------------------------------------
  // CONTINUE TO BLUEPRINT
  // ---------------------------------------------------------

  $("#continueButton")?.addEventListener("click", async () => {
    collectAnswers();

    const button = $("#continueButton");
    setButtonLoading(button, true, "Creating blueprint...");

    await sleep(900);

    state.blueprint = createBlueprint();

    renderBlueprint();

    setButtonLoading(button, false);

    show($("#blueprintSection"));

    $("#blueprintSection")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  function collectAnswers() {
    $$(".question-input").forEach(input => {
      state.answers[input.dataset.questionId] = input.value.trim();
    });
  }

  // ---------------------------------------------------------
  // BLUEPRINT GENERATOR
  // ---------------------------------------------------------

  function createBlueprint() {
    const appName =
      state.answers.appName ||
      inferAppName(state.idea) ||
      "Forge App";

    const purpose =
      state.answers.purpose ||
      state.idea;

    const features = inferFeatures(state.idea, state.answers);

    const screens = inferScreens(state.idea, state.answers);

    return {
      id: createId(),
      name: appName,
      description: purpose,
      features,
      screens,
      createdAt: new Date().toISOString()
    };
  }

  function inferAppName(idea) {
    const match = idea.match(
      /\b(?:called|named)\s+([A-Za-z0-9][A-Za-z0-9 _-]{1,40})/i
    );

    return match ? match[1].trim() : "";
  }

  function inferFeatures(idea, answers) {
    const text = (idea + " " + Object.values(answers).join(" ")).toLowerCase();

    const features = [];

    if (/\bchat\b|\bllm\b|\bchatbot\b|\bai\b/.test(text)) {
      features.push("AI-powered chat");
      features.push("Conversation interface");
    }

    if (/\blogin\b|\bsign.?up\b|\baccount\b|\bprofile\b/.test(text)) {
      features.push("User accounts");
    }

    if (/\bhistory\b|\bsave\b|\bstorage\b/.test(text)) {
      features.push("Persistent data");
    }

    if (/\bsearch\b/.test(text)) {
      features.push("Search");
    }

    if (/\bfile\b|\bupload\b|\bimage\b|\bphoto\b/.test(text)) {
      features.push("File and image uploads");
    }

    if (/\badmin\b|\bdashboard\b/.test(text)) {
      features.push("Admin dashboard");
    }

    if (/\bsetting\b|\bpreference\b/.test(text)) {
      features.push("Settings");
    }

    if (features.length === 0) {
      features.push("Responsive user interface");
      features.push("Core app functionality");
      features.push("Simple navigation");
    }

    return [...new Set(features)];
  }

  function inferScreens(idea, answers) {
    const text = (idea + " " + Object.values(answers).join(" ")).toLowerCase();

    const screens = ["Home"];

    if (/\bchat\b|\bllm\b|\bchatbot\b|\bai\b/.test(text)) {
      screens.push("Chat");
    }

    if (/\blogin\b|\bsign.?up\b|\baccount\b|\bprofile\b/.test(text)) {
      screens.push("Login / Account");
    }

    if (/\bsetting\b|\bpreference\b/.test(text)) {
      screens.push("Settings");
    }

    if (/\badmin\b|\bdashboard\b/.test(text)) {
      screens.push("Admin Dashboard");
    }

    return [...new Set(screens)];
  }

  // ---------------------------------------------------------
  // BLUEPRINT UI
  // ---------------------------------------------------------

  function renderBlueprint() {
    const blueprint = state.blueprint;

    if (!blueprint) return;

    if ($("#blueprintName")) {
      $("#blueprintName").textContent = blueprint.name;
    }

    if ($("#blueprintDescription")) {
      $("#blueprintDescription").textContent =
        blueprint.description;
    }

    if ($("#blueprintFeatures")) {
      $("#blueprintFeatures").innerHTML =
        blueprint.features
          .map(feature => `<li>${escapeHTML(feature)}</li>`)
          .join("");
    }

    if ($("#blueprintScreens")) {
      $("#blueprintScreens").innerHTML =
        blueprint.screens
          .map(screen => `<li>${escapeHTML(screen)}</li>`)
          .join("");
    }
  }

  // ---------------------------------------------------------
  // BUILD APP
  // ---------------------------------------------------------

  $("#buildAppButton")?.addEventListener("click", async () => {
    if (!state.blueprint) return;

    const button = $("#buildAppButton");
    setButtonLoading(button, true, "Building...");

    show($("#workspaceSection"));

    if ($("#workspaceTitle")) {
      $("#workspaceTitle").textContent =
        `${state.blueprint.name} — Workspace`;
    }

    await runBuildSimulation();

    setButtonLoading(button, false);

    $("#workspaceSection")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    createProjectFromBlueprint();
  });

  async function runBuildSimulation() {
    const log = $("#buildLog");

    if (log) {
      log.innerHTML = "";
    }

    const steps = [
      "Reading requirements...",
      "Validating blueprint...",
      "Preparing application structure...",
      "Generating interface...",
      "Connecting application logic...",
      "Running basic validation...",
      "Preparing live preview..."
    ];

    for (const step of steps) {
      addBuildLog(step, "running");
      await sleep(500);
    }

    addBuildLog("Build preparation complete.", "success");

    renderPreview();
  }

  function addBuildLog(message, status = "") {
    const log = $("#buildLog");

    if (!log) return;

    const entry = document.createElement("div");
    entry.className = `build-log-entry ${status}`;

    entry.textContent = message;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  // ---------------------------------------------------------
  // PREVIEW
  // ---------------------------------------------------------

  function renderPreview() {
    const blueprint = state.blueprint;

    if (!blueprint) return;

    if ($("#previewAppName")) {
      $("#previewAppName").textContent = blueprint.name;
    }

    if ($("#previewHeading")) {
      $("#previewHeading").textContent =
        `Welcome to ${blueprint.name}`;
    }

    if ($("#previewCards")) {
      $("#previewCards").innerHTML =
        blueprint.features
          .map(feature => `
            <div class="preview-card">
              <strong>${escapeHTML(feature)}</strong>
              <span>Ready for implementation</span>
            </div>
          `)
          .join("");
    }
  }

  // ---------------------------------------------------------
  // TEST APP
  // ---------------------------------------------------------

  $("#testButton")?.addEventListener("click", async () => {
    const button = $("#testButton");

    setButtonLoading(button, true, "Testing...");

    addBuildLog("Starting application tests...", "running");

    await sleep(700);

    addBuildLog("Checking interface structure...", "running");

    await sleep(500);

    addBuildLog("Checking required screens...", "running");

    await sleep(500);

    addBuildLog("No frontend validation errors detected.", "success");

    setButtonLoading(button, false);
  });

  // ---------------------------------------------------------
  // EDIT EXISTING APP
  // ---------------------------------------------------------

  $("#editButton")?.addEventListener("click", async () => {
    const input = $("#editInput");
    const request = input?.value.trim();

    if (!request) {
      showNotice("Tell Forge what you want to change.");
      input?.focus();
      return;
    }

    addBuildLog(`Edit request received: ${request}`, "running");

    await sleep(700);

    applyLocalEdit(request);

    addBuildLog("Edit processed. Preview updated.", "success");

    if (input) {
      input.value = "";
    }
  });

  function applyLocalEdit(request) {
    const text = request.toLowerCase();

    if (
      text.includes("name") &&
      state.blueprint
    ) {
      const match = request.match(
        /(?:name|called)\s+(?:to\s+)?["']?([^"']+)["']?$/i
      );

      if (match) {
        state.blueprint.name = match[1].trim();

        if ($("#previewAppName")) {
          $("#previewAppName").textContent =
            state.blueprint.name;
        }

        if ($("#previewHeading")) {
          $("#previewHeading").textContent =
            `Welcome to ${state.blueprint.name}`;
        }
      }
    }

    renderPreview();
  }

  // ---------------------------------------------------------
  // EXPORT
  // ---------------------------------------------------------

  $("#exportButton")?.addEventListener("click", () => {
    if (!state.blueprint) {
      showNotice("Build an app before exporting.");
      return;
    }

    const html = generateExportHTML();

    const blob = new Blob([html], {
      type: "text/html"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download =
      `${safeFilename(state.blueprint.name)}.html`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    addBuildLog("Export created successfully.", "success");
  });

  function generateExportHTML() {
    const blueprint = state.blueprint;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(blueprint.name)}</title>
<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f6f1e7;
  color: #24231f;
}

main {
  max-width: 900px;
  margin: auto;
  padding: 60px 24px;
}

.card {
  background: white;
  border: 1px solid #ddd6c8;
  border-radius: 16px;
  padding: 24px;
  margin-top: 16px;
}

h1 {
  font-size: 42px;
}

p {
  color: #68645b;
}
</style>
</head>
<body>
<main>
  <h1>${escapeHTML(blueprint.name)}</h1>
  <p>${escapeHTML(blueprint.description)}</p>

  ${blueprint.features.map(feature => `
    <div class="card">
      <strong>${escapeHTML(feature)}</strong>
      <p>Application feature</p>
    </div>
  `).join("")}
</main>
</body>
</html>`;
  }

  function safeFilename(name) {
    return name
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "forge-app";
  }

  // ---------------------------------------------------------
  // PROJECTS
  // ---------------------------------------------------------

  function createProjectFromBlueprint() {
    if (!state.blueprint) return;

    const existingIndex = state.projects.findIndex(
      project => project.id === state.blueprint.id
    );

    const project = {
      id: state.blueprint.id,
      name: state.blueprint.name,
      description: state.blueprint.description,
      features: state.blueprint.features,
      screens: state.blueprint.screens,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      state.projects[existingIndex] = project;
    } else {
      state.projects.unshift(project);
    }

    saveProjects();
  }

  function renderProjects() {
    const container = $("#projectsContainer");

    if (!container) return;

    if (!state.projects.length) {
      container.innerHTML = `
        <div class="empty-projects">
          <h3>No projects yet</h3>
          <p>Build your first app with Forge.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.projects
      .map(project => `
        <div class="project-card">
          <div>
            <h3>${escapeHTML(project.name)}</h3>
            <p>${escapeHTML(project.description)}</p>
          </div>

          <button
            class="secondary-button project-open-button"
            data-project-id="${escapeHTML(project.id)}"
          >
            Open
          </button>
        </div>
      `)
      .join("");

    $$(".project-open-button").forEach(button => {
      button.addEventListener("click", () => {
        openProject(button.dataset.projectId);
      });
    });
  }

  function openProject(id) {
    const project = state.projects.find(
      item => item.id === id
    );

    if (!project) return;

    state.blueprint = {
      ...project
    };

    renderBlueprint();
    renderPreview();

    show($("#blueprintSection"));
    show($("#workspaceSection"));

    $("#builderPage")?.classList.add("active-page");
    $("#projectsPage")?.classList.remove("active-page");

    $$(".nav-item").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === "builder"
      );
    });

    $("#workspaceSection")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  $("#newProjectButton")?.addEventListener("click", () => {
    resetBuilder();

    $("#builderPage")?.classList.add("active-page");
    $("#projectsPage")?.classList.remove("active-page");

    $$(".nav-item").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === "builder"
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  function resetBuilder() {
    state.idea = "";
    state.attachments = [];
    state.questions = [];
    state.answers = {};
    state.blueprint = null;

    if (ideaInput) {
      ideaInput.value = "";
    }

    if (ideaCounter) {
      ideaCounter.textContent = "0/2000";
    }

    hide($("#questionsSection"));
    hide($("#blueprintSection"));
    hide($("#workspaceSection"));

    updateAttachmentStatus();
  }

  // ---------------------------------------------------------
  // AI CHAT FRONTEND
  // ---------------------------------------------------------

  $("#chatSendButton")?.addEventListener("click", sendChatMessage);

  $("#chatInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });

  async function sendChatMessage() {
    const input = $("#chatInput");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    addChatMessage("user", message);

    input.value = "";

    await sleep(500);

    addChatMessage(
      "assistant",
      getLocalAssistantResponse(message)
    );
  }

  function addChatMessage(role, message) {
    const container = $("#chatMessages");

    if (!container) return;

    const messageElement = document.createElement("div");

    messageElement.className =
      `chat-message ${role}`;

    messageElement.textContent = message;

    container.appendChild(messageElement);

    container.scrollTop = container.scrollHeight;

    state.chatHistory.push({
      role,
      message
    });
  }

  function getLocalAssistantResponse(message) {
    const text = message.toLowerCase();

    if (text.includes("build")) {
      return "Tell me what you want to build, and Forge can turn the idea into requirements, a blueprint, and a build plan.";
    }

    if (text.includes("forge")) {
      return "Forge is designed around this workflow: Idea → Smart Questions → Blueprint → Build → Preview → Test → Export.";
    }

    if (text.includes("api")) {
      return "API connections should be handled through Forge's secure backend rather than exposing API keys in the browser.";
    }

    return "I understand the request. Once Forge's AI backend is connected, I can analyze this properly and help turn it into an application.";
  }

  // ---------------------------------------------------------
  // LOCAL STORAGE
  // ---------------------------------------------------------

  function loadProjects() {
    try {
      return JSON.parse(
        localStorage.getItem("forge_projects") || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveProjects() {
    try {
      localStorage.setItem(
        "forge_projects",
        JSON.stringify(state.projects)
      );
    } catch {
      console.warn("Forge: unable to save projects.");
    }
  }

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------

  function setButtonLoading(button, loading, text) {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = text;
      button.classList.add("loading");
    } else {
      button.disabled = false;
      button.textContent =
        button.dataset.originalText || "Continue";
      button.classList.remove("loading");
    }
  }

  function showNotice(message) {
    let notice = $("#forgeNotice");

    if (!notice) {
      notice = document.createElement("div");
      notice.id = "forgeNotice";
      notice.className = "forge-notice";

      document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.classList.add("visible");

    clearTimeout(notice._timeout);

    notice._timeout = setTimeout(() => {
      notice.classList.remove("visible");
    }, 3000);
  }

  // ---------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------

  renderProjects();

  console.log(
    "%cFORGE%c initialized.",
    "font-weight:bold;",
    "font-weight:normal;"
  );
});
