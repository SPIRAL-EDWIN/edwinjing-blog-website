/**
 * Obsidian 风格块引用链接支持
 * 功能：
 * 1. 将 ^block-id 转换为可链接的锚点
 * 2. 处理 [[#^block-id]] 和 [[note#^block-id]] 链接跳转
 */

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('.md-content');
    if (!content) return;

    // 1. 处理块 ID 定义 (^block-id)
    // 找到所有包含 ^identifier 的文本节点并添加锚点
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const blockIdPattern = /\s*\^([a-zA-Z0-9_-]+)\s*$/;
    const nodesToProcess = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const match = node.textContent.match(blockIdPattern);
        if (match && node.parentElement) {
            nodesToProcess.push({ node, match });
        }
    }

    nodesToProcess.forEach(({ node, match }) => {
        const blockId = match[1];
        const parent = node.parentElement;
        
        // 移除 ^block-id 文本
        node.textContent = node.textContent.replace(blockIdPattern, '');
        
        // 给父元素添加 ID 作为锚点
        if (parent && !parent.id) {
            parent.id = blockId;
            parent.classList.add('block-anchor');
        }
    });

    // 2. 处理内联块引用链接 [[#^block-id]] 或 [[note#^block-id]]
    const html = content.innerHTML;
    const linkPattern = /\[\[([^\]]*?)#\^([a-zA-Z0-9_-]+)\]\]|\[\[#\^([a-zA-Z0-9_-]+)\]\]/g;
    
    const newHtml = html.replace(linkPattern, (match, notePath, blockId1, blockId2) => {
        const blockId = blockId1 || blockId2;
        
        if (notePath) {
            // 跨页面链接 [[note#^block-id]]
            // 转换 note 路径为 URL
            let url = notePath.replace(/\s+/g, '%20');
            if (!url.endsWith('/') && !url.includes('.')) {
                url += '/';
            }
            return `<a href="${url}#${blockId}" class="block-link" title="跳转到 ${notePath}#${blockId}">${notePath}#${blockId}</a>`;
        } else {
            // 当前页面链接 [[#^block-id]]
            return `<a href="#${blockId}" class="block-link" title="跳转到块 ${blockId}">#${blockId}</a>`;
        }
    });

    if (newHtml !== html) {
        content.innerHTML = newHtml;
    }

    // 3. 平滑滚动到锚点
    document.querySelectorAll('a.block-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 高亮效果
                    target.classList.add('block-highlight');
                    setTimeout(() => target.classList.remove('block-highlight'), 2000);
                    // 更新 URL
                    history.pushState(null, null, href);
                }
            }
        });
    });

    // 4. 页面加载时检查 URL 锚点
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('block-highlight');
                setTimeout(() => target.classList.remove('block-highlight'), 2000);
            }, 300);
        }
    }
});
