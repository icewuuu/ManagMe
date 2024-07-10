import {
  displayProjects,
  addProject,
  deselectAllProjects,
  selectedProjectId,
} from "../utils/projectsManager";
import {
  displayStoriesForCurrentProject,
  addStory,
} from "../utils/storiesManager";
import { dragLeave, dragOver, drop } from "../utils/dragAndDrop";
import UsersDB from "../db/users";

export const currentUser = UsersDB.getAll()[0];

window.onload = function () {
  deselectAllProjects();
  const addButton = document.getElementById("add-button");
  const addStoryButton = document.getElementById("add-story");

  addButton?.addEventListener("click", (event) => {
    event.preventDefault();
    addProject(event);
  });

  addStoryButton?.addEventListener("click", (event) => {
    event.preventDefault();
    addStory(event);
  });

  const todoContainer = document.getElementById("Todo-stories")!;
  const doingContainer = document.getElementById("Doing-stories")!;
  const doneContainer = document.getElementById("Done-stories")!;

  todoContainer.addEventListener("dragover", (event) =>
    dragOver(event, "Todo")
  );
  todoContainer.addEventListener("drop", (event) => drop(event, "Todo"));
  todoContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "Todo")
  );

  doingContainer.addEventListener("dragover", (event) =>
    dragOver(event, "Doing")
  );
  doingContainer.addEventListener("drop", (event) => drop(event, "Doing"));
  doingContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "Doing")
  );

  doneContainer.addEventListener("dragover", (event) =>
    dragOver(event, "Done")
  );
  doneContainer.addEventListener("drop", (event) => drop(event, "Done"));
  doneContainer.addEventListener("dragleave", (event) =>
    dragLeave(event, "Done")
  );

  displayProjects();
};
