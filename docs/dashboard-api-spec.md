# 学生端首页 Dashboard 后端 API 接口规范

## 已有接口（前端已调用）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/profile/me` | GET | 学生档案（用户名、班级、能力数据） |
| `/api/experiments` | GET | 实验列表（含 deadline、status、score、problemCount 等） |
| `/api/student/wrong-questions` | GET | 错题本列表（query: limit, offset） |
| `/api/student/current/pta-practice-sets` | GET | PTA 推荐练习集 |
| `/api/recommendations/leetcode/sync` | GET | LeetCode 推荐题目 |

---

## 需后端新增的接口

### 1. 学习数据概览（本周）

```
GET /api/student/dashboard/weekly-stats
```

**请求：** 无参数（通过 JWT 识别当前学生）

**返回 JSON：**
```json
{
  "success": true,
  "data": {
    "experimentDone": "2/6",
    "accuracy": 66,
    "submissions": 8,
    "studyHours": 3.2,
    "chartData": {
      "dates": ["05-08", "05-09", "05-10", "05-11", "05-12", "05-13", "05-14"],
      "values": [0.5, 0.8, 0.3, 1.5, 2.1, 0.6, 1.2]
    }
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `experimentDone` | string | 格式 "已完成数/总数"，如 "2/6" |
| `accuracy` | number | 本周正确率，百分比数值，如 66 表示 66% |
| `submissions` | number | 本周提交次数 |
| `studyHours` | number | 本周学习时长（小时），保留 1 位小数 |
| `chartData.dates` | string[] | 本周每日日期，格式 "MM-DD"，长度 7 |
| `chartData.values` | number[] | 对应的每日学习时长（小时），与 dates 一一对应 |

---

### 2. 最新反馈

```
GET /api/student/dashboard/feedback
```

**请求：** 无参数（通过 JWT 识别当前学生），默认返回最近 3 条

**返回 JSON：**
```json
{
  "success": true,
  "data": [
    {
      "icon": "ai_report",
      "msg": "链表操作实验 AI 批改报告已生成",
      "time": "2025-05-16T14:32:00"
    },
    {
      "icon": "teacher_note",
      "msg": "二叉树实验 教师批注已发布",
      "time": "2025-05-15T20:15:00"
    },
    {
      "icon": "score_update",
      "msg": "栈与队列实验 成绩已更新",
      "time": "2025-05-16T09:00:00"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `icon` | string | 图标类型：`ai_report` / `teacher_note` / `score_update` / `ai_comment` / `report_generated` |
| `msg` | string | 反馈文字描述 |
| `time` | string | ISO 8601 时间戳，前端自动格式化为相对时间 |

**前端图标映射（后端只需返回 icon 类型，前端自行渲染）：**
- `ai_report` → 🤖
- `teacher_note` → ⭐
- `score_update` → 📄
- `ai_comment` → 💬
- `report_generated` → 📝

---

## 接口实现建议

### weekly-stats 数据来源
- `experimentDone`: 查询实验表，统计 status='completed' 的数量 / 总数
- `accuracy`: 查询本周提交记录，计算 AC 率
- `submissions`: 查询本周提交记录总数
- `studyHours`: 从学习行为日志表统计（若无，可暂用提交次数估算）
- `chartData`: 按天聚合本周学习时长

### feedback 数据来源
- 查询最近 3 条与当前学生相关的事件：
  - AI 批改报告生成（error_analysis 表有新记录）
  - 教师批注（submissions 表 teacher_comment 字段更新）
  - 成绩更新（submissions 表 score 字段更新）
- 按时间倒序排列
