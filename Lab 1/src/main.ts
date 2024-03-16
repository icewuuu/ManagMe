import Project from "./models/projectModel";
import ProjectAPI from "./services/api";

const projectAPI = new ProjectAPI();
const projectList = document.getElementById("project-list") as HTMLUListElement;
const addButton = document.getElementById("add-button");

function displayProjects(): void {
  const projects: Project[] = projectAPI.getAllProjects();

  if (!projectList) return;

  projectList.innerHTML = "";
  projects.forEach((project) => {
    const listItem: HTMLLIElement = document.createElement("li");
    listItem.id = project.id;
    listItem.innerHTML = `<strong>${project.name}</strong><br>${project.description}<br>`;

    if (project.active) {
      listItem.classList.add("active-project");
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

function createButton(
  text: string,
  className: string,
  clickHandler: () => void
): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", clickHandler);
  return button;
}

function addProject(event: Event): void {
  event.preventDefault();

  const nameElement = document.getElementById(
    "project-input"
  ) as HTMLInputElement;
  const descriptionElement = document.getElementById(
    "description-input"
  ) as HTMLInputElement;
  const projectName = nameElement.value.trim();
  const projectDescription = descriptionElement.value.trim();

  if (projectName && projectDescription) {
    const id = Date.now().toString();
    const newProject = new Project(id, projectName, projectDescription);
    projectAPI.createProject(newProject);
    nameElement.value = "";
    descriptionElement.value = "";
    displayProjects();
  }
}

function selectProject(project: Project): void {
  project.active = !project.active;
  projectAPI.updateProject(project);
  displayProjects();
}

function editProject(project: Project): void {
  const modal = createEditModal(project);
  document.body.appendChild(modal);
}

function createEditModal(project: Project): HTMLDivElement {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-project-form";

  const nameEdit = createInputElement("text", "project-input", project.name);
  const descriptionEdit = createInputElement(
    "text",
    "project-input",
    project.description
  );

  const saveButton = createButton("Save", "modal-button", () => {
    project.name = nameEdit.value;
    project.description = descriptionEdit.value;
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

function createInputElement(
  type: string,
  id: string,
  value: string
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.value = value;
  return input;
}

function deleteProject(id: string): void {
  projectAPI.deleteProject(id);
  displayProjects();
}

window.onload = displayProjects;

if (addButton) {
  addButton.addEventListener("click", addProject);
}
