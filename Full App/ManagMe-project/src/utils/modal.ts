import Project from "../models/projectModel";
import { Story, StoryStatus, StoryPriority } from "../models/storyModel";
import { Task, TaskPriority, TaskStatus } from "../models/taskModel";
import ProjectAPI from "../services/api";
import {
  createButton,
  createLabeledInputElement,
  createLabeledOptionElement,
} from "../utils/domOperations";
import { currentUser } from "../views/main";
import { displayProjects, selectedProjectId } from "./projectsManager";
import { editTask, deleteTask } from "./tasksManager";
import UserDB from "../db/users";
import { displayStoriesForCurrentProject } from "./storiesManager";

const projectAPI = new ProjectAPI();

export function createEditModal(project: Project): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-project-form";

  const nameEdit = createLabeledInputElement(
    "text",
    "project-input",
    project.name,
    "Name: "
  );
  const descriptionEdit = createLabeledInputElement(
    "text",
    "project-input",
    project.description,
    "Description: "
  );

  const saveButton = createButton("Save", "modal-button", () => {
    const nameInputElement = nameEdit.querySelector("input");
    const descriptionInputElement = descriptionEdit.querySelector("input");
    project.name = nameInputElement ? nameInputElement.value : "";
    project.description = descriptionInputElement
      ? descriptionInputElement.value
      : "";
    projectAPI.updateProject(project);
    modal.remove();
    displayProjects();
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(nameEdit, descriptionEdit);
  modalContent.append(form, saveButton, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}

export function createEditTaskModal(task: Task): HTMLDivElement {
  console.log(task);
  console.log(task.id);

  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const form = document.createElement("form");
  form.id = "edit-task-form";

  const nameEdit = createLabeledInputElement(
    "text",
    "task-input",
    task.name,
    "Name: "
  );

  const descriptionEdit = createLabeledInputElement(
    "text",
    "task-input",
    task.description,
    "Description: "
  );

  const statusEdit = createLabeledOptionElement(
    "task-status",
    ["Todo", "Doing", "Done"],
    "Status: ",
    task.status
  );

  const priorityEdit = createLabeledOptionElement(
    "task-priority",
    ["Low", "Medium", "High"],
    "Priority: ",
    task.priority
  );

  const estimatedTimeEdit = createLabeledInputElement(
    "number",
    "estimated-time",
    task.estimatedTime.toString(),
    "Estimated Time: "
  );

  const users = UserDB.getAll().map((user) => ({
    name: user.name,
    id: user.id,
  }));
  const assignedUser = createLabeledOptionElement(
    "assigned-user",
    [{ name: "Select a user", id: -1 }, ...users].map((user) => user.name),
    "Assign User: ",
    task.assignedUserId
      ? UserDB.getUserById(task.assignedUserId)?.name
      : "Select a user"
  );

  const saveButton = createButton("Save", "modal-button", () => {
    const nameInputElement = nameEdit.querySelector("input");
    const descriptionInputElement = descriptionEdit.querySelector("input");
    const statusValue = statusEdit.querySelector("select")?.value as TaskStatus;
    const priorityValue = priorityEdit.querySelector("select")
      ?.value as TaskPriority;
    const estimatedTimeValue = parseInt(
      estimatedTimeEdit.querySelector("input")?.value || "0"
    );
    const assignedUserValue = assignedUser.querySelector("select")?.value;

    if (nameInputElement) task.name = nameInputElement.value;
    if (descriptionInputElement)
      task.description = descriptionInputElement.value;
    task.status = statusValue;
    task.priority = priorityValue;
    task.estimatedTime = estimatedTimeValue;

    if (statusValue === "Done") {
      task.endAt = new Date();
    } else {
      task.endAt = undefined;
    }

    if (assignedUserValue !== "Select a user") {
      const user = users.find((user) => user.name === assignedUserValue);
      if (user) {
        task.assignedUserId = user.id;
        if (statusValue !== "Done" && statusValue !== "Doing") {
          task.startAt = new Date();
          task.status = TaskStatus.Doing;
        }
      }
    } else {
      task.assignedUserId = undefined;
      task.startAt = undefined;
      if (statusValue !== "Done") {
        task.status = TaskStatus.Todo;
      }
    }

    projectAPI.updateTask(task);
    modal.remove();
    showModalWithTasksForStory(task.storyId);
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(
    nameEdit,
    descriptionEdit,
    statusEdit,
    priorityEdit,
    estimatedTimeEdit,
    assignedUser
  );
  modalContent.append(form, saveButton, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}

export function createAddStoryModal(currentProjectId: string): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-project-form";

  const name = createLabeledInputElement("text", "story-name", "", "Name: ");
  const description = createLabeledInputElement(
    "text",
    "story-description",
    "",
    "Description: "
  );
  const priority = createLabeledOptionElement(
    "story-priority",
    ["Low", "Medium", "High"],
    "Priority: "
  );

  const project = projectAPI.getProjectById(currentProjectId);

  const currentProjectInfo = document.createElement("p");
  currentProjectInfo.innerHTML = "<p>Project: " + project?.name + "</p>";
  const owner = currentUser;
  const currentUserInfo = document.createElement("p");
  currentUserInfo.innerHTML = "<p>User: " + owner?.name + "</p>";

  const addStory = createButton("Add", "modal-button", () => {
    const nameValue = name.querySelector("input")?.value;
    const descriptionValue = description.querySelector("input")?.value;
    const priorityValue = document.querySelector("option")?.value as
      | "Low"
      | "Medium"
      | "High";
    if (nameValue && descriptionValue && priorityValue && project && owner) {
      const storyId = Date.now().toString();
      const newStory = new Story(
        storyId,
        nameValue,
        descriptionValue,
        StoryPriority[priorityValue as keyof typeof StoryPriority],
        project.id,
        owner.id
      );
      projectAPI.createStory(currentProjectId, newStory);
      modal.remove();
      displayProjects();
    }
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(name, description, priority, currentProjectInfo, currentUserInfo);
  modalContent.append(form, addStory, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}

export function createTaskModal(storyId: string): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-task-form";

  const name = createLabeledInputElement("text", "task-name", "", "Name: ");
  const description = createLabeledInputElement(
    "text",
    "task-description",
    "",
    "Description: "
  );
  const priority = createLabeledOptionElement(
    "task-priority",
    ["Low", "Medium", "High"],
    "Priority: "
  );
  const estimatedTime = createLabeledInputElement(
    "number",
    "estimated-time",
    "",
    "Estimated Time: "
  );

  const addTaskButton = createButton("Add Task", "modal-button", () => {
    const nameValue = name.querySelector("input")?.value;
    const descriptionValue = description.querySelector("input")?.value;
    const priorityValue = priority.querySelector("select")
      ?.value as keyof typeof TaskPriority;
    const estimatedTimeValue = parseInt(
      estimatedTime.querySelector("input")?.value || "0",
      10
    );

    if (
      nameValue &&
      descriptionValue &&
      priorityValue &&
      estimatedTimeValue &&
      selectedProjectId !== null
    ) {
      const taskId = Date.now().toString();
      const newTask = new Task(
        taskId,
        nameValue,
        descriptionValue,
        TaskPriority[priorityValue],
        storyId,
        selectedProjectId,
        estimatedTimeValue
      );
      projectAPI.createTask(storyId, newTask);
      modal.remove();
      showModalWithTasksForStory(storyId);
    }
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(name, description, priority, estimatedTime);
  modalContent.append(form, addTaskButton, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}

export function createEditStoryModal(story: Story): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-story-form";

  const name = createLabeledInputElement(
    "text",
    "story-name",
    story.name,
    "Name: "
  );
  const description = createLabeledInputElement(
    "text",
    "story-description",
    story.description,
    "Description: "
  );
  const priority = createLabeledOptionElement(
    "story-priority",
    ["Low", "Mdium", "High"],
    "Priority: ",
    story.priority
  );
  const status = createLabeledOptionElement(
    "story-status",
    ["Todo", "Doing", "Done"],
    "Status: ",
    story.status
  );

  const saveButton = createButton("Save", "modal-button", () => {
    const nameValue = name.querySelector("input")?.value;
    const descriptionValue = description.querySelector("input")?.value;
    const priorityValue = priority.querySelector("select")?.value as
      | "Low"
      | "Medium"
      | "High";
    const statusValue = status.querySelector("select")?.value as
      | "Todo"
      | "Doing"
      | "Done";

    if (nameValue && descriptionValue && priorityValue && statusValue) {
      story.name = nameValue;
      story.description = descriptionValue;
      story.priority = StoryPriority[priorityValue];
      story.status = StoryStatus[statusValue];

      projectAPI.updateStory(story);
      modal.remove();
      displayProjects();
    }
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(name, description, priority, status);
  modalContent.append(form, saveButton, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}

export function showModalWithTasksForStory(storyId: string): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.id = "task-modal-content";
  modalContent.className = "task-modal-content";

  const tasks = projectAPI.getTasksByStoryId(storyId);

  if (!tasks || tasks.length === 0) {
    const noTasksMessage = document.createElement("p");
    noTasksMessage.textContent = "No tasks for this story";
    modalContent.appendChild(noTasksMessage);
  } else {
    const existingTable = document.getElementById("task-table");
    if (existingTable) {
      existingTable.remove();
    }

    const table = document.createElement("table");
    table.id = "task-table";

    // Create and append the header row
    const headerRow = table.insertRow();
    [
      "Title",
      "Priority",
      "Status",
      "Estimated Time",
      "Created At",
      "Assignee",
      "Start At",
      "End At",
      "Actions",
    ].forEach((headerText) => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell);
    });

    // Populate table rows with task details
    tasks.forEach((task) => {
      const row = table.insertRow();
      row.id = task.id;

      const nameCell = row.insertCell();
      nameCell.innerHTML = `<strong>${task.name}</strong>`;

      const priorityCell = row.insertCell();
      priorityCell.textContent = task.priority;
      if (task.priority === TaskPriority.High) {
        priorityCell.style.color = "red";
      } else if (task.priority === TaskPriority.Medium) {
        priorityCell.style.color = "orange";
      } else if (task.priority === TaskPriority.Low) {
        priorityCell.style.color = "green";
      }
      priorityCell.style.fontWeight = "bold";

      const statusCell = row.insertCell();
      statusCell.textContent = task.status;
      if (task.status === TaskStatus.Doing) {
        statusCell.style.color = "blue";
      } else if (task.status === TaskStatus.Done) {
        statusCell.style.color = "green";
      }
      statusCell.style.fontWeight = "bold";
      const estimatedTimeCell = row.insertCell();
      estimatedTimeCell.textContent = task.estimatedTime.toString();

      const createdAtCell = row.insertCell();
      const createdAtDate = new Date(task.createdAt);
      const formattedDate = createdAtDate.toLocaleDateString();
      createdAtCell.textContent = formattedDate;

      const assigneeCell = row.insertCell();
      const assignedUser = task.assignedUserId
        ? UserDB.getUserById(task.assignedUserId)
        : undefined;
      assigneeCell.textContent = assignedUser
        ? assignedUser.name
        : "Unassigned";

      const startAtCell = row.insertCell();
      if (task.startAt) {
        task.startAt = new Date(task.startAt);
      }

      startAtCell.textContent = task.startAt
        ? task.startAt.toLocaleDateString()
        : "Not started";

      const endAtCell = row.insertCell();
      if (task.endAt) {
        task.endAt = new Date(task.endAt);
      }

      endAtCell.textContent = task.endAt
        ? task.endAt.toLocaleDateString()
        : "Not completed";
      const actionsCell = row.insertCell();
      actionsCell.appendChild(
        createButton("Edit", "modal-button active", () => {
          editTask(task);
          modal.remove();
        })
      );
      actionsCell.appendChild(
        createButton("Delete", "modal-button cancel", () => {
          deleteTask(task.id, storyId);
          modal.remove();
        })
      );
    });

    modalContent.appendChild(table);
  }

  const createTaskButton = createButton(
    "Create Task",
    "modal-button active",
    () => {
      const createTask = createTaskModal(storyId);
      document.body.appendChild(createTask);
    }
  );
  modalContent.appendChild(createTaskButton);

  const goBackButton = createButton("Go Back", "modal-button cancel", () => {
    modal.remove();
    displayStoriesForCurrentProject(selectedProjectId!);
  });
  modalContent.appendChild(goBackButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  return modal;
}
