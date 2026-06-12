const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnUc8DNvqS0wVtvVMJz5WOYFOEQr5xcPnzj4-zCIYcXFRqNu1bhL6PDIuwlSs7ydzEXQ/exec";

const dateInput = document.querySelector("#callDate");
const form = document.querySelector("#bookingForm");
const result = document.querySelector("#result");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const submitButton = form.querySelector("button");

  submitButton.disabled = true;
  submitButton.textContent = "Se trimite...";

  try {
    data.append("createdAt", new Date().toISOString());

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: data
    });
  } catch (error) {
    showMessage(`
      <strong>Programarea nu a putut fi trimisa.</strong><br>
      Te rugam sa verifici conexiunea la internet si sa incerci din nou.
    `);
    resetButton(submitButton);
    return;
  }

  showMessage("<strong>Programarea a fost inregistrata.</strong>");
  form.reset();
  dateInput.min = `${yyyy}-${mm}-${dd}`;
  resetButton(submitButton);
});

function resetButton(button) {
  button.disabled = false;
  button.textContent = "Confirma programarea";
}

function showMessage(message) {
  result.classList.add("show");
  result.innerHTML = message;

  setTimeout(() => {
    result.classList.remove("show");
    result.innerHTML = "";
  }, 2000);
}
