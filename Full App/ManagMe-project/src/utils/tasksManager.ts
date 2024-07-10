import { Task } from "../models/taskModel";
import ProjectAPI from "../services/api";
import {
  createEditTaskModal,
  createTaskModal,
  showModalWithTasksForStory,
} from "./modal";
import { selectedProjectId } from "./projectsManager";

const projectAPI = new ProjectAPI();
const kanban = document.getElementById("kanban-board")!;

export function editTask(task: Task): void {
  const modal = createEditTaskModal(task);
  if (modal) {
    document.body.appendChild(modal);
  }
}

export function deleteTask(taskId: string, storyId: string): void {
  projectAPI.deleteTask(taskId);
  showModalWithTasksForStory(storyId);
}

export function createTask(storyId: string): void {
  const modal = createTaskModal(storyId);
  if (modal) {
    document.body.appendChild(modal);
  }
}

export function displayTasksForCurrentProject(): void {
  const projectId = selectedProjectId; // Assuming selectedProjectId is defined and managed elsewhere
  if (!projectId) return;

  const tasks: Task[] | null = projectAPI.getTasksByProjectId(projectId);
  kanban.style.display =
    tasks !== null && tasks !== undefined && tasks.length > 0 ? "flex" : "none";

  const todoContainer = document.getElementById("Todo-tasks")!;
  const doingContainer = document.getElementById("Doing-tasks")!;
  const doneContainer = document.getElementById("Done-tasks")!;

  if (!tasks || !todoContainer || !doingContainer || !doneContainer) return;

  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  tasks.forEach((task: Task) => {
    const taskCard = document.createElement("div");
    taskCard.id = task.id;
    taskCard.classList.add("task-card");
    taskCard.draggable = true;
    taskCard.addEventListener("dragstart", (event) => {
      if (event.dataTransfer) {
        event.dataTransfer.setData("text/plain", task.id);
      }
    });
    taskCard.innerHTML = `
      <strong>${task.name}</strong><br>
      ${task.description}<br>
      Priority: ${task.priority}<br>
    `;

    if (task.status === "Todo") {
      todoContainer.appendChild(taskCard);
    } else if (task.status === "Doing") {
      doingContainer.appendChild(taskCard);
    } else if (task.status === "Done") {
      doneContainer.appendChild(taskCard);
    }
  });
}
