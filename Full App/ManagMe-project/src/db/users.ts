import { User, UserRole } from "../models/userModel";

class UsersDB {
  static getAll(): User[] {
    const users: User[] = [
      {
        id: "1",
        name: "Admin",
        role: UserRole.Admin,
      },
      {
        id: "2",
        name: "Piotr",
        role: UserRole.DevOps,
      },
      {
        id: "3",
        name: "Mariusz",
        role: UserRole.Developer,
      },
    ];
    return users;
  }
  static getUserById(assignedUserId: string): User | undefined {
    return UsersDB.getAll().find((user) => user.id === assignedUserId);
  }
}

export default UsersDB;
