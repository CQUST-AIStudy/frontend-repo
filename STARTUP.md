# 前端启动说明

项目目录：

```cmd
D:\AI-study\frontend-repo\AI_Ds-vue
```

前端是 Vue 项目，默认端口：

```text
http://localhost:8080
```

## 依赖环境

需要先安装 Node.js 和 npm。

建议后端已启动：

```text
http://localhost:8081
```

如果要使用 PTA 爬虫相关功能，爬虫服务也要启动：

```text
http://127.0.0.1:8100
```

前端代理配置在：

```text
D:\AI-study\frontend-repo\AI_Ds-vue\vue.config.js
```

当前代理：

```text
/api    -> http://localhost:8081
/spider -> http://127.0.0.1:8100
```

## 首次安装依赖

如果 `node_modules` 不存在，执行：

```cmd
cd /d D:\AI-study\frontend-repo\AI_Ds-vue
npm install
```

## 启动命令

```cmd
cd /d D:\AI-study\frontend-repo\AI_Ds-vue
npm run serve
```

看到类似下面的地址后，用浏览器打开：

```text
http://localhost:8080
```

## 打包命令

```cmd
cd /d D:\AI-study\frontend-repo\AI_Ds-vue
npm run build
```

## 常见问题

### 前端页面请求后端失败

确认后端已经启动：

```text
http://localhost:8081
```

### PTA 爬虫相关接口失败

确认爬虫已经启动：

```text
http://127.0.0.1:8100/health
```

