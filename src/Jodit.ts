/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License https://xdsoft.net/jodit/license.html
 * Copyright 2013-2018 Valeriy Chupurnov https://xdsoft.net
 */

import {Component} from './modules/Component';
import {Select} from './modules/Selection';
import {Toolbar} from './modules/Toolbar';
import {Cookie} from './modules/Cookie';
import {FileBrowser} from './modules/FileBrowser';
import {Uploader} from './modules/Uploader';
import {Dom} from './modules/Dom';
import {EventsNative} from './modules/EventsNative';
import * as consts from './constants';
import {extend, inArray, dom, each, sprintf, defaultLanguage, debounce, asArray} from './modules/Helpers';
import * as helper from './modules/Helpers';
import {Config} from "./Config";


declare let appVersion: string;

interface JoditPlugin{
    destruct?: Function;
    open?: Function;
}

/** Class Jodit. Main class*/
export class Jodit extends Component {
    version: string = appVersion; // from webpack.config.js

    /**
     * Some extra data inside editor
     *
     * @type {{}}
     * @see copyformat plugin
     */
    public buffer: {[key: string]: any};

    static defaultOptions: Config;
    static plugins: any =  {};
    static modules: any =  {};
    static instances: {[key: string]: Jodit} = {};
    static lang: any = {};

    /**
     * @property {HTMLDocument} editorDocument
     */
    editorDocument: HTMLDocument;

    /**
     * @property {Window} editorWindow
     */
    editorWindow: Window;

    components: any = [];

    /**
     * @property {HTMLDocument} ownerDocument
     */
    ownerDocument: HTMLDocument;

    /**
     * @property {Window} ownerWindow
     */
    ownerWindow: Window;


    /**
     * @property{string} ID attribute for source element, id add {id}_editor it's editor's id
     */
    id: string;

    /**
     * @property{HTMLDivElement} progress_bar Progress bar
     */
    progress_bar: HTMLDivElement;

    /**
     * @property{HTMLDivElement} workplace It contains source and wysiwyg editors
     */
    workplace: HTMLDivElement;

    /**
     * @property{HTMLDivElement} container main editor's box
     */
    container: HTMLDivElement;

    /**
     * @property{HTMLElement} element It contains source element
     */
    element: HTMLInputElement;

    /**
     * @property{HTMLDivElement|HTMLBodyElement} editor It contains the root element editor
     */
    editor: HTMLDivElement|HTMLBodyElement;


    /**
     * @property{HTMLIFrameElement} iframe Iframe for iframe mode
     */
    iframe: HTMLIFrameElement;


    /**
     * @property{Config} options All Jodit settings default + second arguments of constructor
     */
    options: Config;

    /**
     * @property {Select} selection
     */
    selection: Select;

    /**
     * @property {Uploader} uploader
     */
    uploader: Uploader;

    events: EventsNative;

    /**
     * @property {FileBrowser} filebrowser
     */
    filebrowser: FileBrowser;

    helper: any;

    toolbar: Toolbar;

    private __modulesInstances: {[key: string]: Component} = {};

    getInstance(moduleName: string, options?: object): Component {
        if (Jodit.modules[moduleName] === undefined) {
            throw new Error('Need real module name')
        }

        if (this.__modulesInstances[moduleName] === undefined) {
            this.__modulesInstances[moduleName] = new Jodit.modules[moduleName](this, options);
        }

        return this.__modulesInstances[moduleName];
    }

