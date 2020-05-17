/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */
import './resizer.less';

import { Config } from '../../config';
import * as consts from '../../core/constants';
import { IS_IE } from '../../core/constants';
import { IBound } from '../../types';
import { Dom } from '../../core/dom';
import {
	$$,
	attr,
	css,
	offset,
	innerWidth,
	markOwner
} from '../../core/helpers';
import { IJodit } from '../../types';
import { Plugin } from '../../core/plugin';

/**
 * The module creates a supporting frame for resizing of the elements img and table
 * @module Resizer
 * @params {Object} parent Jodit main object
 */
/**
 * @property{boolean} useIframeResizer=true Use true frame for editing iframe size
 */
declare module '../../config' {
	interface Config {
		useIframeResizer: boolean;
		useTableResizer: boolean;
		useImageResizer: boolean;

		resizer: {
			showSize: boolean;
			hideSizeTimeout: number;
			min_width: number;
			min_height: number;
		};
	}
}
Config.prototype.useIframeResizer = true;

/**
 * @property{boolean} useTableResizer=true Use true frame for editing table size
 */
Config.prototype.useTableResizer = true;

/**
 * @property{boolean} useImageResizer=true Use true image editing frame size
 */
Config.prototype.useImageResizer = true;

/**
 * @property {object} resizer
 * @property {int} resizer.min_width=10 The minimum width for the editable element
 * @property {int} resizer.min_height=10 The minimum height for the item being edited
 * @property {boolean} resizer.showSize=true Show size
 */
Config.prototype.resizer = {
	showSize: true,
	hideSizeTimeout: 1000,
	min_width: 10,
	min_height: 10
};

const keyBInd = '__jodit-resizer_binded';

/**
 * Resize table and img
 * @param {Jodit} editor
 */
export class resizer extends Plugin {
	private LOCK_KEY = 'resizer';
	private handle!: HTMLElement;
	private element: null | HTMLElement = null;

	private isResized: boolean = false;
	private isShown: boolean = false;

	private start_x: number = 0;
	private start_y: number = 0;
	private width: number = 0;
	private height: number = 0;
	private ratio: number = 0;

	private rect = this.j.c.fromHTML(
		`<div class="jodit-resizer">
				<i class="jodit-resizer-topleft"></i>
				<i class="jodit-resizer-topright"></i>
				<i class="jodit-resizer-bottomright"></i>
				<i class="jodit-resizer-bottomleft"></i>
				<span>100x100</span>
			</div>`
	);

	private sizeViewer: HTMLSpanElement = this.rect.getElementsByTagName(
		'span'
	)[0];

	protected afterInit(editor: IJodit): void {
		$$('i', this.rect).forEach((resizeHandle: HTMLElement) => {
			editor.e.on(
				resizeHandle,
				'mousedown.resizer touchstart.resizer',
				this.onClickHandle.bind(this, resizeHandle)
			);
		});

		editor.e
			.on('readonly', (isReadOnly: boolean) => {
				if (isReadOnly) {
					this.hide();
				}
			})
			.on('afterInit changePlace', this.addEventListeners.bind(this))
			.on(
				'afterGetValueFromEditor.resizer',
				(data: { value: string }) => {
					const rgx = /<jodit[^>]+data-jodit_iframe_wrapper[^>]+>(.*?<iframe[^>]+>[\s\n\r]*<\/iframe>.*?)<\/jodit>/gi;

					if (rgx.test(data.value)) {
						data.value = data.value.replace(rgx, '$1');
					}
				}
			)
			.on('hideResizer', this.hide)
			.on(
				'change afterInit afterSetMode',
				editor.async.debounce(
					this.onChangeEditor.bind(this),
					editor.defaultTimeout
				)
			);

		this.addEventListeners();
		this.onChangeEditor();
	}

	private addEventListeners() {
		const editor = this.j;

		editor.e
			.off(editor.editor, '.resizer')
			.off(editor.ow, '.resizer')
			.on(editor.editor, 'keydown.resizer', (e: KeyboardEvent) => {
				if (
					this.isShown &&
					e.key === consts.KEY_DELETE &&
					this.element &&
					!Dom.isTag(this.element, 'table')
				) {
					this.onDelete(e);
				}
			})
			.on(editor.ow, 'resize.resizer', this.updateSize)
			.on(
				editor.ow,
				'mouseup.resizer keydown.resizer touchend.resizer',
				this.onClickOutside
			)
			.on([editor.ow, editor.editor], 'scroll.resizer', () => {
				if (this.isShown && !this.isResized) {
					this.hide();
				}
			});
	}

