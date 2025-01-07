/**
 * 钩子文案模板
 * @type {string[]}
 */
const HOOKS = {
    2: [], // 适用于2个工具的钩子文案
    3: [], // 适用于3个工具的钩子文案
    4: []  // 适用于4个工具的钩子文案
};

/**
 * 工具库数据
 * @type {Object[]}
 */
const TOOLS = [
    {
        name: "PDF24",
        category: "pdf",
        description: "这是一款在PDF处理领域很强大的工具。它有着格式转换、编辑、合并、PDF转图片、转Word等数十种功能，免费且使用次数无限制。所有文件操作在本地进行，不用上传，方便又高效。"
    },
    {
        name: "Viggle ai",
        category: "ai",
        description: "上传一段含人物动作的视频与一张其他人物的图片后，就能把视频中的人物变成图片中的人物，人物动作与原视频相符，用它来做创意视频流量很是诱人。"
    },
    {
        name: "Domo ai",
        category: "ai",
        description: "当下超高效的视频转绘工具。上传一个视频，就能把它转变成指定风格，不必进行部署，直接在线操作，上手简单。转换后的画面稳定、连贯，没有诡异闪烁，人物也不会出现鬼畜状况。"
    },
    {
        name: "Docsmall",
        category: "pdf",
        description: "一个免费的在线工具网站，提供PDF处理、图片处理等功能。PDF方面，支持合并、分割、压缩和转格式；图片方面，支持抠图、元素擦除、图片高清优化等。操作简单，支持批量处理和一键打包下载。"
    },
    {
        name: "新工具名称",
        category: "分类",
        description: "工具描述"
    }
];

/**
 * 随机选择数组中的一个元素
 * @param {Array} arr - 输入数组
 * @returns {*} 随机选中的元素
 */
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * AI改写工具描述
 * @param {string} description - 原始描述
 * @returns {Promise<string>} 改写后的描述
 */
async function rewriteDescription(description) {
    const ZHIPU_API_KEY = '216acebc858c43a5b52a3ca0cd0e7961.TvxVntfMvJ1yi3cE';
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    const prompt = `请你作为抖音爆款文案专家，改写以下工具介绍文案。

    原文：${description}

    改写要求：
    1. 保持核心功能信息准确完整
    2. 字数控制在原文的90%-110%之间
    3. 使用抖音短视频风格的表达方式
    4. 避免重复的开头（不要都用"本工具"开头）
    5. 语言要简单直白，让新手也能秒懂
    6. 突出工具的关键优势和使用场景
    
    注意：
    - 使用口语化表达，但保持专业性
    - 可以适度使用感叹号
    - 严格禁止使用任何表情符号
    - 避免过度营销的词汇（如"神器"、"逆天"等）
    - 开头要多样化，比如：
      * 直接描述功能："一键上传视频就能..."
      * 描述使用场景："想做创意视频的时候..."
      * 描述问题解决："再也不用担心..."
      * 直接点出优势："免费使用，无次数限制..."
    - 结尾要有吸引力，但不要过度夸张
    
    示例格式：
    "上传一段视频就能转换成任意风格，不用部署不用学习，直接在线操作！画面稳定流畅，完全不会出现闪烁和鬼畜，让你的视频创作更轻松。"`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZHIPU_API_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                top_p: 0.7,
                max_tokens: 1500,
                stream: false
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('AI改写失败:', error);
        return description;
    }
}

/**
 * 保存工具到localStorage
 */
function saveTools() {
    localStorage.setItem('tools', JSON.stringify(TOOLS));
}

/**
 * 从localStorage加载工具
 */
function loadTools() {
    const savedTools = localStorage.getItem('tools');
    if (savedTools) {
        TOOLS.length = 0;
        TOOLS.push(...JSON.parse(savedTools));
    }
}

/**
 * 添加新工具
 */
function addNewTool() {
    const name = document.getElementById('newToolName').value;
    const description = document.getElementById('newToolDescription').value;
    const category = document.getElementById('newToolCategory').value;

    if (!name || !description) {
        alert('请填写完整信息！');
        return;
    }

    TOOLS.push({ name, description, category });
    KnowledgeBase.save();
    alert('添加成功！');
    toggleToolForm();
}