    /**
     * Create instance of Jodit
     * @constructor
     *
     * @param {HTMLInputElement | string} element Selector or HTMLElement
     * @param {object} options Editor's options
     */
    constructor(element: HTMLInputElement|string, options?: object) {
        super();

        this.buffer = {}; // empty new object for every Jodit instance

        this.events = new EventsNative();

        const OptionsDefault: any = function () {};
        OptionsDefault.prototype = Jodit.defaultOptions;

        this.options = <Config>(new OptionsDefault());

        if (options !== undefined && typeof options === 'object') {
            Object.keys(options).forEach((key: string) => {
                if (typeof (<any>Jodit.defaultOptions)[key] === 'object' && !Array.isArray((<any>Jodit.defaultOptions)[key])) {
                    (<any>this.options)[key] = extend(true, {}, (<any>Jodit.defaultOptions)[key], (<any>options)[key]);
                } else {
                    (<any>this.options)[key] = (<any>options)[key];
                }
            })
        }

        // in iframe it can be changed
        this.editorDocument = this.options.ownerDocument;
        this.editorWindow = this.options.ownerWindow;
        this.ownerDocument = this.options.ownerDocument;
        this.ownerWindow = this.options.ownerWindow;

        if (typeof element === 'string') {
            try {
                this.element = <HTMLInputElement>this.ownerDocument.querySelector(element);
            } catch (e) {
                throw new Error('String "' + element + '" should be valid HTML selector');
            }
        } else {
            this.element = element;
        }

        // Duck checking
        if (
            !this.element ||
            typeof this.element !== "object" ||
            this.element.nodeType !== Node.ELEMENT_NODE ||
            !this.element.cloneNode
        ) {
            throw new Error('Element "' + element + '" should be string or HTMLElement instance');
        }


        this.selection = new Select(this);
        this.uploader = new Uploader(this);

        this.container = <HTMLDivElement>dom('<div class="jodit_container" />', this.ownerDocument);
        this.container.classList.add('jodit_' + (this.options.theme || 'default') + '_theme');

        if (this.options.zIndex) {
            this.container.style.zIndex = parseInt(this.options.zIndex.toString(), 10).toString();
        }

        this.workplace = <HTMLDivElement>dom('<div class="jodit_workplace" />', this.ownerDocument);
        this.progress_bar = <HTMLDivElement>dom('<div class="jodit_progress_bar"><div></div></div>', this.ownerDocument);


        this.toolbar = new Toolbar(this);
        this.toolbar.build(this.options.buttons.concat(this.options.extraButtons), this.container);

        this.container.classList.add('jodit_toolbar_size-' + (['middle', 'large', 'small'].indexOf(this.options.toolbarButtonSize.toLowerCase()) !== -1 ? this.options.toolbarButtonSize.toLowerCase() : 'middle'));

        if (this.options.textIcons) {
            this.container.classList.add('jodit_text_icons');
        }

        this.events.on(this.ownerWindow, 'resize', () => {
            if (this.events) {
                this.events.fire('resize');
            }
        });

        this.container.appendChild(this.workplace);


        this.workplace.appendChild(this.progress_bar);

        if (this.element.parentNode) {
            this.element.parentNode.insertBefore(this.container, this.element);
        }

        this.helper = helper;

        if (this.options.events) {
            each(this.options.events, (key: string, callback: Function) => {
                this.events.on(key, callback);
            });
        }

        this.id = this.element.getAttribute('id') || (new Date()).getTime().toString();

        this.initPlugines();

        this.__createEditor();

        this.setElementValue(); // syncro


        Jodit.instances[this.id] = this;

        // fix for native resizing
        try {
            this.editorDocument.execCommand('enableObjectResizing', false, false);
            this.editorDocument.execCommand('enableInlineTableEditing', false, false);
        } catch (ignore) {
            // continue regardless of error
        }


        this.setMode(this.options.defaultMode);

        if (this.options.readonly) {
            this.setReadOnly(true);
        }

        this.events.fire('afterInit', this);
    }

    __plugins: {[key: string]: JoditPlugin} = {};

    initPlugines() {
        const disable: string[] = Array.isArray(this.options.disablePlugins) ? this.options.disablePlugins.map((pluginName: string) => {
            return pluginName.toLowerCase();
        }) : this.options.disablePlugins.toLowerCase().split(/[\s,]+/);

        Object.keys(Jodit.plugins).forEach((key: string) => {
            if (disable.indexOf(key.toLowerCase()) === -1) {
                this.__plugins[key] = new Jodit.plugins[key](this);
            }
        })
    }


    private __defaultStyleDisplayKey = 'data-jodit-default-style-display';

