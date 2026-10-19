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
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
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
    function E(a, b, e2) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e2 || B;
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
    function G(a, b, e2) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e2 || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e2) {
      var d, c = {}, k = null, h2 = null;
      if (null != b) for (d in void 0 !== b.ref && (h2 = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e2;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h2, props: c, _owner: K.current };
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
    function R(a, b, e2, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h2 = false;
      if (null === a) h2 = true;
      else switch (k) {
        case "string":
        case "number":
          h2 = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h2 = true;
          }
      }
      if (h2) return h2 = a, c = c(h2), a = "" === d ? "." + Q(h2, 0) : d, I(c) ? (e2 = "", null != a && (e2 = a.replace(P, "$&/") + "/"), R(c, b, e2, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e2 + (!c.key || h2 && h2.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h2 = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h2 += R(k, b, e2, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h2 += R(k, b, e2, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h2;
    }
    function S(a, b, e2) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e2, a2, c++);
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
    exports.Children = { map: S, forEach: function(a, b, e2) {
      S(a, function() {
        b.apply(this, arguments);
      }, e2);
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
    exports.cloneElement = function(a, b, e2) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h2 = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h2 = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e2;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h2 };
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
    exports.useImperativeHandle = function(a, b, e2) {
      return U.current.useImperativeHandle(a, b, e2);
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
    exports.useReducer = function(a, b, e2) {
      return U.current.useReducer(a, b, e2);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e2) {
      return U.current.useSyncExternalStore(a, b, e2);
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
            } catch (e2) {
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
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
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
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
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
                    } while (s >= 1 && c >= 0);
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
        exports.useSyncExternalStore = useSyncExternalStore;
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
    var m = Object.prototype.hasOwnProperty;
    var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e2 = null, h2 = null;
      void 0 !== g && (e2 = "" + g);
      void 0 !== a.key && (e2 = "" + a.key);
      void 0 !== a.ref && (h2 = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e2, ref: h2, props: d, _owner: n.current };
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
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
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
                    } while (s >= 1 && c >= 0);
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
            } catch (e2) {
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
        var jsx6 = jsxWithValidationDynamic;
        var jsxs3 = jsxWithValidationStatic;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.jsx = jsx6;
        exports.jsxs = jsxs3;
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

// tests/logique/export-fiche.test.ts
init_define_import_meta_env();
import fs2 from "node:fs";

// src/lib/loadouts/exportFiche.ts
init_define_import_meta_env();

// src/data/libellesUI.ts
init_define_import_meta_env();
var LIBELLES_SLOT = {
  cinetique: "Arme cin\xE9tique",
  energie: "Arme \xE9nergie",
  lourde: "Arme lourde",
  casque: "Casque",
  gants: "Gants",
  torse: "Torse",
  jambes: "Jambes",
  marque: "Marque de classe"
};
var ORDRE_EMPLACEMENTS = [
  "cinetique",
  "energie",
  "lourde",
  "casque",
  "gants",
  "torse",
  "jambes",
  "marque"
];

// src/components/icones/IconeAntiChampion.tsx
init_define_import_meta_env();
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var CHEMINS_ICONES_CHAMPION = {
  surcharge: {
    viewBox: "0 0 32 32",
    d: "M4.096 16.288c0-4.128 2.080-7.744 5.248-9.888 0.192-0.096 0.416-0.064 0.544 0.128l6.144 9.76h-7.872l7.52 11.904c-6.432-0.192-11.584-5.44-11.584-11.904zM16.384 4.384c6.432 0.192 11.552 5.44 11.552 11.904 0 4.096-2.080 7.712-5.216 9.856-0.192 0.128-0.416 0.064-0.544-0.128l-6.144-9.728h7.872z"
  },
  bloqueur: {
    viewBox: "0 -2 36 36",
    d: "M17.888 4.352l13.76 23.84h-27.552l2.592-4.448h16.608c0.288 0 0.448-0.32 0.32-0.576l-8.32-14.368zM12.48 13.664l2.976 5.184h-5.952z"
  },
  implacable: {
    viewBox: "0 0 32 32",
    d: "M27.776 26.176c0 1.024-0.832 1.856-1.856 1.856h-8.608l10.464-10.464v8.608zM22.304 4.384h5.472v5.44l-18.208 18.208h-5.472v-5.472zM4.096 6.24c0-1.024 0.832-1.856 1.888-1.856h8.608l-10.496 10.464v-8.608z"
  }
};
var LIBELLES_CHAMPION = {
  surcharge: "Surcharg\xE9",
  bloqueur: "Bloqueur",
  implacable: "Implacable"
};

// src/components/icones/IconeTypeArme.tsx
init_define_import_meta_env();
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function normaliser(t) {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\u00ad\u200b-\u200d\u2060\ufeff]/g, "").replace(/[\u00a0\u202f]/g, " ").replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim();
}
function calculerTailleRendu(viewBox, taille) {
  const parties = viewBox.split(" ").map(Number);
  const [, , largeurVb, hauteurVb] = parties;
  if (!largeurVb || !hauteurVb) return { largeur: taille, hauteur: taille };
  const ratio = largeurVb / hauteurVb;
  if (ratio >= 1) return { largeur: taille, hauteur: taille / ratio };
  return { largeur: taille * ratio, hauteur: taille };
}
var CHEMINS = [
  {
    motCle: "arme de poing",
    viewBox: "0 -6 44 44",
    d: "M7.776 7.744l-0.512-0.512v-4l0.48-0.48h2.496l0.64-0.64h1.536l0.64 0.64h2.88l0.288 0.256h1.056l0.32-0.32h17.536v-0.352h1.024l0.416 0.416h1.472l0.32 0.32v1.088h0.672v2.432h-0.704v0.672l-0.288 0.288 0.256 0.256v1.984h-7.936l-0.608 0.992h-8.224l-0.256 0.8-0.096 0.96 0.032 1.088 0.192 1.12 0.064 0.32-0.544 0.192-0.448-1.024-0.352-1.568-0.096-1.44-0.032-0.448-0.48 0.064-0.544 0.736-0.352 0.8-0.128 0.992-0.064 1.056 0.32 0.96 0.8 0.832 0.608 0.384-0.192 0.448-1.28 0.288-0.864 0.416-0.768 0.8-0.48 0.896-0.16 1.248-0.576 0.352-0.576 0.8-0.512 1.184-0.512 1.504-0.416 1.44-0.032 0.992 0.032 0.672-0.32 0.128h-0.8l-7.424-1.888-1.152-0.608 0.064-0.864 1.696-0.096 0.096-1.728 0.48-2.24 1.056-2.496 1.664-2.464 0.992-1.376 0.832-1.568-0.096-0.64-0.992-0.96-0.864-0.544-0.352-0.096h-1.984l-0.384-0.352 0.736-1.44 0.96-0.352z"
  },
  {
    motCle: "epee",
    viewBox: "0 -44 120 120",
    d: "M80.832 10.368h35.328l-14.944 11.68h-57.728l-1.632-2.24-1.248-1.056-1.568-0.704-1.44-0.256-0.96-0.128-0.608 0.352-2.336 0.448-1.472-0.768-1.088 0.224-0.576 8.928h-0.8l-3.008-9.088-1.92-1.248h-16.032l-0.48 0.32-0.48 0.416-0.288 0.416h-2.88l-0.736-0.864v-5.152l1.44-0.736h2.432l0.992 1.28h15.84l3.52-1.76h14.752l0.448-0.672h4.672l1.568 1.76h29.568zM61.76 19.2v-1.248h-9.28v1.248h9.28zM65.056 19.2h33.376l-1.024-1.248h-32.352v1.248zM99.84 17.472l4-2.976v-0.672h-4.032v2.048l-0.704 0.64z"
  },
  {
    motCle: "pistolet-mitrailleur",
    viewBox: "0 -18.5 69 69",
    d: "M63.84 6.144l0.352 0.192v3.072l-0.256 0.288h-9.984v0.576l-0.288 0.352h-5.792v0.608h5.248l0.192 0.32v0.736l-0.128 0.256h-1.856l0.416 0.608 0.032 0.32-0.064 0.192-0.16 0.096-0.48 0.032h-6.272l-0.32-0.32h-0.32l-0.416 0.384-0.48 0.896-1.056 2.336-2.208 5.44-0.416 0.608-0.544 0.288-0.704 0.256-0.896 0.16-1.024 0.096h-5.472v6.016l-0.448 0.448h-1.984l-0.192-0.224h-0.736l-0.256-0.256v-6.016l-0.832-0.192-0.576-1.184-0.352-1.216-0.16-2.048 0.16-2.176 0.352-1.44 0.64-1.248 0.32-1.088 0.032-0.928-0.224-0.416-2.144-0.288-0.64-0.512h-5.696l-0.512 0.128-2.080 0.192h-0.768l-0.288-0.288-0.608 0.128-0.64 0.576-4.448 5.952-0.512 0.384-0.704 0.32-0.768 0.16h-0.448l-0.192 0.544-1.44 0.48-0.384-0.16-0.128-0.384v-0.64l0.096-3.232 0.032-4.128-0.128-4.224v-1.664l0.256-0.704 0.384-0.32h1.44l0.384 0.736h0.512l0.416 0.416h0.384l0.16-0.16h19.2v-1.152l0.192-0.512h0.224v-0.576h0.416l0.736 0.896 0.288 0.992 0.224 0.032v0.32h0.288v-0.384l0.352-0.384h7.232v-0.512h-1.152l-0.288-0.16h-0.8v-2.816l0.416-0.416h0.704l0.48-0.384h0.416v0.32h6.112l0.16 0.128v0.384h0.416v2.592l-0.192 0.192h-0.512v0.224h-0.384v0.544h2.688v0.384h6.048l0.416 0.384h1.6l0.416 0.352v0.416h9.92zM40.32 13.152v-0.352l-0.224-0.192-0.352-0.128h-6.272l-0.192 0.48-0.064 0.544 0.032 0.512 0.128 0.416 0.256 0.352-0.16 0.288-0.448-0.448-0.416-0.832-0.16-0.832v-0.48h-0.672l-0.256 0.096-0.16 0.352-0.16 0.448-0.096 0.736v0.608l0.224 0.416 0.448 0.32-0.032 0.352-0.544 0.288v5.184l0.096 0.224 0.256 0.256 0.448 0.096h4.032l0.544-0.16 0.448-0.384 0.416-0.704 2.752-6.944z"
  },
  {
    motCle: "pompe",
    viewBox: "0 -33.5 99 99",
    d: "M94.272 4.384h0.608v2.816h-0.512v2.848h-0.416v3.552h-0.416v1.152h-3.648l-0.32 0.352h-3.904l-0.16 0.832-0.192 0.416-0.352 0.16h-0.64l-0.64-0.128h-20.384l-0.736-0.128-0.128-0.384 0.288-0.416 0.416-0.64h-21.888l-0.192 0.48-0.064 0.512 0.064 0.48 0.064 0.416 0.224 0.416-0.256 0.256-0.512-0.48-0.384-0.768-0.224-0.8-0.032-0.608h-0.928l-0.192 0.576-0.192 0.672-0.096 0.672 0.032 0.512 0.448 0.384 0.512 0.256 0.16 0.256-0.032 0.352-0.224 0.352-0.48 0.16-0.736 0.128-0.352 0.192-0.288 0.288-0.32 0.608-0.096 0.48v0.576l-0.192 0.512-0.256 0.448-0.416 0.544-1.472 3.648 0.48 0.512v0.448l-0.576 0.608h-4.8l-0.832-0.224-0.032-0.736 0.128-0.288-0.224-0.864 0.256-1.952 0.704-2.208 0.896-1.888 1.056-1.568 0.672-0.672 0.416-0.48 0.224-0.672-0.064-0.512-0.384-0.672-0.64-0.48-0.64-0.256-0.896-0.16h-4.64l-0.32-0.16-0.928-0.864v-0.352h-0.256l-0.32 0.16-0.608 0.256-16.512 3.68-0.352 0.256-1.888 0.448-0.384-0.096-0.128-0.384-0.096-1.152 0.288-2.976 0.096-2.976-0.128-3.168-0.064-1.664 0.096-0.608 0.256-0.352 0.384-0.16 1.376-0.064h0.8l0.384 0.416 0.384-0.416h12.032l0.832 0.096 0.928 0.288 1.024 0.416 0.736 0.48 0.544 0.288 0.32 0.352 0.224-0.256h2.688l0.192-0.096 0.256-0.16 2.208-1.888 0.928-0.256h0.704l0.544-0.576h11.136l0.32 0.32 0.736 0.768h10.592l0.416-0.416h20.736l0.512 0.544h5.024l0.576-0.608h9.92v-0.608h0.96v1.024h0.64z"
  },
  {
    motCle: "precision",
    viewBox: "0 -45.5 123 123",
    d: "M113.312 11.392h5.92v3.328h-5.888v0.992h-18.208v-0.576h-1.664v-0.928h-17.12v0.512h-5.248v-0.352l-1.344 0.512v1.216h1.344v-0.448h3.84v2.048h-3.744v-0.384h-1.376l-0.064 0.992-0.224 0.288-0.384 0.128h-23.328l-0.288-0.32h-4.32v6.56l-0.352 0.384h-6.528l-0.256-0.256h-0.928l-0.16-0.192v-4.32l-1.472-1.024-0.192-0.288v-2.912h-1.216l-0.16 0.448-0.096 0.64 0.064 0.8 0.192 0.64 0.096 0.224-0.256 0.16-0.352-0.48-0.416-0.96-0.16-0.992-0.032-0.48h-0.256l-0.352 0.448-0.224 0.544-0.096 0.576v0.544l0.16 0.48 0.416 0.352 0.256 0.128-0.16 0.576-0.672 0.064-0.48 0.224-0.288 0.416-0.224 0.48-0.096 0.48v0.288l-0.096 0.48-0.448 0.384-0.256 0.544-0.288 0.928-0.448 1.248 0.16 0.512-0.448 0.384-17.984-3.68-0.128 0.288-0.32 0.256-1.984 0.704-0.32-0.064-0.16-0.256-0.128-0.448 0.064-0.8 0.192-3.104 0.128-3.232-0.064-3.68-0.16-1.76 0.096-0.896 0.128-0.288 0.608-0.096h0.832l0.256 0.256h0.864l0.224 0.32 0.096 0.352v0.544h15.104l0.896-0.992h2.208v-0.96l0.256-0.256h0.768l0.16-0.16h2.784l0.48-0.352h3.52v-1.024h-7.968v-0.544h-2.592l-0.096-0.064 2.816-3.616h2.112l0.8-0.48h21.376l0.448 0.704v2.144l2.624 1.248v0.704h-2.464l-1.536 1.664h1.92l1.728 0.96h14.848v1.472h2.112v0.576h1.248v-0.544h5.408v0.544h17.088v-0.8h1.856v-0.576h18.016v0.896zM24.64 16.928v-0.608h-9.984l4.736 4.832 0.864 0.64 0.576 0.288h0.544l0.448-0.128 0.288-0.288v-0.608zM46.624 8.832v-1.632h-6.976v1.024l0.064 0.032h1.632l1.184 0.576h4.096z"
  },
  {
    motCle: "eclaireur",
    viewBox: "0 -33.5 99 99",
    d: "M89.184 9.696h5.408v3.072h-5.344v-0.416h-1.024v0.416h-1.12v-0.448h-16.352v1.792h0.768l0.352 0.352v0.448l-0.352 0.352h-0.928l-0.768 0.384-1.536 0.128-0.32 0.224h-20.32l-1.216 0.096-1.184 0.544-1.088 0.8-0.352 0.384-3.744 8.16-0.64 0.672-0.8 0.544-1.12 0.448-1.376 0.064-1.184-0.128-1.696-0.384-5.952-1.76-0.672-0.064-0.928 0.064v1.472h-0.768v-1.536h-0.512v0.832l-0.256 0.32h-2.016l-0.256-0.256-0.224 0.224h-4.832l-0.256 0.288h-1.12l-0.288-0.32h-1.024v-6.528l-0.672 0.64q-0.384-0.416-0.448-0.416v-1.312h-5.344v1.856l-0.224 0.352-0.448 0.32-2.624 0.64-0.288-0.16v-2.72l0.192-3.488 0.032-2.912-0.064-2.912-0.16-1.632 0.256-0.928 0.48-0.16h0.992l0.288 0.288h1.312l0.352 0.48 6.304-2.752h18.464v-0.544h2.144l0.64-0.64h3.52l0.32-0.576 0.128-0.544v-0.576l0.16-0.224h1.12l0.256 0.224v0.48l0.096 0.544 0.864 1.248h2.88l0.192-0.224h0.224l0.832 0.832h1.792l0.384-0.384h6.88l0.512 0.544h14.176l0.928 0.352v1.056h1.216l0.512 0.544v0.32l-0.48 0.512h-0.832v0.832l-0.32 0.32v0.832h16.384v-0.352h1.184v0.544h0.928v-0.544zM31.168 16.064v-0.8l-0.224-0.384-0.416-0.384-0.64-0.224h-1.632l-0.512 0.096-0.352 0.352-0.224 0.576-0.128 0.832 0.224 0.8 0.48 0.672 0.672 0.416h0.896l0.832-0.32 0.8-0.832zM43.072 16.352l0.224-0.48-0.16-0.448-0.384-0.32-0.512-0.224h-4.192l-0.192 0.768-0.064 0.576 0.096 0.48 0.192 0.48 0.224 0.256-0.192 0.288-0.32-0.32-0.416-0.704-0.256-0.96-0.096-0.864h-0.32l-0.768 0.736v1.376l0.192 0.448 0.288 0.256 0.288 0.224-0.16 0.736-0.96 0.128-0.576 0.32-0.448 0.64-0.224 0.672-0.096 0.768-0.16 0.384-0.48 0.448-0.416 0.64-0.384 0.864-0.448 1.152-0.064 0.192 0.096 0.192 2.304 0.704 1.632 0.448h0.96l0.736-0.32 0.832-0.64 0.416-0.8 3.36-7.2z"
  },
  {
    motCle: "mitrailleuse",
    viewBox: "0 -1025.5 3075 3075",
    d: "M122.88 684.032l1.024-28.672h7.168l-5.12-212.992-2.048-2.048 2.048-28.672 5.12-4.096q3.072-118.784 6.144-119.808l9.216-8.192q4.096-4.096 59.392-5.12l1.024-7.168h29.696v9.216h13.312l7.168 8.192h16.384l10.24-12.288 56.32-3.072v-14.336h297.984v17.408l17.408 12.288 59.392 2.048-20.48 32.768h14.336l31.744-50.176h32.768l15.36-22.528h25.6v-3.072h-8.192v-12.288h8.192l2.048-7.168h7.168v-6.144h3.072l2.048 1.024h21.504l2.048-1.024h4.096v18.432h13.312l318.464-72.704h39.936l10.24-3.072h13.312l13.312-12.288h66.56l4.096-4.096 6.144-3.072v-3.072h-50.176v-26.624l29.696-16.384h100.352l8.192 4.096v34.816h-14.336v12.288l11.264 5.12h14.336l11.264 5.12h9.216l2.048 7.168h290.816l483.328 108.544 90.112 21.504h68.608l3.072-5.12v-4.096h39.936l158.72-3.072v-47.104l24.576-24.576v-61.44l6.144-4.096h27.648v137.216h154.624l5.12 7.168h98.304l5.12 12.288h25.6q1.024 1.024 1.024 4.096v47.104q0 2.048-1.024 4.096-2.048 3.072-94.208 3.072l-12.288 28.672-1.024 14.336 1.024 1.024h17.408l5.12 13.312 5.12-2.048h22.528v56.32l-2.048 2.048h-20.48l-3.072-2.048-2.048 2.048-5.12 7.168h-17.408l-1.024-7.168h-7.168l-5.12 2.048h-64.512v4.096h19.456l18.432 20.48v16.384h-37.888l-2.048 4.096h-30.72l-128-39.936h-288.768l-12.288-12.288h-58.368l-6.144-2.048h-211.968l-5.12 7.168h-253.952l19.456 43.008h41.984l12.288 16.384q0 3.072 39.936 3.072h40.96l19.456 9.216 1.024 20.48 78.848-2.048v-5.12h22.528v113.664h-22.528v-5.12l-64.512 4.096v-5.12h-7.168v5.12h-8.192v7.168l-19.456 8.192h-73.728l-9.216-6.144h-218.112l-9.216 6.144h-21.504l-13.312-8.192v-7.168h-1.024l-4.096-11.264-3.072-83.968 4.096-10.24h8.192v-20.48l9.216-9.216 14.336-3.072v-16.384l4.096-3.072h45.056v-2.048q0-3.072-2.048-5.12-3.072 0-3.072-1.024h-44.032l-7.168-10.24-2.048-14.336h-4.096l-1.024 27.648h-178.176v24.576h28.672v12.288h12.288v267.264l-3.072 2.048h-9.216v7.168h-25.6v-15.36h-203.776l-2.048 3.072v12.288h-25.6v-7.168h-13.312v-269.312h13.312v-14.336h25.6v-22.528h-17.408l-32.768-5.12-45.056-3.072 2.048 103.424q-4.096 16.384-12.288 28.672-4.096 6.144-17.408 19.456-11.264 11.264-75.776 6.144-8.192 0-16.384-2.048l-22.528-9.216-8.192-2.048h-22.528l-84.992 142.336v1.024q0 2.048 2.048 4.096l22.528 29.696v17.408h-138.24l-5.12-4.096h-34.816l-139.264-55.296v-7.168l-46.080-20.48h-259.072l-2.048 6.144-50.176 3.072-5.12-3.072v-6.144l-14.336 9.216q-41.984-3.072-44.032-4.096-4.096-1.024-4.096-6.144 0-3.072-3.072-59.392l-3.072-5.12zM2027.52 301.056l86.016-3.072 6.144-2.048-92.16-19.456v24.576zM1860.608 570.368v88.064q0 12.288 12.288 12.288 8.192 0 9.216-4.096 1.024-1.024 1.024-3.072v-93.184q0-9.216-10.24-9.216-12.288 0-12.288 9.216zM1584.128 223.232v20.48h98.304v11.264h61.44v26.624h19.456v3.072l6.144 2.048v3.072h91.136v8.192h138.24v-16.384q0-7.168-5.12-9.216l-5.12-3.072-243.712-50.176zM1245.184 289.792v15.36h32.768v7.168h80.896l4.096 2.048h17.408v-25.6l-2.048-4.096h-78.848v5.12h-54.272zM996.352 648.192h70.656q13.312 0 23.552-22.528 15.36-40.96-6.144-67.584-7.168-7.168-17.408-11.264t-15.872-4.608-19.456 0-14.848 0.512q-6.144 3.072-9.216 6.144-11.264 8.192-13.312 28.672-2.048 14.336 0 23.552 1.024 9.216 7.168 19.456l3.072 11.264 3.072 3.072q1.024 4.096-4.096 6.144l-6.144 3.072q-1.024 1.024-1.024 0l-14.336-8.192-11.264-4.096 11.264 12.288zM586.752 549.888l-14.336 13.312 1.024 66.56q0 13.312 12.288 22.528 6.144 5.12 68.608 31.744l70.656 29.696 10.24 3.072q5.12 2.048 8.192 0l25.6-20.48q13.312-24.576 27.648-50.688t19.968-36.352 5.632-11.264q1.024-4.096 4.096-7.168-4.096-31.744-6.144-34.816l-6.144-6.144-40.96-4.096-49.152-22.528v-20.48l-86.016-10.24-29.696 15.36-21.504 3.072v38.912zM449.536 606.208v21.504h41.984v-19.456zM339.968 612.352l-5.12 13.312q2.048 2.048 100.352 2.048v-21.504h-93.184z"
  },
  {
    // FR : Revolver (Hand Cannon). Entrée RESTAURÉE (04/08/2026) : elle
    // fonctionnait depuis le début, je l'avais retirée à tort en croyant
    // qu'elle entrait en conflit avec "Pistolet" - en réalité les deux
    // types ont des textes Bungie distincts et cohabitent très bien.
    // EN: Hand Cannon. Entry RESTORED (2026-08-04): it worked from the
    // start, I wrongly removed it thinking it conflicted with "Pistolet"
    // - in reality both types have distinct Bungie texts and coexist fine.
    motCle: "revolver",
    viewBox: "0 -15 62 62",
    d: "M57.76 8.704h-2.72v1.056h1.184l0.32 0.32v3.52l-0.768 0.256-23.2 1.088-1.12-1.088h-0.896l-1.76 1.824h-0.416v0.352l-3.168 3.104-1.376 1.152-1.12 0.512-1.696 0.448-1.536 0.096-1.184-0.128-1.12-0.352-1.056-0.576-0.864-0.192-0.864 0.064-0.512 0.16-0.352 0.448-0.224 0.864v0.864l-0.704 0.544-0.384 0.64-0.832 3.328 0.352 1.664 0.608 0.448v0.416l-0.64 0.16-7.808-2.272-0.096-0.736 0.096-1.472 0.288-1.792 0.768-2.432 0.96-2.176 1.248-1.92 1.728-1.952 0.64-0.8 0.192-0.608v-0.8l-0.416-0.736-0.8-0.832-1.184-0.672 0.736-0.736h1.664l0.384-0.416 1.728-0.416 0.48-0.544 0.512-0.672 0.384-0.928 0.192-1.024 0.512-0.64h0.48l0.192-1.312 0.096-0.928h9.408l1.248 1.28h25.184l0.64-0.64h5.6l0.992 1.024v4.16zM24.896 17.76v-1.056l-0.224-0.768-0.48-0.48-0.64-0.224-1.664-0.064h-2.272l-0.64 0.864-0.128 0.704 0.064 0.512 0.224 0.384 0.32 0.384-0.288 0.256-0.48-0.448-0.416-0.704-0.288-1.024-0.128-0.544-0.288 0.032-0.608 0.544-0.48 0.704-0.192 0.96v0.992l0.448 0.896 0.768 0.608 1.312 0.384h1.088l1.28-0.128 1.28-0.352 0.864-0.448 0.8-0.608 0.512-0.608z"
  },
  {
    // FR : ⚠️ CORRIGÉ (04/08/2026, v3 - version stable) - "Pistolet" est
    // le texte Bungie FR pour les Sidearms (confirmé par diagnostic sur
    // "Élu du Voyageur"), et "Revolver" celui des Hand Cannons (entrée
    // juste en dessous, restaurée : elle fonctionnait, je l'avais retirée
    // à tort en croyant à un conflit). Les deux coexistent sans souci.
    // ORDRE IMPORTANT : "pistolet-mitrailleur" (SMG) est plus haut dans
    // ce tableau, donc testé AVANT - sinon "pistolet" (sous-chaîne)
    // matcherait les SMG par erreur, .find() s'arrêtant au premier
    // résultat.
    // EN: ⚠️ FIXED (2026-08-04, v3 - stable version) - "Pistolet" is the
    // FR Bungie text for Sidearms (confirmed by diagnostic on "Traveler's
    // Chosen"), and "Revolver" the one for Hand Cannons (entry just
    // below, restored: it worked, I removed it wrongly thinking there was
    // a conflict). Both coexist fine. ORDER MATTERS: "pistolet-
    // mitrailleur" (SMG) sits higher in this array, so it's tested FIRST
    // - otherwise "pistolet" (a substring) would wrongly match SMGs,
    // .find() stopping at the first result.
    motCle: "pistolet",
    viewBox: "0 -6 44 44",
    d: "M7.776 7.744l-0.512-0.512v-4l0.48-0.48h2.496l0.64-0.64h1.536l0.64 0.64h2.88l0.288 0.256h1.056l0.32-0.32h17.536v-0.352h1.024l0.416 0.416h1.472l0.32 0.32v1.088h0.672v2.432h-0.704v0.672l-0.288 0.288 0.256 0.256v1.984h-7.936l-0.608 0.992h-8.224l-0.256 0.8-0.096 0.96 0.032 1.088 0.192 1.12 0.064 0.32-0.544 0.192-0.448-1.024-0.352-1.568-0.096-1.44-0.032-0.448-0.48 0.064-0.544 0.736-0.352 0.8-0.128 0.992-0.064 1.056 0.32 0.96 0.8 0.832 0.608 0.384-0.192 0.448-1.28 0.288-0.864 0.416-0.768 0.8-0.48 0.896-0.16 1.248-0.576 0.352-0.576 0.8-0.512 1.184-0.512 1.504-0.416 1.44-0.032 0.992 0.032 0.672-0.32 0.128h-0.8l-7.424-1.888-1.152-0.608 0.064-0.864 1.696-0.096 0.096-1.728 0.48-2.24 1.056-2.496 1.664-2.464 0.992-1.376 0.832-1.568-0.096-0.64-0.992-0.96-0.864-0.544-0.352-0.096h-1.984l-0.384-0.352 0.736-1.44 0.96-0.352z"
  },
  {
    motCle: "impulsion",
    viewBox: "0 -27.5 87 87",
    d: "M82.528 9.728l0.256 0.288v2.656l-0.416 0.416h-13.92l0.512 0.512h1.28v1.6l-0.128 0.704-0.416 0.736-0.576 0.448-0.672 0.288h-22.816l-1.376 0.352-1.12 0.704-1.024 0.8-0.448 0.576-2.304 6.432-0.512 0.992-0.672 0.608-0.992 0.608-1.152 0.128-1.344-0.128-9.92-2.784-0.416-0.16-0.16-0.48 1.088-0.448 0.32-1.824 0.704-1.792 1.12-1.952 1.408-1.664 0.736-0.768 0.192-0.64-0.128-0.672-0.416-0.576-1.056-0.512-1.248-0.16-3.2-0.096v0.672l-0.672 0.352 0.96 9.664-0.352 0.576-2.144 0.256-0.448-0.32-0.448 0.064-0.32 0.384-3.648 0.352-0.224-0.256-0.608 0.064-0.192 0.288-1.76 0.192-0.384-0.256-0.64-3.968-0.608-0.032-0.128-1.152h-0.32l-0.544-0.704h-3.712v0.224l-3.264 0.96-0.48-0.48 0.32-4 0.064-3.584-0.096-4-0.096-3.040 0.192-0.832 0.192-0.16h1.536l0.224 0.224h1.376l0.384 0.736h21.696l1.984-0.928h-0.864l-0.416-0.384 1.472-3.232 0.48-0.32h7.136l0.608 0.256 0.448 0.512 0.128 0.768v1.184l0.384 0.352v0.352l-0.736 0.736h-0.832v0.704h5.152l1.696 0.448 22.304 0.96 0.416 0.32v0.992l-0.64 0.64 0.224 0.224h14.016zM41.28 17.248v-0.384l-0.128-0.448-0.32-0.256h-4.672l-0.16 0.736 0.192 0.928 0.352 0.576-0.288 0.352-0.448-0.384-0.352-0.672-0.256-0.8-0.128-0.736-0.288 0.096-0.32 0.32-0.32 0.672 0.064 0.672 0.352 0.672 0.736 0.48-0.128 0.576-0.448-0.032-0.704 0.064-0.48 0.192-0.512 0.608-0.256 0.896-0.16 1.088-0.352 0.16-0.448 0.48-0.352 0.544-0.608 1.696 4.16 1.6 0.896 0.256h0.928l0.672-0.288 0.48-0.48 3.168-8.704zM65.088 13.344v-0.896h-13.728v0.896h13.728z"
  },
  {
    motCle: "automatique",
    viewBox: "0 -28.5 89 89",
    d: "M78.624 8.704h5.632v2.912h-5.632v0.544h-10.4v-0.544h-0.704v1.28l-0.384 0.416h-0.64v1.184h1.536v-0.448h4.256v2.016h-4.256v-0.352h-1.568v0.384l-0.864 0.832h-2.496l-1.088 0.416h-14.848l-1.312-0.416h-0.32v8.512l-0.48 0.416h-8.928l-0.576-0.576v-2.016l-0.864 0.864v0.672l-0.416 0.768-1.28-0.416-0.48 0.416-12.224-3.2-0.384-0.384 0.96-0.544 0.032-0.864 0.288-1.376 0.512-1.216 1.152-1.76 0.96-1.088 0.448-0.352-0.128-0.32v-0.832l-1.824-0.832h-10.368l-4.8 2.784-0.192 1.344-0.256 0.32-2.176 0.576-0.416-0.128 0.224-2.368 0.128-3.744-0.128-2.944-0.128-1.856 0.032-0.704 0.224-0.352h1.248l0.192 0.192h0.864l0.32 0.352v0.672h14.848l0.288 0.32 2.464-0.608 0.544-0.512 0.672-0.448 0.608-0.128 0.096 0.096v0.448h0.992v-1.376l0.768-0.512h0.256v-1.152h0.672v1.152h0.608l1.696 0.992v0.896h6.368l2.112 0.8h8.448v-0.736l0.256-0.288h5.024l2.144 1.088h4.768l1.024-0.96h4.384l0.16 0.16v1.44h1.024l0.224 0.224v0.832h0.704v-0.544h10.4v0.576zM31.264 22.432l2.784-6.976-0.096-0.512-0.256-0.352-0.544-0.128h-3.84l-0.128 0.704 0.16 0.96 0.256 0.416-0.16 0.224-0.224-0.16-0.352-0.544-0.256-0.768-0.096-0.832h-0.128l-0.352 0.288-0.256 0.576 0.064 0.736 0.32 0.544 0.448 0.448-0.16 0.416h-0.672l-0.512 0.16-0.416 0.48-0.192 0.672-0.192 0.704-0.448 0.544-0.512 0.768-0.384 0.928 0.096 0.224 4.544 1.248 0.608-0.096 0.48-0.224z"
  },
  {
    motCle: "arc",
    viewBox: "0 -1087 3198 3198",
    d: "M3065.856 955.392l-8.192 3.072q-55.296-63.488-172.032-169.984h-1065.984v40.96q0 6.144-5.12 8.192-20.48 0-22.528-6.144l-9.216-43.008h-496.64l-10.24 43.008q-2.048 6.144-22.528 6.144-4.096-1.024-4.096-8.192v-40.96h-965.632q-96.256 83.968-142.336 163.84-3.072 5.12-6.144 2.048-4.096-1.024-4.096-8.192v-2.048l1.024-2.048q19.456-109.568 40.96-165.888 36.864-99.328 61.44-106.496 1.024 0 6.656 5.632t11.264 12.288 6.656 7.68q21.504 36.864 55.296 8.192l28.672-23.552q11.264-8.192 67.072-54.784t104.96-84.992 139.264-96.256 185.344-105.984q248.832-126.976 698.368-220.16h2.048l2.048-223.232 8.192-19.456q2.048-3.072 3.072-3.072t27.136 139.264 26.112 142.336v4.096h-12.288q-25.6 6.144-27.648 10.24-7.168 17.408-7.168 52.224v176.128l-21.504 5.12v-12.288l-1.024-3.072q-3.072-8.192-7.168-8.192-5.12 0-11.264 21.504v2.048h-8.192v-77.824h-7.168l-5.12-1.024q-60.416 1.024-120.32 6.656t-111.104 13.312-99.84 17.408-88.064 20.48-74.24 20.992-60.928 19.968-45.056 16.896-28.16 11.264l-10.24 4.096q-6.144 0-84.48 34.304t-209.408 107.008-229.376 149.504h912.384v-6.144q0-9.216 5.12-9.216h30.72q6.144 0 6.144 9.216v6.144h486.4v-6.144q0-9.216 5.12-9.216h30.72q6.144 0 6.144 9.216v6.144h1016.832q-60.416-48.128-95.232-73.728-134.144-88.064-267.264-151.552-304.128-136.192-681.984-157.696-14.336-1.024-26.112 12.288t-16.896 34.816q-14.336 63.488-14.336 205.824 0 11.264-16.384 27.648l-4.096 5.12-6.144 8.192v-524.288h4.096q290.816 39.936 496.128 122.88t440.832 260.096q115.712 83.968 241.664 209.92 10.24 11.264 22.016 10.752t29.184-19.968q3.072-3.072 9.216-10.24t10.24-10.752 5.12-3.584q4.096 0 11.776 9.216t21.504 37.376 29.184 70.144q21.504 62.464 30.72 109.568 5.12 23.552 6.144 38.912zM1577.984 395.264v-156.672q0-28.672 5.12-38.912 1.024-3.072 9.728-4.608t11.776-0.512h1.024v2.048q8.192 45.056 14.336 54.272 20.48 23.552 66.56 32.768h1.024v171.008l-3.072-13.312q-1.024-4.096-3.584-13.312t-4.608-13.312q-25.6-58.368-48.128-66.56-16.384-5.12-30.72 18.432-4.096 9.216-9.216 26.624v2.048h-10.24z"
  },
  {
    // FR : ⚠️ ORDRE IMPORTANT - "fusil a fusion lineaire" doit être
    // vérifié AVANT "fusil a fusion" plus bas, sinon ce dernier (sous-
    // chaîne de celui-ci) matcherait en premier et donnerait la mauvaise
    // icône. .find() s'arrête à la première correspondance.
    // EN: ⚠️ ORDER MATTERS - "linear fusion rifle" must be checked BEFORE
    // "fusion rifle" below, otherwise the latter (a substring of this
    // one) would match first and give the wrong icon. .find() stops at
    // the first match.
    motCle: "fusion lineaire",
    viewBox: "0 0 25.68 8.69",
    d: "m20.85,4.1c.02.28.03.54.05.82h-.12c-2.24,0-4.48,0-6.72,0-.07,0-.13.02-.18.07-.81.81-1.62,1.62-2.42,2.43-.02.02-.05.04-.07.05.15.28.32.51.39.81-.05,0-.08,0-.11,0-.98,0-1.96.02-2.94.01-.67,0-1.34-.05-1.99-.2-.24-.06-.47-.14-.69-.22-.39-.14-.57-.43-.55-.85.02-.51.11-1.01.37-1.46.28-.49.6-.95.91-1.42.02-.03.03-.05.06-.09-1.94.05-3.86.09-5.79.14-.06.49-.12.98-.19,1.48-.22.01-.43.02-.66.04-.07-1.29-.14-2.58-.2-3.87.21-.02.41-.03.61-.05.13-.01.27-.02.4-.03.05,0,.09,0,.13.05.14.15.27.3.41.44.03.03.08.05.11.05.74,0,1.48,0,2.22-.02.22,0,.44-.05.66-.09.92-.15,1.85-.26,2.79-.3.96-.04,1.93-.11,2.89-.16.11,0,.17-.12.12-.21-.08-.13-.16-.26-.23-.39-.04-.08-.11-.12-.2-.13-.09,0-.18-.03-.28-.05.08-.17.15-.33.22-.5,0-.02.03-.03.05-.03.61,0,1.22,0,1.84,0,.02.28.04.56.05.85.11,0,.22,0,.33,0,.59,0,1.17,0,1.76.03.45.02.89.09,1.33.16.93.14,1.86.3,2.79.45.18.03.35.06.53.09.05,0,.1.01.14.01,2.27,0,4.54,0,6.81,0h.11c0,.3.07,1.88.07,2.12h-4.83Zm-13.62,1.73c.15.15.29.27.4.41.16.19.3.39.44.59.03.04.06.06.11.06.38,0,.76,0,1.14,0,.14,0,.23-.03.28-.16.05-.13.16-.18.29-.21.33-.08.66-.18.99-.28.16-.05.25-.17.28-.34.07-.36.06-.72.05-1.08,0,0,0,0-.01,0-.45-.14-.91-.28-1.36-.41-.02,0-.05.01-.07.03-.08.08-.16.17-.24.26-.18.18-.39.25-.64.22-.19-.02-.37-.04-.55-.07-.38-.06-.54,0-.73.34-.13.22-.26.45-.38.65Z"
  },
  {
    motCle: "glaive",
    viewBox: "0 0 36.66 8.57",
    d: "m15.64,7.31v-1.44c.41-.09.79-.22,1.16-.25.56-.04,1.12-.03,1.68,0,.82.04,1.4-.24,1.64-1.17-.39-.03-.76-.06-1.14-.1-.21.26-.39.47-.66.79.02-.33.03-.51.05-.68-.59-.14-.26.49-.67.6-.1-.19-.22-.42-.42-.81-.19.38-.3.62-.42.86-.05-.01-.11-.02-.16-.03v-.61c-.63-.23-.4.42-.67.71-.12-.26-.23-.48-.39-.81-.38,0-.82.02-1.25,0-.63-.04-1.26-.12-1.9-.15-.4-.02-.83-.1-1.19,0-.83.25-1.67.15-2.5.19-.51.03-1.02.13-1.54.16-.52.03-1.05.1-1.55,0-1.45-.29-2.91-.43-4.38-.39-.39,0-.78.09-1.27.15-.02-.29-.05-.62-.07-.96.14,0,.21,0,.27,0,.24.03.47.1.71.1,1.32,0,2.66.1,3.96-.07,1.03-.14,2.05-.23,3.09-.2.68.02,1.36-.01,2.04.02.58.02,1.09-.14,1.6-.41.63-.34,1.29-.64,1.93-.96.72-.36,1.49-.51,2.3-.59,1.12-.1,2.21.02,3.34.05.18.2.36.41.53.6.51.12,1,.23,1.44.33.2.4.36.71.57,1.13.3.04.63.14.97.14,1.84,0,3.7-.15,5.52.02,2.72.25,5.43.12,8.15.18.08,0,.15.04.24.07-.64.38-1.34.35-2.04.36-1.19.03-2.38-.07-3.58.18-1.38.3-2.7.76-3.91,1.43-2.09,1.14-4.31,1.6-6.68,1.53-1.16-.03-2.32,0-3.48,0-.39,0-.79,0-1.32,0Zm2.96-4.15c.6.45,1.06.34,1.58.21-.02-.23-.04-.41-.05-.6-.5.13-.92.24-1.53.39Zm-4.49.13q1.02.44,1.79-.34c-.68.13-1.19.22-1.79.34Zm4.01.41c.16-.13.27-.22.37-.29-.27-.44-.47-.5-.76-.07.13.12.24.22.39.36Zm-1.01-.05q.49-.37,0-.67v.67Zm-.31-.33c-.19-.12-.35-.22-.65-.4.13.48.22.69.65.4Z"
  },
  {
    motCle: "lance-roquettes",
    viewBox: "0 0 36.66 8.87",
    d: "m7.59,5.47c-.03.08-.06.22-.1.23-.22.04-.45.04-.61.06-.63-1.19-.38-2.4-.45-3.64h1.64c.14.13.35.33.58.55,2.02-.22,4.11.3,6.36-.43-.7-.25-1.18-.43-1.66-.6,0-.05,0-.09,0-.14.65,0,1.31-.04,1.96.01.63.05,1.36.01,1.86.31.67.41,1.25.11,1.88.1-.18-.09-.36-.17-.55-.26v-.57c.4-.51,1.19-.58,2.22-.14.23-.3.49-.62.67-.86h3.64c.16.25.32.51.5.8.3.03.66.07,1.15.13-.23.34-.39.55-.54.78-.09-.08-.16-.14-.29-.24-.22.11-.48.23-.74.35.06.06.12.16.18.16,1.1,0,2.2-.02,3.3.02.53.02,1.06.15,1.63.23v2.26c-.36.1-.79.22-1.22.33-.09.02-.24-.04-.28,0-.72.89-1.75.87-2.82.87.15.72.73.96,1.05,1.39.33.43.65.87.98,1.31-.07.07-.18.17-.31.3-.21-.06-.52-.05-.64-.2-.49-.58-.93-1.2-1.44-1.88-.26-.09-.63-.22-1.03-.36.12-.24.19-.36.26-.5-.12-.03-.24-.11-.29-.07-.19.12-.36.28-.54.42-.37.3-.69.2-.97-.12-.21.27-.36.69-.63.78-.28.09-.67-.13-1.11-.23-.27.42-.57.89-.89,1.39h-1.6c-.94-.62-1.84-1.22-2.73-1.81-.13-.42-.27-.87-.42-1.39-.22.2-.32.29-.47.42-.3-.15-.6-.35-.93-.46-.64-.22-1.25-.48-1.97-.45-1.19.05-2.39.01-3.64.01-.22.26-.46.56-.71.85-.18-.53-.53-.24-.86-.19.01.15.02.28.04.48h.53Zm11.84,1.49c.61-.23,1-.51,1.12-1.16h-1.12v1.16ZM24.48.88c-.82-.19-1.66-.32-2.48,0h2.48Zm-2.7,4.92c.13.14.27.28.26.28.09-.02.3-.09.52-.15l-.09-.13h-.69Z"
  },
  // FR : ⚠️ AJOUT (25/08/2026) - "Micro-missiles" (Rocket Sidearm), signalé
  // manquant par l'utilisateur (artefact Outillage de Curiosité). Aucune
  // forme dédiée n'existait ; plutôt que d'en inventer une sans référence
  // visuelle réelle, réutilise le TRACÉ EXACT de Lance-roquettes - les deux
  // tirent des projectiles de type missile/roquette, l'approximation est
  // assumée plutôt que cachée. Si une vraie icône officielle est fournie un
  // jour, cette entrée pourra être remplacée sans toucher au reste.
  // EN: ⚠️ ADDED - "Micro-Missiles" (Rocket Sidearm), reported missing by
  // the user. No dedicated shape existed; rather than inventing one without
  // a real visual reference, reuses the EXACT path from Rocket Launcher -
  // both fire missile/rocket-type projectiles, the approximation is
  // deliberate, not hidden.
  {
    motCle: "micro-missile",
    viewBox: "0 0 36.66 8.87",
    d: "m7.59,5.47c-.03.08-.06.22-.1.23-.22.04-.45.04-.61.06-.63-1.19-.38-2.4-.45-3.64h1.64c.14.13.35.33.58.55,2.02-.22,4.11.3,6.36-.43-.7-.25-1.18-.43-1.66-.6,0-.05,0-.09,0-.14.65,0,1.31-.04,1.96.01.63.05,1.36.01,1.86.31.67.41,1.25.11,1.88.1-.18-.09-.36-.17-.55-.26v-.57c.4-.51,1.19-.58,2.22-.14.23-.3.49-.62.67-.86h3.64c.16.25.32.51.5.8.3.03.66.07,1.15.13-.23.34-.39.55-.54.78-.09-.08-.16-.14-.29-.24-.22.11-.48.23-.74.35.06.06.12.16.18.16,1.1,0,2.2-.02,3.3.02.53.02,1.06.15,1.63.23v2.26c-.36.1-.79.22-1.22.33-.09.02-.24-.04-.28,0-.72.89-1.75.87-2.82.87.15.72.73.96,1.05,1.39.33.43.65.87.98,1.31-.07.07-.18.17-.31.3-.21-.06-.52-.05-.64-.2-.49-.58-.93-1.2-1.44-1.88-.26-.09-.63-.22-1.03-.36.12-.24.19-.36.26-.5-.12-.03-.24-.11-.29-.07-.19.12-.36.28-.54.42-.37.3-.69.2-.97-.12-.21.27-.36.69-.63.78-.28.09-.67-.13-1.11-.23-.27.42-.57.89-.89,1.39h-1.6c-.94-.62-1.84-1.22-2.73-1.81-.13-.42-.27-.87-.42-1.39-.22.2-.32.29-.47.42-.3-.15-.6-.35-.93-.46-.64-.22-1.25-.48-1.97-.45-1.19.05-2.39.01-3.64.01-.22.26-.46.56-.71.85-.18-.53-.53-.24-.86-.19.01.15.02.28.04.48h.53Zm11.84,1.49c.61-.23,1-.51,1.12-1.16h-1.12v1.16ZM24.48.88c-.82-.19-1.66-.32-2.48,0h2.48Zm-2.7,4.92c.13.14.27.28.26.28.09-.02.3-.09.52-.15l-.09-.13h-.69Z"
  },
  {
    motCle: "fusion",
    viewBox: "0 -20 72 72",
    d: "M66.944 3.936h0.608v5.792l-0.448 0.448v2.4h-0.768l-0.576 0.608h-13.568l-0.576-0.64h-1.184l-9.76 7.328v8.864l-0.48 0.512h-8.128l-0.416-0.448v-3.36l-13.504-3.904-0.512-0.32-0.224-0.32v-0.48l0.64-0.192 0.448-0.256 0.192-1.312 0.416-1.408 0.832-1.792 1.024-1.632 0.992-1.344 0.256-0.32 0.032-0.192-0.16-0.224h-12.672l-2.144 2.272-0.128 0.288v2.368l-0.448 0.992-2.144 0.768-0.256-0.16-0.16-0.736v-0.512l0.16-2.688 0.096-2.88-0.096-2.88-0.16-1.984 0.096-0.672 0.256-0.192 0.416-0.096h0.576l0.416 0.384h0.704l0.352-0.352h20.704l1.952-0.48 0.928-0.704 0.512-0.768 0.256-0.48h1.856v-0.416h1.312l0.448-0.736 3.232-0.16 0.48-0.544 0.224-1.152h1.088l0.16 1.12 0.672 0.832v0.448h3.68v0.48h21.088zM31.648 22.368v-9.696h-3.712l-0.128 0.32-0.032 0.576 0.128 0.704 0.288 0.64-0.288 0.288-0.192-0.192-0.224-0.288-0.32-0.672-0.128-0.64-0.032-0.736h-0.576l-0.224 0.288-0.16 0.576 0.064 0.736 0.288 0.448 0.608 0.384v0.288l-0.384 0.416-0.352-0.032-0.512 0.064-0.352 0.224-0.288 0.448-0.224 0.8v0.864l-0.384 0.192-0.512 0.544-0.416 0.736-0.256 0.96 8.064 2.336v-0.288zM33.664 9.632v-3.424h-0.64v3.424h0.64z"
  },
  {
    motCle: "rayon",
    viewBox: "0 -23.5 79 79",
    d: "M59.776 13.824q0.544 0 0.944 0.4t0.4 0.976q0 0.544-0.4 0.944t-0.944 0.4h-55.68v-2.72h55.68zM67.744 15.232l6.24 4.448-7.648-0.064 2.4 7.264-6.144-4.544-2.304 7.296-2.304-7.296-6.176 4.544 2.432-7.264 0.256-0.768h5.376q1.504 0 2.576-1.072t1.072-2.576-1.072-2.576-2.576-1.072h-5.376l-0.256-0.704-2.432-7.296 6.176 4.576 2.304-7.328 2.304 7.328 6.144-4.576-2.4 7.296 7.648-0.064zM40.768 19.616v-0.768h13.728v0.768h-13.728zM48.96 11.552v-0.768h5.536v0.768h-5.536zM34.304 11.552v-0.768h10.208v0.768h-10.208zM26.848 11.552v-0.768h2.56v0.768h-2.56zM19.52 11.552v-0.768h1.056v0.768h-1.056zM13.6 11.552v-0.768h1.056v0.768h-1.056zM31.36 19.616v-0.768h4.096v0.768h-4.096zM22.752 19.616v-0.768h0.928v0.768h-0.928z"
  }
];
var LANCE_GRENADES_SPECIAL = {
  viewBox: "0 -364.5 1659 1659",
  d: "M902,292q-3,1-10,1h-1q-3,0-3,2a5.76231,5.76231,0,0,1-2,4q-1,1-7,1l-2-1a62.11142,62.11142,0,0,1,1,12h559V290h-22a2.88126,2.88126,0,0,0-1,2,2.5,2.5,0,0,1,0,4,4.07441,4.07441,0,0,1-3,1q-15,0-21,1-3,0-5-4-2.00005-6-10-4h-12l-2,4q0,4-4,4h-19q-5.00005,0-5-4-.99995-4-7-4h-14q-3.99995,0-4,2a6.78371,6.78371,0,0,1-2,5q-2.00005,2-7,2-.99995-2-3,0a4.07441,4.07441,0,0,1-3-1q-2.00005-1-2-5v-2q-2.00005-9-10-8-6.99995,0-10,1a53.04681,53.04681,0,0,0-6,.5,53.04681,53.04681,0,0,1-6,.5h-5q-9.99995,2-13-6a.8839.8839,0,0,0-1-1h-12q-.99995-1-4-1h-11a106.10225,106.10225,0,0,1-12-1,106.10225,106.10225,0,0,0-12-1h-6q-9.99995-2-14,3-.99995,1-3,0-5.00005-1-9,3-2.00005,2-3,2l-4,4a15.66775,15.66775,0,0,0-3,4l-3,2,1-3q2.00005-8-4-20a2.88126,2.88126,0,0,0-1-2v-1q-5.00005-8-9-10t-4-9V91a352.86707,352.86707,0,0,0-1-60V26q-3-17-4-19a.88389.88389,0,0,1-1-1q-2.00005-4-2-6h-6a68.56161,68.56161,0,0,0-1,13v95q0,5,.5,14.5t.5,14.5v70a110.05818,110.05818,0,0,0-1,17q0,3-2,4-6,4-15,15a58.57316,58.57316,0,0,1-7,8,23.14177,23.14177,0,0,1-5,3q-9.99995,1-30,1H966q-32.00005,0-48,1-8.00005,1-8,9a13.92773,13.92773,0,0,0-1,6q-2.00005,8-1,12v2q3,5,2,6t-5,1Zm205-26q6,6,1,13l-1,1-14-14,1-1Q1100.99995,260,1107,266Zm-14,0,14,14-1,1q-3.99995,2-6,2a9.59386,9.59386,0,0,1-7-3q-6-6-1-13Zm-88,16q8.00005,0,10,9v1H995v-1Q997.00006,282,1005,282Zm10,11q-2.00005,9-10,9t-10-9v-1h20ZM937,480V318H878a941.8122,941.8122,0,0,0-12,149v13Zm336-163q-3,0-3,4V476q0,4,3,4h40q3.99995,0,4-4V321q0-1-2-3,0-1-2-1Zm153,189a30.336,30.336,0,0,1,9-1h2V491l-1-2v-4H866v19a2.881,2.881,0,0,1,1-2l1-1q1-2,4-2h5q10,0,14,5,5,5,16,3h10v-1l1-1q2.00005-6,10-6,9-2,14,3l1,2q3.99995,4,7,3,3.99995-2,6-2h8q3,2,5,0a5.76207,5.76207,0,0,0,2-4q0-2,1-2,3-1,10-1a16.25016,16.25016,0,0,0,8,0q.99995,0,4,3v2h1a6.78387,6.78387,0,0,0,5,2,26.62649,26.62649,0,0,1,12,3q3.99995,3,14,7,2.00005,2,8.5,5.5t9.5,5.5q2.00005,2,3,2,5.00005,5,9,5,6.99995-1,16,4a7.67535,7.67535,0,0,0,3,1,8.69932,8.69932,0,0,1,3.5,1.5,19.34059,19.34059,0,0,1,3.5,2.5,111.01157,111.01157,0,0,1,15,7h1a4.07437,4.07437,0,0,1,3,1v2q0,5-5,5h-2q-3,1-4,0h-2v3a8.876,8.876,0,0,0,1,4,8.876,8.876,0,0,1,1,4q2.00005,22,2,27-2.00005,29,1,43,.99995,5-2,8-6.99995,4-7,21l1,2q0,4,.5,13t.5,14q0,3-.5,9.5t-.5,9.5a26.01383,26.01383,0,0,0-1,8q0,5,3,6,3.99995,2,4,8v9a198.90411,198.90411,0,0,0,1,23v5q0,12,5,18a3.92115,3.92115,0,0,1,3,4h105q3.99995-1,4-8v-1q-2.00005-33,0-51v-2q0-2,2-6,3-2,3-10-.99995-2-1-8-2.00005-12-2-17a32.90266,32.90266,0,0,0-2-10q-2.00005-15,3-23l-1-1v-1a125.70747,125.70747,0,0,1-2-20V628a161.594,161.594,0,0,1,1-21q2.00005-22-2-33a21.45334,21.45334,0,0,0-1-5.5,22.52157,22.52157,0,0,1-1-4.5q0-11-4-15-2.00005-2-1-4a4.07466,4.07466,0,0,1,1-3q2.00005,0,2-1,9-5,11-4,3.99995,2,7-1l1-1,2-1a155.35644,155.35644,0,0,0,15-11q3.99995-2,5-2a21.44968,21.44968,0,0,1,5,4q6,10,20,10a53.30467,53.30467,0,0,0,12,1q18.99995,0,29,1,5.00005,0,6-1t6-7a15.66962,15.66962,0,0,0,4-3q6-6,6-9a20.37041,20.37041,0,0,1-1-14q2.00005-6,6-6h2q6,2,14,0,3.99995,0,6,2,.99995,1,1,4,0,2,1,2,0,1,2,1h16q3.99995,0,4-2,.99995-7,9-7h15a6.78387,6.78387,0,0,1,5,2q.99995,1,1,4-2.00005,2,2,2Q1419,506,1426,506Zm-287,0q0-9,8-9,9,0,9,9t-9,9Q1138.99995,515,1139,506Zm125-189-269,1V480h269Zm-317,1q-3.99995,0-4,3V476q0,4,4,4h39q3.99995,0,4-4V320l-1-1a4.07441,4.07441,0,0,0-3-1ZM770,587h1l2,1V541a35.06656,35.06656,0,0,1-12.5-5,81.51374,81.51374,0,0,1-10-7q-3.5-3-3.5-4L582,353H772V310H492q-28,0-49,21-97,97-124,126-20,21-37,27a17.7509,17.7509,0,0,1-8,2H166q-5,0-5-2-2-9-1-13a3.20325,3.20325,0,0,1,3-2q4-2,4,3a4.87949,4.87949,0,0,1,1,3.5,4.87949,4.87949,0,0,0,1,3.5v1h13l-6-16V382l9-31q0,1-2,1-6,2-9,10a7.67522,7.67522,0,0,1-1,3,7.67522,7.67522,0,0,0-1,3,61.98758,61.98758,0,0,0-4,12,5.87634,5.87634,0,0,1-3,5q-1,2-6,0-7-2-21-2h-5a91.28749,91.28749,0,0,0-27,4q-3,2-3,4t.5,6.5q.5,4.5.5,6.5v1h60v4H104v1h60v4H105v1h59v4H105v1h59v4H105v1h59v4H105v1h59v4H106v1h58v4H106v1h58v5H106v1h58v4H106a18.39355,18.39355,0,0,0-1.5,5.5,41.34041,41.34041,0,0,0-.5,5.5q0,5,4,5,5,1,5,6a41.27942,41.27942,0,0,1,1.5,9q.5,6,.5,9,6,27,23,37,6,4,11,4l138-1,6-1q6-1,20-10.5T344,492L477,359l3-2a47.10517,47.10517,0,0,1,7.5-2.5A43.51609,43.51609,0,0,1,499,353h17q4,0,8,6a.88388.88388,0,0,1,1,1L740,581A75.34546,75.34546,0,0,0,770,587ZM572,294H506a512.49744,512.49744,0,0,0-64,0q-13,1-25,15-2,4-5,4h-7q-11,0-16-3-1-1-8-1h-6a42.07127,42.07127,0,0,1-10-1h-3q-5,5-17,5H312q-32,0-50,7-3,1-8.5,3.5T246,327q-4,2-14,6l-5,3a275.41788,275.41788,0,0,1-29,11l-1,1q-2,0-6,2l-10,33v80l7,17h86a13.92745,13.92745,0,0,0,6-1q15-5,35-26,17-19,124-126,23-23,53-23H682q-8-4-12-8-6-5-18-3-13,1-38,1H572Zm200,64H595L751,521q0,1,3,3.5a85.34189,85.34189,0,0,0,8.5,6A31.19918,31.19918,0,0,0,773,535Q773,411,772,358Zm8,285q1,15,3,18h61q7,0,11-4,16-9,16-19a13.67735,13.67735,0,0,0-.5-3,16.43866,16.43866,0,0,1-.5-4q0-2-2-14-9-99-9-149,0-101,12-155v-1q0-20-11-31-9-9-23-9H786a8.87558,8.87558,0,0,0-4,1,17.75129,17.75129,0,0,0-2,8V643Zm698-165,37-1h134q3.99995,0,5-1a4.53012,4.53012,0,0,0,1-5l1-2v-3l1-18a246.61943,246.61943,0,0,0,1-25.5,216.92931,216.92931,0,0,1,1-24.5q0-32-1-49-.99995-8-1-26,0-4-5-4H1442q-3,0-3-2H1322V480h116q2.00005-3,6-2h34ZM592,496q3,0,3-2a3,3,0,0,0-6,0Q589,496,592,496Zm57,39h38L521,364a.88388.88388,0,0,0-1-1q-2-4-4-4t-7.5-.5q-5.5-.5-9.5-.5-12,0-18,5L348,496q-40,40-62,40H176a2.88113,2.88113,0,0,1,1,2q2,5,6,5a21.0669,21.0669,0,0,1,3.5.5,21.0669,21.0669,0,0,0,3.5.5,16.43768,16.43768,0,0,1,4,.5,13.67631,13.67631,0,0,0,3,.5q6,2,6,6a10.81216,10.81216,0,0,0,3,8q2,4,0,10a2.88113,2.88113,0,0,0-1,2q-4,12-17,30a23.1443,23.1443,0,0,0-3,5q-24,35-48,72-6,10-18.5,28.5T102,731L84,758q-10,16-15,23L39,826a195.30039,195.30039,0,0,0-12.5,17.5Q19,855,17,858,7,874,2,881q0,1-2,1v3H1q9,9,29,11a17.77037,17.77037,0,0,0,5,1.5,31.42719,31.42719,0,0,0,5,.5q39,8,124,24a223.78755,223.78755,0,0,0,40,6h1a5.76223,5.76223,0,0,1,4,2h1q1-2,5-2a7.675,7.675,0,0,0,3-1,2.88109,2.88109,0,0,0,2-1q7-4,11-14t2-18q-3-12-1-21,4-15,9-24,2-4,6.5-12t6.5-12q1-2,23-43,9-19,29-25,20-7,15-27-6-24,8-49,6-8,9-9a56.20354,56.20354,0,0,1,13-2q15-2,16-3,10-2,31-2h12a338.49831,338.49831,0,0,1,52,0h27q21,0,26-23,1-5,1-16V606q0-22,1-34,0-7,7-10h5q5,5,13,2,5-1,13-3h5q10-2,11-13v-3q1,0,1-2a2.881,2.881,0,0,1,1-2H460a3,3,0,0,1,0-6H649ZM515,550q0,4-4,4t-4-4q0-4,4-4T515,550Zm-16,9q3,0,4,2a.88387.88387,0,0,1,1,1,2.881,2.881,0,0,1-1,2v30a180.87884,180.87884,0,0,1,0,38q-1,16-8,21t-23,6H410a210.59285,210.59285,0,0,0-41,0q-9,0-10-8-3-12-3-36V567q0-4,3-5,5,0,6,3a10.81214,10.81214,0,0,0,8,3,47.46224,47.46224,0,0,1,11,1q14,2,15,15a30.335,30.335,0,0,1,1,9q0,3,.5,8a38.114,38.114,0,0,0,1.5,8q3,22,25,40a.88387.88387,0,0,1,1,1q2,2,3,1a1.76778,1.76778,0,0,0,2-2q3-5-1-8-14-8-19-26a38.5423,38.5423,0,0,1,4-32q2-3,8-7,4-2,18-14,3-3,10-3h46ZM468,411q0-11,12-11,11,0,11,11t-11,11Q468,422,468,411ZM575,513l-1-1q-1-1-1-4a4.07438,4.07438,0,0,1,1-3l12-11-11-11q-1,0-1-3a4.07438,4.07438,0,0,1,1-3q3-4,7,0l10,10,9-9q4-4,6,0,3,3,0,7l-8,9,10,10a5,5,0,0,1,0,6q-3,3-7,0l-10-10-11,12-1,1h-5Zm527,301v3a4.07466,4.07466,0,0,1,1,3q0,4,5,4,45,2,77,1h4q8.00005,0,10-1,2.00005-2,2-8v-6a8.876,8.876,0,0,1,1-4v-1H1102v9Z"
};
var LANCE_GRENADES_LOURD = {
  viewBox: "0 -26 84 84",
  d: "M79.040 7.040h0.736v3.776h-0.576l-0.448 0.736h-8.032l0.352 0.352v1.28l-0.288 0.32h-1.728l-0.928 0.288-0.768 0.672-0.768 1.44-3.488 7.776-0.672 0.832-0.928 0.576-1.056 0.352-1.664 0.16h-29.376l-2.048-0.352-19.424-5.344-0.48-0.512-0.384 0.864-0.448 0.256-1.152 0.128-0.768 0.032-0.224-0.32-0.224-0.8 0.128-3.328 0.128-3.648-0.256-4.16-0.128-2.144 0.128-1.216 0.448-0.672 0.48-0.192h1.824l0.416 0.416 0.16 0.608 1.28-0.864 16.928-0.576 1.344-0.48 0.48-0.672h1.088v0.672h1.152l0.672-1.184 0.416-0.32h3.968l0.256 0.192 1.184 0.992h4.544l0.928 0.928h4.96v-0.928h1.12v1.12h6.752l0.544 0.544h20.288v-0.48h2.336l1.536 1.44v1.12zM27.616 15.584l0.192-1.088-0.192-0.8-0.448-0.544-0.384-0.224-2.24-0.256-1.056 0.128-0.576 0.128-0.352 0.448-0.192 1.12 0.224 0.928 0.64 0.768 1.12 0.48h1.472l1.056-0.288zM53.152 8.032v-0.352h-16.032v0.352h15.328v13.504h-15.328v-7.712l0.192-0.416h-2.208l-0.352 0.448-0.16 0.736 0.128 0.736 0.192 0.64 0.352 0.544-0.224 0.288-0.448-0.384-0.576-0.928-0.416-1.408-0.064-0.576-0.352 0.416-0.256 0.576-0.128 0.608v0.448l0.224 0.32 0.256 0.288 0.224 0.416-0.128 0.704h-0.704l-0.48 0.512-0.384 0.544-0.128 0.416v0.416l-0.128 0.288-0.384 0.224-0.416 0.8-0.32 0.704-0.128 0.864v0.416l0.256 0.192h6.912v-0.032h15.68v-14.592zM62.656 14.592l0.192-0.8-0.096-0.608-0.352-0.256-0.608-0.128h-3.904l-0.48 0.16-0.32 0.448-0.096 0.704v6.304l0.096 0.48 0.288 0.448 0.672 0.128 0.704-0.064 0.544-0.384 0.448-0.736z"
};
function formeDepuisTexte(typeArme, slot, munition) {
  if (!typeArme || !typeArme.trim()) return void 0;
  const normalise = normaliser(typeArme);
  if (normalise.includes("lance-grenades") || normalise.includes("grenade launcher")) {
    const lourd = munition !== void 0 ? munition === "lourde" : slot === "lourde";
    return lourd ? LANCE_GRENADES_LOURD : LANCE_GRENADES_SPECIAL;
  }
  return CHEMINS.find((c) => normalise.includes(c.motCle));
}
var CATEGORIES_TYPE_ARME = [
  [153950757, "Lance-grenades"],
  [1504945536, "Fusil \xE0 fusion lin\xE9aire"],
  [3954685534, "Pistolet-mitrailleur"],
  [2489664120, "Fusil \xE0 rayon"],
  [3317538576, "Arc"],
  [3871742104, "Glaive"],
  [54, "\xC9p\xE9e"],
  [5, "Fusil automatique"],
  [6, "Arme de poing"],
  [7, "Fusil \xE0 impulsion"],
  [8, "Fusil d'\xE9claireur"],
  [9, "Fusil \xE0 fusion"],
  [10, "Fusil de pr\xE9cision"],
  [11, "Fusil \xE0 pompe"],
  [12, "Mitrailleuse"],
  [13, "Lance-roquettes"],
  [14, "Pistolet"]
];
function trouverFormeTypeArme(typeArme, slot, munition, categories, typeSecours) {
  const direct = formeDepuisTexte(typeArme, slot, munition);
  if (direct) return direct;
  if (categories && categories.length > 0) {
    const ensemble = new Set(categories);
    const trouve = CATEGORIES_TYPE_ARME.find(([hash]) => ensemble.has(hash));
    const parCategorie = trouve ? formeDepuisTexte(trouve[1], slot, munition) : void 0;
    if (parCategorie) return parCategorie;
  }
  return typeSecours ? formeDepuisTexte(typeSecours, slot, munition) : void 0;
}

// src/components/icones/IconeMunition.tsx
init_define_import_meta_env();
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var ICONES = {
  munition_lourde: {
    viewBox: "0 -205 1434 1434",
    libelle: "Munitions lourdes",
    d: "M460.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M716.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M972.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M371.2 473.6h179.2v294.4h-179.2v-294.4z M627.2 473.6h179.2v294.4h-179.2v-294.4z M883.2 473.6h179.2v294.4h-179.2v-294.4z M179.2 1024l-179.2-179.2v-665.6l179.2-179.2h1075.2l179.2 179.2v665.6l-179.2 179.2zM230.4 896h972.8l102.4-102.4v-563.2l-102.4-102.4h-972.8l-102.4 102.4v563.2z"
  },
  munition_speciale: {
    viewBox: "0 -205 1434 1434",
    libelle: "Munitions sp\xE9ciales",
    d: "M588.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M499.2 473.6h179.2v294.4h-179.2v-294.4z M844.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M755.2 473.6h179.2v294.4h-179.2v-294.4z M179.2 1024l-179.2-179.2v-665.6l179.2-179.2h1075.2l179.2 179.2v665.6l-179.2 179.2zM230.4 896h972.8l102.4-102.4v-563.2l-102.4-102.4h-972.8l-102.4 102.4v563.2z"
  },
  munition_principale: {
    viewBox: "0 -205 1434 1434",
    libelle: "Munitions principales",
    d: "M716.8 243.2c38.4 0 89.6 128 89.6 179.2h-179.2c0-51.2 51.2-179.2 89.6-179.2z M627.2 473.6h179.2v294.4h-179.2v-294.4z M179.2 1024l-179.2-179.2v-665.6l179.2-179.2h1075.2l179.2 179.2v665.6l-179.2 179.2zM230.4 896h972.8l102.4-102.4v-563.2l-102.4-102.4h-972.8l-102.4 102.4v563.2z"
  },
  degats_cinetique: {
    viewBox: "0 0 32 32",
    libelle: "D\xE9g\xE2ts cin\xE9tiques",
    d: "M30.83 30.773c-0.233 0.070-0.349-0.045-0.473-0.103-3.406-1.623-6.832-3.204-10.115-5.071-0.091-0.052-0.204-0.108-0.32-0.157l-0.023-0.009c-0.559-0.237-0.816-0.158-1.126 0.378-0.126 0.221-0.261 0.494-0.381 0.774l-0.022 0.057c-0.74 1.654-1.474 3.312-2.218 4.966-0.057 0.127-0.080 0.284-0.251 0.391-0.273-0.571-0.546-1.131-0.809-1.695q-0.958-2.044-1.913-4.091c-0.085-0.19-0.169-0.347-0.263-0.498l0.010 0.018c-0.263-0.417-0.558-0.517-1.019-0.334-0.212 0.095-0.387 0.187-0.555 0.288l0.023-0.013c-3.301 1.791-6.633 3.523-9.956 5.261-0.063 0.052-0.145 0.083-0.234 0.083-0.010 0-0.021-0-0.031-0.001l0.001 0c-0.121-0.129 0.028-0.23 0.072-0.328 1.607-3.452 3.185-6.92 5.092-10.223 0.045-0.079 0.090-0.158 0.127-0.241 0.29-0.655 0.116-1.128-0.546-1.42-0.614-0.27-1.242-0.508-1.856-0.785-1.351-0.608-2.697-1.238-4.045-1.859 0.062-0.218 0.249-0.226 0.387-0.292q2.621-1.253 5.259-2.493c0.082-0.039 0.166-0.074 0.247-0.109 0.805-0.399 0.914-0.724 0.476-1.506-1.044-1.879-2.038-3.776-3.025-5.675q-1.168-2.244-2.322-4.497c-0.052-0.102-0.166-0.194-0.12-0.337 0.166-0.076 0.282 0.050 0.402 0.109 3.435 1.643 6.88 3.268 10.206 5.132 0.015 0.009 0.028 0.022 0.045 0.031 0.848 0.455 1.158 0.359 1.565-0.531 0.835-1.83 1.658-3.668 2.486-5.502 0.073-0.161 0.102-0.348 0.293-0.494 0.347 0.764 0.689 1.512 1.026 2.263q0.793 1.762 1.579 3.526c0.029 0.067 0.059 0.133 0.090 0.199 0.429 0.914 0.764 1.024 1.659 0.52 3.286-1.856 6.661-3.544 10.026-5.251 0.091-0.046 0.175-0.129 0.299-0.109 0.073 0.161-0.053 0.275-0.109 0.394-1.604 3.434-3.193 6.88-5.051 10.185-0.009 0.016-0.022 0.030-0.029 0.046-0.442 0.835-0.358 1.136 0.507 1.529 1.849 0.842 3.664 1.754 5.485 2.652l0.302 0.156c-0.074 0.204-0.278 0.212-0.427 0.278-1.719 0.775-3.443 1.54-5.164 2.31-1.092 0.488-1.192 0.794-0.608 1.826 1.896 3.352 3.598 6.8 5.346 10.251zM7.572 7.754c-0.016-0.050-0.055-0.091-0.094-0.046s0.007 0.074 0.056 0.082c0.048 0.312 0.236 0.566 0.376 0.835 0.954 1.856 1.92 3.698 2.887 5.556-1.27 0.604-2.537 1.208-3.858 1.838 1.31 0.681 2.602 1.239 3.88 1.821-1.192 2.14-2.203 4.307-3.167 6.494l0.095 0.079c2.1-1.104 4.2-2.207 6.321-3.323l1.866 3.943 1.78-3.957c2.146 1.179 4.311 2.206 6.544 3.218-0.012-0.071-0.027-0.133-0.045-0.193l0.003 0.010c-0.988-1.981-1.973-3.962-3.040-5.897-0.218-0.398-0.218-0.399 0.211-0.592 0.828-0.369 1.659-0.733 2.484-1.107 0.287-0.131 0.596-0.218 0.915-0.463l-3.81-1.876q1.778-3.23 3.267-6.574c-2.218 1.052-4.383 2.141-6.536 3.336l-1.823-4.040c-0.624 1.377-1.22 2.691-1.824 4.024-1.92-1.064-3.853-1.983-5.788-2.893-0.227-0.104-0.439-0.259-0.701-0.276z M15.906 12.777c1.75 0.009 3.165 1.43 3.165 3.181 0 1.757-1.424 3.181-3.181 3.181s-3.181-1.424-3.181-3.181c0-0 0-0.001 0-0.001v0c0.006-1.758 1.432-3.18 3.191-3.18 0.002 0 0.005 0 0.007 0h-0zM16.799 15.935c-0.012-0.483-0.406-0.871-0.891-0.871-0.492 0-0.891 0.399-0.891 0.891 0 0.007 0 0.015 0 0.022l-0-0.001c0.019 0.48 0.413 0.863 0.896 0.863 0.015 0 0.030-0 0.044-0.001l-0.002 0c0.473-0.034 0.844-0.426 0.844-0.905 0 0 0-0 0-0v0z"
  }
};
var MUNITIONS = {
  principale: { cle: "munition_principale", couleur: "#e8e8e5" },
  speciale: { cle: "munition_speciale", couleur: "#7fd97f" },
  lourde: { cle: "munition_lourde", couleur: "#9d6bff" }
};

// src/data/emblemeForgeArmory.ts
init_define_import_meta_env();
var EMBLEME_VIEWBOX = "0 0 1024 1100";
var OPACITE_FILIGRANE = 0.07;
var ARGENT = [
  "M 779 331 L 775 332 L 743 352 L 607 443 L 566 473 L 542 497 L 542 499 L 561 513 L 576 531 L 587 550 L 594 569 L 599 569 L 653 550 L 684 537 L 699 529 L 743 419 L 778 337 Z",
  "M 245 331 L 325 530 L 371 550 L 429 569 L 436 551 L 443 538 L 458 518 L 472 505 L 481 499 L 479 493 L 453 469 L 408 437 L 254 335 Z",
  "M 433 590 L 410 580 L 393 575 L 378 573 L 364 584 L 340 607 L 307 645 L 310 659 L 326 706 L 330 731 L 329 752 L 325 772 L 319 792 L 308 818 L 310 818 L 389 759 L 413 736 L 435 708 L 435 701 L 430 695 L 412 664 L 415 663 L 431 667 L 450 668 L 460 641 L 464 621 L 455 608 Z",
  "M 591 590 L 578 599 L 567 610 L 559 622 L 559 627 L 563 641 L 573 668 L 594 667 L 608 663 L 611 664 L 596 691 L 587 703 L 588 708 L 605 731 L 631 757 L 674 790 L 709 815 L 714 817 L 714 814 L 702 788 L 694 757 L 692 736 L 696 707 L 716 646 L 684 608 L 666 590 L 645 573 L 639 573 L 614 580 Z",
  "M 450 171 L 413 179 L 384 188 L 348 203 L 323 216 L 291 237 L 258 264 L 232 290 L 208 319 L 191 344 L 176 370 L 164 395 L 150 431 L 139 472 L 133 507 L 130 538 L 130 577 L 133 608 L 138 637 L 148 675 L 159 706 L 175 740 L 185 757 L 204 785 L 222 807 L 239 825 L 276 857 L 323 887 L 361 905 L 389 915 L 419 923 L 457 929 L 455 915 L 453 911 L 422 906 L 384 895 L 354 883 L 321 866 L 296 850 L 275 834 L 241 802 L 219 776 L 206 758 L 187 726 L 175 700 L 165 673 L 156 641 L 150 608 L 147 580 L 147 539 L 149 515 L 156 475 L 163 447 L 170 425 L 181 398 L 198 365 L 219 333 L 244 302 L 271 275 L 312 243 L 344 224 L 387 205 L 427 193 L 446 189 L 453 189 L 455 186 L 457 171 Z",
  "M 567 170 L 570 187 L 572 189 L 590 191 L 633 203 L 665 216 L 709 240 L 732 256 L 754 274 L 784 304 L 813 342 L 829 369 L 853 423 L 869 482 L 874 516 L 876 545 L 876 566 L 873 605 L 868 634 L 861 662 L 849 696 L 835 726 L 825 744 L 796 785 L 761 823 L 736 844 L 716 858 L 671 883 L 636 897 L 599 907 L 571 911 L 568 922 L 568 929 L 601 924 L 636 915 L 675 900 L 701 887 L 736 865 L 757 849 L 773 835 L 807 799 L 820 782 L 847 739 L 864 703 L 875 672 L 884 637 L 890 600 L 892 577 L 892 531 L 889 501 L 881 458 L 865 407 L 853 379 L 839 352 L 820 322 L 797 293 L 774 269 L 751 249 L 724 229 L 696 212 L 656 193 L 625 182 L 593 174 Z",
  "M 483 517 L 470 528 L 457 545 L 448 562 L 444 573 L 444 578 L 455 586 L 467 598 L 479 616 L 480 625 L 498 695 L 505 731 L 507 731 L 504 661 L 501 627 L 485 517 Z",
  "M 541 517 L 539 517 L 536 531 L 522 636 L 518 695 L 518 728 L 520 728 L 545 614 L 554 601 L 571 584 L 580 578 L 580 574 L 575 561 L 566 544 L 556 531 Z",
  "M 511 411 L 498 415 L 491 420 L 485 427 L 479 441 L 477 460 L 492 477 L 502 497 L 504 497 L 504 489 L 500 468 L 486 454 L 486 446 L 490 444 L 507 448 L 509 455 L 509 465 L 515 465 L 516 449 L 536 444 L 538 448 L 538 454 L 528 462 L 523 469 L 519 500 L 521 500 L 531 478 L 547 460 L 547 454 L 542 432 L 536 423 L 528 416 L 522 413 Z",
  "M 916 507 L 917 513 L 923 527 L 927 544 L 941 554 L 927 567 L 924 581 L 916 604 L 918 604 L 976 557 L 977 553 L 952 535 L 918 507 Z",
  "M 101 507 L 66 537 L 46 552 L 45 556 L 83 587 L 101 604 L 103 604 L 103 600 L 99 592 L 92 567 L 79 555 L 82 551 L 93 543 L 95 532 L 103 511 L 103 507 Z",
  "M 859 553 L 824 553 L 821 554 L 821 556 L 859 557 Z",
  "M 163 553 L 164 557 L 199 556 L 198 553 Z"
];
var CYAN = [
  "M 511 22 L 486 151 L 478 184 L 478 190 L 498 294 L 511 375 L 513 375 L 542 210 L 545 200 L 546 181 L 522 69 L 520 54 L 517 45 L 516 34 L 513 22 Z",
  "M 511 760 L 510 770 L 507 779 L 489 869 L 478 916 L 486 949 L 511 1078 L 513 1078 L 516 1066 L 517 1055 L 520 1046 L 522 1031 L 546 921 L 546 910 L 518 788 L 513 760 Z"
];
function emblemeSvg(prefixe, attributs = "") {
  const chemins = (liste2, remplissage) => liste2.map((d) => `<path d="${d}" fill="url(#${prefixe}-${remplissage})"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEME_VIEWBOX}" ${attributs}><defs><linearGradient id="${prefixe}-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="${prefixe}-cyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#52e7ff"/><stop offset="0.5" stop-color="#00aef5"/><stop offset="1" stop-color="#0087d9"/></linearGradient></defs><g shape-rendering="geometricPrecision">${chemins(ARGENT, "silver")}${chemins(CYAN, "cyan")}</g></svg>`;
}

// src/lib/loadouts/iconesExport.ts
init_define_import_meta_env();

// src/components/icones/IconeClasse.tsx
init_define_import_meta_env();
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var COULEURS = {
  chasseur: "#3fa9e0",
  titan: "#d5453a",
  arcaniste: "#e0c93f"
};
var CHEMINS_SVG = {
  chasseur: "m9.055 10.446 6.945-.023-6.948 10.451 6.948-.024-7.412 11.15h-7.045l7.036-10.428h-7.036l7.032-10.422h-7.032l7.507-11.126 6.95-.024zm13.89 0-6.945-10.446 6.95.024 7.507 11.126h-7.032l7.032 10.422h-7.036l7.036 10.428h-7.045l-7.412-11.15 6.948.024-6.948-10.451z",
  titan: "m14.839 15.979-13.178-7.609v15.218zm2.322 0 13.178 7.609v-15.218zm5.485-12.175-6.589-3.804-13.178 7.609 13.178 7.609 13.179-7.609zm0 16.784-6.589-3.805-13.178 7.609 13.178 7.608 13.179-7.608-6.59-3.805z",
  arcaniste: "m5.442 23.986 7.255-11.65-2.71-4.322-9.987 15.972zm5.986 0 4.28-6.849-2.717-4.333-6.992 11.182zm7.83-11.611 7.316 11.611h5.426l-10.015-15.972zm-7.26 11.611h8.004l-4.008-6.392zm6.991-11.182-2.703 4.324 4.302 6.858h5.413zm-5.707-.459 2.71-4.331 2.71 4.331-2.703 4.326z"
};
var LIBELLES = {
  chasseur: "Chasseur",
  titan: "Titan",
  arcaniste: "Arcaniste"
};

// src/components/icones/IconeElement.tsx
init_define_import_meta_env();
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var COULEURS2 = {
  solaire: "#f0782d",
  arc: "#7de3f4",
  abyssal: "#8b5cf6",
  stase: "#4d88d6",
  filobscur: "#0a8f5c",
  prismatique: "#e8e6df"
};
var FORMES = {
  // Solaire : flamme
  solaire: "M8 1c1 3-2 4-2 6.5C6 9.9 7.1 11 8 11s2-1.1 2-3.5c0-1-.5-2-1-2.5.8.3 2.5 1.7 2.5 4.5A3.5 3.5 0 0 1 8 13a3.5 3.5 0 0 1-3.5-3.5C4.5 6.5 6.5 4 8 1z",
  // Arc : éclair
  arc: "M9.5 1 3 9h3.5L6 15l6.5-8H9L9.5 1z",
  // Abyssal : triangle inversé (comme le blason du jeu)
  abyssal: "M8 13 1.5 3h13L8 13z",
  // Stase : flocon (croix à 3 branches)
  stase: "M8 1v14M2 4.5l12 7M14 4.5l-12 7",
  // Filobscur : fil noué
  filobscur: "M2 8a3 3 0 1 1 6 0 3 3 0 1 0 6 0M2 8a3 3 0 1 0 6 0 3 3 0 1 1 6 0",
  // Prismatique : losange à facettes
  prismatique: "M8 1 14 8 8 15 2 8 8 1zM8 1v14M2 8h12"
};
var PRISMATIQUE_VIEWBOX = "0 0 861.42857 771.42857";
var PRISMATIQUE_TRANSFORM = "translate(315.56965,219.36964)";
var PRISMATIQUE_TRACES = [
  { fill: "#483737", d: "M -179.62852,551.78714 46.744506,523.16764" },
  { fill: "#b66c9a", d: "m -179.89891,552.05389 276.869541,-771.42353 -49.873,742.79786 c 0,0 -108.752079,5.68533 -226.996541,28.62567 z" },
  { fill: "#b66c9a", d: "M -290.92887,398.42142 38.022186,-172.83904 c 0,0 -177.627416,20.93356 -285.989376,192.780303 -108.36195,171.846747 -57.46467,333.910837 -42.96168,378.480157 z" },
  { fill: "#b66c9a", d: "M 406.45405,552.05389 129.58451,-219.36964 179.4575,523.42822 c 0,0 108.7521,5.68533 226.99655,28.62567 z" },
  { fill: "#b66c9a", d: "M 520.6308,398.42142 191.67974,-172.83904 c 0,0 177.62743,20.93356 285.98936,192.780303 108.36197,171.846747 57.46471,333.910837 42.9617,378.480157 z" },
  { fill: "#483737", d: "M -179.54392,551.78714 46.969979,523.16764" }
];

// src/data/forge/logosExport.ts
init_define_import_meta_env();
var LOGOS_EXPORT = {
  doctrine: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-doctrine-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="fa-icones-icone-doctrine-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-doctrine-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff3ff"/><stop offset="1" stop-color="#1cc6ff"/></linearGradient><linearGradient id="fa-icones-icone-doctrine-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00aef5"/><stop offset="1" stop-color="#0078d0"/></linearGradient><filter id="fa-icones-icone-doctrine-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-doctrine-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><mask id="fa-icones-icone-doctrine-mHex" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/><circle cx="742.0" cy="512.0" r="42" fill="#000"/><circle cx="627.0" cy="312.8" r="42" fill="#000"/><circle cx="397.0" cy="312.8" r="42" fill="#000"/><circle cx="282.0" cy="512.0" r="42" fill="#000"/><circle cx="397.0" cy="711.2" r="42" fill="#000"/><circle cx="627.0" cy="711.2" r="42" fill="#000"/></mask><linearGradient id="fa-icones-icone-doctrine-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-doctrine-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-doctrine-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-doctrine-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-doctrine-silver)" stroke-width="22"/><g transform="translate(512 512) scale(1.4) translate(-512 -512)"><path d="M 742.0 512.0 L 627.0 312.8 L 397.0 312.8 L 282.0 512.0 L 397.0 711.2 L 627.0 711.2 Z" fill="none" stroke="url(#fa-icones-icone-doctrine-silver)" stroke-width="20" stroke-linejoin="round" mask="url(#fa-icones-icone-doctrine-mHex)"/><path d="M 512 408 L 531 493 L 616 512 L 531 531 L 512 616 L 493 531 L 408 512 L 493 493 Z" fill="url(#fa-icones-icone-doctrine-silver)"/><g filter="url(#fa-icones-icone-doctrine-glowSoft)"><circle cx="742.0" cy="512.0" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="627.0" cy="312.8" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="397.0" cy="312.8" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="282.0" cy="512.0" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="397.0" cy="711.2" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="627.0" cy="711.2" r="25" fill="url(#fa-icones-icone-doctrine-cyanL)"/><circle cx="512" cy="512" r="11" fill="url(#fa-icones-icone-doctrine-cyanL)"/></g></g></g></svg>',
  artefact: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-artefact-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="fa-icones-icone-artefact-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-artefact-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff3ff"/><stop offset="1" stop-color="#1cc6ff"/></linearGradient><linearGradient id="fa-icones-icone-artefact-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00aef5"/><stop offset="1" stop-color="#0078d0"/></linearGradient><filter id="fa-icones-icone-artefact-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-artefact-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fa-icones-icone-artefact-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-artefact-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-artefact-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-artefact-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-artefact-silver)" stroke-width="22"/><g transform="translate(512 512) scale(18.75) translate(-16 -16)"><path d="M31.825 15.499l0.175 0.476-0.175 0.501-0.050 0.752-0.952-0.752h-2.356l-12.479 12.98-12.454-12.98h-2.356l-0.952 0.752-0.050-0.752-0.175-0.501 0.175-0.476 0.050-0.752 0.952 0.752h2.356l12.454-12.955 12.479 12.955h2.356l0.952-0.752z M15.987 23.067q2.932 0 5.037-2.067t2.155-5.024q-0.050-2.932-2.155-4.999t-5.037-2.067-5.049 2.080-2.117 5.012 2.117 4.999 5.049 2.067z" fill="url(#fa-icones-icone-artefact-silver)"/></g><g filter="url(#fa-icones-icone-artefact-glowSoft)"><g transform="translate(512 512) scale(18.75) translate(-16 -16)"><path d="M15.987 10.512q2.255 0 3.847 1.591t1.591 3.872v0.1q0 2.205-1.616 3.809t-3.821 1.604q-2.255 0-3.859-1.604t-1.604-3.909v-0.075q0.050-2.205 1.641-3.796t3.821-1.591z M18.318 16.125v-0.276q-0.050-0.877-0.739-1.516t-1.591-0.639q-0.877 0-1.566 0.639t-0.739 1.516v0.276q0.050 0.902 0.739 1.529t1.566 0.626q0.902 0 1.591-0.626t0.739-1.529z" fill="url(#fa-icones-icone-artefact-cyanL)"/></g></g></g></svg>',
  armes: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-armes-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="fa-icones-icone-armes-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-armes-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff3ff"/><stop offset="1" stop-color="#1cc6ff"/></linearGradient><linearGradient id="fa-icones-icone-armes-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00aef5"/><stop offset="1" stop-color="#0078d0"/></linearGradient><filter id="fa-icones-icone-armes-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-armes-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><mask id="fa-icones-icone-armes-mSwOnly" maskUnits="userSpaceOnUse" x="-400" y="-300" width="1800" height="1800"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/><rect x="-6.5" y="52" width="13" height="180" fill="#000"/><path d="M 0 244 L 15 266 L 0 288 L -15 266 Z" fill="#000" stroke="#000" stroke-width="12" stroke-linejoin="miter"/><path d="M -20 374 L 20 374 M -20 390 L 20 390 M -20 406 L 20 406" stroke="#000" stroke-width="4" fill="none"/><path d="M 0 424 L 12 438 L 0 452 L -12 438 Z" fill="#000"/></mask><linearGradient id="fa-icones-icone-armes-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-armes-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-armes-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-armes-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-armes-silver)" stroke-width="22"/><g transform="translate(512 149.3) scale(1.55)"><g mask="url(#fa-icones-icone-armes-mSwOnly)"><path d="M 0 0 L 34 150 L 36 304 L -36 304 L -34 150 Z" fill="url(#fa-icones-icone-armes-silver)"/><path d="M 0 296 L 96 296 L 136 246 L 142 334 L 104 322 L 40 338 L 0 352 Z" fill="url(#fa-icones-icone-armes-silver)"/><path d="M 0 296 L -96 296 L -136 246 L -142 334 L -104 322 L -40 338 L 0 352 Z" fill="url(#fa-icones-icone-armes-silver)"/><path d="M -15 358 L 15 358 L 15 414 L -15 414 Z" fill="url(#fa-icones-icone-armes-silver)"/><path d="M 0 408 L 28 438 L 0 468 L -28 438 Z" fill="url(#fa-icones-icone-armes-silver)"/></g><g filter="url(#fa-icones-icone-armes-glowSoft)"><rect x="-3" y="60" width="6" height="164" fill="url(#fa-icones-icone-armes-cyanL)"/><path d="M 0 244 L 15 266 L 0 288 L -15 266 Z" transform="translate(0 0)" fill="url(#fa-icones-icone-armes-cyanL)"/><path d="M 0 428 L 8 438 L 0 448 L -8 438 Z" fill="url(#fa-icones-icone-armes-cyanL)"/></g></g></g></svg>',
  armure: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-armures-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="fa-icones-icone-armures-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-armures-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff3ff"/><stop offset="1" stop-color="#1cc6ff"/></linearGradient><linearGradient id="fa-icones-icone-armures-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00aef5"/><stop offset="1" stop-color="#0078d0"/></linearGradient><filter id="fa-icones-icone-armures-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-armures-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><mask id="fa-icones-icone-armures-mFrame" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/><circle cx="404.0" cy="633.0" r="22" fill="#000"/><circle cx="620.0" cy="633.0" r="22" fill="#000"/><path d="M 358.0 262.0 L 358.0 292.0" stroke="#000" stroke-width="6" fill="none"/><path d="M 666.0 262.0 L 666.0 292.0" stroke="#000" stroke-width="6" fill="none"/></mask><linearGradient id="fa-icones-icone-armures-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-armures-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-armures-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-armures-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-armures-silver)" stroke-width="22"/><g transform="translate(512 512) scale(1.2295) translate(-512 -496.0)"><path d="M 342.0 290.0 L 382.0 252.0 L 642.0 252.0 L 682.0 290.0 L 682.0 520.0 L 630.0 640.0 L 512.0 740.0 L 394.0 640.0 L 342.0 520.0 Z M 378.0 310.0 L 402.0 286.0 L 622.0 286.0 L 646.0 310.0 L 646.0 512.0 L 604.0 620.0 L 512.0 696.0 L 420.0 620.0 L 378.0 512.0 Z" fill="url(#fa-icones-icone-armures-silver)" fill-rule="evenodd" mask="url(#fa-icones-icone-armures-mFrame)"/><g filter="url(#fa-icones-icone-armures-glowSoft)"><circle cx="404.0" cy="633.0" r="12" fill="url(#fa-icones-icone-armures-cyanL)"/><circle cx="620.0" cy="633.0" r="12" fill="url(#fa-icones-icone-armures-cyanL)"/></g></g><g filter="url(#fa-icones-icone-armures-glow)"><path d="M 512 342 L 512 682 L 468 498.4 Z" fill="url(#fa-icones-icone-armures-cyanL)"/><path d="M 512 342 L 556 498.4 L 512 682 Z" fill="url(#fa-icones-icone-armures-cyanR)"/><path d="M 512 354 L 514.2 498.4 L 512 670 L 509.8 498.4 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 484.4 L 515 495.4 L 526 498.4 L 515 501.4 L 512 512.4 L 509 501.4 L 498 498.4 L 509 495.4 Z" fill="#ffffff"/></g></g></svg>',
  neutre: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-neutre-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d9dde2"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="fa-icones-icone-neutre-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-neutre-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ff3ff"/><stop offset="1" stop-color="#1cc6ff"/></linearGradient><linearGradient id="fa-icones-icone-neutre-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00aef5"/><stop offset="1" stop-color="#0078d0"/></linearGradient><filter id="fa-icones-icone-neutre-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-neutre-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fa-icones-icone-neutre-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-neutre-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-neutre-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-neutre-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-neutre-silver)" stroke-width="22"/><g transform="translate(512 512) scale(2.5434) translate(-179.00 -185.12)"><path d="M 176.5 121.8 L 172.0 123.0 L 167.2 126.0 L 164.0 130.2 L 162.2 135.2 L 162.2 173.8 L 164.0 178.2 L 165.8 180.8 L 168.8 183.5 L 173.0 185.8 L 180.0 186.8 L 185.2 185.5 L 189.2 183.2 L 191.8 180.8 L 194.8 175.0 L 195.0 134.8 L 193.5 130.2 L 191.8 127.5 L 189.2 125.0 L 183.5 122.2 Z M 107.5 109.2 L 103.2 112.0 L 99.0 116.2 L 96.0 120.8 L 94.0 125.5 L 92.5 132.5 L 92.5 137.5 L 93.2 142.5 L 95.2 148.2 L 97.8 152.5 L 100.8 155.8 L 103.5 158.0 L 114.5 165.0 L 120.2 169.5 L 125.8 174.8 L 132.8 183.0 L 139.8 193.2 L 144.0 201.5 L 149.0 214.8 L 152.0 229.0 L 153.2 244.2 L 155.5 250.2 L 159.0 255.5 L 164.8 260.5 L 168.5 262.5 L 176.0 264.2 L 183.0 264.0 L 190.8 261.5 L 194.0 259.5 L 197.5 256.5 L 200.5 252.8 L 202.8 248.8 L 204.8 241.0 L 204.8 235.8 L 205.8 227.0 L 209.5 212.2 L 213.0 203.0 L 220.8 189.0 L 227.2 180.2 L 236.5 170.2 L 244.0 164.2 L 254.5 157.5 L 258.5 153.8 L 262.8 147.8 L 264.8 142.2 L 265.5 133.0 L 264.5 127.2 L 262.2 121.5 L 258.5 116.0 L 252.2 110.5 L 245.2 107.0 L 240.5 106.0 L 235.5 106.0 L 231.0 107.0 L 226.5 108.8 L 222.0 111.5 L 215.2 116.8 L 208.0 120.5 L 207.5 121.2 L 207.8 172.8 L 207.0 177.0 L 205.8 180.5 L 201.0 188.0 L 196.8 192.2 L 193.2 194.8 L 186.0 197.8 L 178.0 198.8 L 175.0 198.5 L 169.0 197.0 L 162.5 193.8 L 155.5 187.0 L 151.8 181.0 L 149.8 173.5 L 149.5 121.0 L 142.5 116.8 L 133.8 110.0 L 127.2 107.0 L 122.5 106.0 L 117.8 106.0 L 112.8 107.0 Z" fill="url(#fa-icones-icone-neutre-silver)" fill-rule="evenodd"/></g><g filter="url(#fa-icones-icone-neutre-glow)"><path d="M 512 110 L 512 238 L 495 168.88 Z" fill="url(#fa-icones-icone-neutre-cyanL)"/><path d="M 512 110 L 529 168.88 L 512 238 Z" fill="url(#fa-icones-icone-neutre-cyanR)"/><path d="M 512 122 L 514.2 168.88 L 512 226 L 509.8 168.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 154.88 L 515 165.88 L 526 168.88 L 515 171.88 L 512 182.88 L 509 171.88 L 498 168.88 L 509 165.88 Z" fill="#ffffff"/></g><g filter="url(#fa-icones-icone-neutre-glow)"><path d="M 512 786 L 512 914 L 495 844.88 Z" fill="url(#fa-icones-icone-neutre-cyanL)"/><path d="M 512 786 L 529 844.88 L 512 914 Z" fill="url(#fa-icones-icone-neutre-cyanR)"/><path d="M 512 798 L 514.2 844.88 L 512 902 L 509.8 844.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 830.88 L 515 841.88 L 526 844.88 L 515 847.88 L 512 858.88 L 509 847.88 L 498 844.88 L 509 841.88 Z" fill="#ffffff"/></g></g></svg>',
  roaming: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-roaming-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ffd2"/><stop offset="0.55" stop-color="#8fd64f"/><stop offset="1" stop-color="#d4f7b0"/></linearGradient><linearGradient id="fa-icones-icone-roaming-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-roaming-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d3ff9f"/><stop offset="1" stop-color="#7ed321"/></linearGradient><linearGradient id="fa-icones-icone-roaming-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6bbf2a"/><stop offset="1" stop-color="#3f8f12"/></linearGradient><filter id="fa-icones-icone-roaming-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-roaming-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fa-icones-icone-roaming-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-roaming-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-roaming-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-roaming-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-roaming-silver)" stroke-width="22"/><g transform="translate(512 512) scale(2.3069) translate(-159.38 -182.88)"><path d="M 121.0 222.2 L 117.0 224.0 L 96.0 236.0 L 62.0 258.2 L 57.8 261.8 L 66.8 257.2 L 94.0 241.0 L 118.2 224.8 Z M 142.0 158.0 L 138.8 158.0 L 134.8 159.0 L 119.8 161.0 L 117.8 161.8 L 114.8 162.0 L 87.2 167.8 L 61.8 172.2 L 52.5 174.5 L 43.2 176.0 L 38.0 177.5 L 41.8 177.8 L 45.2 177.0 L 64.0 175.5 L 102.8 168.5 L 113.0 166.0 L 124.0 164.8 L 126.2 163.8 L 130.8 163.0 L 135.8 160.5 L 141.5 158.8 Z M 149.8 135.0 L 148.2 134.8 L 116.0 140.0 L 92.5 143.0 L 88.8 144.2 L 146.2 145.8 L 146.8 145.5 L 146.8 144.2 L 146.0 143.0 L 145.8 140.2 L 146.5 138.5 L 149.8 135.5 Z M 275.5 101.5 L 268.0 94.5 L 262.5 91.0 L 259.2 89.8 L 253.8 88.8 L 249.5 88.8 L 247.2 89.2 L 244.2 90.5 L 242.2 92.2 L 236.5 101.5 L 227.8 110.8 L 234.5 120.0 L 234.5 121.2 L 225.5 118.5 L 218.2 117.5 L 214.2 118.0 L 207.0 120.2 L 200.0 123.8 L 194.8 124.2 L 184.2 127.5 L 175.2 128.2 L 171.5 129.8 L 167.5 133.0 L 163.8 134.8 L 158.5 135.2 L 156.0 136.2 L 152.2 140.8 L 152.2 141.5 L 153.8 142.8 L 154.2 146.2 L 155.8 147.8 L 158.8 148.5 L 160.2 148.5 L 166.0 146.5 L 171.2 140.8 L 173.0 140.0 L 185.5 138.8 L 195.2 139.2 L 199.2 138.8 L 204.2 137.2 L 205.0 137.8 L 189.2 153.0 L 187.0 155.8 L 170.5 163.0 L 163.0 167.0 L 150.2 171.8 L 117.2 180.0 L 105.8 183.8 L 93.0 187.0 L 75.8 192.2 L 77.2 192.5 L 88.8 191.2 L 101.5 187.8 L 108.2 186.8 L 113.8 186.8 L 120.0 189.2 L 124.2 192.8 L 123.8 193.5 L 111.0 200.0 L 99.2 206.8 L 88.2 211.5 L 80.2 217.8 L 46.0 239.5 L 48.8 238.8 L 57.5 234.8 L 82.5 224.8 L 102.8 215.8 L 129.2 203.0 L 130.8 204.0 L 132.0 207.0 L 133.5 207.2 L 177.0 187.5 L 177.8 187.8 L 176.0 189.8 L 168.8 195.0 L 148.5 212.0 L 141.0 221.8 L 136.2 226.5 L 133.5 227.8 L 130.2 228.2 L 124.5 231.0 L 121.2 234.5 L 116.2 241.5 L 92.8 264.2 L 79.5 276.5 L 79.5 277.0 L 138.2 240.2 L 141.0 240.5 L 157.2 229.8 L 158.5 229.8 L 160.2 230.8 L 161.5 230.5 L 184.5 214.2 L 198.8 203.0 L 206.8 195.5 L 212.0 191.5 L 213.2 191.2 L 213.5 192.2 L 212.0 195.0 L 201.8 207.5 L 201.2 209.5 L 186.2 219.8 L 184.8 221.5 L 200.2 217.5 L 209.5 214.0 L 214.0 208.0 L 215.8 204.5 L 217.5 196.8 L 217.8 188.0 L 220.0 183.5 L 219.2 183.0 L 207.5 188.0 L 205.0 188.8 L 204.5 188.2 L 214.8 182.0 L 226.2 176.5 L 234.5 169.2 L 235.5 169.8 L 235.2 173.8 L 236.2 178.0 L 237.5 179.8 L 239.2 180.8 L 244.0 181.2 L 256.8 181.0 L 267.0 179.5 L 271.5 181.5 L 277.2 181.0 L 280.0 178.0 L 280.0 176.0 L 280.8 173.5 L 279.8 170.5 L 279.0 169.8 L 276.8 169.8 L 275.5 168.8 L 273.8 168.2 L 271.8 169.0 L 267.8 172.0 L 265.5 172.5 L 249.8 168.0 L 248.2 166.8 L 249.8 162.5 L 250.8 155.8 L 253.0 151.2 L 254.0 145.5 L 252.8 139.0 L 250.5 136.2 L 251.0 132.8 L 255.2 125.2 L 257.8 122.2 L 263.5 117.0 L 268.8 113.0 L 274.8 110.2 L 278.2 109.2 L 278.8 109.8 L 275.0 113.8 L 263.2 122.8 L 259.5 126.5 L 256.5 131.0 L 256.8 131.8 L 264.0 137.0 L 266.8 136.5 L 269.2 134.2 L 270.8 131.8 L 272.8 126.2 L 274.8 124.0 L 274.2 122.0 L 274.5 119.8 L 280.8 109.8 L 280.8 108.2 Z" fill="url(#fa-icones-icone-roaming-silver)" fill-rule="evenodd"/></g><g filter="url(#fa-icones-icone-roaming-glow)"><path d="M 512 110 L 512 238 L 495 168.88 Z" fill="url(#fa-icones-icone-roaming-cyanL)"/><path d="M 512 110 L 529 168.88 L 512 238 Z" fill="url(#fa-icones-icone-roaming-cyanR)"/><path d="M 512 122 L 514.2 168.88 L 512 226 L 509.8 168.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 154.88 L 515 165.88 L 526 168.88 L 515 171.88 L 512 182.88 L 509 171.88 L 498 168.88 L 509 165.88 Z" fill="#ffffff"/></g><g filter="url(#fa-icones-icone-roaming-glow)"><path d="M 512 786 L 512 914 L 495 844.88 Z" fill="url(#fa-icones-icone-roaming-cyanL)"/><path d="M 512 786 L 529 844.88 L 512 914 Z" fill="url(#fa-icones-icone-roaming-cyanR)"/><path d="M 512 798 L 514.2 844.88 L 512 902 L 509.8 844.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 830.88 L 515 841.88 L 526 844.88 L 515 847.88 L 512 858.88 L 509 847.88 L 498 844.88 L 509 841.88 Z" fill="#ffffff"/></g></g></svg>',
  dps: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-dps-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="0.55" stop-color="#e8b53a"/><stop offset="1" stop-color="#ffe9a8"/></linearGradient><linearGradient id="fa-icones-icone-dps-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-dps-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffeaa5"/><stop offset="1" stop-color="#ffc83a"/></linearGradient><linearGradient id="fa-icones-icone-dps-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0a81c"/><stop offset="1" stop-color="#b8780a"/></linearGradient><filter id="fa-icones-icone-dps-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-dps-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fa-icones-icone-dps-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-dps-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-dps-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-dps-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-dps-silver)" stroke-width="22"/><g transform="translate(512 512) scale(1.6260) translate(-181.62 -178.50)"><path d="M 221.2 260.2 L 220.8 260.8 L 219.5 267.0 L 235.2 295.8 L 233.8 290.5 L 230.8 284.0 L 224.8 267.5 L 222.0 261.0 Z M 139.5 260.0 L 138.8 261.0 L 127.0 294.0 L 128.8 291.8 L 141.5 267.8 L 141.8 266.8 L 140.5 261.5 Z M 162.0 132.5 L 161.5 133.2 L 161.5 147.0 L 162.0 155.0 L 162.2 215.5 L 163.0 229.2 L 163.0 286.5 L 170.0 306.2 L 180.0 331.2 L 181.0 332.2 L 186.5 319.0 L 198.5 286.8 L 198.8 234.8 L 199.8 185.0 L 199.8 158.2 L 200.2 156.8 L 200.2 133.2 L 199.0 133.0 L 188.0 145.0 L 187.8 168.5 L 187.0 176.0 L 186.8 202.5 L 186.0 219.5 L 186.0 248.8 L 185.0 251.2 L 182.0 270.2 L 182.0 273.8 L 181.5 275.5 L 180.8 276.2 L 179.8 274.2 L 179.5 269.2 L 177.5 255.8 L 175.5 248.8 L 174.2 145.2 L 163.2 133.0 Z M 85.0 89.2 L 119.2 132.0 L 119.0 133.5 L 113.8 141.0 L 109.8 148.5 L 108.5 149.0 L 83.8 140.0 L 66.2 133.0 L 60.8 131.5 L 80.0 142.0 L 93.0 149.8 L 105.0 156.0 L 106.5 157.2 L 104.0 166.8 L 103.2 174.2 L 102.0 175.2 L 97.2 176.0 L 44.2 181.0 L 43.0 181.5 L 46.5 182.2 L 55.8 182.8 L 89.2 186.5 L 102.2 187.5 L 103.5 188.5 L 104.2 194.5 L 107.2 206.2 L 81.0 221.5 L 64.0 230.2 L 63.0 231.2 L 68.2 229.8 L 87.2 222.0 L 109.8 213.8 L 110.5 213.8 L 111.2 214.5 L 115.0 221.5 L 120.0 228.2 L 120.0 229.5 L 112.2 238.8 L 97.5 257.8 L 85.2 272.2 L 85.5 272.8 L 127.0 236.8 L 128.0 236.8 L 131.0 239.2 L 140.5 245.5 L 146.2 248.2 L 147.0 248.0 L 147.2 237.2 L 146.2 235.8 L 140.0 232.0 L 135.2 228.2 L 125.8 217.2 L 121.0 209.5 L 119.0 205.2 L 115.8 196.0 L 114.0 187.0 L 114.0 170.5 L 114.8 165.5 L 116.8 158.2 L 118.8 152.8 L 124.2 142.8 L 129.0 136.8 L 136.8 129.2 L 136.8 128.0 L 134.5 121.2 L 134.5 119.8 L 134.0 119.2 L 133.0 119.5 L 127.2 124.0 L 126.2 124.0 L 86.8 90.2 Z M 279.8 87.0 L 278.0 88.0 L 235.5 124.0 L 234.8 124.2 L 228.8 119.8 L 227.2 119.8 L 224.8 129.0 L 235.2 139.8 L 239.5 146.2 L 243.8 154.5 L 248.0 168.8 L 248.8 174.5 L 248.8 183.8 L 247.8 190.2 L 245.8 198.2 L 242.0 207.5 L 239.0 213.0 L 234.2 219.8 L 229.8 225.0 L 221.8 232.0 L 218.2 234.5 L 214.2 236.5 L 213.8 237.2 L 213.8 247.8 L 214.2 248.5 L 223.0 244.5 L 232.8 237.2 L 234.2 237.2 L 259.2 258.8 L 277.0 273.2 L 241.2 230.0 L 241.2 228.8 L 245.8 223.0 L 251.0 214.0 L 252.2 214.0 L 298.0 231.5 L 299.8 231.5 L 276.0 219.0 L 255.2 207.2 L 254.2 206.2 L 257.5 193.5 L 258.0 188.5 L 259.0 187.5 L 270.8 186.8 L 320.2 181.5 L 317.0 180.8 L 303.8 180.0 L 299.8 179.2 L 259.8 175.5 L 258.5 174.2 L 257.5 166.5 L 255.2 157.0 L 270.5 148.0 L 301.2 131.2 L 297.8 132.0 L 278.5 140.0 L 253.2 148.8 L 251.8 148.2 L 249.2 143.0 L 242.5 132.8 L 246.8 126.5 L 257.5 113.2 Z M 144.0 109.5 L 145.0 117.8 L 146.8 122.2 L 148.0 122.5 L 153.0 120.8 L 159.8 121.0 L 164.2 122.2 L 180.5 140.5 L 182.0 140.0 L 195.2 124.5 L 198.5 121.8 L 201.5 120.8 L 208.8 120.8 L 213.8 122.8 L 215.2 122.5 L 217.0 117.5 L 218.0 111.0 L 217.8 108.2 L 215.5 106.0 L 214.2 105.5 L 209.8 107.0 L 197.8 107.2 L 195.8 107.0 L 192.2 105.2 L 190.0 103.2 L 188.8 101.2 L 188.8 92.8 L 174.0 85.2 L 173.0 85.5 L 173.0 100.8 L 170.5 104.8 L 169.0 105.8 L 163.0 107.2 L 154.2 107.2 L 149.5 105.8 L 147.8 105.8 L 145.8 106.8 Z M 173.2 65.0 L 172.8 66.0 L 173.0 77.2 L 178.0 80.5 L 188.5 85.5 L 188.8 73.0 Z M 125.0 63.8 L 133.8 85.0 L 138.0 96.5 L 139.0 97.0 L 140.8 95.8 L 142.5 95.2 L 142.5 94.0 L 126.8 65.5 L 125.5 63.8 Z M 236.5 63.2 L 234.2 66.0 L 229.8 75.0 L 218.2 94.0 L 218.5 95.2 L 222.0 97.0 L 222.8 96.5 Z M 173.2 51.0 L 173.2 58.2 L 178.2 61.5 L 188.5 66.5 L 188.5 51.0 Z M 172.2 29.2 L 170.0 33.5 L 169.0 37.2 L 169.2 40.0 L 172.0 44.8 L 190.8 44.8 L 192.8 41.0 L 192.8 36.0 L 189.8 29.5 L 187.5 27.0 L 183.8 25.0 L 179.8 24.8 L 175.8 26.2 Z" fill="url(#fa-icones-icone-dps-silver)" fill-rule="evenodd"/></g><g filter="url(#fa-icones-icone-dps-glow)"><path d="M 512 110 L 512 238 L 495 168.88 Z" fill="url(#fa-icones-icone-dps-cyanL)"/><path d="M 512 110 L 529 168.88 L 512 238 Z" fill="url(#fa-icones-icone-dps-cyanR)"/><path d="M 512 122 L 514.2 168.88 L 512 226 L 509.8 168.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 154.88 L 515 165.88 L 526 168.88 L 515 171.88 L 512 182.88 L 509 171.88 L 498 168.88 L 509 165.88 Z" fill="#ffffff"/></g><g filter="url(#fa-icones-icone-dps-glow)"><path d="M 512 786 L 512 914 L 495 844.88 Z" fill="url(#fa-icones-icone-dps-cyanL)"/><path d="M 512 786 L 529 844.88 L 512 914 Z" fill="url(#fa-icones-icone-dps-cyanR)"/><path d="M 512 798 L 514.2 844.88 L 512 902 L 509.8 844.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 830.88 L 515 841.88 L 526 844.88 L 515 847.88 L 512 858.88 L 509 847.88 L 498 844.88 L 509 841.88 Z" fill="#ffffff"/></g></g></svg>',
  pvp: '<svg aria-hidden="true" focusable="false" viewBox="0 0 1024 1024"><defs><linearGradient id="fa-icones-icone-pvp-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc4c4"/><stop offset="0.55" stop-color="#e43030"/><stop offset="1" stop-color="#ff9a9a"/></linearGradient><linearGradient id="fa-icones-icone-pvp-silverText" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#d4d9df"/><stop offset="1" stop-color="#f2f4f6"/></linearGradient><linearGradient id="fa-icones-icone-pvp-cyanL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa3a3"/><stop offset="1" stop-color="#ff3b3b"/></linearGradient><linearGradient id="fa-icones-icone-pvp-cyanR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e02020"/><stop offset="1" stop-color="#a00d0d"/></linearGradient><filter id="fa-icones-icone-pvp-glow" x="-150%" y="-30%" width="400%" height="160%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="fa-icones-icone-pvp-glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="fa-icones-icone-pvp-plateFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#131923"/><stop offset="1" stop-color="#080b11"/></linearGradient><linearGradient id="fa-icones-icone-pvp-fadeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.12" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="0.88" stop-color="#e8ebef" stop-opacity="0.85"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><linearGradient id="fa-icones-icone-pvp-fadeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ebef" stop-opacity="0"/><stop offset="0.25" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="0.75" stop-color="#e8ebef" stop-opacity="0.7"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></linearGradient><filter id="fa-icones-icone-pvp-glowStar" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g shape-rendering="geometricPrecision"><circle cx="512" cy="512" r="436" fill="none" stroke="url(#fa-icones-icone-pvp-silver)" stroke-width="22"/><g transform="translate(512 512) scale(1.6155) translate(-181.00 -179.25)"><path d="M 108.2 278.0 L 108.2 278.8 L 112.8 282.2 L 129.2 291.8 L 141.8 296.8 L 148.5 298.8 L 153.5 299.5 L 153.5 295.2 L 152.8 294.8 L 140.0 291.0 L 129.2 286.2 L 121.2 282.0 L 112.2 275.8 L 110.8 276.0 Z M 252.8 278.0 L 250.2 275.8 L 249.0 275.5 L 241.5 281.0 L 230.0 287.2 L 219.0 291.8 L 208.5 294.5 L 207.5 295.2 L 207.5 299.2 L 208.8 299.5 L 216.5 297.5 L 233.0 291.0 L 246.0 283.5 L 251.8 279.5 Z M 125.8 263.2 L 125.8 263.8 L 129.2 266.0 L 133.5 268.0 L 133.8 264.8 L 132.8 263.5 L 129.0 261.2 L 128.0 261.2 Z M 235.2 262.5 L 233.2 261.0 L 232.0 261.5 L 229.5 263.8 L 229.5 266.5 L 231.0 266.5 L 234.5 264.5 L 235.5 263.5 Z M 214.2 217.8 L 214.5 218.8 L 219.8 225.2 L 234.2 245.5 L 243.0 256.5 L 248.0 261.0 L 255.5 266.5 L 277.5 284.8 L 285.8 291.0 L 285.5 290.0 L 254.8 251.2 L 252.5 246.8 L 247.2 243.2 L 238.0 235.0 L 219.2 221.5 L 215.5 218.2 Z M 147.0 217.5 L 146.0 217.8 L 138.5 223.8 L 129.8 229.8 L 121.0 236.5 L 113.0 244.0 L 110.8 245.0 L 109.0 246.5 L 106.8 250.8 L 104.8 252.8 L 102.0 256.8 L 95.2 264.0 L 92.8 268.2 L 78.2 286.8 L 75.8 290.8 L 85.0 283.8 L 102.2 269.0 L 112.8 261.8 L 118.8 256.0 L 121.2 252.0 L 125.8 247.5 L 135.5 234.2 L 141.0 226.0 L 146.8 218.8 Z M 272.2 199.8 L 271.5 200.8 L 271.0 204.5 L 265.0 222.0 L 257.5 235.0 L 257.5 236.0 L 260.0 238.8 L 261.5 238.2 L 263.5 235.0 L 271.8 218.2 L 274.8 209.2 L 276.5 201.5 L 276.5 200.2 Z M 85.2 200.0 L 84.5 200.5 L 85.5 206.2 L 91.0 222.5 L 96.8 233.5 L 99.8 238.2 L 100.8 238.5 L 103.8 235.8 L 103.8 235.2 L 98.8 227.5 L 94.8 219.2 L 91.0 208.8 L 89.2 200.0 L 88.5 199.5 Z M 298.8 195.5 L 294.8 195.5 L 294.0 196.5 L 292.0 209.8 L 290.0 217.2 L 287.8 223.2 L 281.0 238.2 L 274.8 248.8 L 271.2 253.5 L 271.2 254.2 L 273.8 257.0 L 275.0 256.2 L 282.8 244.8 L 290.8 229.2 L 296.5 211.0 L 298.5 201.0 Z M 63.2 195.0 L 62.2 196.0 L 63.0 203.0 L 66.0 215.8 L 70.0 227.2 L 77.2 242.5 L 83.0 251.8 L 86.2 256.0 L 87.5 256.8 L 90.0 253.8 L 84.5 245.5 L 79.0 235.8 L 74.8 226.2 L 71.8 218.5 L 68.0 203.8 L 67.0 195.5 L 66.2 195.0 Z M 327.5 182.0 L 326.2 181.2 L 311.5 178.2 L 307.5 178.0 L 304.2 177.0 L 295.5 176.2 L 286.0 178.0 L 274.8 179.0 L 270.8 180.0 L 256.2 181.8 L 255.2 182.5 L 294.8 187.8 L 299.8 187.8 L 314.5 185.5 L 319.8 184.0 L 327.0 182.8 Z M 34.5 181.8 L 34.8 182.5 L 54.8 186.8 L 62.8 187.8 L 66.5 187.8 L 71.2 186.8 L 84.8 185.5 L 100.5 183.0 L 105.8 182.8 L 106.5 182.2 L 103.5 181.2 L 66.0 176.2 L 51.0 178.0 L 36.0 181.0 Z M 262.0 131.5 L 259.0 134.5 L 259.0 135.5 L 261.0 138.2 L 266.0 147.8 L 269.0 155.5 L 271.5 165.5 L 272.0 166.0 L 275.8 165.8 L 276.2 164.2 L 273.5 153.5 L 270.5 145.8 L 263.2 132.2 Z M 98.8 131.2 L 97.5 131.8 L 95.0 135.8 L 89.0 148.2 L 84.5 163.5 L 84.5 165.0 L 85.0 165.5 L 89.0 165.8 L 89.5 165.0 L 91.0 157.8 L 94.8 147.5 L 98.2 140.2 L 101.5 135.0 L 101.5 133.8 Z M 276.2 113.8 L 274.0 116.5 L 273.8 117.8 L 281.8 130.5 L 287.0 141.8 L 291.8 156.2 L 294.2 168.8 L 298.2 168.8 L 298.8 167.8 L 297.8 160.5 L 294.5 148.5 L 290.8 138.0 L 284.5 125.2 L 277.5 114.5 Z M 84.5 113.5 L 83.2 114.2 L 77.0 124.0 L 70.2 138.2 L 66.2 149.2 L 64.2 157.2 L 62.5 167.0 L 62.5 168.5 L 63.0 169.0 L 66.5 169.0 L 67.0 168.5 L 68.8 158.5 L 72.8 144.8 L 77.0 134.5 L 82.2 125.0 L 87.2 117.2 L 87.0 116.0 Z M 153.5 90.2 L 152.2 90.0 L 146.2 92.0 L 137.2 95.8 L 129.0 100.2 L 123.8 103.8 L 123.2 105.0 L 126.0 108.0 L 126.8 108.0 L 131.2 104.8 L 137.8 101.0 L 153.0 95.0 L 153.8 94.0 Z M 207.2 90.2 L 207.2 94.2 L 209.0 95.8 L 220.2 99.8 L 228.8 104.2 L 234.5 108.0 L 235.8 108.0 L 238.2 105.5 L 238.2 104.8 L 234.8 102.0 L 222.0 95.0 L 208.2 89.8 Z M 288.5 80.2 L 286.5 81.2 L 265.0 98.2 L 262.2 99.5 L 259.0 102.5 L 247.0 111.2 L 238.0 121.8 L 228.2 134.2 L 214.5 153.5 L 216.0 153.0 L 235.0 139.0 L 242.8 132.8 L 248.2 127.5 L 251.2 125.8 L 255.8 120.5 L 263.8 112.5 L 264.8 109.2 L 287.5 82.5 Z M 73.8 80.2 L 74.0 81.5 L 88.2 98.0 L 93.0 104.5 L 97.2 109.0 L 98.0 110.2 L 98.2 112.5 L 103.8 118.2 L 110.0 125.8 L 113.2 127.0 L 120.2 133.8 L 143.8 151.8 L 146.2 153.5 L 147.0 153.5 L 146.8 152.5 L 126.8 125.5 L 120.8 119.2 L 115.8 112.0 L 113.8 110.2 L 108.2 107.0 L 104.0 103.0 L 96.0 97.8 L 75.5 81.0 Z M 207.2 68.2 L 207.5 72.2 L 208.2 73.0 L 219.8 76.2 L 228.2 79.8 L 238.5 85.0 L 251.2 94.0 L 252.5 94.0 L 255.0 91.5 L 254.5 90.2 L 246.5 84.2 L 239.8 80.0 L 232.0 76.0 L 217.0 70.0 L 208.8 67.8 Z M 154.0 68.5 L 153.5 67.8 L 146.8 69.2 L 138.5 72.0 L 129.0 76.0 L 114.8 84.0 L 106.2 90.0 L 106.0 91.2 L 108.8 93.8 L 109.8 94.0 L 121.5 85.8 L 134.5 79.0 L 142.5 75.8 L 153.2 72.8 L 153.8 72.2 Z M 181.2 24.5 L 180.0 25.5 L 177.0 33.5 L 174.2 42.2 L 173.2 47.8 L 173.5 66.0 L 173.0 79.2 L 173.0 107.5 L 172.0 131.0 L 171.2 185.0 L 170.2 200.0 L 170.0 225.2 L 169.2 232.2 L 168.8 265.0 L 167.0 266.0 L 158.5 266.0 L 152.0 265.0 L 148.2 264.0 L 144.2 261.2 L 139.8 259.2 L 138.2 259.8 L 137.8 262.8 L 138.2 267.2 L 139.0 268.8 L 142.8 271.8 L 152.2 274.0 L 169.0 275.0 L 172.5 276.0 L 174.8 278.0 L 175.2 280.2 L 175.2 285.2 L 176.2 286.8 L 180.8 290.5 L 180.8 291.2 L 179.8 291.5 L 176.8 289.5 L 175.8 289.2 L 175.0 289.8 L 175.2 304.5 L 176.2 304.8 L 177.8 303.8 L 179.2 303.5 L 180.0 304.0 L 180.0 304.8 L 178.5 306.2 L 175.5 308.0 L 175.2 317.5 L 174.8 319.0 L 172.5 322.0 L 173.2 328.0 L 175.0 331.0 L 178.2 334.0 L 182.8 334.0 L 184.0 333.5 L 186.5 331.0 L 188.8 326.0 L 188.8 321.5 L 186.0 318.2 L 186.0 308.8 L 181.8 305.2 L 182.2 304.0 L 184.8 305.2 L 186.0 305.0 L 186.0 294.5 L 185.2 293.8 L 183.5 293.2 L 182.8 292.5 L 182.8 291.8 L 183.8 291.0 L 185.0 291.2 L 186.0 290.5 L 186.0 279.8 L 187.0 277.5 L 190.2 275.2 L 207.8 274.0 L 219.8 271.5 L 221.2 270.8 L 222.2 269.5 L 223.8 266.0 L 223.8 260.2 L 222.5 259.2 L 218.0 261.2 L 213.2 264.2 L 204.2 266.2 L 195.8 266.0 L 192.8 264.5 L 189.0 131.0 L 188.2 85.0 L 188.2 46.8 L 186.8 40.0 Z M 180.8 145.2 L 181.2 145.8 L 181.8 152.8 L 182.2 197.8 L 182.8 199.5 L 183.5 251.2 L 184.0 258.0 L 183.2 258.2 L 181.5 257.2 L 180.0 257.2 L 177.5 258.8 L 177.0 258.0 L 177.5 253.5 L 177.8 228.8 L 179.5 183.8 L 180.0 151.0 Z" fill="url(#fa-icones-icone-pvp-silver)" fill-rule="evenodd"/></g><g filter="url(#fa-icones-icone-pvp-glow)"><path d="M 512 110 L 512 238 L 495 168.88 Z" fill="url(#fa-icones-icone-pvp-cyanL)"/><path d="M 512 110 L 529 168.88 L 512 238 Z" fill="url(#fa-icones-icone-pvp-cyanR)"/><path d="M 512 122 L 514.2 168.88 L 512 226 L 509.8 168.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 154.88 L 515 165.88 L 526 168.88 L 515 171.88 L 512 182.88 L 509 171.88 L 498 168.88 L 509 165.88 Z" fill="#ffffff"/></g><g filter="url(#fa-icones-icone-pvp-glow)"><path d="M 512 786 L 512 914 L 495 844.88 Z" fill="url(#fa-icones-icone-pvp-cyanL)"/><path d="M 512 786 L 529 844.88 L 512 914 Z" fill="url(#fa-icones-icone-pvp-cyanR)"/><path d="M 512 798 L 514.2 844.88 L 512 902 L 509.8 844.88 Z" fill="#e8fdff" opacity="0.9"/><path d="M 512 830.88 L 515 841.88 L 526 844.88 L 515 847.88 L 512 858.88 L 509 847.88 L 498 844.88 L 509 841.88 Z" fill="#ffffff"/></g></g></svg>'
};

// src/lib/loadouts/iconesExport.ts
var ORIGINE_ICONES = "https://www.bungie.net/";
var echapper = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function htmlIconeClasse(classe, taille = 20) {
  const t = Math.round(taille * 0.68);
  return `<span class="ic-classe" role="img" aria-label="${LIBELLES[classe]}" style="width:${taille}px;height:${taille}px;background:${COULEURS[classe]}"><svg width="${t}" height="${t}" viewBox="0 0 32 32" fill="#ffffff" aria-hidden="true"><path d="${CHEMINS_SVG[classe]}"/></svg></span>`;
}
function htmlIconeElement(element, urlOfficielle, taille = 20) {
  if (urlOfficielle && urlOfficielle.startsWith(ORIGINE_ICONES)) return `<img class="ic-element" src="${echapper(urlOfficielle)}" alt="${echapper(element)}" width="${taille}" height="${taille}">`;
  if (element === "prismatique") {
    return `<svg class="ic-element" width="${taille}" height="${taille}" viewBox="${PRISMATIQUE_VIEWBOX}" role="img" aria-label="prismatique"><g transform="${PRISMATIQUE_TRANSFORM}">${PRISMATIQUE_TRACES.map((t) => `<path fill="${t.fill}" d="${t.d}"/>`).join("")}</g></svg>`;
  }
  const couleur = COULEURS2[element], trait = element === "stase" || element === "filobscur";
  return `<svg class="ic-element" width="${taille}" height="${taille}" viewBox="0 0 16 16" role="img" aria-label="${echapper(element)}"><path d="${FORMES[element]}" fill="${trait ? "none" : couleur}" stroke="${trait ? couleur : "none"}" stroke-width="${trait ? 1.6 : 0}" stroke-linecap="round"/></svg>`;
}
function htmlLogoSection(cle) {
  const svg = LOGOS_EXPORT[cle];
  return svg ? `<span class="logo-section">${svg}</span>` : "";
}
function htmlLogoContexte(contexte) {
  const svg = LOGOS_EXPORT[contexte];
  return svg ? `<span class="logo-contexte">${svg}</span>` : "";
}

// src/data/teinteIconesDoctrine.ts
init_define_import_meta_env();
var FILTRE_STASE_VERS_FILOBSCUR = "hue-rotate(-70deg)";

// src/lib/loadouts/exportFiche.ts
var LARGEUR_EXPORT = 900;
var ORIGINE_ICONES2 = "https://www.bungie.net/";
function echapper2(texte) {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function icone(src, taille, classe = "icone", filtre) {
  const image = src && src.startsWith(ORIGINE_ICONES2) ? `<img src="${echapper2(src)}" alt=""${filtre ? ` style="filter:${filtre}"` : ""}>` : "";
  return `<span class="${classe}" style="width:${taille}px;height:${taille}px">${image}</span>`;
}
function iconeChampion(type) {
  const { viewBox, d } = CHEMINS_ICONES_CHAMPION[type];
  return `<span class="champion" title="Anti-${echapper2(LIBELLES_CHAMPION[type])}"><svg viewBox="${viewBox}" width="16" height="16" fill="#c9ccd3"><path d="${d}"/></svg></span>`;
}
function iconeTypeArme(piece) {
  const forme = trouverFormeTypeArme(piece.typeArme, piece.slot, piece.munition, piece.categories, piece.typeSecours);
  const contenu = forme ? (() => {
    const { largeur, hauteur } = calculerTailleRendu(forme.viewBox, 26);
    return `<svg viewBox="${echapper2(forme.viewBox)}" width="${largeur}" height="${hauteur}" fill="#c9ccd3"><path d="${echapper2(forme.d)}"/></svg>`;
  })() : "";
  return `<span class="type-arme"${piece.typeArme ? ` title="${echapper2(piece.typeArme)}"` : ""}>${contenu}</span>`;
}
function iconeElement(piece) {
  if (piece.elementIcone && piece.elementIcone.startsWith(ORIGINE_ICONES2)) {
    return `<span class="element"><img src="${echapper2(piece.elementIcone)}" alt="" data-repli="${echapper2(piece.element ?? "")}"></span>`;
  }
  return piece.element ? `<span class="element-texte">${echapper2(piece.element)}</span>` : "";
}
function iconeMunition(piece) {
  if (!piece.munition) return "";
  const { cle, couleur } = MUNITIONS[piece.munition];
  const { viewBox, d, libelle } = ICONES[cle];
  return `<span class="munition" title="${echapper2(libelle)}"><svg viewBox="${echapper2(viewBox)}" width="16" height="16" fill="${couleur}"><path d="${echapper2(d)}"/></svg></span>`;
}
function liste(elements, colonnes) {
  if (elements.length === 0) return `<div class="aucun">\u2014</div>`;
  const lignes = Math.ceil(elements.length / colonnes);
  return `<div class="liste" style="grid-template-columns:repeat(${colonnes},minmax(0,1fr));grid-template-rows:repeat(${lignes},auto)">${elements.map((e2) => `<div class="liste-element">${icone(e2.icone, 18)}<span>${echapper2(e2.nom)}</span></div>`).join("")}</div>`;
}
function blocEntete(f) {
  const segments = [
    f.classe ? `${f.classeCle ? htmlIconeClasse(f.classeCle) : ""}${echapper2(f.classe)}` : void 0,
    f.element ? `${f.elementCle ? htmlIconeElement(f.elementCle, f.elementIcone) : ""}${echapper2(f.element)}` : void 0,
    `${htmlLogoContexte(f.contexteCle)}${echapper2(f.contexte)}`
  ].filter((x) => Boolean(x));
  if (f.auteur) segments.push(`<span class="auteur">par ${echapper2(f.auteur)}</span>`);
  const sousTitre = segments.join(`<span class="sep">\xB7</span>`);
  return `
<header class="carte entete">
  <div>
    <h1>${echapper2(f.nom)}</h1>
    ${sousTitre ? `<div class="sous-titre">${sousTitre}</div>` : ""}
  </div>
  <div class="marque"><b>FICHE DE BUILD</b><span>FORGE ARMORY</span></div>
</header>`;
}
function titreSection(titre, droite = "", logo = "") {
  return `<div class="titre-section"><h2>${logo}${titre}</h2>${droite ? `<div class="droite">${droite}</div>` : ""}</div>`;
}
function blocDoctrine(f) {
  const lignes = f.doctrine.map(
    (d) => `
    <div class="doctrine-ligne">
      ${icone(d.valeur?.icone, 24, "icone", d.valeur?.teinteFilobscur ? FILTRE_STASE_VERS_FILOBSCUR : void 0)}
      <div><div class="etiquette">${echapper2(d.libelle)}</div><div class="valeur">${d.valeur ? echapper2(d.valeur.nom) : "\u2014"}</div></div>
    </div>`
  ).join("");
  return `
<section class="section">
  ${titreSection("DOCTRINE", "", htmlLogoSection("doctrine"))}
  <div class="carte doctrine">
    <div class="doctrine-grille">${lignes}</div>
    <div class="doctrine-listes">
      <div class="liste-bloc"><div class="etiquette">Aspects</div>${liste(f.aspects, 1)}</div>
      <div class="liste-bloc fragments"><div class="etiquette">Fragments</div>${liste(f.fragments, 2)}</div>
    </div>
  </div>
</section>`;
}
function fois(e2) {
  return (e2.nombre ?? 1) > 1 ? `<span class="fois"> \xD7${e2.nombre}</span>` : "";
}
function puce(e2) {
  return `<div class="puce">${icone(e2.icone, 20, "icone petite")}<span>${echapper2(e2.nom)}${fois(e2)}</span></div>`;
}
function carteArme(slot, piece) {
  const etiquette = echapper2(LIBELLES_SLOT[slot]);
  if (!piece) {
    return `
  <div class="carte arme">
    <div class="arme-info">${icone(void 0, 40)}<div><div class="etiquette">${etiquette}</div><div class="arme-nom vide">Aucune arme</div></div></div>
    <div></div>
  </div>`;
  }
  const perks = piece.perks;
  const lignesSous = [piece.armature, piece.origine].filter((e2) => Boolean(e2));
  return `
  <div class="carte arme">
    <div class="arme-info">
      ${icone(piece.icone, 40)}
      <div>
        <div class="etiquette">${etiquette}</div>
        <div class="arme-nom${piece.exotique ? " exotique" : ""}">${echapper2(piece.nom)}</div>
        <div class="arme-element">${iconeTypeArme(piece)}${iconeElement(piece)}${iconeMunition(piece)}${piece.antiChampion ? iconeChampion(piece.antiChampion) : ""}</div>
        ${lignesSous.map((e2) => `<div class="arme-ligne">${icone(e2.icone, 18, "icone petite")}<span>${echapper2(e2.nom)}</span></div>`).join("")}
      </div>
    </div>
    <div>
      <div class="etiquette">Perks actifs</div>
      ${perks.length > 0 ? `<div class="perks">${perks.map(puce).join("")}</div>` : `<div class="aucun">\u2014</div>`}
    </div>
  </div>`;
}
function blocArmes(f) {
  const slots = ORDRE_EMPLACEMENTS.filter((s) => s === "cinetique" || s === "energie" || s === "lourde");
  const cartes = slots.map((s) => carteArme(s, f.armes.find((p) => p.slot === s))).join("");
  const nombre = f.armes.length;
  return `
<section class="section">
  ${titreSection("ARMES", `${nombre} arme${nombre > 1 ? "s" : ""}`, htmlLogoSection("armes"))}
  <div class="armes">${cartes}</div>
</section>`;
}
function cartePieceArmure(slot, piece, tailleIcone) {
  const etiquette = echapper2(LIBELLES_SLOT[slot]);
  const listeMods = piece ? piece.perks : [];
  const mods = piece && listeMods.length > 0 ? listeMods.map((m) => `<span class="mod">${icone(m.icone, 13, "icone mini")}${echapper2(m.nom)}${fois(m)}</span>`).join(`<span class="point">\xB7</span>`) : "\u2014";
  return `
    <div class="carte piece">
      ${icone(piece?.icone, tailleIcone)}
      <div class="piece-texte">
        <div class="etiquette">${etiquette}</div>
        <div class="piece-nom${piece?.exotique ? " exotique" : ""}${piece ? "" : " vide"}">${piece ? echapper2(piece.nom) : "Aucune pi\xE8ce"}</div>
        ${piece ? `<div class="etiquette mods-titre">Mods</div><div class="mods">${mods}</div>` : ""}
      </div>
    </div>`;
}
function blocBonusSets(f) {
  const contenu = f.bonusSets.length === 0 ? `<div class="aucun">Aucun bonus de set actif</div>` : f.bonusSets.map(
    (s) => `
      <div class="set">
        <div class="set-nom">${echapper2(s.nomSet)}<span class="sep">\xB7</span>${s.nbPieces} pi\xE8ce${s.nbPieces > 1 ? "s" : ""}</div>
        ${s.paliers.map((p) => `<div class="palier"><span class="etiquette">${p.seuil} pi\xE8ces</span><span>${echapper2(p.nom)}</span></div>`).join("")}
      </div>`
  ).join("");
  return `<div class="carte bonus"><div class="etiquette bleue">Bonus de set actifs</div>${contenu}</div>`;
}
function blocArmure(f) {
  const piece = (s) => f.armure.find((p) => p.slot === s);
  const stats = f.stats.map((s) => `<span class="stat">${echapper2(s.libelle)} <b>${s.valeur}</b></span>`).join(`<span class="sep">\xB7</span>`);
  return `
<section class="section">
  ${titreSection("ARMURE", `<span class="stats">${stats}</span>`, htmlLogoSection("armure"))}
  <div class="armure-grille">
    ${cartePieceArmure("casque", piece("casque"), 30)}
    ${cartePieceArmure("gants", piece("gants"), 30)}
    ${cartePieceArmure("torse", piece("torse"), 30)}
    ${cartePieceArmure("jambes", piece("jambes"), 30)}
  </div>
  <div class="armure-bas">
    ${cartePieceArmure("marque", piece("marque"), 34)}
    ${blocBonusSets(f)}
  </div>
</section>`;
}
var LARGEUR_PERKS_ARTEFACT = 760;
function largeurEstimeePuceArtefact(e2) {
  return e2.nom.length * 6.1 + 22 + (e2.icone ? 15 : 0);
}
function repartirEnRangees(perks) {
  if (perks.length === 0) return [];
  for (let nbRangees = Math.ceil(perks.length / 4); nbRangees <= perks.length; nbRangees++) {
    const base = Math.floor(perks.length / nbRangees);
    const enPlus = perks.length % nbRangees;
    const rangees = [];
    let debut = 0;
    for (let r = 0; r < nbRangees; r++) {
      const taille = base + (r >= nbRangees - enPlus ? 1 : 0);
      rangees.push(perks.slice(debut, debut + taille));
      debut += taille;
    }
    const tient = rangees.every(
      (rg) => rg.reduce((somme, e2) => somme + largeurEstimeePuceArtefact(e2), 0) + 6 * (rg.length - 1) <= LARGEUR_PERKS_ARTEFACT
    );
    if (tient) return rangees;
  }
  return perks.map((p) => [p]);
}
function blocArtefact(f) {
  const a = f.artefact;
  const contenu = a ? `
    ${icone(a.icone, 40)}
    <div class="artefact-texte">
      <div class="artefact-nom">${echapper2(a.nom)}</div>
      <div class="etiquette">Perks s\xE9lectionn\xE9s</div>
      ${a.perks.length > 0 ? `<div class="perks-artefact">${repartirEnRangees(a.perks).map((rg) => `<div class="rangee-artefact">${rg.map((p) => `<span class="puce-artefact">${p.icone ? icone(p.icone, 12, "icone mini") : ""}${echapper2(p.nom)}</span>`).join("")}</div>`).join("")}</div>` : `<div class="aucun">\u2014</div>`}
    </div>` : `${icone(void 0, 40)}<div class="artefact-texte"><div class="artefact-nom vide">Aucun artefact s\xE9lectionn\xE9</div></div>`;
  return `
<section class="section">
  ${titreSection("ARTEFACT", "", htmlLogoSection("artefact"))}
  <div class="carte artefact">${contenu}</div>
</section>`;
}
var LARGEUR_FILIGRANE = 760;
var CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{background:#0b0e13}
/* FR : \u26A0\uFE0F AJOUT (01/10/2026, v0.3.0) - FILIGRANE (demande de l'utilisateur) : l'embl\xE8me
   vectoriel Forge Armory, centr\xE9 sur la page, pos\xE9 PAR-DESSUS le contenu \xE0 tr\xE8s faible
   opacit\xE9 (le texte reste net). Le cadre .filigrane est rogn\xE9 aux bords de la page
   (overflow hidden) : sur une fiche courte, l'embl\xE8me ne peut donc pas allonger la page
   ni fausser la mesure de hauteur de la capture. Vectoriel : net en JPEG/PNG (capture
   x2) et dans le PDF. Source : data/emblemeForgeArmory.ts.
   EN: WATERMARK: vector emblem centred over the content at very low opacity, clipped to
   the page so it can never lengthen a short sheet. */
.filigrane{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.filigrane svg{position:absolute;left:50%;top:50%;width:${LARGEUR_FILIGRANE}px;height:auto;transform:translate(-50%,-50%);opacity:${OPACITE_FILIGRANE}}
body{position:relative;width:${LARGEUR_EXPORT}px;padding:28px 28px 20px;background:linear-gradient(#0b0e13,#090c11);color:#e8e8e5;
  font-family:"Segoe UI","DejaVu Sans",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.carte{background:#171b23;border:1px solid #303746;border-radius:9px}
.etiquette{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#9298a5}
.etiquette.bleue{color:#78a9ff}
.sep{margin:0 7px;color:#6c7280}
.point{margin:0 5px;color:#6c7280}
.vide,.aucun{color:#6c7280}
.aucun{font-size:10.5px;margin-top:6px}
.exotique{color:#d8b23d}
.icone{display:block;flex-shrink:0;overflow:hidden;background:#090c11;border:1px solid #303746;border-radius:6px}
.icone img{display:block;width:100%;height:100%;object-fit:cover}
.icone.petite{border-radius:9px}
.icone.mini{display:inline-block;vertical-align:-2px;margin-right:3px;border-radius:3px}
.entete{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:19px 22px 18px}
.entete h1{font-size:30px;font-weight:700;line-height:1.15;letter-spacing:.2px}
.sous-titre{margin-top:8px;font-size:14.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#78a9ff}
.sous-titre .sep{color:#78a9ff;margin:0 9px}
.sous-titre .auteur{text-transform:none;letter-spacing:.2px;font-weight:600;overflow-wrap:anywhere}
.entete>div:first-child{min-width:0}
.marque{text-align:right;white-space:nowrap;flex:0 0 auto}
.marque b{display:block;font-size:12px;letter-spacing:.6px;color:#9298a5}
.marque span{display:block;margin-top:6px;font-size:9.5px;letter-spacing:.4px;color:#838995}
.section{margin-top:20px}
.titre-section{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding-bottom:8px;margin-bottom:10px;border-bottom:1px solid #303746}
.titre-section h2{font-size:19px;font-weight:700;letter-spacing:.4px}
/* FR : \u26A0\uFE0F AJOUT (12/10/2026, v0.4.0) - logos de section et ic\xF4nes du sous-titre (classe, \xE9l\xE9ment, contexte). EN: section logos and subtitle icons. */
/* FR : \u26A0\uFE0F CHANG\xC9 (12/10/2026, v0.4.1) - 34 px au lieu de 30 : la notice de l'archive v3 recommande au moins 32 px (\xE0 24 px les d\xE9tails fins se brouillent). EN: 34 px (the archive notice recommends at least 32 px). */
.logo-section{display:inline-flex;width:34px;height:34px;margin-right:10px;vertical-align:-10px}
.logo-section svg,.logo-contexte svg{width:100%;height:100%;display:block}
.logo-contexte{display:inline-flex;width:24px;height:24px;margin-right:7px;vertical-align:-6px}
.ic-classe{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;vertical-align:-5px;margin-right:7px;flex-shrink:0}
.ic-element{vertical-align:-5px;margin-right:7px;border-radius:3px}
.titre-section .droite{font-size:13px;color:#9298a5;text-align:right}
.stats{font-size:14px;color:#d3d6dc}
.stats b{color:#f4f4f2;font-weight:700}
.stats .sep{color:#7d8390}
.doctrine{padding:13px 16px 14px}
.doctrine-grille{display:grid;grid-template-columns:1fr 1fr;column-gap:24px;row-gap:7px}
.doctrine-ligne{display:flex;align-items:center;gap:8px}
.valeur{font-size:13px;margin-top:1px}
.doctrine-listes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:16px;margin-top:13px;padding-top:11px;border-top:1px solid #232834}
.liste{display:grid;grid-auto-flow:column;column-gap:16px;row-gap:5px;margin-top:6px}
.liste-bloc.fragments{grid-column:span 2}
.liste-element{display:flex;align-items:center;gap:8px;min-height:20px;min-width:0;font-size:12px}
.liste-element .icone{border-radius:4px}
.armes{display:flex;flex-direction:column;gap:10px}
.arme{display:grid;grid-template-columns:366px 1fr;gap:12px;min-height:143px;padding:12px 16px 12px 12px}
.arme-info{display:flex;align-items:flex-start;gap:12px}
.arme-nom{font-size:16.5px;font-weight:700;margin-top:4px}
.arme-ligne{display:flex;align-items:center;gap:8px;min-height:20px;margin-top:6px;font-size:12px;color:#d3d6dc}
.arme-element{display:flex;align-items:center;gap:8px;height:22px;margin-top:5px;font-size:11.5px;color:#9298a5}
.type-arme{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:30px;height:22px}
.type-arme svg{display:block;overflow:visible}
.element{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.element img{display:block;width:18px;height:18px}
.munition{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.munition svg{display:block}
.element-texte{line-height:22px}
.champion{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:18px;height:22px}
.champion svg{display:block}
.perks{display:grid;grid-template-columns:1fr 1fr;column-gap:20px;row-gap:7px;margin-top:9px}
.puce{display:flex;align-items:center;gap:7px;min-height:31px;padding:4px 8px;background:#12161d;border:1px solid #303746;border-radius:6px;font-size:12px}
.armure-grille{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.armure-bas{display:grid;grid-template-columns:325px 1fr;gap:10px;margin-top:10px}
.piece{display:flex;align-items:flex-start;gap:9px;min-height:73px;padding:10px 12px 10px 10px}
.armure-bas .piece{min-height:102px}
.piece-nom{font-size:13.5px;font-weight:700;margin-top:4px}
.mods-titre{margin-top:6px;font-size:8px}
.mods{margin-top:3px;font-size:10px;line-height:1.6}
.mod{white-space:nowrap}
.fois{font-weight:700;color:#f4f4f2}
.bonus{padding:11px 12px}
.set{margin-top:6px}
.set-nom{font-size:12.5px;font-weight:700}
.palier{display:grid;grid-template-columns:66px 1fr;align-items:baseline;margin-top:7px;font-size:10px}
.palier .etiquette{font-size:8.5px}
.artefact{display:flex;align-items:flex-start;gap:12px;padding:14px 16px 16px 12px;min-height:104px}
.artefact-texte{flex:1;min-width:0}
.artefact-nom{font-size:16px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;margin:3px 0 6px}
.perks-artefact{display:flex;flex-direction:column;gap:6px;margin-top:9px}
.rangee-artefact{display:flex;flex-wrap:wrap;gap:6px}
.rangee-artefact .puce-artefact{flex:1 1 auto;justify-content:center;white-space:nowrap}
.puce-artefact{display:inline-flex;align-items:center;padding:5px 9px;background:#12161d;border:1px solid #303746;border-radius:5px;font-size:10.5px}
footer{display:flex;justify-content:space-between;margin-top:34px;padding-top:9px;border-top:1px solid #1d222c;font-size:9px;letter-spacing:.4px;color:#838995}
`;
function ficheVersHtml(f, versionApp) {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${ORIGINE_ICONES2}; style-src 'unsafe-inline'">
<title>${echapper2(f.nom)}</title>
<style>${CSS}</style></head>
<body>
<div class="filigrane" aria-hidden="true">${emblemeSvg("fa-export")}</div>
${blocEntete(f)}
${blocDoctrine(f)}
${blocArmes(f)}
${blocArmure(f)}
${blocArtefact(f)}
<footer><span>FORGE ARMORY \xB7 DESTINY 2 BUILD ANALYZER \xB7 EXPORT INFOGRAPHIQUE</span><span>v${echapper2(versionApp)}</span></footer>
</body></html>`;
}

// scripts/generer-logos-export.mjs
init_define_import_meta_env();
import fs from "node:fs";
import path from "node:path";
var LOGOS = { doctrine: "icone-doctrine", artefact: "icone-artefact", armes: "icone-armes", armure: "icone-armures", neutre: "icone-neutre", roaming: "icone-roaming", dps: "icone-dps", pvp: "icone-pvp" };
var LOGOS_A_VENIR = {};
function alleger(svg) {
  return svg.replace(/<\?xml[^>]*\?>\s*/, "").replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/g, "").replace(/<desc\b[^>]*>[\s\S]*?<\/desc>\s*/g, "").replace(/\s+role="img"/, "").replace(/\s+aria-labelledby="[^"]*"/, "").replace(/\sxmlns="[^"]*"/, "").replace(/<svg\b/, '<svg aria-hidden="true" focusable="false"').replace(/>\s+</g, "><").trim();
}
function contenuModule(racine) {
  const dossier = path.join(racine, "public/assets/icones/");
  const entrees = [];
  for (const [cle, fichier] of [...Object.entries(LOGOS), ...Object.entries(LOGOS_A_VENIR)]) {
    const f = path.join(dossier, `${fichier}.svg`);
    if (!fs.existsSync(f)) {
      if (cle in LOGOS) throw new Error(`logo introuvable : ${f}`);
      continue;
    }
    entrees.push(`  ${cle}: ${JSON.stringify(alleger(fs.readFileSync(f, "utf-8")))},`);
  }
  return `// \u26A0\uFE0F FICHIER G\xC9N\xC9R\xC9 par \`scripts/generer-logos-export.mjs\` \xE0 partir de \`public/assets/icones/\` : NE PAS MODIFIER \xC0 LA MAIN (relancer le script). Voir son en-t\xEAte pour le pourquoi.
// \u26A0\uFE0F GENERATED FILE - do not edit by hand; rerun the script.

export type CleLogoExport = "doctrine" | "artefact" | "armes" | "armure" | "neutre" | "roaming" | "dps" | "pvp";

/** SVG en ligne (d\xE9j\xE0 all\xE9g\xE9s) des logos de l'export infographique : doctrine, artefact, armes, armure et les quatre contextes. */
export const LOGOS_EXPORT: Readonly<Partial<Record<CleLogoExport, string>>> = {
${entrees.join("\n")}
};
`;
}
if (path.basename(process.argv[1] ?? "") === "generer-logos-export.mjs") {
  const racine = process.cwd(), sortie = path.join(racine, "src/data/forge/logosExport.ts"), contenu = contenuModule(racine);
  if (process.argv.includes("--verifier")) {
    const a_jour = fs.existsSync(sortie) && fs.readFileSync(sortie, "utf-8") === contenu;
    console.log(a_jour ? "logosExport.ts est \xE0 jour." : "logosExport.ts N'EST PAS \xE0 jour : relancer `node scripts/generer-logos-export.mjs`.");
    process.exit(a_jour ? 0 : 1);
  }
  fs.writeFileSync(sortie, contenu);
  console.log(`\xE9crit : src/data/forge/logosExport.ts (${(contenu.length / 1024).toFixed(1)} Ko)`);
}

// tests/logique/export-fiche.test.ts
var res = [];
var ok = (nom, cond, detail) => {
  res.push(!!cond);
  console.log(cond ? "\u2705" : "\u274C", nom);
  if (!cond && detail !== void 0) console.log("   d\xE9tail :", String(typeof detail === "string" ? detail : JSON.stringify(detail)).slice(0, 400));
};
var fiche = (sur = {}) => ({
  nom: "Test de la Forge",
  classe: "Titan",
  element: "Solaire",
  classeCle: "titan",
  elementCle: "solaire",
  elementIcone: "https://www.bungie.net/common/destiny2_content/icons/test.png",
  contexte: "PvE DPS",
  contexteCle: "dps",
  enregistreLe: "12/10/2026",
  auteur: "Orynick#1234",
  manifestDisponible: true,
  doctrine: [{ libelle: "Super", valeur: { nom: "Marteau de Sol" } }],
  aspects: [],
  fragments: [],
  armes: [],
  armure: [],
  stats: [],
  bonusSets: [],
  artefact: { nom: "Artefact de test", perks: [] },
  ...sur
});
var html = (sur) => ficheVersHtml(fiche(sur), "0.4.0");
var entete = (h2) => /<header class="carte entete">[\s\S]*?<\/header>/.exec(h2)[0];
var h = html();
ok("DOCTRINE : le titre de la section porte le logo \xAB Doctrine \xE9l\xE9mentaire \xBB (l'ic\xF4ne du pilier 1 de la charte, int\xE9gr\xE9e en SVG)", /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>DOCTRINE<\/h2>/.test(h) && h.includes("fa-icones-icone-doctrine-"));
ok("ARTEFACT : le titre de la section porte le logo \xAB Artefact \xBB", /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>ARTEFACT<\/h2>/.test(h) && h.includes("fa-icones-icone-artefact-"));
ok("ARMES et ARMURE : chaque titre porte SON logo, arriv\xE9 avec l'archive de visuels v3 : l'\xE9p\xE9e seule pour ARMES, le bouclier seul pour ARMURE (et pas le logo combin\xE9 \xAB Armes et Armures \xBB)", /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>ARMES<\/h2>/.test(h) && /<h2><span class="logo-section"><svg[^>]*>[\s\S]*?<\/svg><\/span>ARMURE<\/h2>/.test(h) && /fa-icones-icone-armes-(?!armures)/.test(h) && h.includes("fa-icones-icone-armures-") && !h.includes("fa-icones-icone-armes-armures-"), (h.match(/<h2>[\s\S]{0,60}(ARMES|ARMURE)<\/h2>/g) ?? []).join(" | "));
ok("les huit logos int\xE9gr\xE9s existent (doctrine, artefact, armes, armure et les quatre contextes) ; aucun n'est vide", ["doctrine", "artefact", "armes", "armure", "neutre", "roaming", "dps", "pvp"].every((k) => LOGOS_EXPORT[k]?.startsWith("<svg")), Object.keys(LOGOS_EXPORT));
var e = entete(h);
ok("en-t\xEAte : ic\xF4ne de CLASSE (disque de la couleur de la classe, symbole de l'appli) devant \xAB Titan \xBB", e.includes(`class="ic-classe"`) && e.includes(`background:${COULEURS.titan}`) && e.includes(CHEMINS_SVG.titan) && /<\/span>Titan/.test(e), e);
ok("en-t\xEAte : ic\xF4ne d'\xC9L\xC9MENT officielle de Bungie (adresse www.bungie.net) devant \xAB Solaire \xBB", /<img class="ic-element" src="https:\/\/www\.bungie\.net\/common\/destiny2_content\/icons\/test\.png"[^>]*>Solaire/.test(e), e);
ok("en-t\xEAte : une adresse d'ic\xF4ne qui n'est PAS sur www.bungie.net est refus\xE9e (la s\xE9curit\xE9 de la page ne l'autoriserait pas) : l'export retombe sur le dessin de l'appli", (() => {
  const x = entete(html({ elementIcone: "https://exemple.invalide/icone.png" }));
  return !x.includes("exemple.invalide") && x.includes(FORMES.solaire);
})());
ok("en-t\xEAte : sans ic\xF4ne officielle (Manifest absent), le dessin de l'appli est utilis\xE9 (forme et couleur de l'\xE9l\xE9ment)", entete(html({ elementIcone: void 0 })).includes(FORMES.solaire));
ok("en-t\xEAte : PRISMATIQUE sans ic\xF4ne officielle : le symbole \xE0 deux tons de l'appli, ses 6 trac\xE9s", (() => {
  const x = entete(html({ element: "Prismatique", elementCle: "prismatique", elementIcone: void 0 }));
  return PRISMATIQUE_TRACES.every((t) => x.includes(t.d));
})());
var contextes = ["neutre", "roaming", "dps", "pvp"];
var libelles = { neutre: "Neutre", roaming: "PvE Roaming", dps: "PvE DPS", pvp: "PvP" };
ok("en-t\xEAte : chacun des 4 contextes affiche SA propre ic\xF4ne (et pas celle d'un autre) avec son libell\xE9, Neutre compris", contextes.every((c) => {
  const x = entete(html({ contexteCle: c, contexte: libelles[c] }));
  return x.includes(`fa-icones-icone-${c}-`) && contextes.filter((d) => d !== c).every((d) => !x.includes(`fa-icones-icone-${d}-`)) && x.includes(libelles[c]);
}));
ok("FICHE ANCIENNE (sans cl\xE9 de classe ni d'\xE9l\xE9ment) : le texte reste, sans ic\xF4ne de classe ni d'\xE9l\xE9ment, et la page se g\xE9n\xE8re sans erreur", (() => {
  const x = entete(html({ classeCle: void 0, elementCle: void 0, elementIcone: void 0 }));
  return x.includes("Titan") && x.includes("Solaire") && !x.includes("ic-classe") && !x.includes("ic-element");
})());
ok("une fiche sans classe ni \xE9l\xE9ment choisis : seul le contexte figure dans le sous-titre", (() => {
  const x = entete(html({ classe: void 0, element: void 0, classeCle: void 0, elementCle: void 0, elementIcone: void 0 }));
  return !x.includes("ic-classe") && !x.includes("ic-element") && x.includes("PvE DPS");
})());
ok("S\xC9CURIT\xC9 : la politique de s\xE9curit\xE9 n'a pas chang\xE9 (aucune ressource par d\xE9faut ; images : uniquement www.bungie.net) et aucun script", h.includes(`content="default-src 'none'; img-src https://www.bungie.net/; style-src 'unsafe-inline'"`) && !/<script/i.test(h));
ok("S\xC9CURIT\xC9 : toutes les adresses d'image de la page sont sur www.bungie.net (aucun fichier local, aucune adresse \xAB data: \xBB)", [...h.matchAll(/\ssrc="([^"]*)"/g)].every((m) => m[1].startsWith("https://www.bungie.net/")) && !/url\(\s*['"]?data:|href="http/i.test(h));
var ids = [...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
ok(`les identifiants internes de la page sont uniques (${ids.length}) : aucun logo ne perturbe l'embl\xE8me ni un autre logo`, new Set(ids).size === ids.length, ids.filter((x, i) => ids.indexOf(x) !== i));
ok("la page est d\xE9terministe : m\xEAmes donn\xE9es, m\xEAme page", html() === html());
ok("le module des logos int\xE9gr\xE9s est \xC0 JOUR par rapport aux fichiers de public/assets/icones (relancer `node scripts/generer-logos-export.mjs` sinon)", fs2.readFileSync("src/data/forge/logosExport.ts", "utf-8") === contenuModule(process.cwd()));
ok("les logos int\xE9gr\xE9s ne contiennent ni script ni image externe, et sont all\xE9g\xE9s (pas de prologue XML ni de titre)", Object.values(LOGOS_EXPORT).every((s) => !/<script|<image|href=|<\?xml|<title/.test(s)));
console.log(`
${res.filter(Boolean).length}/${res.length} contr\xF4les r\xE9ussis`);
if (process.argv.includes("--page")) fs2.writeFileSync("tests/logique/_sortie/export-apercu.html", html());
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
