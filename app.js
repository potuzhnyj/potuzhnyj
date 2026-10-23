(() => {
  'use strict';

  const desktop = document.getElementById('after-hours-desktop');
  const explorer = desktop.querySelector('.ah-window');
  const fullscreenButton = desktop.querySelector('[data-fullscreen]');
  const notice = desktop.querySelector('.ah-notice');
  const categories = {
    ui: { name: 'UI & Design', dir: 'UI-Design' },
    apps: { name: 'Web Apps', dir: 'Web-Apps' },
    maps: { name: 'Maps & Data', dir: 'Maps-Data' },
    auto: { name: 'Automation', dir: 'Automation' },
  };
  const projects = [
    { id: 'pixelgames', name: 'pixelgames', cat: 'ui', description: 'A pixel-art game discovery concept with a responsive catalog and custom typography.', tech: 'HTML · CSS', live: 'https://potuzhnyj.github.io/pixelgames/', source: 'https://github.com/potuzhnyj/pixelgames' },
    { id: 'organicsearch', name: 'organicsearch', cat: 'apps', description: 'A search tool that displays organic Google results and exports them as JSON or CSV.', tech: 'JavaScript · Node.js · HTML · CSS', live: 'https://organicsearch.onrender.com/', source: 'https://github.com/potuzhnyj/organicsearch' },
    { id: 'investai', name: 'InvestAI', cat: 'apps', description: 'A browser-based investing assistant for stock analysis, portfolio review and market research.', tech: 'JavaScript · Gemini API · HTML · CSS', live: 'https://potuzhnyj.github.io/investai/', source: 'https://github.com/potuzhnyj/InvestAI' },
    { id: 'parcelmap', name: 'parcelmap', cat: 'maps', description: 'An interactive parcel map for the Jičín area, with cadastral details and boundary selection.', tech: 'JavaScript · Leaflet · GeoJSON', live: 'https://potuzhnyj.github.io/parcelmap/', source: 'https://github.com/potuzhnyj/parcelmap' },
    { id: 'gmail', name: 'Gmail Coupon Grabber', cat: 'auto', description: 'A Node.js utility that scans promotional emails and produces a clean HTML report.', tech: 'Node.js · Gmail API · imapflow · cheerio', source: 'https://github.com/potuzhnyj/Gmail-Coupon-Grabber' },
  ];
  const state = { category: 'apps', project: 'organicsearch', history: [], expanded: false };
  let aboutTrigger = null;

  // Symbols are embedded in index.html; icons require no network requests.
  function icon(name) {
    return `<svg class="ah-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  }

  function isNativeFullscreen() {
    return document.fullscreenElement === desktop || document.webkitFullscreenElement === desktop;
  }

  function showNotice(message) {
    desktop.querySelector('[data-notice-text]').textContent = message;
    notice.hidden = false;
  }

  function render() {
    const tabs = desktop.querySelector('[data-project-tabs]');
    const preview = desktop.querySelector('[data-preview]');
    const home = state.category === null;
    desktop.querySelectorAll('[data-cat]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.cat === state.category));
    });
    tabs.hidden = home;

    if (home) {
      tabs.replaceChildren();
      preview.classList.remove('ah-preview');
      preview.innerHTML = `<div class="ah-folder-grid">${Object.entries(categories).map(([id, category]) => {
        const count = projects.filter(project => project.cat === id).length;
        return `<button type="button" class="ah-folder-tile cursor-interaction" data-folder="${id}">${icon('folder')}<span>${category.name}</span><small>${count} project${count === 1 ? '' : 's'}</small></button>`;
      }).join('')}</div>`;
      preview.querySelectorAll('[data-folder]').forEach(button => {
        button.addEventListener('click', () => navigate(button.dataset.folder));
      });
      desktop.querySelector('[data-address]').textContent = 'C:\\Ivan\\Projects';
      desktop.querySelector('[data-count]').textContent = '4 folders · Selected work';
    } else {
      const items = projects.filter(project => project.cat === state.category);
      if (!items.some(project => project.id === state.project)) state.project = items[0].id;
      const project = items.find(project => project.id === state.project);
      tabs.innerHTML = items.map(item => `<button type="button" class="cursor-interaction" data-project="${item.id}" aria-pressed="${item.id === state.project}">${item.name}</button>`).join('');
      tabs.querySelectorAll('[data-project]').forEach(button => {
        button.addEventListener('click', () => {
          state.project = button.dataset.project;
          render();
          tabs.querySelector(`[data-project="${state.project}"]`).focus({ preventScroll: true });
        });
      });
      preview.classList.add('ah-preview');
      preview.innerHTML = `<div class="ah-eyebrow">README.txt</div><h2>${project.name}</h2><p class="ah-description">${project.description}</p><div class="ah-tech">${project.tech}</div><div class="ah-links">${project.live ? `<a class="cursor-interaction" href="${project.live}" target="_blank" rel="noopener noreferrer">${icon('external-link')}Live demo</a>` : ''}<a class="cursor-interaction" href="${project.source}" target="_blank" rel="noopener noreferrer">${icon('code-2')}Source</a></div>`;
      desktop.querySelector('[data-address]').textContent = `C:\\Ivan\\Projects\\${categories[state.category].dir}`;
      desktop.querySelector('[data-count]').textContent = `${items.length} project${items.length === 1 ? '' : 's'} · ${categories[state.category].name}`;
    }
    desktop.querySelector('[data-back]').disabled = state.history.length === 0;
  }

  function navigate(category) {
    if (category !== null && !Object.hasOwn(categories, category)) return;
    if (state.category === category) return;
    state.history.push({ category: state.category, project: state.project });
    state.category = category;
    render();
  }

  function setExpanded(expanded) {
    state.expanded = expanded;
    desktop.classList.toggle('is-expanded', expanded);
    fullscreenButton.setAttribute('aria-pressed', String(expanded));
    fullscreenButton.setAttribute('aria-label', expanded ? 'Restore window size' : 'Enter full screen');
    fullscreenButton.innerHTML = icon(expanded ? 'minimize' : 'maximize');
    desktop.querySelector('[data-window-state]').textContent = expanded
      ? (isNativeFullscreen() ? 'Full screen' : 'Maximized')
      : 'Window · 55%';
  }

  async function restoreWindow() {
    if (isNativeFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      try {
        if (!exit) throw new Error('Exit unavailable');
        await exit.call(document);
      } catch {
        showNotice('Press Esc to leave full screen.');
        return false;
      }
    }
    setExpanded(false);
    notice.hidden = true;
    return true;
  }

  async function toggleFullscreen() {
    if (state.expanded || isNativeFullscreen()) {
      await restoreWindow();
      return;
    }
    setExpanded(true);
    const enter = desktop.requestFullscreen || desktop.webkitRequestFullscreen;
    try {
      if (!enter) throw new Error('Fullscreen unavailable');
      await enter.call(desktop);
      setExpanded(isNativeFullscreen());
    } catch {
      showNotice('Full screen is unavailable in this browser. The window has been maximized within the page.');
    }
  }

  fullscreenButton.addEventListener('click', toggleFullscreen);
  desktop.querySelector('[data-titlebar]').addEventListener('dblclick', event => {
    if (!event.target.closest('button')) toggleFullscreen();
  });
  function onFullscreenChange() {
    setExpanded(isNativeFullscreen());
    notice.hidden = true;
    if (!explorer.hidden) fullscreenButton.focus({ preventScroll: true });
  }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  desktop.querySelectorAll('[data-cat]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.cat));
  });
  desktop.querySelector('[data-back]').addEventListener('click', () => {
    const previous = state.history.pop();
    if (!previous) return;
    state.category = previous.category;
    state.project = previous.project;
    render();
  });
  desktop.querySelector('[data-home]').addEventListener('click', () => navigate(null));
  desktop.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => { explorer.hidden = false; });
  });
  ['minimize', 'close'].forEach(action => {
    desktop.querySelector(`[data-${action}]`).addEventListener('click', async () => {
      if (await restoreWindow()) {
        explorer.hidden = true;
        desktop.querySelector('.ah-active-task').focus({ preventScroll: true });
      }
    });
  });
  const note = desktop.querySelector('.ah-note');
  function closeNote() {
    note.hidden = true;
    if (aboutTrigger) aboutTrigger.focus({ preventScroll: true });
  }
  desktop.querySelectorAll('[data-about]').forEach(button => {
    button.addEventListener('click', () => {
      aboutTrigger = button;
      note.hidden = false;
      desktop.querySelector('[data-note-close]').focus({ preventScroll: true });
    });
  });
  desktop.querySelector('[data-note-close]').addEventListener('click', closeNote);
  desktop.querySelector('[data-notice-close]').addEventListener('click', () => { notice.hidden = true; });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!note.hidden) closeNote();
    if (state.expanded || isNativeFullscreen()) restoreWindow();
  });

  render();
})();
