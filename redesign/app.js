const search = document.querySelector('#search');
const count = document.querySelector('#count');
const more = document.querySelector('#more');
const reset = document.querySelector('#reset');
function element(tagName, text, className) {
  const node = document.createElement(tagName);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function tally(field) {
  const totals = new Map();
  for (const post of window.BLOG_POSTS) {
    for (const value of post[field]) totals.set(value, (totals.get(value) || 0) + 1);
  }
  return [...totals].sort(([left], [right]) => left.localeCompare(right, 'zh-CN'));
}

function initIndex() {
  const list = document.querySelector('#posts');
  const typeButtons = [...document.querySelectorAll('.article-types button')];
  const posts = window.BLOG_POSTS.map(({ title, description, date, categories, tags, url, type, series }) => {
    const link = element('a', '', 'post');
    link.href = url;
    const time = element('time', date);
    time.dateTime = date;
    const footer = element('div', '', 'post-footer');
    const arrow = element('span', '→', 'post-read');
    arrow.setAttribute('aria-hidden', 'true');
    footer.append(time, arrow);
    const typeLabel = element('span', type, 'post-type');
    typeLabel.setAttribute('aria-label', '文章类型：' + type);
    link.append(typeLabel, element('h2', title), element('p', description || '', 'post-summary'), footer);
    list.append(link);
    return { link, categories, tags, type, text: [title, type, series, ...categories, ...tags].join(' ').toLowerCase() };
  });
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  let tag = params.get('tag');
  let type = params.get('type');
  let limit = 12;

  function render() {
    const query = search.value.trim().toLowerCase();
    let matches = 0;
    for (const post of posts) {
      const matchesFilters = (!tag || post.tags.includes(tag))
        && (!type || post.type === type) && post.text.includes(query);
      post.link.hidden = !matchesFilters || ++matches > limit;
    }
    for (const button of typeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.type === (type || '')));
    }
    count.textContent = matches ? `${matches} 篇` : '没有找到文章';
    reset.hidden = !(tag || query);
    more.hidden = matches <= limit;
  }

  for (const button of typeButtons) {
    button.addEventListener('click', () => {
      type = button.dataset.type || null;
      tag = null;
      limit = 12;
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (search.value.trim()) params.set('q', search.value.trim());
      const suffix = params.size ? '?' + params : '';
      history.replaceState(null, '', location.pathname + suffix + location.hash);
      render();
    });
  }

  search.addEventListener('input', () => {
    tag = null;
    type = null;
    limit = 12;
    render();
  });

  search.closest('form').addEventListener('submit', event => {
    event.preventDefault();
    tag = null;
    type = null;
    limit = 12;
    const query = new URLSearchParams();
    if (search.value.trim()) query.set('q', search.value.trim());
    const suffix = query.size ? '?' + query : '';
    history.replaceState(null, '', location.pathname + suffix + '#writing');
    render();
    document.querySelector('#writing').scrollIntoView();
  });

  reset.addEventListener('click', () => {
    tag = null;
    type = null;
    search.value = '';
    limit = 12;
    history.replaceState(null, '', location.pathname + location.hash);
    render();
    search.focus();
  });

  more.addEventListener('click', () => {
    const firstNewPost = posts.find(post => post.link.hidden
      && (!tag || post.tags.includes(tag))
      && (!type || post.type === type)
      && post.text.includes(search.value.trim().toLowerCase()));
    limit += 12;
    render();
    firstNewPost?.link.focus();
  });

  render();
  function focusSearch() {
    if (location.hash === '#search') search.focus();
  }
  window.addEventListener('hashchange', focusSearch);
  focusSearch();
}

const categoriesPage = document.querySelector('#categories');
if (categoriesPage) {
  for (const name of ['论文阅读', '技术笔记', '工程实践', '知识体系', '专题', '随想']) {
    const total = window.BLOG_POSTS.filter(post => post.type === name).length;
    const link = element('a', '', 'category-card');
    link.href = './?type=' + encodeURIComponent(name) + '#writing';
    link.append(element('h2', name), element('span', total + ' 篇文章'));
    categoriesPage.append(link);
  }
}

function groupedArticles(container, field) {
  const groups = new Map();
  for (const post of window.BLOG_POSTS) {
    const group = field === 'year' ? post.date.slice(0, 4) : post[field];
    if (!group) continue;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(post);
  }
  for (const [name, posts] of groups) {
    const section = element('section', '', 'archive-group');
    section.append(element('h2', name));
    const columns = element('div', '', 'archive-columns');
    columns.setAttribute('aria-hidden', 'true');
    columns.append(element('span', '日期'), element('span', '标题'), element('span', '标签'));
    section.append(columns);
    const list = element('ul', '', 'archive-list');
    for (const post of posts) {
      const item = element('li', '');
      const link = element('a', post.title, 'archive-title');
      link.href = post.url;
      const time = element('time', post.date);
      time.dateTime = post.date;
      const tags = element('div', '', 'archive-tags');
      for (const tag of post.tags) {
        const tagLink = element('a', tag, 'archive-tag');
        tagLink.href = './?tag=' + encodeURIComponent(tag) + '#writing';
        tagLink.setAttribute('aria-label', '查看标签 ' + tag + ' 的文章');
        tags.append(tagLink);
      }
      item.append(time, link, tags);
      list.append(item);
    }
    section.append(list);
    container.append(section);
  }
  if (!groups.size) container.append(element('p', '暂无专题文章。', 'empty-state'));
}

const archivesPage = document.querySelector('#archives');
if (archivesPage) groupedArticles(archivesPage, 'year');

if (search && document.querySelector('#posts')) initIndex();
const tagList = document.querySelector('#tags');
if (tagList) {
  for (const [name, total] of tally('tags')) {
    const link = element('a', name + ' · ' + total, 'filter');
    link.href = './?tag=' + encodeURIComponent(name) + '#writing';
    tagList.append(link);
  }
}
