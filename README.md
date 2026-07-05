# Vapexa — 电子烟外贸产品展示网站

一个面向海外买家的电子烟产品展示单页网站，自带中英文双语切换和可视化后台管理面板（Decap CMS），可一键免费部署到云端。改产品、传图片不用碰代码。

> 产品类目：一次性小烟、换弹设备、主机设备、烟油、配件。示例文案与图片为占位，正式上线前替换成你自己的实拍与信息。电子烟属合规敏感品类，建议保留 CE / RoHS / TPD 等合规标识，有助获客。

## 文件结构

```
site/
├── index.html            # 网站主页（响应式英文展示页）
├── products.json         # 产品数据（后台编辑后自动更新）
├── site-settings.json    # 站点设置（公司名/邮箱/电话等）
├── images/products/      # 后台上传的产品图片存这里
└── admin/
    ├── index.html        # 后台管理面板入口（访问 /admin/）
    └── config.yml        # 后台配置（仓库、字段、媒体路径）
```

## 中英文双语切换

- 右上角 `EN | 中文` 按钮一键切换整站语言（导航、文案、产品名/描述/规格/分类标签、表单全部跟随切换）。
- 默认英文（给老外看）；切换到中文后地址栏带 `#zh`，刷新保持中文。
- 产品中英文在 `products.json` 里成对存在（`name` / `name_zh`、`description` / `description_zh` 等），后台 Decap CMS 也提供中英双字段填写。

## 30 秒本地预览

双击 `index.html` 在某些浏览器下产品可能加载不出来（本地文件无法 fetch JSON）。建议起一个本地服务器：

```bash
# 进到网站目录
cd 本目录路径

# 方式一：Python
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080

# 方式二：Node
npx serve .
```

## 部署到云端（推荐 Netlify，全免费）

### 1. 推到 GitHub
1. 在 GitHub 新建一个仓库（public 或 private 均可）。
2. 把本目录所有文件传上去（可网页拖拽上传，或用 git）。

### 2. 一键部署到 Netlify
1. 打开 https://app.netlify.com → "Add new site" → "Import an existing project"。
2. 选你的 GitHub 仓库，构建配置全部留空（这是纯静态站）：
   - Build command:（空）
   - Publish directory: `.`
3. 点 Deploy，几十秒后拿到一个 `https://xxx.netlify.app` 域名。

### 3. 开启后台管理面板
在 Netlify 里：
1. **Site settings → Identity → Enable Identity**，注册方式选 "Invite only"。
2. Identity → Services → **Git Gateway: Enable**。
3. 把 `admin/config.yml` 的 backend 改成最简版（推荐）：

```yaml
backend:
  name: git-gateway
  branch: main
```
（删掉原来的 `repo / auth_type / app_id` 三行即可）

4. Identity 页面 "Invite users" 填你自己的邮箱，去邮箱收邀请、设密码。
5. 访问 `https://你的域名/admin/` → 登录 → 即可在可视化后台增删改产品、传图片，保存后自动发布上线。

> 不想用 Netlify？Vercel / Cloudflare Pages 部署同理（纯静态）。GitHub Pages 也可，但 CMS 鉴权需额外配 OAuth proxy，Netlify 最省事。

## 询盘表单（Formspree）

1. 注册 https://formspree.io（免费 50 条/月），新建一个 form，拿到 form ID（形如 `xgebkvqk`）。
2. 打开 `index.html`，找到 `action="https://formspree.io/f/your-form-id"`，把 `your-form-id` 换成你的 ID。
3. 客户提交询盘 → 直接进你的邮箱。
4. 不配的话表单是演示模式，提交只显示成功提示，不会真的发送。

## 改公司信息

直接编辑 `index.html` 里的文案（公司名、邮箱、WhatsApp、地址），或在后台 "Site Settings" 里改 `site-settings.json`。

## 换产品图片（不上后台的话）

> 当前 `images/products/` 里的图是 AI 生成的示意图（带"AI 生成"水印），仅作排版演示。**正式上线前务必换成你自己的产品实拍**，白底图转化率最高。

1. 把产品图放进 `images/products/`（建议 4:3，宽度 800px 以上，白底）。
2. 编辑 `products.json`，把对应产品的 `"image"` 改成 `"/images/products/你的图.jpg"`。

## 二次开发提示

- 全部样式内联在 `index.html` 的 `<style>` 里，改色去顶部 `:root` 变量区。
- 产品卡片是 JS 读取 `products.json` 动态渲染的，加字段记得同步改 `renderProducts()`。
- 配色：navy `#0f172a` + accent blue `#2563eb` + amber `#f59e0b`，偏稳重国际风。

## 下一步建议

- 绑独立域名（Netlify 免费送 HTTPS）。
- 加 Google Analytics 看流量来源。
- 产品图用白底实拍，转化率更高。
- 多语言：复制一份 `index.html` 做西班牙语/阿拉伯语版，按地区分发。
