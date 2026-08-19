import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Qwen 3.8 实测导航</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #101312;
      color: #f4f1e8;
      padding: 2rem;
    }
    h1 {
      font-size: clamp(2rem, 8vw, 4.5rem);
      margin-bottom: 0.65rem;
      font-weight: 760;
      line-height: 0.95;
      text-align: center;
    }
    .intro {
      color: #aeb5b0;
      margin-bottom: 2.5rem;
      text-align: center;
      max-width: 560px;
      line-height: 1.7;
    }
    .nav-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      padding: 0 2rem;
    }
    .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: min(280px, calc(100vw - 4rem));
      height: 88px;
      border-radius: 8px;
      background: #1a1f1d;
      border: 1px solid #353c38;
      color: #f4f1e8;
      font-size: 1rem;
      font-weight: 650;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: #232a27;
      border-color: #7fd6a5;
      transform: translateY(-2px);
    }
    .nav-btn.report { color: #9be7b8; }
  </style>
</head>
<body>
  <h1>Qwen 3.8<br>真实能力测试</h1>
  <p class="intro">A100 上运行 Qwen3.8-27B，从需求到部署的完整实测记录。</p>
  <div class="nav-grid">
    <a class="nav-btn" href="/2048" target="_blank">2048</a>
    <a class="nav-btn report" href="/qwen38-report">Qwen 3.8 实测过程</a>
  </div>
</body>
</html>`)
})

app.get('/qwen38-report', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Qwen3.8-27B 在 Google Colab A100 上完成 Hono 项目、Cloudflare 部署与 2048 游戏开发的真实过程。">
  <title>Qwen3.8-27B 实测过程</title>
  <style>
    :root {
      --ink: #171a18;
      --muted: #66706a;
      --paper: #f6f5f0;
      --line: #d7d9d4;
      --green: #16784a;
      --green-soft: #e0f1e7;
      --red: #a33b35;
      --red-soft: #f5e5e1;
      --amber: #9b6612;
      --dark: #111513;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
      line-height: 1.75;
    }
    a { color: inherit; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 0 5vw;
      color: #eef3ef;
      background: rgba(17, 21, 19, 0.95);
      border-bottom: 1px solid #303632;
      backdrop-filter: blur(12px);
    }
    .topbar a { text-decoration: none; font-size: 0.9rem; }
    .topbar nav { display: flex; gap: 1rem; }
    .hero {
      background: var(--dark);
      color: #f3f3ed;
      padding: clamp(4rem, 10vw, 8rem) 5vw clamp(4rem, 8vw, 6rem);
      border-bottom: 6px solid var(--green);
    }
    .hero-inner, main { width: min(1080px, 100%); margin: 0 auto; }
    .eyebrow {
      margin: 0 0 1rem;
      color: #8edcae;
      font-size: 0.78rem;
      font-weight: 750;
      text-transform: uppercase;
    }
    h1 {
      max-width: 900px;
      margin: 0;
      font-size: clamp(2.6rem, 7vw, 6.4rem);
      line-height: 0.98;
      font-weight: 780;
    }
    .lead {
      max-width: 740px;
      margin: 1.8rem 0 0;
      color: #bac3bd;
      font-size: clamp(1rem, 2vw, 1.25rem);
    }
    .verdict {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 1.5rem;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #38413c;
    }
    .verdict strong { color: #8edcae; }
    .verdict p { margin: 0; color: #e2e7e3; }
    main { padding: 0 5vw 6rem; }
    .jump {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem 1.2rem;
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--line);
    }
    .jump a { color: var(--muted); font-size: 0.88rem; text-decoration: none; }
    .jump a:hover { color: var(--green); }
    section { padding: clamp(3.5rem, 7vw, 6rem) 0; border-bottom: 1px solid var(--line); }
    section:last-child { border-bottom: 0; }
    h2 { margin: 0 0 0.8rem; font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1.15; }
    .section-note { max-width: 720px; margin: 0 0 2.5rem; color: var(--muted); }
    .facts {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-top: 1px solid var(--line);
      border-left: 1px solid var(--line);
    }
    .fact { min-height: 126px; padding: 1.25rem; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .fact span { display: block; margin-bottom: 0.45rem; color: var(--muted); font-size: 0.75rem; }
    .fact strong { display: block; font-size: 1.08rem; line-height: 1.35; overflow-wrap: anywhere; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .metric { padding: 1.4rem; background: #fff; border-left: 4px solid var(--green); }
    .metric b { display: block; font-size: clamp(1.7rem, 4vw, 2.6rem); line-height: 1.1; }
    .metric span { color: var(--muted); font-size: 0.85rem; }
    .timeline { position: relative; }
    .timeline::before { content: ""; position: absolute; left: 80px; top: 14px; bottom: 14px; width: 1px; background: var(--line); }
    .event { display: grid; grid-template-columns: 60px 1fr; gap: 42px; position: relative; padding: 0 0 2.4rem; }
    .event:last-child { padding-bottom: 0; }
    .event time { color: var(--muted); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
    .event-content::before { content: ""; position: absolute; left: 75px; top: 9px; width: 11px; height: 11px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 5px var(--paper); }
    .event.problem .event-content::before { background: var(--red); }
    .event h3 { margin: 0 0 0.35rem; font-size: 1.05rem; }
    .event p { margin: 0; color: var(--muted); }
    .evidence { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .evidence article { padding: 1.5rem; border: 1px solid var(--line); background: #fff; }
    .evidence article.good { border-top: 4px solid var(--green); }
    .evidence article.bad { border-top: 4px solid var(--red); }
    .evidence h3 { margin: 0 0 1rem; }
    .evidence ul, .limits ul { margin: 0; padding-left: 1.2rem; }
    .evidence li, .limits li { margin: 0.7rem 0; }
    .issue-table { width: 100%; border-collapse: collapse; }
    .issue-table th, .issue-table td { padding: 1rem; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); }
    .issue-table th { color: var(--muted); font-size: 0.76rem; font-weight: 650; }
    .issue-table td:first-child { width: 25%; font-weight: 700; }
    .tag { display: inline-block; padding: 0.14rem 0.48rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; }
    .tag.fixed { color: var(--green); background: var(--green-soft); }
    .tag.warn { color: var(--red); background: var(--red-soft); }
    .test-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); }
    .test-strip div { padding: 1.4rem; background: var(--paper); }
    .test-strip strong { display: block; color: var(--green); font-size: 1.3rem; }
    .limits { margin-top: 2rem; padding: 1.5rem; border-left: 4px solid var(--amber); background: #f3eadb; }
    .limits h3 { margin: 0 0 0.75rem; }
    .conclusion { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
    .score { padding: 2rem; color: #edf2ee; background: var(--dark); }
    .score span { color: #8edcae; font-size: 0.78rem; font-weight: 700; }
    .score b { display: block; margin: 0.5rem 0 1rem; font-size: clamp(2rem, 5vw, 4rem); line-height: 1; }
    .score p { margin: 0; color: #bac3bd; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
    .button { display: inline-flex; min-height: 46px; align-items: center; padding: 0 1rem; border: 1px solid var(--ink); border-radius: 6px; font-weight: 700; text-decoration: none; }
    .button.primary { color: #fff; background: var(--green); border-color: var(--green); }
    footer { padding: 2.5rem 5vw; color: #aeb7b1; background: var(--dark); font-size: 0.8rem; }
    footer div { width: min(1080px, 100%); margin: 0 auto; }
    @media (max-width: 760px) {
      .topbar nav a:first-child { display: none; }
      .verdict, .conclusion { grid-template-columns: 1fr; gap: 0.75rem; }
      .facts { grid-template-columns: repeat(2, 1fr); }
      .metrics, .test-strip, .evidence { grid-template-columns: 1fr; }
      .timeline::before { left: 60px; }
      .event { grid-template-columns: 45px 1fr; gap: 32px; }
      .event-content::before { left: 55px; }
      .issue-table thead { display: none; }
      .issue-table tr { display: block; padding: 1rem 0; border-bottom: 1px solid var(--line); }
      .issue-table td { display: block; width: 100% !important; padding: 0.25rem 0; border: 0; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <a href="/">Qwen 3.8 实测</a>
    <nav><a href="#timeline">过程</a><a href="#issues">问题</a><a href="#conclusion">结论</a></nav>
  </header>

  <div class="hero">
    <div class="hero-inner">
      <p class="eyebrow">2026.08.19 / Google Colab A100 / 完整执行记录</p>
      <h1>Qwen3.8-27B<br>真实项目实测</h1>
      <p class="lead">让模型从空目录开始，完成 Hono 项目、Cloudflare 部署、GitHub 公开仓库和一款可玩的 2048。这里保留它做对的事，也保留误判、失败和返工。</p>
      <div class="verdict">
        <strong>一句话结论</strong>
        <p>自主执行和代码产出能力不错，但首轮正确性及基础设施判断不够稳定；未经真实设备和线上访问验证，不能直接把“已完成”当作最终结果。</p>
      </div>
    </div>
  </div>

  <main>
    <nav class="jump" aria-label="页面目录">
      <a href="#overview">环境配置</a><a href="#timeline">完整过程</a><a href="#results">完成成果</a><a href="#issues">问题与修复</a><a href="#validation">验证结果</a><a href="#conclusion">客观结论</a>
    </nav>

    <section id="overview">
      <h2>运行环境与模型配置</h2>
      <p class="section-note">信息来自本次 Colab 运行记录和实际服务检查。模型未经微调，使用量化版本，单并发运行。</p>
      <div class="facts">
        <div class="fact"><span>GPU</span><strong>NVIDIA A100-SXM4-40GB</strong></div>
        <div class="fact"><span>CUDA / 内存</span><strong>12.8 / 83 GiB</strong></div>
        <div class="fact"><span>模型</span><strong>Qwen3.8-27B Q4_K_M</strong></div>
        <div class="fact"><span>模型文件</span><strong>15.93 GB GGUF</strong></div>
        <div class="fact"><span>推理框架</span><strong>llama.cpp</strong></div>
        <div class="fact"><span>上下文</span><strong>262,144 tokens</strong></div>
        <div class="fact"><span>显存占用</span><strong>约 32 / 40 GB</strong></div>
        <div class="fact"><span>并发</span><strong>1 个 slot</strong></div>
      </div>
      <div class="metrics" style="margin-top: 1rem;">
        <div class="metric"><b>约 45</b><span>tokens/s 生成速度</span></div>
        <div class="metric"><b>约 1,200</b><span>tokens/s 输入处理速度</span></div>
        <div class="metric"><b>256K</b><span>本次实际配置的上下文长度</span></div>
      </div>
      <div class="limits">
        <h3>补充说明</h3>
        <ul>
          <li>采样参数为 temperature 1.0、top_p 0.95、top_k 20。</li>
          <li>开启 Flash Attention 和 Jinja 对话模板，模型层全部放入 GPU。</li>
          <li>模型实际会输出思考内容，而且是直接混在回复正文中，并非独立的思考字段。</li>
          <li>这里的速度是该次运行参考值，不等同于所有提示词、所有机器下的固定性能。</li>
        </ul>
      </div>
    </section>

    <section id="timeline">
      <h2>从空目录到线上项目</h2>
      <p class="section-note">全程约两小时。绿色节点是有效推进，红色节点是出现误判、错误或返工的位置。</p>
      <div class="timeline">
        <div class="event"><time>12:19</time><div class="event-content"><h3>创建项目目录</h3><p>按要求在 Projects 下建立 qwen38-test，作为独立验证仓库。</p></div></div>
        <div class="event"><time>14:03</time><div class="event-content"><h3>初始化 Hono 导航页并首次部署</h3><p>创建项目文件、安装依赖，通过 Wrangler 部署到 Cloudflare Workers，并用真实请求确认首页返回正常。</p></div></div>
        <div class="event problem"><time>14:10</time><div class="event-content"><h3>Git 首次提交误带 node_modules</h3><p>模型发现问题后尝试回退，但第一次回退命令失败；随后清理暂存和历史，最终建立了干净仓库。</p></div></div>
        <div class="event"><time>14:11</time><div class="event-content"><h3>创建 GitHub 仓库</h3><p>首次命令参数不兼容，修正后成功推送；之后补充 README，并把仓库改为公开。</p></div></div>
        <div class="event problem"><time>14:16</time><div class="event-content"><h3>误判 Colab 会话丢失</h3><p>终端工具返回 401/404 后，本地会话映射被清空，模型过早判断会话丢失。后续从历史和重新连接中确认实例仍在。</p></div></div>
        <div class="event problem"><time>14:35</time><div class="event-content"><h3>思考模式说明写错</h3><p>README 一度写成关闭思考。用户指出实际能看到思考后，模型重新检查响应格式并修正文档：思考内容是内嵌正文。</p></div></div>
        <div class="event problem"><time>随后</time><div class="event-content"><h3>外部模型接口两次出现 530</h3><p>Cloudflare Quick Tunnel 与 Colab 之间断开，模型请求暂时不可用。恢复 tunnel 后才继续执行，说明临时地址不适合作为稳定服务入口。</p></div></div>
        <div class="event"><time>15:20</time><div class="event-content"><h3>完成 2048 游戏</h3><p>实现计分、最高分、历史记录、撤销、重开、键盘和手机滑动，并完成部署。</p></div></div>
        <div class="event problem"><time>15:33</time><div class="event-content"><h3>手机实测发现方块消失</h3><p>首版游戏看似完整，但核心移动逻辑没有把临时数组写回棋盘，导致滑动后数字消失，属于严重可玩性问题。</p></div></div>
        <div class="event"><time>15:43</time><div class="event-content"><h3>重写移动逻辑并复测</h3><p>直接按坐标更新棋盘，13 个逻辑用例通过；手机触摸、桌面键盘和重开流程也通过浏览器测试。</p></div></div>
        <div class="event problem"><time>16:04</time><div class="event-content"><h3>自定义域名配置方式错误</h3><p>将域名写成普通 Worker 路由后就宣称生效，但真实 DNS 请求失败。正确方式应使用 Cloudflare 自定义域名配置。</p></div></div>
        <div class="event"><time>本次</time><div class="event-content"><h3>修正域名并补齐实测报告</h3><p>改为真正的自定义域名，重新部署，并把完整过程、错误和客观结论集中展示在本页。</p></div></div>
      </div>
    </section>

    <section id="results">
      <h2>最终完成了什么</h2>
      <p class="section-note">尽管过程有返工，模型最终确实交付了一个公开、可部署、可交互的完整小项目。</p>
      <div class="evidence">
        <article class="good"><h3>有效成果</h3><ul><li>从零建立 Hono + Cloudflare Workers 项目</li><li>完成线上导航页和可玩的 2048</li><li>创建并公开 GitHub 仓库，持续提交修复</li><li>补齐模型环境、参数和测试说明</li><li>能够根据用户反馈定位并修复核心逻辑错误</li></ul></article>
        <article class="bad"><h3>不能忽略的问题</h3><ul><li>首次 Git 提交把整个依赖目录提交进去</li><li>Colab 连接异常时误判实例已经丢失</li><li>README 对思考模式的描述未经实测</li><li>首版 2048 在手机上存在核心玩法故障</li><li>自定义域名配置错误，却提前报告“已经生效”</li></ul></article>
      </div>
      <div class="actions">
        <a class="button primary" href="/2048" target="_blank" rel="noopener">打开 2048</a>
        <a class="button" href="https://github.com/CherryLover/qwen38-test" target="_blank" rel="noopener">查看 GitHub 仓库</a>
      </div>
    </section>

    <section id="issues">
      <h2>问题、根因与处理结果</h2>
      <p class="section-note">评价模型不能只看最后页面，也要看它在不确定信息下如何判断，以及错误是否被真正验证和修复。</p>
      <table class="issue-table">
        <thead><tr><th>问题</th><th>发生原因</th><th>处理结果</th></tr></thead>
        <tbody>
          <tr><td>Git 历史污染</td><td>初始化时缺少忽略规则，首次提交把依赖目录一起加入。</td><td><span class="tag fixed">已修复</span> 清理提交历史并重建干净根提交。</td></tr>
          <tr><td>Colab 会话误判</td><td>把终端工具的本地状态异常直接等同于远程实例消失。</td><td><span class="tag warn">暴露判断缺口</span> 后续从历史与重连结果恢复信息。</td></tr>
          <tr><td>思考模式描述错误</td><td>根据配置和历史记录推断，没有先对真实响应做确认。</td><td><span class="tag fixed">已修复</span> 实测后更正为思考内容内嵌正文。</td></tr>
          <tr><td>接口报 530</td><td>Colab 使用临时 Cloudflare Tunnel，隧道断开后外部请求无法到达。</td><td><span class="tag warn">运行限制</span> 重建隧道可恢复，但稳定性仍取决于临时会话。</td></tr>
          <tr><td>2048 方块消失</td><td>移动逻辑只修改临时数组，没有正确写回棋盘状态。</td><td><span class="tag fixed">已修复</span> 重写移动算法，并通过逻辑和浏览器测试。</td></tr>
          <tr><td>自定义域名失败</td><td>普通路由配置不会替自定义域名自动创建对应 DNS 和证书。</td><td><span class="tag fixed">本次修复</span> 改为 Cloudflare 自定义域名并重新部署。</td></tr>
        </tbody>
      </table>
    </section>

    <section id="validation">
      <h2>真实验证结果</h2>
      <p class="section-note">修复 2048 后，不再只看代码和返回状态，而是对核心操作进行了自动化浏览器验证。</p>
      <div class="test-strip">
        <div><strong>13 / 13 通过</strong><span>移动、合并、方向与数值守恒逻辑</span></div>
        <div><strong>手机通过</strong><span>触摸左滑、右滑、上滑，数字保持并正常合并</span></div>
        <div><strong>桌面通过</strong><span>方向键移动、合并与重新开始流程</span></div>
      </div>
      <div class="limits">
        <h3>验证边界</h3>
        <ul><li>这是一个小型前端项目，不能代表模型在大型工程、长期维护和多人协作中的表现。</li><li>测试是在单一量化版本、单台 A100 和一组运行参数上完成，不能直接外推到其他部署方式。</li><li>Cloudflare Tunnel 的 530 属于运行链路问题，不完全等同于模型能力，但模型对故障的判断和报告方式仍属于评估的一部分。</li></ul>
      </div>
    </section>

    <section id="conclusion">
      <h2>客观结论</h2>
      <div class="conclusion">
        <div>
          <p>这次实测说明 Qwen3.8-27B 能够理解连续任务、操作本地工具、创建项目、部署服务并在反馈后修复问题。它不是只能给代码片段，而是具备完成一条小型交付链路的能力。</p>
          <p>但它也多次在验证不足时给出过早结论。最明显的是首版 2048 核心玩法错误，以及域名尚未解析时声称已经生效。因此，更准确的使用方式是：让模型承担大量执行工作，同时把真实构建、浏览器操作、网络请求和最终验收设为硬性门槛。</p>
        </div>
        <aside class="score"><span>本次评价</span><b>能做事，但必须验收</b><p>代码生成与自主执行表现良好；首轮正确性、运行环境判断和交付前验证仍需加强。</p></aside>
      </div>
    </section>
  </main>

  <footer><div>Qwen3.8-27B 实测记录 · 数据与过程记录于 2026-08-19 · 页面由本项目持续维护</div></footer>
</body>
</html>`)
})

