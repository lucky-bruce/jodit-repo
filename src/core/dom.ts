/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright 2013-2020 Valeriy Chupurnov https://xdsoft.net
 */

import * as consts from './constants';
import {
	HTMLTagNames,
	ICreate,
	IJodit,
	NodeCondition,
	Nullable
} from '../types';
import { css, dataBind, isArray, isFunction, isString, trim } from './helpers';

/**
 * Module for working with DOM
 */
export class Dom {
	/**
	 * Remove all content from element
	 * @param node
	 */
	static detach(node: Node): void {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}

	/**
	 * Wrap all inline siblings
	 *
	 * @param current
	 * @param tag
	 * @param editor
	 */
	static wrapInline(
		current: Node,
		tag: Node | HTMLTagNames,
		editor: IJodit
	): HTMLElement {
		let tmp: Nullable<Node>,
			first: Node = current,
			last: Node = current;

		const selInfo = editor.selection.save();

		let needFindNext: boolean = false;

		do {
			needFindNext = false;
			tmp = first.previousSibling;
			if (tmp && !Dom.isBlock(tmp, editor.editorWindow)) {
				needFindNext = true;
				first = tmp;
			}
		} while (needFindNext);

		do {
			needFindNext = false;
			tmp = last.nextSibling;
			if (tmp && !Dom.isBlock(tmp, editor.editorWindow)) {
				needFindNext = true;
				last = tmp;
			}
		} while (needFindNext);

		const wrapper = isString(tag) ? editor.createInside.element(tag) : tag;

		if (first.parentNode) {
			first.parentNode.insertBefore(wrapper, first);
		}

		let next: Nullable<Node> = first;

		while (next) {
			next = first.nextSibling;
			wrapper.appendChild(first);

			if (first === last || !next) {
				break;
			}

			first = next;
		}

		editor.selection.restore(selInfo);

		return wrapper as HTMLElement;
	}

	/**
	 * Wrap node inside another node
	 *
	 * @param current
	 * @param tag
	 * @param editor
	 */
	static wrap<K extends HTMLTagNames>(
		current: Node,
		tag: K,
		editor: IJodit
	): Nullable<HTMLElementTagNameMap[K]>;
	static wrap(
		current: Node,
		tag: HTMLElement | HTMLTagNames,
		editor: IJodit
	): Nullable<HTMLElement> {
		const selInfo = editor.selection.save();

		const wrapper = isString(tag) ? editor.createInside.element(tag) : tag;

		if (!current.parentNode) {
			return null;
		}

		current.parentNode.insertBefore(wrapper, current);

		wrapper.appendChild(current);

		editor.selection.restore(selInfo);

		return wrapper;
	}

	/**
	 * Remove parent of node and insert this node instead that parent
	 * @param node
	 */
	static unwrap(node: Node): void {
		const parent = node.parentNode;

		if (parent) {
			while (node.firstChild) {
				parent.insertBefore(node.firstChild, node);
			}

			Dom.safeRemove(node);
		}
	}

	/**
	 * It goes through all the internal elements of the node , causing a callback function
	 *
	 * @param elm elements , the internal node is necessary to sort out
	 * @param callback It called for each item found
	 * @example
	 * ```javascript
	 * Jodit.modules.Dom.each(parent.selection.current(), function (node) {
	 *  if (node.nodeType === Node.TEXT_NODE) {
	 *      node.nodeValue = node.nodeValue.replace(Jodit.INVISIBLE_SPACE_REG_EX, '') // remove all of
	 *      the text element codes invisible character
	 *  }
	 * });
	 * ```
	 */
	static each(
		elm: Node | HTMLElement,
		callback: (node: Node) => void | boolean
	): boolean {
		let node: Node | null | false = elm.firstChild;

		if (node) {
			while (node) {
				const next = Dom.next(node, Boolean, elm);

				if (callback(node) === false) {
					return false;
				}

				// inside callback - node could be removed
				if (node.parentNode && !Dom.each(node, callback)) {
					return false;
				}

				node = next;
			}
		}

		return true;
	}

