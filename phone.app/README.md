# 智慧停车管理系统

基于 React + TypeScript + Tailwind CSS 的停车场可视化管理系统，采用深色监控大屏风格设计，支持多楼层停车场平面图的实时车位状态监控。

## 在线演示

[点击访问在线演示](https://s6xklsgvj7gz6.ok.kimi.link)

## 功能特性

- **可视化平面图** — SVG 绘制的停车场布局，支持鼠标拖拽平移和滚轮缩放
- **实时车位状态** — 五种状态颜色编码（空闲/占用/预留/禁用/VIP），每 5 秒自动更新
- **多楼层管理** — 支持 B1/B2/B3 多层停车场切换
- **智能搜索筛选** — 按车位号、车牌号搜索，按状态筛选高亮
- **车位详情弹窗** — 点击车位查看详细信息，支持手动模拟停车/离场
- **实时统计面板** — 占用率进度条、各状态车位数量统计
- **响应式动画** — Framer Motion 驱动的状态切换动画

## 技术栈

- React 19 + TypeScript
- Vite 7（构建工具）
- Tailwind CSS 3.4（样式框架）
- shadcn/ui（UI 组件库）
- Framer Motion（动画库）
- Lucide React（图标库）

## 项目结构

```
src/
  types/parking.ts       # 停车场数据类型定义
  hooks/useParkingData.ts # 停车场数据管理 Hook
  components/
    ParkingMap.tsx        # SVG 停车场平面图
    Sidebar.tsx           # 左侧边栏（楼层/搜索/筛选/统计）
    TopBar.tsx            # 顶部状态栏
    SpotDetail.tsx        # 车位详情弹窗
  App.tsx                 # 主应用组件
  App.css                 # 自定义样式
  index.css               # 全局主题配置
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 车位状态说明

| 状态 | 颜色 | 说明 |
|------|------|------|
| 空闲 | 绿色 | 可停放车辆 |
| 占用 | 红色 | 已被车辆占用 |
| 预留 | 黄色 | 已被预留，尚未停放 |
| 禁用 | 灰色 | 车位暂停使用 |
| VIP  | 紫色 | VIP 专用车位 |

## 数据模型

系统使用模拟数据，每层包含 A/B/C/D 四个区域，共 56 个车位。实时更新通过定时器模拟实现，可替换为真实 API 接入。

## License

MIT
