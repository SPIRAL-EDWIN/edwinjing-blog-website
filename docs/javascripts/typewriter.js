// ===== Hello 手写动画 - stroke-dashoffset 描边 + clip-path 强制左到右 =====
document.addEventListener("DOMContentLoaded", function() {
    var textEl = document.querySelector('.hello-text');
    var penEl = document.querySelector('.pen-cursor');
    if (!textEl || !penEl) return;

    document.fonts.ready.then(function() {
        // 获取文字几何尺寸（opacity=0 时 getBBox 仍然有效）
        var bbox = textEl.getBBox();
        if (!bbox || bbox.width === 0) return;

        // ---- 1. 初始化 stroke-dasharray：隐藏所有描边 ----
        var pathLength = textEl.getComputedTextLength() * 4;
        textEl.style.strokeDasharray = pathLength;
        textEl.style.strokeDashoffset = pathLength; // 全部隐藏

        // ---- 2. 初始化 clip-path：全部遮住（防止字体路径跳跃显示）----
        textEl.style.clipPath = 'inset(0 100% 0 0)';
        textEl.style.webkitClipPath = 'inset(0 100% 0 0)';

        // ---- 3. fill 确保为 none（不填充，只描边）----
        textEl.style.fill = 'none';
        textEl.style.fillOpacity = '0';

        // 现在安全显示元素（被 dashoffset + clip-path 双重隐藏）
        textEl.setAttribute('opacity', '1');

        var duration = 3000; // 3 秒书写
        var startTs = null;

        // 笔尖 Y 轴关键帧 —— 模拟各字母笔画高度
        var penYKeyframes = [
            { at: 0.00, y: 0.30 },
            { at: 0.06, y: 0.85 },
            { at: 0.10, y: 0.55 },
            { at: 0.16, y: 0.82 },
            { at: 0.24, y: 0.50 },
            { at: 0.32, y: 0.72 },
            { at: 0.37, y: 0.25 },
            { at: 0.44, y: 0.82 },
            { at: 0.49, y: 0.25 },
            { at: 0.56, y: 0.82 },
            { at: 0.63, y: 0.50 },
            { at: 0.73, y: 0.78 },
            { at: 0.80, y: 0.52 },
            { at: 0.85, y: 0.25 },
            { at: 0.92, y: 0.62 },
            { at: 1.00, y: 0.85 }
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

            // A) stroke-dashoffset：真正地"画出"描边笔画
            textEl.style.strokeDashoffset = String(pathLength * (1 - progress));

            // B) clip-path：强制只显示从左到右的部分
            //    clip 比 dash 稍微超前，避免刚画好的笔画被裁掉
            var clipProgress = Math.min(progress * 1.2 + 0.03, 1);
            var clipRight = (1 - clipProgress) * 100;
            textEl.style.clipPath = 'inset(0 ' + clipRight + '% 0 0)';
            textEl.style.webkitClipPath = 'inset(0 ' + clipRight + '% 0 0)';

            // 笔尖光标
            var penX = bbox.x + bbox.width * progress;
            var yFactor = getPenY(progress);
            var microWobble = Math.sin(raw * Math.PI * 22) * 1.2;
            var penY = bbox.y + bbox.height * yFactor + microWobble;
            penEl.setAttribute('cx', String(penX));
            penEl.setAttribute('cy', String(penY));

            var penOpacity;
            if (raw < 0.03) penOpacity = raw / 0.03 * 0.85;
            else if (raw > 0.93) penOpacity = (1 - raw) / 0.07 * 0.85;
            else penOpacity = 0.85;
            penEl.setAttribute('opacity', String(penOpacity));

            if (raw < 1) {
                requestAnimationFrame(tick);
            } else {
                // 书写完成 → 清除遮罩，启动填充
                textEl.style.clipPath = 'none';
                textEl.style.webkitClipPath = 'none';
                textEl.style.strokeDasharray = 'none';
                textEl.style.strokeDashoffset = '0';
                penEl.setAttribute('opacity', '0');
                smoothFillIn(textEl);
            }
        }

        // 平滑填充：中空描边 → 实心文字
        function smoothFillIn(el) {
            var fillDuration = 1800;
            var fillStart = null;

            function fillTick(ts) {
                if (!fillStart) fillStart = ts;
                var elapsed = ts - fillStart;
                var raw = Math.min(elapsed / fillDuration, 1);
                var eased = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw + 2, 2) / 2;

                // 设置 fill 为渐变色，逐渐增加不透明度
                el.style.fill = 'url(#helloGrad)';
                el.style.fillOpacity = String(eased);
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