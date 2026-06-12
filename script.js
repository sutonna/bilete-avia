const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnUc8DNvqS0wVtvVMJz5WOYFOEQr5xcPnzj4-zCIYcXFRqNu1bhL6PDIuwlSs7ydzEXQ/exec";

const dateInput = document.querySelector("#callDate");
const dateDisplay = document.querySelector("#dateDisplay");
const dateControl = document.querySelector(".date-control");
const calendarPopover = document.querySelector("#calendarPopover");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarMonth = document.querySelector("#calendarMonth");
const calendarYear = document.querySelector("#calendarYear");
const prevMonthButton = document.querySelector("#prevMonth");
const nextMonthButton = document.querySelector("#nextMonth");
const timeValueInput = document.querySelector("#callTimeValue");
const timePeriodInput = document.querySelector("#callTimePeriod");
const form = document.querySelector("#bookingForm");
const result = document.querySelector("#result");

const today = new Date();
today.setHours(0, 0, 0, 0);
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
let calendarView = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = null;

renderCalendar();

dateControl.addEventListener("click", toggleCalendar);
dateControl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleCalendar();
  }
});
prevMonthButton.addEventListener("click", () => changeMonth(-1));
nextMonthButton.addEventListener("click", () => changeMonth(1));
document.addEventListener("click", closeCalendarOnOutsideClick);
document.addEventListener("keydown", closeCalendarOnEscape);
timeValueInput.addEventListener("input", formatTimeInput);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const submitButton = form.querySelector("button");

  if (!dateInput.value) {
    showMessage("<strong>Alege data apelului.</strong>");
    dateControl.focus();
    calendarPopover.classList.add("open");
    return;
  }

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

function updateDateDisplay(date) {
  dateDisplay.textContent = new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
  dateControl.classList.add("has-value");
}

function resetDateField() {
  selectedDate = null;
  dateInput.value = "";
  dateDisplay.textContent = "Data";
  dateControl.classList.remove("has-value");
  renderCalendar();
}

function formatTimeInput() {
  const digits = timeValueInput.value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    timeValueInput.value = digits;
    return;
  }

  timeValueInput.value = `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function toggleCalendar() {
  calendarPopover.classList.toggle("open");
}

function closeCalendar() {
  calendarPopover.classList.remove("open");
}

function closeCalendarOnOutsideClick(event) {
  if (!event.target.closest(".date-field")) {
    closeCalendar();
  }
}

function closeCalendarOnEscape(event) {
  if (event.key === "Escape") {
    closeCalendar();
  }
}

function changeMonth(offset) {
  calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() + offset, 1);
  renderCalendar();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const monthStart = new Date(calendarView.getFullYear(), calendarView.getMonth(), 1);
  const monthEnd = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 0);
  const firstWeekday = (monthStart.getDay() + 6) % 7;

  calendarMonth.textContent = new Intl.DateTimeFormat("ro-RO", { month: "long" }).format(monthStart);
  calendarYear.textContent = monthStart.getFullYear();

  for (let i = 0; i < firstWeekday; i += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "calendar-empty";
    calendarGrid.append(emptyCell);
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const date = new Date(calendarView.getFullYear(), calendarView.getMonth(), day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = day;

    if (isSameDate(date, today)) {
      button.classList.add("today");
    }

    if (selectedDate && isSameDate(date, selectedDate)) {
      button.classList.add("selected");
    }

    if (date < today) {
      button.classList.add("is-disabled");
      button.disabled = true;
    } else {
      button.addEventListener("click", () => selectDate(date));
    }

    calendarGrid.append(button);
  }
}

function selectDate(date) {
  selectedDate = date;
  dateInput.value = toDateValue(date);
  updateDateDisplay(date);
  renderCalendar();
  closeCalendar();
}

function isSameDate(firstDate, secondDate) {
  return firstDate.getFullYear() === secondDate.getFullYear()
    && firstDate.getMonth() === secondDate.getMonth()
    && firstDate.getDate() === secondDate.getDate();
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