	/**
	 * Replace one tag to another transfer content
	 *
	 * @param  {Node} elm The element that needs to be replaced by new
	 * @param  {string} newTagName tag name for which will change `elm`
	 * @param  {boolean} withAttributes=false If true move tag's attributes
	 * @param  {boolean} notMoveContent=false false - Move content from elm to newTagName
	 * @param  {Document} [doc=document]
	 * @return {Node} Returns a new tag
	 * @example
	 * ```javascript
	 * Jodit.modules.Dom.replace(parent.editor.getElementsByTagName('span')[0], 'p');
	 * // Replace the first <span> element to the < p >
	 * ```
	 */
	static replace(
		elm: HTMLElement,
		newTagName: HTMLTagNames | HTMLElement,
		create: ICreate,
		withAttributes = false,
		notMoveContent = false
	): HTMLElement {
		const tag = isString(newTagName)
			? create.element(newTagName)
			: newTagName;

		if (!notMoveContent) {
			while (elm.firstChild) {
				tag.appendChild(elm.firstChild);
			}
		}

		if (withAttributes) {
			Array.from(elm.attributes).forEach(attr => {
				tag.setAttribute(attr.name, attr.value);
			});
		}

		if (elm.parentNode) {
			elm.parentNode.replaceChild(tag, elm);
		}

		return tag;
	}

	/**
	 * Checks whether the Node text and blank (in this case it may contain invisible auxiliary characters ,
	 * it is also empty )
	 *
	 * @param  {Node} node The element of wood to be checked
	 * @return {Boolean} true element is empty
	 */
	static isEmptyTextNode(node: Node): boolean {
		return (
			Dom.isText(node) &&
			(!node.nodeValue ||
				node.nodeValue.replace(consts.INVISIBLE_SPACE_REG_EXP, '')
					.length === 0)
		);
	}

	/**
	 * Check if element is empty
	 *
	 * @param {Node} node
	 * @param {RegExp} condNoEmptyElement
	 * @return {boolean}
	 */
	static isEmpty(
		node: Node,
		condNoEmptyElement: RegExp = /^(img|svg|canvas|input|textarea|form)$/
	): boolean {
		if (!node) {
			return true;
		}

		if (Dom.isText(node)) {
			return node.nodeValue === null || trim(node.nodeValue).length === 0;
		}

		return (
			!condNoEmptyElement.test(node.nodeName.toLowerCase()) &&
			Dom.each(node as HTMLElement, (elm: Node | null): false | void => {
				if (
					(Dom.isText(elm) &&
						elm.nodeValue !== null &&
						trim(elm.nodeValue).length !== 0) ||
					(Dom.isElement(elm) &&
						condNoEmptyElement.test(elm.nodeName.toLowerCase()))
				) {
					return false;
				}
			})
		);
	}

	/**
	 * Returns true if it is a DOM node
	 */
	static isNode(object: unknown, win?: Window): object is Node {
		if (!object) {
			return false;
		}

		if (
			typeof win === 'object' &&
			win &&
			(typeof (win as any).Node === 'function' ||
				typeof (win as any).Node === 'object')
		) {
			return object instanceof (win as any).Node; // for Iframe Node !== iframe.contentWindow.Node
		}

		return false;
	}

	/**
	 *  Check if element is table cell
	 *
	 * @param elm
	 * @param win
	 */
	static isCell(elm: unknown, win: Window): elm is HTMLTableCellElement {
		return Dom.isNode(elm, win) && /^(td|th)$/i.test(elm.nodeName);
	}

	/**
	 * Check is element is Image element
	 *
	 * @param {Node} elm
	 * @param {Window} win
	 * @return {boolean}
	 */
	static isImage(elm: unknown, win: Window): elm is HTMLImageElement {
		return (
			Dom.isNode(elm, win) &&
			/^(img|svg|picture|canvas)$/i.test(elm.nodeName)
		);
	}

