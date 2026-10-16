# 复杂组件交互经验参考

本文件沉淀执行过程中验证过的"难搞组件"的驱动方法，作为经验参考。核心循环（snapshot → @eN → 操作）对标准元素足够用；但对封装较深的自定义组件，`@eN` 常命中外层包装而非内部真实可交互节点，需配合 `eval` 下探 DOM。遇到"点了没反应 / 输入进不去 / 选了没生效"时，优先查本文件。

---

## 1. 搜索联想选择框（输入触发搜索 + 下拉选择）

### 适用场景

Ant Design 等框架常见的 Select with search / 远程搜索下拉：**不输入任何字符点击时下拉为空或"暂无数据"，必须先输入字符触发搜索，再从联想下拉中选择**。典型字段：品牌、型号、商品搜索选择等。

### 为什么直接操作会失败

- `fill @eN "x"` / `keyboard type`（@eN 为快照里的 combobox）往往无效：`@eN` 命中的是组件外层包装（`.ant-select-selector` / combobox 容器），而真正能接收输入的是内部隐藏的 `input.ant-select-input`。
- 全局 `document.querySelectorAll('.ant-select-item-option')[0]` 选选项很危险：页面同时存在多个 ant-select 的选项节点，会误选到其他字段的残留选项，**污染已填字段**（实测曾把已选的"品牌=Hisense"误改成别的字段的第一项）。

### 可行模式（三步）

1. **定位真实输入节点**：用 `eval` 列出页面所有 `input.ant-select-input`，按从上到下的表单顺序确定目标索引。
   ```bash
   agent-browser --session S eval "[...document.querySelectorAll('input.ant-select-input')].map((i,n)=>n+':'+(i.placeholder||'')).join('\n')"
   ```
2. **聚焦 + 键盘输入触发搜索**：`eval` 聚焦目标 input，再用 `keyboard type` 逐字输入（触发组件的搜索事件）。
   ```bash
   agent-browser --session S eval "document.querySelectorAll('input.ant-select-input')[N].focus()"
   agent-browser --session S keyboard type "<关键词>"
   ```
3. **只在"当前打开的下拉浮层"内精确选择**：限定在未隐藏的下拉浮层里按文本匹配点击选项，避免误选其他字段。用 IIFE 包裹，避免同一 session 下 eval 变量重名报错。
   ```bash
   agent-browser --session S eval "(()=>{const d=document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');if(!d)return 'NO_PANEL';const o=[...d.querySelectorAll('.ant-select-item-option')].find(e=>e.innerText.trim()==='<目标选项>');if(o){o.click();return 'OK:'+o.innerText}return 'NOT_FOUND'})()"
   ```
4. **验证**：截图或 `get` 确认框内已显示所选值（而非回落为 placeholder）。

### 实测例子（新运营后台 新建商品）

- 品牌：`focus input.ant-select-input[1]` + `keyboard type "H"` → 联想出 Hisense / TOSHIBA / ceshipinpai → 浮层内点选 "Hisense" 成功。
- 型号：品牌选定后 `focus input.ant-select-input[2]` + `keyboard type "A"` → 联想出型号候选 → 点选 "ASDFGG" 成功。
- 附带发现：品牌输中文"海信"→"暂无数据"，输"H"才命中"Hisense"——联想按英文名/拼音匹配。此类"中文搜不到"既可能是数据问题，也值得作为缺陷线索记录。

### 注意事项

- 异步加载：点开后下拉可能瞬时为空，选项是异步返回的；选择前确认当前浮层已有选项（上面的 `NO_PANEL` / 空数组即表示还没出来，需稍后重试或先输入关键词）。
- 变量重名：同一 session 连续 `eval` 复用上下文，裸声明 `const o=...` 会报 "Identifier already declared"，统一用 `(()=>{ ... })()` 包裹。
- eval 修改表单值要走组件事件：直接 `input.value='x'` 往往不触发框架的受控更新；触发搜索要靠 `focus + keyboard type` 这样产生真实键盘事件的方式。

---

## 2. 树形下拉选择（TreeSelect）

### 场景

后台类目等树形选择：点开后是多级树（一级 → 二级 → 叶子），需点到可选的叶子节点。

### 方法

- 点开选择框（快照里对应的 generic 包装 `@eN` 通常可点开），re-snapshot 或截图看树。
- 用 `find text "<叶子名称>" click` 选中具体叶子（实测海信商城后台类目选 "智能电视111" 成功）。
- 若 `find text` 命中多个同名或命中非选项元素，改用 `eval` 在当前打开的下拉浮层内按文本精确点击（同上第1节第3步的浮层限定思路）。

---

## 3. 通用排查顺序（遇到组件"不听话"时）

1. 先按核心循环用 `@eN` / `find` 直接操作——标准元素多数可行。
2. 不行则 `eval` 查该区域的真实 DOM：是不是 `@eN` 命中了包装层？真正的 input / 可点节点是哪个？
3. 输入类：`focus 真实input` + `keyboard type`（触发事件），必要时 `keyboard inserttext`。
4. 选择类：**务必限定"当前打开的浮层"**内按文本点选，禁用全局第一项选择器。
5. 每步 `screenshot` / `get` 验证，确认值真的进去了（防止"命令成功但值没生效"的假象）。
6. 全程 `errors` / `network requests` 辅助判断：是前端组件问题，还是接口没返回数据导致下拉为空。
