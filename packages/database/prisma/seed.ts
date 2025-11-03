import { prisma } from "../src/client.js";
import { hashPassword } from "better-auth/crypto";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  todos: Array<{
    title: string;
    content?: string;
  }>;
}

const usersData: SeedUser[] = [
  {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "password123",
    todos: [
      {
        title: "Draft analytical engine notes",
        content: "Capture ideas for translating Bernoulli algorithm.",
      },
      { title: "Review Charles's schematics" },
    ],
  },
  {
    name: "Grace Hopper",
    email: "grace@example.com",
    password: "password123",
    todos: [
      {
        title: "Schedule compiler demo",
        content: "Walk through Hopper-Mauchly compiler progress.",
      },
      { title: "Refine COBOL syntax examples" },
    ],
  },
  {
    name: "Alan Turing",
    email: "alan@example.com",
    password: "password123",
    todos: [
      {
        title: "Complete Turing machine paper",
        content: "Formalize computability theory concepts.",
      },
      { title: "Test codebreaking algorithm" },
    ],
  },
  {
    name: "Hedy Lamarr",
    email: "hedy@example.com",
    password: "password123",
    todos: [
      {
        title: "Patent frequency hopping technique",
        content: "Secure military communication system.",
      },
      { title: "Meet with George Antheil" },
    ],
  },
  {
    name: "Katherine Johnson",
    email: "katherine@example.com",
    password: "password123",
    todos: [
      {
        title: "Calculate orbital trajectories",
        content: "Verify astronaut flight paths for NASA.",
      },
      { title: "Review FORTRAN code" },
    ],
  },
  {
    name: "Donald Knuth",
    email: "donald@example.com",
    password: "password123",
    todos: [
      {
        title: "Write TAOCP volume 4",
        content: "Document combinatorial algorithms.",
      },
      { title: "Debug TeX rendering engine" },
    ],
  },
  {
    name: "Barbara Liskov",
    email: "barbara@example.com",
    password: "password123",
    todos: [
      {
        title: "Design type system for CLU",
        content: "Implement Liskov substitution principle.",
      },
      { title: "Code review abstraction layer" },
    ],
  },
  {
    name: "Guido van Rossum",
    email: "guido@example.com",
    password: "password123",
    todos: [
      {
        title: "Finalize Python 3.x syntax",
        content: "Ensure backward compatibility considerations.",
      },
      { title: "Review PEP proposals" },
    ],
  },
  {
    name: "Linus Torvalds",
    email: "linus@example.com",
    password: "password123",
    todos: [
      {
        title: "Merge kernel patches",
        content: "Review pull requests from contributors.",
      },
      { title: "Optimize memory management" },
    ],
  },
  {
    name: "Sarah Flannery",
    email: "sarah@example.com",
    password: "password123",
    todos: [
      {
        title: "Implement cryptography algorithm",
        content: "Develop Cayley-Purser attack optimization.",
      },
      { title: "Prepare research presentation" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const userData of usersData) {
    // Hash password using better-auth
    const hashedPassword = await hashPassword(userData.password);

    // Upsert user - idempotent operation
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        emailVerified: true,
        image: null,
      },
    });

    // Check if account already exists for this user
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    // Create account only if it doesn't exist
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      });
    }

    // Check existing todos for this user
    const existingTodos = await prisma.todo.findMany({
      where: { userId: user.id },
    });

    // Create todos only if user has no todos yet
    if (existingTodos.length === 0) {
      for (const todoData of userData.todos) {
        await prisma.todo.create({
          data: {
            title: todoData.title,
            content: todoData.content ?? null,
            userId: user.id,
          },
        });
      }
    }

    console.log(`  ✓ Processed user: ${user.email}`);
  }

  console.log(
    "✅ Seeding completed! All users can login with password: password123",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
