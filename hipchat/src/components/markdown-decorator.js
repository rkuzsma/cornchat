import log from '../logger';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/highlight';

// Include only a subset to reduce bundle size
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('python', python);
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('bash', bash);
import ruby from 'highlight.js/lib/languages/ruby';
hljs.registerLanguage('ruby', ruby);
import java from 'highlight.js/lib/languages/java';
hljs.registerLanguage('java', java);
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);
import coffeescript from 'highlight.js/lib/languages/coffeescript';
hljs.registerLanguage('coffeescript', coffeescript);
import dockerfile from 'highlight.js/lib/languages/dockerfile';
hljs.registerLanguage('dockerfile', dockerfile);
import kotlin from 'highlight.js/lib/languages/kotlin';
hljs.registerLanguage('kotlin', kotlin);
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);
import http from 'highlight.js/lib/languages/http';
hljs.registerLanguage('http', http);
import css from 'highlight.js/lib/languages/css';
hljs.registerLanguage('css', css);
import cpp from 'highlight.js/lib/languages/cpp';
hljs.registerLanguage('cpp', cpp);
import diff from 'highlight.js/lib/languages/diff';
hljs.registerLanguage('diff', diff);
import go from 'highlight.js/lib/languages/go';
hljs.registerLanguage('go', go);
import elm from 'highlight.js/lib/languages/elm';
hljs.registerLanguage('elm', elm);
import erb from 'highlight.js/lib/languages/erb';
hljs.registerLanguage('erb', erb);
import gradle from 'highlight.js/lib/languages/gradle';
hljs.registerLanguage('gradle', gradle);
import less from 'highlight.js/lib/languages/less';
hljs.registerLanguage('less', less);
import php from 'highlight.js/lib/languages/php';
hljs.registerLanguage('php', php);
import cs from 'highlight.js/lib/languages/cs';
hljs.registerLanguage('cs', cs);
import objectivec from 'highlight.js/lib/languages/objectivec';
hljs.registerLanguage('objectivec', objectivec);
import swift from 'highlight.js/lib/languages/swift';
hljs.registerLanguage('swift', swift);
import scala from 'highlight.js/lib/languages/scala';
hljs.registerLanguage('scala', scala);
import r from 'highlight.js/lib/languages/r';
hljs.registerLanguage('r', r);
import rust from 'highlight.js/lib/languages/rust';
hljs.registerLanguage('rust', rust);
import sql from 'highlight.js/lib/languages/sql';
hljs.registerLanguage('sql', sql);

export default function decorate(innerText, settingValues) {
  if (!settingValues.isApplyMarkdown) {
    return innerText;
  }

  const md = MarkdownIt({
    highlight: function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return ''; // use external default escaping
    }
  });

  let decoratedHtml = md.render(innerText)
  decoratedHtml = decoratedHtml.trim();

  // Marked.js surrounds a single, plain-text (no markdown) line inside <p>...</p>
  if (decoratedHtml.startsWith('<p>') &&
      decoratedHtml.endsWith('</p>') &&
      decoratedHtml.lastIndexOf('<p>') === 0) {
    decoratedHtml = decoratedHtml.substring(3, decoratedHtml.length - 4);
  }
  // Restore any trimmed whitespace from the beginning
  if (innerText.startsWith(' ')) {
    decoratedHtml = ' ' + decoratedHtml;
  }
  else if (innerText.endsWith("\n")) {
    decoratedHtml = '<br/>' + decoratedHtml;
  }
  // Restore any trimmed whitespace from the end
  if (innerText.endsWith(' ')) {
    decoratedHtml += ' ';
  }
  else if (innerText.endsWith("\n")) {
    decoratedHtml += '<br/>';
  }
  return decoratedHtml;
};
