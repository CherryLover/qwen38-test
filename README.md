# Qwen3.8-27B 实际效果验证

本仓库用于验证 **千问 3.8 27B（Qwen3.8-27B）** 模型在真实项目中的实际效果。

通过让模型独立完成项目开发 → 部署到 Cloudflare Workers → 在线可访问的方式，直观展示模型在代码生成、架构设计、调试排错等方面的能力表现。

## 测试项目

| 项目 | 技术栈 | 部署地址 | 说明 |
|------|--------|----------|------|
| 导航页面 | Hono + Cloudflare Workers | https://qwen3827.flyooo.uk | 项目统一入口 |
| Qwen 3.8 实测过程 | HTML + CSS | https://qwen3827.flyooo.uk/qwen38-report | 环境、过程、问题、修复与客观结论 |
| 完整对话原文 | HTML + TXT + JSON | https://qwen3827.flyooo.uk/qwen38-transcript | 用户、模型与工具的可见原始记录 |
| 2048 | 原生 HTML + CSS + JavaScript | https://qwen3827.flyooo.uk/2048 | 支持键盘和手机触摸操作 |

> 后续会持续添加新的测试项目。

## 环境 & 模型配置

### 运行环境

| 项目 | 值 |
|------|-----|
| 平台 | Google Colab（付费 GPU 实例） |
| GPU | NVIDIA A100-SXM4-40GB |
| CUDA | 12.8 |
| 内存 | 83 GiB |

### 模型

| 项目 | 值 |
|------|-----|
| 模型 | Qwen3.8-27B |
| 量化 | Q4_K_M（GGUF 格式） |
| 模型来源 | [unsloth/Qwen3.8-27B-GGUF](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF) |
| 模型文件大小 | 15.93 GB |
| 推理框架 | [llama.cpp](https://github.com/ggml-org/llama.cpp)（llama-server） |

### 服务参数

```bash
llama-server \
  -m Qwen3.8-27B-Q4_K_M.gguf \
  --host 127.0.0.1 \
  --port 8000 \
  -c 262144 \
  -np 1 \
  -ngl 99 \
  --jinja \
  --temp 1.0 \
  --top-p 0.95 \
  --top-k 20 \
  -fa on
```

| 参数 | 值 | 说明 |
|------|-----|------|
| 上下文长度 | 262144 (256K) | FP16 KV Cache |
| 并行 slot 数 | 1 | 单并发 |
| GPU offload | 99 层（全部） | 完全 GPU 推理 |
| 采样参数 | temp=1.0, top_p=0.95, top_k=20 | 接近默认设置 |
| Flash Attention | 开启 | |
| Jinja 模板 | 开启 | 启用 chat template |

### 显存占用

- 模型 + KV Cache 共占用约 **32 GB / 40 GB**（剩余约 7.7 GB 空闲）

### 性能参考

| 指标 | 数值 |
|------|------|
| 生成速度 | ~45 tokens/s |
| Prompt 处理速度 | ~1200 tokens/s |

### 模型 API 暴露

通过 Cloudflare Quick Tunnel 对外暴露 OpenAI 兼容 API：

```
Base URL: https://xxx.trycloudflare.com/v1
API Key:  任意（无需认证）
```

### 特殊配置说明

- **未做 LoRA / 微调**：使用原始 Q4_K_M 量化模型
- **采样参数接近默认**：temp=1.0, top_p=0.95, top_k=20 基本是 Qwen 官方推荐参数
- **`--jinja` 开启**：启用 llama.cpp 的 Jinja2 chat template，确保正确格式化 system/user/assistant 消息
- **`-fa on`（Flash Attention）**：降低长上下文场景的显存占用
- **思考模式**：模型默认开启思考，回复中包含推理过程（无独立 thinking 标签，推理直接内嵌在回复中）

## 测试标准

每个测试项目关注以下维度：

1. **代码正确性** — 生成的代码能否直接运行、部署
2. **架构合理性** — 项目结构、技术选型是否合理
3. **自主性** — 模型能否独立完成从需求理解到部署上线的全流程
4. **调试能力** — 遇到报错时能否自行定位和修复
5. **交互效率** — 需要多少轮人工介入

## 部署方式

所有项目通过 `wrangler` 部署到 Cloudflare Workers：

```bash
npx wrangler deploy
```

## 对话原文导出

公开对话原文由 Pi 会话的 JSONL 原始记录生成。导出内容保留用户消息、模型可见回复、工具调用和执行结果；内部思考、图片数据和敏感授权信息不会公开。

```bash
npm run export:transcript -- /absolute/path/to/pi-session.jsonl
```

在线阅读和下载：

- 阅读版：https://qwen3827.flyooo.uk/qwen38-transcript
- TXT：https://qwen3827.flyooo.uk/qwen38-transcript.txt
- JSON：https://qwen3827.flyooo.uk/qwen38-transcript.json

## 仓库结构

```
qwen38-test/
├── src/
│   ├── index.ts                 # Hono 入口和页面
│   └── qwen38-transcript.ts     # 自动生成的公开对话记录
├── scripts/
│   └── export-qwen38-transcript.mjs
├── package.json
├── wrangler.jsonc        # Cloudflare Workers 配置
└── README.md
```

## 记录

| 日期 | 内容 | 备注 |
|------|------|------|
| 2026-08-19 | 初始化导航页面、完成 2048 并整理完整实测过程 | 经真实设备反馈与浏览器测试后修复核心移动问题 |
