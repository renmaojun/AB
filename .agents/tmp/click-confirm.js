(() => {
  const btns = Array.from(document.querySelectorAll('.ant-modal button, .ant-btn'));
  const target = btns.find(b => b.textContent.replace(/\s/g,'') === '确定');
  if (!target) return 'NOT_FOUND: ' + btns.map(b => b.textContent.trim()).join('|');
  ['mousedown','mouseup','click'].forEach(type => {
    target.dispatchEvent(new MouseEvent(type, {bubbles:true, cancelable:true, view:window}));
  });
  return 'CLICKED_CONFIRM';
})();
