class Project {
  id: string;
  name: string;
  description: string;
  active: boolean;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.active = false;
  }
}

export default Project;
