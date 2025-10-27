import { prisma } from "../client.js";
import type { Prisma } from "../generated/prisma/client";

const users: Prisma.UserCreateInput[] = [
  {
    name: "Ada Lovelace",
    email: "ada@example.com",
    todos: {
      create: [
        {
          title: "Draft analytical engine notes",
          content: "Capture ideas for translating Bernoulli algorithm.",
        },
        {
          title: "Review Charles's schematics",
        },
      ],
    },
  },
  {
    name: "Grace Hopper",
    email: "grace@example.com",
    todos: {
      create: [
        {
          title: "Schedule compiler demo",
          content: "Walk through Hopper-Mauchly compiler progress.",
        },
        {
          title: "Refine COBOL syntax examples",
        },
      ],
    },
  },
  {
    name: "Alan Turing",
    email: "alan@example.com",
    todos: {
      create: [
        {
          title: "Complete Turing machine paper",
          content: "Formalize computability theory concepts.",
        },
        {
          title: "Test codebreaking algorithm",
        },
      ],
    },
  },
  {
    name: "Hedy Lamarr",
    email: "hedy@example.com",
    todos: {
      create: [
        {
          title: "Patent frequency hopping technique",
          content: "Secure military communication system.",
        },
        {
          title: "Meet with George Antheil",
        },
      ],
    },
  },
  {
    name: "Katherine Johnson",
    email: "katherine@example.com",
    todos: {
      create: [
        {
          title: "Calculate orbital trajectories",
          content: "Verify astronaut flight paths for NASA.",
        },
        {
          title: "Review FORTRAN code",
        },
      ],
    },
  },
  {
    name: "Donald Knuth",
    email: "donald@example.com",
    todos: {
      create: [
        {
          title: "Write TAOCP volume 4",
          content: "Document combinatorial algorithms.",
        },
        {
          title: "Debug TeX rendering engine",
        },
      ],
    },
  },
  {
    name: "Barbara Liskov",
    email: "barbara@example.com",
    todos: {
      create: [
        {
          title: "Design type system for CLU",
          content: "Implement Liskov substitution principle.",
        },
        {
          title: "Code review abstraction layer",
        },
      ],
    },
  },
  {
    name: "Guido van Rossum",
    email: "guido@example.com",
    todos: {
      create: [
        {
          title: "Finalize Python 3.x syntax",
          content: "Ensure backward compatibility considerations.",
        },
        {
          title: "Review PEP proposals",
        },
      ],
    },
  },
  {
    name: "Linus Torvalds",
    email: "linus@example.com",
    todos: {
      create: [
        {
          title: "Merge kernel patches",
          content: "Review pull requests from contributors.",
        },
        {
          title: "Optimize memory management",
        },
      ],
    },
  },
  {
    name: "Sarah Flannery",
    email: "sarah@example.com",
    todos: {
      create: [
        {
          title: "Implement cryptography algorithm",
          content: "Develop Cayley-Purser attack optimization.",
        },
        {
          title: "Prepare research presentation",
        },
      ],
    },
  },
];

export async function seed() {
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
}

seed()
  .then(() => {
    console.log("Database seeded successfully.");
  })
  .catch((error) => {
    console.error("Failed to seed database.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
