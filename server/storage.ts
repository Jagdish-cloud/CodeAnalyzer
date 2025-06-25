import { users, institutions, staff, type User, type InsertUser, type Institution, type InsertInstitution, type Staff, type InsertStaff } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInstitution(id: number): Promise<Institution | undefined>;
  getAllInstitutions(): Promise<Institution[]>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  updateInstitution(id: number, institution: Partial<InsertInstitution>): Promise<Institution | undefined>;
  deleteInstitution(id: number): Promise<boolean>;
  getStaff(id: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private institutions: Map<number, Institution>;
  private staff: Map<number, Staff>;
  private currentUserId: number;
  private currentInstitutionId: number;
  private currentStaffId: number;

  constructor() {
    this.users = new Map();
    this.institutions = new Map();
    this.staff = new Map();
    this.currentUserId = 1;
    this.currentInstitutionId = 1;
    this.currentStaffId = 1;
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

  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.currentStaffId++;
    const staffMember: Staff = { 
      id,
      name: insertStaff.name,
      staffId: insertStaff.staffId,
      role: insertStaff.role,
      newRole: insertStaff.newRole || null,
      mobileNumber: insertStaff.mobileNumber,
      email: insertStaff.email,
      managerName: insertStaff.managerName,
      status: insertStaff.status,
      lastWorkingDay: insertStaff.lastWorkingDay || null,
    };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  async updateStaff(id: number, updateData: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;
    
    const updated: Staff = { ...existing, ...updateData };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: number): Promise<boolean> {
    return this.staff.delete(id);
  }
}

export const storage = new MemStorage();
