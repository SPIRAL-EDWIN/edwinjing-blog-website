/**
 * Obsidian 风格块引用链接支持
 * 功能：
 * 1. 将 ^block-id 转换为可链接的锚点
 * 2. 支持 roamlinks 插件生成的 <a href="#block-id"> 链接
 */

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('.md-content');
    if (!content) return;

    // 1. 处理块 ID 定义 (^block-id)
    // 正则匹配：空格或开头 + ^ + 字母数字下划线横线 + 空格或结尾
    const blockIdPattern = /\s?\^([a-zA-Z0-9_-]+)\s*$/;
    
    // 遍历所有可能包含块 ID 的元素
    const processElements = content.querySelectorAll('p, li, td, th, blockquote, .admonition, div');
    
    processElements.forEach(element => {
        // 获取元素的直接文本内容（不包括子元素）
        const childNodes = element.childNodes;
        
        for (let i = childNodes.length - 1; i >= 0; i--) {
            const node = childNodes[i];
            
            // 只处理文本节点
            if (node.nodeType === Node.TEXT_NODE) {
                const match = node.textContent.match(blockIdPattern);
                if (match) {
                    const blockId = match[1];
                    
                    // 移除 ^block-id 文本
                    node.textContent = node.textContent.replace(blockIdPattern, '');
                    
                    // 给最近的合适父元素添加 ID
                    let targetElement = element;
                    
                    // 如果在 admonition 内，找到 admonition 容器
                    const admonition = element.closest('.admonition');
                    if (admonition && !admonition.id) {
                        targetElement = admonition;
                    }
                    
                    // 设置 ID 作为锚点
                    if (!targetElement.id) {
                        targetElement.id = blockId;
                        targetElement.classList.add('block-anchor');
                    }
                    
                    break; // 每个元素只处理一个块 ID
                }
            }
        }
    });

    // 2. 为所有块引用链接添加平滑滚动和高亮效果
    const blockLinks = content.querySelectorAll('a[href^="#"]');
    
    blockLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            
            if (target) {
                e.preventDefault();
                
                // 平滑滚动
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 高亮效果
                target.classList.add('block-highlight');
                setTimeout(() => target.classList.remove('block-highlight'), 2000);
                
                // 更新 URL
                history.pushState(null, null, href);
            }
        });
    });

    // 3. 页面加载时检查 URL 锚点
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('block-highlight');
                setTimeout(() => target.classList.remove('block-highlight'), 2000);
            }
        }, 500);
    }
});
