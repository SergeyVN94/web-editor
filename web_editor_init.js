const webEditor = new WebEditor(document.querySelector('.web-editor'), 'web_editor_components.css');
webEditor.addToolsPanel(new TagsPanel(document.querySelector('.web-editor .tags')));
webEditor.addToolsPanel(new Panel1(document.querySelector('.web-editor div[data-panel="panel-1"]')));
webEditor.addToolsPanel(new Panel2(document.querySelector('.web-editor div[data-panel="panel-2"]')));
webEditor.addToolsPanel(new JustifyTextPanel(document.querySelector('.web-editor div[data-panel="justify-text"]')));
webEditor.addToolsPanel(new FontNamePanel(document.querySelector('.web-editor select[name="font-name"]')));
webEditor.addToolsPanel(new HeaderPanel(document.querySelector('.web-editor select[name="header"]')));
webEditor.addToolsPanel(new FontSizePanel(document.querySelector('.web-editor select[name="font-size"]')));

const textColorPanel = new TextColorPanel(document.querySelector('.web-editor div[data-panel="color"]'));
const colorPickerWindow = new ColorPickerWindow(document.querySelector('.web-editor .select-color-window'));
textColorPanel.setColorPickerWindow(colorPickerWindow);
webEditor.addEventListenerEntryField('click', () => {
    colorPickerWindow.hide();
});
webEditor.addEventListenerEntryField('focus', () => {
    colorPickerWindow.hide();
});

webEditor.addToolsPanel(textColorPanel);