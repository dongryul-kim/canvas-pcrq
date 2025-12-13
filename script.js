
const DEBOUNCE_MS = 300;
let lastKeyTime = 0;
let isProcessing = false;

if (location.href.includes('/gradebook/speed_grader')) {
  init();
}

function init() {
  insert_help();

  // Use capture phase to intercept keys before iframe gets them
  document.addEventListener('keydown', hotkeys, true);
  window.addEventListener('keydown', hotkeys, true);

  // Initial processing
  waitForIframeAndProcess();
}

function getIframeBody() {
  try {
    const iframe = document.querySelector('iframe#speedgrader_iframe');
    if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) {
      return null;
    }
    return iframe.contentWindow.document.body;
  } catch (e) {
    // Handle cross-origin or dead object errors
    return null;
  }
}

function waitForIframeAndProcess() {
  const checkAndProcess = () => {
    const body = getIframeBody();
    if (body && body.querySelector('div#questions')) {
      processQuestions();
      attachIframeKeyListener();
    } else {
      setTimeout(checkAndProcess, 100);
    }
  };
  checkAndProcess();
}

function attachIframeKeyListener() {
  try {
    const iframe = document.querySelector('iframe#speedgrader_iframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
      iframe.contentWindow.document.removeEventListener('keydown', hotkeys, true);
      iframe.contentWindow.document.addEventListener('keydown', hotkeys, true);
    }
  } catch (e) {
    // Ignore errors
  }
}

function processQuestions() {
  const body = getIframeBody();
  if (!body) {
    showFeedback('Iframe not ready', 'error');
    isProcessing = false;
    return;
  }

  // Hide elements by adding a CSS class instead of storing references
  addHidingStyles(body);

  // Hide comment form in parent document
  const commentForm = document.querySelector('div:has(>form#add_a_comment)');
  if (commentForm) commentForm.classList.add('pcrq-hidden');

  // Hide various elements in iframe
  const toHide = body.querySelectorAll('div.alert, div.quiz_score, div.quiz_duration');
  toHide.forEach(el => el.classList.add('pcrq-hidden'));

  // Process questions
  const questions = body.querySelectorAll('div[aria-label="Question"]');
  let ungradedCount = 0;

  for (const q of questions) {
    const input = q.querySelector('input.question_input_hidden');
    if (!input) continue;

    const currentValue = input.value || input.getAttribute('value') || '';

    if (currentValue === '') {
      // Ungraded - hide question text and comment, but keep answer visible
      const questionText = q.querySelector('div.question_text');
      const quizComment = q.querySelector('div.quiz_comment');
      if (questionText) questionText.classList.add('pcrq-hidden');
      if (quizComment) quizComment.classList.add('pcrq-hidden');
      ungradedCount++;
    } else {
      // Already graded - hide entire question
      q.classList.add('pcrq-hidden');
    }
  }

  showFeedback(`Ready: ${ungradedCount} ungraded`, 'success');
  isProcessing = false;
}

function addHidingStyles(body) {
  // Add CSS to iframe if not already present
  if (!body.querySelector('#pcrq-styles')) {
    const style = document.createElement('style');
    style.id = 'pcrq-styles';
    style.textContent = '.pcrq-hidden { display: none !important; }';
    body.appendChild(style);
  }

  // Add CSS to parent document if not already present
  if (!document.querySelector('#pcrq-styles-parent')) {
    const style = document.createElement('style');
    style.id = 'pcrq-styles-parent';
    style.textContent = '.pcrq-hidden { display: none !important; }';
    document.head.appendChild(style);
  }
}

function showFeedback(message, type = 'info') {
  let feedback = document.querySelector('#pcrq-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'pcrq-feedback';
    feedback.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      padding: 10px 20px;
      border-radius: 5px;
      font-weight: bold;
      z-index: 99999;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(feedback);
  }

  const colors = {
    info: { bg: '#2196F3', fg: 'white' },
    success: { bg: '#4CAF50', fg: 'white' },
    error: { bg: '#f44336', fg: 'white' },
    action: { bg: '#FF9800', fg: 'white' }
  };

  const color = colors[type] || colors.info;
  feedback.style.backgroundColor = color.bg;
  feedback.style.color = color.fg;
  feedback.textContent = message;
  feedback.style.opacity = '1';

  clearTimeout(feedback.hideTimeout);
  feedback.hideTimeout = setTimeout(() => {
    feedback.style.opacity = '0';
  }, 2000);
}

function insert_help() {
  const container = document.querySelector('div#rightside_inner');
  if (!container) return;

  const table = `<table id="pcrq-help" style="margin: 0 auto; border-collapse: separate; border-spacing: 1em 0; text-align: center;">
    <tr><th>Key</th><th>Function</th></tr>
    <tr><td>z</td><td>Full marks + next</td></tr>
    <tr><td>x</td><td>Zero points + next</td></tr>
    <tr><td>c</td><td>Zero (no submission) + next</td></tr>
    <tr><td>&larr;</td><td>Previous student</td></tr>
    <tr><td>&rarr;</td><td>Next student</td></tr>
    <tr><td>s</td><td>Show hidden elements</td></tr>
    </table>`;
  container.innerHTML += table;
}

