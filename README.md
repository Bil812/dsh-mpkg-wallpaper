# dsh-mpkg-wallpaper — DSH 壁纸引擎 mpkg 背景插件

[中文](README.md) | [English](README.en.md)

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 界面（dsh web）添加背景壁纸的客户端插件，**支持直接在浏览器里解析 Wallpaper Engine 的 `.mpkg` 文件**：

- 选择 `.mpkg` 文件 → 浏览器内解析容器 → 自动提取 `preview.gif`（壁纸的动态预览）作为**动态背景**（用 `<img>` 元素承载，GIF 动画可靠循环播放）；视频类壁纸自动播放内嵌 mp4
- 自动按**当前时间**选择素材（若壁纸包内含 `preview_night.gif` / `preview_day.gif` 等多时段素材）
- **可调参数（只读展示）**：解析 `project.json → general.properties`，展示壁纸自带的参数与当前值，供对照壁纸引擎 App
- **界面虚化（磨砂）**：磨砂模糊条（整张壁纸）、统一虚化（开关+整屏虚化条，聊天区/新会话按钮可独立选择是否跟随）、对话框/弹层/遮罩虚化三个独立开关+程度条
- 侧边栏/标题栏透出壁纸开关、镜头缩放（10–2000%）、镜头平移、面板不透明度、轻度锐化、Deep diving 背景框开关
- **冲突检测**：检测到其他壁纸/主题插件（插件 ID 名单 + 运行时检测 body 背景图/其他全屏背景层）自动关闭本功能
- **第三方插件共存**：与侧边栏/设置页类插件（DSH-better-sidebar、dsh-chat-import、dsh-sidebar-qa、dsh-plugin-account-balance 等）共存无冲突——本插件 CSS 只命中 DSH 原生区域类名，不覆盖插件注入内容；注入侧边栏的第三方内容自动获得 45% 雾底保证在壁纸上可读
- 设置页位于 **设置 → 壁纸引擎背景**（左侧导航，中性图标）
- 所有设置持久化在浏览器 localStorage；大文件（图片/GIF/视频/内嵌 mp4）自动存入浏览器 IndexedDB，刷新不丢失

## 功能与设置分组

- **背景来源**：总开关、mpkg 文件、图片链接、本地图片/动图
- **外观**：面板不透明度、磨砂模糊、镜头缩放、镜头位置
- **界面虚化**：统一虚化程度、对话框/弹层/遮罩虚化开关 + 程度、Deep diving 背景框、标题栏磨砂/透出壁纸
- **其他**：侧边栏透出壁纸、轻度锐化、恢复默认

## 截图演示

![侧边栏收起 · 新会话界面](screenshots/dhsw1.jpg)

*动态壁纸铺满整个界面。此状态下侧边栏收起，聊天框位于屏幕中央并带有磨砂模糊效果；侧边栏呈全透明状态，壁纸完整透出，画面干净通透。*

![侧边栏展开](screenshots/dshw2.jpg)

*侧边栏展开后，界面叠加了一层白色滤镜，通透度略低于上图；侧边栏呈半透明状态（约 50% 白雾）。这层白雾的厚薄可通过「面板不透明度」与「统一虚化」滑条随时调节。*

![设置页](screenshots/dshw3.jpg)

*壁纸引擎背景的设置界面。截图之外，外观几乎全部可调：统一虚化（聊天区/新会话按钮可独立选择是否跟随）、对话框/弹层/遮罩虚化、镜头缩放与平移、侧边栏/标题栏透出壁纸、标题栏磨砂程度、轻度锐化，以及部分壁纸的按时间自动切换。*

## 渲染可行性研究

