import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>导航</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #fff;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      font-weight: 300;
    }
    .nav-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      padding: 0 2rem;
    }
    .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 140px;
      height: 80px;
      border-radius: 12px;
      background: #16213e;
      border: 1px solid #0f3460;
      color: #e0e0e0;
      font-size: 1.1rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: #0f3460;
      border-color: #e94560;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <h1>导航</h1>
  <div class="nav-grid">
    <a class="nav-btn" href="/2048" target="_blank">2048</a>
  </div>
</body>
</html>`)
})

export default app
