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

let editTaskId = null;
let todoTasks = [];
const fetchUrl = "https://json-server-j1up.onrender.com/tasks";

// Fetch GET lấy dữ liệu ban đầu từ json-server
fetch(fetchUrl)
  .then((res) => res.json())
  .then((data) => {
    todoTasks = data;
    filter();
  })
  .catch((err) => console.error(err));

const FilterMode = Object.freeze({
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
});
let filterMode = FilterMode.ALL;

// fuction
// Hiện modal
function openModal() {
  addTaskModal.className = "modal-overlay show";
}
// Ấn modal
function hideModal() {
  addTaskModal.className = "modal-overlay";
  form.reset();
  modalTitle.innerText = "Add New Task";
  submitBtn.innerText = "Create Task";
  modal.scrollTo({ top: 0 });
}

// Render và hiển thị task lên màn hình
function renderTasks(bln = true, msg = "Chưa có công việc nào.") {
  if (!todoTasks.length || !bln) {
    taskGrid.innerHTML = `
            <p>${msg}</p>
        `;
    return;
  } else {
    todoTasks.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
    const html = todoTasks
      .map(
        (task) => `
        <div class="task-card ${task.color} ${
          task.isCompleted ? "completed" : ""
        } ${task.isHidden ? "hiddenTask" : ""}">
        <div class="task-header">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
          <button class="task-menu">
            <i class="fa-solid fa-ellipsis fa-icon"></i>
            <div class="dropdown-menu">
              <div class="dropdown-item edit-btn" data-id="${task.id}">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
              </div>
              <div class="dropdown-item complete-btn" data-id="${task.id}">
                <i class="fa-solid fa-check fa-icon"></i>
                ${task.isCompleted ? "Mark as Active" : "Mark as Complete"} 
              </div>
              <div class="dropdown-item delete delete-btn" data-id="${task.id}">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
              </div>
            </div>
          </button>
        </div>
        <p class="task-description">${escapeHTML(task.description)}</p>
        <div class="task-time">${task.startTime} - ${task.endTime}</div>
      </div>
    `
      )
      .join("");

    taskGrid.innerHTML = html;
  }
}

// phòng ngừa xss
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Phương thức lọc dữ liệu
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

// Sự kiện gửi form
form.onsubmit = (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(form));
  if (!editTaskId) {
    const isExistTitle = todoTasks.some(
      (item) => item.title === formData.title
    );
    if (isExistTitle) {
      alert("Title này đã tồn tại. Vùi lòng đặt title khác.");
      $("#taskTitle").focus();
      return;
    }
  }

  // Nếu là edit mode
  if (editTaskId) {
    const index = todoTasks.findIndex((task) => task.id == editTaskId);
    const isCompleted = todoTasks[index].isCompleted;
    const isHidden = todoTasks[index].isHidden;
    todoTasks[index] = formData;
    todoTasks[index].isCompleted = isCompleted;
    todoTasks[index].id = editTaskId;
    formData.isHidden = isHidden;
    formData.updateTime = new Date().toISOString();
    // fetch put để sửa dữ liệu json-server tại id
    fetch(`${fetchUrl}/${editTaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoTasks[index]),
    })
      .then((res) => res.json())
      .then((data) => {
        form.reset();
        renderTasks();
        hideModal();
      })
      .catch((err) => console.error(err));
  } else {
    // Nếu là tạo mới
    formData.isCompleted = false;
    if (filterMode === FilterMode.COMPLETED) {
      formData.isHidden = true;
    } else {
      formData.isHidden = false;
    }

    formData.updateTime = new Date().toISOString();

    todoTasks.unshift(formData);
    // fetch post để tạo mới dữ liệu
    fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        form.reset();
        renderTasks();
      })
      .catch((err) => console.error(err));
  }
};

taskGrid.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");

  // Sự kiện nhấn nút edit
  if (editBtn) {
    const taskId = editBtn.dataset.id;
    const task = todoTasks.find(
      (t) => t && t.id.toString() === taskId.toString()
    );
    editTaskId = taskId;
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
  // Sự kiện nhấn nút del
  if (deleteBtn) {
    const taskId = deleteBtn.dataset.id;
    const taskIndex = todoTasks.findIndex(
      (t) => t && t.id.toString() === taskId.toString()
    );
    // fetch Del để xóa dữ liệu với id
    fetch(`${fetchUrl}/${taskId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Xoá thất bại");
        todoTasks.splice(taskIndex, 1);
        renderTasks();
      })
      .catch((err) => {
        console.error("Lỗi khi xoá task:", err);
      });
  }
  // Sự kiện nhấn nút completed
  if (completeBtn) {
    const taskId = completeBtn.dataset.id;
    const task = todoTasks.find(
      (t) => t && t.id.toString() === taskId.toString()
    );
    task.isCompleted = !task.isCompleted;
    task.updateTime = new Date().toISOString();
    // fetch put để sửa dữ liệu tại id
    fetch(`${fetchUrl}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    })
      .then((res) => res.json())
      .then((data) => {
        filter(filterMode);
        renderTasks();
      })
      .catch((err) => console.error(err));
  }
};

// Sự kiện nhập vào hộp tìm kiếm
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

// Lọc các task chưa hoàn thành
activeFilterBtn.onclick = function () {
  if (this.classList.contains("active")) {
    this.classList.remove("active");
    filterMode = FilterMode.ALL;
  } else {
    this.classList.add("active");
    completedFilterBtn.classList.remove("active");
    filterMode = FilterMode.ACTIVE;
  }
  filter(filterMode);
};

// Lọc các task đã hoàn thành
completedFilterBtn.onclick = function () {
  if (this.classList.contains("active")) {
    this.classList.remove("active");
    filterMode = FilterMode.ALL;
  } else {
    this.classList.add("active");
    activeFilterBtn.classList.remove("active");
    filterMode = FilterMode.COMPLETED;
  }
  filter(filterMode);
};

filter();