	/**
	 * Check the `node` is a block element
	 *
	 * @param node
	 * @param win
	 */
	static isBlock(node: unknown, win: Window): boolean {
		return (
			node &&
			typeof node === 'object' &&
			Dom.isNode(node, win) &&
			consts.IS_BLOCK.test((<Node>node).nodeName)
		);
	}

	/**
	 * Check if element is text node
	 * @param node
	 */
	static isText(node: Node | null | false): node is Text {
		return Boolean(node && node.nodeType === Node.TEXT_NODE);
	}

	/**
	 * Check if element is element node
	 * @param node
	 */
	static isElement(node: Node | null | false | EventTarget): node is Element {
		return Boolean(node && (node as Node).nodeType === Node.ELEMENT_NODE);
	}

	/**
	 * Check if element is HTMLelement node
	 * @param node
	 */
	static isHTMLElement(node: unknown, win: Window): node is HTMLElement {
		return (
			Dom.isNode(node, win) && node instanceof (win as any).HTMLElement
		);
	}

	/**
	 * Check element is inline block
	 * @param node
	 */
	static isInlineBlock(node: Node | null | false): boolean {
		return (
			Dom.isElement(node) &&
			!/^(BR|HR)$/i.test(node.tagName) &&
			['inline', 'inline-block'].indexOf(
				css(node as HTMLElement, 'display').toString()
			) !== -1
		);
	}

	/**
	 * It's block and it can be split
	 */
	static canSplitBlock(node: any, win: Window): boolean {
		return (
			node &&
			node instanceof (win as any).HTMLElement &&
			Dom.isBlock(node, win) &&
			!/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
			node.style !== undefined &&
			!/^(fixed|absolute)/i.test(node.style.position)
		);
	}

	/**
	 * Find previous node
	 *
	 * @param node
	 * @param condition
	 * @param root
	 * @param [withChild]
	 */
	static prev(
		node: Node,
		condition: NodeCondition,
		root: HTMLElement,
		withChild: boolean = true
	): Nullable<Node> {
		return Dom.find(
			node,
			condition,
			root,
			false,
			'previousSibling',
			withChild ? 'lastChild' : false
		);
	}

	/**
	 * Find next node what `condition(next) === true`
	 *
	 * @param node
	 * @param condition
	 * @param root
	 * @param [withChild]
	 */
	static next(
		node: Node,
		condition: NodeCondition,
		root: Node | HTMLElement,
		withChild: boolean = true
	): Nullable<Node> {
		return Dom.find(
			node,
			condition,
			root,
			undefined,
			undefined,
			withChild ? 'firstChild' : ''
		);
	}

	static prevWithClass(
		node: HTMLElement,
		className: string
	): Nullable<HTMLElement> {
		return <HTMLElement | null>Dom.prev(
			node,
			node => {
				return (
					Dom.isElement(node) && node.classList.contains(className)
				);
			},
			<HTMLElement>node.parentNode
		);
	}

	static nextWithClass(
		node: HTMLElement,
		className: string
	): Nullable<HTMLElement> {
		return Dom.next(
			node,
			elm => Dom.isElement(elm) && elm.classList.contains(className),
			<HTMLElement>node.parentNode
		) as Nullable<HTMLElement>;
	}

	/**
	 * Find next/prev node what `condition(next) === true`
	 *
	 * @param node
	 * @param condition
	 * @param root
	 * @param [recurse] check first argument
	 * @param [sibling] nextSibling or previousSibling
	 * @param [child] firstChild or lastChild
	 */
	static find(
		node: Node,
		condition: NodeCondition,
		root: HTMLElement | Node,
		recurse = false,
		sibling = 'nextSibling',
		child: string | false = 'firstChild'
	): Nullable<Node> {
		if (recurse && condition(node)) {
			return node;
		}

		let start: Nullable<Node> = node,
			next: Nullable<Node>;

		do {
			next = (start as any)[sibling];

			if (condition(next)) {
				return next ? next : null;
			}

			if (child && next && (next as any)[child]) {
				const nextOne = Dom.find(
					(next as any)[child],
					condition,
					next,
					true,
					sibling,
					child
				);

				if (nextOne) {
					return nextOne;
				}
			}

			if (!next) {
				next = start.parentNode;
			}

			start = next;
		} while (start && start !== root);

		return null;
	}

