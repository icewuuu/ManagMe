import Project from "../models/projectModel";
import Story from "../models/storyModel";

class ProjectAPI {
  getAllProjects(): Project[] {
    return JSON.parse(localStorage.getItem("projects") || "[]");
  }

  getAllStories(): Story[] {
    return JSON.parse(localStorage.getItem("stories") || "[]");
  }

  getStoriesByProjectId(projectId: string): Story[] | null {
    const stories: Story[] = this.getAllStories();
    return stories.filter((story) => story.project === projectId);
  }

  getProjectById(id: string): Project | undefined {
    const projects: Project[] = this.getAllProjects();
    return projects.find((project) => project.id === id);
  }

  createProject(project: Project): void {
    const projects: Project[] = this.getAllProjects();
    projects.push(project);
    localStorage.setItem("projects", JSON.stringify(projects));
  }

  updateProject(updatedProject: Project): void {
    const projects: Project[] = this.getAllProjects();
    const index: number = projects.findIndex(
      (project) => project.id === updatedProject.id
    );
    if (index !== -1) {
      projects[index] = updatedProject;
      localStorage.setItem("projects", JSON.stringify(projects));
    }
  }
  updateStory(updatedStory: Story): void {
    const stories: Story[] = this.getAllStories();
    const index: number = stories.findIndex(
      (story) => story.id === updatedStory.id
    );
    if (index !== -1) {
      stories[index] = updatedStory;
      localStorage.setItem("stories", JSON.stringify(stories));
    }
  }

  createStory(projectId: string, story: Story): void {
    const projects: Project[] = this.getAllProjects();
    const project: Project | undefined = projects.find(
      (project) => project.id === projectId
    );
    if (project) {
      project.addStory(story);
      this.updateProject(project);
    }
    const stories: Story[] = this.getAllStories();
    stories.push(story);
    localStorage.setItem("stories", JSON.stringify(stories));
  }

  deleteProject(id: string): void {
    const projects: Project[] = this.getAllProjects().filter(
      (project) => project.id !== id
    );
    localStorage.setItem("projects", JSON.stringify(projects));
  }

  deleteStory(id: string): void {
    const stories: Story[] = this.getAllStories().filter(
      (story) => story.id !== id
    );
    localStorage.setItem("stories", JSON.stringify(stories));
  }

  deleteStoriesByProjectId(projectId: string): void {
    const stories: Story[] = this.getAllStories();
    const updatedStories = stories.filter(
      (story) => story.project !== projectId
    );
    localStorage.setItem("stories", JSON.stringify(updatedStories));
  }

  getStoryById(id: string): Story | null {
    const stories: Story[] = this.getAllStories();
    return stories.find((story) => story.id === id) || null;
  }
}

export default ProjectAPI;
