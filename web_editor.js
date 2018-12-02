function WebEditor(editor, pathToInnerCss) {
    let _this = this;
    if (!editor || typeof pathToInnerCss !== 'string') {
        console.error('Failed to initialize text editor!');
        return;
    }

    this._iframeDocument = editor.querySelector('iframe').contentWindow.document;
    this._entryField = this._iframeDocument.body;
    this._panels = [];

    this._iframeDocument.designMode = 'on';

    let styles = document.createElement('link');
    styles.setAttribute('rel', 'stylesheet');
    styles.setAttribute('type', 'text/css');
    styles.setAttribute('href', pathToInnerCss);
    this._iframeDocument.head.appendChild(styles);

    this._entryField.addEventListener('click', function () {
        _this._updatePanels();
    });
    this._entryField.addEventListener('keyup', function (event) {
        if (event.code == 'ArrowUp' || event.code == 'ArrowRight' || event.code == 'ArrowDown' || event.code == 'ArrowLeft' || event.code == 'Backspace') {
            _this._updatePanels();
        }
    });

    let mutationObserver = new MutationObserver(function () {
        _this._updatePanels();
    });
    mutationObserver.observe(this._entryField, {
        childList: true,
        subtree: true
    });
}

WebEditor.prototype._getPathToSelectedItem = function (selection) {
    let domElement = this._getSelectedItem(selection);
    if (domElement === null) {
        return null;
    }

    let path = [];

    while (domElement.nodeName !== 'HTML') {
        path.unshift(domElement.nodeName.toLowerCase())
        domElement = domElement.parentNode;
    }

    return path;
}

WebEditor.prototype._getCssOfSelectedItem = function (selection) {
    let domElement = this._getSelectedItem(selection);
    if (domElement === null) {
        return null;
    }

    return getComputedStyle(domElement);
}

WebEditor.prototype._getSelectedItem = function (selection) {
    if (selection.type !== 'Caret') {
        return null;
    }

    let domElement = selection.anchorNode;

    if (domElement.nodeName === '#text') {
        domElement = domElement.parentNode;
    }

    return domElement;
}

WebEditor.prototype._getSelection = function () {
    return this._iframeDocument.getSelection();
}

WebEditor.prototype._updatePanels = function () {
    const selection = this._getSelection();
    const pathToSelectedItem = this._getPathToSelectedItem(selection);
    const cssOfSelectedItem = this._getCssOfSelectedItem(selection);

    this._panels.forEach(panel => {
        panel.update(cssOfSelectedItem, pathToSelectedItem);
    });
}

WebEditor.prototype.addToolsPanel = function (toolsPanel) {
    toolsPanel.initialization(this._iframeDocument, this._entryField);
    this._panels.push(toolsPanel);
}

WebEditor.prototype.getHtml = function () {
    return this._entryField.innerHTML;
}

// Panels
function Panel(panel) {
    this._panel = panel;
}

Panel.prototype.initialization = function (iframeDocument, entryField) {
    this._iframeDocument = iframeDocument;
    this._entryField = entryField;
}