    /**
     * Create main DIV element and replace source textarea
     *
     * @private
     */
    private __createEditor() {
        if (this.events.fire('createEditor') !== false) {
            this.editor = <HTMLDivElement>dom(`<div class="jodit_wysiwyg" contenteditable aria-disabled="false" tabindex="${this.options.tabIndex}"></div>`, this.ownerDocument);
            // fix fo ie
            this.workplace.appendChild(this.ownerDocument.createTextNode("\n"));
            this.workplace.appendChild(this.editor);
            this.workplace.appendChild(this.ownerDocument.createTextNode("\n"));
        }

        if (this.options.editorCssClass) {
            this.editor.classList.add(this.options.editorCssClass);
        }

        // proxy events
        this.events
            .on(this.editor, 'keydown keyup keypress mousedown mouseup mousepress paste resize touchstart touchend focus blur', (event: Event): false | void => {
                if (this.options.readonly) {
                    return;
                }
                if (this.events && this.events.fire) {
                    if (this.events.fire(event.type, event) === false) {
                        return false;
                    }

                    this.setEditorValue();
                }
            });

        if (this.options.spellcheck) {
            this.editor.setAttribute('spellcheck', "true");
        }

        // direction
        if (this.options.direction) {
            this.editor.style.direction = this.options.direction.toLowerCase() === 'rtl' ? 'rtl' : 'ltr';
        }


        // hide source element
        if (this.element.style.display) {
            this.element.setAttribute(this.__defaultStyleDisplayKey, this.element.style.display)
        }

        this.element.style.display = 'none';

        if (this.options.triggerChangeEvent) {
            this.events.on('change', debounce(() => {
                this.events.fire(this.element, 'change');
            }, this.options.observer.timeout))
        }
    }

    /**
     * Jodit's Destructor. Remove editor, and return source input
     */
    destruct() {
        /**
         * Triggered before {@link events:beforeDestruct|beforeDestruct} executed. If returned false method stopped
         *
         * @event beforeDestruct
         * @example
         * ```javascript
         * var editor = new Jodit("#redactor");
         * editor.events.on('beforeDestruct', function (data) {
         *     return false;
         * });
         * ```
         */
        if (this.events.fire('beforeDestruct') === false) {
            return;
        }


        if (!this.editor) {
            return;
        }

        if (this.element.hasAttribute(this.__defaultStyleDisplayKey)) {
            this.element.style.display = this.element.getAttribute(this.__defaultStyleDisplayKey);
            this.element.removeAttribute(this.__defaultStyleDisplayKey);
        } else {
            this.element.style.display = '';
        }

        if (this.element.hasAttribute('style') && !this.element.getAttribute('style')) {
            this.element.removeAttribute('style');
        }

        Object.keys(this.__plugins).forEach((pluginName: string) => {
            if (this.__plugins !== undefined && this.__plugins[pluginName] !== undefined && this.__plugins[pluginName].destruct !== undefined && typeof this.__plugins[pluginName].destruct === 'function') {
                // @ts-ignore: Object is possibly 'undefined'
                this.__plugins[pluginName].destruct();
            }
            delete this.__plugins[pluginName];
        });

        this.components.forEach((component: Component) => {
            if (component.destruct !== undefined && typeof component.destruct === 'function') {
                component.destruct();
            }
        });

        delete this['selection'];

        this.events.off(this.events);
        this.events.off(this.ownerWindow);
        this.events.off(this.element);
        this.events.off(this.editor);

        delete this['events'];

        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        delete this['container'];
        delete this['editor'];
        delete this['workplace'];

        delete Jodit.instances[this.id];
    }

    /**
     * Return source element value
     */
    getElementValue() {
        return this.element.value !== undefined ? this.element.value : this.element.innerHTML;
    }

    /**
     * Return editor value
     */
    getEditorValue(): string {
        /**
         * Triggered before {@link Jodit~getEditorValue|getEditorValue} executed. If returned not undefined getEditorValue will return this value
         *
         * @event beforeGetValueFromEditor
         * @example
         * ```javascript
         * var editor = new Jodit("#redactor");
         * editor.events.on('beforeGetValueFromEditor', function () {
         *     return editor.editor.innerHTML.replace(/a/g, 'b');
         * });
         * ```
         */
        let value: string;

        value = this.events.fire('beforeGetValueFromEditor');
        if (value !== undefined) {
            return value;
        }

        if (this.editor) {
            value =  this.editor.innerHTML
                .replace(consts.INVISIBLE_SPACE_REG_EXP, '') ;
        } else {
            value = this.getElementValue();
        }


        if (value === '<br>') {
            value = '';
        }

        /**
         * Triggered after  {@link Jodit~getEditorValue|getEditorValue} got value from wysiwyg. It can change new_value.value
         *
         * @event afterGetValueFromEditor
         * @param string new_value
         * @example
         * ```javascript
         * var editor = new Jodit("#redactor");
         * editor.events.on('afterGetValueFromEditor', function (new_value) {
         *     new_value.value = new_value.value.replace('a', 'b');
         * });
         * ```
         */
        const new_value: {value: string} = {value};

        this.events.fire('afterGetValueFromEditor', new_value);

        return new_value.value;
    }

