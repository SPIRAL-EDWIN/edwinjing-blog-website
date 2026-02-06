/**
 * Obsidian 风格块引用链接支持
 * 功能：
 * 1. 将 ^block-id 转换为可链接的锚点
 * 2. 支持 roamlinks 插件生成的 <a href="#block-id"> 链接
 */

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('.md-content');
    if (!content) return;

    const mainContent = content.querySelector('.md-content__inner');
    if (!mainContent) return;
    
    let html = mainContent.innerHTML;
    const foundIds = [];
    
    // 模式1: 文本后面跟着 ^block-id（可能有空格、<br>等）
    // 例如: 如： ^6244d2<br>
    html = html.replace(/(\S)\s*\^([a-zA-Z0-9]{4,})(\s*<br\s*\/?>|\s*<\/p>|\s*$)/gi, 
        (match, before, blockId, after) => {
            if (!foundIds.includes(blockId)) {
                foundIds.push(blockId);
                return `${before}<span id="${blockId}" class="block-anchor"></span>${after}`;
            }
            return match;
        }
    );
    
    // 模式2: </strong></em>等标签后面的 ^block-id
    // 例如: </em></strong> ^2f6664<p></p>
    html = html.replace(/(<\/(?:strong|em|code|b|i|span)>)\s*\^([a-zA-Z0-9]{4,})/gi, 
        (match, closingTag, blockId) => {
            if (!foundIds.includes(blockId)) {
                foundIds.push(blockId);
                return `${closingTag}<span id="${blockId}" class="block-anchor"></span>`;
            }
            return match;
        }
    );
    
    // 模式3: 单独一行/段落的 ^block-id
    // 例如: <p>^4f0a7f</p> 或在空行后
    html = html.replace(/<p>\s*\^([a-zA-Z0-9]{4,})\s*<\/p>/gi, 
        (match, blockId) => {
            if (!foundIds.includes(blockId)) {
                foundIds.push(blockId);
                return `<p><span id="${blockId}" class="block-anchor"></span></p>`;
            }
            return match;
        }
    );
    
    // 模式4: 在文本开头或中间的 ^block-id（更通用的匹配）
    // 匹配任何剩余的 ^block-id
    html = html.replace(/([>\s])\^([a-zA-Z0-9]{4,})([<\s])/gi, 
        (match, before, blockId, after) => {
            if (!foundIds.includes(blockId)) {
                foundIds.push(blockId);
                return `${before}<span id="${blockId}" class="block-anchor"></span>${after}`;
            }
            return match;
        }
    );

    if (foundIds.length > 0) {
        mainContent.innerHTML = html;
        console.log('Block anchors created:', foundIds);
    }

    // 为所有锚点链接添加平滑滚动
    setTimeout(() => {
        const blockLinks = content.querySelectorAll('a[href^="#"]');
        
        blockLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    // 找到要高亮的目标元素
                    let highlightTarget = target.closest('p, li, blockquote, .admonition, tr, pre');
                    if (!highlightTarget) {
                        // 如果锚点是单独的span，找它的下一个兄弟元素或父元素
                        highlightTarget = target.nextElementSibling || target.parentElement;
                    }
                    
                    // 平滑滚动
                    const scrollTarget = highlightTarget || target;
                    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // 高亮效果
                    if (highlightTarget) {
                        highlightTarget.classList.add('block-highlight');
                        setTimeout(() => highlightTarget.classList.remove('block-highlight'), 2500);
                    }
                    
                    // 更新 URL
                    history.pushState(null, null, href);
                } else {
                    console.warn('Block anchor not found:', targetId);
                }
            });
        });
    }, 100);

    // 页面加载时检查 URL 锚点
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            const target = document.getElementById(targetId);
            if (target) {
                let highlightTarget = target.closest('p, li, blockquote, .admonition, tr, pre');
                if (!highlightTarget) {
                    highlightTarget = target.nextElementSibling || target.parentElement;
                }
                const scrollTarget = highlightTarget || target;
                scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (highlightTarget) {
                    highlightTarget.classList.add('block-highlight');
                    setTimeout(() => highlightTarget.classList.remove('block-highlight'), 2500);
                }
            }
        }, 500);
    }
});
