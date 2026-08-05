function normalizeIds(value) {
  if (Array.isArray(value)) return value.map(String)
  if (value === null || value === undefined || value === '') return []
  return String(value).split(',').map(item => item.trim()).filter(Boolean)
}

export function filterCourseSpacesForClass(spaces, selectedClass) {
  if (!selectedClass) return []
  const classId = selectedClass.id ?? selectedClass.classId ?? null
  const courseId = selectedClass.courseId ?? selectedClass.course_id ?? null

  return (Array.isArray(spaces) ? spaces : []).filter((space) => {
    const classIds = normalizeIds(space.boundClassIds ?? space.classIds ?? space.bound_class_ids)
    if (classIds.length > 0) {
      return classId !== null && classId !== undefined && classIds.includes(String(classId))
    }
    const spaceCourseId = space.courseId ?? space.course_id ?? null
    return courseId !== null && courseId !== undefined && spaceCourseId !== null &&
      String(spaceCourseId) === String(courseId)
  })
}