app.get('/2048', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>2048</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #fff;
      touch-action: none;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 500px;
      padding: 1rem;
    }

    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #e94560;
    }

    .scores {
      display: flex;
      gap: 0.5rem;
    }

    .score-box {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      text-align: center;
      min-width: 70px;
    }

    .score-label {
      font-size: 0.65rem;
      color: #888;
      text-transform: uppercase;
    }

    .score-value {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .controls {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-restart {
      background: #e94560;
      color: #fff;
    }

    .btn-restart:hover {
      background: #d63851;
      transform: translateY(-1px);
    }

    .btn-history {
      background: #0f3460;
      color: #ccc;
    }

    .btn-history:hover {
      background: #1a5277;
      transform: translateY(-1px);
    }

    .game-board {
      position: relative;
      width: min(90vw, 420px);
      height: min(90vw, 420px);
      background: #16213e;
      border-radius: 12px;
      padding: 8px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      width: 100%;
      height: 100%;
    }

    .cell {
      background: #0f3460;
      border-radius: 6px;
    }

    .tiles {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      pointer-events: none;
    }

    .tile {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    /* Desktop: larger fonts */
    @media (min-width: 768px) {
      .container {
        padding: 2rem;
      }
      .title {
        font-size: 3rem;
      }
      .game-board {
        width: 460px;
        height: 460px;
      }
    }

    /* Mobile: compact */
    @media (max-width: 480px) {
      .title {
        font-size: 1.8rem;
      }
      .score-box {
        padding: 0.3rem 0.6rem;
        min-width: 58px;
      }
      .score-value {
        font-size: 1rem;
      }
      .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.78rem;
      }
    }

    /* Overlay for game over / win */
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 26, 46, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 10;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    .overlay.show {
      opacity: 1;
      pointer-events: all;
    }

    .overlay-text {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .overlay .btn {
      font-size: 1rem;
      padding: 0.7rem 1.5rem;
    }

    /* History modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    .modal.show {
      opacity: 1;
      pointer-events: all;
    }

    .modal-content {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 12px;
      padding: 1.5rem;
      width: 90%;
      max-width: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-close {
      background: none;
      border: none;
      color: #888;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .history-item {
      padding: 0.6rem 0;
      border-bottom: 1px solid #0f3460;
      font-size: 0.85rem;
      color: #ccc;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-date {
      color: #888;
      font-size: 0.75rem;
    }

    .history-score {
      color: #e94560;
      font-weight: 700;
    }

    .clear-history {
      width: 100%;
      margin-top: 1rem;
      background: none;
      border: 1px solid #e94560;
      color: #e94560;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .clear-history:hover {
      background: rgba(233, 69, 96, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">2048</div>
      <div class="scores">
        <div class="score-box">
          <div class="score-label">分数</div>
          <div class="score-value" id="score">0</div>
        </div>
        <div class="score-box">
          <div class="score-label">最高</div>
          <div class="score-value" id="best">0</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="btn btn-restart" onclick="restartGame()">重新开始</button>
      <button class="btn btn-history" onclick="showHistory()">历史记录</button>
    </div>

    <div class="game-board" id="board">
      <div class="grid">
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
      </div>
      <div class="tiles" id="tiles"></div>
      <div class="overlay" id="overlay">
        <div class="overlay-text" id="overlayText"></div>
        <button class="btn btn-restart" onclick="restartGame()">再来一局</button>
      </div>
    </div>
  </div>

  <div class="modal" id="historyModal">
    <div class="modal-content">
      <div class="modal-title">
        游戏记录
        <button class="modal-close" onclick="closeHistory()">&times;</button>
      </div>
      <div id="historyList"></div>
      <button class="clear-history" onclick="clearHistory()">清空记录</button>
    </div>
  </div>

<script>
const SIZE = 4;
let grid = [];
let score = 0;
let best = parseInt(localStorage.getItem('2048_best') || '0');
let moves = 0;
let gameOver = false;
let won = false;
let history = JSON.parse(localStorage.getItem('2048_history') || '[]');
let tileId = 0;
let tileElements = {};

const COLORS = {
  2:    { bg: '#eee4da', color: '#776e65' },
  4:    { bg: '#ede0c8', color: '#776e65' },
  8:    { bg: '#f2b179', color: '#f9f6f2' },
  16:   { bg: '#f59563', color: '#f9f6f2' },
  32:   { bg: '#f67c5f', color: '#f9f6f2' },
  64:   { bg: '#f65e3b', color: '#f9f6f2' },
  128:  { bg: '#edcf72', color: '#f9f6f2' },
  256:  { bg: '#edcc61', color: '#f9f6f2' },
  512:  { bg: '#edc850', color: '#f9f6f2' },
  1024: { bg: '#edc22e', color: '#f9f6f2' },
  2048: { bg: '#edc22e', color: '#f9f6f2' },
};

function getTileStyle(value) {
  if (value <= 2048) return COLORS[value];
  return { bg: '#3c3a32', color: '#f9f6f2' };
}

function getFontSize(value, cellSize) {
  const digits = String(value).length;
  if (digits <= 2) return cellSize * 0.45;
  if (digits === 3) return cellSize * 0.38;
  if (digits === 4) return cellSize * 0.30;
  return cellSize * 0.24;
}

function getCellMetrics() {
  const board = document.getElementById('board');
  const boardSize = board.clientWidth - 16; // minus padding
  const gap = 8;
  const cellSize = (boardSize - gap * 3) / SIZE;
  return { cellSize, gap };
}

function init() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  score = 0;
  moves = 0;
  gameOver = false;
  won = false;
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('score').textContent = '0';
  document.getElementById('best').textContent = best;
  addRandomTile();
  addRandomTile();
  render();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let col = 0; col < SIZE; col++)
      if (!grid[r][col]) empty.push([r, col]);
  if (empty.length === 0) return;
  const [r, col] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  grid[r][col] = { value, id: tileId++, isNew: true };
}

function render() {
  const { cellSize, gap } = getCellMetrics();
  const container = document.getElementById('tiles');
  container.innerHTML = '';
  tileElements = {};

  for (let r = 0; r < SIZE; r++) {
    for (let col = 0; col < SIZE; col++) {
      const tile = grid[r][col];
      if (!tile) continue;
      const el = document.createElement('div');
      el.className = 'tile';
      const style = getTileStyle(tile.value);
      el.style.width = cellSize + 'px';
      el.style.height = cellSize + 'px';
      el.style.left = col * (cellSize + gap) + 'px';
      el.style.top = r * (cellSize + gap) + 'px';
      el.style.background = style.bg;
      el.style.color = style.color;
      el.style.fontSize = getFontSize(tile.value, cellSize) + 'px';
      el.textContent = tile.value;
      if (tile.isNew) {
        el.style.transform = 'scale(0)';
        requestAnimationFrame(() => {
          el.style.transform = 'scale(1)';
        });
      }
      container.appendChild(el);
      tileElements[tile.id] = el;
      tile.isNew = false;
    }
  }
}

function move(direction) {
  if (gameOver) return;
  const oldGrid = grid.map(row => row.map(t => t ? t.value : 0));
  let moved = false;
  let gained = 0;

  for (let i = 0; i < SIZE; i++) {
    // Collect values along the line in move direction
    const values = [];
    const positions = []; // (row, col) pairs in move order

    if (direction === 'left') {
      for (let j = 0; j < SIZE; j++) {
        if (grid[i][j]) values.push(grid[i][j].value);
        positions.push([i, j]);
      }
    } else if (direction === 'right') {
      for (let j = SIZE - 1; j >= 0; j--) {
        if (grid[i][j]) values.push(grid[i][j].value);
        positions.push([i, j]);
      }
    } else if (direction === 'up') {
      for (let j = 0; j < SIZE; j++) {
        if (grid[j][i]) values.push(grid[j][i].value);
        positions.push([j, i]);
      }
    } else if (direction === 'down') {
      for (let j = SIZE - 1; j >= 0; j--) {
        if (grid[j][i]) values.push(grid[j][i].value);
        positions.push([j, i]);
      }
    }

    // Merge
    const merged = [];
    for (let k = 0; k < values.length; k++) {
      if (values[k] === values[k + 1]) {
        merged.push(values[k] * 2);
        gained += values[k] * 2;
        k++;
      } else {
        merged.push(values[k]);
      }
    }
    while (merged.length < SIZE) merged.push(0);

    // Write back to grid directly
    for (let k = 0; k < SIZE; k++) {
      const [r, c] = positions[k];
      const newVal = merged[k];
      if (newVal === 0) {
        grid[r][c] = null;
      } else {
        const oldVal = grid[r][c] ? grid[r][c].value : -1;
        if (oldVal !== newVal) {
          grid[r][c] = { value: newVal, id: tileId++ };
        }
        // else: value unchanged, keep existing tile object
      }
    }

    // Check if this line actually moved
    const newRow = [];
    for (let k = 0; k < SIZE; k++) {
      const [r, c] = positions[k];
      newRow.push(grid[r][c] ? grid[r][c].value : 0);
    }
    const oldLine = [];
    for (let k = 0; k < SIZE; k++) {
      const [r, c] = positions[k];
      oldLine.push(oldGrid[r][c]);
    }
    if (JSON.stringify(newRow) !== JSON.stringify(oldLine)) moved = true;
  }

  if (moved) {
    score += gained;
    moves++;
    if (score > best) {
      best = score;
      localStorage.setItem('2048_best', String(best));
    }
    document.getElementById('score').textContent = score;
    document.getElementById('best').textContent = best;
    addRandomTile();
    render();
    checkState();
  }
}

function checkState() {
  // Check win
  if (!won) {
    for (let r = 0; r < SIZE; r++)
      for (let col = 0; col < SIZE; col++)
        if (grid[r][col] && grid[r][col].value === 2048) {
          won = true;
          showOverlay('🎉 你赢了！');
          saveHistory();
          return;
        }
  }

  // Check game over
  for (let r = 0; r < SIZE; r++) {
    for (let col = 0; col < SIZE; col++) {
      if (!grid[r][col]) return;
      if (col < SIZE - 1 && grid[r][col + 1] && grid[r][col].value === grid[r][col + 1].value) return;
      if (r < SIZE - 1 && grid[r + 1][col] && grid[r][col].value === grid[r + 1][col].value) return;
    }
  }
  gameOver = true;
  showOverlay('游戏结束');
  saveHistory();
}

function showOverlay(text) {
  document.getElementById('overlayText').textContent = text;
  document.getElementById('overlay').classList.add('show');
}

function restartGame() {
  init();
}

// History
function saveHistory() {
  const entry = {
    date: new Date().toLocaleString('zh-CN'),
    score: score,
    moves: moves,
  };
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('2048_history', JSON.stringify(history));
}

function showHistory() {
  const list = document.getElementById('historyList');
  if (history.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:1rem;">暂无记录</div>';
  } else {
    list.innerHTML = history.map((h, i) =>
      \`<div class="history-item">
        <div style="display:flex;justify-content:space-between;">
          <span class="history-score">\${h.score} 分</span>
          <span>\${h.moves} 步</span>
        </div>
        <div class="history-date">\${h.date}</div>
      </div>\`
    ).join('');
  }
  document.getElementById('historyModal').classList.add('show');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('2048_history');
  showHistory();
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
  else if (e.key === 'r' || e.key === 'R') { restartGame(); }
});

// Touch / Swipe
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 30) return; // too short

  if (absDx > absDy) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
});

// Resize
window.addEventListener('resize', () => { render(); });

// Click outside modal to close
document.getElementById('historyModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('historyModal')) closeHistory();
});

// Init
init();
</script>
</body>
</html>`)
})

export default app
