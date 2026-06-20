const fs = require('fs')

const targets = {
  'src/api/index.js': [48, 66, 72, 251, 635, 637],
  'src/store/index.js': [30, 141, 143, 155, 157],
  'src/utils/chartHelpers.js': [10],
  'src/utils/chartUtils.js': [36],
  'src/utils/resizeUtils.js': [8],
  'src/utils/testLeetCode.js': [91],
  'src/views/admin/ClassManagement.vue': [77, 122, 188, 194, 277],
  'src/views/admin/ExperimentManagement.vue': [121, 245, 251],
  'src/views/admin/Layout.vue': [211, 255],
  'src/views/admin/UserManagement.vue': [204],
  'src/views/student/AIReport.vue': [349, 350, 351, 353],
  'src/views/student/Dashboard.vue': [118],
  'src/views/student/ExperimentDetail.vue': [133],
  'src/views/student/ExperimentList.vue': [84],
  'src/views/student/Layout.vue': [296],
  'src/views/student/LearningAnalysis.vue': [218],
  'src/views/student/LeetCodeDemo.vue': [101],
  'src/views/student/Practice.vue': [312],
  'src/views/student/SelfAssessment.vue': [242],
  'src/views/student/WeaknessTraining.vue': [417],
  'src/views/student/updateAnalysisDataHelper.js': [13],
  'src/views/teacher/AIRecommendation.vue': [121],
  'src/views/teacher/BilingualRead.vue': [127],
  'src/views/teacher/ClassAnalysis.vue': [181],
  'src/views/teacher/ClassDetailedAnalysis.vue': [538],
  'src/views/teacher/ClassList.vue': [377, 413],
  'src/views/teacher/ClassProfile.vue': [170],
  'src/views/teacher/ClassSelector.vue': [23, 26, 32, 33],
  'src/views/teacher/CourseAnalysis.vue': [102],
  'src/views/teacher/Dashboard.vue': [147],
  'src/views/teacher/DepartmentAnalytics.vue': [251],
  'src/views/teacher/DepartmentTeachers.vue': [9, 60, 73, 92, 97],
  'src/views/teacher/DocumentCenter.vue': [129],
  'src/views/teacher/ExperimentAnalytics.vue': [263],
  'src/views/teacher/ExperimentCreate.vue': [109],
  'src/views/teacher/ExperimentDetail.vue': [734],
  'src/views/teacher/ExperimentList.vue': [49],
  'src/views/teacher/GradingCenter.vue': [160],
  'src/views/teacher/MyTeachingAnalysis.vue': [190],
  'src/views/teacher/RagAnalytics.vue': [140],
  'src/views/teacher/SubmissionDetail.vue': [892, 922, 929, 938, 944, 1226, 1227, 1260, 1382, 1391, 1421, 1436, 1593],
  'src/views/teacher/SubmissionList.vue': [304, 403, 480],
  'src/views/teacher/SummaryCard.vue': [44, 199, 203, 216, 226],
  'src/views/teacher/TeacherAIManagement.vue': [149]
}

for (const [file, lineNumbers] of Object.entries(targets)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  console.log(`\n--- ${file}`)
  for (const lineNumber of lineNumbers) {
    const line = lines[lineNumber - 1]
    if (line !== undefined) {
      console.log(`${lineNumber}: ${line}`)
    }
  }
}
