// ===== Hello 手写动画 =====
document.addEventListener("DOMContentLoaded", function() {
    var textEl = document.querySelector('.hello-text');
    var penEl = document.querySelector('.pen-cursor');
    if (!textEl || !penEl) return;

    document.fonts.ready.then(function() {
        // 测量文字宽度，估算描边轮廓总长度
        var advanceWidth = textEl.getComputedTextLength();
        var pathLength = advanceWidth * 4; // 连笔草书轮廓 ≈ 4倍文字宽度

        // 设置 dasharray 隐藏所有笔画
        textEl.style.strokeDasharray = pathLength;
        textEl.style.strokeDashoffset = pathLength;

        // 此时笔画被 dashoffset 隐藏，可以安全显示元素
        textEl.setAttribute('opacity', '1');

        var bbox = textEl.getBBox();
        var duration = 3000; // 3秒书写
        var startTs = null;

        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        function tick(ts) {
            if (!startTs) startTs = ts;
            var elapsed = ts - startTs;
            var raw = Math.min(elapsed / duration, 1);
            var progress = easeInOutQuad(raw);

            // 逐步揭示笔画
            textEl.style.strokeDashoffset = String(pathLength * (1 - progress));

            // 笔尖光标跟踪
            var penX = bbox.x + bbox.width * progress;
            var wobble = Math.sin(raw * Math.PI * 10) * 4;
            var penY = bbox.y + bbox.height * 0.68 + wobble;
            penEl.setAttribute('cx', String(penX));
            penEl.setAttribute('cy', String(penY));

            // 笔尖透明度：渐入 → 可见 → 渐出
            var penOpacity;
            if (raw < 0.03) {
                penOpacity = (raw / 0.03) * 0.85;
            } else if (raw > 0.93) {
                penOpacity = ((1 - raw) / 0.07) * 0.85;
            } else {
                penOpacity = 0.85;
            }
            penEl.setAttribute('opacity', String(penOpacity));

            if (raw < 1) {
                requestAnimationFrame(tick);
            } else {
                // 书写完成：填充颜色，隐藏笔尖
                penEl.setAttribute('opacity', '0');
                textEl.style.transition = 'fill 0.8s ease, stroke-width 0.8s ease';
                textEl.style.fill = 'url(#helloGrad)';
                textEl.style.strokeWidth = '0.5';

                // 延迟添加呼吸光效
                setTimeout(function() {
                    var container = textEl.closest('.hello-animation');
                    if (container) container.classList.add('writing-done');
                }, 1200);
            }
        }

        // 短暂延迟后开始书写
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