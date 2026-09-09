const ideaInput = document.getElementById("ideaInput");
const forgeButton = document.getElementById("forgeButton");
const counter = document.querySelector(".counter");
const result = document.getElementById("result");
const resultContent = document.getElementById("resultContent");

ideaInput.addEventListener("input", () => {
  counter.textContent = `${ideaInput.value.length} / 1000`;
});

forgeButton.addEventListener("click", () => {
  const idea = ideaInput.value.trim();

  if (!idea) {
    result.classList.remove("hidden");
    resultContent.innerHTML = `
      <p>Give me an app idea first ⚡</p>
    `;
    return;
  }

  if (idea.length < 15) {
    result.classList.remove("hidden");
    resultContent.innerHTML = `
      <h3>Your idea needs a little more detail.</h3>
      <p style="margin-top:10px;color:#999;">
        FORGE needs answers to these questions:
      </p>
      <ul style="margin-top:12px;padding-left:20px;line-height:1.8;">
        <li>Who is the app for?</li>
        <li>What problem does it solve?</li>
        <li>What is the main feature?</li>
      </ul>
    `;
    return;
  }

  result.classList.remove("hidden");

  resultContent.innerHTML = `
    <h3>App Concept</h3>
    <p style="margin-top:8px;color:#ccc;">${idea}</p>

    <h3 style="margin-top:22px;">Target Users</h3>
    <p style="margin-top:8px;color:#999;">
      People who would benefit from the problem described in your idea.
    </p>

    <h3 style="margin-top:22px;">Core Features</h3>
    <ul style="margin-top:8px;padding-left:20px;line-height:1.8;color:#ccc;">
      <li>Main feature based on your idea</li>
      <li>Simple user dashboard</li>
      <li>Progress / activity tracking</li>
      <li>Personalized experience</li>
    </ul>

    <h3 style="margin-top:22px;">FORGE Upgrades ⚡</h3>
    <ul style="margin-top:8px;padding-left:20px;line-height:1.8;color:#ccc;">
      <li>AI-powered personalization</li>
      <li>Gamification and XP</li>
      <li>Smart recommendations</li>
      <li>Analytics and progress insights</li>
    </ul>

    <h3 style="margin-top:22px;">Suggested Screens</h3>
    <p style="margin-top:8px;color:#999;">
      Home • Dashboard • Main Feature • Progress • Settings
    </p>
  `;

  result.scrollIntoView({ behavior: "smooth" });
});
