/*type int = number;*/ /*type bool = boolean;*/ "use strict";
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return(g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g);
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var cb = function(_path, _data) {};
var snapshot_subscriptions = [];
function Hook_Update_Event(callback) {
    cb = callback;
}
function Listen_To(db, path) {
    return new Promise(function(res, _rej) {
        var is_existing_snapshot_subscription = snapshot_subscriptions.find(function(s) {
            return s.path === path;
        });
        if (is_existing_snapshot_subscription) {
            res(1);
            return;
        }
        var obj = create_get_obj(db, path);
        var has_initiated = false;
        var unscubscribe = obj.onSnapshot(function(snapshot) {
            if (!has_initiated) {
                has_initiated = true;
                return;
            }
            var docs = [];
            snapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
                    docs.push({
                        change_type: "added",
                        id: change.doc.id,
                        data: change.doc.data()
                    });
                }
                if (change.type === "modified") {
                    docs.push({
                        change_type: "modified",
                        id: change.doc.id,
                        data: change.doc.data()
                    });
                }
                if (change.type === "removed") {
                    docs.push({
                        change_type: "removed",
                        id: change.doc.id,
                        data: change.doc.data()
                    });
                }
            });
            cb(path, docs);
        });
        snapshot_subscriptions.push({
            path: path,
            unsubscribe: unscubscribe
        });
        res(1);
    });
}
function Is_Authenticated(fetch, id_token) {
    return new Promise(function(res, rej) {
        var body = {
            idToken: id_token
        };
        fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(function() {
            var _ref = _async_to_generator(function(r) {
                var users;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            return [
                                4,
                                r.json()
                            ];
                        case 1:
                            users = _state.sent();
                            if (users.error) {
                                rej(users.errors[0].message);
                            } else {
                                res(users.users[0]);
                            }
                            return [
                                2
                            ];
                    }
                });
            });
            return function(r) {
                return _ref.apply(this, arguments);
            };
        }()).catch(function(err) {
            rej(err);
        });
    });
}
function Prune_Listeners_Not_In_Paths(paths) {
    var paths_to_remove = snapshot_subscriptions.filter(function(s) {
        return !paths.find(function(p) {
            return p === s.path;
        });
    });
    for(var i = 0; i < paths_to_remove.length; i++){
        paths_to_remove[i].unsubscribe();
        snapshot_subscriptions.splice(snapshot_subscriptions.indexOf(paths_to_remove[i]), 1);
    }
}
function create_get_obj(db, path) {
    var parts = path.split("/");
    var obj = db;
    for(var i = 0; i < parts.length; i++){
        if (i % 2 === 0) {
            obj = obj.collection(parts[i]);
        } else {
            obj = obj.doc(parts[i]);
        }
    }
    return obj;
}
var Firestore = {
    Listen_To: Listen_To,
    Hook_Update_Event: Hook_Update_Event,
    Is_Authenticated: Is_Authenticated,
    Prune_Listeners_Not_In_Paths: Prune_Listeners_Not_In_Paths
};
export { Firestore };
