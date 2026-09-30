(() => {
  'use strict';
  const notes = window.DRIVING_NOTES;
  const $ = id => document.getElementById(id);
  const popover = $('note-popover');
  const markerNodes = new Map();
  const rowNodes = new Map();
  let activeId = null;
  let pinned = false;
  let trigger = null;
  let closeTimer;
  let positionFrame;

  function cancelClose() { window.clearTimeout(closeTimer); }
  function positionPopover() {
    if (popover.hidden || !activeId) return;
    const anchor = markerNodes.get(activeId).getBoundingClientRect();
    const box = popover.getBoundingClientRect();
    const viewport = window.visualViewport;
    const width = viewport ? viewport.width : window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;
    const offsetX = viewport ? viewport.offsetLeft : 0;
    const offsetY = viewport ? viewport.offsetTop : 0;
    const margin = 12;
    let left = anchor.right + 12;
    if (left + box.width > offsetX + width - margin) left = anchor.left - box.width - 12;
    let top = anchor.top + anchor.height / 2 - box.height / 2;
    // On small screens place the card above/below the point instead of covering it.
    if (width <= 600) {
      left = anchor.left + anchor.width / 2 - box.width / 2;
      top = anchor.bottom + 12;
      if (top + box.height > offsetY + height - margin) top = anchor.top - box.height - 12;
    }
    popover.style.left = Math.max(offsetX + margin, Math.min(left, offsetX + width - box.width - margin)) + 'px';
    popover.style.top = Math.max(offsetY + margin, Math.min(top, offsetY + height - box.height - margin)) + 'px';
  }
  function schedulePosition() {
    cancelAnimationFrame(positionFrame);
    positionFrame = requestAnimationFrame(positionPopover);
  }
  function syncActive() {
    for (const [id, marker] of markerNodes) {
      const active = id === activeId;
      marker.classList.toggle('active', active);
      marker.setAttribute('aria-expanded', String(active));
      const row = rowNodes.get(id);
      row.classList.toggle('active', active);
      row.setAttribute('aria-expanded', String(active));
    }
    $('selection-status').textContent = activeId ? `筆記 ${String(activeId).padStart(2, '0')}${pinned ? ' · 已固定' : ' · 預覽中'}` : '18 則筆記已就位';
  }
  function show(id, shouldPin, source) {
    cancelClose();
    if (pinned && !shouldPin) return;
    const note = notes.find(item => item.id === id);
    activeId = id;
    pinned = shouldPin;
    trigger = source;
    $('popover-label').textContent = `NOTE ${String(id).padStart(2, '0')} / 18`;
    $('popover-title').textContent = note.title;
    const content = $('popover-content');
    content.replaceChildren();
    if (note.body) {
      const paragraph = document.createElement('p');
      paragraph.textContent = note.body;
      content.append(paragraph);
    }
    if (note.steps) {
      const list = document.createElement('ol');
      for (const step of note.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        list.append(item);
      }
      content.append(list);
    }
    $('popover-hint').textContent = pinned ? '已固定閱讀 · 點空白處或按 Esc 關閉' : '點一下編號，固定這則筆記';
    popover.hidden = false;
    syncActive();
    positionPopover();
  }
  function close(restoreFocus = false) {
    cancelClose();
    const previousTrigger = trigger;
    activeId = null;
    pinned = false;
    trigger = null;
    popover.hidden = true;
    syncActive();
    if (restoreFocus && previousTrigger) {
      // focus normally opens a preview; suppress that single event when closing.
      previousTrigger.dataset.closing = 'true';
      previousTrigger.focus({ preventScroll: true });
      delete previousTrigger.dataset.closing;
    }
  }
  function deferClose() {
    cancelClose();
    if (!pinned) closeTimer = window.setTimeout(() => {
      if (!pinned) close();
    }, 160);
  }
  function select(id, source, reveal) {
    if (pinned && activeId === id) { close(); return; }
    if (reveal) {
      $('show-markers').checked = true;
      $('markers').hidden = false;
      markerNodes.get(id).scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    }
    show(id, true, source);
  }

  for (const note of notes) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'marker';
    marker.style.setProperty('--x', note.x + '%');
    marker.style.setProperty('--y', note.y + '%');
    marker.dataset.id = note.id;
    marker.setAttribute('aria-label', `筆記 ${note.id}：${note.title}`);
    marker.setAttribute('aria-controls', 'note-popover');
    marker.setAttribute('aria-expanded', 'false');
    const number = document.createElement('span');
    number.textContent = note.id;
    marker.append(number);
    marker.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') show(note.id, false, marker);
    });
    marker.addEventListener('pointerleave', deferClose);
    marker.addEventListener('focus', () => {
      if (!marker.dataset.closing) show(note.id, false, marker);
    });
    marker.addEventListener('blur', deferClose);
    marker.addEventListener('click', () => select(note.id, marker, false));
    $('markers').append(marker);
    markerNodes.set(note.id, marker);

    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'note-row';
    row.dataset.id = note.id;
    row.setAttribute('aria-controls', 'note-popover');
    row.setAttribute('aria-expanded', 'false');
    const badge = document.createElement('span');
    badge.className = 'row-number';
    badge.textContent = String(note.id).padStart(2, '0');
    const title = document.createElement('span');
    title.className = 'row-text';
    title.textContent = note.title;
    const arrow = document.createElement('span');
    arrow.className = 'row-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    row.append(badge, title, arrow);
    row.addEventListener('click', () => select(note.id, row, true));
    li.append(row);
    $('note-list').append(li);
    rowNodes.set(note.id, row);
  }
  popover.addEventListener('pointerenter', cancelClose);
  popover.addEventListener('pointerleave', deferClose);
  popover.addEventListener('focusin', cancelClose);
  popover.addEventListener('focusout', event => {
    if (!popover.contains(event.relatedTarget)) deferClose();
  });
  $('close-popover').addEventListener('click', () => close(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popover.hidden) { event.preventDefault(); close(true); }
  });
  document.addEventListener('pointerdown', event => {
    if (!popover.hidden && !popover.contains(event.target) && !event.target.closest('.marker,.note-row')) close();
  });
  $('show-markers').addEventListener('change', event => {
    $('markers').hidden = !event.target.checked;
    close();
  });
  $('zoom').addEventListener('click', () => {
    const zoomed = $('map-stage').classList.toggle('zoomed');
    $('zoom').setAttribute('aria-pressed', String(zoomed));
    $('zoom').textContent = zoomed ? '還原大小 ↙' : '放大地圖 ↗';
    $('map-viewport').scrollTo({ top: 0, left: 0, behavior: 'instant' });
    close();
  });
  window.addEventListener('resize', schedulePosition);
  document.addEventListener('scroll', schedulePosition, true);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedulePosition);
    window.visualViewport.addEventListener('scroll', schedulePosition);
  }
  new ResizeObserver(schedulePosition).observe($('map-stage'));
  $('map-image').addEventListener('error', () => { $('image-error').hidden = false; });
})();
