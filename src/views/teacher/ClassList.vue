<template>
  <div class="class-list [min-width:0] [min-height:100%] [overflow-y:auto] [&_.el-button--primary]:[border-radius:999px] [&_.el-dialog]:[max-width:calc(100vw_-_24px)] [&_.el-table]:[width:100%]">
    <page-header
      class="my-page-header [margin-bottom:10px]"
      title="班级管理"
      description="管理教学班级、学生信息与 PTA 同步设置，首屏卡片会根据内容自动伸展。"
    >
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增班级
      </el-button>
    </page-header>

    <el-alert
      v-if="cookieStatus === 'EXPIRED'"
      class="cookie-alert [margin-bottom:18px] [border-radius:18px]"
      title="PTA 登录凭证已过期"
      type="warning"
      :closable="false"
      show-icon
    >
      <template #default>
        <div class="cookie-alert__content [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [flex-wrap:wrap] [font-size:13px] [line-height:1.7]">
          <span>系统自动登录失败。可以手动更新Cookie，也可以在“个人资料”绑定PTA 账号，或在发起同步时临时输入账号密码。</span>
          <el-button type="warning" size="small" @click="openCookieDialog">更新 Cookie</el-button>
        </div>
      </template>
    </el-alert>

    <div class="class-cards [padding-bottom:24px]" v-loading="loading">
      <el-empty v-if="classes.length === 0 && !loading" description="暂无班级，点击上方按钮创建">
        <el-button type="primary" @click="openCreateDialog">创建第一个班级</el-button>
      </el-empty>

      <el-row v-else :gutter="20" class="class-grid [display:flex] [flex-wrap:wrap] [min-width:0]">
        <el-col
          v-for="cls in classes"
          :key="cls.id"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="12"
          :xl="12"
          class="class-grid__item [display:flex] [margin-bottom:20px]"
        >
          <el-card shadow="hover" class="class-card [height:100%] [cursor:pointer] [transition:all_0.3s] [border:2px_solid_transparent] hover:[transform:translateY(-5px)] hover:[border-color:#409EFF] hover:[box-shadow:0_10px_15px_rgba(0,_0,_0,_0.1)] [width:100%] [min-height:380px] [display:flex] [flex-direction:column] [border:1px_solid_#dce5f0] [border-radius:24px] [background:radial-gradient(circle_at_top_right,_rgba(26,_115,_232,_0.08),_transparent_30%),_linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] [box-shadow:0_14px_36px_rgba(38,_61,_89,_0.07)]">
            <template #header>
              <div class="card-header [display:flex] [justify-content:space-between] [align-items:flex-start] [gap:16px] [align-items:center] [gap:12px] [margin-bottom:16px] [padding-bottom:10px] [border-bottom:1px_solid_#ebeef5]">
                <div class="card-header__main [min-width:0] [flex:1]">
                  <h3 class="class-name [margin:0] [font-size:26px] [line-height:1.2] [color:#16314a] [word-break:break-word]">{{ displayClassName(cls) }}</h3>
                  <div class="class-meta [display:flex] [flex-wrap:wrap] [gap:8px] [margin-top:12px]">
                    <span class="meta-pill [display:inline-flex] [align-items:center] [padding:6px_12px] [border-radius:999px] [background:rgba(18,_112,_216,_0.1)] [color:#1860b7] [font-size:12px] [font-weight:600]">{{ displayGrade(cls) }}</span>
                    <span class="meta-pill meta-pill--soft [display:inline-flex] [align-items:center] [padding:6px_12px] [border-radius:999px] [background:rgba(18,_112,_216,_0.1)] [color:#1860b7] [font-size:12px] [font-weight:600] [background:rgba(126,_157,_183,_0.12)] [color:#5c7188]">{{ studentCountValue(cls) }} 人</span>
                  </div>
                </div>
                <el-dropdown trigger="click">
                  <el-icon class="card-menu [cursor:pointer] [color:#71839a] [font-size:18px]"><MoreFilled /></el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editClass(cls)">编辑班级</el-dropdown-item>
                      <el-dropdown-item @click="manageStudents(cls)">学生管理</el-dropdown-item>
                      <el-dropdown-item divided @click="confirmDelete(cls)" class="[color:#f56c6c]">
                        删除班级
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="class-summary [display:flex] [flex-wrap:wrap] [gap:12px]">
              <div class="summary-chip [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]">
                <span class="summary-chip__label [color:#8091a5] [font-size:12px] [white-space:nowrap]">班级号</span>
                <strong>{{ displayClassCode(cls) }}</strong>
                <el-button link size="small" @click="copyCode(displayClassCode(cls))">复制</el-button>
              </div>
              <div class="summary-chip [font-size:12px] [padding:3px_10px] [border-radius:100px] [font-weight:500] [&.positive]:[background:#e6f4ea] [&.positive]:[color:#1e8e3e] [&.negative]:[background:#fce8e6] [&.negative]:[color:#d93025] [&.neutral]:[background:#f1f3f4] [&.neutral]:[color:#5f6368] [min-width:min(280px,_100%)] [display:inline-flex] [align-items:center] [gap:8px] [padding:12px_14px] [border-radius:16px] [background:rgba(244,_248,_253,_0.92)] [border:1px_solid_#e3ebf5] [color:#34475d] [line-height:1.6] [word-break:break-word]" v-if="hasPtaConfig(cls)">
                <span class="summary-chip__label [color:#8091a5] [font-size:12px] [white-space:nowrap]">PTA 同步</span>
                <el-tag size="small" :type="syncTagType(cls.syncStatus)" effect="plain">
                  {{ syncStatusText(cls.syncStatus) }}
                </el-tag>
                <span v-if="cls.lastSyncAt" class="summary-chip__time [font-size:12px] [color:#8b9bae]">{{ formatTime(cls.lastSyncAt) }}</span>
              </div>
            </div>

            <div class="info-grid [display:grid] [grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:14px]">
              <div class="info-block [display:flex] [flex-direction:column] [gap:8px] [padding:14px_16px] [border-radius:18px] [background:rgba(255,_255,_255,_0.78)] [border:1px_solid_#e8eef6] [min-height:108px]">
                <span class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">加入密码</span>
                <span class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ displayJoinPassword(cls) }}</span>
              </div>
              <div class="info-block [display:flex] [flex-direction:column] [gap:8px] [padding:14px_16px] [border-radius:18px] [background:rgba(255,_255,_255,_0.78)] [border:1px_solid_#e8eef6] [min-height:108px]">
                <span class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">课程</span>
                <span class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ displayCourseName(cls) }}</span>
              </div>
              <div class="info-block [display:flex] [flex-direction:column] [gap:8px] [padding:14px_16px] [border-radius:18px] [background:rgba(255,_255,_255,_0.78)] [border:1px_solid_#e8eef6] [min-height:108px]">
                <span class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">描述</span>
                <span class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ displayDescription(cls) }}</span>
              </div>
              <div class="info-block [display:flex] [flex-direction:column] [gap:8px] [padding:14px_16px] [border-radius:18px] [background:rgba(255,_255,_255,_0.78)] [border:1px_solid_#e8eef6] [min-height:108px]">
                <span class="info-label [color:#606266] [margin-right:5px] [font-size:12px] [font-weight:600] [color:#8092a6]">同步关键词</span>
                <span class="info-value [font-weight:500] [color:#24384f] [font-size:14px] [line-height:1.7] [word-break:break-word]">{{ displayPtaKeyword(cls) }}</span>
              </div>
            </div>

            <div class="card-actions [display:flex] [justify-content:space-between] [gap:10px] [margin-top:auto] [flex-wrap:wrap] [padding-top:6px]">
              <el-button type="primary" @click="enterClassSpace(cls)">进入教学班</el-button>
              <el-button @click="manageStudents(cls)">学生管理</el-button>
              <el-button
                type="success"
                plain
                :loading="importingMap[cls.id]"
                @click="importStudentsForClass(cls)"
              >
                导入 PTA 学生
              </el-button>
              <el-button @click="viewAnalysis(cls)">班级分析</el-button>
              <el-button
                v-if="hasPtaConfig(cls)"
                type="warning"
                plain
                :loading="syncingMap[cls.id]"
                :disabled="cls.syncStatus === 'RUNNING'"
                @click="openSyncDialog(cls)"
              >
                {{ cls.syncStatus === 'RUNNING' ? '同步中..' : '立即同步' }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog
      v-model="classDialogVisible"
      :title="editingClass ? '编辑班级' : '新增班级'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="classForm" :rules="classRules" ref="classFormRef" label-width="90px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="classForm.name" placeholder="例如：计算机科学与技术23 级1 班" />
        </el-form-item>
        <el-form-item label="班级号" prop="classCode" v-if="!editingClass">
          <el-input v-model="classForm.classCode" placeholder="唯一标识，例如CS2023-01">
            <template #append>
              <el-button @click="generateCode">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="加入密码" prop="joinPassword">
          <el-input v-model="classForm.joinPassword" placeholder="学生加入班级时需要输入" show-password />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="classForm.grade" placeholder="选择年级" clearable class="[width:100%]">
            <el-option v-for="y in gradeOptions" :key="y" :label="`${y} 级`" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="classForm.courseName" placeholder="例如：数据结构" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="classForm.description" type="textarea" :rows="3" placeholder="可选，用于补充班级说明" />
        </el-form-item>

        <el-divider content-position="left">PTA 数据同步</el-divider>

        <el-form-item label="PTA 关键词">
          <el-input
            v-model="classForm.ptaKeyword"
            placeholder="例如：计科23 数据结构"
          />
          <div class="form-help [margin-top:6px] [font-size:12px] [color:#7b8ba0]">填写后可自动从PTA 同步该班级的实验数据。</div>
        </el-form-item>
        <el-form-item label="定时同步">
          <el-switch v-model="classForm.syncEnabled" :disabled="!classForm.ptaKeyword.trim()" />
          <span class="switch-hint [margin-left:10px] [font-size:13px] [color:#7b8ba0]">
            {{ classForm.syncEnabled ? '已开启，每天凌晨自动同步一次。' : '关闭' }}
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="classDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitClassForm" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="studentDialogVisible"
      :title="`学生管理 - ${displayClassName(currentClass || {})}`"
      width="720px"
      destroy-on-close
    >
      <div class="student-toolbar [display:flex] [justify-content:space-between] [gap:12px] [margin-bottom:14px]">
        <el-input v-model="studentSearch" placeholder="搜索姓名或学号" clearable class="student-toolbar__search [width:100%] [max-width:260px]" />
        <el-button type="primary" size="small" @click="openAddStudentDialog">添加学生</el-button>
      </div>
      <el-table :data="filteredStudents" stripe size="small" v-loading="studentsLoading" max-height="420">
        <el-table-column type="index" label="#" width="56" />
        <el-table-column prop="studentNum" label="学号" width="160" />
        <el-table-column prop="studentName" label="姓名" width="140" />
        <el-table-column prop="joinedAt" label="加入时间" min-width="180">
          <template #default="{ row }">{{ formatTime(row.joinedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="confirmRemoveStudent(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="student-count [margin-top:14px] [font-size:13px] [color:#7f90a4]">共{{ students.length }} 名学生</div>
    </el-dialog>

    <el-dialog v-model="addStudentVisible" title="添加学生" width="400px" append-to-body>
      <el-form :model="addStudentForm" label-width="60px">
        <el-form-item label="姓名">
          <el-input v-model="addStudentForm.studentName" placeholder="学生姓名" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="addStudentForm.studentNum" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStudentVisible = false">取消</el-button>
        <el-button type="primary" @click="doAddStudent" :loading="addingStudent">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="syncDialogVisible" title="PTA 同步账号" width="480px" destroy-on-close>
      <el-alert
        type="info"
        :closable="false"
        class="cookie-helper [margin-bottom:16px] [border-radius:14px]"
        title="优先使用个人资料中已绑定的PTA 账号；这里临时填写的账号密码只覆盖本次同步。若未绑定且这里留空，则只尝试当前Cookie 会话。"
      />
      <div v-if="hasBoundPtaCredentials" class="sync-dialog__bound [margin:12px_0_16px] [padding:10px_12px] [border-radius:12px] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px]">
        已绑定PTA 账号：{{ boundPtaUsername }}（留空时将默认用于本次同步）
      </div>
      <div v-else class="sync-dialog__bound sync-dialog__bound--warning [margin:12px_0_16px] [padding:10px_12px] [border-radius:12px] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px] [background:#fef7e0] [color:#b26a00]">
        当前未绑定PTA 账号；若本次留空，则只会尝试现有 Cookie。
      </div>
      <el-form :model="syncForm" label-width="90px" autocomplete="off">
        <el-form-item label="同步关键词">
          <el-input v-model="syncForm.ptaKeyword" autocomplete="off" name="pta-sync-keyword" placeholder="例如：计科5数据结构" clearable />
        </el-form-item>
        <el-form-item label="PTA 账号">
          <el-input v-model="syncForm.ptaUsername" autocomplete="off" name="pta-sync-username" placeholder="本次同步使用的PTA 账号（可选）" clearable />
        </el-form-item>
        <el-form-item label="PTA 密码">
          <el-input
            v-model="syncForm.ptaPassword"
            autocomplete="new-password"
            name="pta-sync-password"
            type="password"
            show-password
            placeholder="本次同步使用的PTA 密码（可选）"
            clearable
          />
        </el-form-item>
      </el-form>
      <div class="sync-dialog__actions [display:flex] [gap:8px] [margin-top:4px]">
        <el-button size="small" type="primary" plain @click="submitSyncTempCredential">提交临时账号密码</el-button>
        <el-button size="small" @click="clearSyncTempCredential">清空临时凭据</el-button>
      </div>
      <div v-if="syncTempCredentialSubmitted" class="sync-dialog__bound [margin:12px_0_16px] [padding:10px_12px] [border-radius:12px] [background:#e6f4ea] [color:#1e8e3e] [font-size:13px]">
        已提交临时PTA 账号：{{ syncForm.ptaUsername.trim() }}，本次同步将优先使用该账号。
      </div>
      <div class="sync-dialog__source [display:flex] [align-items:center] [gap:8px] [margin:12px_0_4px] [color:#44536b] [font-size:13px]">
        <span>本次预计使用：</span>
        <el-tag size="small" effect="plain" :type="credentialSourceTagType(plannedSyncCredentialSource)">{{ credentialSourceText(plannedSyncCredentialSource) }}</el-tag>
      </div>
      <template #footer>
        <el-button @click="syncDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="syncDialogClass ? syncingMap[syncDialogClass.id] : false" @click="triggerSyncForClass">
          开始同步
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="cookieDialogVisible" title="手动更新 PTA Cookie" width="600px" destroy-on-close>
      <el-steps :active="1" simple class="cookie-steps [margin-bottom:18px] [padding-left:18px] [font-size:12.5px] [color:#3c4043] [line-height:1.8]">
        <el-step title="获取 Cookie" />
        <el-step title="粘贴到下方" />
        <el-step title="验证生效" />
      </el-steps>

      <el-alert type="info" :closable="false" class="cookie-helper [margin-bottom:16px] [border-radius:14px]">
        <template #title>
          <span class="cookie-helper__title [font-weight:600]">获取步骤</span>
        </template>
        <template #default>
          <ol class="cookie-helper__list [margin:8px_0_0] [padding-left:18px] [color:#4d6077] [line-height:1.8]">
            <li>打开 <a href="https://pintia.cn" target="_blank" rel="noopener noreferrer">pintia.cn</a> 并登录。</li>
            <li>按`F12` 打开开发者工具，切换到`Application`。</li>
            <li>在左侧找到`Cookies`，选择 `https://pintia.cn`。</li>
            <li>复制导出的Cookie JSON，粘贴到下方输入框。</li>
          </ol>
        </template>
      </el-alert>

      <el-input
        v-model="cookieInput"
        type="textarea"
        :rows="8"
        placeholder='粘贴 Cookie JSON，例如：[{"name":"PTASession","value":"xxx","domain":".pintia.cn"}]'
        class="cookie-textarea"
      />

      <div v-if="cookieSubmitResult" class="cookie-result [margin-top:12px] [display:flex] [align-items:center] [gap:10px] [margin-top:14px] [gap:6px] [padding:10px_14px] [border-radius:8px] [font-size:13px] [&.valid]:[background:#e6f4ea] [&.valid]:[color:#1e8e3e] [&.invalid]:[background:#fce8e6] [&.invalid]:[color:#d93025]">
        <el-alert
          :title="cookieSubmitResult.message"
          :type="cookieSubmitResult.valid ? 'success' : 'error'"
          :closable="false"
          show-icon
        />
      </div>

      <template #footer>
        <el-button @click="cookieDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitCookieForm"
          :loading="cookieSubmitting"
          :disabled="!cookieInput.trim()"
        >
          验证并保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled, Plus } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import { useUserStore } from '../../store'