Panel.prototype.enableButton = function (button) {
    button.classList.add(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype.disableButton = function (button) {
    button.classList.remove(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype.setButtonState = function (button, isActive) {
    if (isActive) {
        button.classList.add(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
    } else {
        button.classList.remove(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
    }
}

Panel.prototype.isButtonActive = function (button) {
    return button.classList.contains(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype._execCommandToolButton = function (button) {
    let command = button.getAttribute('data-command-name');
    this._entryField.focus();
    this._iframeDocument.execCommand(command);
}

Panel.prototype.OPTIONS = {
    BUTTONS: {
        CLASSES: {
            ACTIVE: 'active'
        }
    }
}

// Tags panel
function TagsPanel() {
    Panel.apply(this, arguments);
}

TagsPanel.prototype = Object.create(Panel.prototype);

TagsPanel.prototype.update = function (css, path) {
    this._panel.innerHTML = "";
    path.forEach(element => {
        let tag = document.createElement('span');
        tag.classList.add('tag');
        tag.innerHTML = element;
        this._panel.appendChild(tag);
    });
}

// Panel 1
function Panel1() {
    Panel.apply(this, arguments);
    const _this = this;

    let buttons = this._panel.querySelectorAll('span');
    if (buttons.length == 0) {
        console.error('Failed to initialize panel!');
        return;
    }

    this._toolButtons = {};
    buttons.forEach(button => {
        const name = button.getAttribute('data-command-name');
        this._toolButtons[name] = button;
        button.addEventListener('click', function () {
            let command = this.getAttribute('data-command-name');
            if (command === 'removeFormat') {
                _this._toolButtons.forEach(button => {
                    if (_this.isButtonActive(button)) {
                        _this.disableButton(button);
                        _this._execCommandToolButton(button);
                    }
                });
                return;
            }

            _this._execCommandToolButton(button);
            _this.setButtonState(this, !_this.isButtonActive(this));
        });
    });
}

Panel1.prototype = Object.create(Panel.prototype);

Panel1.prototype.update = function (css, path) {
    this.setButtonState(
        this._toolButtons.bold,
        (css.fontWeight == 700 || path.includes('bold'))
    );
    this.setButtonState(
        this._toolButtons.italic,
        (css.fontStyle == 'italic' || path.includes('i'))
    );
    this.setButtonState(
        this._toolButtons.underline,
        (css.textDecorationLine.includes('underline') || path.includes('u'))
    );
    this.setButtonState(
        this._toolButtons.strikeThrough,
        (css.textDecorationLine.includes('line-through') || path.includes('strike'))
    );
    this.setButtonState(
        this._toolButtons.subscript,
        (css.verticalAlign == 'sub' || path.includes('sub'))
    );
    this.setButtonState(
        this._toolButtons.superscript,
        (css.verticalAlign == 'super' || path.includes('sup'))
    );
}

// Panel 2
function Panel2() {
    Panel.apply(this, arguments);
    const _this = this;

    let buttons = this._panel.querySelectorAll('span');
    if (buttons.length == 0) {
        console.error('Failed to initialize panel!');
        return;
    }

    this._toolButtons = {};
    buttons.forEach(button => {
        const name = button.getAttribute('data-command-name');
        this._toolButtons[name] = button;
    });

    this._toolButtons.insertOrderedList.addEventListener('click', function () {
        _this._execCommandToolButton(this);
    });
    this._toolButtons.insertUnorderedList.addEventListener('click', function () {
        _this._execCommandToolButton(this);
    });
    this._toolButtons.outdent.addEventListener('click', function () {
        _this._execCommandToolButton(this);
    });
    this._toolButtons.indent.addEventListener('click', function () {
        _this._execCommandToolButton(this);
    });

    _this._toolButtons.insertQuote.addEventListener('click', function () {
        _this.insertQuote();
    });

    _this._toolButtons.insertSpoiler.addEventListener('click', function () {
        _this.insertSpoiler();
    });
}

Panel2.prototype = Object.create(Panel.prototype);

Panel2.prototype._insertQuote = function () {
    let container = document.createElement('div');
    let wrapper = document.createElement('div');
    let title = document.createElement('span');
    let input = document.createElement('p');

    container.classList.add('quote');
    title.classList.add('quote-title');
    wrapper.classList.add('quote-wrapper');
    wrapper.classList.add('hide');
    input.classList.add('quote-text');

    title.innerHTML = 'Цитата';
    input.innerHTML = '&#8203;';
    wrapper.appendChild(input);
    container.appendChild(title);
    container.appendChild(wrapper);

    this._entryField.focus();
    this._iframeDocument.execCommand('insertHTML', false, '<br>' + container.outerHTML + '<p>&#8203;</p>');
}

Panel2.prototype._insertSpoiler = function () {
    let container = document.createElement('div');
    let wrapper = document.createElement('div');
    let title = document.createElement('span');
    let input = document.createElement('p');

    container.classList.add('spoiler');
    title.classList.add('spoiler-title');
    wrapper.classList.add('spoiler-wrapper');
    wrapper.classList.add('hide');
    input.classList.add('spoiler-text');

    title.innerHTML = 'Spoiler';
    input.innerHTML = '&#8203;';
    wrapper.appendChild(input);
    container.appendChild(title);
    container.appendChild(wrapper);

    this._entryField.focus();
    this._iframeDocument.execCommand('insertHTML', false, '<br>' + container.outerHTML + '<p>&#8203;</p>');
}

Panel2.prototype.update = function (css, path) {
    this.setButtonState(
        this._toolButtons.insertOrderedList,
        (path.includes('ol'))
    );
    this.setButtonState(
        this._toolButtons.insertUnorderedList,
        (path.includes('ul'))
    );
}
/*
_this.panels.color = (function () {
    let _this = {};

    return {
        init: function () {
            let buttons = document.querySelectorAll('.web-editor div[data-panel="color"] span');
            if (!buttons) {
                console.error('Failed to initialize panel!');
                return;
            }

            _this.buttons = {};
            buttons.forEach(button => {
                let name = button.getAttribute('data-command-name');
                _this.buttons[name] = button;
            });

            // Цвет теста
            _this.buttons.foreColor.addEventListener('click', function (event) {
                if (isActive(this)) {
                    disable(this);
                    selectColorWindow.hide();
                } else {
                    disable(_this.buttons.hiliteColor);
                    enable(this);
                    _this.command = 'foreColor';
                    selectColorWindow.setDefaultColor('black');
                    selectColorWindow.show(event.layerX - event.offsetX - 2, event.layerY - event.offsetY + 25);
                }
            });

            // Цвет фона
            _this.buttons.hiliteColor.addEventListener('click', function (event) {
                if (isActive(this)) {
                    disable(this);
                    selectColorWindow.hide();
                } else {
                    disable(_this.buttons.foreColor);
                    enable(this);
                    _this.command = 'hiliteColor';
                    selectColorWindow.setDefaultColor('white');
                    selectColorWindow.show(event.layerX - event.offsetX - 2, event.layerY - event.offsetY + 25);
                }
            });
        },
        setColor: function (color) {
            disable(_this.buttons.foreColor);
            disable(_this.buttons.hiliteColor);
            _this.entryField.focus();
            _this.iframeDocument.execCommand(_this.command, false, color);
        },
        update: function () {

        }
    }
}());

_this.panels.justifyText = (function () {
    let _this = {};

    function setJustify() {
        for (const key in buttons.justifyText) {
            buttons.justifyText[key].classList.remove('active');
        }
        this.classList.add('active');
        iframeDocument.body.focus(); // Вернуть фокус полю ввода
        let command = this.getAttribute('data-command-name');
        iframeDocument.execCommand(command);
    }

    return {
        init: function () {
            let buttons = document.querySelectorAll('.web-editor div[data-panel="justify-text"] span');
            if (!buttons) {
                console.error('Failed to initialize panel!');
                return;
            }

            _this.buttons = {};
            buttons.forEach(button => {
                let name = button.getAttribute('data-command-name');
                _this.buttons[name] = button;
                button.addEventListener('click', setJustify);
            });
        },
        update: function (parameters) {
            let css = parameters.css;
            (css.textAlign == 'start' || css.textAlign == 'left') ? enable(_this.buttons.justifyLeft): disable(_this.buttons.justifyLeft);
            (css.textAlign == 'center') ? enable(_this.buttons.justifyCenter): disable(_this.buttons.justifyCenter);
            (css.textAlign == 'right') ? enable(_this.buttons.justifyRight): disable(_this.buttons.justifyRight);
            (css.textAlign == 'justify') ? enable(_this.buttons.justifyFull): disable(_this.buttons.justifyFull);
        }
    }
}());

_this.panels.header = (function () {
    let _this = {};

    function setHeader() {
        let tag = _this.select.value;
        _this.entryField.focus();
        _this.iframeDocument.execCommand('formatBlock', true, tag);
    }

    return {
        init: function () {
            _this.select = document.querySelector('.web-editor select[name="header"]');
            if (!_this.select) {
                console.error('Failed to initialize panel!');
                return;
            }
            _this.select.addEventListener('change', setHeader);
        },
        update: function (parameters) {
            let header = 'p';
            parameters.path.forEach(tag => {
                if (/h\d/ig.test(tag)) {
                    header = tag;
                }
            });

            switch (header) {
                case 'h1':
                    _this.select.options.selectedIndex = 1;
                    break;
                case 'h2':
                    _this.select.options.selectedIndex = 2;
                    break;
                case 'h3':
                    _this.select.options.selectedIndex = 3;
                    break;
                case 'h4':
                    _this.select.options.selectedIndex = 4;
                    break;
                case 'h5':
                    _this.select.options.selectedIndex = 5;
                    break;
                case 'h6':
                    _this.select.options.selectedIndex = 6;
                    break;
                default:
                    _this.select.options.selectedIndex = 0;
                    break;
            }
        }
    }
}());

_this.panels.fontSize = (function () {
    let _this = {};

    function setFontSize() {
        let fontSize = _this.select.value;
        let selection = _this.iframeDocument.getSelection();

        _this.entryField.focus();

        if (selection.type == 'Caret') {
            let span = document.createElement('span');
            span.style.fontSize = fontSize + 'px';
            span.innerHTML = '&#8203;';
            let node = selection.anchorNode;
            // Если каретка в текстовом узле - его нужно разделить
            if (node.nodeName == '#text') {
                let text = node.nodeValue;

                // Разделить текст на 2 части - до и после каретки
                let position = selection.anchorOffset;
                let textLeft = "";
                for (let i = 0; i < position; i++) {
                    textLeft += text[i];
                }
                let textRight = "";
                for (let i = position; i < text.length; i++) {
                    textRight += text[i];
                }
                // Создать и заполнить новый фрагмент
                let frag = document.createDocumentFragment();

                if (textLeft.length > 0) {
                    textLeft = document.createTextNode(textLeft);
                    frag.appendChild(textLeft);
                }
                frag.appendChild(span);
                if (textRight.length > 0) {
                    textRight = document.createTextNode(textRight);
                    frag.appendChild(textRight);
                }
                // Заменить текстовый узел на фрагмент
                node.parentNode.replaceChild(frag, node);

                let range = _this.iframeDocument.createRange();
                range.setStart(span, 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                return;
            }
            _this.iframeDocument.execCommand('insertHTML', true, span.outerHTML);
        } else if (selection.type == 'Range') {
            let range = selection.getRangeAt(0);
            let fragment = range.cloneContents(); // Выделенный фрагмент
            let elements = fragment.querySelectorAll('*');
            elements.forEach(element => {
                element.style.fontSize = null;
            });
            //console.log(fragment);
            let span = document.createElement('span');
            span.style.fontSize = fontSize + 'px';
            span.appendChild(fragment);
            _this.iframeDocument.execCommand('insertHTML', true, span.outerHTML);
        }
    }

    return {
        init: function () {
            _this.select = document.querySelector('.web-editor select[name="font-size"]');
            if (!_this.select) {
                console.error('Failed to initialize panel!');
                return;
            }
            _this.select.addEventListener('change', setFontSize);
        },
        update: function (parameters) {
            switch (parseInt(parameters.css.fontSize, 10)) {
                case 10:
                    _this.select.options.selectedIndex = 1;
                    break;
                case 11:
                    _this.select.options.selectedIndex = 2;
                    break;
                case 12:
                    _this.select.options.selectedIndex = 3;
                    break;
                case 16:
                    _this.select.options.selectedIndex = 4;
                    break;
                case 18:
                    _this.select.options.selectedIndex = 5;
                    break;
                case 20:
                    _this.select.options.selectedIndex = 6;
                    break;
                case 22:
                    _this.select.options.selectedIndex = 7;
                    break;
                case 24:
                    _this.select.options.selectedIndex = 8;
                    break;
                case 26:
                    _this.select.options.selectedIndex = 9;
                    break;
                default:
                    _this.select.options.selectedIndex = 0;
                    break;
            }
        }
    }
}());

_this.panels.fontName = (function () {
    let _this = {};

    function setFontName() {
        let fontName = this.value;
        _this.entryField.focus();
        _this.iframeDocument.execCommand('fontName', true, fontName);
    }

    return {
        init: function () {
            _this.select = document.querySelector('.web-editor select[name="font-name"]');
            if (!_this.select) {
                console.error('Failed to initialize panel!');
                return;
            }
            _this.select.addEventListener('change', setFontName);
        },
        update(parameters) {
            switch (parameters.css.fontFamily) {
                case 'Arial':
                    _this.select.options.selectedIndex = 1;
                    break;
                case '"Comic Sans MS"':
                    _this.select.options.selectedIndex = 2;
                    break;
                case '"Courier New"':
                    _this.select.options.selectedIndex = 3;
                    break;
                case 'Georgia':
                    _this.select.options.selectedIndex = 4;
                    break;
                case '"Lucida Sans Unicode"':
                    _this.select.options.selectedIndex = 5;
                    break;
                case 'Tahoma':
                    _this.select.options.selectedIndex = 6;
                    break;
                case '"Times New Roman"':
                    _this.select.options.selectedIndex = 7;
                    break;
                case '"Trebuchet MS"':
                    _this.select.options.selectedIndex = 8;
                    break;
                case 'Verdana':
                    _this.select.options.selectedIndex = 9;
                    break;
                default:
                    _this.select.options.selectedIndex = 0;
                    break;
            }
        }
    }
}());

// Окно выбора цвета
let selectColorWindow = (function () {
    let _this = {};

    function setColor() {
        _this.window.classList.add('hide');
        let color = this.getAttribute('data-color');
        _this.panels.color.setColor(color);
    }

    return {
        init: function () {
            _this.window = document.querySelector('.web-editor .select-color-window');
            _this.buttonDefault = document.querySelector('.web-editor .select-color-window div.default'); // Кнопка цвета по умолчания     
            _this.buttons = document.querySelectorAll('.web-editor .select-color-window div.color');

            _this.buttonDefault.addEventListener('click', setColor);

            _this.buttons.forEach(button => {
                button.addEventListener('click', setColor);
            });
        },
        setDefaultColor(color) {
            _this.buttonDefault.style.backgroundColor = color;
            _this.buttonDefault.setAttribute('data-color', color);
        },
        show: function (x, y) {
            _this.window.classList.remove('hide');
            _this.window.style.left = x + 'px';
            _this.window.style.top = y + 'px';
        },
        hide: function () {
            _this.window.classList.add('hide');
        }
    }
}());
*/


const webEditor = new WebEditor(document.querySelector('.web-editor'), 'web_editor_components.css');
webEditor.addToolsPanel(new TagsPanel(document.querySelector('.web-editor .tags')));
webEditor.addToolsPanel(new Panel1(document.querySelector('.web-editor div[data-panel="panel-1"]')));
webEditor.addToolsPanel(new Panel2(document.querySelector('.web-editor div[data-panel="panel-2"]')));