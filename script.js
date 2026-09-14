/* =========================================
   FORGE — AI APP BUILDER ENGINE
   Frontend Workflow
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  /* ---------- STATE ---------- */

  const state = {
    idea: "",
    attachments: [],
    questions: [],
    answers: {},
    blueprint: null,
    currentProject: null
  };

  /* ---------- ELEMENTS ---------- */

  const ideaInput = $("ideaInput");
  const ideaCounter = $("ideaCounter");
  const startForgeButton = $("startForgeButton");

  const questionsSection = $("questionsSection");
  const questionsContainer = $("questionsContainer");
  const continueButton = $("continueButton");

  const blueprintSection = $("blueprintSection");
  const blueprintName = $("blueprintName");
  const blueprintDescription = $("blueprintDescription");
  const blueprintFeatures = $("blueprintFeatures");
  const blueprintScreens = $("blueprintScreens");
  const buildAppButton = $("buildAppButton");

  const workspaceSection = $("workspaceSection");
  const workspaceTitle = $("workspaceTitle");
  const previewAppName = $("previewAppName");
  const previewHeading = $("previewHeading");
  const previewCards = $("previewCards");

  const buildLog = $("buildLog");
  const editInput = $("editInput");
  const editButton = $("editButton");

  const testButton = $("testButton");
  const exportButton = $("exportButton");

  const chatMessages = $("chatMessages");
  const chatInput = $("chatInput");
  const chatSendButton = $("chatSendButton");

  const projectsContainer = $("projectsContainer");
  const newProjectButton = $("newProjectButton");

  /* ---------- NAVIGATION ---------- */

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      document.querySelectorAll(".page").forEach((section) => {
        section.classList.add("hidden");
      });

      const target = document.getElementById(`${page}Page`);

      if (target) {
        target.classList.remove("hidden");
      }

      document.querySelectorAll("[data-page]").forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      if (page === "projects") {
        renderProjects();
      }
    });
  });

  /* ---------- IDEA COUNTER ---------- */

  if (ideaInput) {
    ideaInput.addEventListener("input", () => {
      ideaCounter.textContent = `${ideaInput.value.length}/2000`;
    });
  }

  /* ---------- FILE INPUTS ---------- */

  const fileInput = $("fileInput");
  const imageInput = $("imageInput");

  document.querySelectorAll("[data-file-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.fileTrigger === "image") {
        imageInput?.click();
      } else {
        fileInput?.click();
      }
    });
  });

  fileInput?.addEventListener("change", () => {
    if (!fileInput.files.length) return;

    Array.from(fileInput.files).forEach((file) => {
      state.attachments.push({
        name: file.name,
        type: file.type
      });
    });

    addLog(`Attached ${fileInput.files.length} file(s).`);
  });

  imageInput?.addEventListener("change", () => {
    if (!imageInput.files.length) return;

    Array.from(imageInput.files).forEach((file) => {
      state.attachments.push({
        name: file.name,
        type: file.type
      });
    });

    addLog(`Added ${imageInput.files.length} reference image(s).`);
  });

  /* ---------- START FORGE ---------- */

  startForgeButton?.addEventListener("click", () => {
    const idea = ideaInput.value.trim();

    if (!idea) {
      alert("First describe the app you want to build.");
      ideaInput.focus();
      return;
    }

    state.idea = idea;

    hideAfter("questionsSection");
    hideAfter("blueprintSection");
    hideAfter("workspaceSection");

    generateQuestions(idea);

    questionsSection?.classList.remove("hidden");

    questionsSection?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  /* ---------- SMART QUESTION ENGINE ---------- */

  function generateQuestions(idea) {
    const lower = idea.toLowerCase();

    const questions = [];

    if (!containsAny(lower, [
      "student",
      "study",
      "school",
      "education",
      "learning"
    ])) {
      questions.push({
        id: "users",
        label: "Who is this app mainly for?",
        options: [
          "Students",
          "Creators",
          "Small businesses",
          "Everyone"
        ]
      });
    }

    if (
      !containsAny(lower, [
        "login",
        "account",
        "sign in",
        "signup",
        "register"
      ])
    ) {
      questions.push({
        id: "accounts",
        label: "Should users have accounts?",
        options: [
          "Yes",
          "No",
          "Not sure"
        ]
      });
    }

    if (
      !containsAny(lower, [
        "mobile",
        "phone",
        "android",
        "web",
        "website"
      ])
    ) {
      questions.push({
        id: "platform",
        label: "Where should the app work?",
        options: [
          "Mobile",
          "Web",
          "Both"
        ]
      });
    }

    questions.push({
      id: "design",
      label: "What kind of design should Forge use?",
      options: [
        "Clean & minimal",
        "Modern & professional",
        "Bold & creative"
      ]
    });

    questions.push({
      id: "extra",
      label: "Is there anything else Forge should know?",
      options: [
        "Keep it simple",
        "Make it advanced",
        "I'll describe it myself"
      ]
    });

    state.questions = questions;

    renderQuestions();
  }

  function renderQuestions() {
    if (!questionsContainer) return;

    questionsContainer.innerHTML = "";

    state.questions.forEach((question, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "question";

      const label = document.createElement("label");
      label.textContent = `${index + 1}. ${question.label}`;

      const options = document.createElement("div");
      options.className = "question-options";

      question.options.forEach((option) => {
        const chip = document.createElement("button");

        chip.type = "button";
        chip.className = "option-chip";
        chip.textContent = option;

        chip.addEventListener("click", () => {
          input.value = option;
          state.answers[question.id] = option;
        });

        options.appendChild(chip);
      });

      const input = document.createElement("input");

      input.className = "question-input";
      input.type = "text";
      input.placeholder = "Type your answer...";

      input.value = state.answers[question.id] || "";

      input.addEventListener("input", () => {
        state.answers[question.id] = input.value;
      });

      wrapper.appendChild(label);
      wrapper.appendChild(options);
      wrapper.appendChild(input);

      questionsContainer.appendChild(wrapper);
    });
  }

  /* ---------- CONTINUE TO BLUEPRINT ---------- */

  continueButton?.addEventListener("click", () => {
    const unanswered = state.questions.filter(
      (question) =>
        !state.answers[question.id] ||
        !state.answers[question.id].trim()
    );

    if (unanswered.length) {
      alert(
        `Please answer: "${unanswered[0].label}"`
      );
      return;
    }

    state.blueprint = createBlueprint();

    renderBlueprint();

    questionsSection?.classList.add("hidden");
    blueprintSection?.classList.remove("hidden");

    blueprintSection?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  /* ---------- BLUEPRINT GENERATOR ---------- */

  function createBlueprint() {
    const name = createAppName(state.idea);

    const description =
      `Forge will build ${name} based on your requirements and answers.`;

    const features = extractFeatures(state.idea);

    const screens = createScreens(state.idea);

    return {
      name,
      description,
      features,
      screens
    };
  }

  function renderBlueprint() {
    if (!state.blueprint) return;

    blueprintName.textContent = state.blueprint.name;
    blueprintDescription.textContent =
      state.blueprint.description;

    blueprintFeatures.innerHTML = "";

    state.blueprint.features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature;
      blueprintFeatures.appendChild(li);
    });

    blueprintScreens.innerHTML = "";

    state.blueprint.screens.forEach((screen) => {
      const li = document.createElement("li");
      li.textContent = screen;
      blueprintScreens.appendChild(li);
    });
  }

  /* ---------- BUILD APP ---------- */

  buildAppButton?.addEventListener("click", () => {
    if (!state.blueprint) return;

    workspaceSection?.classList.remove("hidden");

    workspaceTitle.textContent =
      state.blueprint.name;

    previewAppName.textContent =
      state.blueprint.name;

    previewHeading.textContent =
      getPreviewHeading(state.idea);

    renderPreview();

    addLog("Forge received the blueprint.");
    addLog("Analyzing application structure...");
    addLog("Creating screens...");
    addLog("Connecting app features...");
    addLog("Preparing live preview...");
    addLog("Build complete.");

    saveProject();

    workspaceSection?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  /* ---------- LIVE PREVIEW ---------- */

  function renderPreview() {
    if (!previewCards || !state.blueprint) return;

    previewCards.innerHTML = "";

    state.blueprint.features.forEach((feature) => {
      const card = document.createElement("div");

      card.className = "preview-card";

      const title = document.createElement("h3");
      title.textContent = feature;

      const text = document.createElement("p");
      text.textContent =
        "This feature will be connected to the generated app.";

      text.style.marginTop = "7px";
      text.style.color = "#69746f";
      text.style.fontSize = "0.85rem";

      card.appendChild(title);
      card.appendChild(text);

      previewCards.appendChild(card);
    });
  }

  /* ---------- TEST ---------- */

  testButton?.addEventListener("click", () => {
    addLog("Running Forge app tests...");

    setTimeout(() => {
      addLog("Checking screens...");
    }, 400);

    setTimeout(() => {
      addLog("Checking interactions...");
    }, 800);

    setTimeout(() => {
      addLog("Checking project structure...");
    }, 1200);

    setTimeout(() => {
      addLog("✓ No blocking issues found.");
    }, 1600);
  });

  /* ---------- EDIT APP ---------- */

  editButton?.addEventListener("click", () => {
    const request = editInput?.value.trim();

    if (!request) return;

    addLog(`Edit request: ${request}`);

    applySimpleEdit(request);

    editInput.value = "";

    saveProject();
  });

  function applySimpleEdit(request) {
    const lower = request.toLowerCase();

    if (
      lower.includes("title") ||
      lower.includes("heading") ||
      lower.includes("name")
    ) {
      previewHeading.textContent = request
        .replace(/change|title|heading|name/gi, "")
        .trim() || "Your new app";
    }

    addLog("Forge applied the requested change.");
  }

  /* ---------- EXPORT ---------- */

  exportButton?.addEventListener("click", () => {
    if (!state.blueprint) return;

    const project = {
      name: state.blueprint.name,
      description: state.blueprint.description,
      features: state.blueprint.features,
      screens: state.blueprint.screens,
      originalIdea: state.idea,
      answers: state.answers
    };

    const file = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      `${slugify(state.blueprint.name)}-forge-project.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    addLog("Project exported successfully.");
  });

  /* ---------- AI CHAT ---------- */

  chatSendButton?.addEventListener("click", sendChat);

  chatInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChat();
    }
  });

  function sendChat() {
    const message = chatInput?.value.trim();

    if (!message) return;

    addChatMessage(message, "user");

    chatInput.value = "";

    setTimeout(() => {
      addChatMessage(
        getChatResponse(message),
        "ai"
      );
    }, 350);
  }

  function getChatResponse(message) {
    const lower = message.toLowerCase();

    if (lower.includes("build")) {
      return "Describe the app you want to build in App Builder, and Forge will turn it into requirements and a blueprint.";
    }

    if (lower.includes("project")) {
      return "Your generated projects are saved locally in My Projects.";
    }

    if (lower.includes("help")) {
      return "I can help you define features, screens, user flows, and requirements for your app.";
    }

    return "Got it. Tell me more about what you want the app to do, and Forge can turn those requirements into a build plan.";
  }

  function addChatMessage(text, type) {
    if (!chatMessages) return;

    const message = document.createElement("div");

    message.className =
      `chat-message ${type}`;

    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
      chatMessages.scrollHeight;
  }

  /* ---------- PROJECT STORAGE ---------- */

  function saveProject() {
    if (!state.blueprint) return;

    const projects =
      JSON.parse(
        localStorage.getItem("forgeProjects") || "[]"
      );

    const project = {
      id: Date.now(),
      name: state.blueprint.name,
      description: state.blueprint.description,
      features: state.blueprint.features,
      screens: state.blueprint.screens,
      idea: state.idea,
      answers: state.answers,
      updatedAt: new Date().toISOString()
    };

    projects.unshift(project);

    const uniqueProjects =
      projects.slice(0, 20);

    localStorage.setItem(
      "forgeProjects",
      JSON.stringify(uniqueProjects)
    );

    state.currentProject = project;
  }

  function renderProjects() {
    if (!projectsContainer) return;

    const projects =
      JSON.parse(
        localStorage.getItem("forgeProjects") || "[]"
      );

    projectsContainer.innerHTML = "";

    if (!projects.length) {
      projectsContainer.innerHTML = `
        <div class="project-card">
          <h3>No projects yet</h3>
          <p>Build your first app with Forge.</p>
        </div>
      `;

      return;
    }

    projects.forEach((project) => {
      const card = document.createElement("div");

      card.className = "project-card";

      card.innerHTML = `
        <h3>${escapeHTML(project.name)}</h3>
        <p>${escapeHTML(project.description)}</p>
      `;

      card.addEventListener("click", () => {
        loadProject(project);
      });

      projectsContainer.appendChild(card);
    });
  }

  function loadProject(project) {
    state.idea = project.idea;
    state.answers = project.answers || {};

    state.blueprint = {
      name: project.name,
      description: project.description,
      features: project.features,
      screens: project.screens
    };

    if (ideaInput) {
      ideaInput.value = project.idea;
      ideaCounter.textContent =
        `${project.idea.length}/2000`;
    }

    renderBlueprint();

    blueprintSection?.classList.remove("hidden");

    blueprintSection?.scrollIntoView({
      behavior: "smooth"
    });
  }

  /* ---------- NEW PROJECT ---------- */

  newProjectButton?.addEventListener("click", () => {
    resetForge();

    document
      .querySelector('[data-page="builder"]')
      ?.click();
  });

  function resetForge() {
    state.idea = "";
    state.questions = [];
    state.answers = {};
    state.blueprint = null;
    state.attachments = [];

    if (ideaInput) {
      ideaInput.value = "";
      ideaCounter.textContent = "0/2000";
    }

    hideAfter("questionsSection");
    hideAfter("blueprintSection");
    hideAfter("workspaceSection");

    if (questionsContainer) {
      questionsContainer.innerHTML = "";
    }

    if (buildLog) {
      buildLog.innerHTML = "";
    }
  }

  /* ---------- BUILD LOG ---------- */

  function addLog(text) {
    if (!buildLog) return;

    const item = document.createElement("div");

    item.className = "log-item";

    item.textContent = text;

    buildLog.appendChild(item);

    buildLog.scrollTop =
      buildLog.scrollHeight;
  }

  /* ---------- HELPERS ---------- */

  function containsAny(text, words) {
    return words.some((word) =>
      text.includes(word)
    );
  }

  function createAppName(idea) {
    const words = idea
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3);

    if (!words.length) {
      return "Forge App";
    }

    return words
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }

  function extractFeatures(idea) {
    const lower = idea.toLowerCase();

    const features = [];

    const keywordFeatures = [
      ["login", "User authentication"],
      ["account", "User accounts"],
      ["profile", "User profiles"],
      ["chat", "Messaging / Chat"],
      ["message", "Messaging"],
      ["search", "Search"],
      ["notification", "Notifications"],
      ["task", "Task management"],
      ["todo", "Task management"],
      ["calendar", "Calendar"],
      ["study", "Study tools"],
      ["quiz", "Quiz system"],
      ["progress", "Progress tracking"],
      ["payment", "Payments"],
      ["shop", "Shopping"],
      ["product", "Product management"],
      ["dashboard", "Dashboard"],
      ["upload", "File uploads"],
      ["image", "Image support"]
    ];

    keywordFeatures.forEach(([keyword, feature]) => {
      if (lower.includes(keyword)) {
        if (!features.includes(feature)) {
          features.push(feature);
        }
      }
    });

    if (!features.length) {
      features.push(
        "Main app functionality",
        "User interface",
        "Data management"
      );
    }

    features.push("Responsive design");

    return features.slice(0, 7);
  }

  function createScreens(idea) {
    const lower = idea.toLowerCase();

    const screens = ["Home"];

    if (
      containsAny(lower, [
        "login",
        "account",
        "profile"
      ])
    ) {
      screens.push("Login / Account");
    }

    if (
      containsAny(lower, [
        "dashboard",
        "study",
        "task",
        "todo",
        "progress"
      ])
    ) {
      screens.push("Dashboard");
    }

    if (
      containsAny(lower, [
        "chat",
        "message"
      ])
    ) {
      screens.push("Chat");
    }

    if (
      containsAny(lower, [
        "setting",
        "settings"
      ])
    ) {
      screens.push("Settings");
    }

    screens.push("Main Feature");

    return [...new Set(screens)];
  }

  function getPreviewHeading(idea) {
    const words = idea
      .trim()
      .split(/\s+/)
      .slice(0, 8)
      .join(" ");

    return words || "Your app starts here.";
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHTML(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function hideAfter(id) {
    const element = $(id);

    if (element) {
      element.classList.add("hidden");
    }
  }

  /* ---------- INITIAL STATE ---------- */

  document
    .querySelector('[data-page="builder"]')
    ?.classList.add("active");

  renderProjects();
});
