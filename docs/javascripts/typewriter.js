// ===== Hello 手写动画 - CSS clip-path 逐字揭示 + 平滑填充 =====
document.addEventListener("DOMContentLoaded", function() {
    var textEl = document.querySelector('.hello-text');
    var penEl = document.querySelector('.pen-cursor');
    if (!textEl || !penEl) return;

    document.fonts.ready.then(function() {
        // 获取文字几何尺寸（opacity=0 时 getBBox 仍然有效）
        var bbox = textEl.getBBox();
        if (!bbox || bbox.width === 0) return;

        // 设置初始状态：描边可见(中空)，填充不可见，用 clip-path 遮住全部
        textEl.style.fillOpacity = '0';
        textEl.style.clipPath = 'inset(0 100% 0 0)';
        textEl.style.webkitClipPath = 'inset(0 100% 0 0)';
        textEl.setAttribute('opacity', '1'); // 此时仍被 clip-path 隐藏

        var duration = 2800; // 2.8 秒书写
        var startTs = null;

        // 笔尖 Y 轴关键帧 —— 模拟各字母笔画高度
        var penYKeyframes = [
            { at: 0.00, y: 0.30 },  // H 起笔（高处）
            { at: 0.06, y: 0.85 },  // H 左竖落笔
            { at: 0.10, y: 0.55 },  // H 横划
            { at: 0.16, y: 0.82 },  // H 右竖落笔，连笔到 e
            { at: 0.24, y: 0.50 },  // e 中部
            { at: 0.32, y: 0.72 },  // e 下弧
            { at: 0.37, y: 0.25 },  // l 上升
            { at: 0.44, y: 0.82 },  // l 下落
            { at: 0.49, y: 0.25 },  // l 上升
            { at: 0.56, y: 0.82 },  // l 下落
            { at: 0.63, y: 0.50 },  // o 顶部
            { at: 0.73, y: 0.78 },  // o 底部
            { at: 0.80, y: 0.52 },  // o 闭合
            { at: 0.85, y: 0.25 },  // ! 顶部
            { at: 0.92, y: 0.62 },  // ! 竖身
            { at: 1.00, y: 0.85 }   // ! 圆点
        ];

        function getPenY(progress) {
            if (progress <= 0) return penYKeyframes[0].y;
            if (progress >= 1) return penYKeyframes[penYKeyframes.length - 1].y;
            for (var i = 1; i < penYKeyframes.length; i++) {
                if (progress <= penYKeyframes[i].at) {
                    var t = (progress - penYKeyframes[i-1].at) / (penYKeyframes[i].at - penYKeyframes[i-1].at);
                    var smooth = t * t * (3 - 2 * t);
                    return penYKeyframes[i-1].y + (penYKeyframes[i].y - penYKeyframes[i-1].y) * smooth;
                }
            }
            return 0.5;
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
        }

        function tick(ts) {
            if (!startTs) startTs = ts;
            var elapsed = ts - startTs;
            var raw = Math.min(elapsed / duration, 1);
            var progress = easeInOutCubic(raw);

            // CSS clip-path 从左向右揭示 —— 逐字揭示笔画
            var clipRight = (1 - progress) * 100;
            textEl.style.clipPath = 'inset(0 ' + clipRight + '% 0 0)';
            textEl.style.webkitClipPath = 'inset(0 ' + clipRight + '% 0 0)';

            // 笔尖光标：沿着字母形态移动
            var penX = bbox.x + bbox.width * progress;
            var yFactor = getPenY(progress);
            var microWobble = Math.sin(raw * Math.PI * 22) * 1.2;
            var penY = bbox.y + bbox.height * yFactor + microWobble;

            penEl.setAttribute('cx', String(penX));
            penEl.setAttribute('cy', String(penY));

            // 笔尖透明度：渐入 → 书写中 → 渐出
            var penOpacity;
            if (raw < 0.03) penOpacity = raw / 0.03 * 0.85;
            else if (raw > 0.93) penOpacity = (1 - raw) / 0.07 * 0.85;
            else penOpacity = 0.85;
            penEl.setAttribute('opacity', String(penOpacity));

            if (raw < 1) {
                requestAnimationFrame(tick);
            } else {
                // 书写完成 → 移除 clip-path，启动平滑填充
                textEl.style.clipPath = 'none';
                textEl.style.webkitClipPath = 'none';
                penEl.setAttribute('opacity', '0');
                smoothFillIn(textEl);
            }
        }

        // 平滑填充：中空笔画逐渐变为实心
        function smoothFillIn(el) {
            var fillDuration = 1800;
            var fillStart = null;

            function fillTick(ts) {
                if (!fillStart) fillStart = ts;
                var elapsed = ts - fillStart;
                var raw = Math.min(elapsed / fillDuration, 1);
                var eased = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw + 2, 2) / 2;

                // 渐增填充不透明度（中空 → 实心）
                el.style.fillOpacity = String(eased);
                // 渐减描边宽度（轮廓融入实心）
                el.style.strokeWidth = String(2 - 1.5 * eased);

                if (raw < 1) {
                    requestAnimationFrame(fillTick);
                } else {
                    setTimeout(function() {
                        var container = el.closest('.hello-animation');
                        if (container) container.classList.add('writing-done');
                    }, 600);
                }
            }

            setTimeout(function() {
                requestAnimationFrame(fillTick);
            }, 300);
        }

        // 页面加载后短暂延迟再开始书写
        setTimeout(function() {
            requestAnimationFrame(tick);
        }, 400);
    });
});

