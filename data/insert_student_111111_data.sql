-- ============================================================
-- 测试数据：学生 111111 的实验提交记录
-- tap_user.id=5 (111111, STUDENT)
-- tap_user.id=2 (teacher1, TEACHER)
-- ============================================================
SET NAMES utf8mb4;

-- ============================================================
-- 1. 教学班
-- ============================================================
INSERT INTO teaching_class (id, teacher_id, name, class_code, join_password, grade, course_name, status)
VALUES (1, 2, '软件工程221', 'SE221', 'pass123', '2022', 'Java程序设计', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- 2. 作业模板
-- ============================================================
INSERT INTO assignment_template (id, title, category, language, status, created_by)
VALUES (1, 'PTA编程实验模板', 'PROGRAMMING', 'C/JAVA', 'ACTIVE', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- 3. 学生档案
-- ============================================================
INSERT INTO student_profile (id, student_no, real_name, user_id, status)
VALUES (1, '111111', '测试学生张三', 5, 'ACTIVE')
ON DUPLICATE KEY UPDATE real_name = '测试学生张三', status = 'ACTIVE';

-- ============================================================
-- 4. 实验
-- ============================================================
INSERT INTO experiment (experiment_id, num, name, deadline, `describe`, requirements, topic_sum, teacher_id, `class`, created_at, updated_at) VALUES
(7, 1, '实验一：Java基础语法练习', '2026-07-15', '掌握Java基本语法，包括变量声明、数据类型、运算符、控制流程等', '完成所有PTA平台基础语法题目', 10, '10001', '软件工程221', NOW(), NOW()),
(8, 2, '实验二：面向对象编程基础', '2026-07-20', '理解类与对象的概念，掌握封装、继承、多态三大特性', '设计学生类和管理类', 8, '10001', '软件工程221', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- 5. 作业发布（assignent_offering）→ experiment_id=7对应offering_id=7
-- ============================================================
INSERT INTO assignment_offering (id, template_id, class_id, teacher_id, seq_no, title_override, status, source_system, source_offering_key)
VALUES
(7, 1, 1, 2, 1, '实验一：Java基础语法练习', 'PUBLISHED', 'PTA', 'pta-offering-7'),
(8, 1, 1, 2, 2, '实验二：面向对象编程基础', 'PUBLISHED', 'PTA', 'pta-offering-8')
ON DUPLICATE KEY UPDATE status = 'PUBLISHED';

-- ============================================================
-- 6. 学生-作业关联
-- ============================================================
INSERT INTO student_assignment (id, offering_id, student_id, submission_status, first_submit_at, last_submit_at, accepted_problem_count, submitted_problem_count, problem_count, best_total_score, submission_attempt_count)
VALUES
(1, 7, 1, 'SUBMITTED', '2026-06-01 10:30:00', '2026-06-03 15:00:00', 3, 3, 3, 60.00, 12),
(2, 8, 1, 'IN_PROGRESS', '2026-06-05 08:00:00', '2026-06-06 10:30:00', 1, 2, 2, 35.00, 8)
ON DUPLICATE KEY UPDATE submission_status = VALUES(submission_status);

-- ============================================================
-- 7. 题目定义
-- ============================================================
INSERT INTO assignment_problem (id, offering_id, problem_no, source_problem_id, title, max_score, sort_order, status)
VALUES
(101, 7, '1-1', 'pta-7-1', 'Hello World输出', 10.00, 1, 'ACTIVE'),
(102, 7, '1-2', 'pta-7-2', '两数之和计算', 20.00, 2, 'ACTIVE'),
(103, 7, '1-3', 'pta-7-3', '判断素数', 30.00, 3, 'ACTIVE'),
(104, 8, '2-1', 'pta-8-1', '设计学生类', 25.00, 1, 'ACTIVE'),
(105, 8, '2-2', 'pta-8-2', '继承与多态练习', 25.00, 2, 'ACTIVE')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ============================================================
-- 8. 代码制品
-- ============================================================
INSERT INTO artifact (id, owner_type, owner_id, artifact_type, storage_type, text_content, mime_type, source_system, source_key) VALUES
-- 实验7-题目1（Hello World）
(1001, 'ATTEMPT', 1, 'CODE', 'OBJECT', '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1001'),
(1002, 'ATTEMPT', 2, 'CODE', 'OBJECT', '#include <stdio.h>\n\nint main() {\n    print("Hello World");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1002'),
(1003, 'ATTEMPT', 3, 'CODE', 'OBJECT', '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1003'),
(1004, 'ATTEMPT', 4, 'CODE', 'OBJECT', '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1004'),
(1005, 'ATTEMPT', 5, 'CODE', 'OBJECT', '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1005'),
-- 实验7-题目2（两数之和）
(1006, 'ATTEMPT', 6, 'CODE', 'OBJECT', '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d", a + b);\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1006'),
(1007, 'ATTEMPT', 7, 'CODE', 'OBJECT', '#include <stdio.h>\nint main() {\n    int a b;\n    scanf("%d %d", &a, &b);\n    printf("%d", a + b);\n}', 'text/x-csrc', 'PTA', 'code-1007'),
(1008, 'ATTEMPT', 8, 'CODE', 'OBJECT', '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d", a + b);\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1008'),
-- 实验7-题目3（判断素数）
(1009, 'ATTEMPT', 9, 'CODE', 'OBJECT', '#include <stdio.h>\nint isPrime(int n) {\n    for(int i=2; i<n; i++) {\n        if(n%i==0) return 0;\n    }\n    return 1;\n}\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", isPrime(n));\n}', 'text/x-csrc', 'PTA', 'code-1009'),
(1010, 'ATTEMPT', 10, 'CODE', 'OBJECT', '#include <stdio.h>\nint isPrime(int n) {\n    if(n<2) return 0;\n    for(int i=2; i*i<=n; i++) {\n        if(n%i==0) return 0;\n    }\n    return 1;\n}\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%s", isPrime(n)?"YES":"NO");\n}', 'text/x-csrc', 'PTA', 'code-1010'),
(1011, 'ATTEMPT', 11, 'CODE', 'OBJECT', '#include <stdio.h>\nint main() {\n    int n, flag = 1;\n    scanf("%d", &n);\n    if(n<2) flag = 0;\n    for(int i=2; i*i<=n && flag; i++)\n        if(n%i==0) flag = 0;\n    printf("%s\\n", flag?"YES":"NO");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1011'),
(1012, 'ATTEMPT', 12, 'CODE', 'OBJECT', '#include <stdio.h>\nint main() {\n    int n, flag = 1;\n    scanf("%d", &n);\n    if(n<2) flag = 0;\n    for(int i=2; i*i<=n && flag; i++)\n        if(n%i==0) flag = 0;\n    printf("%s\\n", flag?"YES":"NO");\n    return 0;\n}', 'text/x-csrc', 'PTA', 'code-1012'),
-- 实验8-题目1（设计学生类）—— 大量错误
(1013, 'ATTEMPT', 13, 'CODE', 'OBJECT', 'class Student {\n    String name;\n    int age;\n}', 'text/x-java-source', 'PTA', 'code-1013'),
(1014, 'ATTEMPT', 14, 'CODE', 'OBJECT', 'public class Student {\n    private String name\n    private int age;\n}', 'text/x-java-source', 'PTA', 'code-1014'),
(1015, 'ATTEMPT', 15, 'CODE', 'OBJECT', 'public class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        name = name;\n        age = age;\n    }\n}', 'text/x-java-source', 'PTA', 'code-1015'),
(1016, 'ATTEMPT', 16, 'CODE', 'OBJECT', 'public class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        name = name;\n        age = age;\n    }\n}', 'text/x-java-source', 'PTA', 'code-1016'),
(1017, 'ATTEMPT', 17, 'CODE', 'OBJECT', 'public class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n    \n    public String getName() { return name; }\n    public int getAge() { return age; }\n}', 'text/x-java-source', 'PTA', 'code-1017'),
(1018, 'ATTEMPT', 18, 'CODE', 'OBJECT', 'public class Student {\n    private String name;\n    private int age;\n    \n    public Student(String name, int age) {\n        this.name = name;\n        this.age = age;\n    }\n}', 'text/x-java-source', 'PTA', 'code-1018'),
-- 实验8-题目2（继承与多态）
(1019, 'ATTEMPT', 19, 'CODE', 'OBJECT', 'public class Undergraduate extends Student {\n    String major;\n}', 'text/x-java-source', 'PTA', 'code-1019'),
(1020, 'ATTEMPT', 20, 'CODE', 'OBJECT', 'public class Undergraduate extends Student {\n    private String major;\n    \n    public Undergraduate(String name, int age, String major) {\n        super(name, age);\n        this.major = major;\n    }\n    \n    @Override\n    public String toString() {\n        return getName() + " - " + major;\n    }\n}', 'text/x-java-source', 'PTA', 'code-1020')
ON DUPLICATE KEY UPDATE text_content = VALUES(text_content);

-- ============================================================
-- 9. 提交尝试（student_problem_attempt）—— 含各种错误
-- ============================================================
INSERT INTO student_problem_attempt (id, offering_id, problem_id, student_id, pta_user_id, source_system, source_attempt_key, submitted_at, judge_status, score, compiler, runtime_ms, memory_kb) VALUES
-- 实验7-题目1：5次提交 (编译错误→编译错误→运行时错误→答案错误→通过)
(1, 7, 101, 1, '111111', 'PTA', 'pta-att-1', '2026-06-01 10:30:00', 'COMPILE_ERROR', 0.00, 'GCC', NULL, NULL),
(2, 7, 101, 1, '111111', 'PTA', 'pta-att-2', '2026-06-01 10:35:00', 'COMPILE_ERROR', 0.00, 'GCC', NULL, NULL),
(3, 7, 101, 1, '111111', 'PTA', 'pta-att-3', '2026-06-01 10:42:00', 'RUNTIME_ERROR', 0.00, 'GCC', 120, 2048),
(4, 7, 101, 1, '111111', 'PTA', 'pta-att-4', '2026-06-01 10:50:00', 'WRONG_ANSWER', 0.00, 'GCC', 15, 1024),
(5, 7, 101, 1, '111111', 'PTA', 'pta-att-5', '2026-06-01 11:00:00', 'ACCEPTED', 10.00, 'GCC', 10, 1024),
-- 实验7-题目2：3次提交
(6, 7, 102, 1, '111111', 'PTA', 'pta-att-6', '2026-06-02 09:00:00', 'COMPILE_ERROR', 0.00, 'GCC', NULL, NULL),
(7, 7, 102, 1, '111111', 'PTA', 'pta-att-7', '2026-06-02 09:20:00', 'WRONG_ANSWER', 5.00, 'GCC', 20, 2048),
(8, 7, 102, 1, '111111', 'PTA', 'pta-att-8', '2026-06-02 09:35:00', 'ACCEPTED', 20.00, 'GCC', 12, 1024),
-- 实验7-题目3：4次提交
(9, 7, 103, 1, '111111', 'PTA', 'pta-att-9', '2026-06-03 14:00:00', 'COMPILE_ERROR', 0.00, 'GCC', NULL, NULL),
(10, 7, 103, 1, '111111', 'PTA', 'pta-att-10', '2026-06-03 14:15:00', 'RUNTIME_ERROR', 0.00, 'GCC', 250, 4096),
(11, 7, 103, 1, '111111', 'PTA', 'pta-att-11', '2026-06-03 14:30:00', 'RUNTIME_ERROR', 0.00, 'GCC', 150, 3072),
(12, 7, 103, 1, '111111', 'PTA', 'pta-att-12', '2026-06-03 15:00:00', 'ACCEPTED', 30.00, 'GCC', 18, 2048),
-- 实验8-题目1：6次提交（高频错误 → 触发干预预警！）
(13, 8, 104, 1, '111111', 'PTA', 'pta-att-13', '2026-06-05 08:00:00', 'COMPILE_ERROR', 0.00, 'JAVAC', NULL, NULL),
(14, 8, 104, 1, '111111', 'PTA', 'pta-att-14', '2026-06-05 08:10:00', 'COMPILE_ERROR', 0.00, 'JAVAC', NULL, NULL),
(15, 8, 104, 1, '111111', 'PTA', 'pta-att-15', '2026-06-05 08:25:00', 'COMPILE_ERROR', 0.00, 'JAVAC', NULL, NULL),
(16, 8, 104, 1, '111111', 'PTA', 'pta-att-16', '2026-06-05 08:40:00', 'WRONG_ANSWER', 0.00, 'JAVAC', 50, 4096),
(17, 8, 104, 1, '111111', 'PTA', 'pta-att-17', '2026-06-05 09:00:00', 'WRONG_ANSWER', 10.00, 'JAVAC', 45, 4096),
(18, 8, 104, 1, '111111', 'PTA', 'pta-att-18', '2026-06-05 09:20:00', 'WRONG_ANSWER', 10.00, 'JAVAC', 40, 3072),
-- 实验8-题目2：2次提交
(19, 8, 105, 1, '111111', 'PTA', 'pta-att-19', '2026-06-06 10:00:00', 'COMPILE_ERROR', 0.00, 'JAVAC', NULL, NULL),
(20, 8, 105, 1, '111111', 'PTA', 'pta-att-20', '2026-06-06 10:30:00', 'ACCEPTED', 25.00, 'JAVAC', 35, 3072)
ON DUPLICATE KEY UPDATE judge_status = VALUES(judge_status);

-- ============================================================
-- 10. 学生问题状态
-- ============================================================
INSERT INTO student_problem_state (id, offering_id, problem_id, student_id, latest_attempt_id, best_attempt_id, latest_status, best_score, attempt_count, latest_code_artifact_id) VALUES
(1, 7, 101, 1, 5, 5, 'ACCEPTED', 10.00, 5, 1005),
(2, 7, 102, 1, 8, 8, 'ACCEPTED', 20.00, 3, 1008),
(3, 7, 103, 1, 12, 12, 'ACCEPTED', 30.00, 4, 1012),
(4, 8, 104, 1, 18, 16, 'WRONG_ANSWER', 10.00, 6, 1018),
(5, 8, 105, 1, 20, 20, 'ACCEPTED', 25.00, 2, 1020)
ON DUPLICATE KEY UPDATE latest_status = VALUES(latest_status);

-- ============================================================
-- 11. 旧版提交记录
-- ============================================================
INSERT INTO submission (submission_id, username, experiment_id, code, report, submit_time) VALUES
(1, '111111', 7, '#include <stdio.h>\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}', '实验一报告：掌握了基本输出', '2026-06-03 16:00:00'),
(2, '111111', 8, 'public class Student {\n    private String name;\n    private int age;\n}', '实验二报告：学习了面向对象基础', '2026-06-06 11:00:00')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO score (id, username, experiment_id, num, score, submit_time, status, plagiarism_rate) VALUES
(1, '111111', 7, 1, 60, '2026-06-03 16:00:00', 'completed', '5.2'),
(2, '111111', 8, 2, 35, '2026-06-06 11:00:00', 'in_progress', '0.0')
ON DUPLICATE KEY UPDATE score = VALUES(score);
