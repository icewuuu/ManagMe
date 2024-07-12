import { MongoClient, ObjectId, WithId } from "mongodb";
import Project from "../models/projectModel";
import { Story } from "../models/storyModel";
import { Task } from "../models/taskModel";
import { c } from "vite/dist/node/types.d-FdqQ54oU";

class ProjectAPI {
  private client: MongoClient;
  private readonly uri: string;
  private readonly dbName: string;

  constructor(uri: string, dbName: string) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(this.uri);
  }

  private async connect() {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  private get db() {
    return this.client.db(this.dbName);
  }

  async getTasksByProjectId(projectId: string): Promise<Task[] | null> {
    const tasksCollection = this.db.collection<Task>("tasks");
    return tasksCollection.find({ projectId }).toArray();
  }

  async getTasksByStoryId(storyId: string): Promise<Task[] | null> {
    const tasksCollection = this.db.collection<Task>("tasks");
    return tasksCollection.find({ storyId }).toArray();
  }

  async updateTask(updatedTask: Task): Promise<void> {
    const tasksCollection = this.db.collection<Task>("tasks");
    await tasksCollection.updateOne(
      { _id: new ObjectId(updatedTask.id) },
      { $set: updatedTask }
    );
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasksCollection = this.db.collection<Task>("tasks");
    await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });

    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.updateMany({}, { $pull: { tasks: taskId } });
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasksCollection = this.db.collection<Task>("tasks");
    return tasksCollection.findOne({ _id: new ObjectId(id) });
  }

  async getAllProjects(): Promise<WithId<Project>[]> {
    const projectsCollection = this.db.collection<Project>("projects");
    return projectsCollection.find({}).toArray();
  }

  async getAllTasks(): Promise<Task[]> {
    const tasksCollection = this.db.collection<Task>("tasks");
    return tasksCollection.find({}).toArray();
  }

  async getAllStories(): Promise<Story[]> {
    const storiesCollection = this.db.collection<Story>("stories");
    return storiesCollection.find({}).toArray();
  }

  async getStoriesByProjectId(projectId: string): Promise<Story[] | null> {
    console.log("projectId", projectId);

    const storiesCollection = this.db.collection<Story>("stories");
    return storiesCollection.find({ project: projectId }).toArray();
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projectsCollection = this.db.collection<Project>("projects");
    return projectsCollection.findOne({ _id: new ObjectId(id) });
  }

  async createProject(project: Project): Promise<void> {
    const projectsCollection = this.db.collection<Project>("projects");
    await projectsCollection.insertOne(project);
  }

  async updateProject(updatedProject: WithId<Project>): Promise<void> {
    console.log("Updated project:", updatedProject);

    const projectsCollection = this.db.collection<Project>("projects");

    await projectsCollection.updateOne(
      { id: updatedProject.id },
      { $set: updatedProject }
    );
  }

  async updateStory(updatedStory: Story): Promise<void> {
    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.updateOne(
      { _id: new ObjectId(updatedStory.id) },
      { $set: updatedStory }
    );
  }

  async createStory(projectId: string, story: Story): Promise<void> {
    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.insertOne(story);

    const projectsCollection = this.db.collection<Project>("projects");
    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $push: { stories: story.id } }
    );
  }

  async createTask(storyId: string, task: Task): Promise<void> {
    const tasksCollection = this.db.collection<Task>("tasks");
    await tasksCollection.insertOne(task);

    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.updateOne(
      { _id: new ObjectId(storyId) },
      { $push: { tasks: task.id } }
    );
  }

  async deleteProject(id: string): Promise<void> {
    const projectsCollection = this.db.collection<Project>("projects");
    await projectsCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteStory(id: string): Promise<void> {
    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteStoriesByProjectId(projectId: string): Promise<void> {
    const storiesCollection = this.db.collection<Story>("stories");
    await storiesCollection.deleteMany({ project: projectId });
  }

  async getStoryById(id: string): Promise<Story | null> {
    const storiesCollection = this.db.collection<Story>("stories");
    return storiesCollection.findOne({ _id: new ObjectId(id) });
  }

  async close() {
    await this.client.close();
  }
}

export default ProjectAPI;