/**
 * 显示/隐藏添加工具表单
 */
function toggleToolForm() {
    if (!checkAuth()) return;
    const form = document.getElementById('toolForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

/**
 * 存储已选择的工具
 */
let selectedTools = [];

/**
 * 显示/隐藏工具选择器
 */
function toggleToolSelector() {
    const selector = document.getElementById('toolSelector');
    if (selector.style.display === 'none') {
        // 显示选择器时，生成工具列表
        const toolList = document.getElementById('toolList');
        toolList.innerHTML = TOOLS.map((tool, index) => `
            <div style="margin: 10px 0;">
                <label style="display: flex; align-items: center;">
                    <input type="checkbox" value="${index}" 
                        ${selectedTools.includes(tool) ? 'checked' : ''}
                        onchange="handleToolSelection(this, ${index})">
                    <span style="margin-left: 8px;">
                        ${tool.name} (${tool.category})
                    </span>
                </label>
            </div>
        `).join('');
        selector.style.display = 'block';
    } else {
        selector.style.display = 'none';
    }
}

/**
 * 处理工具选择
 */
function handleToolSelection(checkbox, index) {
    const tool = TOOLS[index];
    const toolCount = parseInt(document.getElementById('toolCount').value);
    
    if (checkbox.checked) {
        if (selectedTools.length >= toolCount) {
            alert(`最多只能选择${toolCount}个工具！`);
            checkbox.checked = false;
            return;
        }
        selectedTools.push(tool);
    } else {
        selectedTools = selectedTools.filter(t => t !== tool);
    }
}

/**
 * 确认工具选择
 */
function confirmToolSelection() {
    const toolCount = parseInt(document.getElementById('toolCount').value);
    if (selectedTools.length !== toolCount) {
        alert(`请选择${toolCount}个工具！`);
        return;
    }
    toggleToolSelector();
}

/**
 * 生成模式
 */
const GENERATE_MODES = {
    SELECTED: 'selected',  // 使用选定的工具
    RANDOM: 'random'       // 随机从知识库选择工具
};

/**
 * 生成完整文案
 */
async function generateContent() {
    if (!checkAuth()) return;
    const category = document.getElementById('category').value;
    const batchCount = parseInt(document.getElementById('batchCount').value);
    const generateMode = document.getElementById('generateMode').value;
    const toolCount = parseInt(document.getElementById('toolCount').value);
    
    // 检查条件
    if (generateMode === GENERATE_MODES.SELECTED) {
        if (selectedTools.length !== toolCount) {
            alert(`请选择${toolCount}个要使用的工具！`);
            toggleToolSelector();
            return;
        }
    } else {
        const availableTools = category === 'all' ? 
            TOOLS : 
            TOOLS.filter(tool => tool.category === category);
        
        if (availableTools.length < toolCount) {
            alert(`当前分类下的工具数量不足${toolCount}个，请先添加更多工具！`);
            return;
        }
    }

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = ''; // 清空之前的结果
    
    // 批量生成文案
    for (let i = 0; i < batchCount; i++) {
        // 为每篇文章创建容器
        const articleContainer = document.createElement('div');
        articleContainer.className = 'article-container';
        
        // 添加文章编号
        if (batchCount > 1) {
            const articleNumber = document.createElement('div');
            articleNumber.className = 'article-number';
            articleNumber.textContent = `文案 ${i + 1}`;
            articleContainer.appendChild(articleNumber);
        }
        
        // 随机选择对应数量工具的钩子文案
        const hook = randomChoice(HOOKS[toolCount]);
        
        // 添加钩子文案
        const hookDiv = document.createElement('div');
        hookDiv.className = 'hook-text';
        hookDiv.textContent = hook;
        articleContainer.appendChild(hookDiv);
        
        // 根据模式选择工具
        let toolsToUse;
        if (generateMode === GENERATE_MODES.SELECTED) {
            toolsToUse = [...selectedTools];
        } else {
            // 从知识库中随机选择指定数量的工具
            const availableTools = category === 'all' ? 
                TOOLS : 
                TOOLS.filter(tool => tool.category === category);
            
            toolsToUse = availableTools
                .sort(() => Math.random() - 0.5)
                .slice(0, toolCount);
        }
        
        // 随机打乱选中的工具顺序
        let shuffledTools = toolsToUse.sort(() => Math.random() - 0.5);

        // 先收集所有工具的改写文案
        const rewrittenTools = await Promise.all(shuffledTools.map(async (tool) => {
            const rewrittenDesc = await rewriteDescription(tool.description);
            return {
                tool,
                rewrittenDesc
            };
        }));
        
        // 按顺序展示工具
        rewrittenTools.forEach((item, index) => {
            const { tool, rewrittenDesc } = item;
            
            // 创建工具展示区域
            const toolDiv = document.createElement('div');
            toolDiv.className = 'tool-item';
            
            // 工具名称
            const nameDiv = document.createElement('div');
            nameDiv.className = 'tool-name';
            nameDiv.textContent = `第${index + 1}个${tool.name}`;
            
            // 原始文案
            const originalDiv = document.createElement('div');
            originalDiv.className = 'original-text';
            originalDiv.textContent = `原文：${tool.description}`;
            
            // 改写后的文案
            const rewrittenDiv = document.createElement('div');
            rewrittenDiv.className = 'rewritten-text';
            rewrittenDiv.textContent = `改写：${rewrittenDesc}`;
            
            // 组装
            toolDiv.appendChild(nameDiv);
            toolDiv.appendChild(originalDiv);
            toolDiv.appendChild(rewrittenDiv);
            articleContainer.appendChild(toolDiv);
        });
        
        // 添加文章分隔符（除了最后一篇）
        if (i < batchCount - 1) {
            const separator = document.createElement('div');
            separator.className = 'article-separator';
            articleContainer.appendChild(separator);
        }
        
        resultContainer.appendChild(articleContainer);
    }
}

/**
 * 复制文案到剪贴板
 */
function copyContent() {
    const content = document.getElementById('result');
    if (!content.textContent) {
        alert('请先生成文案！');
        return;
    }
    
    // 收集所有文章的文本
    const articles = Array.from(content.querySelectorAll('.article-container')).map(article => {
        const hook = article.querySelector('.hook-text').textContent;
        const rewrittenTexts = Array.from(article.querySelectorAll('.tool-name, .rewritten-text'))
            .map(el => el.textContent.replace('改写：', ''))
            .join('\n\n');
        return `${hook}\n\n${rewrittenTexts}`;
    }).join('\n\n----------------------------------------\n\n');
    
    navigator.clipboard.writeText(articles).then(() => {
        alert('复制成功！');
    }).catch(() => {
        alert('复制失败，请手动复制！');
    });
}

/**
 * 导出为图片
 */
function exportToImage() {
    const content = document.getElementById('result');
    if (!content.textContent) {
        alert('请先生成文案！');
        return;
    }

    html2canvas(content).then(canvas => {
        const link = document.createElement('a');
        link.download = `工具文案_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

/**
 * 导出为文本文件
 */
function exportToTxt() {
    const content = document.getElementById('result');
    if (!content.textContent) {
        alert('请先生成文案！');
        return;
    }
    
    // 收集所有文章的文本
    const articles = Array.from(content.querySelectorAll('.article-container')).map(article => {
        const hook = article.querySelector('.hook-text').textContent;
        const rewrittenTexts = Array.from(article.querySelectorAll('.tool-name, .rewritten-text'))
            .map(el => el.textContent.replace('改写：', ''))
            .join('\n\n');
        return `${hook}\n\n${rewrittenTexts}`;
    }).join('\n\n----------------------------------------\n\n');
    
    // 创建Blob对象
    const blob = new Blob([articles], { type: 'text/plain;charset=utf-8' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // 生成文件名（使用当前时间戳）
    const date = new Date();
    const fileName = `工具文案_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}.txt`;
    
    link.download = fileName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

/**
 * 知识库管理
 */
const KnowledgeBase = {
    /**
     * 保存知识库到本地存储
     */
    save() {
        localStorage.setItem('knowledgeBase', JSON.stringify({
            tools: TOOLS,
            hooks: HOOKS
        }));
    },

    /**
     * 从本地存储加载知识库
     */
    load() {
        const saved = localStorage.getItem('knowledgeBase');
        if (saved) {
            const data = JSON.parse(saved);
            TOOLS.length = 0;
            // 初始化HOOKS对象
            HOOKS[2] = [];
            HOOKS[3] = [];
            HOOKS[4] = [];
            TOOLS.push(...data.tools);
            // 如果是旧版本数据，将所有钩子文案放入3个工具的分类
            if (Array.isArray(data.hooks)) {
                HOOKS[3] = [...data.hooks];
            } else {
                // 新版本数据，按工具数量分类
                Object.keys(data.hooks).forEach(count => {
                    HOOKS[count] = [...data.hooks[count]];
                });
            }
        }
    },

    /**
     * 导出知识库为JSON文件
     */
    exportToFile() {
        const data = JSON.stringify({
            tools: TOOLS,
            hooks: HOOKS
        }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `工具文案知识库_${new Date().getTime()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    /**
     * 从JSON文件导入知识库
     */
    async importFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (data.tools && data.hooks) {
                TOOLS.length = 0;
                HOOKS.length = 0;
                TOOLS.push(...data.tools);
                HOOKS.push(...data.hooks);
                this.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('导入失败:', error);
            return false;
        }
    }
};

// 初始化时加载保存的工具
loadTools(); 

/**
 * 显示/隐藏工具管理器
 */
function toggleManageTools() {
    if (!checkAuth()) return;
    const manager = document.getElementById('toolManager');
    if (manager.style.display === 'none') {
        // 显示工具列表
        const toolList = document.getElementById('toolManagerList');
        toolList.innerHTML = TOOLS.map((tool, index) => `
            <div style="margin: 10px 0; padding: 10px; background: #f5f5f7; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${tool.name}</strong>
                    <button class="button" onclick="deleteTool(${index})" 
                        style="background: #FF3B30; padding: 4px 12px;">删除</button>
                </div>
                <div style="margin-top: 5px; color: #666;">
                    分类：${tool.category}
                </div>
                <div style="margin-top: 5px; font-size: 14px;">
                    ${tool.description}
                </div>
            </div>
        `).join('');
        manager.style.display = 'block';
    } else {
        manager.style.display = 'none';
    }
}

/**
 * 删除工具
 */
function deleteTool(index) {
    if (confirm('确定要删除这个工具吗？')) {
        TOOLS.splice(index, 1);
        KnowledgeBase.save();
        toggleManageTools(); // 刷新列表
        toggleManageTools();
    }
}

/**
 * 显示/隐藏钩子管理器
 */
function toggleManageHooks() {
    if (!checkAuth()) return;
    const manager = document.getElementById('hookManager');
    if (manager.style.display === 'none') {
        // 更新每个工具数量的钩子列表
        [2, 3, 4].forEach(count => {
            const hookList = document.querySelector(`#hooks-${count} .hook-list`);
            hookList.innerHTML = HOOKS[count].map((hook, index) => `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f7; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>${hook}</div>
                        <button class="button" onclick="deleteHook(${count}, ${index})" 
                            style="background: #FF3B30; padding: 4px 12px;">删除</button>
                    </div>
                </div>
            `).join('');
        });
        manager.style.display = 'block';
    } else {
        manager.style.display = 'none';
    }
}

/**
 * 添加钩子文案
 */
function addHook() {
    const input = document.getElementById('newHook');
    const hook = input.value.trim();
    const toolCount = parseInt(document.getElementById('hookToolCount').value);
    
    if (!hook) {
        alert('请输入钩子文案！');
        return;
    }
    
    HOOKS[toolCount].push(hook);
    KnowledgeBase.save();
    input.value = '';
    
    // 刷新列表
    toggleManageHooks();
    toggleManageHooks();
}

/**
 * 删除钩子文案
 */
function deleteHook(count, index) {
    if (confirm('确定要删除这个钩子文案吗？')) {
        HOOKS[count].splice(index, 1);
        KnowledgeBase.save();
        toggleManageHooks(); // 刷新列表
        toggleManageHooks();
    }
}

/**
 * 切换工具添加方式标签页
 */
function switchToolTab(tab) {
    document.querySelectorAll('#toolForm .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('singleToolForm').style.display = tab === 'single' ? 'block' : 'none';
    document.getElementById('batchToolForm').style.display = tab === 'batch' ? 'block' : 'none';
}

/**
 * 切换钩子添加方式标签页
 */
function switchHookTab(tab) {
    document.querySelectorAll('#hookManager .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('singleHookForm').style.display = tab === 'single' ? 'block' : 'none';
    document.getElementById('batchHookForm').style.display = tab === 'batch' ? 'block' : 'none';
}

/**
 * 下载模板文件
 */
function downloadTemplate(type) {
    const templates = {
        tool: [['分类', '名称', '描述'],
               ['pdf', '示例工具1', '这是一个示例工具描述'],
               ['ai', '示例工具2', '这是另一个示例工具描述']],
        hook: [['钩子文案'],
               ['这是示例钩子文案1'],
               ['这是示例钩子文案2']]
    };
    
    const csv = templates[type].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = type === 'tool' ? '工具导入模板.csv' : '钩子文案导入模板.csv';
    link.click();
}

/**
 * 处理批量工具导入
 */
async function handleBatchToolImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const rows = text.split('\n').map(row => row.split(','));
        rows.shift(); // 移除表头
        
        const tools = rows.filter(row => row.length === 3).map(row => ({
            category: row[0].trim(),
            name: row[1].trim(),
            description: row[2].trim()
        }));
        
        if (tools.length === 0) {
            alert('没有找到有效的工具数据！');
            return;
        }
        
        TOOLS.push(...tools);
        KnowledgeBase.save();
        alert(`成功导入${tools.length}个工具！`);
        event.target.value = '';
        toggleToolForm();
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查文件格式！');
    }
}

/**
 * 处理批量钩子文案导入
 */
async function handleBatchHookImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const rows = text.split('\n').map(row => row.trim());
        rows.shift(); // 移除表头
        
        const hooks = rows.filter(row => row.length > 0);
        
        if (hooks.length === 0) {
            alert('没有找到有效的钩子文案！');
            return;
        }
        
        HOOKS.push(...hooks);
        KnowledgeBase.save();
        alert(`成功导入${hooks.length}个钩子文案！`);
        event.target.value = '';
        toggleManageHooks();
        toggleManageHooks();
    } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请检查文件格式！');
    }
}

