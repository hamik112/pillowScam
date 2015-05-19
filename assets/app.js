
TOOLS = {};

/**
 * returns boolean indicating if the class exists on the element or not
 * @param {string} classNameToBeChecked
 * @returns {boolean}
 */
HTMLElement.prototype._hasClass = function (classNameToBeChecked) {
	if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
		var regex = new RegExp(classNameToBeChecked);
		return regex.test(this.className);
	}
	else {
		return this.classList.contains(classNameToBeChecked);
	}
};

/**
 * checks first to see if class already exists on element
 * @param {string} classNameToBeAdded
 * @returns {string} this.className
 */
HTMLElement.prototype._addClass = function (classNameToBeAdded) {
	if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
		if (!this._hasClass(classNameToBeAdded)) {
			this.className += (' ' + classNameToBeAdded);
		}
		return this.className;
	}
	else {
		this.classList.add(classNameToBeAdded);
		return this.className;
	}
};

/**
 * if class exists on element, it removes all instances of it. if it doesn't exist on element, it adds it.
 * @param {string} classNameToBeToggled
 * @returns {string} this.className - returns the class list as a space-separated string
 *
 */
HTMLElement.prototype._toggleClass = function (classNameToBeToggled) {
	if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
		if (this._hasClass(classNameToBeToggled)) {
			this._removeClass(classNameToBeToggled);
		}
		else {
			this.className += (' ' + classNameToBeToggled);
		}
		return this.className;
	}
	else {
		this.classList.toggle(classNameToBeToggled);
		return this.className;
	}
};

/**
 * if class exists on element it will remove all instances of it. Tries to use classList.remove, defaults to using className for older browsers
 * @param {string} classNameToBeRemoved -
 * @returns {string} this.className - returns the class list as a space-separated string
 */
HTMLElement.prototype._removeClass = function (classNameToBeRemoved) {
	if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
		var classList, newClassName;
		classList = this.className.split(/\s+/);
		newClassName = [];
		for (var i = 0, len = classList.length; i < len; i++) {
			if (classList[i] !== classNameToBeRemoved) {
				newClassName.push(classList[i]);
			}
		}
		this.className = newClassName.join(' ');
		return this.className;
	}
	else {
		this.classList.remove(classNameToBeRemoved);
		return this.className;
	}
};

/**
 * similar to jQuery $.data(), will accept one argument or two for retrieving or setting the attribute value respectively
 * @param {string} attributeName
 * @param {string} attributeValue
 * @returns {string} returns the new value of the data- attribute that it changed, or null if no such attribute exists and hasn't been set
 */
HTMLElement.prototype._data = function (attributeName, attributeValue) {
	var returnValue, attributeArray;
	returnValue = null;
	attributeArray = this.attributes;
	if (attributeValue) {
		this.setAttribute('data-' + attributeName, attributeValue);
	}
	if ((attributeArray.length > 0) && attributeArray['data-' + attributeName]) {
		returnValue = attributeArray['data-' + attributeName].value;
	}
	return returnValue;
};

/**
 * General all-purpose selector, similar to jQuery().
 * @param {string} selector - CSS selector
 * @param {string} [context]  - CSS selector
 * @returns {Array} results - ALWAYS RETURNS AN ARRAY EVEN IF YOU PASS AN ID!!! IF YOU WANT A SINGLE ELEMENT USE window._mono()
 * @private
 */
