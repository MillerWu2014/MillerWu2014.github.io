const cloud = document.querySelector('#tag-cloud');
const filter = document.querySelector('#tag-filter');
const preview = document.querySelector('#tag-preview');
const previewName = document.querySelector('#preview-name');
const previewCount = document.querySelector('#preview-count');
const previewArticles = document.querySelector('#preview-articles');
const previewAll = document.querySelector('#preview-all');
const byTag = new Map();

for (const post of window.BLOG_POSTS) {
  for (const tag of post.tags) {
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(post);
  }
}

const tags = [...byTag].sort(([left, leftPosts], [right, rightPosts]) =>
  rightPosts.length - leftPosts.length || left.localeCompare(right, 'zh-CN'));
const maximum = Math.max(1, ...tags.map(([, posts]) => posts.length));
let activeTag = null;

function showPreview(name) {
  if (name === activeTag) return;
  activeTag = name;
  const posts = byTag.get(name);
  for (const tag of tagLinks) tag.link.classList.toggle('is-highlighted', tag.name === name);
  previewName.textContent = name;
  previewCount.textContent = posts.length + ' 篇文章';
  previewAll.href = './?tag=' + encodeURIComponent(name) + '#writing';
  previewArticles.replaceChildren();
  for (const post of posts.slice(0, 4)) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = post.url;
    link.textContent = post.title;
    const time = document.createElement('time');
    time.dateTime = post.date;
    time.textContent = post.date;
    item.append(time, link);
    previewArticles.append(item);
  }
}

const tagLinks = tags.map(([name, posts], index) => {
  const link = document.createElement('a');
  link.className = 'constellation-tag';
  link.href = './?tag=' + encodeURIComponent(name) + '#writing';
  link.setAttribute('aria-label', name + '，' + posts.length + ' 篇文章');
  link.style.setProperty('--tag-size', (.8 + Math.sqrt(posts.length / maximum) * .65) + 'rem');
  link.style.setProperty('--tag-delay', (index % 12) * 25 + 'ms');
  const label = document.createElement('span');
  label.textContent = name;
  const count = document.createElement('sup');
  count.textContent = posts.length;
  link.append(label, count);
  link.addEventListener('pointerenter', () => showPreview(name));
  link.addEventListener('focus', () => showPreview(name));
  cloud.append(link);
  return { name, link };
});

document.querySelector('#tag-stats').textContent = tags.length + ' 个标签 · ' + window.BLOG_POSTS.length + ' 篇文章';

function renderTags() {
  const query = filter.value.trim().toLocaleLowerCase();
  const matching = tagLinks.filter(tag => tag.name.toLocaleLowerCase().includes(query));
  for (const tag of tagLinks) tag.link.hidden = !tag.name.toLocaleLowerCase().includes(query);
  document.querySelector('#tag-matches').textContent = matching.length + ' 个标签';
  document.querySelector('#tag-empty').hidden = matching.length > 0;
  preview.hidden = matching.length === 0;
  if (matching.length && !matching.some(tag => tag.name === activeTag)) showPreview(matching[0].name);
}

filter.addEventListener('input', renderTags);
renderTags();
