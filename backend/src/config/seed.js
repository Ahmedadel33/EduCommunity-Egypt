require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const TeacherRating = require('../models/TeacherRating');
const Subject = require('../models/Subject');
const Material = require('../models/Material');
const Lesson = require('../models/Lesson');
const SoftSkillTask = require('../models/SoftSkillTask');
const Message = require('../models/Message');
const Shift = require('../models/Shift');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const Reward = require('../models/Reward');
const bcrypt = require('bcryptjs');

const teachersData = [
  { name: 'أ. أحمد علي', email: 'ahmed.ali@edu.eg', role: 'teacher', grade: 'كل المراحل', subject: 'الفيزياء' },
  { name: 'أ. سارة محمود', email: 'sara.mahmoud@edu.eg', role: 'teacher', grade: 'كل المراحل', subject: 'الرياضيات' },
  { name: 'أ. محمد حسن', email: 'mohamed.hasan@edu.eg', role: 'teacher', grade: 'كل المراحل', subject: 'الأحياء' },
];

const challengesData = [
  {
    title: 'ماراثون حل مسائل الفيزياء',
    description: 'حل ١٠ مسائل فيزياء صعبة تغطي قوانين نيوتن وحفظ الطاقة.',
    subject: 'الفيزياء',
    grade: 'الصف الأول الثانوي',
    points: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    active: true,
  },
  {
    title: 'مسابقة كتابة المقال العربي',
    description: 'اكتب مقالاً من ٥٠٠ كلمة عن أهمية التعليم في مصر الحديثة.',
    subject: 'اللغة العربية',
    grade: 'الصف الثاني الثانوي',
    points: 75,
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    active: true,
  },
  {
    title: 'التحضير لأولمبياد الرياضيات',
    description: 'مسائل جبر وهندسة متقدمة للتحضير للأولمبياد المصري للرياضيات.',
    subject: 'الرياضيات',
    grade: 'الصف الثالث الثانوي',
    points: 150,
    startDate: new Date(),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ended 1 day ago
    active: true,
  },
  {
    title: 'تقرير معمل الأحياء',
    description: 'وثّق ملاحظاتك من تجربة مراقبة الخلية النباتية وكيفية انقسامها.',
    subject: 'الأحياء',
    grade: 'الصف الأول الثانوي',
    points: 80,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    active: true,
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educommunity';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clean up collections
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await ChallengeSubmission.deleteMany({});
    await TeacherRating.deleteMany({});
    await Subject.deleteMany({});
    await Material.deleteMany({});
    await Lesson.deleteMany({});
    await SoftSkillTask.deleteMany({});
    await Message.deleteMany({});
    await Shift.deleteMany({});
    await Attendance.deleteMany({});
    await Submission.deleteMany({});
    await Reward.deleteMany({});
    console.log('🧹 Database collections cleared');

    // نشفّر كلمة المرور مرة واحدة ونستخدمها لكل الحسابات التجريبية (password123)
    const SEED_PASSWORD = await bcrypt.hash('password123', 10);

    // Create Admin (كلمة المرور بتتشفّر تلقائياً في موديل User)
    const admin = await User.create({
      name: 'مسؤول النظام',
      email: 'admin@edu.eg',
      password: SEED_PASSWORD,
      role: 'admin',
    });
    console.log('👑 Admin user created (admin@edu.eg / password123)');

    // Create Teachers
    const teachers = await Promise.all(
      teachersData.map(t =>
        User.create({
          ...t,
          password: SEED_PASSWORD,
        })
      )
    );
    console.log(`👨‍🏫 ${teachers.length} Teacher users created`);

    // شيفتات المدرسين المناوبين (واحد مناوب دلوقتي + واحد قادم)
    const hourMs = 60 * 60 * 1000;
    await Shift.insertMany([
      { teacher: teachers[0]._id, subject: 'الفيزياء', startsAt: new Date(Date.now() - hourMs), endsAt: new Date(Date.now() + hourMs) }, // مناوب الآن
      { teacher: teachers[1]._id, subject: 'الرياضيات', startsAt: new Date(Date.now() + 2 * hourMs), endsAt: new Date(Date.now() + 4 * hourMs) },
    ]);
    console.log('🕐 Teacher shifts created');

    // مثال جلسة حضور مكتملة لمدرس (ساعتين)
    await Attendance.create({ teacher: teachers[0]._id, loginAt: new Date(Date.now() - 2 * hourMs), logoutAt: new Date(), durationMinutes: 120 });
    console.log('📋 Attendance sample created');

    // Create Subjects (مواد دراسية) + Materials (محتوى تعليمي) للعرض
    const subjects = await Subject.insertMany([
      { name: 'الفيزياء', grade: 'sec-1', description: 'فيزياء الصف الأول الثانوي', icon: 'atom' },
      { name: 'الرياضيات', grade: 'sec-1', description: 'رياضيات الصف الأول الثانوي', icon: 'calculator' },
      { name: 'الأحياء', grade: 'sec-1', description: 'أحياء الصف الأول الثانوي', icon: 'dna' },
      { name: 'الرياضيات', grade: 'sec-2', description: 'رياضيات الصف الثاني الثانوي', icon: 'calculator' },
    ]);
    console.log(`📚 ${subjects.length} Subjects created`);

    const materials = await Material.insertMany([
      {
        title: 'ملخص قوانين نيوتن الثلاثة',
        description: 'شرح مبسّط لقوانين نيوتن مع أمثلة محلولة.',
        subject: subjects[0]._id, grade: 'sec-1', type: 'pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
        provider: 'external', uploadedBy: teachers[0]._id,
      },
      {
        title: 'فيديو: شرح الجاذبية الأرضية',
        description: 'فيديو توضيحي لكيفية عمل الجاذبية وتطبيقاتها.',
        subject: subjects[0]._id, grade: 'sec-1', type: 'video',
        fileUrl: 'https://www.youtube.com/embed/E43-CfukEgs',
        provider: 'external', uploadedBy: teachers[0]._id,
      },
      {
        title: 'مذكرة الجبر — الوحدة الأولى',
        description: 'أساسيات الجبر للصف الأول الثانوي.',
        subject: subjects[1]._id, grade: 'sec-1', type: 'pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
        provider: 'external', uploadedBy: teachers[1]._id,
      },
      {
        title: 'مراجعة رياضيات الصف الثاني (تحضير الإجازة)',
        description: 'مادة الصف التالي للاطّلاع المبكّر في الإجازة.',
        subject: subjects[3]._id, grade: 'sec-2', type: 'pdf',
        fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
        provider: 'external', isNextGrade: true, uploadedBy: teachers[1]._id,
      },
    ]);
    console.log(`🎞️  ${materials.length} Materials created`);

    // Create Challenges
    const challenges = await Challenge.insertMany(challengesData);
    console.log(`🏆 ${challenges.length} Challenges created`);

    // Create some students for leaderboard testing
    const studentsData = [
      { name: 'عمر ياسر', email: 'omar@edu.eg', points: 850, grade: 'sec-1', schoolCode: 'SCH-Cairo-1' },
      { name: 'فاطمة أحمد', email: 'fatma@edu.eg', points: 920, grade: 'sec-1', schoolCode: 'SCH-Cairo-1' },
      { name: 'علي حسن', email: 'ali@edu.eg', points: 740, grade: 'sec-1', schoolCode: 'SCH-Giza-2' },
      { name: 'نور سليم', email: 'nour@edu.eg', points: 610, grade: 'sec-2', schoolCode: 'SCH-Alex-3' },
    ];

    const students = await Promise.all(
      studentsData.map(s =>
        User.create({
          ...s,
          password: SEED_PASSWORD,
          role: 'student',
          badges: ['بطل الأسبوع', 'مشارك نشط'],
        })
      )
    );
    console.log(`🎓 ${students.length} Student users created`);

    // نوزّع تواريخ التسجيل على آخر 6 شهور عشان رسم "نمو المستخدمين" في لوحة الأدمن يبان واقعي
    // بنستخدم collection.updateOne مباشرة لأن mongoose بيكتب تاريخ اليوم فوق أي createdAt نحطه
    const allUsers = [admin, ...teachers, ...students];
    const monthsAgo = [5, 5, 4, 3, 3, 2, 1, 0];
    for (let i = 0; i < allUsers.length; i++) {
      const joinedAt = new Date();
      joinedAt.setMonth(joinedAt.getMonth() - (monthsAgo[i] || 0));
      await User.collection.updateOne({ _id: allUsers[i]._id }, { $set: { createdAt: joinedAt } });
    }
    console.log('📅 Registration dates spread over the last 6 months');

    // ===== بيانات الفيز التالتة والرابعة =====
    const dayMs = 24 * 60 * 60 * 1000;
    await Lesson.insertMany([
      {
        title: 'مراجعة الفيزياء — قوانين نيوتن', teacher: teachers[0]._id, grade: 'sec-1',
        subject: 'الفيزياء', startsAt: new Date(Date.now() + 2 * dayMs),
        meetingUrl: 'https://meet.jit.si/edu-physics-1', description: 'حصة مراجعة مباشرة.',
      },
      {
        title: 'حل مسائل الرياضيات', teacher: teachers[1]._id, grade: 'sec-1',
        subject: 'الرياضيات', startsAt: new Date(Date.now() + 4 * dayMs),
        meetingUrl: 'https://meet.jit.si/edu-math-1', description: 'حصة حل مسائل تفاعلية.',
      },
    ]);
    console.log('🎥 Lessons created');

    await SoftSkillTask.insertMany([
      { title: 'اقرأ كتاباً في التاريخ واعمل بريزنتيشن', description: 'اختر كتاباً وقدّم ملخصاً في 10 شرائح.', points: 20, createdBy: teachers[0]._id },
      { title: 'بحث بسيط عن رياضة تحبها', description: 'اكتب صفحة عن رياضة وفوائدها.', points: 15, createdBy: teachers[1]._id },
    ]);
    console.log('🧩 Soft-skill tasks created');

    await Message.insertMany([
      { room: 'sec-1', user: students[0]._id, text: 'أهلاً يا شباب! حد ذاكر الفصل الأول؟' },
      { room: 'sec-1', user: students[1]._id, text: 'أيوه أنا خلصته، تحب نراجع مع بعض؟' },
    ]);
    console.log('💬 Chat messages created');

    // Create some posts
    const post1 = await Post.create({
      userId: students[0]._id,
      content: 'خلصت ملخص شامل للفصل الخامس - الكيمياء العضوية! 🧪 يغطي جميع أنواع التفاعلات والآليات. أتمنى يساعدكم في الاستعداد لامتحانات منتصف العام!',
      subject: 'الكيمياء',
      likes: [students[1]._id, students[2]._id],
    });

    const post2 = await Post.create({
      userId: students[1]._id,
      content: 'حد يقدر يشرحلي الفرق بين الانقسام الميتوزي والميوزي؟ بتلغبط في المراحل. في حد عنده طريقة سهلة للحفظ؟ 🤔',
      subject: 'الأحياء',
      likes: [students[0]._id],
    });

    console.log('📝 Initial posts seeded');

    // Create a comment
    await Comment.create({
      postId: post2._id,
      userId: teachers[0]._id,
      content: 'أهلاً بك يا فاطمة، الانقسام الميتوزي ينتج خليتين متطابقتين تماماً للخلية الأم، بينما الميوزي ينتج 4 خلايا بكل منها نصف عدد الكروموسومات. سأقوم بنشر ملف ملخص كامل غداً!',
    });
    console.log('💬 Initial comments seeded');

    // ===== مكافآت تجريبية (شارات وجوائز وتكريم) يمنحها الأدمن =====
    await Reward.insertMany([
      { user: students[0]._id, title: 'بطل الأسبوع', type: 'badge', note: 'الأعلى نشاطاً هذا الأسبوع', givenBy: admin._id },
      { user: students[1]._id, title: 'جائزة التفوق', type: 'prize', note: 'الأولى على الصف', givenBy: admin._id },
      { user: students[2]._id, title: 'تكريم المشاركة', type: 'honor', note: 'مشاركة متميزة في المجتمع', givenBy: admin._id },
    ]);
    console.log('🏅 Rewards seeded');

    console.log('🎉 Seeding successfully completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