    /**
     * Set source element value and if set sync fill editor value
     * When method was called without arguments - it is simple way to synchronize element to editor
     *
     * @param {string} [value]
     */
    setElementValue(value?: string) {
        if (typeof value !== 'string' && value !== undefined) {
            throw new Error('value must be string');
        }

        if (value !== undefined) {
            if (this.element.value !== undefined) {
                this.element.value = value;
            } else {
                this.element.innerHTML = value;
            }
        } else {
            value = this.getElementValue();
        }

        if (value !== this.getEditorValue()) {
            this.setEditorValue(value);
        }
    }

    /**
     * Set editor html value and if set sync fill source element value
     * When method was called without arguments - it is simple way to synchronize editor to element
     *
     * @param {string} [value]
     */
    setEditorValue(value ?: string) {
        if (!this.editor) {
            return; // try change value before init or after destruct
        }

        if (typeof value !== 'string' && value !== undefined) {
            throw new Error('value must be string');
        }

        if (value !== undefined && this.editor.innerHTML !== value) {
            this.editor.innerHTML = value;
        }

        const old_value: string = this.getElementValue(),
            new_value: string = this.getEditorValue();

        if (old_value !== new_value) {
            this.setElementValue(new_value);
            this.events.fire('change', old_value, new_value);
        }
    }

    private commands: {[key: string]: Array<CommandType | Function>} = {};

    private execCustomCommands(commandName: string, second = false, third: null|any = null): false | void {
        commandName = commandName.toLowerCase();

        if (this.commands[commandName] !== undefined) {
            let result: any = void(0);

            this.commands[commandName].forEach((command: CommandType | Function) => {
                let callback: Function;
                if (typeof command === 'function') {
                    callback = command;
                } else {
                    callback = command.exec;
                }
                let resultCurrent: any = callback.call(this, commandName, second, third);
                if (resultCurrent !== undefined) {
                    result = resultCurrent;
                }
            });

            return result;
        }
    }

    /**
     * Register custom handler for command
     *
     * @example
     * ```javascript
     * var jodit = new Jodit('#editor);
     *
     * jodit.setEditorValue('test test test');
     *
     * jodit.registerCommand('replaceString', function (command, needle, replace) {
     *      var value = this.getEditorValue();
     *      this.setEditorValue(value.replace(needle, replace));
     *      return false; // stop execute native command
     * });
     *
     * jodit.execCommand('replaceString', 'test', 'stop');
     *
     * console.log(jodit.getEditorValue()); // stop test test
     *
     * // and you can add hotkeys for command
     * jodit.registerCommand('replaceString', {
     *    hotkeys: 'ctrl+r',
     *    exec: function (command, needle, replace) {
     *     var value = this.getEditorValue();
     *     this.setEditorValue(value.replace(needle, replace));
     *    }
     * });
     *
     * ```
     *
     * @param {string} commandName
     * @param {CommandType | Function} command
     */
    registerCommand(commandNameOriginal: string, command: CommandType | Function) {
        const commandName: string = commandNameOriginal.toLowerCase();

        if (this.commands[commandName] === undefined) {
            this.commands[commandName] = [];
        }
        this.commands[commandName].push(command);

        if (typeof command !== 'function') {
            const hotkeys: string | string[] | void = this.options.commandToHotkeys[commandName] || this.options.commandToHotkeys[commandNameOriginal] || command.hotkeys;

            if (hotkeys) {
                this.events.on(asArray(hotkeys).map((hotkey: string) => hotkey + '.hotkey').join(' '), () => {
                    return this.execCommand(commandName); // because need `beforeCommand`
                });
            }
        }
    }

