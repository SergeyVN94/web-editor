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
    let path = [];

    while (domElement.nodeName !== 'HTML') {
        path.unshift(domElement.nodeName.toLowerCase())
        domElement = domElement.parentNode;
    }

    return path;
}

WebEditor.prototype._getCssOfSelectedItem = function (selection) {
    let domElement = this._getSelectedItem(selection);
    return getComputedStyle(domElement);
}

WebEditor.prototype._getSelectedItem = function (selection) {
    let domElement = selection.anchorNode;
    if (domElement.nodeName === '#text') {
        domElement = domElement.parentNode;
    }
    return domElement;
}

WebEditor.prototype._getSelection = function () {
    return this._iframeDocument.getSelection();
}

WebEditor.prototype._isSelection = function () {
    return this._getSelection().type !== 'None';
}

WebEditor.prototype._updatePanels = function () {
    if (!this._isSelection()) {
        return;
    }

    let selection = this._getSelection();

    let pathToSelectedItem = this._getPathToSelectedItem(selection);
    let cssOfSelectedItem = this._getCssOfSelectedItem(selection);

    this._panels.forEach(panel => {
        panel.update(cssOfSelectedItem, pathToSelectedItem);
    });
}

WebEditor.prototype.addEventListenerEntryField = function(type, callback){
    this._entryField.addEventListener(type, callback);
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

Panel.prototype._enableButton = function (button) {
    button.classList.add(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype._disableButton = function (button) {
    button.classList.remove(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype._setButtonState = function (button, isActive) {
    if (isActive) {
        button.classList.add(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
    } else {
        button.classList.remove(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
    }
}

Panel.prototype._isButtonActive = function (button) {
    return button.classList.contains(this.OPTIONS.BUTTONS.CLASSES.ACTIVE);
}

Panel.prototype._execCommandToolButton = function (button) {
    let command = button.getAttribute('data-command-name');
    this._entryField.focus();
    this._iframeDocument.execCommand(command);
}

Panel.prototype._getSelection = function () {
    return this._iframeDocument.getSelection();
}

Panel.prototype._isSelection = function () {
    return this._getSelection().type !== 'None';
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
                for (const key in _this._toolButtons) {
                    if (_this._toolButtons.hasOwnProperty(key)) {
                        const button = _this._toolButtons[key];
                        if (_this._isButtonActive(button)) {
                            _this._disableButton(button);
                            _this._execCommandToolButton(button);
                        }
                    }
                }
                return;
            }

            _this._execCommandToolButton(button);
            _this._setButtonState(this, !_this._isButtonActive(this));
        });
    });
}

Panel1.prototype = Object.create(Panel.prototype);

Panel1.prototype.update = function (css, path) {
    this._setButtonState(
        this._toolButtons.bold,
        (css.fontWeight == 700 || path.includes('bold'))
    );
    this._setButtonState(
        this._toolButtons.italic,
        (css.fontStyle == 'italic' || path.includes('i'))
    );
    this._setButtonState(
        this._toolButtons.underline,
        (css.textDecorationLine.includes('underline') || path.includes('u'))
    );
    this._setButtonState(
        this._toolButtons.strikeThrough,
        (css.textDecorationLine.includes('line-through') || path.includes('strike'))
    );
    this._setButtonState(
        this._toolButtons.subscript,
        (css.verticalAlign == 'sub' || path.includes('sub'))
    );
    this._setButtonState(
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
        _this._insertQuote();
    });

    _this._toolButtons.insertSpoiler.addEventListener('click', function () {
        _this._insertSpoiler();
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
    wrapper.classList.add('quote-wrapper', 'hide');
    input.classList.add('quote-text');

    title.innerHTML = 'Цитата';
    input.innerHTML = '&#8203;';
    wrapper.appendChild(input);
    container.appendChild(title);
    container.appendChild(wrapper);

    this._entryField.focus();
    this._iframeDocument.execCommand('insertHTML', false, `<br>${container.outerHTML}</br>`);
}

Panel2.prototype._insertSpoiler = function () {
    let container = document.createElement('div');
    let wrapper = document.createElement('div');
    let title = document.createElement('span');
    let input = document.createElement('p');

    container.classList.add('spoiler');
    title.classList.add('spoiler-title');
    wrapper.classList.add('spoiler-wrapper', 'hide');
    input.classList.add('spoiler-text');

    title.innerHTML = 'Spoiler';
    input.innerHTML = '&#8203;';
    wrapper.appendChild(input);
    container.appendChild(title);
    container.appendChild(wrapper);

    this._entryField.focus();
    this._iframeDocument.execCommand('insertHTML', false, `<br>${container.outerHTML}</br>`);
}

Panel2.prototype.update = function (css, path) {
    this._setButtonState(
        this._toolButtons.insertOrderedList,
        (path.includes('ol'))
    );
    this._setButtonState(
        this._toolButtons.insertUnorderedList,
        (path.includes('ul'))
    );
}

// Justify text panel
function JustifyTextPanel() {
    Panel.apply(this, arguments);
    const _this = this;

    let buttons = this._panel.querySelectorAll('span');
    if (buttons.length === 0) {
        console.error('Failed to initialize panel!');
        return;
    }

    this._toolButtons = {};
    buttons.forEach(button => {
        const name = button.getAttribute('data-command-name');
        this._toolButtons[name] = button;
        button.addEventListener('click', function () {
            for (const key in _this._toolButtons) {
                if (_this._toolButtons.hasOwnProperty(key)) {
                    const button = _this._toolButtons[key];
                    _this._disableButton(button);
                }
            }

            _this._enableButton(this);
            _this._execCommandToolButton(this);
        });
    });
}

JustifyTextPanel.prototype = Object.create(Panel.prototype);

JustifyTextPanel.prototype.update = function (css, path) {
    this._setButtonState(this._toolButtons.justifyLeft, (css.textAlign == 'start' || css.textAlign == 'left'));
    this._setButtonState(this._toolButtons.justifyCenter, (css.textAlign == 'center'));
    this._setButtonState(this._toolButtons.justifyRight, (css.textAlign == 'right'));
    this._setButtonState(this._toolButtons.justifyFull, (css.textAlign == 'justify'));
}

// Font name panel
function FontNamePanel() {
    Panel.apply(this, arguments);
    const _this = this;

    this._panel.addEventListener('change', function () {
        let fontName = this.value;
        _this._entryField.focus();
        _this._iframeDocument.execCommand('fontName', true, fontName);
    });
}

FontNamePanel.prototype = Object.create(Panel.prototype);

FontNamePanel.prototype.update = function (css, path) {
    switch (css.fontFamily) {
        case 'Arial':
            this._panel.options.selectedIndex = 1;
            break;
        case '"Comic Sans MS"':
            this._panel.options.selectedIndex = 2;
            break;
        case '"Courier New"':
            this._panel.options.selectedIndex = 3;
            break;
        case 'Georgia':
            this._panel.options.selectedIndex = 4;
            break;
        case '"Lucida Sans Unicode"':
            this._panel.options.selectedIndex = 5;
            break;
        case 'Tahoma':
            this._panel.options.selectedIndex = 6;
            break;
        case '"Times New Roman"':
            this._panel.options.selectedIndex = 7;
            break;
        case '"Trebuchet MS"':
            this._panel.options.selectedIndex = 8;
            break;
        case 'Verdana':
            this._panel.options.selectedIndex = 9;
            break;
        default:
            this._panel.options.selectedIndex = 0;
            break;
    }
}

// Header panel
function HeaderPanel() {
    Panel.apply(this, arguments);
    const _this = this;

    this._panel.addEventListener('change', function () {
        let tag = this.value;
        _this._entryField.focus();
        _this._iframeDocument.execCommand('formatBlock', true, tag);
    });
}

HeaderPanel.prototype = Object.create(Panel.prototype);

HeaderPanel.prototype.update = function (css, path) {
    let header = 'p';
    path.forEach(tag => {
        if (/h\d/i.test(tag)) {
            header = tag;
        }
    });

    switch (header) {
        case 'h1':
            this._panel.options.selectedIndex = 1;
            break;
        case 'h2':
            this._panel.options.selectedIndex = 2;
            break;
        case 'h3':
            this._panel.options.selectedIndex = 3;
            break;
        case 'h4':
            this._panel.options.selectedIndex = 4;
            break;
        case 'h5':
            this._panel.options.selectedIndex = 5;
            break;
        case 'h6':
            this._panel.options.selectedIndex = 6;
            break;
        default:
            this._panel.options.selectedIndex = 0;
            break;
    }
}

// Font size panel
function FontSizePanel() {
    Panel.apply(this, arguments);
    const _this = this;

    this._panel.addEventListener('change', function () {
        let fontSize = this.value;
        _this._setFontSize(fontSize);
    });
}

FontSizePanel.prototype = Object.create(Panel.prototype);

FontSizePanel.prototype._setFontSize = function (fontSize) {
    if (!this._isSelection()) {
        return;
    }

    let selection = this._getSelection();
    this._entryField.focus();

    if (selection.type === 'Range') {
        let range = selection.getRangeAt(0);
        let documentFragment = range.cloneContents(); // Выделенный фрагмент
        let elements = documentFragment.querySelectorAll('*');
        elements.forEach(element => {
            element.style.fontSize = null;
        });
        let span = document.createElement('span');
        span.style.fontSize = `${fontSize}px`;
        span.appendChild(documentFragment);
        this._iframeDocument.execCommand('insertHTML', true, span.outerHTML);
        return;
    }

    // selection.type === 'Caret'
    let span = document.createElement('span');
    span.style.fontSize = `${fontSize}px`;
    span.innerHTML = '&#8203;';

    this._iframeDocument.execCommand('insertHTML', true, span.outerHTML);
}

FontSizePanel.prototype.update = function (css, path) {
    switch (parseInt(css.fontSize, 10)) {
        case 10:
            this._panel.options.selectedIndex = 1;
            break;
        case 11:
            this._panel.options.selectedIndex = 2;
            break;
        case 12:
            this._panel.options.selectedIndex = 3;
            break;
        case 16:
            this._panel.options.selectedIndex = 4;
            break;
        case 18:
            this._panel.options.selectedIndex = 5;
            break;
        case 20:
            this._panel.options.selectedIndex = 6;
            break;
        case 22:
            this._panel.options.selectedIndex = 7;
            break;
        case 24:
            this._panel.options.selectedIndex = 8;
            break;
        case 26:
            this._panel.options.selectedIndex = 9;
            break;
        default:
            this._panel.options.selectedIndex = 0;
            break;
    }
}

// Text color panel
function TextColorPanel() {
    Panel.apply(this, arguments);
    const _this = this;

    let buttons = this._panel.querySelectorAll('span');
    if (buttons.length == 0) {
        console.error('Failed to initialize panel!');
        return;
    }

    this._toolButtons = {};
    buttons.forEach(button => {
        let name = button.getAttribute('data-command-name');
        _this._toolButtons[name] = button;

        button.addEventListener('click', function (event) {
            let command = this.getAttribute('data-command-name');
            let x = event.clientX - event.offsetX - 3;
            let y = event.clientY - event.offsetY + event.target.clientHeight;
            let defaultColor = 'black';
            // hiliteColor - this command sets the background color of the text
            if(command === 'hiliteColor'){
                defaultColor = 'white';
            }
            _this._colorPickerWindow.askColor(x, y, function(color){
                _this._entryField.focus();
                _this._iframeDocument.execCommand(command, true, color);
            }, defaultColor);
        });
    });
}

TextColorPanel.prototype = Object.create(Panel.prototype);

TextColorPanel.prototype.update = function (css, path) {

}

TextColorPanel.prototype.setColorPickerWindow = function(colorPickerWindow){
    this._colorPickerWindow = colorPickerWindow;
}

// Modal windows
function ModalWindow(modalWindow) {
    this._modalWindow = modalWindow;
}

ModalWindow.prototype.show = function (x, y) {
    this._modalWindow.style.left = `${x}px`;
    this._modalWindow.style.top = `${y}px`;
    this._modalWindow.classList.remove(this.OPTIONS.CLASSES.HIDE);
}

ModalWindow.prototype.hide = function () {
    this._modalWindow.classList.add(this.OPTIONS.CLASSES.HIDE);
}

ModalWindow.prototype.OPTIONS = {
    CLASSES: {
        HIDE: 'hide'
    }
}

// color picker window
function ColorPickerWindow(){
    ModalWindow.apply(this, arguments);
    let _this = this;

    this._defaultColorButton = this._modalWindow.querySelector('.color-select-btn.default');
    let buttons = this._modalWindow.querySelectorAll('.color-select-btn');
    if (buttons.length === 0 || !this._defaultColorButton) {
        console.error('Failed to initialize modal window!');
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', function(){
            let color = this.getAttribute('data-color');
            if (_this.hasOwnProperty('_callbackColor') && typeof _this._callbackColor === 'function') {
                _this._callbackColor(color);
            }
            _this.hide();
        });
    });
}

ColorPickerWindow.prototype = Object.create(ModalWindow.prototype);

ColorPickerWindow.prototype.askColor = function(x, y, callback, defaultColor){
    this._callbackColor = callback;
    document.body.style.backgroundColor
    defaultColor = defaultColor || 'black';
    this._defaultColorButton.style.backgroundColor = defaultColor
    this._defaultColorButton.setAttribute('data-color', defaultColor);
    this.show(x, y);
}