import {
  addClassStudent,
  createTeachingClass,
  deleteTeachingClass,
  getClassStudents,
  getPtaCookieStatus,
  getTeacherPtaCredentials,
  getTeachingClasses,
  importPtaStudents,
  removeClassStudent,
  submitPtaCookie,
  triggerPtaSync,
  updateTeachingClass
} from '../../api/tap'
import { getFriendlyErrorMessage } from '../../utils/errorMessage'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const classes = ref([])
const gradeOptions = ['2022', '2023', '2024', '2025', '2026', '2027']

const classDialogVisible = ref(false)
const editingClass = ref(null)
const submitting = ref(false)
const classFormRef = ref(null)
const classForm = reactive({
  name: '',
  classCode: '',
  joinPassword: '',
  grade: '',
  courseName: '',
  description: '',
  ptaKeyword: '',
  syncEnabled: false
})
const classRules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  classCode: [{ required: true, message: '请输入班级号', trigger: 'blur' }],
  joinPassword: [{ required: true, message: '请设置加入密码', trigger: 'blur' }]
}

const syncingMap = reactive({})
const importingMap = reactive({})

const studentDialogVisible = ref(false)
const currentClass = ref(null)
const students = ref([])
const studentsLoading = ref(false)
const studentSearch = ref('')

