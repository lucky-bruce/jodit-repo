describe('Test interface', function() {
    appendTestArea('table_editor_interface', true);
    describe('Toolbar', function () {
        describe('Popups', function () {
            describe('Click on some link', function () {
                describe('in the left side of editor', function () {
                    it('Should open inline popup with float by left editor side', function () {
                        var editor = new Jodit('#table_editor_interface', {
                        });

                        editor.setEditorValue('asas <a href="#">test</a>')

                        simulateEvent('mousedown', 0, editor.editor.querySelector('a'))

                        var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                        expect(popup && popup.style.display === '').to.be.equal(true);

                        var positionPopup = offset(popup);
                        var positionContainer = offset(editor.container);

                        expect(true).to.be.equal(positionPopup.left >= positionContainer.left);
                    });
                });
            });
            describe('Click on some button with defined popup field', function () {
                it('Should open popup in toolbar', function () {
                    var editor = new Jodit('#table_editor_interface', {
                        disablePlugins: 'mobile'
                    });
                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-video'))

                    var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                    expect(popup && popup.style.display === 'block').to.equal(true);
                });
                describe('in the left side', function () {
                    it('Should open popup in toolbar with float by left editor side', function () {
                        var editor = new Jodit('#table_editor_interface', {
                            buttons: ['video'],
                            disablePlugins: 'mobile'
                        });

                        simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-video'))

                        var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                        expect(popup && popup.style.display === 'block').to.be.equal(true);

                        var positionPopup = offset(popup);
                        var positionContainer = offset(editor.container);

                        expect(true).to.be.equal(positionPopup.left >= positionContainer.left);
                    });
                });
                describe('in the right side', function () {
                    it('Should open popup in toolbar with float by left editor side', function () {
                        var editor = new Jodit('#table_editor_interface', {
                            width: 300,
                            buttons: [
                                'video',
                                'video',
                                'video',
                                'video',
                                'video',
                                'video',
                                'video',
                                'video',
                                'video',
                            ],
                            disablePlugins: 'mobile'
                        });

                        simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-video:last-child'))

                        var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                        expect(popup && popup.style.display === 'block').to.be.equal(true);

                        var positionPopup = offset(popup);
                        var positionContainer = offset(editor.container);

                        expect(true).to.be.equal(positionPopup.left + positionPopup.width <= positionContainer.left + positionContainer.width);
                        // getBox().style.width = 'auto';
                    });
                });
            });
            getBox().style.width = 'auto';
            it('Open and close popap after clicking in another place', function() {
                var editor = new Jodit('#table_editor_interface', {
                    disablePlugins: 'mobile'
                });

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-video'))

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                expect(popup && popup.style.display === 'block').to.equal(true);

                simulateEvent('mousedown', 0, window)

                expect(popup && popup.style.display === 'none').to.equal(true);
            });
            it('Open list in toolbar', function() {
                var editor = new Jodit('#table_editor_interface');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_with_dropdownlist'))

                var list = editor.container.querySelector('.jodit_dropdownlist');

                expect(list && list.style.display === 'block').to.equal(true);
            });
            it('Open and close list after clicking in another place', function() {
                var editor = new Jodit('#table_editor_interface');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_with_dropdownlist'))

                var list = editor.container.querySelector('.jodit_dropdownlist');

                expect(list && list.style.display === 'block').to.equal(true);

                simulateEvent('mousedown', 0, window)

                expect(list && list.style.display === 'none').to.equal(true);
            });
            it('Open colorpicker set background and color. After this click in another any place. White when popap will be closed. Open again and remove all styles.', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('text2text')

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();

                range.setStart(editor.editor.firstChild, 3)
                range.setEnd(editor.editor.firstChild, 6)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-brush'))

                var list = editor.container.querySelector('.jodit_toolbar_popup');

                expect(list.style.display).to.equal('block');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-brush [data-color="#F9CB9C"]'))

                expect(editor.getEditorValue()).to.equal('tex<span style="background-color: rgb(249, 203, 156);">t2t</span>ext');

                // simulateEvent('mousedown', 0, editor.editor)

                expect(list.style.display).to.equal('none');

                range.selectNodeContents(editor.editor.querySelector('span'))
                // range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-brush'))
                expect(list.style.display).to.equal('block');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-brush .jodit_colorpicker > a > svg'))
                expect(editor.getEditorValue()).to.equal('text2text');
            });
            it('Open format list set H1 for current cursor position. Restore selection after that', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('text2text')

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();

                range.setStart(editor.editor.firstChild, 3)
                range.setEnd(editor.editor.firstChild, 6)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-paragraph'))

                var list = editor.container.querySelector('.jodit_dropdownlist');

                expect(list.style.display).to.equal('block');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-paragraph .jodit_toolbar_btn.jodit_toolbar_btn-h1'))

                expect(editor.getEditorValue()).to.equal('<h1>text2text</h1>');

                simulateEvent('mousedown', 0, editor.editor)

                expect(list.style.display).to.equal('none');

                editor.selection.insertNode(editor.editorDocument.createTextNode(' a '))

                expect(editor.getEditorValue()).to.equal('<h1>tex a ext</h1>');
            });
            it('Open image dialog and insert image by url.', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue(Jodit.INVISIBLE_SPACE); // IE in iframe mode can loose focus and we can not check where it paste image in start or in finish. It is only in IE

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();

                range.selectNodeContents(editor.editor)
                range.collapse(false)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image'));

                var list = editor.container.querySelector('.jodit_toolbar_popup');

                expect(list.style.display).to.equal('block');

                editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image input[name=url]').value = '' // try wrong url
                editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image input[name=text]').value = '123'
                simulateEvent('submit', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image .jodit_form'))

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn.jodit_toolbar_btn-image input[name=url].jodit_error').length).to.equal(1);

                editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image input[name=url]').value = 'http://xdsoft.net/jodit/images/artio.jpg'
                simulateEvent('submit', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image .jodit_form'))

                expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<img alt="123" src="http://xdsoft.net/jodit/images/artio.jpg">');

                simulateEvent('mousedown', 0, editor.editor)

                expect(list.style.display).to.equal('none');
            });
            it('Open video dialog and insert video by url from youtube.', function() {
                var editor = new Jodit('#table_editor_interface', {
                    disablePlugins: 'mobile'
                });

                editor.setEditorValue('')


                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-video'))

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                expect(popup.style.display).to.equal('block');

                popup.querySelector('input[name=code]').value = 'sddhttps://www.youtube.com/watch?v=7CcEYRfxUOQ' // try wrong url
                simulateEvent('submit', 0, popup.querySelector('.jodit_form'))

                expect(popup.querySelectorAll('input[name=code].jodit_error').length).to.equal(1);

                popup.querySelector('input[name=code]').value = 'https://www.youtube.com/watch?v=7CcEYRfxUOQ'
                simulateEvent('submit', 0, popup.querySelector('.jodit_form'))

                expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<iframe allowfullscreen="" frameborder="0" height="345" src="//www.youtube.com/embed/7CcEYRfxUOQ" width="400"></iframe>');

                simulateEvent('mousedown', 0, editor.editor)

                expect(popup.style.display).to.equal('none');
            });
            it('Open align list and choose Right align.', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('Test')


                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-align'))

                var list = editor.container.querySelector('.jodit_dropdownlist');

                expect(list.style.display).to.equal('block');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-align .jodit_toolbar_btn.jodit_toolbar_btn-right'))


                expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<p style="text-align:right">Test</p>');

                simulateEvent('mousedown', 0, editor.editor)

                expect(list.style.display).to.equal('none');
            });

            describe('Click inside the link', function() {
                it('Should open link popup', function() {
                    var editor = new Jodit('#table_editor_interface', {
                        observer: {
                            timeout: 0
                        }
                    });

                    editor.setEditorValue('test test <a href="#">test</a>')


                    simulateEvent('mousedown', 0, editor.editor.querySelector('a'))

                    var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline.active[data-editor_id=table_editor_interface]');

                    expect(popup).to.be.not.equal(null);
                });
                describe('Click on pencil', function() {
                    it('Should open edit link popup', function() {
                        var editor = new Jodit('#table_editor_interface', {
                            observer: {
                                timeout: 0
                            }
                        });

                        editor.setEditorValue('test test <a href="#">test</a>')


                        simulateEvent('mousedown', 0, editor.editor.querySelector('a'))
                        var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline[data-editor_id=table_editor_interface]');

                        expect(popup).to.be.not.equal(null);
                        expect(popup.classList.contains('active')).to.be.equal(true);

                        var pencil = popup.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link a');
                        expect(pencil).to.be.not.equal(null);

                        simulateEvent('mousedown', 0, pencil);
                        var subpopup = popup.querySelector('.jodit_toolbar_popup');

                        expect(subpopup).to.be.not.equal(null);
                        expect(subpopup.style.display).to.be.equal('block');
                        expect(popup.classList.contains('active')).to.be.equal(true);
                    });
                });
            });
            describe('Open LINK insert dialog and insert new link', function() {
                it('Should insert new link', function() {
                    var editor = new Jodit('#table_editor_interface', {
                        observer: {
                            timeout: 0
                        }
                    });

                    editor.setEditorValue('')


                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link'))

                    var list = editor.container.querySelector('.jodit_toolbar_popup');

                    expect(list.style.display).to.equal('block');
                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_unlink_button').style.display).to.equal('none');

                    editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=url]').value = '' // try wrong url
                    editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=text]').value = '123'
                    simulateEvent('submit', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_form'))

                    expect(editor.container.querySelectorAll('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=url].jodit_error').length).to.equal(1);

                    editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=url]').value = 'http://xdsoft.net/jodit/images/artio.jpg'
                    simulateEvent('submit', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_form'))

                    expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<a href="http://xdsoft.net/jodit/images/artio.jpg">123</a>');

                    simulateEvent('mousedown', 0, editor.editor);


                    expect(list.style.display).to.equal('none');
                });
                it('Should restore source text after user clicked on Unlink button', function() {
                    var editor = new Jodit('#table_editor_interface', {
                        observer: {
                            timeout: 0
                        }
                    });

                    editor.setEditorValue('<a target="_blank" rel="nofollow" href="#test">test</a>')

                    var sel = editor.editorWindow.getSelection(),
                        range = editor.editorDocument.createRange();

                    range.selectNode(editor.editor.firstChild);
                    sel.removeAllRanges();
                    sel.addRange(range);


                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link'))

                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=url]').value).to.equal('#test');
                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=target]').checked).to.equal(true);
                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link input[name=nofollow]').checked).to.equal(true);
                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_unlink_button').style.display).to.be.not.equal('none');
                    expect(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_link_insert_button').innerHTML).to.equal(editor.i18n('Update'));

                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-link .jodit_unlink_button'))

                    expect(sortAtrtibutes(editor.getEditorValue())).to.equal('test')
                });
            });
            describe('Create table', function () {
                describe('Mouse move', function () {
                    it('Should highlight cells in table-creator', function() {
                        var editor = new Jodit('#table_editor_interface', {
                            observer: {
                                timeout: 0
                            }
                        });
                        simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-table'))

                        var list = editor.container.querySelector('.jodit_toolbar_popup');

                        expect(list.style.display).to.equal('block');

                        simulateEvent('mousemove', 0, list.querySelectorAll('div')[14])
                        expect(list.querySelectorAll('div.hovered').length).to.equal(10);
                    });
                });
            });
        });
        describe('Buttons', function () {
            describe('Text mode', function () {
                it('Should create buttons with text', function () {
                    var editor = new Jodit('#table_editor_interface', {
                        textIcons: true
                    });
                    expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source').length).to.be.equal(1);
                    expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source svg').length).to.be.equal(0);
                });
            });
            it('Remove default buttons functionality', function() {
                var editor = new Jodit('#table_editor_interface');
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source').length).to.equal(1);
                editor.destruct();
                editor = new Jodit('#table_editor_interface', {
                    removeButtons: ['source']
                });
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source').length).to.equal(0);
            });
            it('Add own button', function() {
                var editor = new Jodit('#table_editor_interface', {
                    disablePlugins: ['mobile'],
                    buttons: Jodit.defaultOptions.buttons.concat([
                        {
                            name: 'insertDate',
                            iconURL: 'http://xdsoft.net/jodit/images/logo.png',
                            exec: function (editor) {
                                editor.selection.insertHTML((new Date('2016/03/16')).toDateString());
                            }
                        }
                    ])
                });
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-insertDate').length).to.equal(1);

                editor.setEditorValue('');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-insertDate'))
                expect(editor.getEditorValue()).to.equal('Wed Mar 16 2016');
            });
            it('When cursor inside STRONG tag, Bold button should be selected', function() {
                var editor = new Jodit('#table_editor_interface', {
                    observer: {
                        timeout: 0 // disable delay
                    }
                });

                editor.setEditorValue('<strong>test</strong><em>test2</em><i>test3</i><b>test3</b>');

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();

                range.setStart(editor.editor.firstChild.firstChild, 2)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.editor)

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_active').length).to.equal(1);


                range.setStart(editor.editor.firstChild.nextSibling.firstChild, 2)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.editor)

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_active').length).to.equal(0);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-italic.jodit_active').length).to.equal(1);

                range.setStart(editor.editor.firstChild.nextSibling.nextSibling.firstChild, 2)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.editor)

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_active').length).to.equal(0);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-italic.jodit_active').length).to.equal(1);


                range.setStart(editor.editor.firstChild.nextSibling.nextSibling.nextSibling.firstChild, 2)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.editor)

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_active').length).to.equal(1);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-italic.jodit_active').length).to.equal(0);
            });
            it('Disable buttons which can not be used in that mode', function() {
                var editor = new Jodit('#table_editor_interface', {
                    observer: {
                        timeout: 0 // disable delay
                    }
                });

                editor.setEditorValue('<strong>test</strong><em>test2</em><i>test3</i><b>test3</b>');

                editor.setMode(Jodit.MODE_SOURCE);

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_disabled').length).to.equal(1);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source.jodit_disabled').length).to.equal(0);

                editor.setMode(Jodit.MODE_WYSIWYG);

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_disabled').length).to.equal(0);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-source.jodit_disabled').length).to.equal(0);

            });

            it('When cursor inside SPAN tag with style="font-weight: bold" or style="font-weight: 700", Bold button should be selected', function() {
                var editor = new Jodit('#table_editor_interface', {
                    observer: {
                        timeout: 0 // disable delay
                    }
                });

                editor.setEditorValue('<span style="font-weight: bold">test</span>');

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();
                range.setStart(editor.editor.firstChild.firstChild, 2)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.editor)

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-bold.jodit_active').length).to.equal(1);
            });
            it('Check Redo Undo functionality', function() {
                table_editor_interface.value = 'top';
                var editor = new Jodit('#table_editor_interface', {
                    observer: {
                        timeout: 0 // disable delay
                    }
                });

                editor.setEditorValue('Test');

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-redo.jodit_disabled').length).to.equal(1);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-undo.jodit_disabled').length).to.equal(0);

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-undo'))

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-redo.jodit_disabled').length).to.equal(0);
                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-undo.jodit_disabled').length).to.equal(1);
                expect(editor.getEditorValue()).to.equal('top');
            });
            it('Full size button', function() {
                var editor = new Jodit('#table_editor_interface', {
                    observer: {
                        timeout: 0 // disable delay
                    }
                });

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-fullsize'));

                var node = editor.container.parentNode;
                while (node && !(node instanceof Document)) {
                    expect(node.classList.contains('jodit_fullsize_box')).to.equal(true);
                    node = node.parentNode;
                }
            });
            it('Should add extra buttons', function() {
                var editor = new Jodit('#table_editor_interface', {
                    extraButtons: [
                        {
                            name: 'adddate',
                            exec: function (editor) {
                                var a = editor.editorDocument.createTextNode('111');
                                editor.selection.insertNode(a);
                            }
                        }
                    ]
                });

                editor.setEditorValue('')

                expect(editor.container.querySelectorAll('.jodit_toolbar_btn-adddate').length).to.equal(1);

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-adddate'));

                expect(editor.getEditorValue()).to.equal('111');
            });
            describe('Add button', function () {
                it('Should create buttons in toolbar', function () {
                    var editor = new Jodit('#table_editor_interface', {
                        buttons: ['indent', 'outdent', 'bold', 'customxxx']
                    });

                    expect(null).to.be.not.equal(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-indent'));
                    expect(null).to.be.not.equal(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-outdent'));
                    expect(null).to.be.not.equal(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-bold'));
                    expect(null).to.be.not.equal(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-customxxx'));
                    expect(null).to.be.equal(editor.container.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-source'));
                });
            });
            describe('Button Bold', function () {
                it('Should reactivate Bold button after second click and move cursor out of Strong element', function () {
                    var editor = new Jodit('#table_editor_interface', {
                        buttons: ['bold']
                    });

                    editor.setEditorValue('<p>test</p>')
                    editor.selection.setCursorAfter(editor.editor.firstChild.firstChild);

                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-bold'));
                    editor.selection.insertHTML('text');
                    simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-bold'));
                    editor.selection.insertHTML('text');

                    expect(editor.getEditorValue()).to.equal('<p>test<strong>text</strong>text</p>');
                });
            });
            describe('Active button', function () {
                it('Should not be activated then element has default style', function () {
                    var editor = new Jodit('#table_editor_interface', {
                        observer: {
                            timeout: 0
                        }
                    });
                    editor.setEditorValue('<p>test<strong>bold</strong></p>')
                    var p = editor.editor.firstChild;
                    editor.selection.setCursorAfter(p.firstChild);

                    simulateEvent('mousedown', 0, p);

                    var bold = editor.container.querySelector('.jodit_toolbar_btn-bold');
                    var align = editor.container.querySelector('.jodit_toolbar_btn-align');

                    expect(false).to.equal(align.classList.contains('jodit_active'));
                    expect(false).to.equal(bold.classList.contains('jodit_active'));

                    editor.selection.setCursorIn(p.querySelector('strong').firstChild);
                    simulateEvent('mousedown', 0, p);
                    // editor.selection.insertHTML('ddd');
                    expect(false).to.equal(align.classList.contains('jodit_active'));
                    expect(true).to.equal(bold.classList.contains('jodit_active'));

                    p.style.textAlign = 'right';
                    simulateEvent('mousedown', 0, p);
                    expect(true).to.equal(align.classList.contains('jodit_active'));
                    expect(true).to.equal(bold.classList.contains('jodit_active'));
                })
                describe('Fontsize button', function () {
                    it('Should be activated then element has no default font-size', function () {
                        var editor = new Jodit('#table_editor_interface', {
                            observer: {
                                timeout: 0
                            }
                        });
                        editor.setEditorValue('<p>test<span style="font-size: 12px">bold</span></p>')

                        var p = editor.editor.firstChild;
                        var fontsize = editor.container.querySelector('.jodit_toolbar_btn-fontsize');

                        editor.selection.setCursorAfter(p.firstChild);
                        simulateEvent('mousedown', 0, p);
                        expect(false).to.equal(fontsize.classList.contains('jodit_active'));

                        editor.selection.setCursorIn(p.lastChild);
                        simulateEvent('mousedown', 0, p);
                        expect(true).to.equal(fontsize.classList.contains('jodit_active'));
                    });
                });
                describe('Color button', function () {
                    it('Should be activated then element has some color', function () {
                        var editor = new Jodit('#table_editor_interface', {
                            observer: {
                                timeout: 0
                            }
                        });
                        editor.setEditorValue('<p>test<span style="color: #ccc">bold</span></p>')

                        var p = editor.editor.firstChild;
                        var brush = editor.container.querySelector('.jodit_toolbar_btn-brush');
                        var brushIcon = editor.container.querySelector('.jodit_toolbar_btn-brush svg');

                        editor.selection.setCursorAfter(p.firstChild);
                        simulateEvent('mousedown', 0, p);
                        expect(false).to.equal(brush.classList.contains('jodit_active'));
                        expect('').to.equal(brushIcon.style.fill);

                        editor.selection.setCursorIn(p.lastChild);
                        simulateEvent('mousedown', 0, p);
                        expect(true).to.equal(brush.classList.contains('jodit_active'));
                        expect('rgb(204, 204, 204)').to.equal(brushIcon.style.fill);
                    });
                });
            });
        });
        describe('Commands', function () {
            it('Click on Source button should change current mode', function() {
                var editor = new Jodit('#table_editor_interface');

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-source'))

                expect(editor.getMode()).to.equal(Jodit.MODE_SOURCE);
            });
            it('Click on Bold button should wrap current selection in <strong>', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('Text to text')

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();
                range.setStart(editor.editor.firstChild, 3)
                range.setEnd(editor.editor.firstChild, 10)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-bold'))

                expect(editor.getEditorValue()).to.equal('Tex<strong>t to te</strong>xt');
            });
            it('Click on Italic button when selection is collapsed should create new <em> element and set cursor into it', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('Text to text')

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();
                range.setStart(editor.editor.firstChild, 0)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-italic'))

                editor.selection.insertHTML('test');

                expect(editor.getEditorValue()).to.equal('<em>test</em>Text to text');
            });
            it('Click on unordered list button when selection is collapsed should wrap current box in  new <ul><li> element', function() {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<p>Text to text</p>')

                var sel = editor.editorWindow.getSelection(), range = editor.editorDocument.createRange();

                range.setStart(editor.editor.firstChild.firstChild, 5)
                range.collapse(true)
                sel.removeAllRanges();
                sel.addRange(range)

                simulateEvent('mousedown', 0, editor.container.querySelector('.jodit_toolbar_btn-ul'))

                editor.selection.insertHTML('test ');

                expect(editor.getEditorValue()).to.equal('<ul><li>Text test to text</li></ul>');
            });
        });
        describe('Inline', function () {
            describe('Сlick on the image', function () {
                it('Should Open inline popup', function () {
                    var editor = new Jodit('#table_editor_interface');

                    editor.setEditorValue('<img src="/test/tests/artio.jpg"/>');

                    simulateEvent('mousedown', 0, editor.editor.querySelector('img'))

                    var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                    expect(popup && popup.classList.contains('active')).to.equal(true);
                });
                describe('and click in opened popup on pencil button', function () {
                    it('Should Open edit image dialog', function () {
                        var editor = new Jodit('#table_editor_interface');

                        editor.setEditorValue('<img src="/test/tests/artio.jpg"/>');

                        simulateEvent('mousedown', 0, editor.editor.querySelector('img'))

                        var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                        expect(popup && popup.classList.contains('active')).to.equal(true);

                        simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-pencil'))

                        var dialog = editor.ownerDocument.querySelector('.jodit.jodit_dialog_box.active[data-editor_id=table_editor_interface]');

                        expect(dialog).to.be.not.equal(null);
                    });
                });
            });
            it('Open inline popup after click inside the cell', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                        '<tr><td>1</td></tr>' +
                    '</table>');

                simulateEvent('mousedown', 0, editor.editor.querySelector('td'))

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);
            });
            describe('Table button', function () {
                describe('Select table cell', function () {
                    it('Should Select table cell', function () {
                        var editor = new Jodit('#table_editor_interface');

                        editor.setEditorValue('<table>' +
                            '<tr><td>2</td></tr>' +
                            '</table>');

                        var td = editor.editor.querySelector('td');

                        simulateEvent('mousedown', 0, td)

                        expect(td.hasAttribute(Jodit.JODIT_SELECTED_CELL_MARKER)).to.equal(true);

                    });
                    describe('and press brushh button', function () {
                        it('Should Select table cell and fill it in yellow', function () {
                            var editor = new Jodit('#table_editor_interface');

                            editor.setEditorValue('<table>' +
                                '<tr><td>3</td></tr>' +
                                '</table>');

                            var td = editor.editor.querySelector('td');

                            simulateEvent('mousedown', 0, td)
                            simulateEvent('mousemove', 0, td)

                            var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                            expect(popup && popup.classList.contains('active')).to.equal(true);

                            simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-brush>a'))

                            var popupColor = popup.querySelector('.jodit_toolbar_popup');
                            expect(popupColor && popupColor.style.display).to.equal('block');

                            simulateEvent('mousedown', 0, popupColor.querySelector('.jodit_colorpicker_group>a'));


                            expect(editor.helper.normalizeColor(td.style.backgroundColor)).to.equal('#000000');

                        });
                    });
                });
            });
            it('Select table cell and change it vertical align', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                    '<tr><td style="vertical-align: middle">3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)


                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-valign>a'))

                var popupColor = popup.querySelector('.jodit_dropdownlist');
                expect(popupColor && popupColor.style.display).to.equal('block');

                simulateEvent('mousedown', 0, popupColor.querySelector('li>a'));


                expect(td.style.verticalAlign).to.equal('top');

            });
            it('Select table cell and split it by vertical', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table style="width: 300px;">' +
                    '<tr><td>3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-splitv>a'))

                expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<table style="width:300px"><tbody><tr><td style="width:49.83%">3</td><td style="width:49.83%"><br></td></tr></tbody></table>');

            });
            it('Select table cell and split it by horizontal', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table style="width: 300px;">' +
                    '<tr><td>5</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-splitg>a'))

                expect(sortAtrtibutes(editor.getEditorValue())).to.equal('<table style="width:300px"><tbody><tr><td>5</td></tr><tr><td><br></td></tr></tbody></table>');

            });
            it('Select two table cells and merge then in one', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table style="width: 300px;">' +
                    '<tr><td>5</td><td>6</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)
                simulateEvent('mousemove', 0, editor.editor.querySelectorAll('td')[1])

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-merge>a'))

                expect(editor.getEditorValue()).to.equal('<table style="width: 300px;"><tbody><tr><td >5<br>6</td></tr></tbody></table>');
            });
            it('Select table cell add column before this', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                    '<tr><td>3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-addcolumn>a'))

                var popupColor = popup.querySelector('.jodit_dropdownlist');
                expect(popupColor && popupColor.style.display).to.equal('block');

                simulateEvent('mousedown', 0, popupColor.querySelector('li>a'));


                expect(editor.getEditorValue()).to.equal('<table><tbody><tr><td></td><td >3</td></tr></tbody></table>');

            });
            it('Select table cell and add row above this', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                    '<tr><td>3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelector('td');

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-addrow>a'))

                var popupColor = popup.querySelector('.jodit_dropdownlist');
                expect(popupColor && popupColor.style.display).to.equal('block');

                simulateEvent('mousedown', 0, popupColor.querySelector('li>a'));


                expect(editor.getEditorValue()).to.equal('<table><tbody><tr><td></td></tr><tr><td >3</td></tr></tbody></table>');

            });
            it('Select table cell and remove it row', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                    '<tr><td>1</td></tr>' +
                    '<tr><td>2</td></tr>' +
                    '<tr><td>3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelectorAll('td')[1];

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-bin>a'))

                var popupColor = popup.querySelector('.jodit_dropdownlist');
                expect(popupColor && popupColor.style.display).to.equal('block');

                simulateEvent('mousedown', 0, popupColor.querySelectorAll('li>a')[1]);


                expect(editor.getEditorValue()).to.equal('<table><tbody><tr><td>1</td></tr><tr><td>3</td></tr></tbody></table>');

            });
            it('Select table cell and remove whole table should hide inline popup', function () {
                var editor = new Jodit('#table_editor_interface');

                editor.setEditorValue('<table>' +
                    '<tr><td>1</td></tr>' +
                    '<tr><td>2</td></tr>' +
                    '<tr><td>3</td></tr>' +
                    '</table>');

                var td = editor.editor.querySelectorAll('td')[1];

                simulateEvent('mousedown', 0, td)

                var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup-inline');

                expect(popup && popup.classList.contains('active')).to.equal(true);

                simulateEvent('mousedown', 0, popup.querySelector('.jodit_toolbar_btn-bin>a'))

                var popupColor = popup.querySelector('.jodit_dropdownlist');
                expect(popupColor && popupColor.style.display).to.equal('block');

                simulateEvent('mousedown', 0, popupColor.querySelectorAll('li>a')[0]);


                expect(editor.getEditorValue()).to.equal('');

                expect(popup && popup.classList.contains('active')).to.equal(false);

            });
        });
        describe('In fileBrowser', function () {
            describe('Hide buttons ', function () {
                it('should hide toolbar buttons', function() {
                    var editor = new Jodit('#table_editor_interface', {
                        filebrowser: {
                            buttons: ['list', 'tiles', 'sort'],
                            ajax: {
                                url: 'https://xdsoft.net/jodit/connector/index.php'
                            }
                        },
                    });

                    simulateEvent('mousedown', 0, editor.ownerDocument.querySelector('.jodit_toolbar_btn.jodit_toolbar_btn-image'))

                    var popup = editor.ownerDocument.querySelector('.jodit_toolbar_popup');

                    expect(popup && popup.style.display !== 'none').to.equal(true);
                    simulateEvent('mousedown', 0, popup.querySelectorAll('.jodit_tabs_buttons > a')[0]);


                    var dialog = editor.ownerDocument.querySelector('.jodit.jodit_dialog_box.active[data-editor_id=table_editor_interface]');

                    expect(dialog).to.be.not.equal(null);

                    expect(4).to.equal(dialog.querySelectorAll('.jodit_dialog_header .jodit_button').length);

                });
            });
        });
    });
    after(function() {
         table_editor_interface.parentNode.removeChild(table_editor_interface);
    });
    afterEach(function () {
        removeStuff();
        var i, keys = Object.keys(Jodit.instances);
        for (i = 0; i < keys.length; i += 1) {
             Jodit.instances[keys[i]].destruct();
        }
    });
});