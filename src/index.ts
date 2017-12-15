/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * License https://xdsoft.net/jodit/license.html
 * Copyright 2013-2017 Valeriy Chupurnov xdsoft.net
 */

import "./styles/bundle.less";
import './polyfills';
import * as consts from './constants';
import Toolbar from './modules/Toolbar';
import Jodit from './Jodit';
import './Config';
import * as Plugins from "./plugins/index";
import * as Modules from "./modules/index";
import * as Languages from "./langs/index";
import * as Icons from "./styles/icons/index";

// copy constants in Jodit
Object.keys(consts).forEach((key) => {
    Jodit[key] = consts[key];
});

// Icons
Object.keys(Icons).forEach(function (key) {
    Toolbar.icons[key.replace('_', '-')] = Icons[key];
});

// Modules
Object.keys(Modules).filter((key) => key !== '__esModule').forEach((key) => {
    Jodit.modules[key] = Modules[key];
});

//Plugins
Object.keys(Plugins).filter((key) => key !== '__esModule').forEach((key) => {
    Jodit.plugins[key] = Plugins[key];
});

// Languages
Object.keys(Languages).filter((key) => key !== '__esModule').forEach((key) => {
    Jodit.lang[key] = Languages[key];
});

export = Jodit;