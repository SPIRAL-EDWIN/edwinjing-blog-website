// ===== Hello 手写动画 - 明确笔画顺序逐条书写 =====
document.addEventListener("DOMContentLoaded", function() {
    var strokeGroup = document.querySelector('.hello-strokes');
    var strokePaths = strokeGroup ? strokeGroup.querySelectorAll('path') : null;
    var fillText = document.querySelector('.hello-fill');
    var penEl = document.querySelector('.pen-cursor');
    if (!strokePaths || strokePaths.length === 0 || !fillText || !penEl) return;

    document.fonts.ready.then(function() {
        // 初始化所有笔画：完全隐藏
        strokePaths.forEach(function(path) {
            var len = path.getTotalLength();
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;
        });

        // 填充层初始隐藏
        fillText.style.opacity = '0';
        fillText.style.fillOpacity = '0';

        var speed = 0.9; // px/ms
        var pauseAfter = [160, 140, 80, 60, 60, 60, 120, 140, 0];

        function easeInOutCubic(t) {
            return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
        }

        function animateStroke(path, duration, fadeIn, fadeOut) {
            return new Promise(function(resolve) {
                var length = path.getTotalLength();
                var start = null;

                function step(ts) {
                    if (!start) start = ts;
                    var raw = Math.min((ts - start) / duration, 1);
                    var progress = easeInOutCubic(raw);

                    path.style.strokeDashoffset = String(length * (1 - progress));

                    var point = path.getPointAtLength(length * progress);
                    penEl.setAttribute('cx', String(point.x));
                    penEl.setAttribute('cy', String(point.y));

                    var penOpacity = 0.85;
                    if (fadeIn && raw < 0.1) penOpacity = (raw / 0.1) * 0.85;
                    if (fadeOut && raw > 0.9) penOpacity = ((1 - raw) / 0.1) * 0.85;
                    penEl.setAttribute('opacity', String(penOpacity));

                    if (raw < 1) {
                        requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                }

                requestAnimationFrame(step);
            });
        }

        function sleep(ms) {
            return new Promise(function(resolve) { setTimeout(resolve, ms); });
        }

        async function runStrokes() {
            // 起笔前隐藏笔尖
            penEl.setAttribute('opacity', '0');

            for (var i = 0; i < strokePaths.length; i++) {
                var path = strokePaths[i];
                var len = path.getTotalLength();
                var duration = Math.max(220, Math.min(1200, len / speed));

                await animateStroke(path, duration, i === 0, i === strokePaths.length - 1);

                if (pauseAfter[i] > 0) {
                    await sleep(pauseAfter[i]);
                }
            }

            // 收笔
            penEl.setAttribute('opacity', '0');
            smoothFillIn();
        }

        function smoothFillIn() {
            var fillDuration = 1800;
            var start = null;

            function tick(ts) {
                if (!start) start = ts;
                var raw = Math.min((ts - start) / fillDuration, 1);
                var eased = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw + 2, 2) / 2;

                fillText.style.opacity = '1';
                fillText.style.fillOpacity = String(eased);

                // 描边逐渐收细，视觉上更像填充
                var strokeWidth = 2 - 1.5 * eased;
                strokePaths.forEach(function(path) {
                    path.style.strokeWidth = String(strokeWidth);
                });

                if (raw < 1) {
                    requestAnimationFrame(tick);
                } else {
                    setTimeout(function() {
                        var container = fillText.closest('.hello-animation');
                        if (container) container.classList.add('writing-done');
                    }, 600);
                }
            }

            requestAnimationFrame(tick);
        }

        setTimeout(function() {
            runStrokes();
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