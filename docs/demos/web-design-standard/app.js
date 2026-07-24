const icons = window.lucide;
icons.createIcons({ attrs: { "stroke-width": 1.8 } });

const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector(".menu-button");
const modal = document.querySelector("#project-modal");
const form = document.querySelector("#project-form");
const projectName = document.querySelector("#project-name");
const nameError = document.querySelector("#name-error");
const rows = document.querySelector("#project-rows");
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    modal.showModal();
    projectName.focus();
  });
});

menuButton.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    let visible = 0;
    rows.querySelectorAll("tr").forEach((row) => {
      const show = filter === "all" || row.dataset.status === filter;
      row.hidden = !show;
      visible += Number(show);
    });
    emptyState.hidden = visible > 0;
  });
});

document.querySelector("#refresh-projects").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.querySelector("span").textContent = "刷新中";
  button.querySelector("svg").classList.add("spin");
  window.setTimeout(() => {
    button.disabled = false;
    button.querySelector("span").textContent = "刷新";
    button.querySelector("svg").classList.remove("spin");
  }, 700);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = projectName.value.trim();
  projectName.setAttribute("aria-invalid", String(!name));
  nameError.hidden = Boolean(name);
  if (!name) {
    projectName.focus();
    return;
  }

  const owner = document.querySelector("#project-owner").value;
  rows.insertAdjacentHTML("afterbegin", `<tr data-status="active"><td><strong>${escapeHtml(name)}</strong><small>刚刚创建</small></td><td><span class="member"><span class="avatar avatar-blue">LW</span>${escapeHtml(owner)}</span></td><td><span class="status status-active">进行中</span></td><td>补充项目简报</td><td>刚刚</td><td><button class="row-action" type="button" aria-label="查看 ${escapeHtml(name)}"><i data-lucide="arrow-up-right"></i></button></td></tr>`);
  icons.createIcons({ attrs: { "stroke-width": 1.8 } });
  form.reset();
  modal.close();
  emptyState.hidden = true;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 3600);
});

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
