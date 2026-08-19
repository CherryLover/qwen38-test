# Qwen3.8-27B 实际效果验证

本仓库用于验证 **千问 3.8 27B（Qwen3.8-27B）** 模型在真实项目中的实际效果。

通过让模型独立完成项目开发 → 部署到 Cloudflare Workers → 在线可访问的方式，直观展示模型在代码生成、架构设计、调试排错等方面的能力表现。

## 测试项目

| 项目 | 技术栈 | 部署地址 | 说明 |
|------|--------|----------|------|
| 导航页面 | Hono + Cloudflare Workers | https://qwen38-test.jiwzdj.workers.dev | 模型独立完成从初始化到部署的全流程 |

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
- **`enable_thinking: false`**：调用时通过 `chat_template_kwargs` 关闭思考模式（非思考模式），减少 token 消耗

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

## 仓库结构

```
qwen38-test/
├── src/
│   └── index.ts          # Hono 入口，导航页面
├── package.json
├── wrangler.jsonc        # Cloudflare Workers 配置
└── README.md
```

## 记录

| 日期 | 内容 | 备注 |
|------|------|------|
| 2025-07-14 | 初始化导航页面项目 | 模型一次性完成，无需人工修正 |
