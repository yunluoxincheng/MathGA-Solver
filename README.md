# MathGA Solver

基于遗传算法的浏览器端数学数值求解器，面向高中及以下数学问题。

## 功能

- **函数最值求解** — 在指定区间上求函数的最大值、最小值
- **模板化输入** — 内置 9 种函数模板（线性、二次、三次、反比例、绝对值、正弦、余弦、根号、自定义表达式）
- **开闭区间** — 支持开区间、闭区间、半开区间，端点接近时自动警告
- **π 单位** — 三角函数可切换 π 单位输入与结果显示
- **纯前端计算** — 所有计算在浏览器本地完成，无需后端

> 结果为遗传算法数值近似解，非精确解析解。

## 技术栈

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- mathjs（表达式编译与安全求值）
- Jest（测试）

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3185 即可使用。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run test` | 运行测试 |
| `npm run typecheck` | 类型检查 |
| `npm run lint` | ESLint 检查 |

## 项目结构

```
src/
├── components/     UI 组件（模板选择、区间输入、结果展示）
├── lib/
│   ├── ga/         遗传算法核心（选择、交叉、变异、精英保留）
│   ├── math/       数学工具（表达式编译、区间处理、验证）
│   └── solvers/    求解器（最值优化）
├── types/          TypeScript 类型定义
└── app/            Next.js 页面与全局样式
```

## 许可

MIT