const addStudentVisible = ref(false)
const addStudentForm = reactive({ studentName: '', studentNum: '' })
const addingStudent = ref(false)

const cookieStatus = ref('UNKNOWN')
const cookieDialogVisible = ref(false)
const cookieInput = ref('')
const cookieSubmitting = ref(false)
const cookieSubmitResult = ref(null)
const syncDialogVisible = ref(false)
const syncDialogClass = ref(null)
const syncForm = reactive({ ptaKeyword: '', ptaUsername: '', ptaPassword: '' })
const syncTempCredentialSubmitted = ref(false)
const boundPtaUsername = ref('')
const hasBoundPtaCredentials = ref(false)

const extract = (res) => res?.data ?? res

const replacementChar = String.fromCharCode(0xfffd)

const isCorruptedText = (value) => {
  const text = String(value || '').trim()
  if (!text) return true
  const mojibakeMarkers = ['鑾', '姝', '鍙', '鍚', '鐢', '鐝', '鏁', '瀹', '澶', '绾', '浣', '鎻', '鎵', '淇', '閿', '绯', '鍓', '褰', '闈', '璇']
  return text.includes('??') || text.includes(replacementChar) || mojibakeMarkers.some(marker => text.includes(marker))
}

const cleanText = (value, fallback = '未设置') => {
  const text = String(value || '').trim()
  if (!text || isCorruptedText(text)) return fallback
  return text
}