	/**
	 * Find next/previous inline element
	 *
	 * @param node
	 * @param toLeft
	 * @param root
	 */
	static findInline = (
		node: Nullable<Node>,
		toLeft: boolean,
		root: Node
	): Nullable<Node> => {
		let prevElement: Nullable<Node> = node,
			nextElement: Nullable<Node> = null;

		do {
			if (prevElement) {
				nextElement = toLeft
					? prevElement.previousSibling
					: prevElement.nextSibling;
				if (
					!nextElement &&
					prevElement.parentNode &&
					prevElement.parentNode !== root &&
					Dom.isInlineBlock(prevElement.parentNode)
				) {
					prevElement = prevElement.parentNode;
				} else {
					break;
				}
			} else {
				break;
			}
		} while (!nextElement);

		while (
			nextElement &&
			Dom.isInlineBlock(nextElement) &&
			(!toLeft ? nextElement.firstChild : nextElement.lastChild)
		) {
			nextElement = !toLeft
				? nextElement.firstChild
				: nextElement.lastChild;
		}

		return nextElement; // (nextElement !== root && Dom.isInlineBlock(nextElement)) ? nextElement : null;
	};

	/**
	 * Find next/prev node what `condition(next) === true`
	 *
	 * @param node
	 * @param condition
	 * @param root
	 * @param [sibling] nextSibling or previousSibling
	 * @param [child] firstChild or lastChild
	 */
	static findWithCurrent(
		node: Node,
		condition: NodeCondition,
		root: HTMLElement | Node,
		sibling: 'nextSibling' | 'previousSibling' = 'nextSibling',
		child: 'firstChild' | 'lastChild' = 'firstChild'
	): Nullable<Node> {
		let next: Nullable<Node> = node;

		do {
			if (condition(next)) {
				return next || null;
			}

			if (child && next && next[child]) {
				const nextOne = Dom.findWithCurrent(
					next[child] as Node,
					condition,
					next,
					sibling,
					child
				);

				if (nextOne) {
					return nextOne;
				}
			}

			while (next && !next[sibling] && next !== root) {
				next = next.parentNode;
			}

			if (next && next[sibling] && next !== root) {
				next = next[sibling];
			}
		} while (next && next !== root);

		return null;
	}

	/**
	 * It goes through all the elements in ascending order, and checks to see if they meet the predetermined condition
	 *
	 * @param node
	 * @param condition
	 * @param [root] Root element
	 */
	static up<T extends HTMLElement>(
		node: Node,
		condition: NodeCondition,
		root?: Node
	): Nullable<T> {
		let start = node;

		if (!node) {
			return null;
		}

		do {
			if (condition(start)) {
				return start as T;
			}

			if (start === root || !start.parentNode) {
				break;
			}

			start = start.parentNode;
		} while (start && start !== root);

		return null;
	}

	/**
	 * Find parent by tag name
	 *
	 * @param node
	 * @param tags
	 * @param root
	 */
	static closest<T extends HTMLElement, K extends HTMLTagNames>(
		node: Node,
		tags: K,
		root: HTMLElement
	): Nullable<HTMLElementTagNameMap[K]>;

	static closest<
		T extends HTMLElement,
		K extends keyof HTMLElementTagNameMap
	>(
		node: Node,
		tags: K[],
		root: HTMLElement
	): Nullable<HTMLElementTagNameMap[K]>;

	static closest<T extends HTMLElement>(
		node: Node,
		tags: NodeCondition,
		root: HTMLElement
	): Nullable<T>;

