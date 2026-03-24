const scheduleListEl = document.getElementById("scheduleList");

if (scheduleListEl) {
  scheduleListEl.innerHTML = "";
  const msg = document.createElement("div");
  msg.className = "text-sm text-gray-500";
  msg.textContent = "No scheduled streams yet.";
  scheduleListEl.appendChild(msg);
}
