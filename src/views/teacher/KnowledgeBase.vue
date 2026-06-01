<template>
  <div class="knowledge-base-container">
    <page-header title="课程知识库" description="管理课程资料、查看 RAG 处理状态，并进行课程问答" />

    <div v-if="!selectedSpace" class="space-list-view">
      <div class="mb-5">
        <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-2" @click="showCreateDialog">
          <Plus class="w-4 h-4" />
          创建课程空间
        </button>
      </div>

      <div
        v-if="currentClassName"
        class="mb-5 rounded-[16px] border border-blue-200 bg-blue-50/80 p-4 flex items-start gap-3"
      >
        <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
        <div>
          <div class="font-medium text-[#1d1d1f] text-sm">当前班级：{{ currentClassName }}</div>
          <div class="text-sm text-[#6e6e73] mt-1">
            <span v-if="hasClassScopedSpaces">当前仅展示绑定到该班级的课程空间，知识问答会按当前班级作用域执行。</span>
            <span v-else>当前班级还没有专属课程空间，暂时展示你名下的全部课程空间。</span>
          </div>
        </div>
      </div>

      <div v-if="visibleSpaces.length === 0 && !loading" class="flex flex-col items-center justify-center py-16 text-[#6e6e73]">
        <svg class="w-12 h-12 text-[#c3cad6] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
        <p class="text-sm">暂无课程空间，先创建一个再上传资料</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" v-loading="loading">
        <div v-for="space in visibleSpaces" :key="space.id"
          class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] cursor-pointer transition-all hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
          @click="selectSpace(space)"
        >
          <div class="flex justify-between items-center gap-3 p-5 pb-3 border-b border-black/[0.06]">
            <span class="font-semibold text-[16px] text-[#1d1d1f] truncate">{{ space.name }}</span>
            <div class="flex items-center gap-2">
              <span :class="visibilityBadgeClass(space.docVisibility)" class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ visibilityLabel(space.docVisibility) }}
              </span>
              <div class="relative" @click.stop>
                <button @click="toggleSpaceDropdown(space.id)" class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent">
                  <MoreFilled class="w-[18px] h-[18px] text-[#aeaeb2]" />
                </button>
                <div v-show="spaceDropdownId === space.id" class="absolute right-0 top-full mt-1 w-[120px] py-1 rounded-[12px] bg-white border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-10">
                  <button @click="editSpace(space); spaceDropdownId = null" class="w-full text-left px-3 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors border-none bg-transparent cursor-pointer">编辑</button>
                  <button @click="confirmDeleteSpace(space); spaceDropdownId = null" class="w-full text-left px-3 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors border-none bg-transparent cursor-pointer">删除</button>
                </div>
              </div>
            </div>
          </div>

          <div class="p-5 pt-3 space-y-1.5 text-sm text-[#1d1d1f]">
            <p v-if="space.term" class="flex items-center gap-2"><Calendar class="w-4 h-4 text-[#aeaeb2]" />{{ space.term }}</p>
            <p v-if="space.courseName" class="flex items-center gap-2"><Reading class="w-4 h-4 text-[#aeaeb2]" />{{ space.courseName }}</p>
            <p class="text-[#6b7280]">模式：{{ modeLabel(space.defaultMode) }}</p>
            <p v-if="space.docVisibility === 'class'" class="text-[#6b7280]">绑定班级：{{ (space.boundClassIds || []).length }}</p>
            <p class="text-[#6b7280]">文档数：{{ space.docCount || 0 }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="space-detail-view">
      <div class="flex items-center gap-3 mb-4">
        <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none inline-flex items-center gap-2" @click="backToList">
          <ArrowLeft class="w-4 h-4" />
          返回
        </button>
        <h2 class="text-lg font-semibold text-[#1d1d1f]">{{ selectedSpace.name }}</h2>
        <span v-if="selectedSpace.term" class="text-[#6e6e73] text-sm bg-[#f5f5f7] px-2.5 py-0.5 rounded-full">{{ selectedSpace.term }}</span>
        <span :class="visibilityBadgeClass(selectedSpace.docVisibility)" class="text-xs px-2 py-0.5 rounded-full font-medium">
          {{ visibilityLabel(selectedSpace.docVisibility) }}
        </span>
      </div>

      <!-- Custom Tabs -->
      <div class="flex items-center gap-1 p-1 rounded-[12px] bg-black/[0.04] mb-4">
        <button v-for="tab in detailTabs" :key="tab.name" @click="activeTab = tab.name" class="h-[32px] px-4 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer border-none" :class="activeTab === tab.name ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#6e6e73] bg-transparent'">{{ tab.label }}</button>
      </div>

      <!-- Docs Tab -->
      <div v-show="activeTab === 'docs'">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
          <div class="font-semibold text-[15px] text-[#1d1d1f] mb-4">上传课程资料</div>

          <el-upload
            drag
            multiple
            :auto-upload="false"
            :on-change="onFileChange"
            :file-list="pendingFiles"
            accept=".pdf,.docx,.txt,.md"
          >
            <UploadFilled class="w-8 h-8 text-[#c3cad6] mb-2" />
            <div class="text-sm text-[#6e6e73]">拖拽文件到这里，或点击选择文件</div>
            <template #tip>
              <div class="text-xs text-[#aeaeb2] mt-2">支持 PDF、DOCX、TXT、Markdown，适合教材、讲义、参考资料</div>
            </template>
          </el-upload>

          <div v-if="pendingFiles.length > 0" class="mt-3 flex justify-end gap-2 items-center">
            <select v-model="uploadDocType" class="h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm w-[160px]">
              <option value="textbook">教材</option>
              <option value="lecture">讲义</option>
              <option value="reference">参考书</option>
              <option value="exercise">习题集</option>
              <option value="other">其他</option>
            </select>
            <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none" :disabled="uploading" @click="uploadFiles">
              {{ uploading ? '上传中...' : `上传 ${pendingFiles.length} 个文件` }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-5 gap-3 mb-4">
          <div class="p-4 rounded-[14px] bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] border border-[#dbe5f0]">
            <div class="text-[13px] text-[#6b7280]">文档总数</div>
            <div class="mt-2 text-[28px] font-bold text-[#111827]">{{ docStatusSummary.total }}</div>
          </div>
          <div class="p-4 rounded-[14px] bg-gradient-to-br from-[#effaf3] to-[#dcfce7] border border-[#bbf7d0]">
            <div class="text-[13px] text-[#6b7280]">已就绪</div>
            <div class="mt-2 text-[28px] font-bold text-[#111827]">{{ docStatusSummary.ready }}</div>
          </div>
          <div class="p-4 rounded-[14px] bg-gradient-to-br from-[#fff8eb] to-[#fef3c7] border border-[#fde68a]">
            <div class="text-[13px] text-[#6b7280]">处理中</div>
            <div class="mt-2 text-[28px] font-bold text-[#111827]">{{ docStatusSummary.pending + docStatusSummary.processing }}</div>
          </div>
          <div class="p-4 rounded-[14px] bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] border border-[#fecdd3]">
            <div class="text-[13px] text-[#6b7280]">失败</div>
            <div class="mt-2 text-[28px] font-bold text-[#111827]">{{ docStatusSummary.failed }}</div>
          </div>
          <div class="p-4 rounded-[14px] bg-gradient-to-br from-[#eef6ff] to-[#dbeafe] border border-[#bfdbfe]">
            <div class="text-[13px] text-[#6b7280]">总分块</div>
            <div class="mt-2 text-[28px] font-bold text-[#111827]">{{ docStatusSummary.totalChunks }}</div>
          </div>
        </div>

        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
          <div class="flex justify-between items-center gap-3 mb-4">
            <span class="font-semibold text-[15px] text-[#1d1d1f]">文档处理结果</span>
            <div class="flex items-center gap-2">
              <button class="text-sm text-[#007aff] hover:text-[#005ec4] bg-transparent border-none cursor-pointer" :disabled="docsLoading" @click="loadDocuments">刷新</button>
              <button class="text-sm text-[#007aff] hover:text-[#005ec4] bg-transparent border-none cursor-pointer" :disabled="docActionLoading" @click="rebuildBm25IndexAction">重建 BM25</button>
              <button class="h-[32px] px-3 rounded-[8px] text-xs font-medium text-[#f59e0b] bg-[#fffbeb] border border-[#fde68a] hover:bg-[#fef3c7] active:scale-[0.96] transition-all cursor-pointer" :disabled="docActionLoading" @click="reprocessAllDocuments">
                全部重处理
              </button>
            </div>
          </div>

          <div v-if="documents.length === 0 && !docsLoading" class="flex flex-col items-center justify-center py-12 text-[#6e6e73]">
            <svg class="w-10 h-10 text-[#c3cad6] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-sm">暂无文档，请先上传课程资料</p>
          </div>

          <div v-else class="overflow-x-auto" v-loading="docsLoading">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-black/[0.06]">
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">任务 ID</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">文档 ID</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">类型</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">状态</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">分块数</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">创建时间</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">错误信息</th>
                  <th class="text-left py-3 px-2 font-medium text-[#6e6e73] text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in documents" :key="row.id" class="border-b border-black/[0.03] hover:bg-black/[0.02] transition-colors">
                  <td class="py-3 px-2 text-[#1d1d1f]">{{ row.id }}</td>
                  <td class="py-3 px-2 text-[#1d1d1f]">{{ row.documentId }}</td>
                  <td class="py-3 px-2 text-[#1d1d1f]">{{ docTypeLabel(row.docType) }}</td>
                  <td class="py-3 px-2">
                    <span :class="statusBadgeClass(row.status)" class="text-xs px-2 py-0.5 rounded-full font-medium">{{ statusLabel(row.status) }}</span>
                  </td>
                  <td class="py-3 px-2 text-[#1d1d1f]">{{ row.chunkCount }}</td>
                  <td class="py-3 px-2 text-[#1d1d1f]">{{ row.createdAt }}</td>
                  <td class="py-3 px-2">
                    <span v-if="row.errorMessage" class="text-xs text-[#d93025] bg-[#fef0f0] px-2 py-1 rounded">{{ row.errorMessage }}</span>
                    <span v-else class="text-[#aeaeb2]">-</span>
                  </td>
                  <td class="py-3 px-2">
                    <button class="text-sm text-[#007aff] hover:text-[#005ec4] bg-transparent border-none cursor-pointer" :disabled="docRowLoadingId === row.id" @click="reprocessDocument(row)">
                      {{ docRowLoadingId === row.id ? '处理中...' : '重处理' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Chat Tab -->
      <div v-show="activeTab === 'chat'">
        <div class="flex flex-col h-[520px] border border-black/[0.06] rounded-[16px] overflow-hidden">
          <div ref="chatMessagesRef" class="flex-1 overflow-y-auto p-4 bg-[#f8fafc]">
            <div v-if="chatMessages.length === 0" class="text-center py-16 text-[#6b7280]">
              <ChatDotRound class="w-12 h-12 text-[#c3cad6] mx-auto mb-3" />
              <p class="text-sm">向当前课程知识库提问，回答会基于已上传并处理完成的资料生成。</p>
              <div class="mt-4 flex flex-wrap gap-2 justify-center">
                <button v-for="suggestion in suggestions" :key="suggestion" @click="askQuestion(suggestion)" class="h-[30px] px-3 rounded-full text-xs font-medium text-[#1d1d1f] bg-white border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#f5f5f7] active:scale-[0.96] transition-all cursor-pointer">
                  {{ suggestion }}
                </button>
              </div>
            </div>

            <div v-for="(msg, idx) in chatMessages" :key="idx" class="mb-3 flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
              <div class="max-w-[80%] px-3.5 py-2.5 rounded-[14px] text-sm leading-[1.7]" :class="msg.role === 'user' ? 'bg-gradient-to-b from-[#3898ff] to-[#007aff] text-white' : 'bg-white border border-black/[0.06] text-[#1d1d1f]'">
                <div v-if="msg.role === 'user'">{{ msg.content }}</div>
                <div v-else v-html="renderMarkdown(msg.content)"></div>
                <div v-if="msg.citations && msg.citations.length" class="mt-2 pt-2 border-t border-black/[0.06]">
                  <span class="text-xs text-[#6b7280] mr-1">引用来源：</span>
                  <span v-for="citation in msg.citations" :key="citation.index" class="inline-block text-xs bg-[#f0f5ff] text-[#007aff] px-1.5 py-0.5 rounded m-0.5">
                    [{{ citation.index }}] {{ citation.docName }} {{ citation.chapterPath }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="chatLoading" class="mb-3 flex justify-start">
              <div class="max-w-[80%] px-3.5 py-2.5 rounded-[14px] text-sm bg-white border border-black/[0.06]">
                <span class="text-[#6b7280] italic">AI 正在思考...</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2 p-3 bg-white border-t border-black/[0.06] items-end">
            <textarea
              v-model="chatInput"
              rows="2"
              placeholder="输入问题，例如：什么是二叉搜索树？"
              :disabled="chatLoading"
              @keydown.enter.ctrl="sendChat"
              class="flex-1 px-3 py-2 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-none"
            ></textarea>
            <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!chatInput.trim() || chatLoading" @click="sendChat">
              {{ chatLoading ? '发送中...' : '发送' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Annotations Tab -->
      <div v-show="activeTab === 'annotations'">
        <div class="rounded-[20px] border border-black/[0.06] bg-white/95 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
          <div class="flex justify-between items-center gap-3 mb-4">
            <span class="font-semibold text-[15px] text-[#1d1d1f]">知识分块（{{ chunks.length }}）</span>
            <button class="text-sm text-[#007aff] hover:text-[#005ec4] bg-transparent border-none cursor-pointer" :disabled="chunksLoading" @click="loadChunksAndAnnotations">刷新</button>
          </div>

          <div v-if="chunks.length === 0 && !chunksLoading" class="flex flex-col items-center justify-center py-12 text-[#6e6e73]">
            <svg class="w-10 h-10 text-[#c3cad6] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <p class="text-sm">暂无分块数据，请先上传并处理文档</p>
          </div>

          <div v-else class="max-h-[520px] overflow-y-auto">
            <div v-for="chunk in chunks" :key="chunk.id" class="py-3.5 px-1 border-b border-[#eef2f7] last:border-b-0">
              <div>
                <span class="text-xs text-[#6b7280]">
                  [{{ chunk.id }}]
                  {{ chunk.chapterPath || '未分类' }}
                  <template v-if="chunk.pageRange"> / {{ chunk.pageRange }}</template>
                </span>
                <p class="text-sm text-[#1d1d1f] mt-1">{{ chunk.contentPreview || '' }}</p>
              </div>
              <div class="flex gap-2 mt-2">
                <button class="h-[28px] px-3 rounded-[8px] text-xs font-medium text-[#f59e0b] bg-[#fffbeb] border border-[#fde68a] hover:bg-[#fef3c7] active:scale-[0.96] transition-all cursor-pointer" @click="addAnnotation(chunk.id, 'important')">重点</button>
                <button class="h-[28px] px-3 rounded-[8px] text-xs font-medium text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] hover:bg-[#fee2e2] active:scale-[0.96] transition-all cursor-pointer" @click="addAnnotation(chunk.id, 'error_prone')">易错</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Create/Edit Dialog -->
    <AppModal v-model="dialogVisible" :title="editingSpace ? '编辑课程空间' : '创建课程空间'" width="520px">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">名称 <span class="text-[#ef4444]">*</span></label>
          <input v-model="spaceForm.name" placeholder="例如：数据结构 2025 春" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">学期</label>
          <input v-model="spaceForm.term" placeholder="例如：2024-2025-2" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">课程名</label>
          <input v-model="spaceForm.courseName" placeholder="例如：数据结构" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">描述</label>
          <textarea v-model="spaceForm.description" rows="2" class="w-full px-3 py-2 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm resize-none"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">可见范围</label>
          <select v-model="spaceForm.docVisibility" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm">
            <option value="public">公开</option>
            <option value="class">班级可见</option>
            <option value="private">仅教师</option>
          </select>
        </div>
        <div v-if="spaceForm.docVisibility === 'class'">
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">绑定班级</label>
          <select v-model="spaceForm.classIds" multiple class="w-full h-24 px-3 py-2 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm">
            <option v-for="cls in teacherClasses" :key="cls.id" :value="cls.id">{{ cls.name }}{{ cls.courseName ? ' / ' + cls.courseName : '' }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-[#1d1d1f] mb-1.5">默认模式</label>
          <select v-model="spaceForm.defaultMode" class="w-full h-10 px-3 rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.15),inset_0_0_0_1px_rgba(0,122,255,0.5)] transition-all outline-none text-sm">
            <option value="strict">Strict</option>
            <option value="open">Open</option>
          </select>
        </div>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm text-[#1d1d1f] cursor-pointer">
            <input type="checkbox" v-model="spaceForm.allowWebSearch" class="w-4 h-4 rounded accent-[#007aff]" />
            允许联网
          </label>
          <label class="flex items-center gap-2 text-sm text-[#1d1d1f] cursor-pointer">
            <input type="checkbox" v-model="spaceForm.requireCitation" class="w-4 h-4 rounded accent-[#007aff]" />
            要求引用
          </label>
        </div>
      </div>
      <template #footer>
        <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] active:scale-[0.96] transition-all cursor-pointer border-none" @click="dialogVisible = false">取消</button>
        <button class="h-[38px] px-5 rounded-[10px] text-sm font-medium text-white bg-gradient-to-b from-[#3898ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:-translate-y-px active:scale-[0.96] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!spaceForm.name || saving" @click="saveSpace">{{ saving ? '保存中...' : '保存' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Calendar, ChatDotRound, MoreFilled, Plus, Reading, UploadFilled } from '@element-plus/icons-vue'
import PageHeader from '../../components/PageHeader.vue'
import AppModal from '../../components/AppModal.vue'
import { useUserStore } from '@/store'
import {
  createAnnotation,
  createCourseSpace,
  deleteCourseSpace,
  getCourseSpaceChunks,
  getCourseSpaceDocumentStatusSummary,
  getCourseSpaces,
  normalizeSourcesForDisplay,
  rebuildCourseSpaceBm25,
  reprocessAllCourseSpaceDocuments,
  reprocessCourseSpaceDocument,
  streamRagChat,
  updateCourseSpace,
  uploadCourseSpaceDocument,
} from '@/api/rag'
import { getTeachingClasses } from '@/api/tap'
import { getFriendlyErrorMessage } from '@/utils/errorMessage'

const userStore = useUserStore()
const spaces = ref([])
const loading = ref(false)
const teacherClasses = ref([])
const selectedSpace = ref(null)
const activeTab = ref('docs')
const spaceDropdownId = ref(null)

const detailTabs = [
  { name: 'docs', label: '文档管理' },
  { name: 'chat', label: '知识问答' },
  { name: 'annotations', label: '分块标注' },
]

const documents = ref([])
const docsLoading = ref(false)
const docStatusSummary = ref(emptyDocSummary())
const docActionLoading = ref(false)
const docRowLoadingId = ref(null)
const pendingFiles = ref([])
const uploading = ref(false)
const uploadDocType = ref('textbook')
const chunks = ref([])
const chunksLoading = ref(false)

const chatMessages = ref([])
const chatInput = ref('')
const chatLoading = ref(false)
const chatMessagesRef = ref(null)
const suggestions = ['什么是二叉搜索树？', '链表和数组的区别是什么？', 'Dijkstra 算法的时间复杂度是多少？']

const dialogVisible = ref(false)
const editingSpace = ref(null)
const saving = ref(false)

const currentClassId = computed(() => {
  const id = Number(userStore.selectedClass?.id)
  return Number.isFinite(id) && id > 0 ? id : null
})
const currentClassName = computed(() => userStore.selectedClass?.name || '')
const classScopedSpaces = computed(() => {
  if (!currentClassId.value) return []
  return spaces.value.filter(space => Array.isArray(space.boundClassIds) && space.boundClassIds.includes(currentClassId.value))
})
const hasClassScopedSpaces = computed(() => classScopedSpaces.value.length > 0)
const visibleSpaces = computed(() => hasClassScopedSpaces.value ? classScopedSpaces.value : spaces.value)
const spaceForm = ref(defaultSpaceForm())

let refreshTimer = null

function defaultSpaceForm() {
  return {
    name: '',
    term: '',
    courseName: '',
    description: '',
    defaultMode: 'strict',
    allowWebSearch: false,
    requireCitation: true,
    docVisibility: currentClassId.value ? 'class' : 'public',
    classIds: currentClassId.value ? [currentClassId.value] : [],
  }
}

function emptyDocSummary() {
  return {
    total: 0,
    ready: 0,
    processing: 0,
    pending: 0,
    failed: 0,
    totalChunks: 0,
  }
}

const modeLabel = (mode) => (mode === 'open' ? 'Open' : 'Strict')

function visibilityLabel(visibility) {
  if (visibility === 'public') return '公开'
  if (visibility === 'class') return '班级可见'
  return '仅教师'
}

function visibilityBadgeClass(visibility) {
  if (visibility === 'public') return 'bg-[#dcfce7] text-[#166534]'
  if (visibility === 'class') return 'bg-[#fef3c7] text-[#92400e]'
  return 'bg-[#e0e7ff] text-[#3730a3]'
}

function statusBadgeClass(status) {
  const map = {
    READY: 'bg-[#dcfce7] text-[#166534]',
    completed: 'bg-[#dcfce7] text-[#166534]',
    PROCESSING: 'bg-[#e0e7ff] text-[#3730a3]',
    processing: 'bg-[#e0e7ff] text-[#3730a3]',
    PENDING: 'bg-[#fef3c7] text-[#92400e]',
    pending: 'bg-[#fef3c7] text-[#92400e]',
    FAILED: 'bg-[#fee2e2] text-[#991b1b]',
    failed: 'bg-[#fee2e2] text-[#991b1b]',
  }
  return map[status] || 'bg-[#f3f4f6] text-[#374151]'
}

function statusLabel(status) {
  return {
    READY: '已就绪',
    completed: '已就绪',
    PROCESSING: '处理中',
    processing: '处理中',
    PENDING: '等待处理',
    pending: '等待处理',
    FAILED: '失败',
    failed: '失败',
  }[status] || status
}

function docTypeLabel(docType) {
  return {
    textbook: '教材',
    lecture: '讲义',
    reference: '参考书',
    exercise: '习题集',
    faq: 'FAQ',
    other: '其他',
  }[docType] || docType || '其他'
}

function toggleSpaceDropdown(id) {
  spaceDropdownId.value = spaceDropdownId.value === id ? null : id
}

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/\[(\d+)\]/g, '<sup class="text-[#007aff] cursor-pointer">[$1]</sup>')
}

async function loadSpaces() {
  loading.value = true
  try {
    const res = await getCourseSpaces()
    spaces.value = res?.data || res || []
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '加载课程空间失败，请稍后重试'))
  }
  loading.value = false
}

async function loadTeachingClasses() {
  try {
    const res = await getTeachingClasses()
    teacherClasses.value = res?.data || res || []
  } catch {
    teacherClasses.value = []
  }
}

function backToList() {
  selectedSpace.value = null
  activeTab.value = 'docs'
  documents.value = []
  chunks.value = []
  chatMessages.value = []
  docStatusSummary.value = emptyDocSummary()
}

function selectSpace(space) {
  selectedSpace.value = space
  activeTab.value = 'docs'
  chatMessages.value = []
  docStatusSummary.value = emptyDocSummary()
  loadDocuments()
}

function showCreateDialog() {
  editingSpace.value = null
  spaceForm.value = defaultSpaceForm()
  dialogVisible.value = true
}

function editSpace(space) {
  editingSpace.value = space
  spaceForm.value = {
    name: space.name,
    term: space.term || '',
    courseName: space.courseName || '',
    description: space.description || '',
    defaultMode: space.defaultMode || 'strict',
    allowWebSearch: !!space.allowWebSearch,
    requireCitation: space.requireCitation !== false,
    docVisibility: space.docVisibility || 'private',
    classIds: Array.isArray(space.boundClassIds) ? [...space.boundClassIds] : [],
  }
  dialogVisible.value = true
}

async function saveSpace() {
  if (!spaceForm.value.name) return
  if (spaceForm.value.docVisibility === 'class' && spaceForm.value.classIds.length === 0) {
    ElMessage.warning('班级可见模式下至少需要绑定一个班级')
    return
  }

  saving.value = true
  try {
    if (editingSpace.value) {
      await updateCourseSpace(editingSpace.value.id, spaceForm.value)
      ElMessage.success('课程空间已更新')
    } else {
      await createCourseSpace(spaceForm.value)
      ElMessage.success('课程空间已创建')
    }
    dialogVisible.value = false
    await loadSpaces()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '保存课程空间失败，请稍后重试'))
  }
  saving.value = false
}

async function confirmDeleteSpace(space) {
  try {
    await ElMessageBox.confirm(`确定删除"${space.name}"吗？`, '确认删除', { type: 'warning' })
    await deleteCourseSpace(space.id)
    ElMessage.success('课程空间已删除')
    if (selectedSpace.value?.id === space.id) {
      backToList()
    }
    await loadSpaces()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(getFriendlyErrorMessage(e, '删除课程空间失败，请稍后重试'))
  }
}

async function loadDocuments() {
  if (!selectedSpace.value) return
  docsLoading.value = true
  try {
    const res = await getCourseSpaceDocumentStatusSummary(selectedSpace.value.id)
    const payload = res?.data || res || {}
    const counts = payload.counts || {}
    documents.value = payload.documents || []
    docStatusSummary.value = {
      total: Number(counts.total || 0),
      ready: Number(counts.ready || 0),
      processing: Number(counts.processing || 0),
      pending: Number(counts.pending || 0),
      failed: Number(counts.failed || 0),
      totalChunks: Number(counts.totalChunks || 0),
    }
  } catch (e) {
    documents.value = []
    docStatusSummary.value = emptyDocSummary()
    ElMessage.error(getFriendlyErrorMessage(e, '加载文档状态失败，请稍后重试'))
  }
  docsLoading.value = false
}

function onFileChange(_file, fileList) {
  pendingFiles.value = fileList
}

async function uploadFiles() {
  if (!selectedSpace.value || pendingFiles.value.length === 0) return
  uploading.value = true
  let successCount = 0
  let failCount = 0

  for (const file of pendingFiles.value) {
    try {
      await uploadCourseSpaceDocument(selectedSpace.value.id, file.raw, uploadDocType.value)
      successCount += 1
    } catch {
      failCount += 1
    }
  }

  uploading.value = false
  pendingFiles.value = []

  if (successCount) ElMessage.success(`成功上传 ${successCount} 个文件`)
  if (failCount) ElMessage.warning(`${failCount} 个文件上传失败`)
  await loadDocuments()
}

async function reprocessAllDocuments() {
  if (!selectedSpace.value) return
  try {
    await ElMessageBox.confirm('确定重新处理当前课程空间下所有可重跑文档吗？', '确认操作', { type: 'warning' })
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(getFriendlyErrorMessage(e, '上传文档失败，请稍后重试'))
    return
  }

  docActionLoading.value = true
  try {
    const res = await reprocessAllCourseSpaceDocuments(selectedSpace.value.id)
    const data = res?.data || res || {}
    ElMessage.success(`已加入重处理队列：${data.requestedCount || 0} 个文档`)
    await loadDocuments()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '文档重新处理失败，请稍后重试'))
  }
  docActionLoading.value = false
}

async function reprocessDocument(row) {
  if (!selectedSpace.value || !row?.id) return
  docRowLoadingId.value = row.id
  try {
    const res = await reprocessCourseSpaceDocument(selectedSpace.value.id, row.id)
    const data = res?.data || res || {}
    ElMessage.success(data.queued ? '文档已加入重处理队列' : '该文档当前正在处理中')
    await loadDocuments()
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '批量处理失败，请稍后重试'))
  }
  docRowLoadingId.value = null
}

async function rebuildBm25IndexAction() {
  if (!selectedSpace.value) return
  docActionLoading.value = true
  try {
    await rebuildCourseSpaceBm25(selectedSpace.value.id)
    ElMessage.success('BM25 索引已重建')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '检索索引重建失败，请稍后重试'))
  }
  docActionLoading.value = false
}

