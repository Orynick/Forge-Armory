import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res2) => function __init() {
  return fn && (res2 = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res2;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = { BASE_URL: "./", DEV: false, MODE: "test" };
  }
});

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    init_define_import_meta_env();
    var l = Symbol.for("react.element");
    var n = Symbol.for("react.portal");
    var p = Symbol.for("react.fragment");
    var q = Symbol.for("react.strict_mode");
    var r = Symbol.for("react.profiler");
    var t = Symbol.for("react.provider");
    var u = Symbol.for("react.context");
    var v = Symbol.for("react.forward_ref");
    var w = Symbol.for("react.suspense");
    var x = Symbol.for("react.memo");
    var y = Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m3 = 0; m3 < g; m3++) f[m3] = arguments[m3 + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h = false;
      if (null === a) h = true;
      else switch (k) {
        case "string":
        case "number":
          h = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h = true;
          }
      }
      if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports.Component = E;
    exports.Fragment = p;
    exports.Profiler = r;
    exports.PureComponent = G;
    exports.StrictMode = q;
    exports.Suspense = w;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.act = X;
    exports.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m3 = 0; m3 < f; m3++) g[m3] = arguments[m3 + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    exports.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports.createElement = M;
    exports.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports.isValidElement = O;
    exports.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    exports.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports.unstable_act = X;
    exports.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.3.1";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore2(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s2 = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s2 >= 1 && c >= 0 && sampleLines[s2] !== controlLines[c]) {
                c--;
              }
              for (; s2 >= 1 && c >= 0; s2--, c--) {
                if (sampleLines[s2] !== controlLines[c]) {
                  if (s2 !== 1 || c !== 1) {
                    do {
                      s2--;
                      c--;
                      if (c < 0 || sampleLines[s2] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s2].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s2 >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect;
        exports.useId = useId;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo;
        exports.useReducer = useReducer;
        exports.useRef = useRef;
        exports.useState = useState;
        exports.useSyncExternalStore = useSyncExternalStore2;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production_min();
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.min.js
var require_react_jsx_runtime_production_min = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
    "use strict";
    init_define_import_meta_env();
    var f = require_react();
    var k = Symbol.for("react.element");
    var l = Symbol.for("react.fragment");
    var m3 = Object.prototype.hasOwnProperty;
    var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m3.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    exports.Fragment = l;
    exports.jsx = q;
    exports.jsxs = q;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var React = require_react();
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var assign = Object.assign;
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s2 = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s2 >= 1 && c >= 0 && sampleLines[s2] !== controlLines[c]) {
                c--;
              }
              for (; s2 >= 1 && c >= 0; s2--, c--) {
                if (sampleLines[s2] !== controlLines[c]) {
                  if (s2 !== 1 || c !== 1) {
                    do {
                      s2--;
                      c--;
                      if (c < 0 || sampleLines[s2] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s2].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s2 >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          var prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown;
        var specialPropRefWarningShown;
        var didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function warnIfStringRefCannotBeAutoConverted(config, self) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        function defineKeyPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingKey = function() {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingKey.isReactWarning = true;
            Object.defineProperty(props, "key", {
              get: warnAboutAccessingKey,
              configurable: true
            });
          }
        }
        function defineRefPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingRef = function() {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingRef.isReactWarning = true;
            Object.defineProperty(props, "ref", {
              get: warnAboutAccessingRef,
              configurable: true
            });
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function jsxDEV(type, config, maybeKey, source, self) {
          {
            var propName;
            var props = {};
            var key = null;
            var ref = null;
            if (maybeKey !== void 0) {
              {
                checkKeyStringCoercion(maybeKey);
              }
              key = "" + maybeKey;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            if (hasValidRef(config)) {
              ref = config.ref;
              warnIfStringRefCannotBeAutoConverted(config, self);
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
            if (type && type.defaultProps) {
              var defaultProps = type.defaultProps;
              for (propName in defaultProps) {
                if (props[propName] === void 0) {
                  props[propName] = defaultProps[propName];
                }
              }
            }
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
            return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
          }
        }
        var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function isValidElement(object) {
          {
            return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
          }
        }
        function getDeclarationErrorAddendum() {
          {
            if (ReactCurrentOwner$1.current) {
              var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
              if (name) {
                return "\n\nCheck the render method of `" + name + "`.";
              }
            }
            return "";
          }
        }
        function getSourceInfoErrorAddendum(source) {
          {
            if (source !== void 0) {
              var fileName = source.fileName.replace(/^.*[\\\/]/, "");
              var lineNumber = source.lineNumber;
              return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
            }
            return "";
          }
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          {
            var info = getDeclarationErrorAddendum();
            if (!info) {
              var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
              if (parentName) {
                info = "\n\nCheck the top-level render call using <" + parentName + ">.";
              }
            }
            return info;
          }
        }
        function validateExplicitKey(element, parentType) {
          {
            if (!element._store || element._store.validated || element.key != null) {
              return;
            }
            element._store.validated = true;
            var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
            if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
              return;
            }
            ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
            var childOwner = "";
            if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
              childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
            }
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          {
            if (typeof node !== "object") {
              return;
            }
            if (isArray(node)) {
              for (var i = 0; i < node.length; i++) {
                var child = node[i];
                if (isValidElement(child)) {
                  validateExplicitKey(child, parentType);
                }
              }
            } else if (isValidElement(node)) {
              if (node._store) {
                node._store.validated = true;
              }
            } else if (node) {
              var iteratorFn = getIteratorFn(node);
              if (typeof iteratorFn === "function") {
                if (iteratorFn !== node.entries) {
                  var iterator = iteratorFn.call(node);
                  var step;
                  while (!(step = iterator.next()).done) {
                    if (isValidElement(step.value)) {
                      validateExplicitKey(step.value, parentType);
                    }
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        var didWarnAboutKeySpread = {};
        function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
          {
            var validType = isValidElementType(type);
            if (!validType) {
              var info = "";
              if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
                info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
              }
              var sourceInfo = getSourceInfoErrorAddendum(source);
              if (sourceInfo) {
                info += sourceInfo;
              } else {
                info += getDeclarationErrorAddendum();
              }
              var typeString;
              if (type === null) {
                typeString = "null";
              } else if (isArray(type)) {
                typeString = "array";
              } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
                typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
                info = " Did you accidentally export a JSX literal instead of a component?";
              } else {
                typeString = typeof type;
              }
              error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
            var element = jsxDEV(type, props, key, source, self);
            if (element == null) {
              return element;
            }
            if (validType) {
              var children = props.children;
              if (children !== void 0) {
                if (isStaticChildren) {
                  if (isArray(children)) {
                    for (var i = 0; i < children.length; i++) {
                      validateChildKeys(children[i], type);
                    }
                    if (Object.freeze) {
                      Object.freeze(children);
                    }
                  } else {
                    error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                  }
                } else {
                  validateChildKeys(children, type);
                }
              }
            }
            {
              if (hasOwnProperty.call(props, "key")) {
                var componentName = getComponentNameFromType(type);
                var keys = Object.keys(props).filter(function(k) {
                  return k !== "key";
                });
                var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
                if (!didWarnAboutKeySpread[componentName + beforeExample]) {
                  var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
                  error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
                  didWarnAboutKeySpread[componentName + beforeExample] = true;
                }
              }
            }
            if (type === REACT_FRAGMENT_TYPE) {
              validateFragmentProps(element);
            } else {
              validatePropTypes(element);
            }
            return element;
          }
        }
        function jsxWithValidationStatic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, true);
          }
        }
        function jsxWithValidationDynamic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, false);
          }
        }
        var jsx2 = jsxWithValidationDynamic;
        var jsxs = jsxWithValidationStatic;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = jsx2;
        exports.jsxs = jsxs;
      })();
    }
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_jsx_runtime_production_min();
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// tests/logique/appliquer-simulation.test.ts
init_define_import_meta_env();

// src/lib/forge/appliquerSimulation.ts
init_define_import_meta_env();
function appliquerSimulationPiece(piece, simulation) {
  if (!simulation || !piece.itemInstanceId) return piece;
  const colonnes = Object.entries(simulation);
  if (colonnes.length === 0) return piece;
  if (!piece.perksParColonne) return piece;
  const parColonne = new Map((piece.perksParColonne ?? []).map((p) => [p.socketIndex, p.hash]));
  for (const [index, choix] of colonnes) parColonne.set(Number(index), choix.effectif);
  const perksParColonne = [...parColonne.entries()].sort((a, b) => a[0] - b[0]).map(([socketIndex, hash]) => ({ socketIndex, hash }));
  return { ...piece, perksParColonne, perkHashes: perksParColonne.map((p) => p.hash), perksSimules: true, perkHashesReels: piece.perkHashes, perksParColonneReels: piece.perksParColonne, nbColonnesSimulees: colonnes.length };
}
function pieceReelle(piece) {
  if (!piece.perksSimules) return piece;
  const { perksSimules, perkHashesReels, perksParColonneReels, nbColonnesSimulees, ...reste } = piece;
  return { ...reste, perkHashes: perkHashesReels ?? piece.perkHashes, ...perksParColonneReels ? { perksParColonne: perksParColonneReels } : {} };
}
function appliquerSimulations(build2, simulations) {
  let change = false;
  const armes = build2.armes.map((a) => {
    const copie2 = appliquerSimulationPiece(a, a.itemInstanceId ? simulations.armes[a.itemInstanceId] : void 0);
    if (copie2 !== a) change = true;
    return copie2;
  });
  return change ? { ...build2, armes } : build2;
}
var nbArmesSimulees = (build2) => build2.armes.filter((a) => a.perksSimules).length;

// src/lib/forge/storeSimulations.ts
init_define_import_meta_env();
var import_react = __toESM(require_react(), 1);

// src/lib/forge/simulation.ts
init_define_import_meta_env();
var CLE_STOCKAGE_SIMULATIONS = "forge-armory.forge.simulations.v1";
var SIMULATIONS_VIDES = () => ({ version: 1, armes: {} });
function stockageNavigateur() {
  try {
    const s2 = window.localStorage;
    s2.getItem(CLE_STOCKAGE_SIMULATIONS);
    return s2;
  } catch {
    const m3 = /* @__PURE__ */ new Map();
    return { getItem: (c) => m3.get(c) ?? null, setItem: (c, v) => void m3.set(c, v) };
  }
}
var entierPositif = (x) => typeof x === "number" && Number.isInteger(x) && x >= 0;
function lireSimulations(stockage) {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE_SIMULATIONS);
    if (!brut) return SIMULATIONS_VIDES();
    const o = JSON.parse(brut);
    if (o?.version !== 1 || typeof o.armes !== "object" || o.armes === null) return SIMULATIONS_VIDES();
    const sortie = SIMULATIONS_VIDES();
    for (const [instance, colonnes] of Object.entries(o.armes)) {
      if (typeof colonnes !== "object" || colonnes === null) continue;
      const arme3 = {};
      for (const [socket, v] of Object.entries(colonnes)) {
        const idx = Number(socket);
        if (entierPositif(idx) && entierPositif(v?.c) && entierPositif(v?.e)) arme3[idx] = { choisi: v.c, effectif: v.e };
      }
      if (Object.keys(arme3).length > 0) sortie.armes[instance] = arme3;
    }
    return sortie;
  } catch {
    return SIMULATIONS_VIDES();
  }
}
function ecrireSimulations(stockage, s2) {
  try {
    const compact = {};
    for (const [instance, arme3] of Object.entries(s2.armes)) compact[instance] = Object.fromEntries(Object.entries(arme3).map(([k, v]) => [k, { c: v.choisi, e: v.effectif }]));
    stockage.setItem(CLE_STOCKAGE_SIMULATIONS, JSON.stringify({ version: 1, armes: compact }));
    return true;
  } catch {
    return false;
  }
}
function choisir(s2, instance, socketIndex, choix) {
  return { version: 1, armes: { ...s2.armes, [instance]: { ...s2.armes[instance] ?? {}, [socketIndex]: choix } } };
}

// src/lib/forge/storeSimulations.ts
function creerMagasin(fournirStockage = stockageNavigateur) {
  let stockage = null;
  let etat = null;
  const abonnes = /* @__PURE__ */ new Set();
  const initialiser = () => {
    if (etat === null) {
      stockage = fournirStockage();
      etat = lireSimulations(stockage);
    }
  };
  return {
    lire: () => {
      initialiser();
      return etat;
    },
    mettreAJour: (transformation) => {
      initialiser();
      const nouveau = transformation(etat);
      if (nouveau === etat) return;
      etat = nouveau;
      ecrireSimulations(stockage, nouveau);
      abonnes.forEach((a) => a());
    },
    abonner: (rappel) => {
      abonnes.add(rappel);
      return () => void abonnes.delete(rappel);
    }
  };
}
var magasinGlobal = creerMagasin();
var mettreAJourSimulations = magasinGlobal.mettreAJour;
var lireSimulationsCourantes = magasinGlobal.lire;

// src/lib/scoring/verbes.ts
init_define_import_meta_env();

// src/lib/manifest/download.ts
init_define_import_meta_env();

// factice:sql.js
init_define_import_meta_env();

// factice:fflate
init_define_import_meta_env();

// factice:sql.js/dist/sql-wasm.wasm?url
init_define_import_meta_env();

// src/lib/bungie/config.ts
init_define_import_meta_env();
var BUNGIE_ROOT = "https://www.bungie.net";
var BUNGIE_API_ROOT = `${BUNGIE_ROOT}/Platform`;
var bungieConfig = {
  apiKey: define_import_meta_env_default.VITE_BUNGIE_API_KEY,
  clientId: define_import_meta_env_default.VITE_BUNGIE_CLIENT_ID,
  redirectUri: define_import_meta_env_default.VITE_BUNGIE_REDIRECT_URI
};

// src/lib/manifest/db.ts
init_define_import_meta_env();

// factice:idb
init_define_import_meta_env();

// src/lib/manifest/download.ts
function hashVersIdSqlite(hash) {
  return hash > 2147483647 ? hash - 4294967296 : hash;
}
var cacheDefinitionsParDb = /* @__PURE__ */ new WeakMap();
function obtenirDefinition(db2, nomTable, hash) {
  let cache = cacheDefinitionsParDb.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    cacheDefinitionsParDb.set(db2, cache);
  }
  const cle = `${nomTable}:${hash}`;
  if (cache.has(cle)) return cache.get(cle);
  const stmt = db2.prepare(`SELECT json FROM ${nomTable} WHERE id = ? LIMIT 1`);
  stmt.bind([hashVersIdSqlite(hash)]);
  const trouve = stmt.step();
  const resultat = trouve ? JSON.parse(stmt.getAsObject().json) : void 0;
  stmt.free();
  cache.set(cle, resultat);
  return resultat;
}

// src/lib/manifest/search.ts
init_define_import_meta_env();

// src/data/constantesManifest.ts
init_define_import_meta_env();
var BUCKET_HASH_VERS_SLOT = {
  1498876634: "cinetique",
  // Kinetic Weapons
  2465295065: "energie",
  // Energy Weapons
  953998645: "lourde",
  // Power Weapons
  3448274439: "casque",
  // Helmet
  3551918588: "gants",
  // Gauntlets
  14239492: "torse",
  // Chest Armor
  20886954: "jambes",
  // Leg Armor
  1585787867: "marque"
  // Class Armor (Marque/Cape/Manteau selon la classe)
};