window._query = function (selector, context) {
	// RegExp.test() is used to filter out complicated selectors, which return TRUE, and are then passed to
	// querySelectorAll(). examples of "simple" and "complicated" selectors are below
	//
	// for CLASS: /^\.[\w\-\.]+$/
	// should return TRUE: ['.klass', '.klass.klass1.klass2']
	// should return FALSE: ['.klass1 .klass2', '.klass#id', '.klass[attr]', '.klass div', '.klass1.klass2#id']
	//
	//
	// for ID: /^#[\w\-]+$/
	// should return TRUE: ['#id', '#id_id']
	// should return FALSE: ['#id.klass', '#id#id', '#id div', '#id[attr]']
	//
	//
	// for TAG_NAME: /^[\w\-]+$/
	// should return TRUE: ['div', 'fake-element']
	// should return FALSE: ['div.klass', 'a#id', 'div span', 'div[data-type=value]']
	//
	// combine all three into one RegExp: CLASS || ID || TAG_NAME
	var wholeShebang = /(^\.[\w\-\.]+$)|(^#[\w\-]+$)|(^[\w\-]+$)/;
	var doc = window.document, periodRe = /\./g, slice = [].slice;
	if (!context || !context.querySelectorAll) {
		context = window.document;
	}
	try {
		if (wholeShebang.test(selector)) {
			switch (selector.charAt(0)) {
				case '#':
					var result = doc.getElementById(selector.substr(1));
					return (result ? [result] : result);
				case '.':
					return slice.call(context.getElementsByClassName(selector.substr(1).replace(periodRe, ' ')));
				default:
					return slice.call(context.getElementsByTagName(selector));
			}
		}
		return slice.call(context.querySelectorAll(selector));
	}
	catch (e) {
		TOOLS.log({'msg': '_query() failed', 'with context': context, 'with selector': selector, 'error': e});
		return [];
	}
};

/**
 * this is a wrapper for window._query() that returns only the first result
 * @param {string} selector - CSS selector
 * @param {string} [context]  - CSS selector
 * @returns {HTMLElement} results
 * @private
 */

window._mono = function(selector, context) {
	var results;
	results = window._query(selector, context);
	if (results && results.slice) {
		results = results[0];
	}
	return results;
};



TOOLS._trigger = function(eventName, eventParams) {
	/**
	 * Generates a custom event, similar to jQuery.trigger
	 * @param {string} eventName - string denoting the name of the event, e.g: 'buttonHidden', 'elementScrolled', etc..
	 * @param {object} [eventParams] - extra information to be passed with the event and accessed in the event listener, e.g: event.target, event.id, etc..
	 * @constructor
	 */
	function CustomTrigger(eventName, eventParams) {
		this.event = null;
		// check to see if correct arguments were passed
		if (eventName && (typeof eventName === 'string')) {
			// use the DOM API to create an Event object
			this.event = document.createEvent('Event');
			// assign the eventName to this new Event object
			this.event.initEvent(eventName, true, true);
			// assign any additional event parameters to this Event object
			if (eventParams && (typeof eventParams === 'object')) {
				var keys = Object.keys(eventParams);
				for (var i = 0, len = keys.length; i < len; i++) {
					this.event[keys[i]] = eventParams[keys[i]];
				}
			}
		};
		// define a method for firing the event, always defined on the document object
		this.fire = function() {
			document.dispatchEvent(this.event);
		};
	};
	return new CustomTrigger(eventName, eventParams);
};

function Hook() {
	this._processed = false;
	this._set = function() {
		if (!this._processed) {
			this._processed = true;
		}
	};
	this._set();
}

function HookController() {
	this.process = function(key, $el) {
		var instance;
		instance = APP.modules[key]($el);
		instance.init();
	};
	this.check = function(key) {
		var results;
		results = _query(key);
		if (results && results.length > 0) {
			for (var i = 0, len = results.length; i < len; i++) {
				this.process(key, results[i]);
			}
		}
	};
	this.run = function() {
		var keys;
		keys = Object.keys(APP.modules);
		for (var i = 0, len = keys.length; i < len; i++) {
			if (APP.modules.hasOwnProperty(keys[i])) {
				this.check(keys[i]);
			}
		}
	};
}

APP = {
	modules: {},
	controller: new HookController(),
	run: function() {
		APP.controller.run();
	}
};

APP.modules = {
	'.js-mobileMenu': function($item) {
		function MobileMenu($elem) {
			this.$context = $elem;
			this.menuState = false;
			this.toggleMenu = function() {
				if (this.menuState) {
					this.$context._removeClass('active');
				}
				else {
					this.$context._addClass('active');
				}
				this.menuState = !this.menuState;
			};
			this.collectElements = function() {
				this.$menu = _mono('.js-mobileMenu-menu', this.$context);
				this.$openTrigger = _mono('.js-mobileMenu-openTrigger', this.$context);
				this.$closeTrigger = _mono('.js-mobileMenu-closeTrigger', this.$context);
			};
			this.attachListeners = function() {
				var _self = this;
				this.$openTrigger.addEventListener('click', this.toggleMenu.bind(_self));
				this.$closeTrigger.addEventListener('click', this.toggleMenu.bind(_self));
			};
			this.init = function() {
				this.collectElements();
				this.attachListeners();
			}
		};
		MobileMenu.prototype = new Hook();
		return new MobileMenu($item);

		/*function TabManager($elem) {
			this.$context = $elem;
			this.showLogin = function() {
				this.$loginTab._addClass('active');
				this.$resetTab._removeClass('active');
			};
			this.showPasswordReset = function() {
				this.$loginTab._removeClass('active');
				this.$resetTab._addClass('active');
			};
			this.showRegister = function() {
				var href;
				href = window.location.origin;
				window.location.assign(href + '/account/register');
			};
			this.attachListeners = function() {
				var $forgot, $register, $login, _self;
				_self = this;
				$forgot = _mono('.js-loginPage-showPasswordReset', this.$context);
				$register = _mono('.js-loginPage-showRegister', this.$context);
				$login = _mono('.js-loginPage-showLogin', this.$context);
				if ($forgot) {
					$forgot.addEventListener('click', this.showPasswordReset.bind(_self))
				}
				if ($register) {
					$register.addEventListener('click', this.showRegister.bind(_self))
				}
				if ($login) {
					$login.addEventListener('click', this.showLogin.bind(_self))
				}
			};
			this.collectElements = function() {
				this.$loginTab = _mono('.js-loginPage-loginTab', this.$context);
				this.$resetTab = _mono('.js-loginPage-resetTab', this.$context);
			};
			this.init = function() {
				this.collectElements();
				this.attachListeners();
			}
		}
		TabManager.prototype = new Hook();
		return new TabManager($el);*/
	}
};

window.onload = function() {
	APP.run();
};
