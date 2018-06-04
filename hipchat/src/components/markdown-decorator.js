import log from '../logger';
import markdown from 'marked';
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

markdown.setOptions({
  renderer: new markdown.Renderer(),
  highlight: function(code, lang) {
    if (typeof lang === 'undefined') {
      return hljs.highlightAuto(code).value;
    } else if (lang === 'nohighlight') {
      return code;
    } else {
      return hljs.highlight(lang, code).value;
    }
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

export default function decorate(innerText, settingValues) {
  log("MarkdownDecorator: settingValues.isApplyMarkdown=" + settingValues.isApplyMarkdown);
  if (!settingValues.isApplyMarkdown) {
    return innerText;
  }

  const decoratedHtml = markdown(innerText);
  // Marked.js surrounds a single, plain-text (no markdown) line inside <p>...</p>
  // If all we did was surround the text in <p>...</p>, return the original so the
  // caller knows that no material markdown was applied.
  if (innerText === decoratedHtml.substring(3, decoratedHtml.length - 5)) {
    return innerText;
  }
  return decoratedHtml;
};
