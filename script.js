
const polling_interval = 30;
const input_to_grade = []; // stores pairs of (hidden_input, total_pts)
const hidden_elems = [];
let iframe;
let iframe_body;

if (location.href.includes('/gradebook/speed_grader')) {
  main();
  document.addEventListener('keydown', hotkeys);
}

async function main() {
  await get_iframe();
  await process_iframe();
}

async function get_iframe() {
  while (true) {
    await new Promise(_ => setTimeout(_, polling_interval));
    iframe = document.querySelector('iframe#speedgrader_iframe');
    if (iframe !== null) break;
  }
}

async function process_iframe() {
  // Wating for iframe to load
  while (true) {
    await new Promise(_ => setTimeout(_, polling_interval));
    if (iframe.contentWindow === null) continue;
    iframe_body = iframe.contentWindow.document.body;
    if (iframe_body === null) continue;
    if (iframe_body.querySelector('div#questions') === null) continue;
    break;
  }
  // Hiding certain elements
  input_to_grade.length = 0;
  hidden_elems.length = 0;
  hide_elems(iframe_body, 'div.alert');
  hide_elems(iframe_body, 'div.quiz_score');
  hide_elems(iframe_body, 'div.quiz_duration');
  for (q of iframe_body.querySelectorAll('div[aria-label="Question"]')) {
    const i = q.querySelector('input.question_input_hidden');
    if (i.getAttribute('value') === '') {
      hide_elems(q, 'div.question_text');
      hide_elems(q, 'div.quiz_comment');
      const pts = q.querySelector('span.question_points').innerText.substr(2);
      input_to_grade.push([i, pts]);
    } else {
      hidden_elems.push(q);
      q.style.display = 'none';
    }
  }
}

function hide_elems(elem, selector) {
  const s = elem.querySelector(selector);
  if (s !== null) {
    hidden_elems.push(s);
    s.style.display = 'none';
  }
}

function hotkeys(e) {
  switch (e.key) {
    case 'z':
      for (pair of input_to_grade) {
        pair[0].setAttribute('value', pair[1]);
      }
      input_to_grade.length = 0;
    case 'x':
      for (pair of input_to_grade) {
        pair[0].setAttribute('value', '0');
      }
      input_to_grade.length = 0;
      iframe_body.querySelector('button.update-scores').click();
      if (iframe !== null) iframe.addEventListener('load', main);
      break;
    case 'ArrowRight':
      document.querySelector('button#next-student-button').click();
      main();
      break;
    case 'ArrowLeft':
      document.querySelector('button#prev-student-button').click();
      main();
      break;
    case 's':
      for (e of hidden_elems) {
        e.style.display = '';
      }
      hidden_elems.length = 0;
      break;
  }
}

