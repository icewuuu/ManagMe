enum UserRole {
  Admin = "Admin",
  DevOps = "DevOps",
  Developer = "Developer",
}

class User {
  id: string;
  name: string;
  role: UserRole;

  constructor(id: string, name: string, role: UserRole) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

export { User, UserRole };
