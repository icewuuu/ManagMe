import ProjectAPI from "../services/api";

import { displayStoriesForCurrentProject } from "../views/main";

const projectAPI = new ProjectAPI();

export const drop = (event: DragEvent, status: "todo" | "doing" | "done") => {
  event.preventDefault();
  const data = event.dataTransfer?.getData("text/plain");
  if (!data) return;
  const storyCard = document.getElementById(data);

  if (storyCard) {
    const story = projectAPI.getStoryById(storyCard.id);
    if (story && story.status !== status) {
      story.status = status;
      projectAPI.updateStory(story);
      displayStoriesForCurrentProject(story.project);
    }
    const container = document.getElementById(`${status}-stories`);
    if (container) {
      container.classList.remove("drag-over");
    }
  }
};

export const dragOver = (event: DragEvent, start: string) => {
  event.preventDefault();
  const container = document.getElementById(`${start}-stories`)!;
  container.classList.add("drag-over");
};

export const dragLeave = (event: DragEvent, stop: string) => {
  event.preventDefault();
  const container = document.getElementById(`${stop}-stories`)!;
  container.classList.remove("drag-over");
};