	static closest<T extends HTMLElement>(
		node: Node,
		tags: HTMLTagNames | HTMLTagNames[] | NodeCondition,
		root: HTMLElement
	): Nullable<T> {
		let condition: NodeCondition;

		if (isFunction(tags)) {
			condition = tags;
		} else if (isArray(tags)) {
			condition = (tag: Node | null) =>
				tag &&
				tags.includes(tag.nodeName.toLowerCase() as HTMLTagNames);
		} else {
			condition = (tag: Node | null) =>
				tag && tags === tag.nodeName.toLowerCase();
		}

		return Dom.up(node, condition, root);
	}

	/**
	 * Append new element in the start of root
	 * @param root
	 * @param newElement
	 */
	static appendChildFirst(
		root: HTMLElement,
		newElement: HTMLElement | DocumentFragment
	): void {
		const child = root.firstChild;

		if (child) {
			if (child !== newElement) {
				root.insertBefore(newElement, child);
			}
		} else {
			root.appendChild(newElement);
		}
	}

	/**
	 * Insert newElement after element
	 *
	 * @param elm
	 * @param newElement
	 */
	static after(
		elm: HTMLElement,
		newElement: HTMLElement | DocumentFragment
	): void {
		const parentNode: Node | null = elm.parentNode;

		if (!parentNode) {
			return;
		}

		if (parentNode.lastChild === elm) {
			parentNode.appendChild(newElement);
		} else {
			parentNode.insertBefore(newElement, elm.nextSibling);
		}
	}

	/**
	 * Move all content to another element
	 *
	 * @param {Node} from
	 * @param {Node} to
	 * @param {boolean} inStart
	 */
	static moveContent(from: Node, to: Node, inStart: boolean = false): void {
		const fragment: DocumentFragment = (
			from.ownerDocument || document
		).createDocumentFragment();

		Array.from(from.childNodes).forEach((node: Node) => {
			fragment.appendChild(node);
		});

		if (!inStart || !to.firstChild) {
			to.appendChild(fragment);
		} else {
			to.insertBefore(fragment, to.firstChild);
		}
	}

	/**
	 * Call callback condition function for all elements of node
	 *
	 * @param node
	 * @param condition
	 * @param prev
	 */
	static all(
		node: Node,
		condition: NodeCondition,
		prev: boolean = false
	): Nullable<Node> {
		let nodes: Node[] = node.childNodes ? Array.from(node.childNodes) : [];

		if (condition(node)) {
			return node;
		}

		if (prev) {
			nodes = nodes.reverse();
		}

		nodes.forEach(child => {
			Dom.all(child, condition, prev);
		});

		return null;
	}

	/**
	 * Check root contains child or equal child
	 *
	 * @param root
	 * @param child
	 * @param [onlyContains]
	 */
	static isOrContains(
		root: Node,
		child: Node,
		onlyContains: boolean = false
	): boolean {
		if (root === child && onlyContains) {
			return false;
		}

		return child && root && root.contains(child);
	}

	/**
	 * Safe remove element from DOM
	 * @param node
	 */
	static safeRemove(node: Node | false | null | void): void {
		node && node.parentNode && node.parentNode.removeChild(node);
	}

	/**
	 * Hide element
	 * @param node
	 */
	static hide(node: HTMLElement | null): void {
		if (!node) {
			return;
		}

		dataBind(node, '__old_display', node.style.display);
		node.style.display = 'none';
	}

	/**
	 * Show element
	 * @param node
	 */
	static show(node: Nullable<HTMLElement>): void {
		if (!node) {
			return;
		}

		const display = dataBind(node, '__old_display');

		if (node.style.display === 'none') {
			node.style.display = display || '';
		}
	}

	/**
	 * Check if element is some tag
	 *
	 * @param node
	 * @param tagName
	 */
	static isTag<K extends keyof HTMLElementTagNameMap>(
		node: Node | null | false | EventTarget,
		tagName: K | 'svg' | 'path'
	): node is HTMLElementTagNameMap[K] {
		return (
			Dom.isElement(node) &&
			node.tagName.toLowerCase() === tagName.toLowerCase()
		);
	}
}