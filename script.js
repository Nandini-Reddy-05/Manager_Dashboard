const taskInput = document.getElementById("taskInput");
const statusSelect = document.getElementById("statusSelect");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTask");

let tasks = JSON.parse(localStorage.getItem("pm25Tasks")) || [];

let statusChart, priorityChart;

// Add Task
addTaskBtn.addEventListener("click", () => {
    const title = taskInput.value.trim();
    if (!title) return;

    tasks.push({
        id: Date.now(),
        title,
        status: statusSelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value
    });

    taskInput.value = "";
    dueDateInput.value = "";
    saveAndRender();
});

function saveAndRender() {
    localStorage.setItem("pm25Tasks", JSON.stringify(tasks));
    renderTasks("all");
    updateStats();
    updateCharts();
}

// Render Tasks
function renderTasks(filter) {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    tasks
        .filter(task => filter === "all" || task.status === filter)
        .forEach(task => {
            const overdue =
                task.dueDate &&
                task.dueDate < today &&
                task.status !== "completed";

            const div = document.createElement("div");
            div.className = "task-item";

            div.innerHTML = `
                <span>
                    ${task.title}
                    (${task.status}, ${task.priority})
                    ${task.dueDate ? "- Due: " + task.dueDate : ""}
                    ${overdue ? " ⚠ Overdue" : ""}
                </span>
                <button onclick="deleteTask(${task.id})">Delete</button>
            `;

            list.appendChild(div);
        });
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// Filter Tasks
function filterTasks(status) {
    renderTasks(status);
}

// Update Analytics Stats
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const overdue = tasks.filter(t => {
        const today = new Date().toISOString().split("T")[0];
        return t.dueDate && t.dueDate < today && t.status !== "completed";
    }).length;

    const percent = total ? ((completed / total) * 100).toFixed(1) : 0;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("completionRate").textContent = percent + "%";
}

// Update Charts
function updateCharts() {
    const todo = tasks.filter(t => t.status === "todo").length;
    const progress = tasks.filter(t => t.status === "progress").length;
    const completed = tasks.filter(t => t.status === "completed").length;

    const low = tasks.filter(t => t.priority === "Low").length;
    const medium = tasks.filter(t => t.priority === "Medium").length;
    const high = tasks.filter(t => t.priority === "High").length;

    if (statusChart) statusChart.destroy();
    if (priorityChart) priorityChart.destroy();

    // 🔹 SMALL BAR CHART CONFIG
    statusChart = new Chart(document.getElementById("statusChart"), {
        type: "bar",
        data: {
            labels: ["To Do", "In Progress", "Completed"],
            datasets: [{
                label: "Tasks",
                data: [todo, progress, completed],
                backgroundColor: ["#ff9800", "#2196f3", "#4caf50"],
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // 🔹 DOUGHNUT CHART
    priorityChart = new Chart(document.getElementById("priorityChart"), {
        type: "doughnut",
        data: {
            labels: ["Low", "Medium", "High"],
            datasets: [{
                data: [low, medium, high],
                backgroundColor: ["#4caf50", "#ff9800", "#f44336"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

saveAndRender();
