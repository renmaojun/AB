(() => {
  const opts = Array.from(document.querySelectorAll('.ant-select-item-option'));
  const target = opts.find(o => o.textContent.trim() === '电视');
  if (!target) return 'NOT_FOUND: ' + opts.map(o => o.textContent.trim()).join('|');
  ['mousedown','mouseup','click'].forEach(type => {
    target.dispatchEvent(new MouseEvent(type, {bubbles:true, cancelable:true, view:window}));
  });
  return 'CLICKED: 电视';
})();
