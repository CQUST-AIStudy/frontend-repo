<template>
  <div
    class="login-page relative min-h-screen overflow-hidden bg-[#07142d] text-white"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(72,123,255,0.22),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(55,120,255,0.18),transparent_26%),radial-gradient(circle_at_15%_80%,rgba(48,214,255,0.12),transparent_24%),linear-gradient(135deg,#041126_0%,#081b38_45%,#0a2242_100%)]"></div>
    <div class="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(71,126,255,0.22)_0,transparent_12%),radial-gradient(circle_at_72%_66%,rgba(43,194,255,0.12)_0,transparent_15%),radial-gradient(circle_at_90%_28%,rgba(116,90,255,0.12)_0,transparent_14%)] opacity-80"></div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-[1520px] items-center px-6 py-8 sm:px-8 lg:px-12">
      <div class="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)] lg:gap-12">
        <section class="relative hidden min-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-[2px] lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_36%)]"></div>
          <div class="absolute inset-0 bg-cover bg-center opacity-85 mix-blend-screen" :style="{ backgroundImage: `url(${loginBackground})` }"></div>
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,12,31,0.34)_0%,rgba(3,12,31,0.58)_55%,rgba(3,12,31,0.76)_100%)]"></div>

          <div class="relative z-10 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_28px_rgba(55,190,255,0.28)]">
              <span class="text-lg font-semibold tracking-tight">AI</span>
            </div>
            <div>
              <p class="text-sm font-medium tracking-[0.2em] text-cyan-100/70">DATA STRUCTURE</p>
              <p class="text-sm text-white/70">智能教辅平台</p>
            </div>
          </div>

          <div class="relative z-10 max-w-[620px]">
            <h1 class="max-w-[560px] text-[64px] font-black leading-[0.95] tracking-[-0.04em] text-white 2xl:text-[72px]">
              智能教辅平台
            </h1>
            <p class="mt-6 max-w-[560px] text-[26px] leading-[1.45] tracking-[-0.02em] text-slate-200/90">
              面向程序设计实验教学的智能支持系统
            </p>
            <div class="mt-8 h-1.5 w-14 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.7)]"></div>
          </div>

          <div class="relative z-10 grid max-w-[640px] grid-cols-3 gap-4">
            <article v-for="feature in features" :key="feature.title" class="rounded-[22px] border border-white/12 bg-white/6 p-4 backdrop-blur-sm">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.2)]">
                <svg
                  v-if="feature.icon === 'profile'"
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <svg
                  v-else-if="feature.icon === 'review'"
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
                <svg
                  v-else
                  class="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19V9" />
                  <path d="M10 19V5" />
                  <path d="M16 19v-8" />
                  <path d="M22 19H2" />
                </svg>
              </div>
              <h2 class="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">{{ feature.title }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-200/78">{{ feature.description }}</p>
            </article>
          </div>

          <div class="relative z-10 grid grid-cols-3 gap-5 opacity-45">
            <div class="h-40 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
              <div class="h-full rounded-[18px] border border-dashed border-white/12 bg-[radial-gradient(circle_at_40%_35%,rgba(56,189,248,0.18),transparent_36%)]"></div>
            </div>
            <div class="h-40 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
              <div class="h-full rounded-[18px] border border-dashed border-white/12 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(16,185,129,0.08))]"></div>
            </div>
            <div class="h-40 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
              <div class="h-full rounded-[18px] border border-dashed border-white/12 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(56,189,248,0.08))]"></div>
            </div>
          </div>
        </section>

        <section class="relative mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-[700px] flex-col rounded-[30px] border border-white/20 bg-white/95 p-5 text-slate-900 shadow-[0_26px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:max-h-[calc(100vh-4rem)] sm:p-7 lg:mr-0 lg:max-w-[670px] lg:p-8">
          <div class="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-3 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.04)]">
            <button
              type="button"
                class="relative flex-1 rounded-[18px] px-4 py-4 text-[24px] font-bold tracking-[-0.03em] transition sm:text-[28px] lg:text-[30px]"
              :class="activeTab === 'login' ? 'text-[#1368d6]' : 'text-slate-500 hover:text-slate-700'"
              @click="setActiveTab('login')"
            >
              登录
              <span
                class="absolute left-1/2 top-[calc(100%-6px)] h-1 w-[170px] -translate-x-1/2 rounded-full bg-[#1677ff] transition-all duration-300"
                :class="activeTab === 'login' ? 'opacity-100' : 'opacity-0'"
              ></span>
            </button>
            <button
              type="button"
                class="relative flex-1 rounded-[18px] px-4 py-4 text-[24px] font-bold tracking-[-0.03em] transition sm:text-[28px] lg:text-[30px]"
              :class="activeTab === 'register' ? 'text-[#1368d6]' : 'text-slate-500 hover:text-slate-700'"
              @click="setActiveTab('register')"
            >
              注册
              <span
                class="absolute left-1/2 top-[calc(100%-6px)] h-1 w-[170px] -translate-x-1/2 rounded-full bg-[#1677ff] transition-all duration-300"
                :class="activeTab === 'register' ? 'opacity-100' : 'opacity-0'"
              ></span>
            </button>
          </div>

          <div class="mt-6 flex min-h-0 flex-1 flex-col">
            <Transition name="fade-slide" mode="out-in">
              <div v-if="notice.visible" :key="notice.message" class="mb-4 rounded-[18px] border px-4 py-3 text-sm font-medium" :class="noticeClass">
                {{ notice.message }}
              </div>
            </Transition>

            <div class="min-h-0 flex-1 overflow-y-auto pr-1">
              <Transition name="panel-swap" mode="out-in">
                <form v-if="activeTab === 'login'" key="login" class="space-y-4 sm:space-y-5" @submit.prevent="handleLogin">
              <div>
                <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]">角色</label>
                <div class="grid grid-cols-3 overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50 p-1">
                  <button
                    v-for="role in roleOptions"
                    :key="role.value"
                    type="button"
                    class="min-h-[46px] rounded-[14px] px-3 text-[15px] font-semibold transition sm:min-h-[54px] sm:text-[18px]"
                    :class="selectedRole === role.value ? 'bg-[#1677ff] text-white shadow-[0_10px_24px_rgba(22,119,255,0.28)]' : 'text-slate-700 hover:bg-white'"
                    @click="selectRole(role.value)"
                  >
                    {{ role.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="login-username">用户名</label>
                <div class="relative">
                  <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserIcon class="h-5 w-5" />
                  </span>
                  <input
                    id="login-username"
                    v-model.trim="loginForm.username"
                    type="text"
                    autocomplete="username"
                    placeholder="请输入用户名"
                    class="h-[58px] w-full rounded-[16px] border px-12 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:text-[18px]"
                    :class="fieldStateClass(loginErrors.username)"
                    @input="clearLoginFieldError('username')"
                    @blur="touchLoginField('username')"
                  />
                </div>
                <p v-if="loginErrors.username" class="mt-2 text-sm text-rose-500">{{ loginErrors.username }}</p>
              </div>

              <div>
                <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="login-password">密码</label>
                <div class="relative">
                  <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <LockIcon class="h-5 w-5" />
                  </span>
                  <input
                    id="login-password"
                    v-model="loginForm.password"
                    :type="showLoginPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="请输入密码"
                    class="h-[58px] w-full rounded-[16px] border px-12 pr-14 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:text-[18px]"
                    :class="fieldStateClass(loginErrors.password)"
                    @input="clearLoginFieldError('password')"
                    @blur="touchLoginField('password')"
                  />
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    <svg
                      v-if="!showLoginPassword"
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg
                      v-else
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m3 3 18 18" />
                      <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.82" />
                      <path d="M9.88 5.08A10.74 10.74 0 0 1 12 5c6 0 9.5 7 9.5 7a18.77 18.77 0 0 1-4.18 4.82" />
                      <path d="M6.61 6.61C3.98 8.55 2.5 12 2.5 12s3.5 7 9.5 7c1.33 0 2.57-.24 3.72-.66" />
                    </svg>
                  </button>
                </div>
                <p v-if="loginErrors.password" class="mt-2 text-sm text-rose-500">{{ loginErrors.password }}</p>
              </div>

              <div class="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  id="login-agreement"
                  v-model="agreements.checked"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-slate-300 text-[#1677ff] focus:ring-[#1677ff]"
                />
                <label for="login-agreement" class="text-sm leading-6 text-slate-600">
                  登录即表示您已阅读并同意
                  <a href="javascript:void(0)" class="font-medium text-[#1677ff] hover:underline">《用户协议》</a>
                  和
                  <a href="javascript:void(0)" class="font-medium text-[#1677ff] hover:underline">《隐私政策》</a>
                </label>
              </div>

              <button
                type="submit"
                class="flex h-[62px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#2b8cff_0%,#1677ff_100%)] text-[20px] font-bold tracking-[-0.02em] text-white shadow-[0_18px_34px_rgba(22,119,255,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(22,119,255,0.42)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="loading"
              >
                <span v-if="!loading">登录</span>
                <span v-else>登录中...</span>
              </button>
                </form>

                <form v-else key="register" class="space-y-4 sm:space-y-5" @submit.prevent="handleRegister">
                  <div>
                    <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="register-username">用户名</label>
                    <input
                      id="register-username"
                      v-model.trim="registerForm.username"
                      type="text"
                      autocomplete="username"
                      placeholder="请输入用户名"
                      class="h-[52px] w-full rounded-[16px] border px-4 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[58px] sm:text-[18px]"
                      :class="fieldStateClass(registerErrors.username)"
                      @input="clearRegisterFieldError('username')"
                      @blur="touchRegisterField('username')"
                    />
                    <p v-if="registerErrors.username" class="mt-2 text-sm text-rose-500">{{ registerErrors.username }}</p>
                  </div>

                  <div>
                    <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="register-password">密码</label>
                    <div class="relative">
                      <input
                        id="register-password"
                        v-model="registerForm.password"
                        :type="showRegisterPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="请输入密码"
                        class="h-[52px] w-full rounded-[16px] border px-4 pr-14 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[58px] sm:text-[18px]"
                        :class="fieldStateClass(registerErrors.password)"
                        @input="clearRegisterFieldError('password')"
                        @blur="touchRegisterField('password')"
                      />
                      <button
                        type="button"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                        @click="showRegisterPassword = !showRegisterPassword"
                      >
                        <svg
                          v-if="!showRegisterPassword"
                          class="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg
                          v-else
                          class="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m3 3 18 18" />
                          <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.82" />
                          <path d="M9.88 5.08A10.74 10.74 0 0 1 12 5c6 0 9.5 7 9.5 7a18.77 18.77 0 0 1-4.18 4.82" />
                          <path d="M6.61 6.61C3.98 8.55 2.5 12 2.5 12s3.5 7 9.5 7c1.33 0 2.57-.24 3.72-.66" />
                        </svg>
                      </button>
                    </div>
                    <p v-if="registerErrors.password" class="mt-2 text-sm text-rose-500">{{ registerErrors.password }}</p>
                  </div>

                  <div>
                    <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="register-confirmPassword">确认密码</label>
                    <div class="relative">
                      <input
                        id="register-confirmPassword"
                        v-model="registerForm.confirmPassword"
                        :type="showRegisterConfirmPassword ? 'text' : 'password'"
                        autocomplete="new-password"
                        placeholder="请再次输入密码"
                        class="h-[52px] w-full rounded-[16px] border px-4 pr-14 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[58px] sm:text-[18px]"
                        :class="fieldStateClass(registerErrors.confirmPassword)"
                        @input="clearRegisterFieldError('confirmPassword')"
                        @blur="touchRegisterField('confirmPassword')"
                      />
                      <button
                        type="button"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                        @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                      >
                        <svg
                          v-if="!showRegisterConfirmPassword"
                          class="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <svg
                          v-else
                          class="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m3 3 18 18" />
                          <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.82" />
                          <path d="M9.88 5.08A10.74 10.74 0 0 1 12 5c6 0 9.5 7 9.5 7a18.77 18.77 0 0 1-4.18 4.82" />
                          <path d="M6.61 6.61C3.98 8.55 2.5 12 2.5 12s3.5 7 9.5 7c1.33 0 2.57-.24 3.72-.66" />
                        </svg>
                      </button>
                    </div>
                    <p v-if="registerErrors.confirmPassword" class="mt-2 text-sm text-rose-500">{{ registerErrors.confirmPassword }}</p>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="register-usernum">学号</label>
                      <input
                        id="register-usernum"
                        v-model.trim="registerForm.usernum"
                        type="text"
                        inputmode="numeric"
                        placeholder="请输入学号"
                        class="h-[52px] w-full rounded-[16px] border px-4 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[58px] sm:text-[18px]"
                        :class="fieldStateClass(registerErrors.usernum)"
                        @input="clearRegisterFieldError('usernum')"
                        @blur="touchRegisterField('usernum')"
                      />
                      <p v-if="registerErrors.usernum" class="mt-2 text-sm text-rose-500">{{ registerErrors.usernum }}</p>
                    </div>

                    <div>
                      <label class="mb-3 block text-[20px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[24px]" for="register-classname">班级</label>
                      <input
                        id="register-classname"
                        v-model.trim="registerForm.classname"
                        type="text"
                        placeholder="例如：计科23"
                        class="h-[52px] w-full rounded-[16px] border px-4 text-[16px] text-slate-900 outline-none transition placeholder:text-slate-400 sm:h-[58px] sm:text-[18px]"
                        :class="fieldStateClass(registerErrors.classname)"
                        @input="clearRegisterFieldError('classname')"
                        @blur="touchRegisterField('classname')"
                      />
                      <p v-if="registerErrors.classname" class="mt-2 text-sm text-rose-500">{{ registerErrors.classname }}</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="flex h-[58px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#2b8cff_0%,#1677ff_100%)] text-[18px] font-bold tracking-[-0.02em] text-white shadow-[0_18px_34px_rgba(22,119,255,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_rgba(22,119,255,0.42)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[62px] sm:text-[20px]"
                    :disabled="loading"
                  >
                    <span v-if="!loading">注册学生账号</span>
                    <span v-else>注册中...</span>
                  </button>
                </form>
              </Transition>
            </div>
          </div>

          <p v-if="isDevelopment" class="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
            开发环境已自动填充默认测试账号。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import api from '../api'
import { getFriendlyErrorMessage, getFriendlyResponseMessage } from '../utils/errorMessage'
import loginBackground from '../assets/images/login-background.png'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const selectedRole = ref('teacher')
const isDevelopment = process.env.NODE_ENV === 'development'
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirmPassword = ref(false)

const notice = reactive({
  visible: false,
  type: 'info',
  message: ''
})

const touchedLoginFields = reactive({
  username: false,
  password: false
})

const touchedRegisterFields = reactive({
  username: false,
  password: false,
  confirmPassword: false,
  usernum: false,
  classname: false
})

const agreements = reactive({
  checked: true
})

const defaultAccounts = isDevelopment
  ? {
      teacher: { username: 'teacher1', password: 'password123' },
      student: { username: 'student1', password: 'password123' },
      admin: { username: 'admin1', password: 'password123' }
    }
  : {}

const loginForm = reactive({
  username: defaultAccounts.teacher?.username || '',
  password: defaultAccounts.teacher?.password || ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  usernum: '',
  classname: ''
})

const loginErrors = reactive({
  username: '',
  password: ''
})

const registerErrors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  usernum: '',
  classname: ''
})

const roleOptions = [
  { value: 'teacher', label: '教师' },
  { value: 'student', label: '学生' },
  { value: 'admin', label: '管理员' }
]

const features = [
  {
    title: '学习画像',
    description: '多维度分析学习行为，构建个性化画像',
    icon: 'profile'
  },
  {
    title: '智能批改',
    description: '代码自动评测与反馈，提升教学效率',
    icon: 'review'
  },
  {
    title: '个性化补弱',
    description: '精准定位薄弱点，推荐针对性练习',
    icon: 'chart'
  }
]

const noticeClass = computed(() =>
  notice.type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : notice.type === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-sky-200 bg-sky-50 text-sky-700'
)

function setNotice(type, message) {
  notice.type = type
  notice.message = message
  notice.visible = true
}

function clearNotice() {
  notice.visible = false
  notice.type = 'info'
  notice.message = ''
}

function setActiveTab(tab) {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    clearNotice()
  }
}

