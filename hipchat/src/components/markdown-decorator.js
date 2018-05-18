import log from '../logger';
import markdown from 'marked';
import hljs from 'highlight.js';

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

export default function decorate(innerText) {
  const decoratedHtml = '<div>'+markdown(innerText)+'</div>';
  return decoratedHtml;
};
