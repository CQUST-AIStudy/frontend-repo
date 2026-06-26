import {
  getMyProfile,
  getProfileSkillStates,
  getStudentProfile
} from '@/api/tap/profile'
import logger from '@/utils/logger'

function unwrapApiPayload(response) {
  const body = response?.data ?? response
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body
}

function readLocalUserInfo() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem('userInfo')
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    logger.warn('[student-graph] 本地用户信息解析失败', error)
    return {}
  }
}

export function resolveCurrentStudentId() {
  const userInfo = readLocalUserInfo()
  return userInfo.usernum || userInfo.studentId || ''
}

function normalizeSkillStates(response) {
  const payload = unwrapApiPayload(response)
  if (Array.isArray(payload?.skills)) return payload.skills
  if (Array.isArray(payload)) return payload
  return []
}

async function loadProfileWithFallback() {
  try {
    return {
      profile: unwrapApiPayload(await getMyProfile()) || {},
      source: 'me'
    }
  } catch (error) {
    const studentId = resolveCurrentStudentId()
    if (!studentId) throw error
    return {
      profile: unwrapApiPayload(await getStudentProfile(studentId)) || {},
      source: 'student'
    }
  }
}

export async function loadStudentLearningProfile() {
  const result = await loadProfileWithFallback()
  const profileData = result.profile && typeof result.profile === 'object' ? result.profile : {}

  try {
    const skills = normalizeSkillStates(await getProfileSkillStates())
    if (skills.length) profileData.skillStates = skills
  } catch (error) {
    logger.warn('[student-graph] 加载技能点掌握度失败（降级到维度/实验级映射）', error)
  }

  return {
    ...result,
    profile: profileData,
    skillStatesLoaded: Array.isArray(profileData.skillStates) && profileData.skillStates.length > 0
  }
}