function selectRole(role) {
  selectedRole.value = role
}

function fieldStateClass(errorMessage) {
  if (errorMessage) {
    return 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
  }
  return 'border-slate-200 bg-slate-50 hover:bg-white focus:border-[#1677ff] focus:ring-4 focus:ring-blue-100'
}

function clearLoginFieldError(field) {
  loginErrors[field] = ''
}

function clearRegisterFieldError(field) {
  registerErrors[field] = ''
}

function touchLoginField(field) {
  touchedLoginFields[field] = true
  validateLoginField(field)
}

function touchRegisterField(field) {
  touchedRegisterFields[field] = true
  validateRegisterField(field)
}

watch(selectedRole, (role) => {
  if (!isDevelopment) return
  const account = defaultAccounts[role]
  if (!account) return
  loginForm.username = account.username
  loginForm.password = account.password
  clearLoginFieldError('username')
  clearLoginFieldError('password')
})

function validateLoginField(field) {
  if (field === 'username') {
    loginErrors.username = loginForm.username.trim() ? '' : '请输入用户名'
  }
  if (field === 'password') {
    if (!loginForm.password) {
      loginErrors.password = '请输入密码'
    } else if (loginForm.password.length < 6) {
      loginErrors.password = '密码长度不能少于 6 位'
    } else {
      loginErrors.password = ''
    }
  }
}

