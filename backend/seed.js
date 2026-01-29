const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});

    console.log('Data cleared...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });

    console.log('Admin created:', admin.email);

    // Create sample teachers
    const teachers = await User.insertMany([
      {
        name: 'John Smith',
        email: 'john@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '9876543210',
        subject: 'Mathematics'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '9876543211',
        subject: 'Science'
      },
      {
        name: 'Michael Brown',
        email: 'michael@school.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '9876543212',
        subject: 'English'
      }
    ]);

    console.log('Teachers created:', teachers.length);

    // Create sample students
    const students = await Student.insertMany([
      {
        studentId: 'STU001',
        name: 'Alice Williams',
        email: 'alice@student.com',
        phone: '8765432100',
        class: '10A',
        section: 'A',
        rollNumber: '1',
        assignedTeacher: teachers[0]._id,
        parentName: 'Robert Williams',
        parentPhone: '8765432101'
      },
      {
        studentId: 'STU002',
        name: 'Bob Anderson',
        email: 'bob@student.com',
        phone: '8765432102',
        class: '10A',
        section: 'A',
        rollNumber: '2',
        assignedTeacher: teachers[0]._id,
        parentName: 'David Anderson',
        parentPhone: '8765432103'
      },
      {
        studentId: 'STU003',
        name: 'Charlie Davis',
        email: 'charlie@student.com',
        phone: '8765432104',
        class: '10B',
        section: 'B',
        rollNumber: '1',
        assignedTeacher: teachers[1]._id,
        parentName: 'James Davis',
        parentPhone: '8765432105'
      },
      {
        studentId: 'STU004',
        name: 'Diana Miller',
        email: 'diana@student.com',
        phone: '8765432106',
        class: '10B',
        section: 'B',
        rollNumber: '2',
        assignedTeacher: teachers[1]._id,
        parentName: 'Thomas Miller',
        parentPhone: '8765432107'
      },
      {
        studentId: 'STU005',
        name: 'Edward Wilson',
        email: 'edward@student.com',
        phone: '8765432108',
        class: '9A',
        section: 'A',
        rollNumber: '1',
        assignedTeacher: teachers[2]._id,
        parentName: 'George Wilson',
        parentPhone: '8765432109'
      }
    ]);

    console.log('Students created:', students.length);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher 1: john@school.com / teacher123');
    console.log('Teacher 2: sarah@school.com / teacher123');
    console.log('Teacher 3: michael@school.com / teacher123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();