// 监听生成模式变化
document.getElementById('generateMode').addEventListener('change', function(e) {
    const toolSelector = document.querySelector('.button[onclick="toggleToolSelector()"]');
    toolSelector.style.display = e.target.value === 'selected' ? 'inline-block' : 'none';
});

// 初始化时隐藏工具选择按钮（如果是随机模式）
if (document.getElementById('generateMode').value === 'random') {
    document.querySelector('.button[onclick="toggleToolSelector()"]').style.display = 'none';
} 

// 用户验证系统
const AUTH = {
    // 预设的账号密码（50个随机账号）
    users: {
        'yuta8001': 'pass3721',  // 1
        'yuta8002': 'pass4832',  // 2
        'yuta8003': 'pass9173',  // 3
        'yuta8004': 'pass6254',  // 4
        'yuta8005': 'pass1845',  // 5
        'yuta8006': 'pass7396',  // 6
        'yuta8007': 'pass2987',  // 7
        'yuta8008': 'pass5438',  // 8
        'yuta8009': 'pass8169',  // 9
        'yuta8010': 'pass4710',  // 10
        'yuta8011': 'pass9321',  // 11
        'yuta8012': 'pass5842',  // 12
        'yuta8013': 'pass1473',  // 13
        'yuta8014': 'pass6954',  // 14
        'yuta8015': 'pass3285',  // 15
        'yuta8016': 'pass8796',  // 16
        'yuta8017': 'pass4127',  // 17
        'yuta8018': 'pass9658',  // 18
        'yuta8019': 'pass5189',  // 19
        'yuta8020': 'pass2740',  // 20
        'yuta8021': 'pass7311',  // 21
        'yuta8022': 'pass4862',  // 22
        'yuta8023': 'pass9393',  // 23
        'yuta8024': 'pass5924',  // 24
        'yuta8025': 'pass1455',  // 25
        'yuta8026': 'pass6986',  // 26
        'yuta8027': 'pass3517',  // 27
        'yuta8028': 'pass8048',  // 28
        'yuta8029': 'pass4579',  // 29
        'yuta8030': 'pass9130',  // 30
        'yuta8031': 'pass5661',  // 31
        'yuta8032': 'pass2192',  // 32
        'yuta8033': 'pass7723',  // 33
        'yuta8034': 'pass4254',  // 34
        'yuta8035': 'pass8785',  // 35
        'yuta8036': 'pass5316',  // 36
        'yuta8037': 'pass1847',  // 37
        'yuta8038': 'pass6378',  // 38
        'yuta8039': 'pass2909',  // 39
        'yuta8040': 'pass7440',  // 40
        'yuta8041': 'pass3971',  // 41
        'yuta8042': 'pass8502',  // 42
        'yuta8043': 'pass4033',  // 43
        'yuta8044': 'pass9564',  // 44
        'yuta8045': 'pass5095',  // 45
        'yuta8046': 'pass1626',  // 46
        'yuta8047': 'pass6157',  // 47
        'yuta8048': 'pass2688',  // 48
        'yuta8049': 'pass7219',  // 49
        'yuta8050': 'pass3750'   // 50
    },

    // 检查登录状态
    checkLogin() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // 登录
    login(username, password) {
        if (this.users[username] && this.users[username] === password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            return true;
        }
        return false;
    },

    // 登出
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        location.reload();
    }
};

