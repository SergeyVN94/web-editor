/*
{
    "name": "Web editor",
    "version": "1.0.0",
    "description": "Text editor for creating comments on the site",
    "author": "Sergey",
    "license": "ISC"
}
*/

function WebEditor(editor, pathToInnerCss) {
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

    $this.entryField.addEventListener('click', this._updatePanels);
    $this.entryField.addEventListener('keyup', function (event) {
        if (event.code == 'ArrowUp' || event.code == 'ArrowRight' || event.code == 'ArrowDown' || event.code == 'ArrowLeft' || event.code == 'Backspace') {
            this._updatePanels();
        }
    });

    let mutationObserver = new MutationObserver(this._updatePanels);
    mutationObserver.observe(this._entryField, {
        childList: true,
        subtree: true
    });

    $this.panels.panel1 = (function () {
        let _this = {};

        function setFormat() {
            $this.entryField.focus(); // Вернуть фокус полю ввода
            let command = this.getAttribute('data-command-name');
            // Комманда убрать форматирование
            if (command == 'removeFormat') {
                _this.buttons.forEach(button => {
                    if (isActive(button)) {
                        disable(button);
                        let command = button.getAttribute('data-command-name');
                        $this.iframeDocument.execCommand(command);
                    }
                });
                return;
            }

            $this.iframeDocument.execCommand(command);

            if (isActive(this)) {
                disable(this);
            } else {
                enable(this);
            }
        }

        return {
            init: function () {
                let buttons = document.querySelectorAll('.web-editor div[data-panel="panel-1"] span');
                if (buttons.length == 0) {
                    console.error('Failed to initialize panel!');
                    return;
                }

                _this.buttons = {};
                buttons.forEach(button => {
                    let name = button.getAttribute('data-command-name');
                    _this.buttons[name] = button;
                    button.addEventListener('click', setFormat);
                });
            },
            update: function (parameters) {
                let css = parameters.css;
                let path = parameters.path;
                (css.fontWeight == 700 || path.indexOf('bold') != -1) ? enable(_this.buttons.bold): disable(_this.buttons.bold);
                (css.fontStyle == 'italic' || path.indexOf('i') != -1) ? enable(_this.buttons.italic): disable(_this.buttons.italic);
                (css.textDecorationLine.indexOf('underline') != -1 || path.indexOf('u') != -1) ? enable(_this.buttons.underline): disable(_this.buttons.underline);
                (css.textDecorationLine.indexOf('line-through') != -1 || path.indexOf('strike') != -1) ? enable(_this.buttons.strikeThrough): disable(_this.buttons.strikeThrough);
                (css.verticalAlign == 'sub' || path.indexOf('sub') != -1) ? enable(_this.buttons.subscript): disable(_this.buttons.subscript);
                (css.verticalAlign == 'super' || path.indexOf('sup') != -1) ? enable(_this.buttons.superscript): disable(_this.buttons.superscript);
            }
        }
    }());

    $this.panels.panel2 = (function () {
        let _this = {};

        function setFormat() {
            $this.iframeDocument.body.focus(); // Вернуть фокус полю ввода
            let command = this.getAttribute('data-command-name');
            $this.iframeDocument.execCommand(command);
            if (isActive(this)) {
                disable(this);
            } else {
                enable(this);
            }
        }

        // Изменить отступ
        function changeIndentation() {
            $this.entryField.focus(); // Вернуть фокус полю ввода
            let command = this.getAttribute('data-command-name');
            $this.iframeDocument.execCommand(command);
        }

        return {
            init: function () {
                let buttons = document.querySelectorAll('.web-editor div[data-panel="panel-2"] span');
                if (!buttons) {
                    console.error('Failed to initialize panel!');
                    return;
                }

                _this.buttons = {};
                buttons.forEach(button => {
                    let name = button.getAttribute('data-command-name');
                    _this.buttons[name] = button;
                });

                _this.buttons.insertOrderedList.addEventListener('click', setFormat);
                _this.buttons.insertUnorderedList.addEventListener('click', setFormat);
                _this.buttons.outdent.addEventListener('click', changeIndentation);
                _this.buttons.indent.addEventListener('click', changeIndentation);

                // Цитата
                _this.buttons.insertQuote.addEventListener('click', function () {
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

                    body.focus();
                    iframeDocument.execCommand('insertHTML', false, '<br>' + container.outerHTML + '<p>&#8203;</p>');
                });

                // Скрытый текст (спойлер)
                _this.buttons.insertSpoiler.addEventListener('click', function () {
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

                    body.focus();
                    iframeDocument.execCommand('insertHTML', false, '<br>' + container.outerHTML + '<p>&#8203;</p>');
                });
            },
            update: function (parameters) {
                (parameters.path.indexOf('ol') != -1) ? enable(_this.buttons.insertOrderedList): disable(_this.buttons.insertUnorderedList);
                (parameters.path.indexOf('ul') != -1) ? enable(_this.buttons.insertUnorderedList): disable(_this.buttons.insertUnorderedList);
            }
        }
    }());

    $this.panels.color = (function () {
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
                $this.entryField.focus();
                $this.iframeDocument.execCommand(_this.command, false, color);
            },
            update: function () {

            }
        }
    }());

    $this.panels.justifyText = (function () {
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

    $this.panels.header = (function () {
        let _this = {};

        function setHeader() {
            let tag = _this.select.value;
            $this.entryField.focus();
            $this.iframeDocument.execCommand('formatBlock', true, tag);
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

    $this.panels.fontSize = (function () {
        let _this = {};

        function setFontSize() {
            let fontSize = _this.select.value;
            let selection = $this.iframeDocument.getSelection();

            $this.entryField.focus();

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

                    let range = $this.iframeDocument.createRange();
                    range.setStart(span, 1);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    return;
                }
                $this.iframeDocument.execCommand('insertHTML', true, span.outerHTML);
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
                $this.iframeDocument.execCommand('insertHTML', true, span.outerHTML);
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

    $this.panels.fontName = (function () {
        let _this = {};

        function setFontName() {
            let fontName = this.value;
            $this.entryField.focus();
            $this.iframeDocument.execCommand('fontName', true, fontName);
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
            $this.panels.color.setColor(color);
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

    // Функции
    function updatePanels() {
        let parameters = {};
        let selection = $this.iframeDocument.getSelection();
        let data = getPath(selection);
        parameters.path = data.path;
        parameters.css = getComputedStyle(data.lastElement);

        //console.log(parameters);

        for (const panel in $this.panels) {
            $this.panels[panel].update(parameters);
        }
    }

    function isActive(element) {
        return element.classList.contains('active');
    }

    function disable(element) {
        element.classList.remove('active');
    }

    function enable(element) {
        element.classList.add('active');
    }

    // Получить путь до элемента, в котором находится каретка
    function getPath(selection) {
        let element = selection.anchorNode;
        if (element.nodeName == '#text') {
            element = element.parentNode;
        }
        let path = [];
        let lastElement = element; // Выбранный элемент
        while (element.nodeName != 'HTML') {
            path.unshift(element.nodeName.toLowerCase())
            element = element.parentNode;
        }
        return {
            path: path,
            lastElement: lastElement
        };
    }

    return {
        init: function (pathComponentsStyles) {
            $this.editor = document.querySelector('.web-editor');
            $this.iframe = document.querySelector('iframe[name="entry-field"]');
            if (!$this.editor || !$this.iframe) {
                console.error('Failed to initialize text editor!');
                return;
            }
            //console.log($this);

            $this.iframeDocument = $this.iframe.contentWindow.document;
            $this.entryField = $this.iframeDocument.body;

            $this.iframeDocument.designMode = 'on'; // Режим редактирования всего документа
            //$this.iframeDocument.execCommand('styleWithCSS', false, true);

            let style = document.createElement('link');
            style.setAttribute('rel', 'stylesheet');
            style.setAttribute('type', 'text/css');
            style.setAttribute('href', pathComponentsStyles);
            $this.iframeDocument.head.appendChild(style);

            // Инициализаци панелей
            for (let panel in $this.panels) {
                if ($this.panels.hasOwnProperty(panel)) {
                    $this.panels[panel].init();
                }
            }
            selectColorWindow.init();

            // Слушатели
            $this.entryField.addEventListener('click', updatePanels);
            $this.entryField.addEventListener('keyup', function (event) {
                if (event.code == 'ArrowUp' || event.code == 'ArrowRight' || event.code == 'ArrowDown' || event.code == 'ArrowLeft' || event.code == 'Backspace') {
                    updatePanels();
                }
            });

            // Мониторинг изменения DOM для body 
            let observer = new MutationObserver(updatePanels);
            observer.observe($this.entryField, {
                childList: true,
                subtree: true
            });
        },
        getHtml: function () {
            return $this.entryField.innerHTML;
        }
    }
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
    selection = selection || document.getSelection();

    if (selection.type !== 'Caret') {
        return null;
    }

    let domElement = selection.anchorNode;

    if (domElement.nodeName === '#text') {
        domElement = domElement.parentNode;
    }

    return domElement;
}

WebEditor.prototype._getSelection = function(){
    return this._iframeDocument.getSelection();
}

WebEditor.prototype._updatePanels = function(){
    const selection = this._getSelection();
    const pathToSelectedItem = this._getPathToSelectedItem(selection);
    const cssOfSelectedItem = this._getCssOfSelectedItem(selection);

    this._panels.forEach(panel => {
        panel.update(cssOfSelectedItem, pathToSelectedItem);
    });
}

WebEditor.prototype.addToolsPanel = function(toolsPanel){
    toolsPanel.initialization(this._entryField);
    this._panels.push(toolsPanel);
}

WebEditor.prototype.getHtml = function(){
    return this._entryField.innerHTML;
}

// Panels
function Panel(panel) {
    this._panel = panel;
}

Panel.prototype.initialization = function(iframeDocument){
    this._iframeDocument = iframeDocument;
    if (!_this.panel) {
        console.error('Failed to initialize tools panel!');
        return;
    }
}

// Tags panel
function TagsPanel(){
    Panel.apply(this, arguments);
}
TagsPanel.prototype = Object.create(Panel);

TagsPanel.prototype.update = function(css, path){
    this._panel.innerHTML = "";
    path.forEach(element => {
        let tag = document.createElement('span');
        tag.classList.add('tag');
        tag.innerHTML = element;
        this._panel.appendChild(tag);
    });
}


const webEditor = new WebEditor(document.querySelector('#my-editor'), 'web_editor_components.css', panels);
webEditor.addToolsPanel(new TagsPanel(document.querySelector()));