const studentCountValue = (cls) => Number(cls?.studentCount || 0)
const hasPtaConfig = (cls) => !isCorruptedText(cls?.ptaKeyword) && !!String(cls?.ptaKeyword || '').trim()

const displayClassCode = (cls) => cleanText(cls?.classCode, '未生成')
const displayClassName = (cls) => cleanText(cls?.name, displayClassCode(cls) === '未生成' ? '未命名班级' : `班级 ${displayClassCode(cls)}`)
const displayCourseName = (cls) => cleanText(cls?.courseName, '课程信息待补充')
const displayDescription = (cls) => cleanText(cls?.description, '暂无描述')
const displayPtaKeyword = (cls) => cleanText(cls?.ptaKeyword, '未配置')
const displayJoinPassword = (cls) => cleanText(cls?.joinPassword, '未设置')
const displayGrade = (cls) => {
  const grade = cleanText(cls?.grade, '')
  return grade ? `${grade} 级` : '未设置年级'
}

const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value
  const query = studentSearch.value.toLowerCase()
  return students.value.filter(item =>
    String(item.studentName || '').toLowerCase().includes(query) ||
    String(item.studentNum || '').toLowerCase().includes(query)
  )
})

const resolvePtaKeyword = () => (classForm.ptaKeyword || classForm.name || '').trim()

