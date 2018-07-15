const assert = require('assert');

const { JSDOM } = require( 'jsdom' );
const jsdom = new JSDOM( "<html><body></body></html>" );

const { window } = jsdom;
const { document } = window;
global.window = window;
global.document = document;

const $ = global.jQuery = require( 'jquery' );

import decorateMsgLineEl from './msg-decorator';
import decorator from './markdown-decorator';

const testMarkdown = (id, msgLineElHtml, expectedMarkupHtml) => {
  $('body').append($(msgLineElHtml));
  const isDecorated = decorateMsgLineEl($('div'), [decorator], {isApplyMarkdown: true} );
  const decoratedHtml = $('#' + id).get(0).innerHTML;
  assert.equal(decoratedHtml, expectedMarkupHtml);
}

describe('MsgDecorator', function() {
  describe('#decorateMsgLineEl', function() {
    it('should preserve a trailing space and <BR>', function() {
      testMarkdown('trailingSpaceAndBR',
        '<div id="trailingSpaceAndBR" class="notification msg-line"><b xmlns="http://www.w3.org/1999/xhtml">You said: </b>Hello world!. <br xmlns="http://www.w3.org/1999/xhtml"><i xmlns="http://www.w3.org/1999/xhtml">Psst: click on the glance that says "Hello World" in the right sidebar</i></div>',
        '<b xmlns="http://www.w3.org/1999/xhtml">You said: </b><span>Hello world!.<br></span><i xmlns="http://www.w3.org/1999/xhtml">Psst: click on the glance that says "Hello World" in the right sidebar</i>'
      );
    });
    it('should preserve a trailing space before an anchor link', function() {
      testMarkdown('trailingSpace',
        '<div id="trailingSpace" class="msg-line">example PR: <a target="_blank" rel="noopener noreferrer" href="https://github.roving.com/ES/em-flow-static/pull/137">https:<wbr>/<wbr>/github.roving.com<wbr>/ES<wbr>/em-flow-static<wbr>/pull<wbr>/137</a></div>',
        'example PR: <a target="_blank" rel="noopener noreferrer" href="https://github.roving.com/ES/em-flow-static/pull/137">https:<wbr>/<wbr>/github.roving.com<wbr>/ES<wbr>/em-flow-static<wbr>/pull<wbr>/137</a>'
      );
    });
    it('should highlight javascript syntax', function() {
      testMarkdown('syntaxHighlight',
        '<div id="syntaxHighlight" class="msg-wrap"><br>Syntax highlighting<br><br>``` js<br>var foo = function (bar) {<br>  return bar++;<br>};<br><br>console.log(foo(5));<br>```<br></div>',
        '<span><p>Syntax highlighting</p>' + "\n" +
          '<pre><code class="language-js"><span class="hljs-keyword">var</span> foo = <span class="hljs-function"><span class="hljs-keyword">function</span> (<span class="hljs-params">bar</span>) </span>{' + "\n" +
          '  <span class="hljs-keyword">return</span> bar++;' + "\n" +
          '};' + "\n" +
          '' + "\n" +
          '<span class="hljs-built_in">console</span>.log(foo(<span class="hljs-number">5</span>));' + "\n" +
          '</code></pre><br></span>'
      );
    });
    it('should handle hipchat emoticons and text', function() {
      testMarkdown('emoticons',
        '<div id="emoticons" class="msg-line"><img class="remoticon" src="https://dujrsrsgsd3nh.cloudfront.net/img/emoticons/18058/blobhungry-1525893732@2x.gif" onerror="if (HC.emoticon_resolution_helper) { HC.emoticon_resolution_helper(this); }"> *bold* <img class="remoticon" aria-label="(blobhungry)" alt="(blobhungry)" height="30" width="30" src="https://dujrsrsgsd3nh.cloudfront.net/img/emoticons/18058/blobhungry-1525893732@2x.gif" ' +
          'onerror="if (HC.emoticon_resolution_helper) {' + "\n" + 'HC.emoticon_resolution_helper(this); }"> </div>',
        '<img class="remoticon" src="https://dujrsrsgsd3nh.cloudfront.net/img/emoticons/18058/blobhungry-1525893732@2x.gif" onerror="if (HC.emoticon_resolution_helper) { HC.emoticon_resolution_helper(this); }"><span><em>bold</em> </span><img class="remoticon" aria-label="(blobhungry)" alt="(blobhungry)" height="30" width="30" src="https://dujrsrsgsd3nh.cloudfront.net/img/emoticons/18058/blobhungry-1525893732@2x.gif" onerror="if (HC.emoticon_resolution_helper) {' + "\n" +
          'HC.emoticon_resolution_helper(this); }"> '
      );
    });
    it('should not modify a single line plain text message', function() {
      testMarkdown('plain',
        '<div id="plain" class="msg-line">plain text</div>',
        'plain text'
      );
    });
  });
});