function validateLoginForm() {
  touchedLoginFields.username = true
  touchedLoginFields.password = true
  validateLoginField('username')
  validateLoginField('password')
  if (!agreements.checked) {
    setNotice('error', '请先阅读并同意用户协议与隐私政策')
    return false
  }
  return !loginErrors.username && !loginErrors.password
}

function validateRegisterField(field) {
  if (field === 'username') {
    registerErrors.username = registerForm.username.trim() ? '' : '请输入用户名'
  }
  if (field === 'password') {
    if (!registerForm.password) {
      registerErrors.password = '请输入密码'
    } else if (registerForm.password.length < 6) {
      registerErrors.password = '密码长度不能少于 6 位'
    } else {
      registerErrors.password = ''
    }
    if (touchedRegisterFields.confirmPassword) {
      validateRegisterField('confirmPassword')
    }
  }
  if (field === 'confirmPassword') {
    if (!registerForm.confirmPassword) {
      registerErrors.confirmPassword = '请再次输入密码'
    } else if (registerForm.confirmPassword !== registerForm.password) {
      registerErrors.confirmPassword = '两次输入的密码不一致'
    } else {
      registerErrors.confirmPassword = ''
    }
  }
  if (field === 'usernum') {
    registerErrors.usernum = registerForm.usernum.trim() ? '' : '请输入学号'
  }
  if (field === 'classname') {
    registerErrors.classname = registerForm.classname.trim() ? '' : '请输入班级'
  }
}

