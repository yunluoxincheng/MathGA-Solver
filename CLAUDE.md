# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathGA Solver（遗传算法数学求解器）是一个基于遗传算法的浏览器端数学数值求解平台，面向高中及以下数学问题。核心思想是将数学问题转化为"搜索变量使目标函数最优"的数值搜索问题，用遗传算法近似求解。

**重要约束：** 结果是近似值，不是精确解析解。

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Math Engine:** mathjs（表达式编译与求值，禁止使用 `eval`）
- **Charts:** recharts（进化曲线），后期可能加入 plotly.js（函数图像）
- **Deployment:** 静态化部署（Vercel / Netlify / GitHub Pages），无需后端
- **Computation:** 全部在浏览器客户端运行，使用 `"use client"` 组件

## Architecture

项目遵循三层架构：

```
components/   → UI 组件（模板选择、区间输入、结果展示）
lib/ga/       → 遗传算法核心（初始化、选择、交叉、变异、精英保留）
lib/math/     → 数学工具（表达式编译、安全求值、区间处理、验证）
lib/solvers/  → 求解器（最值求解、方程求解、函数拟合等）
types/        → TypeScript 类型定义
```

核心数据流：用户通过模板选择 → 生成内部表达式 → 遗传算法搜索 → 展示近似结果。

## Key Design Decisions

- **模板优先输入：** 默认使用函数模板（二次函数、三角函数等）+ 数字参数输入，而非自由表达式。自由表达式仅作为"高级模式"存在。
- **双层表达式：** 用户看到友好符号（`x²`、`√x`、`π`），内部使用 mathjs 语法（`x^2`、`sqrt(x)`、`pi`）。模板元数据集中管理标签、预览、参数和表达式生成。
- **实数编码遗传算法：** 个体是实数值（如 `{ x: 3.14 }`），不是二进制编码。选择用锦标赛选择，交叉用算术交叉，变异用有界随机扰动。
- **安全求值：** 所有 `mathjs` 求值结果必须检查 `Number.isFinite()`，`NaN`/`Infinity`/`-Infinity` 视为无效个体。
- **开区间端点处理：** 闭区间端点单独求值参与比较；开区间如果结果接近未包含端点，需要提示可能是上确界/下确界而非真正最值。

## GA Default Parameters

| 参数 | MVP 默认值 |
|------|-----------|
| 种群数量 | 60 |
| 最大迭代次数 | 200 |
| 交叉概率 | 0.8 |
| 变异概率 | 0.1 |
| 精英保留数量 | 2 |

## Development Phases

当前处于 **Phase 1: 函数最值 MVP** 阶段。完整开发顺序见 `遗传算法数学求解器开发规划.md` 第 11 节。

MVP 范围：函数最大值/最小值 + 模板输入 + 开闭区间 + 遗传算法核心 + 结果展示。
MVP 不包含：函数图像、方程多解搜索、函数拟合、几何模板、不等式求解。

## OpenSpec Workflow

项目使用 OpenSpec 管理变更。当前活跃变更：
- `openspec/changes/build-function-optimization-mvp/` — 函数最值 MVP 的 proposal、design、specs 和 tasks

可用命令（需先安装 openspec skills）：
- `/opsx:explore` — 探索需求和问题
- `/opsx:propose` — 提出新变更
- `/opsx:apply` — 实施 tasks
- `/opsx:archive` — 归档已完成变更

## Key Types

```typescript
type SolverMode = "optimize" | "equation" | "fitting" | "inverse" | "geometry" | "inequality";
type FunctionTemplateId = "linear" | "quadratic" | "cubic" | "reciprocal" | "absolute" | "sine" | "cosine" | "sqrt" | "custom";
type OptimizeTarget = "max" | "min" | "both";

type Interval = { left: number; right: number; includeLeft: boolean; includeRight: boolean };
type FunctionDefinition = { templateId: FunctionTemplateId; variable: VariableName; parameters: Record<string, number>; customExpression?: string };
type GAConfig = { populationSize: number; generations: number; crossoverRate: number; mutationRate: number; eliteCount: number; tolerance: number; patience: number };
```
