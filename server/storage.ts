import { users, institutions, type User, type InsertUser, type Institution, type InsertInstitution } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInstitution(id: number): Promise<Institution | undefined>;
  getAllInstitutions(): Promise<Institution[]>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  updateInstitution(id: number, institution: Partial<InsertInstitution>): Promise<Institution | undefined>;
  deleteInstitution(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private institutions: Map<number, Institution>;
  private currentUserId: number;
  private currentInstitutionId: number;

  constructor() {
    this.users = new Map();
    this.institutions = new Map();
    this.currentUserId = 1;
    this.currentInstitutionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getInstitution(id: number): Promise<Institution | undefined> {
    return this.institutions.get(id);
  }

  async getAllInstitutions(): Promise<Institution[]> {
    return Array.from(this.institutions.values());
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const id = this.currentInstitutionId++;
    const institution: Institution = { 
      ...insertInstitution, 
      id,
      inst_logo: insertInstitution.inst_logo || null,
      inst_Official_Website: insertInstitution.inst_Official_Website || null
    };
    this.institutions.set(id, institution);
    return institution;
  }

  async updateInstitution(id: number, updateData: Partial<InsertInstitution>): Promise<Institution | undefined> {
    const existing = this.institutions.get(id);
    if (!existing) return undefined;
    
    const updated: Institution = { ...existing, ...updateData };
    this.institutions.set(id, updated);
    return updated;
  }

  async deleteInstitution(id: number): Promise<boolean> {
    return this.institutions.delete(id);
  }
}

export const storage = new MemStorage();
