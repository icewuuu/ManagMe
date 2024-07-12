import { deleteTaskApi } from "../../services/requestHelper";
import { Task } from "../../models/taskModel";

import {
  createEditTaskModal,
  createTaskModal,
  showModalWithTasksForStory,
} from "./modalTasks";

export function editTask(task: Task): void {
  const modal = createEditTaskModal(task);
  if (modal) {
    document.body.appendChild(modal);
  }
}

export function deleteTask(taskId: string, storyId: string): void {
  deleteTaskApi(taskId);
  showModalWithTasksForStory(storyId);
}

export function createTask(storyId: string): void {
  const modal = createTaskModal(storyId);
  if (modal) {
    document.body.appendChild(modal);
  }
}
