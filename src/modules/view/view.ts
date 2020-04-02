/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { IAsync, IComponent, IDictionary, IEventsNative, IProgressBar } from '../../types';
import { IViewBased, IViewOptions } from '../../types/view';
import { Component } from '../component';
import { EventsNative } from '../../core/events/eventsNative';
import { Panel } from './panel';
import { Storage } from '../../core/storage';
import { error, i18n, isFunction } from '../../core/helpers';
import { BASE_PATH } from '../../core/constants';
import { Async } from '../../core/async';
import { ProgressBar } from '../progressBar';
import { modules } from '../../core/global';

declare let appVersion: string;

export class View extends Panel implements IViewBased {
	/**
	 * @property{string} ID attribute for source element, id add {id}_editor it's editor's id
	 */
	id: string;

	markOwner(elm: HTMLElement): void {
		elm.setAttribute('data-editor_id', this.id);
	}


	workplace!: HTMLDivElement;

	components: Set<IComponent> = new Set();

	/**
	 * Get path for loading extra staff
	 */
	get basePath(): string {
		if (this.options.basePath) {
			return this.options.basePath;
		}

		return BASE_PATH;
	}

	version: string = appVersion; // from webpack.config.js

	private __modulesInstances: IDictionary<Component> = {};

	/**
	 * Return default timeout period in milliseconds for some debounce or throttle functions.
	 * By default return {observer.timeout} options
	 *
	 * @return {number}
	 */
	get defaultTimeout(): number {
		return 100;
	}

	/**
	 * Some extra data inside editor
	 *
	 * @type {{}}
	 * @see copyformat plugin
	 */
	buffer = Storage.makeStorage();

	/**
	 * progress_bar Progress bar
	 */
	progressbar: IProgressBar = new ProgressBar(this);

	options!: IViewOptions;

	events: IEventsNative;
	async : IAsync = new Async();

	/**
	 * Internationalization method. Uses Jodit.lang object
	 *
	 * @param text
	 * @param params
	 */
	i18n(text: string, ...params: Array<string | number>): string {
		return i18n(text, params, this?.jodit?.options || this?.options);
	}

	/**
	 * @override
	 * @param isFullSize
	 */
	toggleFullSize(isFullSize?: boolean) {
		super.toggleFullSize(isFullSize);

		if (this.events) {
			this.events.fire('toggleFullSize', isFullSize);
		}
	}

	getInstance<T = Component>(moduleName: string, options?: object): T {
		const module = modules[moduleName] as any;

		if (isFunction(module)) {
			throw error('Need real module name');
		}

		if (this.__modulesInstances[moduleName] === undefined) {
			this.__modulesInstances[moduleName] = new module(
				this.jodit || this,
				options
			);
		}

		return this.__modulesInstances[moduleName] as any;
	}

	/**
	 * Return current version
	 *
	 * @method getVersion
	 * @return {string}
	 */
	getVersion = (): string => {
		return this.version;
	};

	/** @override */
	protected initOptions(options?: IViewOptions): void {
		super.initOptions({
			extraButtons: [],
			textIcons: false,
			removeButtons: [],
			zIndex: 100002,
			fullsize: false,
			showTooltip: true,
			useNativeTooltip: false,
			buttons: [],
			globalFullsize: true,
			...options
		});
	}

	constructor(jodit?: IViewBased, options?: IViewOptions) {
		super(jodit, options);

		this.id = jodit?.id || new Date().getTime().toString();

		this.jodit = jodit || this;

		this.events = jodit?.events || new EventsNative(this.ownerDocument);

		this.buffer = jodit?.buffer || Storage.makeStorage();
	}

	destruct() {
		if (this.isDestructed) {
			return;
		}

		if (this.async) {
			this.async.destruct();
			delete this.async;
		}

		if (this.events) {
			this.events.destruct();
			delete this.events;
		}

		super.destruct();
	}
}