const toSelectedClass = (cls) => ({
  id: cls.id,
  name: displayClassName(cls),
  ptaKeyword: cls.ptaKeyword || cls.name || ''
})

const loadClasses = async () => {
  loading.value = true
  try {
    const res = await getTeachingClasses()
    classes.value = extract(res) || []
  } catch (error) {
    ElMessage.error(`加载班级失败：${error.message}`)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingClass.value = null
  Object.assign(classForm, {
    name: '',
    classCode: '',
    joinPassword: '',
    grade: '',
    courseName: '',
    description: '',
    ptaKeyword: '',
    syncEnabled: false
  })
  classDialogVisible.value = true
}

const editClass = (cls) => {
  editingClass.value = cls
  Object.assign(classForm, {
    name: cleanText(cls.name, ''),
    classCode: cleanText(cls.classCode, ''),
    joinPassword: cleanText(cls.joinPassword, ''),
    grade: cleanText(cls.grade, ''),
    courseName: cleanText(cls.courseName, ''),
    description: cleanText(cls.description, ''),
    ptaKeyword: cleanText(cls.ptaKeyword, ''),
    syncEnabled: !!cls.syncEnabled
  })
  classDialogVisible.value = true
}

const generateCode = () => {
  classForm.classCode = `C${Date.now().toString(36).toUpperCase().slice(-6)}`
}

const submitClassForm = async () => {
  const valid = await classFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const ptaKeyword = resolvePtaKeyword()
    if (editingClass.value) {
      await updateTeachingClass(editingClass.value.id, {
        name: classForm.name,
        joinPassword: classForm.joinPassword,
        grade: classForm.grade,
        courseName: classForm.courseName,
        description: classForm.description,
        ptaKeyword,
        syncEnabled: classForm.syncEnabled
      })
      ElMessage.success('班级更新成功')
    } else {
      const res = await createTeachingClass({ ...classForm, ptaKeyword })
      const created = extract(res)
      if (created?.id) {
        userStore.setSelectedClass(toSelectedClass({
          ...created,
          ptaKeyword: created.ptaKeyword || ptaKeyword || created.name
        }))
      }
      ElMessage.success('班级创建成功')
      if (ptaKeyword && created?.id) {
        try {
          await triggerPtaSync(created.id)
          ElMessage.success('已自动触发PTA 数据同步')
        } catch (syncError) {
          ElMessage.warning(`班级已创建，但自动同步失败：${syncError.message || '爬虫服务可能未启动'}`)
        }
      }
    }

    classDialogVisible.value = false
    await loadClasses()
  } catch (error) {
    ElMessage.error(error.message || '保存班级失败')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (cls) => {
  ElMessageBox.confirm(
      `确定删除班级“${displayClassName(cls)}”？此操作不可恢复，班级内学生关系也会一并删除。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteTeachingClass(cls.id)
      ElMessage.success('删除成功')
      await loadClasses()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const copyCode = async (code) => {
  if (!code || code === '未生成') return
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('班级号已复制')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

const enterClassSpace = (cls) => {
  userStore.setSelectedClass(toSelectedClass(cls))
  ElMessage.success(`已切换到 ${displayClassName(cls)}`)
  router.push('/teacher/dashboard')
}

const viewAnalysis = (cls) => {
  userStore.setSelectedClass(toSelectedClass(cls))
  router.push(`/teacher/class-detailed-analysis/${cls.id}`)
}

const syncTagType = (status) => {
  const tagMap = {
    SUCCESS: 'success',
    RUNNING: 'warning',
    FAILED: 'danger',
    IDLE: 'info'
  }
  return tagMap[status] || 'info'
}

const syncStatusText = (status) => {
  const textMap = {
    SUCCESS: '已同步',
    RUNNING: '同步中',
    FAILED: '同步失败',
    IDLE: '未同步'
  }
  return textMap[status] || '未同步'
}

const credentialSourceText = (source) => ({
  temporary: '临时账号',
  bound: '已绑定账号',
  cookie: 'Cookie'
}[String(source || '').trim().toLowerCase()] || '未知来源')

const credentialSourceTagType = (source) => ({
  temporary: 'warning',
  bound: 'success',
  cookie: 'info'
}[String(source || '').trim().toLowerCase()] || 'info')

const plannedSyncCredentialSource = computed(() => {
  if (syncTempCredentialSubmitted.value && syncForm.ptaUsername.trim() && syncForm.ptaPassword) return 'temporary'
  if (hasBoundPtaCredentials.value) return 'bound'
  return 'cookie'
})

const submitSyncTempCredential = () => {
  const username = syncForm.ptaUsername.trim()
  const password = syncForm.ptaPassword
  if (!username || !password) {
    ElMessage.warning('请先输入完整的临时PTA 账号和密码，再点击提交')
    return
  }
  syncTempCredentialSubmitted.value = true
  ElMessage.success(`已提交临时PTA 账号：${username}`)
}

const clearSyncTempCredential = () => {
  syncForm.ptaUsername = ''
  syncForm.ptaPassword = ''
  syncTempCredentialSubmitted.value = false
}

const triggerSyncForClass = async () => {
  const cls = syncDialogClass.value
  if (!cls) return
  const keyword = syncForm.ptaKeyword.trim()
  const draftUsername = syncForm.ptaUsername.trim()
  const draftPassword = syncForm.ptaPassword
  if (!keyword) {
    ElMessage.warning('请输入本次同步使用的 PTA 关键词')
    return
  }
  if ((draftUsername && !draftPassword) || (!draftUsername && draftPassword)) {
    ElMessage.warning('请输入完整的 PTA 账号和密码，或保持两项都为空。')
    return
  }
  if ((draftUsername || draftPassword) && !syncTempCredentialSubmitted.value) {
    ElMessage.warning('若要使用临时 PTA 账号，请先点击“提交临时账号密码”')
    return
  }
  const username = syncTempCredentialSubmitted.value ? draftUsername : ''
  const password = syncTempCredentialSubmitted.value ? draftPassword : ''
  syncingMap[cls.id] = true
  try {
    const res = await triggerPtaSync(cls.id, {
      ptaKeyword: keyword,
      ...(username ? { ptaUsername: username, ptaPassword: password } : {})
    })
    const data = extract(res) || {}
    cls.ptaKeyword = keyword
    cls.syncStatus = 'RUNNING'
    syncDialogVisible.value = false
    syncForm.ptaKeyword = ''
    clearSyncTempCredential()
    ElMessage.success(`同步任务已提交，本次使用${credentialSourceText(data?.credentialSource || data?.credential_source || plannedSyncCredentialSource.value)}`)
  } catch (error) {
    ElMessage.error(error.message || '同步失败')
  } finally {
    syncingMap[cls.id] = false
  }
}

const manageStudents = async (cls) => {
  currentClass.value = cls
  studentDialogVisible.value = true
  studentsLoading.value = true
  try {
    const res = await getClassStudents(cls.id)
    students.value = extract(res) || []
  } catch (error) {
    ElMessage.error(error.message || '加载学生列表失败')
  } finally {
    studentsLoading.value = false
  }
}

const importStudentsForClass = async (cls) => {
  importingMap[cls.id] = true
  try {
    const res = await importPtaStudents(cls.id)
    const data = extract(res) || {}
    const matched = Number(data.matchedStudentCount || 0)
    const created = Number(data.createdCount || 0)
    const updated = Number(data.updatedCount || 0)

    if (matched === 0) {
      ElMessage.warning(`未找到${displayClassName(cls)} 的已同步 PTA 学生数据`)
    } else {
      ElMessage.success(`已导入${created} 人，更新 ${updated} 人`)
    }

    if (currentClass.value?.id === cls.id && studentDialogVisible.value) {
      const studentRes = await getClassStudents(cls.id)
      students.value = extract(studentRes) || []
    }
    await loadClasses()
  } catch (error) {
    ElMessage.error(error.message || '导入 PTA 学生失败')
  } finally {
    importingMap[cls.id] = false
  }
}

const openAddStudentDialog = () => {
  addStudentForm.studentName = ''
  addStudentForm.studentNum = ''
  addStudentVisible.value = true
}

const doAddStudent = async () => {
  if (!addStudentForm.studentName.trim()) {
    ElMessage.warning('请输入学生姓名')
    return
  }

  addingStudent.value = true
  try {
    await addClassStudent(currentClass.value.id, { ...addStudentForm })
    ElMessage.success('添加成功')
    addStudentVisible.value = false
    const res = await getClassStudents(currentClass.value.id)
    students.value = extract(res) || []
    await loadClasses()
  } catch (error) {
    ElMessage.error(error.message || '添加学生失败')
  } finally {
    addingStudent.value = false
  }
}

const confirmRemoveStudent = (row) => {
  ElMessageBox.confirm(`确定移除学生“${row.studentName}”吗？`, '提示', {
    confirmButtonText: '移除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await removeClassStudent(currentClass.value.id, row.id)
      students.value = students.value.filter(item => item.id !== row.id)
      ElMessage.success('已移除')
      await loadClasses()
    } catch (error) {
      ElMessage.error(error.message || '移除失败')
    }
  }).catch(() => {})
}

const formatTime = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN')
}

const checkCookieStatus = async () => {
  try {
    const res = await getPtaCookieStatus()
    const data = extract(res)
    cookieStatus.value = data?.status || 'UNKNOWN'
  } catch {
    cookieStatus.value = 'UNKNOWN'
  }
}

const loadBoundCredentials = async () => {
  try {
    const res = await getTeacherPtaCredentials()
    const data = extract(res) || {}
    boundPtaUsername.value = data?.ptaUsername || ''
    hasBoundPtaCredentials.value = !!data?.bound
  } catch {
    boundPtaUsername.value = ''
    hasBoundPtaCredentials.value = false
  }
}

const openSyncDialog = (cls) => {
  syncDialogClass.value = cls
  syncForm.ptaKeyword = cls?.ptaKeyword || cls?.name || ''
  clearSyncTempCredential()
  syncDialogVisible.value = true
}

const openCookieDialog = () => {
  cookieInput.value = ''
  cookieSubmitResult.value = null
  cookieDialogVisible.value = true
}

const submitCookieForm = async () => {
  cookieSubmitting.value = true
  cookieSubmitResult.value = null
  try {
    const res = await submitPtaCookie(cookieInput.value.trim())
    const data = extract(res)
    cookieSubmitResult.value = data
    if (data?.valid) {
      cookieStatus.value = 'OK'
      ElMessage.success('Cookie 更新成功，数据同步已恢复')
      setTimeout(() => {
        cookieDialogVisible.value = false
      }, 1500)
    }
  } catch (error) {
    cookieSubmitResult.value = {
      valid: false,
      message: getFriendlyErrorMessage(error, 'Cookie 提交失败，请稍后重试')
    }
  } finally {
    cookieSubmitting.value = false
  }
}

onMounted(() => {
  loadClasses()
  checkCookieStatus()
  loadBoundCredentials()
})

watch(() => [syncForm.ptaUsername, syncForm.ptaPassword], () => {
  if (syncTempCredentialSubmitted.value) {
    syncTempCredentialSubmitted.value = false
  }
})
</script>