async function loadChunksAndAnnotations() {
  if (!selectedSpace.value) return
  chunksLoading.value = true
  try {
    const res = await getCourseSpaceChunks(selectedSpace.value.id)
    chunks.value = res?.data || res || []
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '加载分块失败，请稍后重试'))
  }
  chunksLoading.value = false
}

async function addAnnotation(chunkId, type) {
  if (!selectedSpace.value) return
  try {
    await createAnnotation(selectedSpace.value.id, { chunkId, annotationType: type, note: '' })
    ElMessage.success('标注已添加')
  } catch (e) {
    ElMessage.error(getFriendlyErrorMessage(e, '保存批注失败，请稍后重试'))
  }
}

function askQuestion(question) {
  chatInput.value = question
  sendChat()
}

async function sendChat() {
  const question = chatInput.value.trim()
  if (!question || !selectedSpace.value || chatLoading.value) return

  chatMessages.value.push({ role: 'user', content: question })
  chatInput.value = ''
  chatLoading.value = true
  scrollToBottom()

  try {
    const messageIndex = chatMessages.value.length
    chatMessages.value.push({ role: 'assistant', content: '', citations: [] })

    await streamRagChat({
      query: question,
      knowledgeBaseIds: [String(selectedSpace.value.id)],
      mode: selectedSpace.value.defaultMode === 'open' ? 'open' : 'strict',
      options: {
        topK: 10,
        rerankTopN: 3,
        scoreThreshold: 0,
        enableRerank: true,
        temperature: 0.7,
        maxTokens: 1024,
      },
    }, {
      onRetrieval: ({ sources }) => {
        chatMessages.value[messageIndex].citations = normalizeSourcesForDisplay(sources || [])
        scrollToBottom()
      },
      onDelta: ({ content }) => {
        chatMessages.value[messageIndex].content += content || ''
        scrollToBottom()
      },
    })
  } catch (e) {
    chatMessages.value.push({ role: 'assistant', content: `网络错误: ${e.message}` })
  }

  chatLoading.value = false
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    const el = chatMessagesRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(activeTab, async (tab) => {
  if (!selectedSpace.value) return
  if (tab === 'docs') {
    await loadDocuments()
  } else if (tab === 'annotations' && chunks.value.length === 0) {
    await loadChunksAndAnnotations()
  }
})

watch(visibleSpaces, (nextSpaces) => {
  if (!selectedSpace.value) return
  const stillVisible = nextSpaces.some(space => space.id === selectedSpace.value.id)
  if (!stillVisible) {
    backToList()
  }
}, { deep: true })

onMounted(() => {
  loadSpaces()
  loadTeachingClasses()
  refreshTimer = setInterval(() => {
    if (!selectedSpace.value) return
    const hasActiveTasks = documents.value.some((doc) =>
      ['PROCESSING', 'PENDING', 'processing', 'pending'].includes(doc.status)
    )
    if (hasActiveTasks) {
      loadDocuments()
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
