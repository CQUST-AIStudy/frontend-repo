export function getTeacherPermissions(level) {
  switch (level) {
    case 'department_head':
      return [
        'view_all_courses',
        'view_all_teachers',
        'view_all_classes',
        'manage_department',
        'generate_teaching_ppt',
        'analyze_all_classes',
        ...getTeacherPermissions('course_leader')
      ]
    case 'course_leader':
      return [
        'manage_course_experiments',
        'view_course_teachers',
        'view_course_classes',
        'analyze_course_classes',
        ...getTeacherPermissions('normal')
      ]
    case 'normal':
    default:
      return [
        'view_own_classes',
        'manage_own_experiments',
        'view_student_reports',
        'analyze_own_classes',
        'ai_teaching_recommendation'
      ]
  }
}
