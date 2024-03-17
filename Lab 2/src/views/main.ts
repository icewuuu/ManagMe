import Project from "../models/projectModel";
import Story from "../models/storyModel";
import User from "../models/userModel";
import ProjectAPI from "../services/api";
import { createButton, createStoryCard } from "../utils/domOperations";
import { dragLeave, dragOver, drop } from "../utils/dragAndDrop";
import {
  createAddStoryModal,
  createEditModal,
  createEditStoryModal,
} from "./modal";

const projectAPI = new ProjectAPI();
const projectList = document.getElementById("project-list")!;
const kanban = document.getElementById("kanban-board")!;
export const currentUser = new User("1", "Piotr", "Marczak");
let selectedProjectId: string | null = null;

export function displayProjects(): void {
  const projects: Project[] = projectAPI.getAllProjects();
  if (!projectList || !kanban) return;

  kanban.style.display = projects.some((project) => project.active)
    ? "flex"
    : "none";
  selectedProjectId = projects.find((project) => project.active)?.id || null;

  projectList.innerHTML = "";
  projects.forEach((project) => {
    const listItem = document.createElement("li");
    listItem.id = project.id;
    listItem.innerHTML = `<strong>${project.name}</strong><br>${project.description}<br>`;
    listItem.classList.toggle("active-project", project.active);
    if (project.active) {
      displayStoriesForCurrentProject(project.id);
    }
    const selectButton = createButton("Select", "select-button", () =>
      selectProject(project)
    );
    const editButton = createButton("Edit", "edit-button", () =>
      editProject(project)
    );
    const deleteButton = createButton("Delete", "delete-button", () =>
      deleteProject(project.id)
    );
    listItem.append(selectButton, editButton, deleteButton);
    projectList.appendChild(listItem);
  });
}

export function displayStoriesForCurrentProject(
  currentProjectId: string
): void {
  const stories = projectAPI.getStoriesByProjectId(currentProjectId);
  kanban.style.display = stories && stories.length > 0 ? "flex" : "none";

  const todoContainer = document.getElementById("todo-stories")!;
  const doingContainer = document.getElementById("doing-stories")!;
  const doneContainer = document.getElementById("done-stories")!;

  if (!stories || !todoContainer || !doingContainer || !doneContainer) return;

  todoContainer.innerHTML = "";
  doingContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  const sortedStories = stories.sort((a, b) => {
    const priorityOrder = { low: 0, medium: 1, high: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  function dragStart(event: any, storyId: string) {
    event.dataTransfer.setData("text/plain", storyId);
  }

  sortedStories.forEach((story) => {
    const storyCard = createStoryCard(story);
    storyCard.id = story.id;
    storyCard.draggable = true;
    storyCard.addEventListener("dragstart", (event) =>
      dragStart(event, story.id)
    );

    const container = (status: string, containerElement: HTMLElement) => {
      if (story.status === status) {
        containerElement.appendChild(storyCard);
        storyCard.classList.remove("doing", "done");
        storyCard.classList.add(status);
      }
    };

    container("todo", todoContainer);
    container("doing", doingContainer);
    container("done", doneContainer);
  });
}

export function editStory(story: Story): void {
  const modal = createEditStoryModal(story);
  document.body.appendChild(modal);
}

export function deleteStory(id: string): void {
  projectAPI.deleteStory(id);
  displayProjects();
}

function addProject(event: Event): void {
  event.preventDefault();
  const errorMessageField = document.getElementById("error-message")!;
  errorMessageField.textContent = "";

  const nameElement = document.getElementById(
    "project-input"
  ) as HTMLInputElement;
  const descriptionElement = document.getElementById(
    "description-input"
  ) as HTMLInputElement;
  const projectName = nameElement.value.trim();
  const projectDescription = descriptionElement.value.trim();

  if (!projectName || !projectDescription) {
    errorMessageField.textContent = "Please fill out all fields.";
    return;
  }

  const id = Date.now().toString();
  const newProject = new Project(id, projectName, projectDescription);
  projectAPI.createProject(newProject);
  nameElement.value = "";
  descriptionElement.value = "";
  displayProjects();
}

function addStory(event: Event): void {
  event.preventDefault();
  const errorMessageField = document.getElementById("error-message")!;
  errorMessageField.textContent = "";

  if (!selectedProjectId) {
    errorMessageField.textContent = "No project selected.";
    return;
  }

  const modal = createAddStoryModal(selectedProjectId);
  document.body.appendChild(modal);
}

function selectProject(project: Project): void {
  if (selectedProjectId) {
    if (selectedProjectId === project.id) {
      project.active = false;
      projectAPI.updateProject(project);
      selectedProjectId = null;
    } else {
      const prevSelectedProject = projectAPI.getProjectById(selectedProjectId);
      if (prevSelectedProject) {
        prevSelectedProject.active = false;
        projectAPI.updateProject(prevSelectedProject);
      }

      project.active = true;
      selectedProjectId = project.id;
      projectAPI.updateProject(project);
    }
  } else {
    project.active = true;
    selectedProjectId = project.id;
    projectAPI.updateProject(project);
  }

  displayProjects();
}

function editProject(project: Project): void {
  const modal = createEditModal(project);
  document.body.appendChild(modal);
}

function deleteProject(id: string): void {
  projectAPI.deleteStoriesByProjectId(id);
  projectAPI.deleteProject(id);
  displayProjects();
}

window.onload = function () {
  const addButton = document.getElementById("add-button");
  const addStoryButton = document.getElementById("add-story");

  addButton?.addEventListener("click", addProject);
  addStoryButton?.addEventListener("click", addStory);

  const todoContainer = document.getElementById("todo-stories")!;
  const doingContainer = document.getElementById("doing-stories")!;
  const doneContainer = document.getElementById("done-stories")!;

  todoContainer.addEventListener("dragover", (event) =>
    dragOver(event, "todo")
  );
  todoContainer.addEventListener("drop", (event) => drop(event, "todo"));
  todoContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "todo")
  );

  doingContainer.addEventListener("dragover", (event) =>
    dragOver(event, "doing")
  );
  doingContainer.addEventListener("drop", (event) => drop(event, "doing"));
  doingContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "doing")
  );

  doneContainer.addEventListener("dragover", (event) =>
    dragOver(event, "done")
  );
  doneContainer.addEventListener("drop", (event) => drop(event, "done"));
  doneContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "done")
  );

  displayProjects();
};