// 登录函数
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('请输入用户名和密码！');
        return;
    }

    if (AUTH.login(username, password)) {
        document.getElementById('loginOverlay').style.display = 'none';
    } else {
        alert('用户名或密码错误！');
    }
}

// 检查登录状态
function checkLoginStatus() {
    if (!AUTH.checkLogin()) {
        document.getElementById('loginOverlay').style.display = 'flex';
    } else {
        document.getElementById('loginOverlay').style.display = 'none';
    }
}

// 在所有需要验证的函数前添加登录检查
function checkAuth() {
    if (!AUTH.checkLogin()) {
        alert('请先登录！');
        document.getElementById('loginOverlay').style.display = 'flex';
        return false;
    }
    return true;
}

// 修改生成内容函数，添加权限验证
async function generateContent() {
    if (!checkAuth()) return;
    const category = document.getElementById('category').value;
    const batchCount = parseInt(document.getElementById('batchCount').value);
    const generateMode = document.getElementById('generateMode').value;
    const toolCount = parseInt(document.getElementById('toolCount').value);
    
    // 检查条件
    if (generateMode === GENERATE_MODES.SELECTED) {
        if (selectedTools.length !== toolCount) {
            alert(`请选择${toolCount}个要使用的工具！`);
            toggleToolSelector();
            return;
        }
    } else {
        const availableTools = category === 'all' ? 
            TOOLS : 
            TOOLS.filter(tool => tool.category === category);
        
        if (availableTools.length < toolCount) {
            alert(`当前分类下的工具数量不足${toolCount}个，请先添加更多工具！`);
            return;
        }
    }

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = ''; // 清空之前的结果
    
    // 批量生成文案
    for (let i = 0; i < batchCount; i++) {
        // 为每篇文章创建容器
        const articleContainer = document.createElement('div');
        articleContainer.className = 'article-container';
        
        // 添加文章编号
        if (batchCount > 1) {
            const articleNumber = document.createElement('div');
            articleNumber.className = 'article-number';
            articleNumber.textContent = `文案 ${i + 1}`;
            articleContainer.appendChild(articleNumber);
        }
        
        // 随机选择对应数量工具的钩子文案
        const hook = randomChoice(HOOKS[toolCount]);
        
        // 添加钩子文案
        const hookDiv = document.createElement('div');
        hookDiv.className = 'hook-text';
        hookDiv.textContent = hook;
        articleContainer.appendChild(hookDiv);
        
        // 根据模式选择工具
        let toolsToUse;
        if (generateMode === GENERATE_MODES.SELECTED) {
            toolsToUse = [...selectedTools];
        } else {
            // 从知识库中随机选择指定数量的工具
            const availableTools = category === 'all' ? 
                TOOLS : 
                TOOLS.filter(tool => tool.category === category);
            
            toolsToUse = availableTools
                .sort(() => Math.random() - 0.5)
                .slice(0, toolCount);
        }
        
        // 随机打乱选中的工具顺序
        let shuffledTools = toolsToUse.sort(() => Math.random() - 0.5);

        // 先收集所有工具的改写文案
        const rewrittenTools = await Promise.all(shuffledTools.map(async (tool) => {
            const rewrittenDesc = await rewriteDescription(tool.description);
            return {
                tool,
                rewrittenDesc
            };
        }));
        
        // 按顺序展示工具
        rewrittenTools.forEach((item, index) => {
            const { tool, rewrittenDesc } = item;
            
            // 创建工具展示区域
            const toolDiv = document.createElement('div');
            toolDiv.className = 'tool-item';
            
            // 工具名称
            const nameDiv = document.createElement('div');
            nameDiv.className = 'tool-name';
            nameDiv.textContent = `第${index + 1}个${tool.name}`;
            
            // 原始文案
            const originalDiv = document.createElement('div');
            originalDiv.className = 'original-text';
            originalDiv.textContent = `原文：${tool.description}`;
            
            // 改写后的文案
            const rewrittenDiv = document.createElement('div');
            rewrittenDiv.className = 'rewritten-text';
            rewrittenDiv.textContent = `改写：${rewrittenDesc}`;
            
            // 组装
            toolDiv.appendChild(nameDiv);
            toolDiv.appendChild(originalDiv);
            toolDiv.appendChild(rewrittenDiv);
            articleContainer.appendChild(toolDiv);
        });
        
        // 添加文章分隔符（除了最后一篇）
        if (i < batchCount - 1) {
            const separator = document.createElement('div');
            separator.className = 'article-separator';
            articleContainer.appendChild(separator);
        }
        
        resultContainer.appendChild(articleContainer);
    }
}

