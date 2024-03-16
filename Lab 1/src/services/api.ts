import Project from "../models/projectModel";

class ProjectAPI {
  getAllProjects(): Project[] {
    return JSON.parse(localStorage.getItem("projects") || "[]");
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

  deleteProject(id: string): void {
    const projects: Project[] = this.getAllProjects().filter(
      (project) => project.id !== id
    );
    localStorage.setItem("projects", JSON.stringify(projects));
  }
}

export default ProjectAPI;
