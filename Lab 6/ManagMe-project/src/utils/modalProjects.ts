import { createButton, createLabeledInputElement } from "./domOperations";
import { displayProjects } from "./projectsManager";
import Project from "../models/projectModel";
import { updateProject } from "../services/requestHelper";

export async function createEditProjectModal(
  project: Project
): Promise<HTMLDivElement> {
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

  const saveButton = createButton("Save", "modal-button", async () => {
    const nameInputElement = nameEdit.querySelector("input");
    const descriptionInputElement = descriptionEdit.querySelector("input");
    project.name = nameInputElement ? nameInputElement.value : "";
    project.description = descriptionInputElement
      ? descriptionInputElement.value
      : "";
    await updateProject(project);
    modal.remove();
    await displayProjects();
  });

  const goBackButton = createButton("Go Back", "modal-button cancel", () =>
    modal.remove()
  );

  form.append(nameEdit, descriptionEdit);
  modalContent.append(form, saveButton, goBackButton);
  modal.appendChild(modalContent);

  return modal;
}
