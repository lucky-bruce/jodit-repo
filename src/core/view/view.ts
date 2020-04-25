/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import {
	IComponent,
	IDictionary,
	IProgressBar
} from '../../types';
import { IViewBased, IViewOptions } from '../../types';
import { Component } from '../component';
import { Panel } from './panel';
import { Storage } from '../storage';
import { error, i18n, isFunction } from '../helpers';
import { BASE_PATH } from '../constants';
import { ProgressBar } from '../../modules';
import { modules } from '../global';

export abstract class View extends Panel implements IViewBased {
	jodit!: IViewBased;

	/**
	 * @property{string} ID attribute for source element, id add {id}_editor it's editor's id
	 */
	id: string;

	components: Set<IComponent> = new Set();

	/**
	 * Get path for loading extra staff
	 */
	get basePath(): string {
		if (this.o.basePath) {
			return this.o.basePath;
		}

		return BASE_PATH;
	}

	readonly version: string = appVersion; // from webpack.config.js

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

	/**
	 * Internationalization method. Uses Jodit.lang object
	 *
	 * @param text
	 * @param params
	 */
	i18n(text: string, ...params: Array<string | number>): string {
		return i18n(text, params, this?.j?.options || this?.options);
	}

	/**
	 * @override
	 * @param isFullSize
	 */
	toggleFullSize(isFullSize?: boolean) {
		super.toggleFullSize(isFullSize);

		if (this.events) {
			this.e.fire('toggleFullSize', isFullSize);
		}
	}

	/**
	 * Make one instance of one module
	 *
	 * @param moduleName
	 * @param options
	 */
	getInstance<T = Component>(moduleName: string, options?: object): T {
		const module = modules[moduleName] as any,
			mi = this.__modulesInstances;

		if (!isFunction(module)) {
			throw error('Need real module name');
		}

		if (mi[moduleName] === undefined) {
			mi[moduleName] = new module(this.j || this, options);
		}

		return mi[moduleName] as any;
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
		this.buffer = jodit?.buffer || Storage.makeStorage();
	}

	destruct() {
		if (this.isDestructed) {
			return;
		}

		super.destruct();
	}
}
