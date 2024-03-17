import Project from "../models/projectModel";
import Story from "../models/storyModel";
import ProjectAPI from "../services/api";
import {
  createButton,
  createLabeledInputElement,
  createLabeledOptionElement,
} from "../utils/domOperations";
import { displayProjects, currentUser } from "./main";

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
    ["low", "medium", "high"],
    "Priority: "
  );

  const project = projectAPI.getProjectById(currentProjectId);

  const currentProjectInfo = document.createElement("p");
  currentProjectInfo.innerHTML = "<p>Project: " + project?.name + "</p>";
  const owner = currentUser;
  const currentUserInfo = document.createElement("p");
  currentUserInfo.innerHTML =
    "<p>User: " + owner?.firstName + " " + owner?.lastName + "</p>";

  const addStory = createButton("Add", "modal-button", () => {
    const nameValue = name.querySelector("input")?.value;
    const descriptionValue = description.querySelector("input")?.value;
    const priorityValue = document.querySelector("option")?.value as
      | "low"
      | "medium"
      | "high";
    if (nameValue && descriptionValue && priorityValue && project && owner) {
      const storyId = Date.now().toString();
      const newStory = new Story(
        storyId,
        nameValue,
        descriptionValue,
        priorityValue,
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
    ["low", "medium", "high"],
    "Priority: ",
    story.priority
  );
  const status = createLabeledOptionElement(
    "story-status",
    ["todo", "doing", "done"],
    "Status: ",
    story.status
  );

  const saveButton = createButton("Save", "modal-button", () => {
    const nameValue = name.querySelector("input")?.value;
    const descriptionValue = description.querySelector("input")?.value;
    const priorityValue = priority.querySelector("select")?.value as
      | "low"
      | "medium"
      | "high";
    const statusValue = status.querySelector("select")?.value as
      | "todo"
      | "doing"
      | "done";

    if (nameValue && descriptionValue && priorityValue && statusValue) {
      story.name = nameValue;
      story.description = descriptionValue;
      story.priority = priorityValue;
      story.status = statusValue;
      console.log(priorityValue, statusValue);
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
