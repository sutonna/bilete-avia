const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnUc8DNvqS0wVtvVMJz5WOYFOEQr5xcPnzj4-zCIYcXFRqNu1bhL6PDIuwlSs7ydzEXQ/exec";

const dateInput = document.querySelector("#callDate");
const dateDisplay = document.querySelector("#dateDisplay");
const dateControl = document.querySelector(".date-control");
const timeValueInput = document.querySelector("#callTimeValue");
const timePeriodInput = document.querySelector("#callTimePeriod");
const form = document.querySelector("#bookingForm");
const result = document.querySelector("#result");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

dateControl.addEventListener("click", openDatePicker);
dateControl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDatePicker();
  }
});
dateInput.addEventListener("change", updateDateDisplay);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const submitButton = form.querySelector("button");
  data.set("callTime", `${timeValueInput.value.trim()} ${timePeriodInput.value}`);
  data.delete("callTimeValue");
  data.delete("callTimePeriod");

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
  resetDateField();
  resetButton(submitButton);
});

function resetButton(button) {
  button.disabled = false;
  button.textContent = "Confirma programarea";
}

function showMessage(message) {
  result.innerHTML = message;
  result.classList.add("show");

  setTimeout(() => {
    result.style.transition = "none";
    result.classList.remove("show");
    result.innerHTML = "";

    requestAnimationFrame(() => {
      result.style.transition = "";
    });
  }, 2000);
}

function updateDateDisplay() {
  if (!dateInput.value) {
    resetDateField();
    return;
  }

  const date = new Date(`${dateInput.value}T12:00:00`);

  dateDisplay.textContent = new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
  dateControl.classList.add("has-value");
}

function resetDateField() {
  dateInput.min = `${yyyy}-${mm}-${dd}`;
  dateDisplay.textContent = "Data";
  dateControl.classList.remove("has-value");
}

function openDatePicker() {
  try {
    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }
  } catch (error) {
    dateInput.focus();
  }

  dateInput.focus();
}
