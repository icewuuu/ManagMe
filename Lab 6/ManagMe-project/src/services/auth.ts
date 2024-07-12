import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import UsersDB from "../db/users";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/userModel";
import { c } from "vite/dist/node/types.d-FdqQ54oU";
import ProjectAPI from "./api";
import { Request, Response } from "express";
import Project from "../models/projectModel";
import { Story } from "../models/storyModel";
import { Task } from "../models/taskModel";
import { ObjectId, WithId } from "mongodb";

const app = express();
const PORT = 5000;

const mongoURI = "mongodb://localhost:27017";
const dbName = "project-management-db";

const projectAPI = new ProjectAPI(mongoURI, dbName);

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const SECRET_KEY = "your_secret_key";
const REFRESH_SECRET_KEY = "your_refresh_secret_key";
const TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION = "7d";

app.post("/api/login", (req, res) => {
  const { login, password } = req.body;

  const user = UsersDB.getAll().find(
    (u) => u.name === login && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Nieprawidłowy login lub hasło" });
  }

  const token = jwt.sign({ id: user.id }, SECRET_KEY, {
    expiresIn: TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  res.json({ token, refreshToken });
});

app.post("/api/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  try {
    const payload: JwtPayload = jwt.verify(
      refreshToken,
      REFRESH_SECRET_KEY
    ) as JwtPayload;
    const newToken = jwt.sign({ id: payload["id"] }, SECRET_KEY, {
      expiresIn: TOKEN_EXPIRATION,
    });

    res.json({ token: newToken });
  } catch (e) {
    res.status(401).json({ message: "Nieprawidłowy refresh token" });
  }
});

app.get("/api/userinfo", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Received token:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    console.log("Error:", err, "Decoded:", decoded);

    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = UsersDB.getAll().find(
      (u) => u.id === (decoded as JwtPayload)["id"]
    );
    console.log("User:", user);
    res.json({ message: "Authorized", user: user });
  });
});

// Get all projects

app.get("/projects", async (req, res) => {
  try {
    const projectsWithId = await projectAPI.getAllProjects();
    const data = projectsWithId.map(({ _id, ...rest }) => ({
      ...rest,
    }));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/projects:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await projectAPI.getProjectById(req.params.id);
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/stories:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const story = await projectAPI.getStoryById(req.params.id);
    res.json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/stories/:id", async (req: Request, res: Response) => {
  const storyId = req.params.id;
  const updatedStory: Story = req.body;

  try {
    updatedStory.id = storyId;

    await projectAPI.updateStory(updatedStory);

    res.status(200).json({ message: "Story updated successfully" });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/tasks/:id", async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const updatedTask: Task = req.body;

  try {
    updatedTask.id = taskId;

    await projectAPI.updateTask(updatedTask);

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/projects/:id", async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const updatedProject: WithId<Project> = {
    ...req.body,
  };
  console.log("Updated project:", updatedProject, "Project ID:", projectId);
  try {
    await projectAPI.updateProject(updatedProject);

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get(
  "/tasksForStory:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const story = await projectAPI.getTasksByStoryId(req.params.id);
      res.json(story);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get(
  "/storiesForProject/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const story = await projectAPI.getStoriesByProjectId(req.params.id);
      res.json(story);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create a new project
app.post("/projects", async (req, res) => {
  console.log("Request body:", req.body);
  const { name, description } = req.body; // Extract relevant fields

  try {
    const resp = await projectAPI.createProject(
      new Project(new ObjectId().toString(), name, description)
    );
    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/stories", async (req: Request, res: Response): Promise<void> => {
  const { currentProjectId, newStory } = req.body;
  try {
    await projectAPI.createStory(currentProjectId, newStory);
    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/tasks", async (req: Request, res: Response): Promise<void> => {
  const { storyId, newtask } = req.body;
  try {
    await projectAPI.createStory(storyId, newtask);
    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/projects/:id", async (req: Request, res: Response) => {
  const projectId = req.params.id;
  try {
    // Delete stories associated with the project
    await projectAPI.deleteStoriesByProjectId(projectId);

    // Delete the project
    await projectAPI.deleteProject(projectId);

    res
      .status(200)
      .json({ message: "Project and its stories deleted successfully" });
  } catch (error) {
    console.error("Error deleting project and stories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/stories/:id", async (req: Request, res: Response) => {
  const projectId = req.params.id;
  try {
    await projectAPI.deleteStory(projectId);

    res
      .status(200)
      .json({ message: "Project and its stories deleted successfully" });
  } catch (error) {
    console.error("Error deleting project and stories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/tasks/:id", async (req: Request, res: Response) => {
  const projectId = req.params.id;
  try {
    await projectAPI.deleteTask(projectId);

    res
      .status(200)
      .json({ message: "Project and its stories deleted successfully" });
  } catch (error) {
    console.error("Error deleting project and stories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
