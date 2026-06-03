<template>
  <div class="class-management [min-width:0] [min-height:100%]">
    <UiPageHeader
        class="my-page-header [margin-bottom:20px] [min-height:68px] [padding:0_20px] max-[768px]:[margin-bottom:16px] max-[768px]:[min-height:56px] max-[768px]:[padding:0_16px]"
        title="班级管理"
        description="管理系统中的班级信息"
    >
      <ui-button type="primary" @click="showAddClassDialog">添加班级</ui-button>
    </UiPageHeader>

    <ui-card class="filter-card [margin-bottom:20px] [border-radius:8px] [overflow:hidden]">
      <ui-form :inline="true" :model="filterForm" class="filter-form [display:flex] [flex-wrap:wrap] [gap:10px_12px] [&_.ui-form-item]:[margin-right:0] max-[768px]:[flex-direction:column] max-[768px]:[&_.ui-form-item]:[width:100%] max-[768px]:[&_.ui-input]:[width:100%] max-[768px]:[&_.ui-select]:[width:100%] [gap:10px]">
        <ui-form-item label="班级名称">
          <ui-input v-model="filterForm.name" placeholder="输入班级名称" clearable/>
        </ui-form-item>

        <ui-form-item label="年级">
          <ui-select v-model="filterForm.grade" placeholder="选择年级" clearable>
            <ui-option label="全部" value=""/>
            <ui-option label="2023级" value="2023"/>
            <ui-option label="2022级" value="2022"/>
            <ui-option label="2021级" value="2021"/>
            <ui-option label="2020级" value="2020"/>
          </ui-select>
        </ui-form-item>

        <ui-form-item>
          <ui-button type="primary" @click="applyFilter">查询</ui-button>
          <ui-button @click="resetFilter">重置</ui-button>
        </ui-form-item>
      </ui-form>
    </ui-card>

    <ui-card class="table-card [margin-bottom:20px] [overflow-x:auto] [&_.ui-table]:[width:100%] [border-radius:8px] [overflow:hidden] [padding:10px]">
      <ui-table :data="filteredClasses" class="[width:100%]" border>
        <ui-table-column prop="id" label="班级ID" width="120"/>
        <ui-table-column prop="name" label="班级名称" min-width="180"/>
        <ui-table-column prop="grade" label="年级" width="120"/>
        <ui-table-column prop="studentCount" label="学生数量" width="120"/>
        <ui-table-column prop="teacherName" label="班主任" width="150"/>
        <ui-table-column label="操作" width="250">
          <template #default="scope">
            <ui-button
                type="primary"
                link
                @click="editClass(scope.row)"
            >
              编辑
            </ui-button>
            <ui-button
                type="primary"
                link
                @click="manageStudents(scope.row)"
            >
              学生管理
            </ui-button>
            <ui-button
                type="danger"
                link
                @click="deleteClass(scope.row)"
            >
              删除
            </ui-button>
          </template>
        </ui-table-column>
      </ui-table>
    </ui-card>

    <!-- 添加/编辑班级对话框-->
    <ui-dialog
        v-model="classDialogVisible"
        :title="dialogType === 'add' ? '添加班级' : '编辑班级'"
        width="500px"
    >
      <ui-form ref="classFormRef" :model="classForm" :rules="classRules" label-width="100px">
        <ui-form-item label="班级名称" prop="name">
          <ui-input v-model="classForm.name" placeholder="例如：计算机科学与技术1班"/>
        </ui-form-item>

        <ui-form-item label="年级" prop="grade">
          <ui-select v-model="classForm.grade" placeholder="选择年级" class="[width:100%]">
            <ui-option label="2023级" value="2023"/>
            <ui-option label="2022级" value="2022"/>
            <ui-option label="2021级" value="2021"/>
            <ui-option label="2020级" value="2020"/>
          </ui-select>
        </ui-form-item>

        <ui-form-item label="班主任" prop="teacherId">
          <ui-select v-model="classForm.teacherId" placeholder="选择班主任" class="[width:100%]">
            <ui-option
                v-for="teacher in teacherOptions"
                :key="teacher.id"
                :label="teacher.name"
                :value="teacher.id"
            />
          </ui-select>
        </ui-form-item>
      </ui-form>

      <template #footer>
        <div class="dialog-footer [display:flex] [justify-content:flex-end] [gap:10px]">
          <ui-button @click="classDialogVisible = false">取消</ui-button>
          <ui-button type="primary" @click="saveClass">确定</ui-button>
        </div>
      </template>
    </ui-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import logger from '@/utils/logger'
