const form = document.getElementById("signup");
const fields = ["name", "email", "session"].map((id) => document.getElementById(id));

document.getElementById("submit").addEventListener("click", () => {
  let valid = true;
  for (const field of fields) {
    const empty = field.value.trim() === "";
    const badEmail = field.type === "email" && !field.value.includes("@");
    field.classList.toggle("invalid", empty || badEmail);
    if (empty || badEmail) valid = false;
  }
  if (!valid) return;
  form.hidden = true;
  document.getElementById("done").hidden = false;
});
