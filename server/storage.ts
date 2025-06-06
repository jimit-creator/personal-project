import { 
  users, categories, questions, 
  type User, type UpsertUser,
  type Category, type InsertCategory,
  type Question, type InsertQuestion,
  type QuestionWithCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, like, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  validateAdmin(email: string, password: string): Promise<boolean>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Question methods
  getAllQuestions(): Promise<QuestionWithCategory[]>;
  getQuestionsByCategory(categoryId: number): Promise<QuestionWithCategory[]>;
  getQuestion(id: number): Promise<QuestionWithCategory | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  incrementQuestionViews(id: number): Promise<void>;
  searchQuestions(query: string): Promise<QuestionWithCategory[]>;
  
  // Stats methods
  getStats(): Promise<{
    totalQuestions: number;
    totalCategories: number;
    totalViews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async initializeData() {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) return;

    // Create default categories
    const defaultCategories = [
      { name: "Mathematics", description: "Algebra, Geometry, Calculus", icon: "calculator", color: "blue" },
      { name: "Science", description: "Physics, Chemistry, Biology", icon: "microscope", color: "green" },
      { name: "History", description: "World History, Ancient Civilizations", icon: "monument", color: "purple" },
      { name: "Literature", description: "Classic Literature, Poetry, Essays", icon: "book", color: "amber" },
    ];

    await db.insert(categories).values(defaultCategories);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async validateAdmin(email: string, password: string): Promise<boolean> {
    // Simple admin check - in production this should use proper authentication
    return email === "admin@studyhub.com" && password === "admin123";
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Don't allow deleting categories that have questions
    const questionsInCategory = await db.select().from(questions).where(eq(questions.categoryId, id));
    if (questionsInCategory.length > 0) {
      return false;
    }
    
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Question methods
  async getAllQuestions(): Promise<QuestionWithCategory[]> {
    const result = await db
      .select()
      .from(questions)
      .innerJoin(categories, eq(questions.categoryId, categories.id))
      .orderBy(sql`${questions.createdAt} DESC`);
    
    return result.map(row => ({
      ...row.questions,
      category: row.categories
    }));
  }

  async getQuestionsByCategory(categoryId: number): Promise<QuestionWithCategory[]> {
    const result = await db
      .select()
      .from(questions)
      .innerJoin(categories, eq(questions.categoryId, categories.id))
      .where(eq(questions.categoryId, categoryId))
      .orderBy(sql`${questions.createdAt} DESC`);
    
    return result.map(row => ({
      ...row.questions,
      category: row.categories
    }));
  }

  async getQuestion(id: number): Promise<QuestionWithCategory | undefined> {
    const result = await db
      .select()
      .from(questions)
      .innerJoin(categories, eq(questions.categoryId, categories.id))
      .where(eq(questions.id, id));
    
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      ...row.questions,
      category: row.categories
    };
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questions)
      .values(insertQuestion)
      .returning();
    return question;
  }

  async updateQuestion(id: number, updateData: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [question] = await db
      .update(questions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await db.delete(questions).where(eq(questions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementQuestionViews(id: number): Promise<void> {
    await db
      .update(questions)
      .set({ views: sql`${questions.views} + 1` })
      .where(eq(questions.id, id));
  }

  async searchQuestions(query: string): Promise<QuestionWithCategory[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    const result = await db
      .select()
      .from(questions)
      .innerJoin(categories, eq(questions.categoryId, categories.id))
      .where(
        or(
          like(sql`LOWER(${questions.title})`, lowercaseQuery),
          like(sql`LOWER(${questions.content})`, lowercaseQuery),
          like(sql`LOWER(${questions.answer})`, lowercaseQuery)
        )
      )
      .orderBy(sql`${questions.createdAt} DESC`);
    
    return result.map(row => ({
      ...row.questions,
      category: row.categories
    }));
  }

  async getStats(): Promise<{
    totalQuestions: number;
    totalCategories: number;
    totalViews: number;
  }> {
    const [questionStats] = await db
      .select({
        totalQuestions: sql`COUNT(*)`.mapWith(Number),
        totalViews: sql`COALESCE(SUM(${questions.views}), 0)`.mapWith(Number)
      })
      .from(questions);
    
    const [categoryStats] = await db
      .select({
        totalCategories: sql`COUNT(*)`.mapWith(Number)
      })
      .from(categories);
    
    return {
      totalQuestions: questionStats.totalQuestions,
      totalCategories: categoryStats.totalCategories,
      totalViews: questionStats.totalViews,
    };
  }
}

export const storage = new DatabaseStorage();
