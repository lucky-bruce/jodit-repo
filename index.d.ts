/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { Jodit as Super } from './src/jodit';

export * from './src/types';

declare global {
	const Jodit: typeof Super;
	const isProd: boolean;
	const appVersion: string;

	interface HTMLElement {
		component?: any;
	}
}

export { Jodit };

declare global {
	const appVersion: string;
	const isProd: boolean;
}