// 修改其他需要验证的函数
function toggleToolForm() {
    if (!checkAuth()) return;
    const form = document.getElementById('toolForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleManageTools() {
    if (!checkAuth()) return;
    const manager = document.getElementById('toolManager');
    if (manager.style.display === 'none') {
        // 显示工具列表
        const toolList = document.getElementById('toolManagerList');
        toolList.innerHTML = TOOLS.map((tool, index) => `
            <div style="margin: 10px 0; padding: 10px; background: #f5f5f7; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${tool.name}</strong>
                    <button class="button" onclick="deleteTool(${index})" 
                        style="background: #FF3B30; padding: 4px 12px;">删除</button>
                </div>
                <div style="margin-top: 5px; color: #666;">
                    分类：${tool.category}
                </div>
                <div style="margin-top: 5px; font-size: 14px;">
                    ${tool.description}
                </div>
            </div>
        `).join('');
        manager.style.display = 'block';
    } else {
        manager.style.display = 'none';
    }
}

function toggleManageHooks() {
    if (!checkAuth()) return;
    const manager = document.getElementById('hookManager');
    if (manager.style.display === 'none') {
        // 更新每个工具数量的钩子列表
        [2, 3, 4].forEach(count => {
            const hookList = document.querySelector(`#hooks-${count} .hook-list`);
            hookList.innerHTML = HOOKS[count].map((hook, index) => `
                <div style="margin: 10px 0; padding: 10px; background: #f5f5f7; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>${hook}</div>
                        <button class="button" onclick="deleteHook(${count}, ${index})" 
                            style="background: #FF3B30; padding: 4px 12px;">删除</button>
                    </div>
                </div>
            `).join('');
        });
        manager.style.display = 'block';
    } else {
        manager.style.display = 'none';
    }
}

// 添加到页面加载完成后执行的代码
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
}); 