    /**
     * Execute command editor
     *
     * @method execCommand
     * @param  {string} command command. It supports all the {@link https://developer.mozilla.org/ru/docs/Web/API/Document/execCommand#commands} and a number of its own
     * for example applyCSSProperty. Comand fontSize receives the second parameter px, formatBlock and can take several options
     * @param  {boolean|string|int} second
     * @param  {boolean|string|int} third
     * @fires beforeCommand
     * @fires afterCommand
     * @example
     * ```javascript
     * this.execCommand('fontSize', 12); // sets the size of 12 px
     * this.execCommand('underline');
     * this.execCommand('formatBlock', 'p'); // will be inserted paragraph
     * ```
     */
    execCommand(command: string, second: any = false, third: null|any = null) {
        if (this.options.readonly) {
            return;
        }

        let result: any;
        command = command.toLowerCase();
        /**
         * Called before any command
         * @event beforeCommand
         * @param {string} command Command name in lowercase
         * @param {string} second The second parameter for the command
         * @param {string} third The third option is for the team
         * @example
         * ```javascript
         * parent.events.on('beforeCommand', function (command) {
         *  if (command === 'justifyCenter') {
         *      var p = parent.getDocument().createElement('p')
         *      parent.selection.insertNode(p)
         *      parent.selection.moveCursorTo(p);
         *      p.style.textAlign = 'justyfy';
         *      return false; // break execute native command
         *  }
         * })
         * ```
         */

        result = this.events.fire('beforeCommand', command, second, third);

        if (result !== false) {
            result = this.execCustomCommands(command, second, third);
        }

        if (result !== false) {
            this.selection.focus();
            switch (command) {
                case 'selectall':
                    this.selection.select(this.editor, true);
                    break;
                default:
                    try {
                        result = this.editorDocument.execCommand(command, second, third);
                    } catch (e) {

                    }
            }
        }

        /**
         * It called after any command
         * @event afterCommand
         * @param {string} command name command
         * @param {*} second The second parameter for the command
         * @param {*} third The third option is for the team
         */
        this.events.fire('afterCommand', command, second, third);

        this.setEditorValue();// synchrony

        return result;
    }

    private __whoLocked: string|false = '';

    /**
     * Disable selecting
     */
    lock(name: string) {
        this.__whoLocked = name;
        this.editor.classList.add('jodit_disabled');
    }

    /**
     * Enable selecting
     */
    unlock() {
        this.__whoLocked = '';
        this.editor.classList.remove('jodit_disabled');
    }

    isLocked = (): boolean => {
        return this.__whoLocked !== '';
    };
    isLockedNotBy = (name: string): boolean => {
        return this.isLocked() && this.__whoLocked !== name;
    };

    mode: number = consts.MODE_WYSIWYG;
    getMode(): number {
        return this.mode;
    }

    /**
     * Return current real work mode. When editor in MODE_SOURCE or MODE_WYSIWYG it will return them, but then editor in MODE_SPLIT it will return MODE_SOURCE if Textarea(CodeMirror) focused or MODE_WYSIWYG otherwise
     *
     * @example
     * ```javascript
     * var editor = new Jodit('#editor');
     * console.log(editor.getRealMode());
     * ```
     */
    getRealMode(): number {
        return this.getMode() !== consts.MODE_SPLIT ? this.getMode() : (Dom.isOrContains(this.editor, this.ownerDocument.activeElement) || Dom.isOrContains(this.toolbar.container, this.ownerDocument.activeElement)) ? consts.MODE_WYSIWYG : consts.MODE_SOURCE;
    }

    /**
     * Set current mode
     *
     * @fired beforeSetMode
     * @fired afterSetMode
     */
    setMode(mode: number) {
        const data = {
                mode
            },
            modeClasses = ['jodit_wysiwyg_mode', 'jodit_source_mode', 'jodit_split_mode'];

        /**
         * Triggered before {@link Jodit~setMode|setMode} executed. If returned false method stopped
         * @event beforeSetMode
         * @param {Object} data PlainObject {mode: {string}} In handler you can change data.mode
         * @example
         * ```javascript
         * var editor = new Jodit("#redactor");
         * editor.events.on('beforeSetMode', function (data) {
         *     data.mode = Jodit.MODE_SOURCE; // not respond to the mode change. Always make the source code mode
         * });
         * ```
         */
        if (this.events.fire('beforeSetMode', data) === false) {
            return;
        }

        this.mode = inArray(data.mode, [consts.MODE_SOURCE, consts.MODE_WYSIWYG, consts.MODE_SPLIT]) ? data.mode : consts.MODE_WYSIWYG;

        if (this.options.saveModeInCookie) {
            Cookie.set('jodit_default_mode', this.mode, 31);
        }

        modeClasses.forEach((className) => {
            this.container.classList.remove(className);
        });
        this.container.classList.add(modeClasses[this.mode - 1]);

        /**
         * Triggered after {@link Jodit~setMode|setMode} executed
         * @event afterSetMode
         * @example
         * ```javascript
         * var editor = new Jodit("#redactor");
         * editor.events.on('afterSetMode', function () {
         *     editor.setEditorValue(''); // clear editor's value after change mode
         * });
         * ```
         */
        this.events.fire('afterSetMode');
    }

