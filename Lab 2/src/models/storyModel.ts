class Story {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high";
  project: string;
  createdAt: Date;
  status: "todo" | "doing" | "done";
  owner: string;

  constructor(
    id: string,
    name: string,
    description: string,
    priority: "low" | "medium" | "high",
    project: string,
    owner: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.project = project;
    this.createdAt = new Date();
    this.status = "todo";
    this.owner = owner;
  }
}

export default Story;