// src/lib/manifest/search.ts
function urlIcone(cheminIcone) {
  return cheminIcone ? `https://www.bungie.net${cheminIcone}` : void 0;
}
function normaliser(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function positionsMotCleStrict(texteNormalise, motCleNormalise) {
  if (!motCleNormalise) return [];
  const motEchappe = motCleNormalise.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = new RegExp(`(?<![a-z0-9])${motEchappe}(?![a-z0-9])`, "g");
  const positions = [];
  let m3;
  while ((m3 = motif.exec(texteNormalise)) !== null) {
    positions.push(m3.index);
    if (m3.index === motif.lastIndex) motif.lastIndex++;
  }
  return positions;
}

// src/data/elementVerbs.ts
init_define_import_meta_env();
var CATALOGUE_VERBES = [
  // --- VOID ---
  {
    id: "weaken",
    nomFr: "Affaiblissement",
    nomEn: "Weaken",
    element: "abyssal",
    categorie: "debuff_ennemi",
    motsClesFr: ["affaibli"],
    motsClesEn: ["weaken"],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "volatile",
    nomFr: "Volatil",
    nomEn: "Volatile",
    championEtourdi: "bloqueur",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "volatil" seul est plus court que le
    // mot-clé anglais "volatile" (8 lettres), qui matche "volatile"/
    // "volatiles" et laisse le "s" du pluriel non surligné sur ce dernier.
    // Même catégorie de bug que "suspens"/"suspendues".
    // EN: ⚠️ FIXED - "volatil" alone is shorter than the English keyword
    // "volatile", which matches but leaves the plural "s" unhighlighted.
    motsClesFr: ["volatil", "volatile", "volatiles"],
    motsClesEn: ["volatile"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de cessation) : "Éliminer des cibles volatiles crée
    // une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles volatiles cree une breche abyssale" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "suppression",
    nomFr: "Neutralisation",
    nomEn: "Suppression",
    championEtourdi: "surcharge",
    element: "abyssal",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "supprim" seul est plus court que le
    // mot-clé anglais "suppress" (8 lettres), qui matche "suppress-ion" et
    // laisse le "-ion" final non surligné. Même catégorie de bug que
    // "suspens"/"suspendues" signalée par l'utilisateur. Ajout du mot
    // français complet "suppression", identique à l'anglais dans ce cas.
    // EN: ⚠️ FIXED - "supprim" alone is shorter than the English keyword
    // "suppress" (8 letters), which matches "suppress-ion" and leaves the
    // final "-ion" unhighlighted. Same bug category as suspend/suspendues.
    motsClesFr: ["supprim", "suppression", "neutralis"],
    motsClesEn: ["suppress"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho d'autorité, confirmé par Facette de contrôle) :
    // "Éliminer des cibles neutralisées crée une Brèche abyssale."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "breche_abyssale", conditionnel: "eliminer des cibles neutralisees cree une breche abyssale" }],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Enfant des dieux anciens" (aspect Arcaniste Abyssal) applique bien
    // Neutralisation, mais était classé "payoff orphelin" à tort : "Les
    // combattants affectés PAR L'ÂME sont aussi brièvement neutralisés" -
    // notre heuristique de proximité voit "affecte par" juste avant
    // "neutralises" et conclut à un payoff, sans comprendre que "affectés
    // par" se rapporte à l'Âme (un autre nom), pas à la neutralisation
    // elle-même. Exception ciblée plutôt que d'assouplir "affecte par"
    // globalement (casserait le garde-fou "contre les cibles gelées").
    // EN: ⚠️ ADDED - "Enfant des dieux anciens" genuinely applies
    // Suppression, but was misclassified as an orphaned payoff: "affected
    // by" refers to a different noun (the Soul), not to suppression itself
    // - our proximity heuristic can't tell. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["les combattants affectes par l'ame sont aussi brievement neutralises"],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "devour",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "D\xE9voration",
    nomEn: "Devour",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["devoration"],
    motsClesEn: ["devour"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "invisibilite",
    nomFr: "Invisibilit\xE9",
    nomEn: "Invisibility",
    element: "abyssal",
    categorie: "buff_soi",
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "invisible" (adjectif) manquait, seul le nom "invisibilite" était
    // couvert. Conséquence sérieuse : "Esquiver vous rend invisible."
    // (Esquive furtive, Chasseur Abyssal - une capacité DE BASE) n'était
    // même pas détectée du tout (0 mention), pas juste mal classée.
    // EN: ⚠️ ADDED - "invisible" (adjective) was missing, only the noun
    // form was covered. Serious consequence: "Dodging makes you invisible"
    // (a BASE-KIT Hunter ability) wasn't detected AT ALL.
    motsClesFr: ["invisibilite", "invisible"],
    motsClesEn: ["invisibility"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "surbouclier",
    nomFr: "Surbouclier",
    nomEn: "Overshield",
    element: "abyssal",
    categorie: "buff_soi",
    motsClesFr: ["surbouclier"],
    motsClesEn: ["overshield"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // --- ARC ---
  {
    id: "jolt",
    nomFr: "Secousse",
    nomEn: "Jolt",
    championEtourdi: "surcharge",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["electrocut", "jolt", "secousse"],
    motsClesEn: ["jolt"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle ionique) : "Éliminer une cible qui subit des
    // Secousses ... crée une Piste ionique."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "aveuglement",
    nomFr: "C\xE9cit\xE9",
    nomEn: "Blind",
    championEtourdi: "implacable",
    element: "arc",
    categorie: "debuff_ennemi",
    motsClesFr: ["aveugl", "cecit"],
    motsClesEn: ["blind"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de brillance) : "Vaincre une cible touchée par
    // Cécité avec des dégâts de précision crée une explosion provoquant
    // Cécité." Auto-référence (le verbe se produit lui-même) : le graphe
    // la gère nativement, sans boucle infinie (le verbe est déjà marqué
    // atteint au moment où le lien est suivi).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    // Self-reference: the graph handles it natively, no infinite loop.
    produit: [{ verbeId: "aveuglement", conditionnel: "vaincre une cible touchee par cecite avec des degats de precision cree une explosion provoquant cecite" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "amplifie",
    nomFr: "Amplifi\xE9",
    nomEn: "Amplified",
    element: "arc",
    categorie: "buff_soi",
    motsClesFr: ["amplifi"],
    motsClesEn: ["amplified"],
    // FR : ⚠️ AJOUT (26/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Cryo-électrique (Étincelle
    // d'amplitude) : "Éliminer des cibles rapidement sous l'effet
    // d'Amplificateur créé un orbe de puissance." Même famille que les 3
    // cas trouvés hier sur Embrasement/Blessure solaire.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the
    // Cryo-electric fragment audit.
    ressourceGeneree: [
      { type: "super", conditionnel: "eliminer des cibles rapidement sous l'effet d'amplificateur cree un orbe de puissance" }
    ],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // --- SOLAR ---
  {
    id: "scorch",
    nomFr: "Blessure solaire",
    nomEn: "Scorch",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["consume", "scorch", "blessure solaire", "blessures solaires"],
    motsClesEn: ["scorch"],
    // FR : ⚠️ AJOUT (25/08/2026) - inconditionnel : seuil de cumul (100
    // stacks), pas un fragment/aspect à vérifier.
    produit: [{ verbeId: "ignition" }],
    // FR : ⚠️ AJOUT (25/08/2026) - production de ressource CONDITIONNELLE,
    // trouvée via l'audit des fragments Solaire (Tison à calciner).
    // Blessure solaire ne génère normalement AUCUNE ressource.
    // EN: ⚠️ ADDED - CONDITIONAL resource production, found via the Solar
    // fragment audit. Scorch normally generates NO resource.
    ressourceGeneree: [
      { type: "melee", conditionnel: "vaincre des cibles souffrant de blessures solaires octroie de l'energie de melee" }
    ],
    regleStacking: "Stacks jusqu'\xE0 un seuil, d\xE9clenche une Ignition \u2014 voir 01_DAMAGE_STACKING.md pour le d\xE9tail"
  },
  {
    id: "ignition",
    nomFr: "Embrasement",
    nomEn: "Ignition",
    championEtourdi: "implacable",
    element: "solaire",
    categorie: "debuff_ennemi",
    motsClesFr: ["ignition", "embrasement"],
    motsClesEn: ["ignition"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel enfin comblé. La
    // description officielle du fragment Tison de charbon a été transmise
    // par l'utilisateur (capture d'écran DIM) : "Vos Embrasements solaires
    // infligent des Blessures solaires aux cibles touchées." Portion
    // distinctive retenue comme condition plutôt que la phrase intégrale -
    // assez précise pour ne matcher que ce fragment, assez robuste pour
    // tolérer une reformulation mineure du Manifest.
    // EN: ⚠️ ADDED - conditional link finally filled in. The official
    // description of the Ember of Ashes fragment was provided by the user.
    produit: [{ verbeId: "scorch", conditionnel: "embrasements solaires infligent des blessures solaires" }],
    // FR : ⚠️ AJOUT (25/08/2026) - 2 productions de ressource
    // CONDITIONNELLES, trouvées via l'audit des fragments Solaire.
    // Embrasement ne génère normalement AUCUNE ressource - ces deux
    // fragments lui en donnent une, chacun sous sa propre condition.
    // EN: ⚠️ ADDED - 2 CONDITIONAL resource productions, found via the
    // Solar fragment audit. Ignition normally generates NO resource.
    ressourceGeneree: [
      { type: "grenade", conditionnel: "eliminer des cibles avec des embrasements solaires confere de l'energie de grenade" },
      { type: "super", conditionnel: "eliminer rapidement plusieurs cibles avec des embrasements solaires genere un orbe de puissance" }
    ],
    regleStacking: "Explosion ponctuelle (payoff du Scorch), pas d'effet de stacking dans la dur\xE9e"
  },
  {
    id: "radieux",
    nomFr: "Radiance",
    nomEn: "Radiant",
    championEtourdi: "bloqueur",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["radieux", "radiance"],
    motsClesEn: ["radiant"],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "restauration",
    nomFr: "Restauration",
    nomEn: "Restoration",
    element: "solaire",
    categorie: "buff_soi",
    motsClesFr: ["restauration"],
    motsClesEn: ["restoration"],
    regleStacking: "Ne stack pas avec Healing Rift \u2014 la dur\xE9e la plus longue obtenue est conserv\xE9e au renouvellement"
  },
  {
    id: "soin",
    nomFr: "Soin",
    nomEn: "Cure",
    element: "solaire",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (25/08/2026) - "cure" retiré de motsClesFr : ce n'est
    // pas un vrai mot français ici (doublon inutile avec "soin", qui couvre
    // déjà les formes françaises réelles). Côté anglais, déplacé en
    // correspondance STRICTE : matchait à tort 11 perks sur les 7
    // artefacts (filobscure, occurence, procure), 0 vrai match.
    // ⚠️ SECOND problème trouvé EN TESTANT ce correctif (pas celui
    // demandé, mais sur la même entrée) : "soin" (nom) et "soign-" (racine
    // du verbe soigner) sont deux séquences DIFFÉRENTES en français -
    // elles divergent dès la 4e lettre ('n' contre 'g'). "soin" seul ne
    // couvrait donc AUCUNE forme conjuguée ("soigne", "soignez",
    // "soignent"). Ajouté "soign" comme racine distincte.
    // EN: ⚠️ FIXED - "cure" removed from motsClesFr. ⚠️ SECOND issue found
    // WHILE TESTING this fix: "soin" (noun) and "soign-" (verb stem) are
    // genuinely different letter sequences in French - "soin" alone never
    // matched any conjugated form of "soigner". Added "soign" as a
    // separate root.
    motsClesFr: ["soin", "soign"],
    motsClesEn: [],
    motsClesStrictsEn: ["cure"],
    regleStacking: "Effet instantan\xE9 (\xE0 la pose), les stacks (x1/x2/x3) augmentent le montant soign\xE9 d'un coup"
  },
  // --- STASIS ---
  {
    id: "ralentissement",
    nomFr: "Ralentissement",
    nomEn: "Slow",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["ralenti"],
    motsClesEn: ["slow"],
    produit: [{ verbeId: "gel" }],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure de réfraction) : "Vaincre des cibles ralenties ou
    // gelées vous confère de l'énergie de capacité de doctrine." Même
    // condition portée sur Gel ci-dessous.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" }],
    regleStacking: "Stacks jusqu'\xE0 un seuil qui d\xE9clenche le Gel"
  },
  {
    id: "gel",
    nomFr: "Gel",
    nomEn: "Freeze",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["gel", "gele"],
    motsClesEn: ["freeze", "frozen"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 nouveaux liens trouvés par audit de
    // fragments : Éclat stasique (Facette de contrôle : "Éliminer des
    // cibles gelées ... crée un éclat stasique") en plus de Brisure déjà
    // en place.
    // EN: ⚠️ ADDED - 2 new links found via fragment audit.
    produit: [
      { verbeId: "brisure" },
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles gelees ou neutralisees cree un eclat stasique ou une breche abyssale" }
    ],
    // FR : ⚠️ AJOUT (26/08/2026) - Murmure de liens : "Éliminer des
    // cibles gelées génère un orbe de puissance" (énergie de Super), et
    // même condition de classe que Ralentissement ci-dessus (Murmure de
    // réfraction couvre les deux verbes dans une seule description).
    // EN: ⚠️ ADDED - conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "vaincre des cibles ralenties ou gelees vous confere de l'energie de capacite de doctrine" },
      { type: "super", conditionnel: "eliminer des cibles gelees genere un orbe de puissance" }
    ],
    regleStacking: "\xC9tat binaire (gel\xE9ou non) \u2014 payoff : Fracasser (Shatter)"
  },
  {
    id: "armure_givre",
    nomFr: "Armure de givre",
    nomEn: "Frost Armor",
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["armure de givre", "armures de givre"],
    motsClesEn: ["frost armor"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Murmure de chaînes ("Éliminer des cibles pendant que
    // vous avez Armure de givre a une chance de créer un éclat stasique")
    // et Murmure d'inversion ("Quand vous avez l'Armure de givre, les
    // dégâts de mêlée ralentissent votre cible").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    produit: [
      { verbeId: "eclat_stasique", conditionnel: "eliminer des cibles pendant que vous avez armure de givre a une chance de creer un eclat stasique" },
      { verbeId: "ralentissement", conditionnel: "quand vous avez l'armure de givre les degats de melee ralentissent votre cible" }
    ],
    regleStacking: "Stacks (jusqu'\xE0 x5 ou x7 avec Whisper of Rime), d\xE9cro\xEEt d'un stack toutes les 5s"
  },
  // --- STRAND ---
  {
    id: "rupture",
    nomFr: "Sectionnement",
    nomEn: "Sever",
    element: "filobscur",
    categorie: "debuff_ennemi",
    motsClesFr: ["rupture", "sectionn"],
    motsClesEn: ["sever"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "suspension",
    nomFr: "Suspension",
    nomEn: "Suspend",
    championEtourdi: "implacable",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - "suspens" seul ne couvre que le NOM
    // (« suspension », « en suspens »), pas le VERBE conjugué
    // (« suspendu », « suspendues », « suspendre ») : le français a deux
    // racines différentes ici. Signalé par l'utilisateur : "suspendues"
    // n'était surligné que sur "suspend" (7 lettres), qui matchait par
    // COÏNCIDENCE via le mot-clé ANGLAIS "suspend" - ma fonction de
    // surlignage ne distingue pas la langue du texte, elle prend ce qui
    // matche. Ajout de la racine verbale française, pour un vrai match FR
    // plutôt qu'un accident via l'anglais.
    // EN: ⚠️ FIXED - "suspens" alone only covers the NOUN, not the
    // conjugated VERB - French has two different stems here. Reported by
    // the user: "suspendues" only highlighted "suspend" (7 letters), which
    // matched by COINCIDENCE via the ENGLISH keyword.
    motsClesFr: ["suspens", "suspend"],
    motsClesEn: ["suspend"],
    produit: [{ verbeId: "enchevetrement" }],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil d'esprit ("Éliminer des cibles en Suspension
    // confère de l'énergie de compétence de classe") et Fil de sagesse
    // ("Éliminer des cibles suspendues crée un orbe de puissance", énergie
    // de Super).
    // EN: ⚠️ ADDED - 2 conditional resources found via fragment audit.
    ressourceGeneree: [
      { type: "classe", conditionnel: "eliminer des cibles suspendues confere de l'energie de competence de classe" },
      { type: "super", conditionnel: "eliminer des cibles suspendues cree un orbe de puissance" }
    ],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "cotte_tissee",
    nomFr: "Maille tiss\xE9e",
    nomEn: "Woven Mail",
    element: "filobscur",
    categorie: "buff_soi",
    // FR : ⚠️ CORRIGÉ (24/08/2026) - le renommage d'affichage
    // (Cotte tissée -> Maille tissée) n'avait pas mis à jour le MOT-CLÉ de
    // détection, qui ne matchait donc encore que "cotte tissee". Ajouté
    // "maille tissee", gardé l'ancien en repli au cas où un texte plus
    // ancien du Manifest utiliserait encore la formulation précédente.
    // EN: ⚠️ FIXED - the display rename didn't update the detection
    // KEYWORD, which still only matched "cotte tissee". Added
    // "maille tissee", kept the old one as a fallback.
    motsClesFr: ["maille tissee", "mailles tissees", "cotte tissee", "cottes tissees"],
    motsClesEn: ["woven mail"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Fil de transmutation) : "Sous l'effet de Maille tissée,
    // vos frags à l'arme spéciale créent un Enchevêtrement."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "enchevetrement", conditionnel: "sous l'effet de maille tissee vos frags a l'arme speciale creent un enchevetrement" }],
    regleStacking: "Empowering Buff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  // FR : ⚠️ AJOUT (24/08/2026) - mécaniques de RESSOURCE (mods d'armure),
  // demande de l'utilisateur suite au diagnostic des stats d'armure.
  // Basées UNIQUEMENT sur ce que confirme knowledge-base/08_GAME_MECHANICS.md
  // (mécanisme Gain/Consommation) et les mods réellement vus dans les
  // diagnostics de l'utilisateur (Capuche d'eutechnologie, Rôdeur
  // nocturne) - pas de mod inventé ou supposé.
  // EN: ⚠️ ADDED - RESOURCE mechanics (armor mods), per user request
  // following the armor stat diagnostic. Based ONLY on what
  // 08_GAME_MECHANICS.md confirms and mods actually seen in the user's real
  // diagnostics - no invented or assumed mod.
  {
    id: "charge_armure",
    nomFr: "Charge d'armure",
    nomEn: "Armor Charge",
    element: null,
    categorie: "ressource",
    // FR : SOURCE — le gain est indirect (ramasser un Orbe avec un mod de
    // charge équipé), donc peu de texte de perk le formule explicitement.
    // On couvre les termes que la description d'un mod générateur emploie
    // réellement (Siphon, Reaper : "kill" + type d'arme/aptitude = Orbe).
    // FR : ⚠️ CORRIGÉ (26/08/2026, passe d'audit du scoring) - "orbe de
    // puissance" (le terme RÉEL employé par le jeu, "Orb of Power")
    // manquait de ce tableau, qui n'avait que "orbe de pouvoir" (coquille
    // de terminologie). Conséquence sérieuse : les 17 descriptions de
    // fragments transcrites lors de l'audit du 26/08 (dont Fil de tutelle,
    // Facette de détermination) disent TOUTES "orbe de puissance" - aucune
    // ne pouvait donc jamais donner `aSource=true` à charge_armure, ce qui
    // bloquait TOUTE la chaîne (Maille tissée, Charge éclair, Restauration,
    // Armure de givre, Surbouclier) dès le premier maillon. Signalé par
    // l'utilisateur : le test de Facette de détermination n'affichait rien.
    // EN: ⚠️ FIXED - "orbe de puissance" (the REAL term the game uses) was
    // missing from this list, which only had "orbe de pouvoir" (a
    // terminology typo). Serious consequence: all 17 fragment descriptions
    // transcribed during the 26/08 audit say "orbe de puissance" - none
    // could ever grant charge_armure `aSource=true`, blocking the entire
    // downstream chain from the very first link.
    motsClesFr: [
      "charge d'armure",
      "charges d'armure",
      "ramassage d'orbe",
      "orbe de lumiere",
      "orbe de pouvoir",
      "orbe de puissance",
      "orbes de puissance"
    ],
    motsClesEn: ["armor charge", "orb of power", "orb pickup"],
    // FR : ⚠️ AJOUT (26/08/2026) - liens conditionnels trouvés par audit
    // de fragments : Fil de tutelle ("Ramasser un orbe de puissance
    // confère Maille tissée") et Facette de détermination, exclusive au
    // Prismatique ("Ramasser un orbe de puissance confère Charge éclair,
    // Restauration, Armure de givre, Maille tissée ou Surbouclier, selon
    // le type de dégâts du Super équipé") - 4 verbes supplémentaires
    // confirmant et étendant le même mécanisme de ramassage d'orbe.
    // EN: ⚠️ ADDED - conditional links found via fragment audit, one
    // Prismatic-exclusive fragment confirming/extending the same orb
    // pickup mechanism across 5 subclass-specific verbs.
    produit: [
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere maille tissee" },
      // FR : ⚠️ AJOUT (26/08/2026) - même lien, mais aussi vérifié via le
      // texte de Facette de détermination (Prismatique) : un build qui n'a
      // QUE ce fragment équipé (pas Fil de tutelle) doit quand même activer
      // le lien. Deux entrées vers la MÊME cible plutôt qu'une logique OU
      // dans un seul champ `conditionnel` (qui ne porte qu'une chaîne) -
      // `dejaAtteints` dans le moteur de détection évite un double
      // traitement si les deux conditions sont vraies à la fois.
      // EN: ⚠️ ADDED - same link, also verified via the Prismatic
      // fragment's text: a build with ONLY that fragment equipped should
      // still activate the link. Two entries to the SAME target rather
      // than an OR inside a single `conditionnel` string field.
      { verbeId: "cotte_tissee", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "charge_eclair", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "restauration", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "armure_givre", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" },
      { verbeId: "surbouclier", conditionnel: "ramasser un orbe de puissance confere charge eclair restauration armure de givre maille tissee ou surbouclier selon le type de degats du super que vous avez equipe" }
    ],
    // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
    // "Tir de l'ombre : Carquois de Moebius" (Super Chasseur Abyssal)
    // source bien Charge d'armure, mais était classé "payoff orphelin" à
    // tort : "Vaincre des cibles tenues en laisse crée des orbes de
    // puissance" - "vaincre" est ici utilisé au sens générique ("tuer un
    // ennemi"), pas comme condition de consommation d'un debuff déjà
    // appliqué par CE verbe (le sens habituel de "vaincre" dans notre
    // liste de marqueurs payoff, ex : "vaincre une cible gelée"). Exception
    // ciblée plutôt que d'assouplir "vaincre" globalement (casserait sa
    // signification légitime ailleurs dans le catalogue).
    // EN: ⚠️ ADDED - this Super genuinely sources Charge d'armure, but was
    // misclassified as an orphaned payoff: "vaincre" is used here in a
    // generic sense ("kill an enemy"), not as a precise consumption
    // condition of an existing debuff. Targeted exception rather than
    // loosening the marker globally.
    sourcesForcees: ["vaincre des cibles tenues en laisse cree des orbes de puissance"],
    regleStacking: "Ressource \xE0 stacks (3 par d\xE9faut, jusqu'\xE0 6 avec Charged Up) \u2014 se d\xE9grade avec le temps, pas un buff/debuff classique"
  },
  {
    id: "surcharge_arme",
    nomFr: "Surcharge d'arme",
    nomEn: "Weapon Surge",
    element: null,
    categorie: "ressource",
    // FR : PAYOFF — consomme des Charges d'armure pour un bonus de dégâts
    // par type d'arme, tant que le stack est actif (mod passif, jambes).
    motsClesFr: ["surcharge"],
    motsClesEn: ["surge"],
    regleStacking: "Passif \u2014 bonus croissant par stack de Charge d'armure active, d\xE9cro\xEEt avec le temps"
  },
  {
    id: "source_aptitude",
    nomFr: "Source d'aptitude",
    nomEn: "Ability Source",
    element: null,
    categorie: "ressource",
    // FR : mods "Source de Super"/"Source de Grenade" vus dans les
    // diagnostics réels de l'utilisateur (Capuche d'eutechnologie, Rôdeur
    // nocturne) : ils donnent de l'énergie d'aptitude à l'activation d'une
    // autre aptitude - source pure, pas de payoff à chercher.
    motsClesFr: ["source de super", "source de grenade", "source de melee", "siphon"],
    motsClesEn: ["ability source", "siphon"],
    // FR : ⚠️ AJOUT (25/08/2026) - les 3 types réunis dans une seule
    // entrée, moins précis que les autres verbes-ressources : cette entrée
    // conflate déjà plusieurs mods réels distincts ("Source de Super",
    // "Source de Grenade", "Source de Mêlée") en une seule ligne du
    // catalogue. Signal de ressource générique par nécessité, pas par
    // choix - une vraie séparation demanderait de scinder l'entrée en 3.
    // EN: ⚠️ ADDED - the 3 types combined in one entry, less precise than
    // other resource verbs since this entry already conflates several
    // distinct real mods into a single catalogue line.
    ressourceGeneree: [{ type: "super" }, { type: "grenade" }, { type: "melee" }],
    regleStacking: "Instantan\xE9 \xE0 l'activation d'une aptitude \u2014 pas de stack"
  },
  // FR : ⚠️ AJOUT (24/08/2026) - 12 verbes identifiés dans
  // knowledge-base/22_CHAINES_DE_VERBES.md mais jamais portés dans ce
  // catalogue jusqu'ici. Noms anglais repris du fichier de documentation
  // (certains marqués "à confirmer" là-bas, gardés tels quels ici -
  // n'affecte que le libellé nomEn, pas la détection elle-même qui repose
  // sur motsClesFr/motsClesEn).
  // EN: ⚠️ ADDED - 12 verbs identified in the documentation file but never
  // ported into this catalogue until now.
  {
    id: "feu_follet",
    ressourceGeneree: [{ type: "grenade" }],
    nomFr: "Feu follet",
    nomEn: "Firesprite",
    element: "solaire",
    categorie: "ressource",
    motsClesFr: ["feu follet", "feux follets"],
    motsClesEn: ["firesprite"],
    // FR : ⚠️ AJOUT (25/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Tison de clémence) : "Ramasser un Feu follet octroie
    // Restauration." Racine distinctive retenue comme condition.
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "restauration", conditionnel: "ramasser un feu follet octroie restauration" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "charge_eclair",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "Charge \xE9clair",
    nomEn: "Ionic Charge",
    // à confirmer
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["charge eclair", "charges eclair"],
    motsClesEn: ["ionic charge"],
    // FR : ⚠️ AJOUT (26/08/2026) - même condition que Secousse ci-dessus
    // (Étincelle ionique) : "... ou éliminer une cible en utilisant une
    // Charge éclair crée une Piste ionique."
    // EN: ⚠️ ADDED - same fragment as Jolt above, second trigger.
    produit: [{ verbeId: "piste_ionique", conditionnel: "eliminer une cible qui subit des secousses ou eliminer une cible en utilisant une charge eclair cree une piste ionique" }],
    regleStacking: "Cumuls \u2014 s'accumule tant qu'actif, effet \xE0 cumul maximum"
  },
  {
    id: "piste_ionique",
    ressourceGeneree: [{ type: "generique" }],
    nomFr: "Piste ionique",
    nomEn: "Ionic Traces",
    element: "arc",
    categorie: "ressource",
    motsClesFr: ["piste ionique", "pistes ioniques"],
    motsClesEn: ["ionic trace"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Étincelle de décharge) : "Ramasser une Piste ionique vous
    // confère un cumul de Charge éclair."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "charge_eclair", conditionnel: "ramasser une piste ionique vous confere un cumul de charge eclair" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "breche_abyssale",
    ressourceGeneree: [{ type: "classe" }],
    nomFr: "Br\xE8che abyssale",
    nomEn: "Void Breach",
    // à confirmer
    element: "abyssal",
    categorie: "ressource",
    motsClesFr: ["breche abyssale", "breches abyssales"],
    motsClesEn: ["void breach"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Écho de famine) : "Ramasser une Brèche abyssale ou un
    // orbe de puissance confère Dévoration."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "devour", conditionnel: "ramasser une breche abyssale ou un orbe de puissance confere devoration" }],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "cristal_stase",
    nomFr: "Cristal de Stase",
    nomEn: "Stasis Crystal",
    // à confirmer
    element: "stase",
    categorie: "buff_soi",
    motsClesFr: ["cristal de stase", "cristaux de stase"],
    motsClesEn: ["stasis crystal"],
    produit: [{ verbeId: "gel" }, { verbeId: "ralentissement" }, { verbeId: "eclat_stasique" }],
    regleStacking: "Objet pos\xE9 sur le terrain, d\xE9truisible \u2014 pas un buff/debuff classique"
  },
  {
    id: "brisure",
    nomFr: "Brisure",
    nomEn: "Shatter",
    championEtourdi: "implacable",
    element: "stase",
    categorie: "debuff_ennemi",
    motsClesFr: ["brisure", "se brise", "se briser"],
    motsClesEn: ["shatter"],
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Murmure des fractures) : "Briser une cible gelée avec une
    // attaque de mêlée confère un cumul d'Armure de givre."
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    produit: [{ verbeId: "armure_givre", conditionnel: "briser une cible gelee avec une attaque de melee confere un cumul d'armure de givre" }],
    regleStacking: "Instantan\xE9, \xE0 la rupture d'une cible gel\xE9e \u2014 pas de stack"
  },
  {
    id: "eclat_stasique",
    ressourceGeneree: [{ type: "melee" }],
    nomFr: "\xC9clat stasique",
    nomEn: "Shard of Stasis",
    // à confirmer
    element: "stase",
    categorie: "ressource",
    motsClesFr: ["eclat stasique", "eclats stasiques"],
    motsClesEn: ["stasis shard", "shard of stasis"],
    regleStacking: "Ramassage au sol \u2014 pas de stack"
  },
  {
    id: "enchevetrement",
    nomFr: "Enchev\xEAtrement",
    nomEn: "Tangle",
    // à confirmer
    element: "filobscur",
    categorie: "ressource",
    // FR : "enchevetr" (sans accent, après normalisation) couvre
    // "Enchevêtrement", "Enchevêtré", "Enchevêtrés" via la racine commune.
    motsClesFr: ["enchevetr"],
    motsClesEn: ["tangle"],
    // FR : ⚠️ AJOUT (26/08/2026) - 2 liens conditionnels trouvés par audit
    // de fragments : Fil de fureur ("Infliger des dégâts aux cibles avec
    // un Enchevêtrement vous confère de l'énergie de mêlée") et Facette
    // d'honneur, exclusive au Prismatique ("Détruire un Enchevêtrement
    // vous confère de l'énergie de Transcendance du même type").
    // EN: ⚠️ ADDED - 2 conditional links found via fragment audit.
    ressourceGeneree: [{ type: "melee", conditionnel: "infliger des degats aux cibles avec un enchevetrement vous confere de l'energie de melee" }],
    produit: [{ verbeId: "transcendance", conditionnel: "obtenir un objet elementaire ou detruire un enchevetrement vous confere de l'energie de transcendance du meme type" }],
    regleStacking: "Objet pos\xE9 sur le terrain, d\xE9truisible ou ramassable \u2014 pas un buff/debuff classique"
  },
  {
    id: "brindille",
    nomFr: "Brindille",
    nomEn: "Threadling",
    // à confirmer
    element: "filobscur",
    categorie: "buff_soi",
    motsClesFr: ["brindille"],
    motsClesEn: ["threadling"],
    regleStacking: "Cr\xE9ature invoqu\xE9e \u2014 pas un buff/debuff classique"
  },
  {
    // FR : ⚠️ AJOUT (24/08/2026) - trouvé par l'utilisateur dans le perk
    // « Éclat photonique » (Tablette de la Ruine), qui mentionne une cible
    // « épuisée » sans jamais définir le terme. Confirmé par l'utilisateur :
    // s'applique en perturbant les Champions Surchargés, ou via des armes
    // ayant les particularités d'origine « Psychopiratage » ou « Soumission ».
    // ⚠️ SANS ÉLÉMENT : contrairement aux autres états de combat du
    // catalogue, Épuisement n'appartient à aucune doctrine - il vient d'une
    // interaction avec un Champion ou d'une particularité d'arme. Lui
    // assigner un élément aurait été une donnée fausse (même raisonnement
    // que pour Charge d'armure).
    // Vérifié : c'est le SEUL état de combat mentionné dans les 7 artefacts
    // qui n'était pas déjà couvert par le catalogue (audit du 05/08).
    // EN: ⚠️ ADDED - found by the user in the "Éclat photonique" perk, which
    // mentions an "épuisée" target without ever defining it. Confirmed:
    // applied by disrupting Overload Champions, or via weapons with the
    // "Psychopiratage"/"Soumission" origin traits. NO ELEMENT: unlike other
    // combat states, this belongs to no subclass.
    id: "epuisement",
    nomFr: "\xC9puisement",
    nomEn: "Weaken?",
    // nom anglais non confirmé
    element: null,
    categorie: "debuff_ennemi",
    motsClesFr: ["epuis"],
    motsClesEn: [],
    regleStacking: "\xC9tat de combat appliqu\xE9 par perturbation d'un Champion Surcharg\xE9 ou par particularit\xE9 d'origine (Psychopiratage, Soumission)"
  },
  {
    id: "effilochage",
    nomFr: "Effilochage",
    nomEn: "Unravel",
    championEtourdi: "bloqueur",
    element: "filobscur",
    categorie: "debuff_ennemi",
    // FR : "effiloch" couvre "Effilochage", "effilochant", "effiloché" via
    // la racine commune.
    motsClesFr: ["effiloch"],
    motsClesEn: ["unravel"],
    produit: [{ verbeId: "enchevetrement" }],
    regleStacking: "Global Debuff \u2014 ne stack pas, seul le plus haut s'applique"
  },
  {
    id: "transcendance",
    nomFr: "Transcendance",
    nomEn: "Transcendence",
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["transcendance", "transcendant"],
    motsClesEn: ["transcendence"],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète du champ sur
    // l'interface VerbeCatalogue. Sans ça, Transcendance ne peut jamais
    // être reconnue "source" (son propre texte ne décrit qu'un payoff
    // auto-entretenu), ce qui bloque toute chaîne prismatique en aval.
    // EN: ⚠️ ADDED - see the field's full doc on VerbeCatalogue. Without
    // it, Transcendance can never be "source", blocking the entire
    // downstream Prismatic chain.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (26/08/2026) - lien conditionnel trouvé par audit de
    // fragments (Facette de générosité) : "Éliminer des cibles quand vous
    // êtes sous l'effet de Transcendance crée des orbes de puissance pour
    // vos alliés" (énergie de Super).
    // EN: ⚠️ ADDED - conditional link found via fragment audit.
    ressourceGeneree: [{ type: "super", conditionnel: "eliminer des cibles quand vous etes sous l'effet de transcendance cree des orbes de puissance pour vos allies" }],
    regleStacking: "Dur\xE9e prolong\xE9e par \xE9limination \u2014 pas de stack classique"
  },
  {
    id: "grenade_prismatique_chasseur",
    nomFr: "Grenade prismatique (Chasseur)",
    nomEn: "Hail the Storm?",
    // nom anglais non confirmé, voir knowledge-base
    element: "prismatique",
    categorie: "buff_soi",
    // FR : nom en jeu confirmé par l'utilisateur : "Pic Grêle de Feu".
    motsClesFr: ["pic grele de feu"],
    motsClesEn: [],
    // FR : ⚠️ AJOUT (26/08/2026) - voir la doc complète sur
    // VerbeCatalogue. Ces 3 grenades sont identifiées par leur NOM propre
    // (pas un terme de debuff en prose) : sans ce champ, aucune ne peut
    // jamais être classée "source", bloquant les 4-2 verbes qu'elles
    // déclenchent en aval.
    // EN: ⚠️ ADDED - see full doc on VerbeCatalogue. These 3 grenades are
    // identified by their own NAME - without this, none can ever be
    // classified "source", blocking their downstream verbs.
    sourceImplicite: true,
    // FR : ⚠️ AJOUT (25/08/2026) - déclenche 4 verbes simultanément à
    // l'impact (2 par élément combiné), tous inconditionnels — confirmé
    // dans knowledge-base/22.
    produit: [{ verbeId: "scorch" }, { verbeId: "ignition" }, { verbeId: "ralentissement" }, { verbeId: "gel" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  },
  {
    // FR : ⚠️ AJOUT (25/08/2026) - MANQUANTE jusqu'ici : seule la version
    // Chasseur avait été portée dans le code, bien que les 3 grenades
    // soient documentées et validées dans knowledge-base/22 depuis le
    // 24/08. Trouvé en construisant le graphe de chaînes.
    // EN: ⚠️ ADDED - MISSING until now: only the Hunter version had been
    // ported to code, even though all 3 grenades were already documented.
    id: "grenade_prismatique_titan",
    nomFr: "Grenade prismatique (Titan)",
    nomEn: "Titan Prismatic Grenade",
    // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["piege electrifiant"],
    motsClesEn: [],
    sourceImplicite: true,
    produit: [{ verbeId: "suspension" }, { verbeId: "jolt" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  },
  {
    id: "grenade_prismatique_arcaniste",
    nomFr: "Grenade prismatique (Arcaniste)",
    nomEn: "Warlock Prismatic Grenade",
    // nom anglais non confirmé
    element: "prismatique",
    categorie: "buff_soi",
    motsClesFr: ["singularite glacee"],
    motsClesEn: [],
    sourceImplicite: true,
    // FR : ⚠️ Gel N'EST PAS listé ici, volontairement - confirmé par
    // l'utilisateur : c'est une conséquence EN CASCADE de Ralentissement
    // (via le lien ralentissement -> gel déjà posé plus bas dans ce
    // fichier), pas un 3e effet direct de cette grenade. L'ajouter ici en
    // double aurait été une redondance, pas une précision.
    // EN: ⚠️ Gel is NOT listed here on purpose - it's a CASCADING
    // consequence of Ralentissement, not a 3rd direct effect of this
    // grenade. Listing it here too would be redundant.
    produit: [{ verbeId: "suppression" }, { verbeId: "ralentissement" }],
    regleStacking: "Disponible uniquement sous Transcendance \u2014 pas de stack"
  }
];

// src/data/artefacts.ts
init_define_import_meta_env();
var CONTRAINTES_ARTEFACT = {
  perksMax: 7,
  tier1Minimum: 2,
  tier2Et3Maximum: 5,
  tier3Maximum: 2
};
var ARTEFACTS = [
  {
    id: "encrypted-data-disk",
    nom: "Disque de donn\xE9es crypt\xE9es",
    nomEn: "Encrypted Data Disk",
    itemHash: 3980449645,
    saison: "Renegades",
    elements: ["arc", "abyssal"],
    soutientCinetique: true,
    armes: ["Sword", "Sniper Rifle", "Machine Gun"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Profiter de l'avantage", description: `Briser le bouclier d'un combattant augmente la stabilit\xE9, le maniement et la vitesse de rechargement d'"arme". Les \xE9p\xE9es obtiennent une r\xE9sistance de garde am\xE9lior\xE9e.` },
        { tier: 1, nom: "Synth\xE8se cin\xE9tique", description: `Les "d\xE9g\xE2ts d'arme cin\xE9tique" continus et les frags rapides ont une chance de r\xE9g\xE9n\xE9rer une seule brique de munitions. Ramasser cette brique vous donne des munitions pour les armes \xE0 d\xE9g\xE2ts cin\xE9tiques \xE9quip\xE9es et octroie de la progression de munitions lourdes et sp\xE9ciales.` },
        { tier: 1, nom: "Rechargement \xE0 distance", description: 'Les tirs de pr\xE9cision avec des [icone arc] "arcs" et des [icone fusil de pr\xE9cision] "fusils de pr\xE9cision" conf\xE8rent un bonus cumul\xE9 \xE0 leur vitesse de rechargement.' },
        { tier: 1, nom: "Riposte", description: 'Peu apr\xE8s avoir par\xE9 avec une [icone \xE9p\xE9e] "\xE9p\xE9e", vos attaques lourdes et l\xE9g\xE8res "\xE9tourdissent" les combattants sans bouclier. Efficace contre les [icone implacable] Champions implacables.' },
        { tier: 1, nom: "Douleur contre puissance", description: 'Les frags rapides contre des combattants "affaiblis" vous conf\xE8rent "D\xE9voration" et cr\xE9ent une "Br\xE8che abyssale".' },
        { tier: 1, nom: "Prox\xE9mie f\xE9roce", description: `Les frags par "coup de gr\xE2ce" conf\xE8rent de l'\xE9nergie de Grenade et de M\xEAl\xE9e.` },
        { tier: 1, nom: "Rem\xE8de rapide", description: 'Les frags rapides \xE0 la [icone mitrailleuse] "mitrailleuse" vous soignent.' }
      ],
      2: [
        { tier: 2, nom: "Di\xE9lectrique", description: 'Eliminer des cibles souffrant de malus [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" conf\xE8re "Charge \xE9clair". Eliminer rapidement des cibles souffrants de malus "cryo-\xE9lectrique" fait appara\xEEtre un "orbe de puissance" et restaure une petite portion de sant\xE9.' },
        { tier: 2, nom: "Sp\xE9cialiste des armures", description: "Briser le bouclier d'un combattant vous conf\xE8re temporairement de la r\xE9sistance aux d\xE9g\xE2ts et des d\xE9g\xE2ts de m\xEAl\xE9e augment\xE9s." },
        { tier: 2, nom: "Energie de contre", description: `Quand vous ou un membre de votre escouade "\xE9tourdissez" un Champion, vous gagnez de l'\xE9nergie pour votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 2, nom: "Combo lame d'argent", description: 'Faites une courte pause apr\xE8s une attaque l\xE9g\xE8re et attaque lourde pour \xE9nergiser votre [icone \xE9p\xE9e] "\xE9p\xE9e" pendant un court moment, ce qui lui conf\xE8re un bonus de d\xE9g\xE2ts et de vitesse de charge.' },
        { tier: 2, nom: "Lame de singularit\xE9", description: `Quand vous b\xE9n\xE9ficiez d'un "bonus \xE9l\xE9mentaire abyssal", les coups de m\xEAl\xE9e et d'\xE9p\xE9e "affaiblissent" les cibles, et les frags \xE0 l'\xE9p\xE9e et en m\xEAl\xE9e cr\xE9ent une "rafale affaiblissante".` },
        { tier: 2, nom: "Secousses aveuglantes", description: 'Les frags de combattants affect\xE9s par une "Secousse" infligent "C\xE9cit\xE9" aux combattants avoisinants.' },
        { tier: 2, nom: "Equit\xE9 de pr\xE9cision", description: "Les frags de pr\xE9cision font progresser un gros orbe de puissances, qui augmente les d\xE9g\xE2ts d'arme lorsqu'il est ramass\xE9. Les cibles de rang \xE9lev\xE9 font progresser plus vite." }
      ],
      3: [
        { tier: 3, nom: "Orbes \xE9l\xE9mentaires : cryo-\xE9lectriques", description: `Les frags \xE0 l'arme [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" ont une chance de faire appara\xEEtre un orbe \xE9l\xE9mentaire cryo-\xE9lectrique. Les orbes cryo-\xE9lectriques peuvent \xEAtre lanc\xE9s ou tir\xE9s pour cr\xE9er une explosion cryo-\xE9lectrique qui inflige "Secousse" aux ennemis touch\xE9s.` },
        { tier: 3, nom: "Rupture cin\xE9tique", description: `Les d\xE9g\xE2ts d'arme "cin\xE9tique" sur un combattant puissant ont une chance de cr\xE9er une rupture cin\xE9tique. Cibler cette rupture cr\xE9e une explosion qui inflige des d\xE9g\xE2ts et "fait chanceler" les combattants. Efficace contre les [icone implacable] Champions implacables.` },
        { tier: 3, nom: "M\xE9ditation du tireur", description: `Les tirs au [icone fusil de pr\xE9cision] "fusil de pr\xE9cision" octroient un cumul de d\xE9g\xE2ts de fusil de pr\xE9cision, de stabilit\xE9 et de bonus de rechargement. Les tirs au fusil de pr\xE9cision avec munitions lourdes compte pour plus d'un tir.` },
        { tier: 3, nom: "Combo temp\xEAtes de lames", description: `R\xE9aliser 3 attaques l\xE9g\xE8res \xE0 l'[icone \xE9p\xE9e] "\xE9p\xE9e" suivies d'une attaque lourde invoque des lames t\xE9n\xE9breuses qui vous entourent afin d'infliger des d\xE9g\xE2ts et de d\xE9sorienter les combattants. Les frags \xE0 l'\xE9p\xE9e allongent la dur\xE9e de ces lames t\xE9n\xE9breuses.` },
        { tier: 3, nom: "Infestation abyssale", description: `Eliminer une cible "affaiblie" fait apparaitre un projectile traqueur qui affaiblit d'autres cibles.` },
        { tier: 3, nom: "Tazer tag", description: 'Les coups de m\xEAl\xE9e [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" infligent une "Secousse" aux combattants et augmentent les d\xE9g\xE2ts pendant un court moment.' },
        { tier: 3, nom: "Electroadh\xE9sion", description: `Les grenades fluctuantes [icone cryo-\xE9lectrique] "cryo-\xE9lectrique", magn\xE9tiques [icone abyssal] "abyssales" et \xE0 fusion [icone solaire] "solaires" infligent plus de d\xE9g\xE2ts lorsqu'elles sont attach\xE9es aux combattants. En cas de frag, elles lib\xE8rent des micro-missiles qui traquent les combattants avoisinants.` }
      ]
    }
  },
  {
    id: "implement-of-curiosity",
    nom: "Outillage de Curiosit\xE9",
    nomEn: "Implement of Curiosity",
    itemHash: 2694905144,
    saison: "Reclamation",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: true,
    armes: ["Bow", "Sword", "Micro-Missiles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fi\xE8vre et Frisson", description: 'Les tirs de pr\xE9cision rapides avec des armes [icone solaire] "Solaires" conf\xE8rent "Raidance". Les tirs de pr\xE9cision rapides avec des armes [icone stase] "Stasiques" conf\xE8rent "Armure de Givre".' },
        { tier: 1, nom: "Bienveillance \xE9l\xE9mentaire", description: `Donner un "bonus \xE9l\xE9mentaire" aux alli\xE9s conf\xE8re de l'\xE9nergie de "comp\xE9tence de classe".` },
        { tier: 1, nom: "Renouveau Glac\xE9", description: `Quand vous avez "Armure de Givre", subir des d\xE9gats critiques lib\xE8re une rafale qui "G\xE8le" les combattant proches et vous conf\xE8re "Armure de Givre", ainsi qu'\xE0 vos alli\xE9s.` },
        { tier: 1, nom: "Transport de Horde", description: `Les d\xE9gats d'arme inflig\xE9s aux cibles "Effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "Sectionnent" les cibles \xE0 qui elles infligent des d\xE9gats.` },
        { tier: 1, nom: "Fils rafra\xEEchis", description: `Rammasser un "objet \xE9l\xE9mentaire" qui correspond \xE0 votre doctrine ou un "Enchev\xEAtrement" quand vous avec un Super [icone filobscur] "Filobscur" \xE9quip\xE9 conf\xE8re de l'\xE9nergie \xE0 votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 1, nom: "Tactique de meute", description: 'Infliger des d\xE9g\xE2ts avec des "Brindilles" augmente les d\xE9gats des Brindilles. Lorsque les cumuls sont au maximum, les Brindilles "\xE9tourdissent" les [icone Implacable] Champions Implacables.' },
        { tier: 1, nom: "Assaillant semi-automatique", description: "Si vous avez au moins 2 unit\xE9s de charge d'armure, les tirs de pr\xE9cision rapides avec les arcs, les fusils de pr\xE9cision et les fusils d'\xE9claireurs g\xE9n\xE8re une charge d'armure." }
      ],
      2: [
        { tier: 2, nom: "Explosion entrelac\xE9e", description: `D\xE9truire un "Enchev\xEAtrement" avec des d\xE9gats [icone filobscur] "Filobscurs" augmente le rayon de l'explosion et ses d\xE9g\xE2ts.` },
        { tier: 2, nom: "T\xE9n\xE8bres caut\xE9ris\xE9es", description: 'Les combattants non boss avec des malus [icone stase] "Stasiques" ou [icone filobscur] "Filobscurs subissent plus de d\xE9gats [icone solaire] "Solaires" de toute source.' },
        { tier: 2, nom: "Confusion \xE9l\xE9mentaire", description: "Etourdir un Champion avec une arme \xE9l\xE9mentaire cr\xE9e une explosion \xE9l\xE9mentaire align\xE9e, qui applique un malus \xE9l\xE9mentaire correspondant au Champion et aux cibles proches." },
        { tier: 2, nom: "Soutien mutuel", description: "Infliger des d\xE9g\xE2ts de pr\xE9cision continus contre des combattants quand vous \xEAtes pr\xE8s d'au moins deux alli\xE9s vous conf\xE8re de la r\xE9sistance aux d\xE9gats." },
        { tier: 2, nom: "Coalescence \xE9l\xE9mentaire", description: 'Eliminer d\xE9s cibles conf\xE8reune chance de cr\xE9er un "objet \xE9l\xE9mentaire" qui correspond \xE0 votre \xE9l\xE9ment de "Super" \xE9quip\xE9.' },
        { tier: 2, nom: "L'ar\xF4me des balles neuves", description: "Ramasser une brique de munitions augmente les d\xE9g\xE2ts de vos armes cin\xE9tiques pendant une courte dur\xE9e." },
        { tier: 2, nom: "Acc\xE9l\xE9ration \xE9nerg\xE9tique", description: 'Des d\xE9g\xE2ts continus avec des "micro-missiles" font \xE9mettre au combattant une onde de choc "cin\xE9tique" qui inflige des d\xE9g\xE2ts aux combattants proches. Efficace contre les [icone Implacable] Champions Implacable.' }
      ],
      3: [
        { tier: 3, nom: "Mitraille rayonnante", description: `Infliger des d\xE9g\xE2ts continus sous l'effet de "Radiance" ou \xE9liminer un combattant souffrant de "Blessures solaires" avec une arme pousse la cible \xE0 lib\xE9rer des projectiles solaires qui infligent des d\xE9g\xE2ts et des Blessures solaires \xE0 l'impact.` },
        { tier: 3, nom: "Broyeur de bouclier", description: `Lorsque vous avez "Maille tiss\xE9e", "Armure de givre"ou un "Surbouclier abyssal", votre "M\xEAl\xE9e" se recharge plus vite et inflige plus de d\xE9g\xE2ts. Lorsque vous \xEAtes sous l'effet d'"Amplificateur" ou de "Radiance", votre "Grenade" se recharge plus vite et inflige plus de d\xE9g\xE2ts.` },
        { tier: 3, nom: "Surealimentation \xE9l\xE9mentaire", description: 'Ramasser un "objet \xE9l\xE9mentaire" ou un "Enchev\xEAtrement" conf\xE8re des d\xE9g\xE2ts accrus aux armes du m\xEAme \xE9l\xE9ment.' },
        { tier: 3, nom: "Toile enchev\xEAtr\xE9e", description: 'Cr\xE9er un "Enchev\xEAtrement" en \xE9liminant une cible ayant un malus [icone filobscur] "Filobscur" "suspend" les combattants proches.' },
        { tier: 3, nom: "Regard glacial", description: 'Quand "Armure de givre" est active, les frags de pr\xE9cision [icone stase] "Stasiques" poussent poussent les combattants \xE0 lib\xE9rer une rafale de "gel".' },
        { tier: 3, nom: "Vigueur du Seigneur de Fer", description: "Quand vous portez une \xE9p\xE9e, vous subissez moins de d\xE9g\xE2ts ; les frags rapides octroient des munitions au porteur." },
        { tier: 3, nom: "Carquois argent\xE9", description: `Recharger un "arc" consomme un cumul de "charge d'armure", augmentant les d\xE9g\xE2ts et la vitesse de rechargement de vos 3 prochains tirs ou jusqu'\xE0 ce que vous rangiez votre arc.` }
      ]
    }
  },
  {
    id: "tablet-of-ruin",
    nom: "Tablette de la Ruine",
    nomEn: "Tablet of Ruin",
    itemHash: 2392273483,
    saison: "Heresy",
    elements: ["arc", "abyssal", "filobscur", "prismatique"],
    soutientCinetique: false,
    armes: ["Fusion Rifles", "Glaives", "Trace Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Tenir bon", description: 'Quand vous \xEAtes encercl\xE9, les [icone mitrailleuses] "mitrailleuses" et les [icone glaive] "glaives" ont une meilleure vitesse de rechargement et stabilit\xE9 ; les frags vous soignent.' },
        { tier: 1, nom: "Di\xE9lectrique", description: 'Eliminer des cibles souffrant de malus [icone cryo-\xE9lectrique] "cryo-\xE9lectriques" conf\xE8re "Charge \xE9clair". Eliminer rapidement des cibles souffrant de malus "cryo-\xE9lectriques" fait appara\xEEtre un "orbe de puissance" et restaure une petite porton de sant\xE9.' },
        { tier: 1, nom: "Tir d'\xE9lite volatil", description: `Les tirs de pr\xE9cision rapides par arme [icone abyssale] "abyssale" et les frags rapides par arme abyssale conf\xE8rent des "munitions volatiles". Les explosions "volatiles" conf\xE8rent de l'\xE9nergie de comp\xE9tence de classe.` },
        { tier: 1, nom: "Orbes effilochants", description: 'Ramasser un "orbe de puissance" ou un "Enchev\xEAtrement" conf\xE8re des "munitions effilochantes" aux armes [icone filobscur] "filobscur".' },
        { tier: 1, nom: "Eclat photonique", description: 'Eliminer une cible "\xE9puis\xE9e" ou "sectionn\xE9e" avec d\xE9g\xE2ts [icone cryo-\xE9lectrique] "cryo-\xE9lectriques" lib\xE8re une rafale qui inflige "C\xE9cit\xE9"' },
        { tier: 1, nom: "Siphon \xE9l\xE9mentaire", description: `Les frags rapides \xE0 l'aide d'une arme [icone cin\xE9tique] "cin\xE9tique" ou d'une arme correspondant \xE0 votre "Super" \xE9quip\xE9 cr\xE9ent un "objet \xE9l\xE9mentaire" \xE0 ramasser qui correspond \xE0 votre Super \xE9quip\xE9. Les "objets \xE9l\xE9mentaires" conf\xE8rent de l'\xE9nergie de "Super" correspondante quand ils sont r\xE9cup\xE9r\xE9s.` },
        { tier: 1, nom: "Destruction perp\xE9tuelle", description: 'Les frags rapides avec des [icone lance-roquettes] "lance-roquettes" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte dur\xE9e.' }
      ],
      2: [
        { tier: 2, nom: "Tissage ignoble", description: 'Les cibles touch\xE9es par vos "Enchev\xEAtrements" sont victimes de "Sectionnement". Ramasser un Enchev\xEAtrement r\xE9duit leur temps de r\xE9cup\xE9ration.' },
        { tier: 2, nom: "R\xE9colte ignoble", description: `En appliquant rapidement "Volatil", votre prochaine occurence de d\xE9g\xE2ts d'arme [icone abyssale] "abyssale" cr\xE9e une rafale "affaiblissante". Appliquer cet affaiblissement conf\xE8re un petit "surbouclier abyssal".` },
        { tier: 2, nom: "Electrification", description: 'Quand vous obtenez le maximum de "Charge \xE9clair", vous recevez aussi "Amplificateur". Les \xE9clairs infligent plus de d\xE9g\xE2ts.' },
        { tier: 2, nom: "Transport de horde", description: `Les d\xE9g\xE2ts d'arme inflig\xE9s aux cibles "effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "sectionnent" les cibles \xE0 qui elles infligent des d\xE9g\xE2ts.` },
        { tier: 2, nom: "Pas de cloche", description: `Les frags de m\xEAl\xE9e rapides \xE0 l'aide de [icone glaive] "glaives" font appara\xEEtre des munitions sp\xE9ciales de glaive suppl\xE9mentaires. Bloquer des d\xE9g\xE2ts avec des glaives augmente les d\xE9g\xE2ts de m\xEAl\xE9e qu'ils infligent aux cibles.` },
        { tier: 2, nom: "R\xE9fraction cruelle", description: `Les [icone fusil \xE0 rayon] "fusil \xE0 rayon" infligent plus de d\xE9g\xE2ts aux cibles qui subissent des malus \xE9l\xE9mentaires correspondant \xE0 leur type d'\xE9l\xE9ment.` },
        { tier: 2, nom: "Plomb en or", description: "Ramasser des munitions sp\xE9ciales a une chance d'octroyer des munitions lourdes." }
      ],
      3: [
        { tier: 3, nom: "Reconstruction de particules", description: 'Infliger des d\xE9g\xE2ts continus avec des [icone fusil \xE0 fusion] "fusils \xE0 fusion" ou des [icone fusil \xE0 fusion lin\xE9aire] "fusil \xE0 fusion lin\xE9aire" recharge partiellement le chargeur \xE0 partir des r\xE9serves et leur conf\xE8re un bonus de d\xE9g\xE2ts pendant une courte dur\xE9e contre cette cible.' },
        { tier: 3, nom: "Superchargeur \xE9l\xE9mentaire", description: `Eliminer des cibles "\xE9puis\xE9es" ou "sectionn\xE9es" avec des armes correspondant \xE0 votre \xE9l\xE9ment de "Super" conf\xE8re de l'\xE9nergie de Super.` },
        { tier: 3, nom: "R\xE9g\xE9n\xE9ration d'artillerie lourde", description: `Infliger des d\xE9g\xE2ts continus avec des [icone mitrailleuses] "mitrailleuses" ou des [icone lance-roquettes] "lance-roquettes" conf\xE8re de la r\xE9sistance aux d\xE9g\xE2ts et am\xE9liore la r\xE9g\xE9n\xE9ration d'\xE9nergie de "Grenade" et de "M\xEAl\xE9e" pendantune courte dur\xE9e. Avec ce mod activ\xE9, \xE9liminerdes combattants puissants d\xE9soriente les combattants de base proches.` },
        { tier: 3, nom: "Explosion d\xE9fibrillatrice", description: 'Etourdir un Champion conf\xE8re le cumul maximum de "Charges \xE9clair". Toucher des cibles avec ces charges leur inflige "Secousse" et vous soigne.' },
        { tier: 3, nom: "Flux abyssal", description: `Eliminer des cibles "affaiblies" avec une arme [icone abyssale] "abyssale" applique "Volatil" aux cibles proches. Les cibles puissantes augmentent le rayon d'explosion.` },
        { tier: 3, nom: "Plus de limite", description: `Lancer un "Super" lorsque vous \xEAtes en \xE9tat critique ou que vous b\xE9n\xE9ficiez d'un bonus \xE9l\xE9mentaire correspondant \xE0 votre \xE9l\xE9ment de Super augmente temporairement vos d\xE9g\xE2ts de Super.` },
        { tier: 3, nom: "En lambeaux", description: `Infliger des d\xE9g\xE2ts continus \xE0 des cibles victimes de "Sectionnement" les "effiloche". Eliminer une cible "sectionn\xE9e" cr\xE9e un point d'\xE9nergie [icone filobscur] filobscure et conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches pendant une courte dur\xE9e.` }
      ]
    }
  },
  {
    id: "slayer-baron-apothecary-satchel",
    nom: "Sacoche d'apothicaire de Baron-Bourreau",
    nomEn: "Slayer Baron Apothecary Satchel",
    itemHash: 3044482290,
    saison: "Revenant",
    elements: ["arc", "abyssal", "stase"],
    soutientCinetique: false,
    armes: ["Grenade Launchers", "Shotguns"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Vent glac\xE9", description: `Les tirs de pr\xE9cision rapides avec une arme [icone stase] "stasique" vous conf\xE8rent un cumul d'"Armure de Givre" ; les touches sur des cibles ralenties ou gel\xE9es cr\xE9ent \xE9galement un "\xE9clat stasique".` },
        { tier: 1, nom: "Convertisseur cristallin", description: 'Apr\xE8s avoir activ\xE9 votre comp\xE9tence de classe, votre prochain frag avec une arme [icone stase] "stasique" cr\xE9e un "\xE9clat stasique". R\xE9cup\xE9rez des "\xE9clats stasiques" pour obtenir des cumuls de Convertisseur cristallin, qui permettent \xE0 votre prochaine "attaque de m\xEAl\xE9e [icone stase] stasique charg\xE9e" de cr\xE9er des "cristaux de stase" \xE9gaux au nombre de cumuls que vous avez.' },
        { tier: 1, nom: "Carnage total", description: 'Apr\xE8s un "coup de gr\xE2ce" sur un combattant coriace, vous gagnez de la r\xE9sistance aux d\xE9g\xE2ts temporaire et restaurez votre sant\xE9.' },
        { tier: 1, nom: "Douleur contre puissance", description: 'Les frags rapides contre des combattants "affaiblis" vous conf\xE8rent "D\xE9voration" et cr\xE9ent une "Br\xE8che abyssale".' },
        { tier: 1, nom: "Jeu de piste", description: `Les tirs de pr\xE9cision rapides ou les frags rapides sur des cibles affect\xE9es par "Secousse" ou "C\xE9cit\xE9" g\xE9n\xE8rent des "Pistes ioniques". Ramasser une Piste ionique conf\xE8re une "charge d'armure".` },
        { tier: 1, nom: "Au coeur de l'action", description: `Lorsque l'ennemi vous encercle, les frags rapides vous conf\xE8rent une "charge d'armure". Quand vous \xEAtes encercl\xE9s, le "maniement" de vos armes est am\xE9lior\xE9 ; les [icone \xE9p\xE9e] \xE9p\xE9es ont une meilleure "vitesse de charge".` },
        { tier: 1, nom: "Brise mortelle", description: 'Les frags rapides avec une "arme" vous conf\xE8rent un bonus de mobilit\xE9.' }
      ],
      2: [
        { tier: 2, nom: "Renouveau glac\xE9", description: `Quand vous avez "Armure de Givre", subir des d\xE9g\xE2ts critiques lib\xE8re une rafale qui "g\xE8le" les combattants proches et vous conf\xE8re Armure de Givre, ainsi qu'\xE0 vos alli\xE9s.` },
        { tier: 2, nom: "Appel temp\xEAte", description: 'Briser des cibles "gel\xE9es" et des cristaux de "stase" augmente les d\xE9g\xE2ts. Briser des cristaux de "stase" lib\xE8re des \xE9clats de glace qui infligent des d\xE9g\xE2ts aux cibles et les "ralentissent".' },
        { tier: 2, nom: "Vague affaiblissante", description: `Les "coups de gr\xE2ce" \xE9mettent une onde \xE0 d\xE9g\xE2ts correspondant \xE0 l'\xE9l\xE9ment de votre "Super" \xE9quip\xE9. Les ondes "cryo-\xE9lectriques", "abyssales" ou "stasiques" appliquent "C\xE9cit\xE9", "Affaiblissement" et "Ralentissement".` },
        { tier: 2, nom: "Affaiblissement clair", description: `Utiliser un lance-grenades, blesser un boss, blesser un Champion ou briser le bouclier d'un combattant recharge vos armes rang\xE9es et "affaiblit" votre cible.` },
        { tier: 2, nom: "Br\xFBlure r\xE9tinienne", description: `Les frags rapides par tir de pr\xE9cision avec une arme [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" utilisent une "charge d'armure" pour envoyer une rafale de "C\xE9cit\xE9" \xE0 l'emplacement de la cible.` },
        { tier: 2, nom: "Orbes curatifs", description: `La premi\xE8re fois que vous brisez le bouclier d'une cible ou celui d'un Gardien utilisant son Super, vous cr\xE9ez un "orbe de puissance". Ramasser un "objet \xE9l\xE9mentaire", ramasser un "orbe de puissance" ou d\xE9truire un "Enchev\xEAtrement" vous conf\xE8re une petite quantit\xE9 de sant\xE9.` },
        { tier: 2, nom: "Renouveau abyssal", description: `Lorsque "D\xE9voration" est activ\xE9e, les frags \xE0 l'arme [icone abyssale] "abyssale" ont une chance de cr\xE9er une "Br\xE8che abyssale". Ramasser une Br\xE8che abyssale augmente le "rechargement" et le "maniement" des armes ; les [icone fusil \xE0 pompe] "fusils \xE0 pompe" et les [icone lance-grenades] "lance-grenades" sont aussi recharg\xE9s depuis les r\xE9serves.` }
      ],
      3: [
        { tier: 3, nom: "Gel c\xE9r\xE9bral", description: `Les combattants "gel\xE9s" sont entour\xE9s d'un brouillard glacial, qui "ralentit" ceux qui ne le sont pas encore.` },
        { tier: 3, nom: "Supernova", description: 'Ramasser une "Br\xE8che abyssale" permet \xE0 votre prochaine source de d\xE9g\xE2ts abyssaux de cr\xE9er un grand rayon "affaiblissant".' },
        { tier: 3, nom: "Cristal cosmique conducteur", description: 'Vos comp\xE9tences [icone cryo-\xE9lectrique] "cryo-\xE9lectrique" et [icone abyssale] "abyssale" infligent des d\xE9g\xE2ts bonus aux cibles affect\xE9s par un malus |icone stase] "stasique".' },
        { tier: 3, nom: "Se mange froid", description: `Ramasser un [icone stase] "\xE9clat stasique" vous conf\xE8re de l'\xE9nergie de comp\xE9tence de "classe". Ramasser une [icone abyssale] "Br\xE8che abyssale" vous conf\xE8re de l'\xE9nergie de "m\xEAl\xE9e".` },
        { tier: 3, nom: "Impacts cin\xE9tiques", description: 'Infliger des d\xE9g\xE2ts continus avec un [icone lance-grenades] "lance-grenades" augmente temporairement la vitesse de rechargement des lance-grenades et d\xE9clenche un "onde de choc cin\xE9tique". Cette onde de choc peut "\xE9tourdir" les [icone Implacable] Champions Implacables.' },
        { tier: 3, nom: "Combinaison cryo-\xE9lectrique", description: 'Les sources [icone cryo-\xE9lectriques] "cryo-\xE9lectriques" infligent plus de d\xE9g\xE2ts aux cibles souffrant de "C\xE9cit\xE9".' },
        { tier: 3, nom: "Rite des dieux anciens", description: `Apr\xE8s avoir ramass\xE9 une [icone abyssale] "Br\xE8che abyssale", infliger des d\xE9g\xE2ts \xE0 l'aide d'une arme "abyssale" cr\xE9e une pluie de projectiles traqueurs.` }
      ]
    }
  },
  {
    id: "hunters-journal",
    nom: "Journal du Chasseur",
    nomEn: "Hunter's Journal",
    itemHash: 2180638678,
    saison: "Echoes",
    elements: ["solaire", "arc", "abyssal", "prismatique"],
    soutientCinetique: false,
    armes: ["Auto Rifles", "Sniper Rifles", "Swords"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Siphon \xE9l\xE9mentaire", description: `Les frags rapides \xE0 l'aide d'une arme [icone cin\xE9tique] "cin\xE9tique" ou d'une arme correspondant \xE0 votre "Super" \xE9quip\xE9 cr\xE9ent un "objet \xE9l\xE9mentaire" \xE0 ramasser qui correspond \xE0 votre Super \xE9quip\xE9.` },
        { tier: 1, nom: "Substrat de diffusion \xE9nerg\xE9tique", description: "Augmente l\xE9g\xE8rement votre r\xE9sistance \xE0 tous les d\xE9g\xE2ts inflig\xE9s par des combattants." },
        { tier: 1, nom: "Frisson insidieux", description: `Les frags [icone stase] "Stasiques" face aux cibles "ralenties" ou "gel\xE9es" rel\xE2chent une explosion qui "ralentit" les combattants et conf\xE8re "Armure de Givre" aux alli\xE9s pris dans l'explosion.` },
        { tier: 1, nom: "Profiter de l'avantage", description: `Briser le bouclier d'un combattant augmente la stabilit\xE9, le maniement et la vitesse de rechargement d'"arme". Les [icone \xE9p\xE9e] \xE9p\xE9es obtiennent une r\xE9sistance de garde am\xE9lior\xE9e.` },
        { tier: 1, nom: "Explosion entrelac\xE9e", description: `D\xE9truire un "Enchev\xEAtrement" avec des d\xE9g\xE2ts [icone filobscur] "Filobscurs" augmente le rayon de l'explosion et ses d\xE9g\xE2ts.` },
        { tier: 1, nom: "Munitions incendiaires pour fusil", description: 'Les tirs de pr\xE9cision r\xE9alis\xE9s avec un [icone fusil de pr\xE9cision][icone solaire] "fusil de pr\xE9cision solaire" infligent des "Blessures solaires" aux cibles.' },
        { tier: 1, nom: "Tirs soutenu", description: "Infliger des d\xE9g\xE2ts \xE0 des combattants ou soigner des alli\xE9s en continu avec un [icone fusil automatique] vous conf\xE8re une r\xE9sistance aux d\xE9g\xE2ts." }
      ],
      2: [
        { tier: 2, nom: "Energie de contre", description: `Quand vous ou un membre de votre escouade "\xE9tourdissez" un Champion, vous gagnez de l'\xE9nergie pour votre comp\xE9tence la moins charg\xE9e.` },
        { tier: 2, nom: "Endurance de Lame", description: 'Eliminer rapidement des combattants avec une [icone \xE9p\xE9e] "\xE9p\xE9e" recharge quelques munitions.' },
        { tier: 2, nom: "H\xE9g\xE9monie abyssale", description: 'Lorsque vous avez une doctrine "Abyssale" ou "Prismatique" \xE9quip\xE9e, \xE9liminer les cibles "affaibles" fournit un petit "surbouclier abyssal".' },
        { tier: 2, nom: "Orbes radieux", description: 'Lorsque vous avez une doctrine "Solaire" ou "Prismatique" \xE9quip\xE9e, ramasser un orbe de puissance vous octroie "Radiance".' },
        { tier: 2, nom: "Mauvaise amplitude", description: 'Blesser un Champion avec une comp\xE9tence [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" lui inflige une "Secousse".' },
        { tier: 2, nom: "Fulmination solaire", description: 'Vos "Embrasements" infligent plus de d\xE9g\xE2ts dans un rayon plus large.' },
        { tier: 2, nom: "Recharge automatique du ciblage", description: `Lorsqu'un [icone fusil automatique] "fusil automatique" est \xE9quip\xE9, \xE9liminer des combattants recharge votre arme \xE9quip\xE9e et augmente temporairement les d\xE9g\xE2ts d'arme. Les frags quand vous \xEAtes encercl\xE9 octroient un bonus de progression.` }
      ],
      3: [
        { tier: 3, nom: "Transfert prismatique", description: "Quand vous utilisez votre Super, chaque membre de votre escouade avec un type de Super diff\xE9rent du v\xF4tre gagne de d\xE9g\xE2ts." },
        { tier: 3, nom: "Lame d'argent", description: `Lorsque vous avez de la "charge d'armure", infliger des d\xE9g\xE2ts avec un \xE9p\xE9e consomme un cumul de charge d'armure et renforce votre [icone \xE9p\xE9e] "\xE9p\xE9e" pendant un court moment, lui octroyant des d\xE9g\xE2ts bonus et de l'\xE9nergie de vitesse de charge.` },
        { tier: 3, nom: "Ab\xEEme d\xE9ploy\xE9", description: 'Les sources "abyssales" infligent des d\xE9g\xE2ts aux cibles "affaiblies".' },
        { tier: 3, nom: "Broyeur de bouclier", description: `Lorsque vous avez "Maille tiss\xE9e", "Armure de givre"ou un "Surbouclier abyssal", votre "M\xEAl\xE9e" se recharge plus vite et inflige plus de d\xE9g\xE2ts. Lorsque vous \xEAtes sous l'effet d'"Amplificateur" ou de "Radiance", votre "Grenade" se recharge plus vite et inflige plus de d\xE9g\xE2ts.` },
        { tier: 3, nom: "Transfert", description: `Les d\xE9g\xE2ts de "Grenade" et de "M\xEAl\xE9e" augmentent lorsque vous \xEAtes sous l'effet de "Transcendance". Les frags avec une arme en \xE9tant sous l'effet de "Transcendance" rechargent votre \xE9nergie de "Lumi\xE8re" et de "T\xE9n\xE8bres" une fois la Transcendance termin\xE9e.` },
        { tier: 3, nom: "M\xE9ditation du tireur", description: `Les tirs au [icone fusil de pr\xE9cision] "fusil de pr\xE9cision" octroient un cumul de d\xE9g\xE2ts de fusil de pr\xE9cision, de stabilit\xE9 et de bonus de rechargement. Les tirs au fusil de pr\xE9cision avec munitions lourdes compte pour plus d'un tir.` },
        { tier: 3, nom: "Choc et effroi", description: `Lorsqu'une doctrine [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" ou "Prismatique" est \xE9quip\xE9e, les frags "cryo-\xE9lectriques" sous l'effet d'"Amplificateur" attirent un \xE9clair qui inflige des d\xE9g\xE2ts ainsi que des "Secousses" aux cibles.` }
      ]
    }
  },
  {
    id: "queensfoil-censer",
    nom: "Encensoir \xE0 feuilles de Reine",
    nomEn: "Queensfoil Censer",
    itemHash: 3518286241,
    saison: "Wish",
    elements: ["solaire", "stase", "filobscur"],
    soutientCinetique: false,
    armes: ["Rocket Launcher", "Grenade Launchers"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Fi\xE8vre et Frisson", description: 'Les tirs de pr\xE9cision rapides avec des armes [icone solaire] "Solaires" conf\xE8rent "Raidance". Les tirs de pr\xE9cision rapides avec des armes [icone stase] "Stasiques" conf\xE8rent "Armure de Givre".' },
        { tier: 1, nom: "Torche", description: `Lorsque "Radiance" est actif, les d\xE9g\xE2ts d'arme inflig\xE9s aux combattants victimes de malus [icone filobscure] "filobscur" et [icone stasique] "stasique" augmentent.` },
        { tier: 1, nom: "Coeur de flamme", description: 'Lancer votre Super solaire propage "Radiance" aux alli\xE9s et les d\xE9g\xE2ts du Super augmentent en fonction des alli\xE9s proches.' },
        { tier: 1, nom: "Sp\xE9cialiste des armures", description: "Briser le bouclier d'un combattant vous conf\xE8re temporairement de la r\xE9sistance aux d\xE9g\xE2ts et des d\xE9g\xE2ts de m\xEAl\xE9e augment\xE9s." },
        { tier: 1, nom: "Voeu d'existence", description: "Quand votre Super est presque enti\xE8rement charg\xE9, les frags de comp\xE9tence font appara\xEEtre des orbes de puissance." },
        { tier: 1, nom: "Allume-feu", description: `Lorsque "Radiance" est actif, les armes [icone solaire] "solaire" infligent des "Blessures solaires" aux cibles qui n'en sont pas encore victimes.` },
        { tier: 1, nom: "Rayon de souffle", description: `Les frags rapides par [icone lance-roquettes] lance-roquettes et [icone lance-grenade] lance-grenades conf\xE8rent de la "charge d'armure".` }
      ],
      2: [
        { tier: 2, nom: "Orbes effilochants", description: 'Ramasser un "orbe de puissance" ou un "Enchev\xEAtrement" conf\xE8re des "munitions effilochantes" aux armes [icone filobscur] "filobscures".' },
        { tier: 2, nom: "Pilier de glace", description: 'Eliminer une cible "gel\xE9e" fait appara\xEEtre des cristaux de "stase".' },
        { tier: 2, nom: "Explosion revitalisante", description: `Etourdir un Champion provoque un "Embrasement" et annule l'\xE9tourdissement de votre bouclier.` },
        { tier: 2, nom: "Coiffe anti-Champions", description: "Les [icone lance-roquettes] lance-roquettes infligent plus de d\xE9gats aux Champions." },
        { tier: 2, nom: "Morsure du Dragon", description: `Briser le bouclier d'un combattant avec une arme [icone filobscure] filobscure ou [icone stasique] stasique offre une chance de "suspendre" ou "geler" ce combattant.` },
        { tier: 2, nom: "Frisson insidieux", description: `Les frags [icone stasique] "stasiques" face aux cibles "ralenties" ou "gel\xE9es" rel\xE2chent une explosion qui "ralentit" les combattants et conf\xE8re "Armure de Givre" aux alli\xE9s pris dans l'explosion.` },
        { tier: 2, nom: "Destruction perp\xE9tuelle", description: 'Les frags rapidesavec des [icone lance-roquettes] "lance-roquettes" non exotiques rechargent les munitions et augmentent la vitesse de rechargement pendant une courte dur\xE9e.' }
      ],
      3: [
        { tier: 3, nom: "Transport de horde", description: `Les d\xE9g\xE2ts d'arme inflig\xE9s aux cibles "effiloch\xE9es" font parfois appara\xEEtre une "Brindille". Les Brindilles "sectionnent" les cibles \xE0 qui elles infligent des d\xE9gats.` },
        { tier: 3, nom: "Appel de temp\xEAte", description: 'Briser des cibles "gel\xE9es" et des cristaux de "stase" augmente les d\xE9g\xE2ts. Briser des cristaux de "stase" lib\xE8re des \xE9clats de glace qui infligent des d\xE9g\xE2ts aux cibles et les "ralentissent".' },
        { tier: 3, nom: "Rayons de pr\xE9cision", description: 'Lorsque "Radiance" est activ\xE9e, les frags de pr\xE9cision [icone solaire] "solaire" embrasent les combattants.' },
        { tier: 3, nom: "Op\xE9rateur solitaire", description: "Lorsque vous \xEAtes l'unique membre de votre escouade, les frags \xE0 l'arme de pr\xE9cision augmentent les d\xE9g\xE2ts d'arme jusqu'\xE0 ce que vous soyez \xE9limin\xE9." },
        { tier: 3, nom: "Artillerie d'argent", description: `Les tirs au [icone lance-roquettes] lance-roquettes consomment un cumul de "charge d'armure", augmentant les d\xE9g\xE2ts et la vitesse de rechargement jusqu'\xE0 ce que vous rechargiez ou rangiez votre lance-roquettes.` },
        { tier: 3, nom: "Regard glacial", description: 'Quand "Armure de Givre" est active, les frags de pr\xE9cision [icone stasique] "stasique" poussent les combattants \xE0 lib\xE9rer une rafale de "gel".' },
        { tier: 3, nom: "En Lambeaux", description: `INfliger des d\xE9g\xE2ts continus \xE0 des cibles victimes de "Sectionnement" les "effiloche". Eliminer une cible "sectionn\xE9e" cr\xE9e un point d'\xE9nergie [icone filobscure] filobscure et conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches pendant une courte dur\xE9e.` }
      ]
    }
  },
  {
    id: "npa-repulsion-regulator",
    nom: "R\xE9gulateur r\xE9pulsif ANP",
    nomEn: "NPA Repulsion Regulator",
    itemHash: 2785855278,
    saison: "Deep",
    elements: ["arc", "abyssal", "filobscur"],
    soutientCinetique: false,
    armes: ["Glaive", "Auto Rifles"],
    perksParTier: {
      1: [
        { tier: 1, nom: "Effilochage am\xE9lior\xE9", description: 'Augmente la quantit\xE9 de d\xE9g\xE2ts inflig\xE9s en "Effilochant une cible.' },
        { tier: 1, nom: "Flux volatil", description: 'Ramasser un orbe de puissance conf\xE8re des "munitions volatiles" \xE0 vos armes [icone abyssale] "abyssales".' },
        { tier: 1, nom: "Jusqu'\xE0 la br\xE8che", description: 'Eliminer une cible qui subit un "malus [icone abyssale] abyssal" cr\xE9e une "Br\xE8che abyssale" quand vous avez votre doctrine abyssale ou prismatique \xE9quip\xE9e.' },
        { tier: 1, nom: "Energis\xE9", description: `Vous restez plus longtemps sous l'effet d'"Amplificateur" quand vous avez votre doctrine cryo-\xE9lectrique ou prismatique \xE9quip\xE9e.` },
        { tier: 1, nom: "Riposte foudroyante", description: `Conf\xE8re un bonus de d\xE9g\xE2ts au "Super cryo-\xE9lectrique" si ce dernier est activ\xE9durant une blessure critique ou sous l'effet d'"Amplificateur". Dure jusqu'\xE0 la fin de l'activation du Super.` },
        { tier: 1, nom: "Tir soutenu", description: 'Infliger des d\xE9g\xE2ts \xE0 des combattants ou soigner des alli\xE9s en continu avec un [icone fusil automatique] "fusil automatique" vous conf\xE8re une r\xE9sistance aux d\xE9g\xE2ts.' },
        { tier: 1, nom: "Orbes de brisure", description: "La premi\xE8re fois que vous brisez le bouclier d'un combattant, vous cr\xE9ez un orbe de puissance si vous le faitesavec le type de d\xE9g\xE2ts correspondant." }
      ],
      2: [
        { tier: 2, nom: "Soldat de filobscur", description: 'Vos armes [icone filobscur] filobscures ont des "munitions effilochantes" d\xE8s que vous obtenez "Maille tiss\xE9e" quand vousavez votre doctrine filobscure ou prismatique \xE9quip\xE9e.' },
        { tier: 2, nom: "Glaive neutralisant", description: `Blesser des combattants avec votre [icone glaive] glaive les "neutralise" et les emp\xEAche temporairement d'utiliser des "comp\xE9tences".` },
        { tier: 2, nom: "Br\xE8che protectrice", description: 'Ramasser une "Br\xE8che abyssale" vous procure un "surbouclier" suppl\xE9mentaire ou restaure votre "surbouclier abyssale".' },
        { tier: 2, nom: "Charge de contre", description: `Gagnez une "charge d'armure" quand vous \xE9tourdissez un Champion.` },
        { tier: 2, nom: "Briques de l'au-del\xE0", description: "Vaincre un combattant puissant avec une arme [icone abyssale] abyssale donne une chance de g\xE9n\xE9rer de la progression de munitions lourdes pour vous et vos co\xE9quipiers." },
        { tier: 2, nom: "Grenades \xE0 surcharge", description: `Les grenades abyssales perturbent les combattants et les "\xE9tourdissent", ralentissant la r\xE9g\xE9n\xE9ration d'\xE9nergie de comp\xE9tence et r\xE9duisant les d\xE9g\xE2ts inflig\xE9s par un combattant. Efficace contre les [icone surcharg\xE9] Champions surcharg\xE9s.` },
        { tier: 2, nom: "Recharge automatique du ciblage", description: `Lorsqu'un [icone fusil automatique] "fusil automatique" est \xE9quip\xE9, \xE9liminer des combattants recharge votre arme \xE9quip\xE9e et augmente temporairement les d\xE9g\xE2ts d'arme. Les frags quand vous \xEAtes encercl\xE9 octroient un bonus de progression.` }
      ],
      3: [
        { tier: 3, nom: "Aiguille cosmique conductrice", description: "Les cibles affect\xE9es par des malus de [icone filobscur] filobscur subissent plus de d\xE9g\xE2ts des comp\xE9tences [icone abyssal] abyssales et [icone cryo-\xE9lectrique] cryo-\xE9lectriques." },
        { tier: 3, nom: "Choc et effroi", description: `Lorsqu'une doctrine [icone cryo-\xE9lectrique] "Cryo-\xE9lectrique" ou "Prismatique" est \xE9quip\xE9e, les frags "cryo-\xE9lectriques" sous l'effet d'"Amplificateur" attirent un \xE9clair qui inflige des d\xE9g\xE2ts ainsi que des "Secousses" aux cibles.` },
        { tier: 3, nom: "Supernova", description: 'Ramasser une "Br\xE8che abyssale" permet \xE0 votre prochaine source de d\xE9g\xE2ts abyssaux de cr\xE9er un grand rayon "affaiblissant".' },
        { tier: 3, nom: "Chef d'\xE9quipe", description: `R\xE9aliser un coup de gr\xE2ce sous l'effet d'"Amplificateur" conf\xE8re "Amplificateur" aux alli\xE9s proches. R\xE9aliser un coup de gr\xE2ce sous l'effet d'"Maille tiss\xE9e" conf\xE8re "Maille tiss\xE9e" aux alli\xE9s proches. R\xE9aliser un coup de gr\xE2ce sous l'effet d'"D\xE9voration" conf\xE8re "D\xE9voration" aux alli\xE9s proches.` },
        { tier: 3, nom: "Deuxi\xE8me coup de foudre", description: "Apr\xE8s avoir jet\xE9 une grenade cryo-\xE9lectrique, vous obtenez une recharge de grenade am\xE9lior\xE9e pendant un bref moment. Les frags cryo-\xE9lectriques augmentent la dur\xE9e de ce bonus." },
        { tier: 3, nom: "Garde passive agressive", description: "Vous subissez moins de d\xE9g\xE2ts des combattants proches quand vous maniez un [icone de glaive] glaive." },
        { tier: 3, nom: "Canalisation d'arme abyssale", description: "Vous gagnez un bonue temporaire aux d\xE9gats d'arme [icone abyssale] abyssale apr\xE8s avoir vaincu une cible avec une arme [icone abyssale] abyssale alors qu'au moins une de vos comp\xE9tences abyssales est totalement charg\xE9e. Ces bonus augmentent en fonction de votre nombre de comp\xE9tences abyssales totalement charg\xE9es." }
      ]
    }
  }
];

// src/lib/scoring/sourcePayoff.ts
init_define_import_meta_env();
var MARQUEURS_SOURCE = [
  "applique",
  "appliquent",
  "inflige",
  "infligent",
  "octroie",
  "octroient",
  "confere",
  "conferent",
  "accorde",
  "accordent",
  "rend",
  "rendent",
  "genere",
  "generent",
  "provoque",
  "provoquent",
  "declenche",
  "declenchent",
  "cause",
  "causent",
  "devenez",
  "gagnez",
  "obtenez",
  // FR : ⚠️ AJOUT (26/08/2026) - verbes de dégâts génériques, manquants
  // jusqu'ici. Beaucoup de descriptions d'aptitude (mêlées surtout) suivent
  // le patron « [Endommage/Blesse/Touche/Frappe] et [debuff] la cible » -
  // sans ces verbes, la seule chose reconnue dans la phrase était le mot-clé
  // du debuff lui-même, jamais un marqueur SOURCE, ce qui la faisait tomber
  // en indéterminé (ou pire, en payoff avant le retrait des marqueurs bruts
  // ci-dessus). Trouvé via le signalement utilisateur sur la mêlée stasique.
  // EN: ⚠️ ADDED - generic damage verbs. Many ability descriptions (melees
  // especially) follow the pattern "[Damages/Hits/Strikes] and [debuffs] the
  // target" - without these verbs, nothing in the sentence was recognised as
  // a SOURCE marker, pushing it to indeterminate (or worse, payoff before
  // the bare-marker removal above). Found via the user's report on the
  // Stasis melee.
  "endommage",
  "endommagent",
  "blesse",
  "blessent",
  "touche",
  "touchent",
  "frappe",
  "frappent",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine
  // transmises par l'utilisateur) - formes en "-ant" (gérondif),
  // totalement absentes jusqu'ici alors qu'elles sont fréquentes dans ce
  // corpus ("conferant un cumul de Charge éclair à chaque coup" - Sentinelle
  // ionique). Trouvé en faisant tourner les 387 textes réels à travers le
  // moteur de détection et en examinant chaque "payoff orphelin"/
  // "indéterminé" un par un.
  // EN: ⚠️ ADDED - gerund ("-ing") forms, entirely absent until now despite
  // being common in this corpus. Found by running the 387 real doctrine
  // texts through the detection engine.
  "appliquant",
  "infligeant",
  "octroyant",
  "conferant",
  "accordant",
  "rendant",
  "generant",
  "provoquant",
  "declenchant",
  "causant",
  "endommageant",
  "blessant",
  "touchant",
  "frappant",
  "vous etes",
  "grants",
  "applies",
  "inflicts",
  "causes",
  "makes",
  "become",
  "gain",
  "creates",
  // FR : ⚠️ ENRICHI (04/08/2026) - tournures manquantes révélées par un build
  // solaire réel de l'utilisateur, où "Ignition" et "Soin" restaient
  // "indéterminés" alors qu'ils sont clairement appliqués. Le vocabulaire des
  // effets de soin/restauration était particulièrement mal couvert.
  // EN: ⚠️ ENRICHED (2026-08-04) - missing turns of phrase revealed by a real
  // solar build where "Ignition" and "Cure" stayed "undetermined" though
  // clearly applied. Healing/restoration vocabulary was poorly covered.
  "vous soigne",
  "vous soignent",
  "soigne",
  "soignent",
  "restaure",
  "restaurent",
  "regenere",
  "regenerent",
  "amorce",
  "amorcent",
  "produit",
  "produisent",
  "emet",
  "emettent",
  "libere",
  "liberent",
  "active",
  "activent",
  "octroyant",
  "infligeant",
  "appliquant",
  "creant",
  "generant",
  "declenchant",
  "vous beneficiez",
  "beneficiez",
  "commence",
  "commencent",
  "heals",
  "restores",
  "triggers",
  "start",
  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS, ajoutés parce que les
  // perks d'artefact viennent de la base de connaissance rédigée en anglais.
  // Le test avant/après a montré que la couverture anglaise était bien plus
  // faible que la française (13 marqueurs contre 57), ce qui faisait tomber
  // ces textes en « indéterminé » — soit 18 points au lieu de 35 pour une
  // vraie boucle. Le déséquilibre pénalisait donc le build de l'utilisateur
  // pour une raison qui n'a rien à voir avec sa qualité.
  //
  // Le manque principal : j'avais mis les formes CONJUGUÉES ("grants",
  // "applies") mais pas les INFINITIFS, or l'anglais des perks les emploie
  // massivement après un auxiliaire ("have a chance to jolt", "can apply").
  //
  // EN: ⚠️ ENRICHED (2026-08-04) - ENGLISH markers. Artifact perks come from
  // the English knowledge base, and English coverage was far thinner than
  // French (13 vs 57), pushing those texts into "undetermined" - 18 points
  // instead of 35 for a real loop. Main gap: I had CONJUGATED forms
  // ("grants", "applies") but not INFINITIVES, which English perk text uses
  // heavily after an auxiliary.
  "have a chance to",
  "chance to",
  "apply",
  "applying",
  "grant",
  "granting",
  "inflict",
  "inflicting",
  "cause",
  "causing",
  "create",
  "creating",
  "generate",
  "generating",
  "emit",
  "emits",
  "emitting",
  "spawn",
  "spawns",
  "spawning",
  "trigger",
  "triggering",
  "heal",
  "healing",
  "restore",
  "restoring",
  "become",
  "becoming",
  "activating",
  "activate",
  "on kill",
  "final blows",
  "final blow",
  "rapidly defeating",
  "you are",
  "you have"
];
var MARQUEURS_PAYOFF = [
  "affecte par",
  "affectee par",
  "affectees par",
  "affectes par",
  "sous l'effet",
  // FR : ⚠️ AJOUT (26/08/2026, audit des 387 compétences de doctrine) -
  // variante au pluriel manquante. Trouvé sur "Charge inflexible" (Titan
  // Cryo-électrique) : « Sous LES EFFETS d'Amplificateur, le bouclier
  // bloque... » - ne matchait pas "sous l'effet" (singulier), la seule
  // forme couverte jusqu'ici.
  // EN: ⚠️ ADDED - missing plural variant, found on a real Titan aspect.
  "sous les effets",
  "contre des",
  "contre les",
  "contre une",
  "vaincre",
  "vainquez",
  "en vainquant",
  "detruire",
  "eliminer",
  "elimine une cible",
  "sur des cibles",
  "sur les cibles",
  // FR : ⚠️ RETIRÉ (26/08/2026) - "cibles", "ennemis", "combattants" étaient
  // listés ICI comme des marqueurs PAYOFF bruts (sans qualification), ce qui
  // causait un FAUX POSITIF massif et systématique : une phrase SOURCE tout
  // à fait normale comme « Ralentit les combattants proches » ou « Endommage
  // et ralentit les cibles à proximité » place presque toujours le mot
  // "cibles"/"combattants"/"ennemis" juste APRÈS le verbe de debuff, à
  // quelques caractères - plus proche que n'importe quel marqueur source
  // situé plus tôt dans la phrase. Résultat : `classerOccurrence` classait
  // ces phrases (qui APPLIQUENT clairement le verbe) en PAYOFF, menant à un
  // "payoff_orphelin" (0 pt + avertissement "ce perk ne se déclenchera
  // jamais") sur des perks parfaitement fonctionnels.
  //
  // Signalé par l'utilisateur (26/08) : la mêlée stasique en jeu applique
  // bien Ralentissement (confirmé par le surlignage cyan sur "Ralentir"
  // dans sa description), mais le Pilier 2 la classait en "quelque chose
  // les exploite alors que RIEN ne les applique" - ce qui cassait aussi
  // toute la chaîne Ralentissement → Gel → Brisure → Armure de givre en
  // aval, puisque le parcours en largeur ne démarre que depuis un verbe
  // ayant une vraie source.
  //
  // Reproduit et vérifié sur un script isolé (sans dépendances lourdes) :
  // "Ralentit les combattants proches." passait de {payoff: true} à
  // {indetermine: true} après ce retrait - un résultat sûr (crédit partiel,
  // pas de fausse alerte) plutôt qu'un résultat faux. Les formes QUALIFIÉES
  // ("contre des/les cibles", "sur des/les cibles") restent en place : elles
  // signalent un vrai payoff ("contre les cibles gelées" = la cible est
  // DÉJÀ affectée), contrairement à "cibles" seul qui ne présume rien sur
  // l'ordre sujet/effet.
  //
  // EN: ⚠️ REMOVED - "cibles"/"ennemis"/"combattants" were listed here as
  // BARE payoff markers, causing a massive systematic FALSE POSITIVE: a
  // perfectly normal SOURCE sentence like "Slows nearby combatants" almost
  // always places the target noun right AFTER the debuff verb - closer than
  // any source marker earlier in the sentence. Result: such sentences (which
  // clearly APPLY the verb) were classified as PAYOFF, producing a
  // "payoff_orphelin" (0 pts + "this perk will never trigger" warning) on
  // perfectly functional perks. Reported by the user: the Stasis melee
  // applies Slow (confirmed cyan-highlighted in its description) but Pillar
  // 2 classified it as an orphaned payoff - which also broke the entire
  // downstream chain (Slow → Freeze → Shatter → Frost Armor), since the
  // breadth-first traversal only starts from a verb with a real source.
  // Reproduced and verified in an isolated script: removing this marker
  // flips "Slows nearby combatants." from {payoff: true} to {indetermine:
  // true} - a SAFE outcome (partial credit, no false alarm) rather than a
  // wrong one. The QUALIFIED forms stay in place since they signal a real
  // payoff without assuming word order.
  "affected by",
  "against",
  "defeating",
  "defeat",
  "destroying",
  "damaging",
  // FR : ⚠️ ENRICHI (04/08/2026) - marqueurs ANGLAIS de payoff, même raison
  // que ci-dessus. "while" est le plus utile : l'anglais des perks exprime
  // très souvent la CONDITION d'un bonus par "While Amplified, ..." — ce qui
  // est bien un payoff (on profite d'un état déjà actif), et non une source.
  // EN: ⚠️ ENRICHED - English payoff markers. "while" matters most: perk text
  // often states a bonus's CONDITION as "While Amplified, ...", which is a
  // payoff (benefiting from an already-active state), not a source.
  "while",
  "when you have",
  "whenever",
  "targets affected",
  "affected targets",
  "on defeating",
  "after defeating",
  "versus",
  "against targets",
  "against enemies",
  "empowered by",
  "benefit from",
  "increased damage",
  "bonus damage",
  "deal more",
  "more damage to"
];
var FENETRE = 55;
function classerOccurrence(texteNormalise, positionMotCle) {
  const debut = Math.max(0, positionMotCle - FENETRE);
  let avant2 = texteNormalise.slice(debut, positionMotCle);
  let apres2 = texteNormalise.slice(positionMotCle, positionMotCle + FENETRE);
  const finPhrasePrecedente = Math.max(avant2.lastIndexOf("."), avant2.lastIndexOf("!"), avant2.lastIndexOf("?"));
  if (finPhrasePrecedente !== -1) avant2 = avant2.slice(finPhrasePrecedente + 1);
  const finsPhraseSuivante = [".", "!", "?"].map((c) => {
    const i = apres2.indexOf(c);
    return i === -1 ? Infinity : i;
  });
  const finPhraseSuivante = Math.min(...finsPhraseSuivante);
  if (finPhraseSuivante !== Infinity) apres2 = apres2.slice(0, finPhraseSuivante + 1);
  let distanceSource = Infinity;
  for (const m3 of MARQUEURS_SOURCE) {
    const i = avant2.lastIndexOf(m3);
    if (i !== -1) distanceSource = Math.min(distanceSource, avant2.length - i);
    const j = apres2.indexOf(m3);
    if (j !== -1) distanceSource = Math.min(distanceSource, j);
  }
  let distancePayoff = Infinity;
  for (const m3 of MARQUEURS_PAYOFF) {
    const i = avant2.lastIndexOf(m3);
    if (i !== -1) distancePayoff = Math.min(distancePayoff, avant2.length - i);
    const j = apres2.indexOf(m3);
    if (j !== -1) distancePayoff = Math.min(distancePayoff, j);
  }
  if (distanceSource === Infinity && distancePayoff === Infinity) return "indetermine";
  return distanceSource <= distancePayoff ? "source" : "payoff";
}
function analyserTexte(texte, motsCles, motsClesStricts = []) {
  const t = normaliser(texte);
  const roles = { source: false, payoff: false, indetermine: false };
  for (const motCle of motsCles) {
    const cle = normaliser(motCle);
    let position = t.indexOf(cle);
    while (position !== -1) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
      position = t.indexOf(cle, position + cle.length);
    }
  }
  for (const motCle of motsClesStricts) {
    const cle = normaliser(motCle);
    for (const position of positionsMotCleStrict(t, cle)) {
      const role = classerOccurrence(t, position);
      roles[role] = true;
    }
  }
  return roles;
}

// src/lib/manifest/doctrine.ts
init_define_import_meta_env();

// src/lib/manifest/antiChampionExotiques.ts
init_define_import_meta_env();

// src/data/exotiquesAntiChampion.ts
init_define_import_meta_env();
var REFERENCE_EXOTIQUES_ANTI_CHAMPION = [
  { nom: "Belle Affaire", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Sturm", emplacement: "cinetique", champion: "implacable" },
  { nom: "Aile de Vigilance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Empereur des Rats", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Outil multifonction MIDA", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Garance", emplacement: "cinetique", champion: "implacable" },
  { nom: "Le Lapin de Jade", emplacement: "cinetique", champion: "implacable" },
  { nom: "L'opportun", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE8gne de Suros", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cerberus+1", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Tueur de Souhaits", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Malveillance", emplacement: "cinetique", champion: "implacable" },
  { nom: "As de Pique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "La Gouvernante", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Fardeau d'Izanagi", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Derni\xE8res paroles", emplacement: "cinetique", champion: "implacable" },
  { nom: "Arbal\xE8te", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Chardon", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Infection parfaite", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Lumina", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Poup\xE9e vaudou", emplacement: "cinetique", champion: "implacable" },
  { nom: "Monte-Carlo", emplacement: "cinetique", champion: "implacable" },
  { nom: "Bastion", emplacement: "cinetique", champion: "implacable" },
  { nom: "Tr\xE9sor ass\xE9ch\xE9", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Elu du Voyageur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Rapace noir", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Trop long \xE0 expliquer", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "R\xE9cit d'un homme mort", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Cryosth\xE9sie 77k", emplacement: "cinetique", champion: "implacable" },
  { nom: "Sceptre d'Ager", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Pr\xE9d\xE9cesseur", emplacement: "cinetique", champion: "implacable" },
  { nom: "Osteo Striga", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Once de m\xE9chancet\xE9", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Temp\xEAte de vif-argent", emplacement: "cinetique", champion: "implacable" },
  { nom: "R\xE9vision z\xE9ro", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Dernier avertissement", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Finalit\xE9 conditionnelle", emplacement: "cinetique", champion: "implacable" },
  { nom: "Courbe verglac\xE9e", emplacement: "cinetique", champion: "implacable" },
  { nom: "Outil de folie", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Le Navigateur", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Gouffre n\xE9crotique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Garde-souhaits", emplacement: "cinetique", champion: "implacable" },
  { nom: "Khvostov 7G-0X", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Euphonie", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Al\xE9thonyme", emplacement: "cinetique", champion: "implacable" },
  { nom: "Neo Finis Terr\xE6", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Tumulus dyadique", emplacement: "cinetique", champion: "surcharge" },
  { nom: "Nouveau Malpais", emplacement: "cinetique", champion: "implacable" },
  { nom: "Lame praxique", emplacement: "cinetique", champion: "bloqueur" },
  { nom: "Ombre de Cull", emplacement: "cinetique", champion: "implacable" },
  { nom: "C\u0153ur de glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impitoyable", emplacement: "energie", champion: "implacable" },
  { nom: "Lion de guerre", emplacement: "energie", champion: "implacable" },
  { nom: "Rayon de soleil", emplacement: "energie", champion: "implacable" },
  { nom: "Lance du graviton", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment des Embraseurs", emplacement: "energie", champion: "bloqueur" },
  { nom: "Borealis", emplacement: "energie", champion: "bloqueur" },
  { nom: "Casse-cou", emplacement: "energie", champion: "surcharge" },
  { nom: "Ombres et lumi\xE8re", emplacement: "energie", champion: "surcharge" },
  { nom: "Cristal de Prom\xE9th\xE9e", emplacement: "energie", champion: "surcharge" },
  { nom: "T\xE9lesto", emplacement: "energie", champion: "surcharge" },
  { nom: "Lance de Polaris", emplacement: "energie", champion: "bloqueur" },
  { nom: "Goule trinitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Diviseur d'ondes", emplacement: "energie", champion: "surcharge" },
  { nom: "Seigneur des Loups", emplacement: "energie", champion: "implacable" },
  { nom: "Le Monarque", emplacement: "energie", champion: "surcharge" },
  { nom: "J\xF6tunn", emplacement: "energie", champion: "implacable" },
  { nom: "Tarrabah", emplacement: "energie", champion: "bloqueur" },
  { nom: "Serment d'\xC9riana", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divinit\xE9", emplacement: "energie", champion: "surcharge" },
  { nom: "Sym\xE9trie", emplacement: "energie", champion: "surcharge" },
  { nom: "Ruines du Diable", emplacement: "energie", champion: "implacable" },
  { nom: "Pochette d'allumettes de Tommy", emplacement: "energie", champion: "surcharge" },
  { nom: "Le Quatri\xE8me Cavalier", emplacement: "energie", champion: "implacable" },
  { nom: "Effigie d\xE9sastreuse", emplacement: "energie", champion: "implacable" },
  { nom: "Dualit\xE9", emplacement: "energie", champion: "implacable" },
  { nom: "Frappe nuageuse", emplacement: "energie", champion: "bloqueur" },
  { nom: "Divination de Ticuu", emplacement: "energie", champion: "implacable" },
  { nom: "Ex\xE9g\xE8se du Vex", emplacement: "energie", champion: "bloqueur" },
  { nom: "Impulsion Lorentz", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame de comp\xE9tition", emplacement: "energie", champion: "surcharge" },
  { nom: "Lame d'action", emplacement: "energie", champion: "bloqueur" },
  { nom: "Lame d'intention", emplacement: "energie", champion: "implacable" },
  { nom: "Messager mort", emplacement: "energie", champion: "implacable" },
  { nom: "Obligation collective", emplacement: "energie", champion: "bloqueur" },
  { nom: "Tombe d\xE9licate", emplacement: "energie", champion: "surcharge" },
  { nom: "L'Intrus", emplacement: "energie", champion: "bloqueur" },
  { nom: "La Manticore", emplacement: "energie", champion: "surcharge" },
  { nom: "Hi\xE9rarchie des besoins", emplacement: "energie", champion: "implacable" },
  { nom: "Vexcalibur", emplacement: "energie", champion: "surcharge" },
  { nom: "Dallage", emplacement: "energie", champion: "implacable" },
  { nom: "Centrifuse", emplacement: "energie", champion: "surcharge" },
  { nom: "Ex Diris", emplacement: "energie", champion: "implacable" },
  { nom: "Chorale solitaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Lign\xE9e enterr\xE9e", emplacement: "energie", champion: "bloqueur" },
  { nom: "Mort rouge reform\xE9e", emplacement: "energie", champion: "implacable" },
  { nom: "Chasse \xE0 l'aff\xFBt", emplacement: "energie", champion: "bloqueur" },
  { nom: "Ergo Sum solaire", emplacement: "energie", champion: null },
  { nom: "Ergo Sum abyssale", emplacement: "energie", champion: null },
  { nom: "Ergo Sum cryo-\xE9lectrique", emplacement: "energie", champion: null },
  { nom: "Brise-glace", emplacement: "energie", champion: "bloqueur" },
  { nom: "Croc du Bourreau", emplacement: "energie", champion: "surcharge" },
  { nom: "Guide stellaire", emplacement: "energie", champion: "surcharge" },
  { nom: "Troisi\xE8me it\xE9ration", emplacement: "energie", champion: "bloqueur" },
  { nom: "Pique du graviton", emplacement: "energie", champion: "surcharge" },
  { nom: "Hoirie", emplacement: "energie", champion: "implacable" },
  { nom: "Girouette", emplacement: "energie", champion: "bloqueur" },
  { nom: "Le Prospecteur", emplacement: "lourde", champion: "implacable" },
  { nom: "Bobine de Wardcliff", emplacement: "lourde", champion: "implacable" },
  { nom: "Canon tracteur", emplacement: "lourde", champion: "surcharge" },
  { nom: "L\xE9gende d'Acrius", emplacement: "lourde", champion: "surcharge" },
  { nom: "D.A.R.C.I.", emplacement: "lourde", champion: "surcharge" },
  { nom: "La Colonie", emplacement: "lourde", champion: "surcharge" },
  { nom: "Ligne d'univers z\xE9ro", emplacement: "lourde", champion: "implacable" },
  { nom: "Image de l'Esprit dormant", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Murmure du Ver", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Mille voix", emplacement: "lourde", champion: "implacable" },
  { nom: "Renard \xE0 deux queues", emplacement: "lourde", champion: "surcharge" },
  { nom: "Griffe noire", emplacement: "lourde", champion: "surcharge" },
  { nom: "Le Parjure", emplacement: "lourde", champion: "implacable" },
  { nom: "Maitre du tonnerre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Anarchie", emplacement: "lourde", champion: "surcharge" },
  { nom: "V\xE9rit\xE9", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du L\xE9viathan", emplacement: "lourde", champion: "implacable" },
  { nom: "X\xE9nophage", emplacement: "lourde", champion: "implacable" },
  { nom: "La Faucheuse", emplacement: "lourde", champion: "surcharge" },
  { nom: "H\xE9ritage \xE9vident", emplacement: "lourde", champion: "surcharge" },
  { nom: "Poigne du Salut", emplacement: "lourde", champion: "implacable" },
  { nom: "Regard du lendemain", emplacement: "lourde", champion: "implacable" },
  { nom: "Lamentation", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Gjallarhorn", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Parasite", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Grande ouverture", emplacement: "lourde", champion: "implacable" },
  { nom: "Cardiombre", emplacement: "lourde", champion: "surcharge" },
  { nom: "Chaos d\xE9terministe", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Morsure hivernale", emplacement: "lourde", champion: "implacable" },
  { nom: "Souffle du dragon", emplacement: "lourde", champion: "implacable" },
  { nom: "Microcosme", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Foreuse finale", emplacement: "lourde", champion: "implacable" },
  { nom: "Ovation tourbillonnante", emplacement: "lourde", champion: "bloqueur" },
  { nom: "Aconit", emplacement: "lourde", champion: "implacable" },
  { nom: "Service de Luzaku", emplacement: "lourde", champion: "surcharge" },
  { nom: "Fafnir", emplacement: "lourde", champion: "implacable" }
];

// src/lib/manifest/antiChampionExotiques.ts
function normaliserNomArme(nom) {
  return nom.replace(/œ/gi, "oe").replace(/æ/gi, "ae").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’'`´]/g, "'").replace(/[^a-z0-9'+.]+/g, " ").trim();
}
var ELEMENTS_VARIANTES = ["cryo electrique", "electrique", "solaire", "abyssale", "abyssal", "stase", "cryo", "vide", "arc", "filaments"];
function construireTable() {
  const table = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) table.set(normaliserNomArme(e.nom), e.champion);
  const variantes = /* @__PURE__ */ new Map();
  for (const e of REFERENCE_EXOTIQUES_ANTI_CHAMPION) {
    const nom = normaliserNomArme(e.nom);
    const suffixe = ELEMENTS_VARIANTES.find((el) => nom.endsWith(" " + el));
    if (!suffixe) continue;
    const base = nom.slice(0, nom.length - suffixe.length - 1).trim();
    if (base) variantes.set(base, [...variantes.get(base) ?? [], e.champion]);
  }
  for (const [base, valeurs] of variantes) {
    if (valeurs.length >= 2 && valeurs.every((v) => v === valeurs[0]) && !table.has(base)) table.set(base, valeurs[0]);
  }
  return table;
}
var TABLE = construireTable();
function championDeReference(nomArme) {
  if (!nomArme) return void 0;
  const v = TABLE.get(normaliserNomArme(nomArme));
  return v === void 0 ? void 0 : v;
}
function championSynergieMIDA(nomArme, nomArmature) {
  if (!nomArme || !nomArmature) return void 0;
  if (!normaliserNomArme(nomArmature).includes("synergie mida")) return void 0;
  const nom = normaliserNomArme(nomArme);
  if (/\bpolyvalent\b/.test(nom)) return "surcharge";
  if (/\bmacro\b/.test(nom)) return "implacable";
  return void 0;
}

// src/lib/bungie/oauth.ts
init_define_import_meta_env();

// src/lib/manifest/doctrine.ts
var MOTS_PIECE_MAITRESSE = ["piece maitresse", "masterwork", "maitresse", "catalyseur", "catalyst"];
function obtenirCategorieSocketsParIndex(db2, itemHash) {
  const resultat = /* @__PURE__ */ new Map();
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets) return resultat;
  const nomCategorieParSocket = /* @__PURE__ */ new Map();
  for (const cat of def.sockets.socketCategories ?? []) {
    const catDef = obtenirDefinition(db2, "DestinySocketCategoryDefinition", cat.socketCategoryHash);
    const nom = normaliser(catDef?.displayProperties?.name ?? "");
    for (const idx of cat.socketIndexes) nomCategorieParSocket.set(idx, nom);
  }
  def.sockets.socketEntries.forEach((entree, index) => {
    let hashesOptions = (entree.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    if (hashesOptions.length === 0 && entree.reusablePlugSetHash) {
      const plugSet = obtenirDefinition(db2, "DestinyPlugSetDefinition", entree.reusablePlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.randomizedPlugSetHash) {
      const plugSet = obtenirDefinition(db2, "DestinyPlugSetDefinition", entree.randomizedPlugSetHash);
      hashesOptions = (plugSet?.reusablePlugItems ?? []).map((p) => p.plugItemHash);
    }
    if (hashesOptions.length === 0 && entree.singleInitialItemHash) {
      hashesOptions = [entree.singleInitialItemHash];
    }
    if (hashesOptions.length === 0) return;
    const defOption = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hashesOptions[0]);
    const description = defOption?.displayProperties?.description ?? "";
    if (!description || description.includes("\u2022")) return;
    const nomCategorie = nomCategorieParSocket.get(index) ?? "";
    const nomOption = normaliser(defOption?.displayProperties?.name ?? "");
    if (MOTS_CATEGORIE_COSMETIQUE.some((m3) => nomCategorie.includes(m3))) return;
    if (MOTS_OPTION_COSMETIQUE.some((m3) => nomOption.includes(m3) || normaliser(description).includes(m3))) return;
    if (normaliser(description).includes("effet visuel festif")) return;
    if (normaliser(description).includes("ornement d'arme") || normaliser(description).includes("weapon ornament")) return;
    const estPieceMaitresse = MOTS_PIECE_MAITRESSE.some((m3) => nomCategorie.includes(m3) || nomOption.includes(m3));
    resultat.set(index, estPieceMaitresse ? "piece_maitresse" : "perk_exotique");
  });
  return resultat;
}
var LIBELLES_STAT_DOCTRINE = {
  sante: ["sante", "health"],
  melee: ["corps a corps", "melee"],
  grenade: ["grenade"],
  super: ["super"],
  classe: ["classe", "class", "competence de classe", "class ability"],
  arme: ["arme", "armes", "weapon", "weapons"]
};
function resoudreStatKeyDoctrine(nomStat) {
  const nomNormalise = normaliser(nomStat);
  for (const [cle, libelles] of Object.entries(LIBELLES_STAT_DOCTRINE)) {
    if (libelles.some((l) => nomNormalise.includes(l))) return cle;
  }
  return void 0;
}
function obtenirBonusStatsPlug(db2, hash) {
  const bonus = {};
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
  for (const investissement of def?.investmentStats ?? []) {
    const defStat = obtenirDefinition(db2, "DestinyStatDefinition", investissement.statTypeHash);
    const cle = defStat?.displayProperties?.name ? resoudreStatKeyDoctrine(defStat.displayProperties.name) : void 0;
    if (cle) bonus[cle] = (bonus[cle] ?? 0) + investissement.value;
  }
  return bonus;
}
function obtenirBonusStatsDoctrine(db2, subclass) {
  const total = {};
  for (const hash of [...subclass.fragmentHashes, ...subclass.aspectHashes]) {
    if (!hash) continue;
    const bonus = obtenirBonusStatsPlug(db2, hash);
    for (const [cle, valeur] of Object.entries(bonus)) {
      total[cle] = (total[cle] ?? 0) + valeur;
    }
  }
  return total;
}
var MOTS_CONDITION_DEBLOCAGE = [
  "debloquer cette amelioration",
  "unlock this upgrade",
  // FR : ⚠️ AJOUT (04/08/2026) - texte GÉNÉRIQUE de la Pièce maîtresse
  // ("Améliore cette arme en Pièce maîtresse..."), commun à toutes les
  // armes, confirmé par capture d'écran (souligné en bleu par
  // l'utilisateur sur "Le Chardon").
  // EN: ⚠️ ADDED (2026-08-04) - GENERIC masterwork text ("Upgrades this
  // weapon into a Masterwork..."), common to all weapons, confirmed by
  // screenshot (underlined in blue by the user on "The Thorn").
  "ameliore cette arme en piece maitresse",
  "upgrades this weapon into a masterwork",
  "beneficiera alors de capacites ameliorees",
  "will benefit from enhanced capabilities"
];
function retirerConditionsDeblocage(texte) {
  if (!texte) return texte;
  return texte.split(/(?<=[.!?])\s+/).filter((phrase) => !MOTS_CONDITION_DEBLOCAGE.some((m3) => normaliser(phrase).includes(m3))).join(" ").trim();
}
function obtenirDescriptionComplete(db2, hash) {
  const defOption = obtenirDefinition(db2, "DestinyInventoryItemDefinition", hash);
  if (!defOption?.displayProperties) return { description: "", estOrnement: false };
  const morceaux = [];
  if (defOption.displayProperties.description) morceaux.push(defOption.displayProperties.description);
  if (defOption.perks) {
    for (const perk of defOption.perks) {
      const defPerk = obtenirDefinition(db2, "DestinySandboxPerkDefinition", perk.perkHash);
      const texte = defPerk?.displayProperties?.description;
      if (texte && !morceaux.includes(texte)) morceaux.push(texte);
    }
  }
  const texteBrut = morceaux.join(" ");
  const nomNormalise = normaliser(defOption.displayProperties.name ?? "");
  const estOrnement = normaliser(texteBrut).includes("ornement d'arme") || normaliser(texteBrut).includes("weapon ornament") || nomNormalise.includes("ornement d'origine") || nomNormalise.includes("origin ornament");
  const description = retirerConditionsDeblocage(texteBrut);
  return { description, estOrnement };
}
var MOTS_CATEGORIE_COSMETIQUE = ["souvenir", "memento", "ornement", "ornament", "suivi", "tracker"];
var MOTS_OPTION_COSMETIQUE = ["palier", "compte-frags", "compte frags", "souvenir", "suivi", "memento:"];
var CACHE_ANTI_CHAMPION = /* @__PURE__ */ new WeakMap();
function obtenirAntiChampion(db2, itemHash) {
  let cacheBase = CACHE_ANTI_CHAMPION.get(db2);
  if (!cacheBase) {
    cacheBase = /* @__PURE__ */ new Map();
    CACHE_ANTI_CHAMPION.set(db2, cacheBase);
  }
  const enCache = cacheBase.get(itemHash);
  if (enCache !== void 0) return enCache ?? void 0;
  const resultat = calculerAntiChampion(db2, itemHash);
  cacheBase.set(itemHash, resultat ?? null);
  return resultat;
}
function calculerAntiChampion(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const estAncienneVersion = !!def?.itemCategoryHashes?.includes(3109687656);
  const emplacementArme = ["cinetique", "energie", "lourde"].includes(BUCKET_HASH_VERS_SLOT[def?.inventory?.bucketTypeHash ?? -1] ?? "");
  const copieFactice = estAncienneVersion && emplacementArme;
  if (def && (def.itemType === 3 && (def.inventory?.tierType === 6 || estAncienneVersion) || copieFactice)) {
    const reference = championDeReference(def.displayProperties?.name);
    if (reference !== void 0) return reference ?? void 0;
  }
  return deduireAntiChampion(db2, itemHash);
}
function deduireAntiChampion(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  if (!def) return void 0;
  const PAR_ENUM = {
    1: "bloqueur",
    // ShieldPiercing
    2: "surcharge",
    // Disruption
    3: "implacable"
    // Stagger
  };
  if (def.breakerType && PAR_ENUM[def.breakerType]) return PAR_ENUM[def.breakerType];
  const entrees = def.sockets?.socketEntries ?? [];
  const hashIntrinseque = entrees[0]?.singleInitialItemHash;
  if (hashIntrinseque) {
    const defIntrinseque = obtenirDefinition(
      db2,
      "DestinyInventoryItemDefinition",
      hashIntrinseque
    );
    const texte = normaliser(
      `${defIntrinseque?.displayProperties?.name ?? ""} ${defIntrinseque?.displayProperties?.description ?? ""}`
    );
    for (const { jeton, type } of JETONS_CHAMPION) {
      if (texte.includes(jeton)) return type;
    }
  }
  const nomArmature = obtenirNomArmature(db2, def);
  if (nomArmature) {
    const mida = championSynergieMIDA(def.displayProperties?.name, nomArmature);
    if (mida) return mida;
    const a = normaliser(nomArmature).replace(/['']/g, "");
    for (const { motCle, champion } of ARMATURE_VERS_CHAMPION) {
      if (a.includes(motCle)) return champion;
    }
  }
  return void 0;
}
var ARMATURE_VERS_CHAMPION = [
  // Cas particuliers documentés, à tester avant la règle générale.
  // FR : ⚠️ AJOUT (04/08/2026) - lot d'armatures relevées EN JEU par
  // l'utilisateur. Le Manifest ne portant pas cette information, chacune
  // vient d'une observation directe. Les mots-clés sont réduits à leur
  // partie distinctive (leçon "rayon"/"rayons" et "precis"/"precision") :
  // ils restent ainsi tolérants aux variantes de formulation Bungie.
  // EN: ⚠️ ADDED (2026-08-04) - batch of frames observed IN GAME by the
  // user. The Manifest doesn't carry this, so each comes from direct
  // observation. Keywords are reduced to their distinctive part so they
  // tolerate Bungie's wording variants.
  { motCle: "interruption", champion: "bloqueur" },
  // FR : ⚠️ AJOUT (24/08/2026) - confirmé par l'utilisateur en jeu.
  { motCle: "lanceur", champion: "bloqueur" },
  { motCle: "impact eleve", champion: "implacable" },
  // FR : ⚠️ CORRIGÉ (24/08/2026) - "ensemble" seul matchait AUSSI "Ensemble
  // à jamais" (Together Forever, Drang/Zenith), qui d'après les
  // observations de l'utilisateur ne donne JAMAIS Implacable (mais Bloqueur
  // ou Surchargé selon l'arme combinée - voir plus bas, cas volontairement
  // non codé). Toute arme utilisant Together Forever recevait donc une
  // réponse FAUSSE. Rétréci à "tir d'ensemble", qui ne matche plus que
  // Felwinter's Lie.
  // EN: ⚠️ FIXED - "ensemble" alone also matched "Together Forever"
  // (Drang/Zenith), which per the user's observations NEVER gives
  // Implacable. Any Together Forever weapon got a WRONG answer. Narrowed to
  // "tir d'ensemble", matching only Felwinter's Lie now.
  { motCle: "tir densemble", champion: "implacable" },
  { motCle: "pr-55", champion: "bloqueur" },
  // "Cadre Héritage PR-55" (Estoc de Redrix)
  { motCle: "attaque", champion: "implacable" },
  { motCle: "soutien", champion: "surcharge" },
  // FR : les deux variantes "calorifique" connues donnent Surchargé. Elles
  // sont listées séparément plutôt que via un "calorifique" générique :
  // si une 3e variante apparaît avec un autre champion, elle affichera le
  // repère "?" au lieu d'hériter silencieusement d'une valeur fausse.
  { motCle: "calorifique equilibree", champion: "surcharge" },
  { motCle: "calorifique dynamique", champion: "surcharge" },
  { motCle: "tir double", champion: "implacable" },
  { motCle: "rafale lourde", champion: "implacable" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Micro-missile", relevé en jeu par
  // l'utilisateur. Même situation que "Tir dispersé" : le Manifest ne
  // porte pas l'information, la correspondance vient d'une observation
  // directe. Placé AVANT la règle générale : le mot-clé est spécifique et
  // ne risque pas d'être capté par une entrée plus large.
  // EN: ⚠️ ADDED (2026-08-04) - "Micro-missile", observed in game by the
  // user. Same situation as "Tir dispersé": the Manifest doesn't carry
  // it, the mapping comes from direct observation.
  { motCle: "micro-missile", champion: "implacable" },
  { motCle: "deni de zone", champion: "surcharge" },
  // confirmé en jeu par l'utilisateur (04/08/2026)
  { motCle: "zone de deni", champion: "surcharge" },
  // Règle générale.
  { motCle: "agressive", champion: "implacable" },
  { motCle: "agressif", champion: "implacable" },
  { motCle: "fort impact", champion: "implacable" },
  { motCle: "haut impact", champion: "implacable" },
  // FR : ⚠️ CORRIGÉ (04/08/2026) - "precision" ratait "Cadre de munition
  // PRÉCIS" (Héritage) : le mot-clé était plus long que le texte réel.
  // "precis" couvre les deux formes, même leçon que "rayon"/"rayons".
  { motCle: "precis", champion: "bloqueur" },
  { motCle: "adaptative", champion: "bloqueur" },
  { motCle: "adaptatif", champion: "bloqueur" },
  { motCle: "legere", champion: "surcharge" },
  { motCle: "leger", champion: "surcharge" },
  { motCle: "tir rapide", champion: "surcharge" },
  // FR : ⚠️ AJOUT (04/08/2026) - "Tir dispersé" (relevé sur Sarpédon-D,
  // un Revolver). Le Manifest ne portait RIEN pour cette arme
  // (breakerType = 0 partout, aucun perk porteur) : la correspondance
  // vient d'une observation directe en jeu par l'utilisateur, seule
  // source disponible. Placé près de "tir rapide" par parenté de
  // formulation, mais les deux mots-clés sont distincts (pas de
  // chevauchement possible).
  // EN: ⚠️ ADDED (2026-08-04) - "Tir dispersé" (Scatter Fire, observed on
  // Sarpedon-D, a Hand Cannon). The Manifest carried NOTHING for this
  // weapon (breakerType = 0 everywhere, no perk holding it): the mapping
  // comes from the user's direct in-game observation, the only available
  // source.
  { motCle: "tir disperse", champion: "surcharge" },
  // Épées (armatures spécifiques).
  { motCle: "projection", champion: "bloqueur" },
  { motCle: "vortex", champion: "surcharge" },
  { motCle: "onde", champion: "implacable" }
];
function obtenirNomArmature(db2, def) {
  const entrees = def.sockets?.socketEntries ?? [];
  if (entrees.length === 0) return void 0;
  const hash = entrees[0]?.singleInitialItemHash;
  if (!hash) return void 0;
  const defPlug = obtenirDefinition(
    db2,
    "DestinyInventoryItemDefinition",
    hash
  );
  return defPlug?.displayProperties?.name;
}
var INDEX_SETS = /* @__PURE__ */ new WeakMap();
function construireIndexSets(db2) {
  const index = /* @__PURE__ */ new Map();
  try {
    const stmt = db2.prepare("SELECT json FROM DestinyEquipableItemSetDefinition");
    while (stmt.step()) {
      const set = JSON.parse(String(stmt.getAsObject().json));
      if (!set.setItems?.length) continue;
      const perks = (set.setPerks ?? []).map((p) => {
        const defPerk = obtenirDefinition(
          db2,
          "DestinySandboxPerkDefinition",
          p.sandboxPerkHash
        );
        return {
          requiredSetCount: p.requiredSetCount,
          nom: defPerk?.displayProperties?.name ?? "?",
          description: defPerk?.displayProperties?.description ?? "",
          icone: urlIcone(defPerk?.displayProperties?.icon)
        };
      }).sort((a, b) => a.requiredSetCount - b.requiredSetCount);
      const bonus = { nomSet: set.displayProperties?.name ?? "?", perks };
      for (const hash of set.setItems) index.set(hash, bonus);
    }
    stmt.free();
  } catch {
  }
  return index;
}
function obtenirBonusSet(db2, itemHash) {
  let index = INDEX_SETS.get(db2);
  if (!index) {
    index = construireIndexSets(db2);
    INDEX_SETS.set(db2, index);
  }
  return index.get(itemHash);
}
function obtenirCapaciteFragmentsAspect(db2, aspectHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", aspectHash);
  if (!def) return 0;
  const direct = def.plug?.energyCapacity?.capacityValue;
  if (typeof direct === "number") return direct;
  for (const s2 of def.investmentStats ?? []) {
    const defStat = obtenirDefinition(
      db2,
      "DestinyStatDefinition",
      s2.statTypeHash
    );
    if (normaliser(defStat?.displayProperties?.name ?? "").includes("aspect")) return s2.value;
  }
  return 0;
}
function obtenirNbSlotsFragments(db2, aspectHashes) {
  return aspectHashes.filter((h) => h && h !== 0).reduce((total, h) => total + obtenirCapaciteFragmentsAspect(db2, h), 0);
}
var JETONS_CHAMPION = [
  { jeton: "chancellement", type: "implacable" },
  { jeton: "perforation de bouclier", type: "bloqueur" },
  { jeton: "perturbation", type: "surcharge" }
];
var MARQUEURS_NEUTRALISATION = [
  "champion",
  "etourdi",
  "etourdit",
  "etourdir",
  "etourdissement",
  "stun",
  "stagger",
  "neutralise"
];
var CACHE_ANTI_CHAMPION_ARMURE = /* @__PURE__ */ new WeakMap();
function obtenirAntiChampionArmure(db2, itemHash) {
  let cache = CACHE_ANTI_CHAMPION_ARMURE.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    CACHE_ANTI_CHAMPION_ARMURE.set(db2, cache);
  }
  const enCache = cache.get(itemHash);
  if (enCache !== void 0) return enCache ?? void 0;
  const resultat = calculerAntiChampionArmure(db2, itemHash);
  cache.set(itemHash, resultat ?? null);
  return resultat;
}
function calculerAntiChampionArmure(db2, itemHash) {
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  if (!def?.sockets?.socketEntries) return void 0;
  const PAR_ENUM = {
    1: "bloqueur",
    2: "surcharge",
    3: "implacable"
  };
  if (def.breakerType && PAR_ENUM[def.breakerType]) {
    return { type: PAR_ENUM[def.breakerType], source: "champ breakerType de l'armure" };
  }
  const categories = obtenirCategorieSocketsParIndex(db2, itemHash);
  if (!categories) return void 0;
  for (const [index, categorie] of categories.entries()) {
    if (categorie !== "perk_exotique") continue;
    const hash = def.sockets.socketEntries[index]?.singleInitialItemHash;
    if (!hash) continue;
    const defPerk = obtenirDefinition(
      db2,
      "DestinyInventoryItemDefinition",
      hash
    );
    const nom = defPerk?.displayProperties?.name ?? "";
    const texte = normaliser(`${nom} ${defPerk?.displayProperties?.description ?? ""}`);
    for (const { jeton, type } of JETONS_CHAMPION) {
      if (texte.includes(jeton)) return { type, source: nom };
    }
    if (!MARQUEURS_NEUTRALISATION.some((m3) => texte.includes(m3))) continue;
    if (texte.includes("surcharg")) return { type: "surcharge", source: nom };
    if (texte.includes("bloqueur")) return { type: "bloqueur", source: nom };
    if (texte.includes("implacable")) return { type: "implacable", source: nom };
  }
  return void 0;
}
var ENUM_VERS_ELEMENT = {
  2: "arc",
  3: "solaire",
  4: "abyssal",
  // 5: Raid - type de dégâts spécial, aucun des 6 éléments de doctrine, volontairement absent de cette table.
  6: "stase",
  7: "filobscur"
};
var CACHE_ELEMENT_ARME = /* @__PURE__ */ new WeakMap();
function obtenirElementArme(db2, itemHash) {
  let cache = CACHE_ELEMENT_ARME.get(db2);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    CACHE_ELEMENT_ARME.set(db2, cache);
  }
  if (cache.has(itemHash)) return cache.get(itemHash) ?? null;
  const def = obtenirDefinition(db2, "DestinyInventoryItemDefinition", itemHash);
  const resultat = ENUM_VERS_ELEMENT[def?.defaultDamageType ?? 0] ?? null;
  cache.set(itemHash, resultat);
  return resultat;
}

// src/lib/scoring/armorSets.ts
init_define_import_meta_env();
function obtenirBonusSetsActifs(armure, db2) {
  const parSet = /* @__PURE__ */ new Map();
  for (const piece of armure) {
    const set = obtenirBonusSet(db2, piece.itemHash);
    if (!set) continue;
    const entree = parSet.get(set.nomSet) ?? { count: 0, perks: set.perks };
    entree.count += 1;
    parSet.set(set.nomSet, entree);
  }
  const actifs = [];
  for (const [nomSet, { count, perks }] of parSet) {
    for (const p of perks) {
      if (p.requiredSetCount <= count) {
        actifs.push({ nomSet, nbPieces: count, nom: p.nom, description: p.description, requiredSetCount: p.requiredSetCount });
      }
    }
  }
  return actifs;
}
function scoreBonusSetsReels(armure, db2) {
  if (!db2) {
    return { score: 50, details: ["Bonus de Set : Manifest non charg\xE9, non \xE9valu\xE9"] };
  }
  const parSet = /* @__PURE__ */ new Map();
  for (const piece of armure) {
    const set = obtenirBonusSet(db2, piece.itemHash);
    if (!set) continue;
    const entree = parSet.get(set.nomSet) ?? { count: 0, perks: set.perks };
    entree.count += 1;
    parSet.set(set.nomSet, entree);
  }
  if (parSet.size === 0) {
    return {
      score: 40,
      details: ["Aucun bonus de Set actif \u2014 les sets sont un plus, pas une obligation"]
    };
  }
  const details = [];
  let meilleur = 0;
  for (const [nom, { count, perks }] of parSet) {
    const actifs = perks.filter((p) => p.requiredSetCount <= count);
    if (actifs.length === 0) {
      const prochain = Math.min(...perks.map((p) => p.requiredSetCount));
      details.push(`Set \xAB ${nom} \xBB : ${count} pi\xE8ce(s), il en faut ${prochain} pour le premier bonus`);
      continue;
    }
    details.push(
      `\u2705 Set \xAB ${nom} \xBB : ${count} pi\xE8ces \u2192 ${actifs.map((p) => `${p.requiredSetCount}p ${p.nom}`).join(", ")}`
    );
    meilleur = Math.max(meilleur, actifs.length >= 2 ? 100 : 75);
  }
  return { score: meilleur || 50, details };
}

// src/lib/scoring/verbes.ts
function calculerConfiance(aSourceEffectif, aPayoff, aIndetermine) {
  if (!aSourceEffectif && !aPayoff && !aIndetermine) return "absent";
  if (aSourceEffectif && aPayoff) return "boucle";
  if (aSourceEffectif) return "source_seule";
  if (aPayoff) return "payoff_orphelin";
  return "indetermine";
}
function detecterVerbes(textes, catalogue = CATALOGUE_VERBES) {
  const textesNormalises = textes.map(normaliser);
  return catalogue.map((verbe) => {
    const motsCles = [...verbe.motsClesFr, ...verbe.motsClesEn];
    const motsClesNormalises = motsCles.map(normaliser);
    const motsClesStricts = [...verbe.motsClesStrictsFr ?? [], ...verbe.motsClesStrictsEn ?? []];
    const motsClesStrictsNormalises = motsClesStricts.map(normaliser);
    const indexTextesCorrespondants = textesNormalises.map(
      (t, i) => motsClesNormalises.some((m3) => t.includes(m3)) || motsClesStrictsNormalises.some((m3) => positionsMotCleStrict(t, m3).length > 0) ? i : -1
    ).filter((i) => i >= 0);
    const nbMentions = indexTextesCorrespondants.length;
    const sources = [
      ...new Set(
        indexTextesCorrespondants.map((i) => textes[i].split(" \u2014 ")[0]?.trim()).filter((nom) => !!nom)
      )
    ];
    let aSource = false;
    let aPayoff = false;
    let aIndetermine = false;
    for (const i of indexTextesCorrespondants) {
      const roles = analyserTexte(textes[i], motsCles, motsClesStricts);
      aSource = aSource || roles.source;
      aPayoff = aPayoff || roles.payoff;
      aIndetermine = aIndetermine || roles.indetermine;
    }
    if (verbe.sourceImplicite && nbMentions > 0) {
      aSource = true;
    }
    if (verbe.sourcesForcees?.some((cond) => conditionVerifiee(normaliser(cond), textesNormalises))) {
      aSource = true;
    }
    const confiance = calculerConfiance(aSource, aPayoff, aIndetermine);
    return { verbe, nbMentions, aSource, aPayoff, aIndetermine, sources, confiance };
  });
}
function extraireTextesDoctrineBuild(build2, db2) {
  const textes = [];
  function ajouterDepuisHash(hash, table) {
    if (!hash) return;
    const def = obtenirDefinition(db2, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db2, hash);
    const texte = [nom, description].filter(Boolean).join(" \u2014 ");
    if (texte) textes.push(texte);
  }
  ajouterDepuisHash(build2.subclass.superHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build2.subclass.meleeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build2.subclass.grenadeHash, "DestinyInventoryItemDefinition");
  ajouterDepuisHash(build2.subclass.classeHash, "DestinyInventoryItemDefinition");
  for (const h of build2.subclass.aspectHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  for (const h of build2.subclass.fragmentHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  return textes;
}
function extraireTextesEffetsBuild(build2, db2) {
  const textes = extraireTextesDoctrineBuild(build2, db2);
  function ajouterDepuisHash(hash, table) {
    if (!hash) return;
    const def = obtenirDefinition(db2, table, hash);
    const nom = def?.displayProperties?.name;
    if (!nom) return;
    const { description } = obtenirDescriptionComplete(db2, hash);
    const texte = [nom, description].filter(Boolean).join(" \u2014 ");
    if (texte) textes.push(texte);
  }
  for (const piece of [...build2.armes, ...build2.armure]) {
    for (const h of piece.perkHashes) ajouterDepuisHash(h, "DestinyInventoryItemDefinition");
  }
  for (const cle of build2.artifact.perkCles ?? []) {
    const [idArtefact, tier, ...resteNom] = cle.split(":");
    const nomPerk = resteNom.join(":");
    const artefact = ARTEFACTS.find((a) => a.id === idArtefact);
    const perk = artefact?.perksParTier[Number(tier)]?.find((p) => p.nom === nomPerk);
    if (perk) textes.push(`${perk.nom} \u2014 ${perk.description}`);
  }
  for (const bonus of obtenirBonusSetsActifs(build2.armure, db2)) {
    textes.push(`${bonus.nom} \u2014 ${bonus.description}`);
  }
  return textes;
}
function scoreVerbesDetectes(verbesDetectes) {
  const details = [];
  const boucles = verbesDetectes.filter((v) => v.confiance === "boucle");
  const sourcesSeules = verbesDetectes.filter((v) => v.confiance === "source_seule");
  const orphelins = verbesDetectes.filter((v) => v.confiance === "payoff_orphelin");
  const indetermines = verbesDetectes.filter((v) => v.confiance === "indetermine");
  if (boucles.length + sourcesSeules.length + orphelins.length + indetermines.length === 0) {
    return {
      score: 20,
      details: ["Aucun verbe d'\xE9l\xE9ment d\xE9tect\xE9 dans les aspects/fragments/perks du build"]
    };
  }
  function ajouterGroupe(icone, commentaire, verbes) {
    if (verbes.length === 0) return;
    details.push(`${icone} ${commentaire}`);
    for (const v of verbes) {
      const sourcesUtiles = v.sources.filter(
        (s2) => normaliser(s2) !== normaliser(v.verbe.nomFr) && normaliser(s2) !== normaliser(v.verbe.nomEn)
      );
      const suffixe = sourcesUtiles.length > 0 ? ` (${sourcesUtiles.join(", ")})` : "";
      details.push(`  ${v.verbe.nomFr}${suffixe}`);
    }
  }
  ajouterGroupe("\u2705", "Boucle compl\xE8te \u2014 le build applique ces effets ET en profite :", boucles);
  ajouterGroupe("\u2139\uFE0F", "Appliqu\xE9s, mais rien dans le build n'en profite :", sourcesSeules);
  ajouterGroupe(
    "\u26A0\uFE0F",
    "Quelque chose les exploite alors que RIEN ne les applique \u2014 ces perks ne se d\xE9clencheront jamais :",
    orphelins
  );
  ajouterGroupe(
    "\u2753",
    "Pr\xE9sents dans le build, mais l'analyse de texte n'a pas su dire s'ils sont appliqu\xE9s ou exploit\xE9s (limite de la d\xE9tection, pas du build) :",
    indetermines
  );
  const score = Math.max(
    0,
    Math.min(100, boucles.length * 35 + sourcesSeules.length * 12 + indetermines.length * 18 + orphelins.length * 6)
  );
  return { score, details };
}
function obtenirChampionsCouverts(build2, db2) {
  const typesCouverts = /* @__PURE__ */ new Set();
  for (const arme3 of build2.armes) {
    const c = obtenirAntiChampion(db2, arme3.itemHash);
    if (c) typesCouverts.add(c);
  }
  for (const piece of build2.armure) {
    if (!piece.isExotic) continue;
    const c = obtenirAntiChampionArmure(db2, piece.itemHash);
    if (c) typesCouverts.add(c.type);
  }
  const textesDoctrine = extraireTextesDoctrineBuild(build2, db2);
  const verbesDetectes = detecterVerbes(textesDoctrine);
  for (const v of verbesDetectes) {
    if (v.nbMentions > 0 && v.verbe.championEtourdi) {
      typesCouverts.add(v.verbe.championEtourdi);
    }
  }
  return typesCouverts;
}
function detecterChainesVerbes(verbesDetectes, textes) {
  const parId = /* @__PURE__ */ new Map();
  for (const v of verbesDetectes) parId.set(v.verbe.id, v);
  const textesNormalises = textes.map(normaliser);
  const maillons = [];
  const dejaAtteints = /* @__PURE__ */ new Set();
  const file = [];
  for (const v of verbesDetectes) {
    if (v.aSource) {
      dejaAtteints.add(v.verbe.id);
      file.push(v.verbe.id);
    }
  }
  while (file.length > 0) {
    const idActuel = file.shift();
    const verbeActuel = parId.get(idActuel);
    if (!verbeActuel?.verbe.produit) continue;
    for (const lien of verbeActuel.verbe.produit) {
      const cibleDetectee = parId.get(lien.verbeId);
      if (!cibleDetectee) continue;
      let actif = true;
      if (lien.conditionnel) {
        actif = conditionVerifiee(normaliser(lien.conditionnel), textesNormalises);
      }
      if (!actif) continue;
      maillons.push({ source: verbeActuel.verbe, cible: cibleDetectee.verbe, etaitConditionnel: !!lien.conditionnel });
      if (!dejaAtteints.has(lien.verbeId)) {
        dejaAtteints.add(lien.verbeId);
        file.push(lien.verbeId);
      }
    }
  }
  return maillons;
}
var MOTS_OUTILS = /* @__PURE__ */ new Set([
  "a",
  "au",
  "aux",
  "avec",
  "ce",
  "ces",
  "cette",
  "d",
  "dans",
  "de",
  "des",
  "du",
  "en",
  "et",
  "est",
  "il",
  "l",
  "la",
  "le",
  "les",
  "leur",
  "lors",
  "lorsque",
  "ou",
  "par",
  "pour",
  "que",
  "qui",
  "quand",
  "sa",
  "se",
  "ses",
  "son",
  "sur",
  "un",
  "une",
  "vos",
  "votre",
  "vous",
  "y",
  "the",
  "of",
  "to",
  "and",
  "or",
  "a",
  "an",
  "in",
  "on",
  "for",
  "with",
  "your",
  "you",
  "that",
  "this",
  "these",
  "is",
  "are",
  "when",
  "while"
]);
function conditionVerifiee(conditionNormalisee, textesNormalises) {
  const motsSignificatifs = conditionNormalisee.split(/[^a-z0-9]+/).filter((m3) => m3.length > 2 && !MOTS_OUTILS.has(m3));
  if (motsSignificatifs.length === 0) {
    return textesNormalises.some((t) => t.includes(conditionNormalisee));
  }
  return textesNormalises.some((t) => motsSignificatifs.every((m3) => t.includes(m3)));
}
function enrichirAvecChaines(verbesDetectes, maillons) {
  const idsAtteintsParChaine = new Set(maillons.map((m3) => m3.cible.id));
  return verbesDetectes.map((v) => {
    if (v.aSource || !idsAtteintsParChaine.has(v.verbe.id)) return v;
    const aSourceEffectif = true;
    const confiance = calculerConfiance(aSourceEffectif, v.aPayoff, v.aIndetermine);
    return { ...v, confiance };
  });
}
function detecterRessourcesGenerees(verbesDetectes, maillons, textes) {
  const idsAtteints = /* @__PURE__ */ new Set();
  for (const v of verbesDetectes) {
    if (v.aSource) idsAtteints.add(v.verbe.id);
  }
  for (const m3 of maillons) {
    idsAtteints.add(m3.cible.id);
  }
  const parId = /* @__PURE__ */ new Map();
  for (const v of verbesDetectes) parId.set(v.verbe.id, v.verbe);
  const textesNormalises = textes.map(normaliser);
  const resultat = [];
  for (const id of idsAtteints) {
    const verbe = parId.get(id);
    if (!verbe?.ressourceGeneree) continue;
    for (const entree of verbe.ressourceGeneree) {
      if (entree.conditionnel) {
        if (!conditionVerifiee(normaliser(entree.conditionnel), textesNormalises)) continue;
      }
      resultat.push({ type: entree.type, verbe });
    }
  }
  return resultat;
}

// src/lib/scoring/pillars.ts
init_define_import_meta_env();

// src/data/piliers.ts
init_define_import_meta_env();
var ORDRE_PILIERS = [
  "element_doctrine",
  "loot_coherence",
  "perks_artefact",
  "verbes_element",
  "stats_2_0"
];

// src/lib/scoring/stats.ts
init_define_import_meta_env();
function sommerStatsArmure(armure) {
  return armure.reduce(
    (acc, piece) => {
      for (const [cle, valeur] of Object.entries(piece.stats)) {
        acc[cle] = (acc[cle] ?? 0) + (valeur ?? 0);
      }
      return acc;
    },
    { sante: 0, melee: 0, grenade: 0, super: 0, classe: 0, arme: 0 }
  );
}
var STAT_TIER_SIZE = 10;
var STAT_MAX = 200;
var STAT_MAX_TIER = STAT_MAX / STAT_TIER_SIZE;
function palier(valeur) {
  const v = Math.max(0, Math.min(valeur, STAT_MAX));
  return Math.min(Math.ceil(v / STAT_TIER_SIZE), STAT_MAX_TIER) || (v > 0 ? 1 : 0);
}
function libellePalier(valeur) {
  return `T${palier(valeur)}`;
}
function verifieExigences(stats, exigences) {
  return exigences.map((exigence) => {
    const palierActuel = palier(stats[exigence.stat] ?? 0);
    return {
      exigence,
      validee: palierActuel >= exigence.palierMinimum,
      palierActuel
    };
  });
}
var POIDS_STATS = {
  neutre: { sante: 1.2, melee: 1, grenade: 1.2, super: 1, classe: 1, arme: 0.6 },
  roaming: { sante: 0.3, melee: 1.2, grenade: 1.5, super: 1, classe: 1.3, arme: 1.7 },
  dps: { sante: 0.3, melee: 0.7, grenade: 1.2, super: 1.8, classe: 0.8, arme: 1.7 },
  pvp: { sante: 1.8, melee: 1.3, grenade: 1.4, super: 0.7, classe: 1.3, arme: 0.5 }
};
var TOTAL_STATS_SET_OPTIMISE = 500;
function scoreStats(stats, exigences = [], contexte = "neutre") {
  const details = [];
  const cles = ["sante", "melee", "grenade", "super", "classe", "arme"];
  const poids = POIDS_STATS[contexte];
  const sommePoids = cles.reduce((acc, cle) => acc + poids[cle], 0);
  const totalPondere = cles.reduce(
    (acc, cle) => acc + Math.min(STAT_MAX, Math.max(0, stats[cle] ?? 0)) * poids[cle],
    0
  );
  const totalNormalise = totalPondere / sommePoids * cles.length;
  let score = totalNormalise / TOTAL_STATS_SET_OPTIMISE * 100;
  const resultatsExigences = verifieExigences(stats, exigences);
  for (const r of resultatsExigences) {
    if (r.validee) {
      details.push(
        `\u2705 ${r.exigence.sourceExotique} : ${r.exigence.stat} \xE0 ${libellePalier(
          stats[r.exigence.stat] ?? 0
        )} (exig\xE9 T${r.exigence.palierMinimum})`
      );
    } else {
      details.push(
        `\u26A0\uFE0F ${r.exigence.sourceExotique} : ${r.exigence.stat} \xE0 ${libellePalier(
          stats[r.exigence.stat] ?? 0
        )}, T${r.exigence.palierMinimum} requis \u2014 bonus du 5e pilier non valid\xE9`
      );
      score = Math.min(score, 60);
    }
  }
  return { score: Math.max(0, Math.min(100, Math.round(score))), details };
}

// src/components/icones/IconeAntiChampion.tsx
init_define_import_meta_env();
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var LIBELLES_CHAMPION = {
  surcharge: "Surcharg\xE9",
  bloqueur: "Bloqueur",
  implacable: "Implacable"
};

// src/lib/scoring/pillars.ts
var POIDS_PILIERS = {
  neutre: { element_doctrine: 0.1, verbes_element: 0.3, perks_artefact: 0.15, loot_coherence: 0.2, stats_2_0: 0.25 },
  roaming: { element_doctrine: 0.1, verbes_element: 0.35, perks_artefact: 0.15, loot_coherence: 0.2, stats_2_0: 0.2 },
  dps: { element_doctrine: 0.1, verbes_element: 0.25, perks_artefact: 0.15, loot_coherence: 0.2, stats_2_0: 0.3 },
  pvp: { element_doctrine: 0.1, verbes_element: 0.2, perks_artefact: 0.1, loot_coherence: 0.2, stats_2_0: 0.4 }
};
function poidsPilier(cle, contexte) {
  return POIDS_PILIERS[contexte][cle];
}
function resoudreDonneesDoctrine(build2, db2) {
  const { subclass } = build2;
  const aspects = (subclass.aspectHashes ?? []).filter((h) => h && h !== 0);
  const fragments = (subclass.fragmentHashes ?? []).filter((h) => h && h !== 0);
  return {
    element: subclass.element,
    nbAspects: aspects.length,
    nbFragments: fragments.length,
    capaciteFragments: db2 ? obtenirNbSlotsFragments(db2, aspects) : 0,
    aspectHashes: aspects,
    fragmentHashes: fragments
  };
}
function scoreElementDoctrine(build2, db2, contexte = "neutre") {
  const donnees = resoudreDonneesDoctrine(build2, db2);
  const details = [];
  let score = 100;
  if (!donnees.element) {
    return {
      pilier: "element_doctrine",
      score: 0,
      poids: poidsPilier("element_doctrine", contexte),
      details: ["Aucune sous-classe choisie \u2014 la doctrine ne peut pas \xEAtre \xE9valu\xE9e"]
    };
  }
  const NB_ASPECTS = 2;
  if (donnees.nbAspects < NB_ASPECTS) {
    const manquants = NB_ASPECTS - donnees.nbAspects;
    score -= manquants * 25;
    details.push(`\u26A0\uFE0F ${manquants} aspect(s) non \xE9quip\xE9(s) sur ${NB_ASPECTS}`);
  } else {
    details.push(`\u2705 Aspects : ${donnees.nbAspects}/${NB_ASPECTS}`);
  }
  if (donnees.capaciteFragments > 0) {
    if (donnees.nbFragments < donnees.capaciteFragments) {
      const inutilises = donnees.capaciteFragments - donnees.nbFragments;
      score -= Math.min(40, inutilises * 15);
      details.push(
        `\u26A0\uFE0F ${inutilises} emplacement(s) de fragment inutilis\xE9(s) (${donnees.nbFragments}/${donnees.capaciteFragments} offerts par vos aspects)`
      );
    } else {
      details.push(
        `\u2705 Fragments : ${donnees.nbFragments}/${donnees.capaciteFragments} \u2014 capacit\xE9 pleinement utilis\xE9e`
      );
    }
  } else if (donnees.nbFragments === 0) {
    score -= 20;
    details.push("\u26A0\uFE0F Aucun fragment s\xE9lectionn\xE9");
  } else {
    details.push(`Fragments : ${donnees.nbFragments} (capacit\xE9 non calculable sans le Manifest)`);
  }
  return { pilier: "element_doctrine", score: Math.max(0, score), poids: poidsPilier("element_doctrine", contexte), details };
}
function scoreVerbesElement(build2, db2, contexte = "neutre") {
  if (!db2) {
    return {
      pilier: "verbes_element",
      score: 50,
      poids: poidsPilier("verbes_element", contexte),
      details: ["Manifest non fourni \u2014 score provisoire (branchez le Manifest pour une vraie d\xE9tection)"]
    };
  }
  const textes = extraireTextesEffetsBuild(build2, db2);
  const verbesDetectes = detecterVerbes(textes);
  const maillons = detecterChainesVerbes(verbesDetectes, textes);
  const verbesEnrichis = enrichirAvecChaines(verbesDetectes, maillons);
  const { score: scoreBoucles, details } = scoreVerbesDetectes(verbesEnrichis);
  if (maillons.length > 0) {
    const parSource = /* @__PURE__ */ new Map();
    for (const m3 of maillons) {
      const entree = parSource.get(m3.source.id) ?? { source: m3.source, cibles: [], conditionnel: false };
      if (!entree.cibles.includes(m3.cible.nomFr)) entree.cibles.push(m3.cible.nomFr);
      if (m3.etaitConditionnel) entree.conditionnel = true;
      parSource.set(m3.source.id, entree);
    }
    for (const { source, cibles, conditionnel } of parSource.values()) {
      details.push(
        `\u26D3\uFE0F ${source.nomFr} \u2192 ${cibles.join(", ")}${conditionnel ? " (condition v\xE9rifi\xE9e)" : ""}`
      );
    }
  }
  const ressources = detecterRessourcesGenerees(verbesDetectes, maillons, textes);
  if (ressources.length > 0) {
    const parType = /* @__PURE__ */ new Map();
    for (const { type, verbe } of ressources) {
      const liste = parType.get(type) ?? [];
      if (!liste.includes(verbe.nomFr)) liste.push(verbe.nomFr);
      parType.set(type, liste);
    }
    const LIBELLES_RESSOURCE = {
      melee: "M\xEAl\xE9e",
      grenade: "Grenade",
      classe: "Comp\xE9tence de classe",
      super: "Super",
      generique: "G\xE9n\xE9rique"
    };
    for (const [type, verbesSources] of parType) {
      details.push(
        `\u{1F50B} \xC9nergie d'aptitude g\xE9n\xE9r\xE9e : ${LIBELLES_RESSOURCE[type] ?? type} \u2014 ${verbesSources.join(", ")}`
      );
    }
    const nbTypesDistincts = parType.size;
    const bonus = Math.min(20, nbTypesDistincts * 6);
    if (bonus > 0) {
      details.push(`\u2728 +${bonus} pts pour la g\xE9n\xE9ration active de ressources (${nbTypesDistincts} type(s) distinct(s))`);
    }
    const scoreFinal = Math.max(0, Math.min(100, scoreBoucles + bonus));
    return { pilier: "verbes_element", score: scoreFinal, poids: poidsPilier("verbes_element", contexte), details };
  }
  return { pilier: "verbes_element", score: scoreBoucles, poids: poidsPilier("verbes_element", contexte), details };
}
function scorePerksArtefact(build2, db2, contexte = "neutre") {
  const details = [];
  const cles = build2.artifact.perkCles ?? [];
  const artefact = ARTEFACTS.find((a) => a.id === build2.artifact.artifactId);
  if (!artefact) {
    return {
      pilier: "perks_artefact",
      score: 0,
      poids: poidsPilier("perks_artefact", contexte),
      details: ["Aucun artefact s\xE9lectionn\xE9 \u2014 choisissez-en un sous \xAB Mon Build \xBB"]
    };
  }
  const remplissage = cles.length / CONTRAINTES_ARTEFACT.perksMax * 100;
  details.push(
    cles.length === CONTRAINTES_ARTEFACT.perksMax ? `\u2705 ${cles.length}/${CONTRAINTES_ARTEFACT.perksMax} emplacements utilis\xE9s` : `\u2139\uFE0F ${cles.length}/${CONTRAINTES_ARTEFACT.perksMax} emplacements utilis\xE9s \u2014 ${CONTRAINTES_ARTEFACT.perksMax - cles.length} perk(s) disponible(s) non pris`
  );
  let coherence = 100;
  const element = build2.subclass.element;
  if (element) {
    if (artefact.elements.includes(element)) {
      details.push(`\u2705 L'artefact soutient votre doctrine ${element}`);
    } else {
      coherence = 30;
      details.push(
        `\u26A0\uFE0F L'artefact ne soutient pas votre doctrine ${element} (il couvre : ${artefact.elements.join(", ")})`
      );
    }
  } else {
    coherence = 50;
    details.push("Aucune sous-classe choisie \u2014 coh\xE9rence non \xE9valuable");
  }
  let synergie = 0;
  if (db2 && cles.length > 0) {
    const buildSansArtefact = { ...build2, artifact: { ...build2.artifact, perkCles: [] } };
    const verbesAilleurs = detecterVerbes(extraireTextesEffetsBuild(buildSansArtefact, db2)).filter((v) => v.nbMentions > 0).map((v) => v.verbe);
    const textesArtefact = cles.map((cle) => {
      const [, tier, ...reste] = cle.split(":");
      const perk = artefact.perksParTier[Number(tier)]?.find(
        (p) => p.nom === reste.join(":")
      );
      return perk ? `${perk.nom} ${perk.description}` : "";
    }).join(" ");
    const textesArtefactNormalise = normaliser(textesArtefact);
    const verbesRenforces = verbesAilleurs.filter((v) => {
      const motsClesLarges = [...v.motsClesFr, ...v.motsClesEn];
      if (motsClesLarges.some((m3) => textesArtefactNormalise.includes(normaliser(m3)))) return true;
      const motsClesStricts = [...v.motsClesStrictsFr ?? [], ...v.motsClesStrictsEn ?? []];
      return motsClesStricts.some((m3) => positionsMotCleStrict(textesArtefactNormalise, normaliser(m3)).length > 0);
    });
    if (verbesRenforces.length > 0) {
      synergie = Math.min(100, verbesRenforces.length * 40);
      details.push(
        `\u2705 Vos perks d'artefact renforcent ${verbesRenforces.length} effet(s) d\xE9j\xE0 pr\xE9sent(s) : ${verbesRenforces.map((v) => v.nomFr).join(", ")}`
      );
    } else {
      details.push(
        "\u2139\uFE0F Aucun perk d'artefact ne renforce un effet d\xE9j\xE0 pr\xE9sent dans le build \u2014 ils fonctionnent ind\xE9pendamment"
      );
    }
  }
  const score = Math.round(remplissage * 0.4 + coherence * 0.3 + synergie * 0.3);
  return { pilier: "perks_artefact", score: Math.max(0, Math.min(100, score)), poids: poidsPilier("perks_artefact", contexte), details };
}
function scoreLootCoherence(build2, db2, contexte = "neutre") {
  const details = [];
  let score = 100;
  const exotiquesArmure = build2.armure.filter((p) => p.isExotic).length;
  if (exotiquesArmure > 1) {
    score -= 100;
    details.push("Plus d'une pi\xE8ce d'armure exotique \xE9quip\xE9e : configuration invalide");
  } else if (exotiquesArmure === 0) {
    score -= 20;
    details.push("Aucune armure exotique : bonus de build non exploit\xE9");
  } else {
    details.push("1 armure exotique \xE9quip\xE9e");
  }
  const exotiquesArmes = build2.armes.filter((p) => p.isExotic).length;
  if (exotiquesArmes > 1) {
    score -= 100;
    details.push("Plus d'une arme exotique \xE9quip\xE9e : configuration invalide");
  } else if (exotiquesArmes === 1) {
    details.push("1 arme exotique \xE9quip\xE9e");
  }
  if (build2.armes.length < 3) {
    score -= (3 - build2.armes.length) * 15;
    details.push(`${build2.armes.length}/3 emplacements d'armes remplis`);
  }
  const { score: scoreSets, details: detailsSets } = scoreBonusSetsReels(build2.armure, db2);
  details.push(...detailsSets);
  let scoreChampion = null;
  if (contexte !== "pvp" && db2) {
    const typesCouverts = obtenirChampionsCouverts(build2, db2);
    const BAREME = [0, 40, 80, 100];
    scoreChampion = BAREME[Math.min(typesCouverts.size, 3)];
    if (typesCouverts.size === 0) {
      details.push("\u26A0\uFE0F Aucune couverture anti-champion d\xE9tect\xE9e sur ce build");
    } else {
      details.push(
        `\u2705 Couverture anti-champion : ${typesCouverts.size}/3 types (${[...typesCouverts].map((t) => LIBELLES_CHAMPION[t]).join(", ")})`
      );
    }
  }
  let scoreElement = null;
  if (build2.subclass.element && build2.subclass.element !== "prismatique") {
    const armesAvecElement = build2.armes.filter((a) => a.itemHash !== 0);
    if (armesAvecElement.length > 0) {
      if (db2) {
        const correspondantes = armesAvecElement.filter((a) => {
          const type = obtenirElementArme(db2, a.itemHash);
          return type === null || type === build2.subclass.element;
        }).length;
        scoreElement = Math.round(correspondantes / armesAvecElement.length * 100);
        if (correspondantes === armesAvecElement.length) {
          details.push(`\u2705 Armes accord\xE9es \xE0 votre doctrine ${build2.subclass.element}`);
        } else if (correspondantes > 0) {
          details.push(
            `\u2139\uFE0F ${correspondantes}/${armesAvecElement.length} arme(s) dans l'\xE9l\xE9ment de la doctrine (${build2.subclass.element}) \u2014 jouable, rarement optimal`
          );
        }
      }
    }
  }
  const POIDS = {
    neutre: { validite: 0, sets: 0.35, champion: 0.5, element: 0.15 },
    roaming: { validite: 0, sets: 0.3, champion: 0.55, element: 0.15 },
    dps: { validite: 0, sets: 0.35, champion: 0.5, element: 0.15 },
    pvp: { validite: 0, sets: 0.75, champion: 0, element: 0.25 }
  }[contexte];
  const composantes = [{ poids: POIDS.sets, valeur: scoreSets }];
  if (scoreChampion !== null) composantes.push({ poids: POIDS.champion, valeur: scoreChampion });
  if (scoreElement !== null) composantes.push({ poids: POIDS.element, valeur: scoreElement });
  const poidsTotal = composantes.reduce((s2, c) => s2 + c.poids, 0);
  const scoreCombine = poidsTotal > 0 ? composantes.reduce((s2, c) => s2 + c.valeur * c.poids, 0) / poidsTotal : scoreSets;
  score = score * 0.6 + scoreCombine * 0.4;
  return { pilier: "loot_coherence", score: Math.max(0, Math.round(score)), poids: poidsPilier("loot_coherence", contexte), details };
}
function scoreStats2(stats, exigences, contexte = "neutre") {
  const { score, details } = scoreStats(stats, exigences, contexte);
  return { pilier: "stats_2_0", score, poids: poidsPilier("stats_2_0", contexte), details };
}
function calculerCompletion(build2, db2) {
  const manquants = [];
  let remplis = 0;
  let total = 0;
  function compter(estRempli, libelle) {
    total += 1;
    if (estRempli) remplis += 1;
    else manquants.push(libelle);
  }
  const armesEquipees = build2.armes.filter((a) => a.itemHash !== 0).length;
  for (let i = 0; i < 3; i++) {
    compter(i < armesEquipees, ["Arme cin\xE9tique", "Arme \xE9nerg\xE9tique", "Arme lourde"][i]);
  }
  const armuresEquipees = build2.armure.filter((a) => a.itemHash !== 0).length;
  for (let i = 0; i < 5; i++) {
    compter(i < armuresEquipees, ["Casque", "Gants", "Torse", "Jambes", "Marque de classe"][i]);
  }
  const s2 = build2.subclass;
  compter(!!s2.element, "Sous-classe");
  compter(!!s2.superHash, "Super");
  compter(!!s2.meleeHash, "M\xEAl\xE9e");
  compter(!!s2.grenadeHash, "Grenade");
  compter(!!s2.classeHash, "Comp\xE9tence de classe");
  compter(!!s2.sautHash, "Saut");
  const NB_ASPECTS = 2;
  const aspects = (s2.aspectHashes ?? []).filter((h) => h && h !== 0);
  for (let i = 0; i < NB_ASPECTS; i++) {
    compter(i < aspects.length, `Aspect ${i + 1}`);
  }
  if (db2 && aspects.length > 0) {
    const capacite = obtenirNbSlotsFragments(db2, aspects);
    const fragments = (s2.fragmentHashes ?? []).filter((h) => h && h !== 0).length;
    for (let i = 0; i < capacite; i++) {
      compter(i < fragments, `Fragment ${i + 1}`);
    }
  }
  compter(!!build2.artifact.artifactId, "Artefact");
  if (build2.artifact.artifactId) {
    const perks = (build2.artifact.perkCles ?? []).length;
    for (let i = 0; i < CONTRAINTES_ARTEFACT.perksMax; i++) {
      compter(i < perks, `Perk d'artefact ${i + 1}`);
    }
  }
  return {
    taux: total > 0 ? Math.round(remplis / total * 100) : 0,
    remplis,
    total,
    manquants
  };
}
function evaluerBuild(build2, exigencesExotiques = [], db2, poidsPersonnalises) {
  const contexte = build2.contexte ?? "neutre";
  const statsTotales = sommerStatsArmure(build2.armure);
  if (db2) {
    const bonusDoctrine = obtenirBonusStatsDoctrine(db2, build2.subclass);
    for (const [cle, valeur] of Object.entries(bonusDoctrine)) {
      statsTotales[cle] = (statsTotales[cle] ?? 0) + valeur;
    }
  }
  const piliers = [
    scoreElementDoctrine(build2, db2, contexte),
    scoreLootCoherence(build2, db2, contexte),
    scorePerksArtefact(build2, db2, contexte),
    scoreVerbesElement(build2, db2, contexte),
    scoreStats2(statsTotales, exigencesExotiques, contexte)
  ];
  if (define_import_meta_env_default.DEV) {
    const ordreReel = piliers.map((p) => p.pilier);
    if (ordreReel.join(",") !== ORDRE_PILIERS.join(",")) {
      console.warn(
        "[scoring] L'ordre du tableau `piliers` ne correspond plus \xE0 ORDRE_PILIERS (data/piliers.ts).",
        { ordreReel, ordreAttendu: ORDRE_PILIERS }
      );
    }
  }
  const piliersPonderes = poidsPersonnalises ? piliers.map((p) => ({ ...p, poids: poidsPersonnalises[p.pilier] ?? p.poids })) : piliers;
  const scoreGlobal = Math.round(piliersPonderes.reduce((acc, p) => acc + p.score * p.poids, 0));
  return {
    buildId: build2.id,
    scoreGlobal,
    piliers: piliersPonderes,
    statsTotales,
    completion: calculerCompletion(build2, db2)
  };
}

// src/data/demoBuild.ts
init_define_import_meta_env();
var demoBuild = {
  id: "demo-1",
  nom: "Arcaniste Abyssal - Devour",
  subclass: {
    classe: null,
    element: null,
    subclassItemHash: 0,
    superHash: 0,
    aspectHashes: [0, 0],
    fragmentHashes: [0, 0, 0],
    meleeHash: 0,
    grenadeHash: 0,
    classeHash: 0,
    sautHash: 0
  },
  artifact: {
    // FR : aucun artefact choisi par défaut, cohérent avec la classe et la
    // sous-classe qui repartent également vides.
    artifactId: void 0,
    perkCles: []
  },
  armes: [
    { itemHash: 0, slot: "cinetique", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "energie", stats: {}, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "lourde", stats: {}, perkHashes: [], isExotic: false }
  ],
  armure: [
    { itemHash: 0, slot: "casque", stats: { sante: 20, grenade: 30, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, slot: "gants", stats: { sante: 10, grenade: 25, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false, setHash: 1002 },
    { itemHash: 0, slot: "torse", stats: { sante: 10, grenade: 20, melee: 10, super: 10, classe: 5, arme: 5 }, perkHashes: [], isExotic: false },
    { itemHash: 0, slot: "jambes", stats: { melee: 30, sante: 20, grenade: 20, super: 5, classe: 5, arme: 5 }, perkHashes: [], isExotic: true },
    { itemHash: 0, slot: "marque", stats: { sante: 10, grenade: 10, melee: 10, super: 10, classe: 10, arme: 10 }, perkHashes: [], isExotic: false }
  ]
};
var demoExigences = [
  { stat: "melee", palierMinimum: 10, sourceExotique: "Exotique de d\xE9monstration" }
];

// tests/logique/fixtures/fauxManifest.ts
init_define_import_meta_env();
var T_OBJET = "DestinyInventoryItemDefinition";
function creerFausseDb(defs, options = {}) {
  const requetes = [];
  const db2 = {
    exec: () => [],
    prepare: (sql) => {
      requetes.push(sql);
      const m3 = /FROM (\w+)(?:\s+WHERE\s+(.*))?$/.exec(sql.trim());
      const table = m3?.[1] ?? "", where = m3?.[2] ?? "";
      const lignes = Object.entries(defs[table] ?? {}).map(([h, d]) => ({ id: hashVersIdSqlite(+h), json: JSON.stringify(d) }));
      let choisies = lignes, courant = -1;
      return {
        bind: (a) => {
          if (/id\s*=\s*\?/.test(where)) choisies = lignes.filter((l) => l.id === a[0]);
        },
        step: () => {
          if (courant === -1) {
            const like = /LIKE\s+'(.*)'/.exec(where);
            if (like) {
              const coeur = like[1].replace(/^%|%$/g, "");
              choisies = lignes.filter((l) => l.json.includes(coeur));
            }
          }
          if (options.ralentirBalayage && /LIKE/.test(where)) {
            const t = Date.now();
            while (Date.now() - t < options.ralentirBalayage) {
            }
          }
          courant++;
          return courant < choisies.length;
        },
        getAsObject: () => ({ id: choisies[courant].id, json: choisies[courant].json }),
        free: () => {
        }
      };
    }
  };
  return { db: db2, requetes };
}

// tests/logique/appliquer-simulation.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", JSON.stringify(detail).slice(0, 500));
};
var arme = (instance, perks, slot = "energie", hash = 5010) => ({ itemHash: hash, itemInstanceId: instance, nom: `Arme ${instance}`, slot, stats: {}, isExotic: false, perkHashes: perks.map(([, h]) => h), perksParColonne: perks.map(([socketIndex, h]) => ({ socketIndex, hash: h })) });
var construire = (armes, armure = []) => ({ ...structuredClone(demoBuild), subclass: { ...structuredClone(demoBuild.subclass), element: "solaire" }, armes, armure });
var sim = (instance, colonnes) => Object.entries(colonnes).reduce((s2, [i, [c, e]]) => choisir(s2, instance, Number(i), { choisi: c, effectif: e }), SIMULATIONS_VIDES());
var w1 = arme("w1", [[1, 100], [2, 200], [3, 300]]);
var copie = appliquerSimulationPiece(w1, sim("w1", { 2: [201, 202] })["armes"]["w1"]);
ok("la colonne simul\xE9e est REMPLAC\xC9E par le perk \xE0 COMPTER (\xAB effectif \xBB, version am\xE9lior\xE9e comprise : 202, pas 201) ; les autres colonnes sont inchang\xE9es et l'ordre des prises est conserv\xE9", JSON.stringify(copie.perkHashes) === JSON.stringify([100, 202, 300]) && JSON.stringify(copie.perksParColonne) === JSON.stringify([{ socketIndex: 1, hash: 100 }, { socketIndex: 2, hash: 202 }, { socketIndex: 3, hash: 300 }]), copie);
ok("la copie porte les rep\xE8res : perks simul\xE9s, perks R\xC9ELS d'origine (pour que \xAB D\xE9tails \xBB marque le vrai roll), nombre de colonnes simul\xE9es", copie.perksSimules === true && JSON.stringify(copie.perkHashesReels) === JSON.stringify([100, 200, 300]) && copie.nbColonnesSimulees === 1);
ok("la pi\xE8ce d'ORIGINE n'est JAMAIS modifi\xE9e (le build enregistr\xE9, partag\xE9 ou \xE9quip\xE9 reste celui des perks r\xE9els)", JSON.stringify(w1.perkHashes) === JSON.stringify([100, 200, 300]) && w1.perksSimules === void 0 && w1.perkHashesReels === void 0);
var ajout = appliquerSimulationPiece(w1, sim("w1", { 7: [700, 701] })["armes"]["w1"]);
ok("une colonne sans perk connu (aucun roll r\xE9el pour cette prise) re\xE7oit le perk simul\xE9 : il est AJOUT\xC9 \xE0 sa place par ordre de prise", JSON.stringify(ajout.perksParColonne.map((p) => p.socketIndex)) === JSON.stringify([1, 2, 3, 7]) && ajout.perkHashes.includes(701));
var plusieurs = appliquerSimulationPiece(w1, sim("w1", { 1: [101, 101], 3: [301, 302] })["armes"]["w1"]);
ok("plusieurs colonnes simul\xE9es \xE0 la fois : toutes appliqu\xE9es, compte exact (2)", JSON.stringify(plusieurs.perkHashes) === JSON.stringify([101, 200, 302]) && plusieurs.nbColonnesSimulees === 2);
ok("sans simulation, avec une simulation vide, ou pour un objet NON poss\xE9d\xE9 (pas d'identifiant d'exemplaire) : la M\xCAME pi\xE8ce est rendue", appliquerSimulationPiece(w1, void 0) === w1 && appliquerSimulationPiece(w1, {}) === w1 && (() => {
  const n = arme(void 0, [[1, 100]]);
  return appliquerSimulationPiece(n, { 1: { choisi: 5, effectif: 5 } }) === n;
})());
var redevenue = pieceReelle(copie);
ok("PI\xC8CE R\xC9ELLE : renvoyer une arme de Mon Build vers la Forge la remet sur son roll R\xC9EL (perks et colonnes d'origine) et retire tous les rep\xE8res de simulation : la Forge part du \u2713 r\xE9el, jamais du roll simul\xE9", JSON.stringify(redevenue.perkHashes) === JSON.stringify([100, 200, 300]) && JSON.stringify(redevenue.perksParColonne) === JSON.stringify(w1.perksParColonne) && redevenue.perksSimules === void 0 && redevenue.perkHashesReels === void 0 && redevenue.perksParColonneReels === void 0 && redevenue.nbColonnesSimulees === void 0, redevenue);
ok("une pi\xE8ce sans simulation est rendue telle quelle (m\xEAme objet) ; aller-retour complet : pi\xE8ce \u2192 copie simul\xE9e \u2192 pi\xE8ce r\xE9elle donne exactement la pi\xE8ce d'origine", pieceReelle(w1) === w1 && JSON.stringify(pieceReelle(appliquerSimulationPiece(w1, sim("w1", { 1: [101, 101], 3: [301, 302] })["armes"]["w1"]))) === JSON.stringify(w1));
var sansColonnes = { ...w1, perksParColonne: void 0 };
delete sansColonnes.perksParColonne;
ok("PI\xC8CE SANS COLONNES CONNUES (ancien build enregistr\xE9) : la simulation ne s'applique pas, la pi\xE8ce est rendue TELLE QUELLE (m\xEAme objet) : ses perks r\xE9els ne disparaissent pas du score ; idem au niveau du build", appliquerSimulationPiece(sansColonnes, sim("w1", { 2: [201, 202] })["armes"]["w1"]) === sansColonnes && (() => {
  const b = construire([sansColonnes]);
  return appliquerSimulations(b, sim("w1", { 2: [201, 202] })) === b;
})());
var w2 = arme("w2", [[1, 100]]);
var w3 = arme("w3", [[1, 100]], "lourde");
var build = construire([w1, w2, w3]);
var s = sim("w1", { 2: [201, 202] });
var eff = appliquerSimulations(build, s);
ok("seules les armes SIMUL\xC9ES sont touch\xE9es ; DEUX EXEMPLAIRES du m\xEAme mod\xE8le (w2, w3 : m\xEAmes perks r\xE9els) restent ind\xE9pendants et inchang\xE9s", eff.armes[0].perksSimules === true && eff.armes[1] === w2 && eff.armes[2] === w3 && nbArmesSimulees(eff) === 1);
ok("le build d'origine n'est pas modifi\xE9 et rien d'autre n'est copi\xE9 que les armes (l'armure, la doctrine, l'artefact sont les m\xEAmes objets)", build.armes[0] === w1 && eff.armure === build.armure && eff.subclass === build.subclass && eff.artifact === build.artifact);
ok("rien \xE0 appliquer (aucune simulation, ou simulation d'une arme qui n'est pas dans le build) : le M\xCAME build est rendu, donc les calculs m\xE9moris\xE9s ne sont pas relanc\xE9s pour rien", appliquerSimulations(build, SIMULATIONS_VIDES()) === build && appliquerSimulations(build, sim("autre", { 1: [9, 9] })) === build);
var armureSimulee = construire([w1], [arme("a1", [[1, 100]], "casque", 5005)]);
ok("l'ARMURE n'est jamais touch\xE9e, m\xEAme si une simulation existe pour son identifiant", appliquerSimulations(armureSimulee, sim("a1", { 1: [9, 9] })) === armureSimulee);
var memoire = () => {
  const contenu = /* @__PURE__ */ new Map();
  return { contenu, getItem: (c) => contenu.get(c) ?? null, setItem: (c, v) => void contenu.set(c, v) };
};
var st = memoire();
var m = creerMagasin(() => st);
var appels = 0;
var desabonner = m.abonner(() => appels++);
m.mettreAJour((x) => choisir(x, "w1", 2, { choisi: 201, effectif: 202 }));
ok("le magasin pr\xE9vient ses abonn\xE9s \xE0 chaque modification (c'est ce qui fait changer le score en temps r\xE9el) et enregistre aussit\xF4t", appels === 1 && JSON.parse(st.contenu.get(CLE_STOCKAGE_SIMULATIONS)).armes.w1["2"].e === 202);
m.mettreAJour((x) => x);
ok("une transformation qui ne change rien (m\xEAme objet) ne pr\xE9vient personne et n'\xE9crit rien de plus", appels === 1);
desabonner();
m.mettreAJour((x) => choisir(x, "w1", 3, { choisi: 301, effectif: 301 }));
ok("apr\xE8s d\xE9sabonnement, plus de notification", appels === 1 && m.lire().armes.w1[3].choisi === 301);
var m2 = creerMagasin(() => st);
ok("un NOUVEAU magasin (nouveau d\xE9marrage de l'appli) relit ce qui \xE9tait enregistr\xE9", m2.lire().armes.w1[2].effectif === 202 && m2.lire().armes.w1[3].effectif === 301);
var { db } = creerFausseDb({ [T_OBJET]: {
  100: { displayProperties: { name: "Canon neutre", description: "Am\xE9liore la port\xE9e." }, itemTypeDisplayName: "Canon" },
  200: { displayProperties: { name: "Chargeur neutre", description: "Plus de balles." }, itemTypeDisplayName: "Chargeur" },
  201: { displayProperties: { name: "Chargeur incendiaire", description: "Les tirs de pr\xE9cision infligent Blessure solaire aux cibles." }, itemTypeDisplayName: "Chargeur" }
} });
var arme2 = arme("w1", [[1, 100], [2, 200]]);
var buildReel = construire([arme2]);
var buildSimule = appliquerSimulations(buildReel, sim("w1", { 2: [201, 201] }));
var avant = extraireTextesEffetsBuild(buildReel, db).join(" | ");
var apres = extraireTextesEffetsBuild(buildSimule, db).join(" | ");
ok("CHA\xCENE JUSQU'AU MOTEUR : le moteur de score lit le texte du perk SIMUL\xC9 (\xAB Chargeur incendiaire\u2026 Blessure solaire \xBB) et plus celui du perk r\xE9el ; sur le build r\xE9el, rien n'a chang\xE9", /Chargeur incendiaire/.test(apres) && !/Chargeur neutre/.test(apres) && /Chargeur neutre/.test(avant) && !/Blessure solaire/.test(avant), [avant, apres]);
var scoreReel = evaluerBuild(buildReel, demoExigences, db);
var scoreSimule = evaluerBuild(buildSimule, demoExigences, db);
var pilierVerbes = (r) => r.piliers.find((p) => p.pilier === "verbes_element");
var aucunVerbe = /Aucun verbe/i;
ok("LE SCORE CHANGE en temps r\xE9el : le pilier des verbes d'\xE9l\xE9ment passe de \xAB aucun verbe d\xE9tect\xE9 \xBB (build r\xE9el) \xE0 un score plus HAUT avec le perk simul\xE9 (Blessure solaire), et le score global monte", aucunVerbe.test(JSON.stringify(pilierVerbes(scoreReel).details)) && !aucunVerbe.test(JSON.stringify(pilierVerbes(scoreSimule).details)) && pilierVerbes(scoreSimule).score > pilierVerbes(scoreReel).score && scoreSimule.scoreGlobal > scoreReel.scoreGlobal, [pilierVerbes(scoreReel).score, pilierVerbes(scoreSimule).score, scoreReel.scoreGlobal, scoreSimule.scoreGlobal]);
var apresRetour = evaluerBuild(appliquerSimulations(buildReel, SIMULATIONS_VIDES()), demoExigences, db);
ok("\u2026et supprimer la simulation ram\xE8ne EXACTEMENT le score r\xE9el (m\xEAmes scores de pilier, m\xEAme score global) : le retour au roll r\xE9el est sans reste", apresRetour.scoreGlobal === scoreReel.scoreGlobal && JSON.stringify(apresRetour.piliers.map((p) => [p.pilier, p.score])) === JSON.stringify(scoreReel.piliers.map((p) => [p.pilier, p.score])));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
process.exit(res.every(Boolean) ? 0 : 1);
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
