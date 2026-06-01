<template>
  <div class="department-teachers">
    <page-header
      class="my-page-header"
      title="系部教师"
      description="教师管理和教学数据概览"
    />

    <div class="flex flex-col gap-5">
      <!-- 教师统计信息 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">教师队伍概况</span>
        </div>
        <div class="grid grid-cols-4 gap-5">
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73]">教师总数</div>
            <div class="text-[28px] font-bold text-[#1d1d1f] my-2.5">{{ teachers.length }}</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73]">管理班级数</div>
            <div class="text-[28px] font-bold text-[#1d1d1f] my-2.5">{{ totalClasses }}</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73]">学生总数</div>
            <div class="text-[28px] font-bold text-[#1d1d1f] my-2.5">{{ totalStudents }}</div>
          </div>
          <div class="text-center py-5">
            <div class="text-[13px] text-[#6e6e73]">实验总数</div>
            <div class="text-[28px] font-bold text-[#1d1d1f] my-2.5">{{ totalExperiments }}</div>
          </div>
        </div>
      </div>

      <!-- 教师列表 -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">教师列表</span>
          <input
            v-model="searchQuery"
            placeholder="搜索教师姓名"
            class="w-[220px] h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm"
          />
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12 text-[13px] text-[#6e6e73]">加载中...</div>
        <table v-else class="w-full text-left text-[13px]">
          <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[120px]">姓名</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[140px]">用户名</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">管理班级</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px] text-center">学生数</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[120px]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in filteredTeachers" :key="teacher.id" class="border-b border-black/[0.04] hover:bg-[rgba(0,122,255,0.03)]">
              <td class="py-3 px-3">{{ teacher.name }}</td>
              <td class="py-3 px-3">{{ teacher.username }}</td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="cls in teacher.classes" :key="cls.id" class="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-medium bg-[rgba(0,122,255,0.08)] text-[#007aff]">{{ cls.name }}</span>
                  <span v-if="!teacher.classes?.length" class="text-[13px] text-[#aeaeb2]">暂无班级</span>
                </div>
              </td>
              <td class="py-3 px-3 text-center">{{ teacher.studentCount || 0 }}</td>
              <td class="py-3 px-3">
                <button class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none" @click="viewTeacherClasses(teacher)">查看班级</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 教师班级详情弹窗 -->
    <div v-if="dialogVisible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="dialogVisible = false"></div>
      <div class="relative w-[60%] max-h-[80vh] rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 overflow-auto">
        <div class="flex justify-between items-center gap-3 mb-4 pb-2.5 border-b border-black/[0.06]">
          <span class="text-[15px] font-semibold text-[#1d1d1f]">教师班级 - {{ selectedTeacher?.name }}</span>
          <button class="text-[13px] font-medium text-[#007aff] cursor-pointer hover:text-[#0056b3] transition-colors bg-transparent border-none" @click="dialogVisible = false">关闭</button>
        </div>
        <table class="w-full text-left text-[13px]">
          <thead>
            <tr class="border-b border-black/[0.06]">
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9]">班级名称</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[140px]">班级代码</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">学生数</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[140px]">课程</th>
              <th class="py-3 px-3 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide bg-[#f9f9f9] w-[100px]">年级</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cls in (selectedTeacher?.classes || [])" :key="cls.id" class="border-b border-black/[0.04] hover:bg-[rgba(0,122,255,0.03)]">
              <td class="py-3 px-3">{{ cls.name }}</td>
              <td class="py-3 px-3">{{ cls.classCode }}</td>
              <td class="py-3 px-3">{{ cls.studentCount }}</td>
              <td class="py-3 px-3">{{ cls.courseName }}</td>
              <td class="py-3 px-3">{{ cls.grade }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'
import { ref, computed, onMounted } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import { ElMessage } from 'element-plus'
import api from '../../api'
const loading = ref(false)
const searchQuery = ref('')
const teachers = ref([])
const dialogVisible = ref(false)
const selectedTeacher = ref(null)
const totalExperiments = ref(0)

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value
  return teachers.value.filter(t => t.name?.includes(searchQuery.value) || t.username?.includes(searchQuery.value))
})

const totalClasses = computed(() => teachers.value.reduce((sum, t) => sum + (t.classes?.length || 0), 0))
const totalStudents = computed(() => teachers.value.reduce((sum, t) => sum + (t.studentCount || 0), 0))

const fetchTeachers = async () => {
  loading.value = true
  try {
    // 使用 AI_Ds 后端的班级接口
    const classesRes = await api.getClassList()
    const classList = Array.isArray(classesRes) ? classesRes : (classesRes?.data || [])

    // 按教师分组
    const teacherMap = new Map()
    classList.forEach(cls => {
      const teacherId = cls.teacherId || cls.createdBy || 'current'
      const teacherName = cls.teacherName || cls.createdByName || ''
      if (!teacherMap.has(teacherId)) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        teacherMap.set(teacherId, {
          id: teacherId,
          name: teacherName || userInfo.name || userInfo.username || '当前教师',
          username: cls.teacherUsername || teacherId,
          classes: [],
          studentCount: 0
        })
      }
      const teacher = teacherMap.get(teacherId)
      teacher.classes.push(cls)
      teacher.studentCount += cls.studentCount || 0
    })

    teachers.value = Array.from(teacherMap.values())

    // 如果没有从班级中提取到教师信息，使用当前用户
    if (teachers.value.length === 0) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      teachers.value = [{
        id: userInfo.id || 1,
        name: userInfo.name || userInfo.username || '当前教师',
        username: userInfo.username || '',
        classes: classList,
        studentCount: classList.reduce((sum, c) => sum + (c.studentCount || 0), 0)
      }]
    }
  } catch (e) {
    logger.error('获取教师数据失败:', e)
    ElMessage.error('获取教师数据失败')
  } finally {
    loading.value = false
  }
}

const loadExperimentCount = async () => {
  try {
    const expRes = await api.getTeacherExperimentList({ scope: 'all' })
    let exps = []
    if (expRes?.data && Array.isArray(expRes.data)) exps = expRes.data
    else if (Array.isArray(expRes)) exps = expRes
    totalExperiments.value = exps.length
  } catch (e) {
    logger.error('获取实验数量失败:', e)
  }
}

const viewTeacherClasses = (teacher) => {
  selectedTeacher.value = teacher
  dialogVisible.value = true
}

onMounted(() => {
  fetchTeachers()
  loadExperimentCount()
})
</script>
