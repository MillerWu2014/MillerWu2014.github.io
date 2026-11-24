const header = document.querySelector('.top');
const headerSearch = document.querySelector('.nav-search input');
if (headerSearch) {
  headerSearch.value = new URLSearchParams(location.search).get('q') || '';
}
if (header) {
  const updateHeight = () => {
    document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + 'px');
  };
  updateHeight();
  new ResizeObserver(updateHeight).observe(header);
}
