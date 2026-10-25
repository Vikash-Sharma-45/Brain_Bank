import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { User, Subject, Note } from './models/index.js';
import env from './config/env.js';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('🌱 Connected to MongoDB — seeding...');

    // ── Clean existing data ─────────────────
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Note.deleteMany({});
    console.log('   Cleared existing data');

    // ── Admin user ──────────────────────────
    const admin = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash: env.ADMIN_PASSWORD, // pre-save hook hashes it
      role: 'admin',
    });
    console.log(`   ✅ Admin created: ${admin.email}`);

    // ── Sample reader ───────────────────────
    const reader = await User.create({
      name: 'Test Reader',
      email: 'reader@studynotes.com',
      passwordHash: 'Reader@12345',
      role: 'reader',
    });
    console.log(`   ✅ Reader created: ${reader.email}`);

    // ── Subjects ────────────────────────────
    const [math, cs] = await Subject.create([
      {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Core mathematics topics including calculus, algebra, and statistics.',
        order: 1,
      },
      {
        name: 'Computer Science',
        slug: 'computer-science',
        description: 'Fundamentals of programming, data structures, and algorithms.',
        order: 2,
      },
    ]);
    console.log('   ✅ Subjects created');

    // ── Sample notes (markdown only — no file storage needed) ─
    await Note.create([
      {
        title: 'Introduction to Calculus',
        subject: math._id,
        chapter: 'Chapter 1 – Limits',
        type: 'markdown',
        content: `# Introduction to Calculus\n\n## What is Calculus?\n\nCalculus is the mathematical study of **continuous change**. It has two major branches:\n\n1. **Differential Calculus** — concerning rates of change and slopes of curves.\n2. **Integral Calculus** — concerning accumulation of quantities and areas under curves.\n\n## Limits\n\nThe concept of a **limit** is fundamental to calculus.\n\n$$\\lim_{x \\to a} f(x) = L$$\n\nThis means that as *x* approaches *a*, the function *f(x)* approaches *L*.\n\n### Example\n\n$$\\lim_{x \\to 2} (3x + 1) = 7$$\n\n---\n\n> 💡 **Key takeaway:** Limits allow us to describe the behavior of functions at points where they may not be directly defined.`,
        tags: ['calculus', 'limits', 'introduction'],
        extractedText: 'Introduction to Calculus. Limits. Differential Calculus. Integral Calculus.',
        order: 1,
        uploadedBy: admin._id,
      },
      {
        title: 'Linear Algebra Basics',
        subject: math._id,
        chapter: 'Chapter 2 – Vectors & Matrices',
        type: 'markdown',
        content: `# Linear Algebra Basics\n\n## Vectors\n\nA **vector** is a quantity that has both magnitude and direction.\n\n### Notation\n\n$$\\vec{v} = \\begin{pmatrix} v_1 \\\\ v_2 \\\\ v_3 \\end{pmatrix}$$\n\n## Matrices\n\nA **matrix** is a rectangular array of numbers arranged in rows and columns.\n\n$$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$\n\n### Matrix Operations\n\n- **Addition**: element-wise\n- **Multiplication**: dot product of rows and columns\n- **Transpose**: swap rows and columns\n\n---\n\n> 📝 Practice multiplying 2×2 matrices by hand to build intuition.`,
        tags: ['linear-algebra', 'vectors', 'matrices'],
        extractedText: 'Linear Algebra Basics. Vectors. Matrices. Matrix Operations.',
        order: 2,
        uploadedBy: admin._id,
      },
      {
        title: 'Data Structures Overview',
        subject: cs._id,
        chapter: 'Chapter 1 – Fundamentals',
        type: 'markdown',
        content: `# Data Structures Overview\n\n## Why Data Structures Matter\n\nChoosing the right data structure can make the difference between an algorithm running in **milliseconds** vs **minutes**.\n\n## Common Data Structures\n\n| Structure | Access | Search | Insert | Delete |\n|-----------|--------|--------|--------|--------|\n| Array | O(1) | O(n) | O(n) | O(n) |\n| Linked List | O(n) | O(n) | O(1) | O(1) |\n| Hash Table | O(1) | O(1) | O(1) | O(1) |\n| Binary Tree | O(log n) | O(log n) | O(log n) | O(log n) |\n\n## Arrays\n\nArrays store elements in **contiguous memory** locations, making them cache-friendly.\n\n\`\`\`javascript\nconst arr = [1, 2, 3, 4, 5];\nconsole.log(arr[0]); // O(1) access\n\`\`\`\n\n## Linked Lists\n\nEach node stores a value and a pointer to the next node.\n\n---\n\n> 🔑 **Rule of thumb:** Use arrays when you need fast access by index. Use linked lists when you need fast insertions/deletions.`,
        tags: ['data-structures', 'arrays', 'linked-lists', 'fundamentals'],
        extractedText: 'Data Structures Overview. Arrays. Linked Lists. Hash Tables. Binary Trees.',
        order: 1,
        uploadedBy: admin._id,
      },
    ]);
    console.log('   ✅ Sample notes created');

    console.log('\n🎉 Seed complete!');
    console.log('   Admin login  →  admin@studynotes.com / Admin@12345');
    console.log('   Reader login →  reader@studynotes.com / Reader@12345');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
