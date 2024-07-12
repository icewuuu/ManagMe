import { getStoryById, updateStory } from "../services/requestHelper";
import { StoryStatus } from "../models/storyModel";

import { displayStoriesForCurrentProject } from "./temp/storiesManager";

export const drop = async (
  event: DragEvent,
  status: "Todo" | "Doing" | "Done"
) => {
  event.preventDefault();
  const data = event.dataTransfer?.getData("text/plain");
  if (!data) return;
  const storyCard = document.getElementById(data);

  if (storyCard) {
    const story = await getStoryById(storyCard.id);
    if (story && story.status !== StoryStatus[status]) {
      story.status = StoryStatus[status];
      updateStory(story);
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