	private onClickHandle(
		resizeHandle: HTMLElement,
		e: MouseEvent
	): false | void {
		if (!this.element || !this.element.parentNode) {
			this.hide();
			return false;
		}

		this.handle = resizeHandle;

		e.preventDefault();
		e.stopImmediatePropagation();

		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		this.ratio = this.width / this.height;

		this.isResized = true;

		this.start_x = e.clientX;
		this.start_y = e.clientY;

		this.j.e.fire('hidePopup');

		this.j.lock(this.LOCK_KEY);

		this.j.e.on(
			this.j.ow,
			'mousemove.resizer touchmove.resizer',
			this.onResize
		);
	}

	private onResize = (e: MouseEvent) => {
		if (this.isResized) {
			const diff_x = e.clientX - this.start_x,
				diff_y = e.clientY - this.start_y;

			if (!this.element) {
				return;
			}

			const className = this.handle.className;

			let new_w = 0,
				new_h = 0;

			if (Dom.isTag(this.element, 'img')) {
				if (diff_x) {
					new_w =
						this.width +
						(className.match(/left/) ? -1 : 1) * diff_x;
					new_h = Math.round(new_w / this.ratio);
				} else {
					new_h =
						this.height +
						(className.match(/top/) ? -1 : 1) * diff_y;
					new_w = Math.round(new_h * this.ratio);
				}

				if (new_w > innerWidth(this.j.editor, this.j.ow)) {
					new_w = innerWidth(this.j.editor, this.j.ow);
					new_h = Math.round(new_w / this.ratio);
				}
			} else {
				new_w =
					this.width + (className.match(/left/) ? -1 : 1) * diff_x;
				new_h =
					this.height + (className.match(/top/) ? -1 : 1) * diff_y;
			}

			if (new_w > this.j.o.resizer.min_width) {
				if (new_w < (this.rect.parentNode as HTMLElement).offsetWidth) {
					css(this.element, 'width', new_w);
				} else {
					css(this.element, 'width', '100%');
				}
			}

			if (new_h > this.j.o.resizer.min_height) {
				css(this.element, 'height', new_h);
			}

			this.updateSize();

			this.showSizeViewer(
				this.element.offsetWidth,
				this.element.offsetHeight
			);

			e.stopImmediatePropagation();
		}
	};

	private onClickOutside = (e: MouseEvent) => {
		if (this.isShown) {
			if (this.isResized) {
				this.j.unlock();
				this.isResized = false;
				this.j.setEditorValue();
				e.stopImmediatePropagation();

				this.j.e.off(
					this.j.ow,
					'mousemove.resizer touchmove.resizer',
					this.onResize
				);
			} else {
				this.hide();
			}
		}
	};

	private onDelete(e: KeyboardEvent) {
		if (!this.element) {
			return;
		}

		if (this.element.tagName !== 'JODIT') {
			this.j.selection.select(this.element);
		} else {
			Dom.safeRemove(this.element);
			this.hide();
			e.preventDefault();
		}
	}

	private onChangeEditor() {
		const editor = this.j;

		if (this.isShown) {
			if (!this.element || !this.element.parentNode) {
				this.hide();
			} else {
				this.updateSize();
			}
		}

		if (!editor.isDestructed) {
			$$('img, table, iframe', editor.editor).forEach(
				(elm: HTMLElement) => {
					if (editor.getMode() === consts.MODE_SOURCE) {
						return;
					}

					if (
						!(elm as any)[keyBInd] &&
						((Dom.isTag(elm, 'iframe') &&
							editor.o.useIframeResizer) ||
							(Dom.isTag(elm, 'img') &&
								editor.o.useImageResizer) ||
							(Dom.isTag(elm, 'table') &&
								editor.o.useTableResizer))
					) {
						(elm as any)[keyBInd] = true;
						this.bind(elm);
					}
				}
			);
		}
	}

