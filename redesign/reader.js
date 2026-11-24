const status = document.querySelector('#status');
const body = document.querySelector('#body');
const copyMarkdown = document.querySelector('#copy-markdown');
const markdownDownload = document.querySelector('#download-markdown');
const markdownFeedback = document.querySelector('#markdown-feedback');

if (navigator.clipboard?.writeText) {
  copyMarkdown.hidden = false;
  copyMarkdown.addEventListener('click', async () => {
    copyMarkdown.disabled = true;
    copyMarkdown.textContent = '正在复制…';
    markdownFeedback.hidden = true;
    try {
      const response = await fetch(markdownDownload.href, { mode: 'same-origin' });
      if (!response.ok) throw new Error('Markdown unavailable');
      await navigator.clipboard.writeText(await response.text());
      markdownFeedback.textContent = 'Markdown 源文档已复制。';
    } catch {
      markdownFeedback.textContent = '复制失败，可点击“下载 Markdown”保存源文档后重试。';
    } finally {
      copyMarkdown.disabled = false;
      copyMarkdown.textContent = '复制 Markdown';
      markdownFeedback.hidden = false;
    }
  });
}

body.addEventListener('click', async event => {
  const button = event.target.closest('.copy-code');
  if (!button) return;
  const code = button.closest('.code-block').querySelector('code');
  try {
    await navigator.clipboard.writeText(code.textContent);
    button.textContent = '已复制';
  } catch {
    button.textContent = '请选中代码复制';
  }
  setTimeout(() => { button.textContent = '复制'; }, 2000);
});

async function renderMath() {
  if (!body.querySelector('.math')) return;
  window.MathJax = {
    tex: { inlineMath: [['\\(', '\\)'], ['$', '$']], displayMath: [['\\[', '\\]'], ['$$', '$$']] },
    options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
    startup: { typeset: false }
  };
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js';
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  await window.MathJax.startup.promise;
  await window.MathJax.typesetPromise([...body.querySelectorAll('.math')]);
}

async function renderDiagrams() {
  const blocks = [...body.querySelectorAll('.language-mermaid, pre.mermaid')].filter(
    block => !block.parentElement.closest('.language-mermaid, pre.mermaid')
  );
  if (!blocks.length) return;
  const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs');
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
  await Promise.all(blocks.map(async (block, index) => {
    const diagram = document.createElement('figure');
    diagram.className = 'diagram';
    try {
      const result = await mermaid.render('diagram-' + index, (block.querySelector('code') || block).textContent.trim());
      diagram.innerHTML = result.svg;
      (block.closest('pre') || block).replaceWith(diagram);
    } catch {
      block.title = 'Mermaid 图表无法渲染';
    }
  }));
}

function renderOutline() {
  const outline = document.querySelector('#outline');
  const nav = outline.querySelector('nav');
  const headings = [...body.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
  const links = new Map();
  for (const heading of headings) {
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(heading.id);
    link.textContent = heading.textContent.trim();
    if (Number(heading.tagName.slice(1)) >= 3) link.className = 'nested';
    nav.append(link);
    links.set(heading, link);
  }
  outline.hidden = !nav.childElementCount;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.isIntersecting);
      if (!entry) return;
      for (const [heading, link] of links) {
        if (heading === entry.target) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '0px 0px -65% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
}

const compactReading = window.matchMedia('(max-width: 760px)');
function setSidebarState() {
  document.querySelectorAll('.sidebar-panel').forEach(panel => {
    panel.open = !compactReading.matches;
  });
}
setSidebarState();
compactReading.addEventListener('change', setSidebarState);
renderOutline();
Promise.allSettled([renderMath(), renderDiagrams()]).then(results => {
  if (results.some(result => result.status === 'rejected')) {
    status.textContent = '公式或图表组件加载失败，正文仍可阅读。';
    status.hidden = false;
  }
});
