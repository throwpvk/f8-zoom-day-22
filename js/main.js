const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const cancelBtn = $(".cancelBtn");
const submitBtn = $(".submitBtn");
const modalCloseBtn = $(".modal-close");
const modal = $(".modal");
const taskGrid = $(".task-grid");
const form = $(".todo-app-form");
const modalTitle = $(".modal-title");
const searchInput = $(".search-input");
const activeFilterBtn = $(".active-task-btn");
const completedFilterBtn = $(".completed-task-btn");

let editIndex = null;
let todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];
const FilterMode = Object.freeze({
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
});
let filterMode = FilterMode.ALL;

// fuction
function openModal() {
  addTaskModal.className = "modal-overlay show";
}
function hideModal() {
  addTaskModal.className = "modal-overlay";
  form.reset();
  modalTitle.innerText = "Add New Task";
  submitBtn.innerText = "Create Task";
  modal.scrollTo({ top: 0 });
}
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}
function renderTasks(bln = true, msg = "Chưa có công việc nào.") {
  if (!todoTasks.length || !bln) {
    taskGrid.innerHTML = `
            <p>${msg}</p>
        `;
    return;
  } else {
    const html = todoTasks
      .map(
        (task, index) => `
        <div class="task-card ${task.color} ${
          task.isCompleted ? "completed" : ""
        } ${task.isHidden ? "hiddenTask" : ""}">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <button class="task-menu">
            <i class="fa-solid fa-ellipsis fa-icon"></i>
            <div class="dropdown-menu">
              <div class="dropdown-item edit-btn" data-index="${index}">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
              </div>
              <div class="dropdown-item complete-btn" data-index="${index}">
                <i class="fa-solid fa-check fa-icon"></i>
                ${task.isCompleted ? "Mark as Active" : "Mark as Complete"} 
              </div>
              <div class="dropdown-item delete delete-btn" data-index="${index}">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
              </div>
            </div>
          </button>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-time">${task.startTime} - ${task.endTime}</div>
      </div>
    `
      )
      .join("");

    taskGrid.innerHTML = html;
  }
}

function filter(mode) {
  let hasFilterTask = false;
  todoTasks.map((task) => (task.isHidden = false));
  if (mode === FilterMode.COMPLETED) {
    todoTasks.map((task) => {
      if (task.isCompleted === false) {
        task.isHidden = true;
      } else {
        hasFilterTask = true;
      }
    });
    renderTasks(hasFilterTask, "Không có task nào đã hoàn thành.");
  } else if (mode === FilterMode.ACTIVE) {
    todoTasks.map((task) => {
      if (task.isCompleted === true) {
        task.isHidden = true;
      } else {
        hasFilterTask = true;
      }
    });
    renderTasks(hasFilterTask, "Không có task nào đang thực hiện");
  } else {
    renderTasks();
  }
}

// event
addBtn.onclick = openModal;
cancelBtn.onclick = hideModal;
modalCloseBtn.onclick = hideModal;
addTaskModal.onclick = function (e) {
  if (e.target.id === "addTaskModal") {
    hideModal();
  }
};
modal.addEventListener("transitionend", function (e) {
  if (e.target === modal && addTaskModal.classList.contains("show")) {
    $("#taskTitle").focus();
  }
});

form.onsubmit = (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(form));
  const isExistTitle = todoTasks.some((item) => item.title === formData.title);
  if (isExistTitle) {
    alert("Title này đã tồn tại. Vùi lòng đặt title khác.");
    $("#taskTitle").focus();
    return;
  }

  if (editIndex) {
    const isCompleted = todoTasks[editIndex].isCompleted;
    const isHidden = todoTasks[editIndex].isHidden;
    todoTasks[editIndex] = formData;
    todoTasks[editIndex].isCompleted = isCompleted;
    formData.isHidden = isHidden;
    hideModal();
  } else {
    formData.isCompleted = false;
    formData.isHidden = false;
    todoTasks.unshift(formData);
  }
  saveTasks();
  form.reset();
  renderTasks();
};

taskGrid.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");
  if (editBtn) {
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];
    editIndex = taskIndex;
    for (key in task) {
      const value = task[key];
      const input = $(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    }
    modalTitle.innerText = "Edit Task";
    submitBtn.innerText = "Save Task";
    openModal();
  }
  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    todoTasks.splice(taskIndex, 1);
    saveTasks();
    renderTasks();
  }
  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index;
    const task = todoTasks[taskIndex];
    task.isCompleted = !task.isCompleted;
    saveTasks();
    renderTasks();
  }
};

searchInput.oninput = function () {
  const keyword = searchInput.value.toLowerCase().trim();
  let hasFilterTask = false;
  todoTasks.map((task) => (task.isHidden = false));

  todoTasks.map((task) => {
    if (!task.title.includes(keyword) && !task.description.includes(keyword)) {
      task.isHidden = true;
    } else {
      hasFilterTask = true;
    }
  });
  renderTasks(hasFilterTask, "Không tìm thấy.");
};

activeFilterBtn.onclick = function () {
  if (this.classList.contains("active")) {
    this.classList.remove("active");
    filterMode = FilterMode.ALL;
  } else {
    this.classList.add("active");
    if (completedFilterBtn.classList.contains("active")) {
      completedFilterBtn.classList.remove("active");
    }
    filterMode = FilterMode.ACTIVE;
  }
  filter(filterMode);
};

completedFilterBtn.onclick = function () {
  if (this.classList.contains("active")) {
    this.classList.remove("active");
    filterMode = FilterMode.ALL;
  } else {
    this.classList.add("active");
    if (activeFilterBtn.classList.contains("active")) {
      activeFilterBtn.classList.remove("active");
    }
    filterMode = FilterMode.COMPLETED;
  }
  filter(filterMode);
};

filter();