// ===== 终端打字机效果 =====
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 配置区域：在此处修改文字和速度 ---
    const config = {
        line1Text: "Welcome to Edwin's Site World",
        line2Phrases: ["無限進步", "欢迎交流！", "Keep Learning", "Stay Curious"], // 循环的词组数组
        typingSpeed: 85,       // 打字速度 (毫秒/字符) - 稍快更有节奏感
        deletingSpeed: 40,     // 删除速度 (毫秒/字符)
        pauseBeforeDelete: 2200, // 打完字后停顿多久再删除 (毫秒)
        pauseBeforeType: 600,    // 删完后停顿多久再打下一个 (毫秒)
        pauseBetweenLines: 700   // 第一行打完后，停顿多久开始第二行
    };

    // --- 获取 DOM 元素 ---
    const line1Elem = document.getElementById("tw-line-1");
    const cursor1 = document.getElementById("cursor-1");
    const line2Elem = document.getElementById("tw-line-2");
    const cursor2 = document.getElementById("cursor-2");

    // 如果当前页面没有这些元素（例如在非首页），则不执行脚本，防止报错
    if (!line1Elem ||!line2Elem) return;

    // --- 核心工具函数 ---

    // 延时函数，用于 async/await
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 打字动作 - 带轻微抖动的随机节奏
    const typeText = async (element, text) => {
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            // 更自然的节奏：偶尔会有短暂停顿（模拟思考）
            let delay = config.typingSpeed + (Math.random() * 60 - 30);
            if (Math.random() < 0.08) delay += 150; // 8%的概率短暂停顿
            await sleep(delay);
        }
    };

    // 删除动作
    const deleteText = async (element) => {
        let text = element.textContent;
        while (text.length > 0) {
            text = text.substring(0, text.length - 1);
            element.textContent = text;
            await sleep(config.deletingSpeed);
        }
    };

    // 瞬间闪烁效果（打完一行时）
    const flashElement = (element) => {
        element.style.textShadow = '0 0 20px currentColor';
        setTimeout(() => {
            element.style.textShadow = '';
        }, 300);
    };

    // --- 业务逻辑流程 ---

    // 第二行的循环逻辑
    const cycleLine2 = async () => {
        let phraseIndex = 0;
        
        while (true) { // 无限循环
            const currentPhrase = config.line2Phrases[phraseIndex];
            
            // 1. 输入当前词组
            await typeText(line2Elem, currentPhrase);
            
            // 闪烁效果
            flashElement(line2Elem);
            
            // 2. 停顿，供用户阅读
            await sleep(config.pauseBeforeDelete);
            
            // 3. 删除当前词组
            await deleteText(line2Elem);
            
            // 4. 短暂停顿
            await sleep(config.pauseBeforeType);
            
            // 5. 切换到下一个词组（取模运算实现循环）
            phraseIndex = (phraseIndex + 1) % config.line2Phrases.length;
        }
    };

    // 主程序入口
    const runTypewriter = async () => {
        // 初始化：清空内容，确保从零开始
        line1Elem.textContent = "";
        line2Elem.textContent = "";
        
        // 初始状态：显示光标1，隐藏光标2
        cursor1.classList.remove("hidden-cursor");
        cursor2.classList.add("hidden-cursor");
        
        // 启动前的短暂延迟
        await sleep(500);
        
        // --- 阶段一：打印第一行 ---
        await typeText(line1Elem, config.line1Text);
        
        // 闪烁效果
        flashElement(line1Elem);
        
        // 第一行完成，停顿片刻
        await sleep(config.pauseBetweenLines);
        
        // --- 阶段转换 ---
        // 隐藏第一行的光标（或保留但停止闪烁，这里选择隐藏以转移注意力）
        cursor1.style.display = 'none'; 
        
        // 显示第二行的光标
        cursor2.classList.remove("hidden-cursor");
        
        // --- 阶段二：启动第二行循环 ---
        // 注意：这里不使用 await，因为这是一个无限循环，
        // 如果 await 它，函数永远不会结束（虽然在这里无所谓，但逻辑上它是独立的进程）
        cycleLine2();
    };

    // 执行
    runTypewriter();
});