import { message as uiMessage, messageBox } from '@/services/feedback'

const router = useRouter()
const classes = ref([
  {
    id: 'C2023001',
    name: '计算机科学与技术1班',
    grade: '2023',
    studentCount: 49,
    teacherId: '20001',
    teacherName: '王老师'
  }
  // },
  // {
  //   id: 'C2023002',
  //   name: '计算机科学与技术珀,
  //   grade: '2023',
  //   studentCount: 45,
  //   teacherId: 'T2023002',
  //   teacherName: '王老师'
  // },
  // {
  //   id: 'C2022001',
  //   name: '软件工程1班,
  //   grade: '2022',
  //   studentCount: 38,
  //   teacherId: 'T2023003',
  //   teacherName: '张教授
  // }
])

// 过滤表单
const filterForm = reactive({
  name: '',
  grade: ''
})

// 过滤后的班级列表
const filteredClasses = computed(() => {
  let result = [...classes.value]

  if (filterForm.name) {
    result = result.filter(cls => cls.name.includes(filterForm.name))
  }

  if (filterForm.grade) {
    result = result.filter(cls => cls.grade === filterForm.grade)
  }

  return result
})

// 教师选项
const teacherOptions = ref([
  {id: 'T2023001', name: '李教授'},
  {id: 'T2023002', name: '王老师'},
  {id: 'T2023003', name: '张教授'},
  {id: 'T2023004', name: '刘老师'}
])

// 班级表单
const classFormRef = ref(null)
const classForm = reactive({
  id: '',
  name: '',
  grade: '',
  teacherId: ''
})

// 表单验证规则
const classRules = {
  name: [
    {required: true, message: '请输入班级名称', trigger: 'blur'}
  ],
  grade: [
    {required: true, message: '请选择年级', trigger: 'change'}
  ],
  teacherId: [
    {required: true, message: '请选择班主任', trigger: 'change'}
  ]
}

// 对话框控制
const classDialogVisible = ref(false)
const dialogType = ref('add')
const currentClassId = ref('')

// 过滤
const applyFilter = () => {
  // 已在计算属性中处理
}

const resetFilter = () => {
  filterForm.name = ''
  filterForm.grade = ''
}

// 添加班级
const showAddClassDialog = () => {
  dialogType.value = 'add'
  classForm.id = ''
  classForm.name = ''
  classForm.grade = ''
  classForm.teacherId = ''
  classDialogVisible.value = true
}

// 编辑班级
const editClass = (cls) => {
  dialogType.value = 'edit'
  currentClassId.value = cls.id
  classForm.id = cls.id
  classForm.name = cls.name
  classForm.grade = cls.grade
  classForm.teacherId = cls.teacherId
  classDialogVisible.value = true
}

// 保存班级
const saveClass = () => {
  classFormRef.value.validate((valid) => {
    if (!valid) return

    if (dialogType.value === 'add') {
      // 模拟添加班级
      const newClass = {
        ...classForm,
        id: `C${classForm.grade}${Date.now().toString().slice(-3)}`,
        studentCount: 0,
        teacherName: teacherOptions.value.find(t => t.id === classForm.teacherId)?.name || ''
      }
      classes.value.unshift(newClass)
      uiMessage.success('添加班级成功')
    } else {
      // 模拟更新班级
      const index = classes.value.findIndex(c => c.id === currentClassId.value)
      if (index > -1) {
        const teacherName = teacherOptions.value.find(t => t.id === classForm.teacherId)?.name || ''
        classes.value[index] = {
          ...classes.value[index],
          name: classForm.name,
          grade: classForm.grade,
          teacherId: classForm.teacherId,
          teacherName: teacherName
        }
        uiMessage.success('更新班级成功')
      }
    }

    classDialogVisible.value = false
  })
}

// 管理学生
const manageStudents = (cls) => {
  router.push(`/admin/class-students/${cls.id}`)
}

// 删除班级
const deleteClass = (cls) => {
  messageBox.confirm(
      `确定要删除班级${cls.name} 吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const index = classes.value.findIndex(c => c.id === cls.id)
    if (index > -1) {
      classes.value.splice(index, 1)
      uiMessage.success('删除班级成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 加载教师选项
const loadTeacherOptions = async () => {
  try {
    // 实际应用中应通过API获取教师列表
    // const teachers = await api.getTeacherList()
    // teacherOptions.value = teachers
  } catch (error) {
    logger.error('加载教师列表失败:', error)
  }
}

onMounted(() => {
  loadTeacherOptions()
})
</script>