	/**
	 * Bind an edit element toWYSIWYG element
	 * @param {HTMLElement} element The element that you want toWYSIWYG add a function toWYSIWYG resize
	 */
	private bind(element: HTMLElement) {
		let wrapper: HTMLElement;

		if (Dom.isTag(element, 'iframe')) {
			const iframe = element;

			if (
				attr(element.parentNode as HTMLElement, '-jodit_iframe_wrapper')
			) {
				element = element.parentNode as HTMLElement;
			} else {
				wrapper = this.j.createInside.fromHTML(
					'<jodit ' +
						'data-jodit-temp="1" ' +
						'contenteditable="false" ' +
						'draggable="true" ' +
						'data-jodit_iframe_wrapper="1"' +
						'></jodit>'
				);

				css(wrapper, {
					display:
						element.style.display === 'inline-block'
							? 'inline-block'
							: 'block',
					width: element.offsetWidth,
					height: element.offsetHeight
				});

				if (element.parentNode) {
					element.parentNode.insertBefore(wrapper, element);
				}

				wrapper.appendChild(element);

				element = wrapper;
			}

			this.j.e
				.off(element, 'mousedown.select touchstart.select')
				.on(element, 'mousedown.select touchstart.select', () => {
					this.j.selection.select(element);
				})
				.off(element, 'changesize')
				.on(element, 'changesize', () => {
					iframe.setAttribute('width', element.offsetWidth + 'px');
					iframe.setAttribute('height', element.offsetHeight + 'px');
				});
		}

		this.j.e
			.on(element, 'dragstart', this.hide)
			.on(element, 'mousedown', (event: MouseEvent) => {
				// for IE don't show native resizer
				if (IS_IE && Dom.isTag(element, 'img')) {
					event.preventDefault();
				}
			})
			.on(element, 'click', () => this.onClickElement(element));
	}

	private onClickElement = (element: HTMLElement) => {
		if (this.element !== element || !this.isShown) {
			this.element = element;

			this.show();

			if (Dom.isTag(this.element, 'img') && !this.element.complete) {
				this.j.e.on(this.element, 'load', this.updateSize);
			}
		}
	};

	private updateSize = () => {
		if (this.isInDestruct || !this.isShown) {
			return;
		}

		if (this.element && this.rect) {
			const workplacePosition: IBound = offset(
					(this.rect.parentNode ||
						this.j.od.documentElement) as HTMLElement,
					this.j,
					this.j.od,
					true
				),
				pos: IBound = offset(
					this.element,
					this.j,
					this.j.editorDocument
				),
				left: number = parseInt(this.rect.style.left || '0', 10),
				top: number = parseInt(this.rect.style.top || '0', 10),
				w: number = this.rect.offsetWidth,
				h: number = this.rect.offsetHeight;

			// 1 - because need move border higher and toWYSIWYG the left than the picture
			// 2 - in box-sizing: border-box mode width is real width indifferent by border-width.

			const newTop: number = pos.top - 1 - workplacePosition.top,
				newLeft: number = pos.left - 1 - workplacePosition.left;

			if (
				top !== newTop ||
				left !== newLeft ||
				w !== this.element.offsetWidth ||
				h !== this.element.offsetHeight
			) {
				css(this.rect, {
					top: newTop,
					left: newLeft,
					width: this.element.offsetWidth,
					height: this.element.offsetHeight
				});

				if (this.j.events) {
					this.j.e.fire(this.element, 'changesize');

					// check for first init. Ex. inlinePopup hides when it was fired
					if (!isNaN(left)) {
						this.j.e.fire('resize');
					}
				}
			}
		}
	};

	private showSizeViewer(w: number, h: number) {
		if (!this.j.o.resizer.showSize) {
			return;
		}

		if (
			w < this.sizeViewer.offsetWidth ||
			h < this.sizeViewer.offsetHeight
		) {
			this.hideSizeViewer();
			return;
		}

		this.sizeViewer.style.opacity = '1';
		this.sizeViewer.textContent = `${w} x ${h}`;

		this.j.async.setTimeout(this.hideSizeViewer, {
			timeout: this.j.o.resizer.hideSizeTimeout,
			label: 'hideSizeViewer'
		});
	}

	/**
	 * Show resizer
	 */
	private show() {
		if (this.j.o.readonly || this.isShown) {
			return;
		}

		this.isShown = true;

		if (!this.rect.parentNode) {
			markOwner(this.j, this.rect);
			this.j.workplace.appendChild(this.rect);
		}

		if (this.j.isFullSize) {
			this.rect.style.zIndex = css(this.j.container, 'zIndex').toString();
		}

		this.updateSize();
	}

	/**
	 * Hide resizer
	 */
	private hide = () => {
		this.isResized = false;
		this.isShown = false;
		this.element = null;
		Dom.safeRemove(this.rect);
	};

	private hideSizeViewer = () => {
		this.sizeViewer.style.opacity = '0';
	};

	protected beforeDestruct(jodit: IJodit): void {
		this.hide();

		this.j.e.off(this.j.ow, '.resizer').off('.resizer');
	}
}
