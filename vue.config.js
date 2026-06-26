const { DefinePlugin } = require('webpack')

module.exports = {
  configureWebpack: {
    performance: {
      hints: false,
    },
    resolve: {
      fallback: {
        // neo4j-driver 浏览器构建走 WebSocket channel，静态分析触达的 Node 内置模块在此关闭
        net: false,
        tls: false,
        dns: false,
        fs: false,
        child_process: false,
        buffer: false,
        stream: false,
      },
    },
    plugins: [
      new DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
  devServer: {
    port: Number(process.env.PORT || 8080),
    historyApiFallback: true,
    proxy: {
      '/leetcode-claw': {
        target: 'http://127.0.0.1:10170',
        changeOrigin: true,
        pathRewrite: {
          '^/leetcode-claw': '',
        },
      },
      '^/api(?:/|$)': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '^/rag(?:/|$)': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
      '^/spider(?:/|$)': {
        target: 'http://127.0.0.1:8100',
        changeOrigin: true,
        pathRewrite: {
          '^/spider': '',
        },
      },
      '^/recommend(?:/|$)': {
        target: 'http://127.0.0.1:8003',
        changeOrigin: true,
        pathRewrite: {
          '^/recommend': '',
        },
      },
      '^/error-analysis(?:/|$)': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        pathRewrite: {
          '^/error-analysis': '',
        },
      },
      '/knowledge-graph': {
        target: 'http://127.0.0.1:10171',
        changeOrigin: true,
        pathRewrite: {
          '^/knowledge-graph': '',
        },
      },
    },
    client: {
      overlay: false,
    },
  },
}
