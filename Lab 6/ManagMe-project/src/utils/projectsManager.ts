import Project from "../models/projectModel";
import { createButton } from "../utils/domOperations";
import { createEditProjectModal } from "./modalProjects";
import { displayStoriesForCurrentProject } from "./temp/storiesManager";
import {
  createProject,
  fetchProjects,
  getProjectById,
  updateProject,
  deleteProjectApi,
} from "../services/requestHelper";

const projectList = document.getElementById("project-list")!;
const kanban = document.getElementById("kanban-board")!;
export let selectedProjectId: string | null = null;
export let selectedFeatures: boolean = true;

export async function displayProjects(): Promise<void> {
  const projects: Project[] = (await fetchProjects()) || [];
  console.log("projects", projects);
  if (!projectList || !kanban) return;

  kanban.style.display = projects?.some((project) => project.active)
    ? "flex"
    : "none";
  selectedProjectId = projects.find((project) => project.active)?.id || null;

  projectList.innerHTML = "";
  projects?.forEach((project) => {
    console.log("project", project);
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

async function selectProject(project: Project): Promise<void> {
  console.log("selectedProjectId", selectedProjectId);
  if (selectedProjectId) {
    if (selectedProjectId === project.id) {
      project.active = false;
      selectedProjectId = null;
      await updateProject(project);
    } else {
      const prevSelectedProject = await getProjectById(selectedProjectId);
      if (prevSelectedProject) {
        prevSelectedProject.active = false;
        await updateProject(prevSelectedProject);
      }

      project.active = true;
      selectedProjectId = project.id;
      await updateProject(project);
    }
  } else {
    project.active = true;
    selectedProjectId = project.id;
    await updateProject(project);
  }

  await displayProjects();
}

async function editProject(project: Project): Promise<void> {
  const modal = createEditProjectModal(project);
  document.body.appendChild(await modal);
}

async function deleteProject(id: string): Promise<void> {
  await deleteProjectApi(id);
  await displayProjects();
}

export async function addProject(event: Event): Promise<void> {
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
  await createProject(newProject);
  nameElement.value = "";
  descriptionElement.value = "";
  await displayProjects();
}

export async function deselectAllProjects(): Promise<void> {
  const projects: Project[] = await fetchProjects();
  console.log("DDprojects", projects);
  projects?.forEach(async (project) => {
    project.active = false;
    await updateProject(project);
  });
  await displayProjects();
}
