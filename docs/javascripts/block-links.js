/**
 * Obsidian 风格块引用链接支持
 * 功能：
 * 1. 将 ^block-id 转换为可链接的锚点
 * 2. 支持 roamlinks 插件生成的 <a href="#block-id"> 链接
 */

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('.md-content');
    if (!content) return;

    // 1. 处理块 ID 定义 - 使用 innerHTML 替换方式
    // 匹配模式：空格 + ^block-id（可能后面有空格、<br>、</p>等）
    const blockIdRegex = /(\s)\^([a-zA-Z0-9_-]+)(\s*(?:<br\s*\/?>|<\/p>|<p><\/p>|$))/gi;
    
    // 获取所有可能包含块 ID 的主要内容元素
    const mainContent = content.querySelector('.md-content__inner');
    if (!mainContent) return;
    
    let html = mainContent.innerHTML;
    const foundIds = [];
    
    // 替换块 ID 为带有 id 属性的 span
    html = html.replace(blockIdRegex, (match, before, blockId, after) => {
        foundIds.push(blockId);
        // 创建一个不可见的锚点 span
        return `${before}<span id="${blockId}" class="block-anchor"></span>${after}`;
    });
    
    // 还需要处理在 <strong>/<em> 后面的情况
    // 例如：</em></strong> ^2f6664<p></p>
    const blockIdRegex2 = /(<\/(?:strong|em|code|b|i)>)\s*\^([a-zA-Z0-9_-]+)/gi;
    html = html.replace(blockIdRegex2, (match, closingTag, blockId) => {
        if (!foundIds.includes(blockId)) {
            foundIds.push(blockId);
            return `${closingTag}<span id="${blockId}" class="block-anchor"></span>`;
        }
        return match;
    });
    
    // 处理行内的块 ID（在文本中间）
    // 例如：如： ^6244d2<br>
    const blockIdRegex3 = /\s\^([a-zA-Z0-9_-]+)(<br\s*\/?>)/gi;
    html = html.replace(blockIdRegex3, (match, blockId, br) => {
        if (!foundIds.includes(blockId)) {
            foundIds.push(blockId);
            return ` <span id="${blockId}" class="block-anchor"></span>${br}`;
        }
        return match;
    });

    if (foundIds.length > 0) {
        mainContent.innerHTML = html;
        console.log('Block anchors created:', foundIds);
    }

    // 2. 为所有块引用链接添加平滑滚动和高亮效果
    setTimeout(() => {
        const blockLinks = content.querySelectorAll('a[href^="#"]');
        
        blockLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    // 找到目标元素的父级段落来高亮
                    let highlightTarget = target.closest('p, li, blockquote, .admonition, tr') || target.parentElement;
                    
                    // 平滑滚动
                    highlightTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // 高亮效果
                    highlightTarget.classList.add('block-highlight');
                    setTimeout(() => highlightTarget.classList.remove('block-highlight'), 2500);
                    
                    // 更新 URL
                    history.pushState(null, null, href);
                } else {
                    console.warn('Block anchor not found:', targetId);
                }
            });
        });
    }, 100);

    // 3. 页面加载时检查 URL 锚点
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            const target = document.getElementById(targetId);
            if (target) {
                let highlightTarget = target.closest('p, li, blockquote, .admonition, tr') || target.parentElement;
                highlightTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightTarget.classList.add('block-highlight');
                setTimeout(() => highlightTarget.classList.remove('block-highlight'), 2500);
            }
        }, 500);
    }
});
