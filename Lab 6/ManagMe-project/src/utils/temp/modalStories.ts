import {
  createStory,
  getProjectById,
  updateStory,
} from "../../services/requestHelper";
import { Story, StoryPriority, StoryStatus } from "../../models/storyModel";
import { currentUser } from "../../views/main";
import {
  createButton,
  createLabeledInputElement,
  createLabeledOptionElement,
} from "../domOperations";
import { displayProjects } from "../projectsManager";

export async function createAddStoryModal(
  currentProjectId: string
): Promise<HTMLDivElement> {
  const modal = document.createElement("div");
  modal.className = "modal";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";
  const form = document.createElement("form");
  form.id = "edit-project-form";
  const project = await getProjectById(currentProjectId);
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
      createStory(currentProjectId, newStory);
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

      updateStory(story);
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