- 完整场景（含 Live2D 木偶）只能由专有渲染器完成：`壁纸引擎` App 的原生库 `libscenejni.so`（40MB，内嵌 Chromium + 专有 puppet 渲染）；开源方案 [we-layerd](https://github.com/Aromatic05/we-layerd)（Rust）打包了官方渲染器，但**仅限 Linux Wayland** 桌面（GNOME/niri/Hyprland/KDE Plasma），Windows 与 Termux proot 都跑不了
- 浏览器端没有成熟的 WE 场景渲染器（[wallgl](https://github.com/lucaschnabel42/wallgl) 是雏形且不支持木偶；pixeltris/wallpaper-engine-web 已消失）——**与操作系统无关，任何浏览器都无法直接渲染 Live2D 场景**
- **可行路径（跨平台通用）**：外部渲染成视频 → 插件**视频背景**（MP4/WebM 存 IndexedDB，`<video>` 循环播放）：
  - **Windows**：Wallpaper Engine 官方版（Steam，Windows 原生渲染全部场景）或开源 [Lively Wallpaper](https://github.com/rocksdanister/lively)（支持视频/网页壁纸，不解析 WE 场景格式）→ 录屏导出 mp4
  - **Linux 桌面**：we-layerd 渲染 → 录屏
  - **移动端**：壁纸引擎 App 录屏
- 插件在任意平台（Windows/Linux/macOS/移动端）的 dsh web 上功能一致：preview.gif / 内嵌视频纹理 / 多时段切换全部可用

## 官方文档

Wallpaper Engine 官方帮助站 [help.wallpaperengine.io](https://help.wallpaperengine.io) 有移动端章节（与 Windows 配对等）；mpkg 容器格式为专有格式，官方未公开文档。

## 安装

### 方式一：dsh plugin add（推荐）

```bash
dsh plugin --profile web add dsh-mpkg-wallpaper
# 重启 dsh web 后浏览器 Ctrl+F5 生效
```

### 方式二：手动复制

把插件目录（或 GitHub 下载的 zip 解压）放到 `$DSH_HOME/profiles/node_modules/dsh-mpkg-wallpaper/`，
并在 profile 的 `cordis.patch.yml` 注册一行：

```yaml
- insert:
    - id: dsh-mpkg-wallpaper
      name: dsh-mpkg-wallpaper
```

### 方式三：GitHub 克隆

```bash
git clone https://github.com/XHR666/dsh-mpkg-wallpaper.git $DSH_HOME/profiles/node_modules/dsh-mpkg-wallpaper
```

卸载：`dsh plugin --profile web remove dsh-mpkg-wallpaper`（或删除挂载行 + 插件目录 + 重启）。

## 使用

设置 → **壁纸引擎背景**：

| 控件 | 说明 |
|---|---|
| 选择 .mpkg 文件 | 自动取 preview.gif（或按时间取素材）作动态背景；也可直接选 mp4/webm |
| 可调参数 | 壁纸自带的参数与当前值（只读展示，供对照壁纸引擎 App） |
| 图片链接 / 本地图片 | 普通图片或 GIF |
| 面板不透明度 | 50–100% |
| 磨砂模糊 | 整张壁纸的模糊程度 0–40px（0=清晰） |
| 统一虚化 | 整屏朦胧感一个条控制；聊天区/新会话按钮可独立选择是否跟随 |
| 对话框/弹层/遮罩虚化 | 三个独立开关+程度条 |
| 镜头缩放/位置 | 背景画面放大（10–2000%）与平移；缩小可看到画面边缘的组件 |
| 侧边栏/标题栏透出壁纸 | 开关；关闭后对应区域纯色不透明 |
| 轻度锐化 | 提升低清观感；GIF 卡顿就关 |

## 安全说明

- **无主动网络请求**：插件不 fetch/XHR/WebSocket；唯一网络行为是用户手动输入的图片 URL 由浏览器加载（与官方示例插件相同）
- **无敏感内容**：源码不含路径、密钥、令牌、个人信息
- **无第三方闭源代码**：仅依赖 DSH 自带 react + 官方 slots/locale 接口
- 参考项目（均开源）：[dsh-bg-image](https://github.com/lyh9712/dsh-bg-image)（MIT，模板）、[unmpkg](https://github.com/aqnya/unmpkg)（GPL-3.0，仅参考 mpkg 二进制格式）、[repkg](https://github.com/notscuffed/repkg)（GPL，仅研究 .tex 格式）、[astc-encoder](https://github.com/ARM-software/astc-encoder)（Apache-2.0，本地解码实验）
- 数据边界：所有解析在浏览器本地完成；localStorage 只存背景图 data URL 与参数编辑

## 限制

- **场景类壁纸**（Live2D 木偶 + shader + 粒子）：完整动态场景只能在壁纸引擎 App 渲染，浏览器取用的 `preview.gif` 是作者生成的动画预览，全屏可能偏模糊（缩放/锐化可缓解）
- **可调参数为只读展示**：浏览器显示的是预渲染素材，修改参数不会改变画面；如需生效请在壁纸引擎 App 中调整
- **超大素材**：独立视频 >600MB、视频纹理 >250MB、图片 >200MB 时浏览器无法处理（会提示并尽量回退到预览图）

## 支持的 mpkg 输入

- **Wallpaper Engine .mpkg**（PKGM0014 视频类 / PKGM0018 场景类）——也可直接选择 **mp4/webm** 视频文件
- 大小限制（移动端浏览器友好）：
  - 整个文件 **> 600MB** 直接拒绝
  - 独立视频 **> 600MB**、视频纹理 **> 250MB**、图片/GIF **> 200MB** 无法处理——插件会提示并尽量回退到预览图
  - 浏览器**存储配额**（IndexedDB）也可能成为限制，此时提示"存储空间不足"
- 导入后显示效果取决于壁纸内容：
  - **视频类壁纸**（内嵌 mp4）：直接播放视频作为背景
  - **场景类壁纸**（Live2D 等）：使用作者生成的 `preview.gif`（浏览器无法渲染 WE 场景）
  - **蓝幕/绿幕抠像层**：回退使用预览图（直接播原片会显示蓝/绿背景）

## 反馈 Bug

反馈问题时请附带：
- **原始 .mpkg 源文件**（复现问题所必需）
- 浏览器控制台输出（F12 → Console），如有
- 你的 DSH 版本与平台（Windows / Linux / 移动端）

## 文件结构

```
dsh-mpkg-wallpaper/
├── package.json      # dsh.bundle + dsh.client 声明
├── cordis.patch.yml  # 插件安装声明（dsh plugin add 使用）
├── lib/
│   ├── index.js      # 宿主端空实现（纯客户端插件）
│   └── client.js     # 浏览器端：mpkg 解析 + 设置页 + 背景 DOM + 虚化体系
├── tools/            # mpkg/tex/mdl 逆向解析工具（供开发者参考）
├── README.md         # 英文说明
└── README.zh-CN.md   # 本文件（中文）
```

## GitHub 发布说明

### 可移植性（在他人的设备上也能用）

- 无绝对路径、无本机端口、无环境专属配置；依赖仅 DSH 自带 react + 官方 slots/locale 接口
- **自定义导航图标**：`lib/client.js` 里的 `NAV_ICON` 常量（默认是自绘的"风景画"SVG，无商标）可替换——改成你自己的图标即可（20×20，推荐 SVG data URL 或 base64 PNG）
- 素材库网页（`http://127.0.0.1:8090/素材库.html`）是独立工具，不随插件发布；需要时自行用 `python3 -m http.server 8090 -d 素材目录` 启动

### 包含的逆向工具（tools/）

| 工具 | 用途 |
|---|---|
| `unmpkg.py` | mpkg 容器解析/提取（PKGM0014/0018） |
| `tex2png.py` | TEXV0005 纹理解码（DXT5/R8 等） |
| `mdl_explorer.py` | .mdl 结构探索（块标签/网格/浮点区段） |
| `xref.py` | wallpaper64.exe 字符串 xref + 反汇编（capstone） |
| `MDL-格式分析笔记.md` | .mdl 格式逆向进展（容器/网格已破解，骨骼=JSON，动画待续） |

### 壁纸格式研究摘要（供其他开发者）

- **mpkg**：PKGM0014（视频类：mp4+gif+json）/ PKGM0018（场景类：scene.json+tex+mdl+shader）
- **tex**：TEXV0005，格式 5=DXT 家族，格式 34=内嵌 MP4 视频纹理（customize 壁纸的 4K 动画直接在里面）
- **mdl**：MDLV00xx 块容器；网格=8 float/顶点；MDLS0003/0004 含 JSON 骨骼姿态；MDLA=动画
