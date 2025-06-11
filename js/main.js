const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const cancelBtn = $(
  "#addTaskModal > div > div.modal-footer > button.btn.btn-secondary"
);
const submitBtn = $(
  "#addTaskModal > div > div.modal-footer > button.btn.btn-primary"
);
const modal = $(".modal");
const taskGrid = $(".task-grid");
const form = $(".todo-app-form");

let todoTasks = [];
let isEdit = false;
let editTaskIndex = -1;
let editTaskId = -1;

// event
window.addEventListener("load", function () {
  taskGrid.innerHTML = "";
  console.log(taskGrid);
  todoTasks = [
    {
      id: 0,
      title: "Gửi tặng anh em F8 1 tỷ",
      description: "Tiền nhiều quá tiêu không hết, nhờ anh em F8 tiêu giúp.",
      category: "planning",
      priority: "high",
      startTime: "09:00",
      endTime: "10:00",
      dueDate: "2025-06-11",
      cardColor: "yellow",
      isCompleted: false,
    },
    {
      id: 1,
      title: "Làm bài tập F8",
      description: "Làm không nổi thì thôi cũng được",
      category: "planning",
      priority: "high",
      startTime: "11:00",
      endTime: "12:00",
      dueDate: "2025-06-11",
      cardColor: "green",
      isCompleted: false,
    },
    {
      id: 2,
      title: "Dắt chó đi dạo",
      description: "Không có chó",
      category: "planning",
      priority: "high",
      startTime: "18:00",
      endTime: "19:00",
      dueDate: "2025-06-11",
      cardColor: "pink",
      isCompleted: false,
    },
  ];
  renderTasks();
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
});

addBtn.onclick = function () {
  addTaskModal.className = "modal-overlay show";
};

cancelBtn.onclick = function () {
  form.reset();
  addTaskModal.className = "modal-overlay";
  resetEditData();
};

addTaskModal.onclick = function (e) {
  if (e.target.id === "addTaskModal") {
    form.reset();
    addTaskModal.className = "modal-overlay";
    resetEditData();
  }
};

modal.addEventListener("transitionend", function (e) {
  if (e.target === modal && addTaskModal.classList.contains("show")) {
    console.log("focus");
    $("#taskTitle").focus();
  }
});

submitBtn.onclick = function () {
  if (isEdit) {
    submit(editTaskId, editTaskIndex);
  } else {
    submit();
  }
  renderTasks();
};

// fuction
function submit(editTaskId = -1, taskIndex = -1) {
  const taskTitle = $("#taskTitle");
  const taskDescription = $("#taskDescription");
  const taskCategory = $("#taskCategory");
  const taskPriority = $("#taskPriority");
  const startTime = $("#startTime");
  const endTime = $("#endTime");
  const taskDate = $("#taskDate");
  const taskColor = $("#taskColor");

  if (isEdit && taskIndex >= 0 && editTaskId >= 0) {
    todoTasks[taskIndex].title = taskTitle.value;
    todoTasks[taskIndex].description = taskDescription.value;
    todoTasks[taskIndex].category = taskCategory.value.toLowerCase();
    todoTasks[taskIndex].priority = taskPriority.value.toLowerCase();
    todoTasks[taskIndex].startTime = startTime.value;
    todoTasks[taskIndex].endTime = endTime.value;
    todoTasks[taskIndex].dueDate = taskDate.value;
    todoTasks[taskIndex].cardColor = taskColor.value.toLowerCase();
    todoTasks[taskIndex].isCompleted = false;

    addTaskModal.className = "modal-overlay";
  } else {
    let newTask = {
      id: todoTasks.length,
      title: taskTitle.value,
      description: taskDescription.value,
      category: taskCategory.value,
      priority: taskPriority.value,
      startTime: startTime.value,
      endTime: endTime.value,
      dueDate: taskDate.value,
      cardColor: taskColor.value,
      isCompleted: false,
    };

    todoTasks.unshift(newTask);
  }

  console.log(todoTasks);
  form.reset();
  resetEditData();
}

function renderTasks() {
  let html = "";
  if (todoTasks.length > 0) {
    todoTasks.map((task) => {
      html += `
        <div class="task-card ${task.cardColor} ${
        task.isCompleted ? "completed" : ""
      }">
          <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <button class="task-menu">
              <i class="fa-solid fa-ellipsis fa-icon"></i>
              <div class="dropdown-menu">
                <div class="dropdown-item edit" onclick="editTask(${task.id})">
                  <i class="fa-solid fa-pen-to-square fa-icon"></i>
                  Edit
                </div>
                <div class="dropdown-item complete" onclick="markAsComplete(${
                  task.id
                })">
                  <i class="fa-solid fa-check fa-icon"></i>
                  Mark as Active
                </div>
                <div class="dropdown-item delete" onclick="deleteTask(${
                  task.id
                })">
                  <i class="fa-solid fa-trash fa-icon"></i>
                  Delete
                </div>
              </div>
            </button>
          </div>
          <p class="task-description">
            ${task.description}
          </p>
          <div class="task-time">${task.startTime} - ${task.endTime}</div>
        </div>
        `;
    });
  }
  taskGrid.innerHTML = html;
}

function editTask(taskId) {
  const index = todoTasks.findIndex((task) => task.id === taskId);
  if (index !== -1) {
    setEditData(taskId, index);
    addTaskModal.className = "modal-overlay show";

    const taskTitle = $("#taskTitle");
    const taskDescription = $("#taskDescription");
    const taskCategory = $("#taskCategory");
    const taskPriority = $("#taskPriority");
    const startTime = $("#startTime");
    const endTime = $("#endTime");
    const taskDate = $("#taskDate");
    const taskColor = $("#taskColor");

    taskTitle.value = todoTasks[index].title;
    taskDescription.value = todoTasks[index].description;
    taskCategory.value = todoTasks[index].category.toLowerCase();
    taskPriority.value = todoTasks[index].priority.toLowerCase();
    startTime.value = todoTasks[index].startTime;
    endTime.value = todoTasks[index].endTime;
    taskDate.value = todoTasks[index].dueDate;
    taskColor.value = todoTasks[index].cardColor.toLowerCase();
  }
  console.log("edit task" + taskId);
}
function markAsComplete(taskId) {
  const index = todoTasks.findIndex((task) => task.id === taskId);
  if (index !== -1) {
    todoTasks[index].isCompleted = true;
    renderTasks();
  }
  console.log("complete task" + taskId);
}

function deleteTask(taskId) {
  const index = todoTasks.findIndex((task) => task.id === taskId);
  if (index !== -1) {
    todoTasks.splice(index, 1);
    renderTasks();
  }
  console.log("delete task" + taskId);
}

function setEditData(id, index) {
  isEdit = true;
  editTaskId = id;
  editTaskIndex = index;
}

function resetEditData() {
  isEdit = false;
  editTaskId = -1;
  editTaskIndex = -1;
}
