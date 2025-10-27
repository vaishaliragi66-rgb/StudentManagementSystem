-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studentId TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT,
    phoneNumber TEXT,
    department TEXT,
    classSection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    courseId TEXT UNIQUE NOT NULL,
    courseCode TEXT NOT NULL,
    courseName TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendanceId TEXT UNIQUE NOT NULL,
    studentId TEXT REFERENCES public.students(studentId),
    courseId TEXT REFERENCES public.courses(courseId),
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exams table
CREATE TABLE public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    examId TEXT UNIQUE NOT NULL,
    examName TEXT NOT NULL,
    examDate DATE NOT NULL,
    examType TEXT CHECK (examType IN ('Written', 'Online', 'Practical', 'Viva')),
    totalMarks INTEGER DEFAULT 100,
    courseId TEXT REFERENCES public.courses(courseId),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create results table
CREATE TABLE public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resultId TEXT UNIQUE NOT NULL,
    studentId TEXT REFERENCES public.students(studentId),
    examId TEXT REFERENCES public.exams(examId),
    marksObtained NUMERIC NOT NULL,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achievementId TEXT UNIQUE NOT NULL,
    studentId TEXT REFERENCES public.students(studentId),
    platformName TEXT NOT NULL,
    problemName TEXT,
    score INTEGER DEFAULT 0,
    achievementType TEXT,
    dateAchieved DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development only - modify for production)
CREATE POLICY "Enable full access to all users" ON public.students FOR ALL USING (true);
CREATE POLICY "Enable full access to all users" ON public.courses FOR ALL USING (true);
CREATE POLICY "Enable full access to all users" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Enable full access to all users" ON public.exams FOR ALL USING (true);
CREATE POLICY "Enable full access to all users" ON public.results FOR ALL USING (true);
CREATE POLICY "Enable full access to all users" ON public.achievements FOR ALL USING (true);