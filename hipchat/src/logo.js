import log from './logger';
import cornImage from './assets/cornchat-logo-32x32-notext.png';
import React from "react";
import ReactDOM from "react-dom";
import settings from './settings';

export default function render() {
  const logoRootEl = function() {
    var logoRootEl = document.getElementById('CORN_logoRoot');
    if (logoRootEl) return logoRootEl;
    logoRootEl = $("<ul class='aui-nav'><div id='CORN_logoRoot'></div></ul>");
    var el = $('div.aui-header-primary');
    log("CORN: Rendering logo root into " + el);
    $(el).append(logoRootEl);
    return document.getElementById('CORN_logoRoot');
  }

  const dialogRootEl = function() {
    var dialogRootEl = document.getElementById('CORN_dialogRoot');
    if (dialogRootEl) return dialogRootEl;
    dialogRootEl = $("<div id='CORN_dialogRoot'></div>");
    $('#hipchat').append(dialogRootEl, $('#hipchat')[0].childNodes[0]);
    return document.getElementById('CORN_dialogRoot');
  }

  const CORN_showDialog = function() {
    $('#CORN_logoDialog').show();
  }

  const CORN_hideDialog = function() {
    $('#CORN_logoDialog').hide();
  }

  ReactDOM.render(
    (
      <div onClick={CORN_showDialog} className="CORN-logo">
        <img src={cornImage} height="32" width="32" /> CornChat</div>
    ),
    logoRootEl()
  );

  ReactDOM.render(
    (
      <div className="CORN-dialog" id="CORN_logoDialog">
        <div>
          <div className="CORN-clearfix">
            <span class="CORN-float-right" onClick={CORN_hideDialog}>x</span>
            <h1>CornChat Settings</h1>
          </div>
          <hr/>
          <p>Learn more at <a href={settings.learn_more_url}>CornChat github page</a></p>
          <button onClick={CORN_hideDialog}>Dismiss</button>
        </div>
      </div>
    ),
    dialogRootEl()
  );
}