function hotkeys(e) {
  const now = Date.now();
  if (now - lastKeyTime < DEBOUNCE_MS) {
    return;
  }

  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  if (isProcessing && e.key !== 's') {
    showFeedback('Please wait...', 'info');
    return;
  }

  switch (e.key) {
    case 'z':
      e.preventDefault();
      e.stopPropagation();
      lastKeyTime = now;
      giveFullMarks();
      break;
    case 'x':
      e.preventDefault();
      e.stopPropagation();
      lastKeyTime = now;
      giveZeroPoints();
      break;
    case 'ArrowRight':
      e.preventDefault();
      e.stopPropagation();
      lastKeyTime = now;
      navigateStudent('next');
      break;
    case 'ArrowLeft':
      e.preventDefault();
      e.stopPropagation();
      lastKeyTime = now;
      navigateStudent('prev');
      break;
    case 's':
      e.preventDefault();
      e.stopPropagation();
      showAllElements();
      break;
    case 'c':
      e.preventDefault();
      e.stopPropagation();
      lastKeyTime = now;
      giveZeroNoSubmission();
      break;
  }
}

function getUngradedInputs() {
  const body = getIframeBody();
  if (!body) return [];

  const inputs = [];
  const questions = body.querySelectorAll('div[aria-label="Question"]');

  for (const q of questions) {
    const input = q.querySelector('input.question_input_hidden');
    if (!input) continue;

    const currentValue = input.value || input.getAttribute('value') || '';
    if (currentValue === '') {
      const ptsSpan = q.querySelector('span.question_points');
      if (ptsSpan) {
        const pts = ptsSpan.innerText.substr(2);
        inputs.push({ input, pts });
      }
    }
  }

  return inputs;
}

function giveFullMarks() {
  const inputs = getUngradedInputs();

  if (inputs.length === 0) {
    showFeedback('No ungraded questions', 'info');
    return;
  }

  showFeedback(`Full marks (${inputs.length} Qs)`, 'action');

  for (const { input, pts } of inputs) {
    input.value = pts;
    input.setAttribute('value', pts);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  clickUpdateAndNavigate();
}

function giveZeroPoints() {
  const inputs = getUngradedInputs();

  if (inputs.length === 0) {
    showFeedback('No ungraded questions', 'info');
    return;
  }

  showFeedback(`Zero points (${inputs.length} Qs)`, 'action');

  for (const { input } of inputs) {
    input.value = '0';
    input.setAttribute('value', '0');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  clickUpdateAndNavigate();
}

function giveZeroNoSubmission() {
  const gradeInput = document.querySelector('input#grading-box-extended');

  if (!gradeInput) {
    showFeedback('Grade box not found', 'error');
    return;
  }

  showFeedback('Zero (no submission)', 'action');
  isProcessing = true;

  // Set the value
  gradeInput.value = '0';
  gradeInput.setAttribute('value', '0');

  // Trigger events so Canvas registers the change
  gradeInput.dispatchEvent(new Event('input', { bubbles: true }));
  gradeInput.dispatchEvent(new Event('change', { bubbles: true }));

  // Simulate pressing Enter to submit
  gradeInput.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true
  }));
  gradeInput.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true
  }));

  // Wait for update to complete, then navigate to next student
  setTimeout(() => {
    navigateStudent('next');
  }, 2500);
}

function clickUpdateAndNavigate() {
  const body = getIframeBody();

  // Try to find button in iframe first, then in parent document
  let updateBtn = null;

  if (body) {
    updateBtn = body.querySelector('button.update-scores');
  }

  // Also check parent document
  if (!updateBtn) {
    updateBtn = document.querySelector('button.update-scores');
  }

  if (updateBtn) {
    isProcessing = true;

    // Try multiple ways to trigger the click
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: updateBtn.ownerDocument.defaultView
    });
    updateBtn.dispatchEvent(clickEvent);
    updateBtn.click();

    // If it's in a form, try submitting the form
    const form = updateBtn.closest('form');
    if (form) {
      form.requestSubmit(updateBtn);
    }

    // Wait for update to complete, then navigate to next student
    setTimeout(() => {
      navigateStudent('next');
    }, 2500);
  } else {
    showFeedback('Update button not found', 'error');
  }
}

function navigateStudent(direction) {
  const btnId = direction === 'next' ? '#next-student-button' : '#prev-student-button';
  const btn = document.querySelector(`button${btnId}`);

  if (btn) {
    isProcessing = true;
    showFeedback(direction === 'next' ? 'Next student...' : 'Previous student...', 'action');
    btn.click();

    // Wait for new student to load, then reprocess
    setTimeout(() => {
      waitForIframeAndProcess();
    }, 500);
  }
}

function showAllElements() {
  // Remove hiding class from all elements
  const body = getIframeBody();
  if (body) {
    const hidden = body.querySelectorAll('.pcrq-hidden');
    hidden.forEach(el => el.classList.remove('pcrq-hidden'));
    showFeedback(`Showing ${hidden.length} elements`, 'action');
  }

  // Also in parent document
  const parentHidden = document.querySelectorAll('.pcrq-hidden');
  parentHidden.forEach(el => el.classList.remove('pcrq-hidden'));
}
