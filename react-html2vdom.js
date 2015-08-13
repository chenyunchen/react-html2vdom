var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
});

var React;

function parse(html, R) {
	React = R;
	return traverseToReact(convertHTML(html));
}

function traverseToReact(obj) {
	if (Array.isArray(obj)) {
		obj = obj[0];
	}

  var type = '';
  if(obj.__proto__.type === 'VirtualNode'){
      type = 'tag';
  } else {
      type = 'text';
  }
  var tagName = obj.tagName,
		children = obj.children,
		comp,
        tagArray = [tagName];
	if (type == 'tag') {
    for(attribs in obj.properties){
        if(attribs != 'attributes')
            obj.properties.attributes[attribs] = obj.properties[attribs]
    }
		comp = React.createElement.apply(null, tagArray.concat(buildArgs(obj.properties.attributes)).concat(children.map(traverseToReact)));
	} else if (type == 'text' ) {
		comp = obj.text;
  }
	return comp;
}

function buildArgs(obj) {
	if (isEmptyObject(obj)) {
		return null;
	}
	var key,
		attribObj = {},
		regularKeys = /(data-||aria-)?/;

	for (key in obj) {
		if (key == 'class') {
          attribObj.className = obj[key];
		} else if (key == 'style') {
		  attribObj.style = obj[key];
    } else if (key.match(regularKeys)[1]) {
      attribObj[key] = obj[key];
		} else if (key == 'for') {
			attribObj.htmlFor = obj[key];
		} else {
      attribObj[camelCase(key)] = obj[key];
		}
	}
	return attribObj;
}
function isEmptyObject(obj) {
	return Object.getOwnPropertyNames(obj).length === 0;
}
function parseStyle(styles) {
  var styleObj = {},
      styleSplit;
  if (!styles.length || !Array.isArray(styles)) {
    return {};
  }
  styles.forEach(function(style) {
    if (!style) {
      return;
    }
    styleSplit = style.split(':');
    styleObj[camelCase(styleSplit[0])] = styleSplit[1];
  });
  return styleObj;
}
function camelCase(input) {
    if(input.indexOf('-') != -1){
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    } else {
        return input;
    }
}

function parseHtmlToObj(html) {
  var handler = new htmlparser.DomHandler();
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  return handler.dom;
}

module.exports = parse;