    /**
     * Toggle editor mode WYSIWYG to TEXTAREA(CodeMirror) to SPLIT(WYSIWYG and TEXTAREA) to again WYSIWYG
     *
     * @example
     * ```javascript
     * var editor = new Jodit('#editor');
     * editor.toggleMode();
     * ```
     */
    toggleMode () {
        let mode: number = this.getMode();
        if (inArray(mode + 1, [consts.MODE_SOURCE, consts.MODE_WYSIWYG, this.options.useSplitMode ? consts.MODE_SPLIT : 9])) {
            mode += 1;
        } else {
            mode = consts.MODE_WYSIWYG;
        }

        this.setMode(mode);
    }

    /**
     * Internationalization method. Uses Jodit.lang object
     *
     * @param {string} key Some text
     * @param {string[]} params Some text
     * @return {string}
     * @example
     * ```javascript
     * var editor = new Jodit("#redactor", {
     *      langusage: 'ru'
     * });
     * console.log(editor.i18n('Cancel')) //Отмена;
     *
     * Jodit.defaultOptions.language = 'ru';
     * console.log(Jodit.prototype.i18n('Cancel')) //Отмена
     *
     * Jodit.lang.cs = {
     *    Cancel: 'Zrušit'
     * };
     * Jodit.defaultOptions.language = 'cs';
     * console.log(Jodit.prototype.i18n('Cancel')) //Zrušit
     *
     * Jodit.lang.cs = {
     *    'Hello world': 'Hello \s Good \s'
     * };
     * Jodit.defaultOptions.language = 'cs';
     * console.log(Jodit.prototype.i18n('Hello world', 'mr.Perkins', 'day')) //Hello mr.Perkins Good day
     * ```
     */
    i18n (key: string, ...params: Array<string|number>): string {
        if (this.options !== undefined && this.options.debugLanguage) {
            return '{' + key + '}';
        }

        let store,
            parse = (value: string): string => sprintf.apply(this, [value].concat(<string[]>params));

        if (this.options !== undefined && Jodit.lang[defaultLanguage(this.options.language)] !== undefined) {
            store = Jodit.lang[defaultLanguage(this.options.language)];
        } else {
            if (Jodit.lang[defaultLanguage(Jodit.defaultOptions.language)] !== undefined) {
                store = Jodit.lang[defaultLanguage(Jodit.defaultOptions.language)];
            } else {
                store = Jodit.lang.en;
            }
        }

        if (this.options !== undefined && (<any>this.options.i18n)[defaultLanguage(this.options.language)] !== undefined && (<any>this.options.i18n)[defaultLanguage(this.options.language)][key]) {
            return parse((<any>this.options.i18n)[defaultLanguage(this.options.language)][key]);
        }

        if (typeof store[key] === 'string' && store[key]) {
            return parse(store[key]);
        }

        if (typeof Jodit.lang.en[key] === 'string' && Jodit.lang.en[key]) {
            return parse(Jodit.lang.en[key]);
        }

        return parse(key);
    }

    /**
     * Return current version
     *
     * @method getVersion
     * @return {string}
     */
    getVersion = () => {
        return this.version;
    };

    /**
     * Switch on/off the editor into the read-only state.
     * When in readonly, the user is not able to change the editor content, but can still use some editor functions (show source code, print content, or seach).
     * This function firing the `readonly` event.
     *
     * @param {boolean} isReadOnly
     */
    setReadOnly(isReadOnly: boolean) {
        this.options.readonly = isReadOnly;

        if (isReadOnly) {
            this.editor && this.editor.removeAttribute('contenteditable');
        } else {
            this.editor && this.editor.setAttribute('contenteditable', 'true');
        }

        this.events && this.events.fire('readonly', isReadOnly);
    }

    /**
     * Return true if editor in read-only mode
     */
    getReadOnly(): boolean {
        return this.options.readonly;
    }
}


