# syntax=docker/dockerfile:1

# ---- 构建阶段：vue-cli 编译静态产物 ----
FROM node:20-alpine AS builder

WORKDIR /app

ENV TZ=Asia/Shanghai \
    CI=true

# vue-cli 在构建期注入 process.env.VUE_APP_*，这里给出生产默认值：
# - API/RAG 走相对路径，由运行期 nginx 反代到各后端
# - 关闭 mock
# - Spider 经 /spider 反代，避免浏览器直连 :8100（ClassList.vue / DataSyncPanel.vue 健康探测）
# - 关闭前端直连 Neo4j（生产应经后端 /api/knowledge-graphs 访问）
# - 演示模式（VUE_APP_DEMO_MODE）：默认关闭；由 docker-compose build args 注入，
#   设为 true 时登录免校验密码、返回演示用户，用于后端不可用时的纯前端演示。
ARG VUE_APP_DEMO_MODE=false

ENV VUE_APP_API_BASE_URL="" \
    VUE_APP_RAG_API_BASE_URL="/rag" \
    VUE_APP_USE_MOCK_DATA="false" \
    VUE_APP_SPIDER_URL="/spider" \
    VUE_APP_NEO4J_ENABLED="false" \
    VUE_APP_DEMO_MODE="${VUE_APP_DEMO_MODE}"

# 先拷依赖描述，利用层缓存
COPY package.json package-lock.json ./

# package.json 显式列了 @tailwindcss/oxide-win32-x64-msvc、lightningcss-win32-x64-msvc
# 两个 Windows 原生包（devDependencies），在 Linux 镜像里会触发 EBADPLATFORM。
# --force 将该平台校验降级为 warning，linux 变体由 tailwindcss/lightningcss 主包的
# optionalDependencies 自行拉取。
# --ignore-scripts：跳过 preinstall 钩子 ensure-npm.js（此时 scripts/ 尚未拷入，且
# 容器内固定使用 npm，无需包管理器守卫）。
RUN npm ci --no-audit --no-fund --force --ignore-scripts

COPY . .

RUN npm run build

# ---- 运行阶段：nginx 托管静态产物 + 反向代理 ----
FROM nginx:1.27-alpine

ENV TZ=Asia/Shanghai

# 静态产物
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx server 配置模板：放到 templates/ 下，官方入口脚本会在启动时做 envsubst
# （仅替换已定义的环境变量，$uri/$host 等 nginx 内置变量不受影响）
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
