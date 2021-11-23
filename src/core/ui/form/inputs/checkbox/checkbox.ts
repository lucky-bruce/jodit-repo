/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2021 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import './checkbox.less';

import type { IViewBased, IUICheckBox } from '../../../../../types';
import { UIInput } from '../input/input';
import { component, watch, hook } from '../../../../decorators';

@component
export class UICheckbox extends UIInput implements IUICheckBox {
	/** @override */
	override className(): string {
		return 'UICheckbox';
	}


	/** @override */
	static override defaultState: IUICheckBox['state'] = {
		...UIInput.defaultState,
		checked: false
	};

	/** @override */
	override state: IUICheckBox['state'] = { ...UICheckbox.defaultState };

	/** @override */
	protected override render(): HTMLElement {
		return this.j.c.element('label', {
			className: this.componentName
		});
	}

	/** @override **/
	constructor(jodit: IViewBased, options: Partial<IUICheckBox['state']>) {
		super(jodit, { ...options, type: 'checkbox' });
		Object.assign(this.state, options);
	}

	@watch('state.checked')
	@hook('ready')
	protected onChangeChecked(): void {
		this.value = this.state.checked.toString();
		(<HTMLInputElement>this.nativeInput).checked = this.state.checked;

		this.setMod('checked', this.state.checked);
	}

	@watch('nativeInput:change')
	protected onChangeNativeCheckBox(): void {
		this.state.checked = (<HTMLInputElement>this.nativeInput).checked;
	}
}
