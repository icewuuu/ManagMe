import { c } from "vite/dist/node/types.d-FdqQ54oU";
import Project from "../models/projectModel";
import { Story } from "../models/storyModel";
import { Task } from "../models/taskModel";

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    return fetch("http://localhost:5000/projects")
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } catch (error) {
    console.error(error);
    // Optionally, return a default value or re-throw the error depending on your error handling strategy
    return [];
  }
};

export const getProjectById = async (projectId: string) => {
  try {
    const response = await fetch(`http://localhost:5000/projects/${projectId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getStoryById = async (storyId: string) => {
  try {
    const response = await fetch(`http://localhost:5000/stories/${storyId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch story");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getTasksByStoryId = async (storyId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/tasksForStory/${storyId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch story");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const getStoriesByProjectId = async (projectId: string) => {
  try {
    return fetch(`http://localhost:5000/storiesForProject/${projectId}`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } catch (error) {
    console.error(error);
    // Optionally, return a default value or re-throw the error depending on your error handling strategy
    return [];
  }
};

export async function createProject(project: Project): Promise<void | object> {
  const response = await fetch("http://localhost:5000/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...project }),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  if (response.headers.get("Content-Length") === "0" || !response.body) {
    return;
  }

  const createdProject = await response.json();
  return createdProject;
}

export const createStory = async (
  currentProjectId: string,
  newStory: Story
) => {
  try {
    fetch("http://localhost:5000/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentProjectId, newStory }),
    });
  } catch (error) {
    console.error("Failed to update project", error);
  }
};

export const createTask = async (storyId: string, newTask: Task) => {
  try {
    fetch("http://localhost:5000/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storyId, newTask }),
    });
  } catch (error) {
    console.error("Failed to update project", error);
  }
};

export const updateStory = async (updatedStory: Story) => {
  try {
    fetch(`http://localhost:5000/stories/${updatedStory.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatedStory }),
    });
  } catch (error) {
    console.error("Failed to update project", error);
  }
};

export const updateTask = async (updatedTask: Task) => {
  try {
    fetch(`http://localhost:5000/tasks/${updatedTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatedTask }),
    });
  } catch (error) {
    console.error("Failed to update project", error);
  }
};

export const updateProject = async (updateProject: Project) => {
  console.log("updateProject", updateProject);
  try {
    fetch(`http://localhost:5000/projects/${updateProject.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updateProject }),
    });
  } catch (error) {
    console.error("Failed to update project", error);
  }
};

export async function deleteProjectApi(projectId: string) {
  try {
    const response = await fetch(
      `http://localhost:5000/projects/${projectId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}

export async function deleteStoryApi(storyId: string) {
  try {
    const response = await fetch(`http://localhost:5000/stories/${storyId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}

export async function deleteTaskApi(storyId: string) {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${storyId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}
