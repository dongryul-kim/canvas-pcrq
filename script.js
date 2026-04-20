const polling_interval = 30;

if (location.href.includes('/gradebook/speed_grader')) {
  insert_help();
  inject_styles();
  document.addEventListener('keydown', hotkeys);
}

async function inject_styles() {
  if (!document.querySelector('style#pcrq')) {
    const style = document.createElement('style');
    style.id = 'pcrq';
    style.textContent = `div#flash_message_holder,
      div#submission_not_newest_notice, div:has(>form#add_a_comment),
      div#submission_details, div.secondary_mount_point_container { display:
      none; }`;
    document.head.appendChild(style);
  }
  let iframe;
  while (true) {
    await new Promise(_ => setTimeout(_, polling_interval));
    iframe = document.querySelector('iframe#speedgrader_iframe');
    if (iframe) iframe.style.display = 'none';
    if (iframe && iframe.contentDocument && iframe.contentDocument.head &&
      iframe.contentDocument.querySelector('div#questions')) break;
  }
  if (!iframe.contentDocument.querySelector('style#pcrq')) {
    const style = document.createElement('style');
    style.id = 'pcrq';
    style.textContent = `div.alert, div.quiz_score, div.quiz_duration,
      div.question_text, div.quiz_comment, div.update_scores_fudge { display:
      none; } div[aria-label="Question"] { display: none; }
      div[aria-label="Question"]:has(input.question_input_hidden[value=""]) {
      display: block; }`;
    iframe.contentDocument.head.appendChild(style);
  }
  iframe.style.display = '';
}

function insert_help() {
  const table = `<table id="pcrq-help" style="margin: 0 auto; border-collapse: separate; border-spacing: 1em 0; text-align: center;">
    <tr><th>Key</th><th>Function</th></tr>
    <tr><td>z</td><td>Gives full marks</td></tr>
    <tr><td>x</td><td>Gives zero points</td></tr>
    <tr><td>&larr;</td><td>Previous student</td></tr>
    <tr><td>&rarr;</td><td>Next student</td></tr>
    <tr><td>h</td><td>Hides all elements</td></tr>
    <tr><td>s</td><td>Shows all elements</td></tr>
    </table>
    <p style="text-align: center;"><a href="https://github.com/dongryul-kim/canvas-pcrq">Link to GitHub repository</a></p>`;
  document.querySelector('div#rightside_inner').innerHTML += table;
}

function grade(full_score) {
  const iframe = document.querySelector('iframe#speedgrader_iframe');
  for (q of iframe.contentDocument.querySelectorAll('div[aria-label="Question"]')) {
    const i = q.querySelector('input.question_input_hidden');
    if (i.getAttribute('value') === '') {
      const pts = q.querySelector('span.question_points').innerText.substr(2);
      i.setAttribute('value', full_score ? pts : '0');
    }
  }
  iframe.contentDocument.querySelector('button.update-scores').click();
  iframe.style.display = 'none';
  iframe.addEventListener('load', inject_styles);
}

function hotkeys(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'z':
      grade(true);
      break;
    case 'x':
      grade(false);
      break;
    case 'ArrowRight':
      document.querySelector('button#next-student-button').click();
      inject_styles();
      break;
    case 'ArrowLeft':
      document.querySelector('button#prev-student-button').click();
      inject_styles();
      break;
    case 'h':
      inject_styles();
      break;
    case 's':
      document.querySelector('style#pcrq').remove();
      document.querySelector('iframe#speedgrader_iframe').contentDocument.querySelector('style#pcrq').remove();
      break;
  }
}