function validateRegisterForm() {
  touchedRegisterFields.username = true
  touchedRegisterFields.password = true
  touchedRegisterFields.confirmPassword = true
  touchedRegisterFields.usernum = true
  touchedRegisterFields.classname = true
  validateRegisterField('username')
  validateRegisterField('password')
  validateRegisterField('confirmPassword')
  validateRegisterField('usernum')
  validateRegisterField('classname')
  return !registerErrors.username && !registerErrors.password && !registerErrors.confirmPassword && !registerErrors.usernum && !registerErrors.classname
}

async function handleLogin() {
  clearNotice()
  if (!validateLoginForm()) return

  loading.value = true
  try {
    const result = await userStore.login(loginForm.username, loginForm.password, selectedRole.value)
    if (!(result && result.success)) {
      setNotice('error', getFriendlyResponseMessage(result, '用户名或密码不正确，请检查后重试'))
      return
    }

    const userInfo = result.user || result.userInfo
    const targetRole = userInfo?.role || selectedRole.value
    if (targetRole === 'teacher') {
      userStore.setSelectedClass(null)
    }

    setNotice('success', '登录成功，正在跳转...')
    if (targetRole === 'teacher') {
      await router.push('/teacher/select-class')
    } else if (targetRole === 'admin') {
      await router.push('/admin/dashboard')
    } else {
      await router.push('/student/dashboard')
    }
  } catch (error) {
    setNotice('error', getFriendlyErrorMessage(error, '登录失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  clearNotice()
  if (!validateRegisterForm()) return

  loading.value = true
  try {
    const result = await api.register({
      ...registerForm,
      role: 'student'
    })
    if (!(result && result.success)) {
      setNotice('error', getFriendlyResponseMessage(result, '注册失败，请检查填写内容后重试'))
      return
    }

    setNotice('success', '注册成功，请登录')
    activeTab.value = 'login'
    loginForm.username = registerForm.username
    loginForm.password = ''
    registerForm.username = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.usernum = ''
    registerForm.classname = ''
    Object.keys(registerErrors).forEach((key) => {
      registerErrors[key] = ''
    })
  } catch (error) {
    setNotice('error', getFriendlyErrorMessage(error, '注册失败，请稍后重试'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page :where(input, button) {
  font: inherit;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.panel-swap-enter-active,
.panel-swap-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.panel-swap-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.985);
}

.panel-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}
</style>
