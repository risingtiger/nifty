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
function _ts_values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
import fetch from "node-fetch";
import express from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bodyParser from "body-parser";
import cors from "cors";
import { Firestore } from "./firestore.js";
var firestore_listeners = [];
var is_dev_env = process.env.NODE_ENV === "dev" ? true : false;
var app = express();
var db;
app.use(cors({
    origin: "https://20230826t191055-dot-purewatertech.appspot.com",
    credentials: true
}));
app.use(bodyParser.json());
if (process.platform === "darwin") {
    var keyFilename = "/Users/dave/.ssh/purewatertech-ad1adb2947b8.json";
    initializeApp({
        credential: cert(keyFilename)
    });
} else {
    initializeApp();
}
db = getFirestore();
Firestore.Hook_Update_Event(function(path, docs) {
    var listeners = firestore_listeners.filter(function(l) {
        return l.listen_to.find(function(lt) {
            return lt.path === path;
        });
    });
    listeners.forEach(function(l) {
        return l.data_change_callback(path, docs);
    });
});
app.get("/firestore_listen_begin", function(req, res) {
    var id_token = req.query.id_token;
    Firestore.Is_Authenticated(fetch, id_token).then(function(user) {
        var firestore_listener = firestore_listeners.find(function(l) {
            return l.user_email === user.email;
        });
        if (firestore_listener) {
            res.status(400).send("user already has a listener");
            return;
        }
        firestore_listeners.push({
            user_email: user.email,
            listen_to: [],
            expires_at_timeout: setTimeout(function() {
            // nothing for now. may eventually remove listener but lets see how it goes
            }, 3600 * 1000),
            data_change_callback: function(path, docs) {
                var x = JSON.stringify({
                    path: path,
                    docs: docs
                });
                var y = "data:" + x;
                res.write("event:firestore\n");
                res.write(y);
                res.write("\n\n");
            }
        });
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache"
        });
        res.write("event: connected\n");
        res.write('data: { "message": "hey connected" }');
        res.write("\n\n");
        var count = 0;
        setInterval(function() {
            res.write("event: message\n");
            res.write('data: { "message": "hey message '.concat(count, '" }'));
            res.write("\n\n");
            count++;
        }, 15000);
        req.on("close", function() {
            firestore_listener_remove(user.email);
        });
    }).catch(function(err) {
        res.status(401).send("unable to authenticate user: " + err);
    });
});
app.post("/firestore_listen_to", function() {
    var _ref = _async_to_generator(function(req, res) {
        var _req_headers_authorization, _req_headers_authorization1, id_token, paths;
        return _ts_generator(this, function(_state) {
            id_token = (_req_headers_authorization = req.headers.authorization) === null || _req_headers_authorization === void 0 ? void 0 : _req_headers_authorization.substring(7, (_req_headers_authorization1 = req.headers.authorization) === null || _req_headers_authorization1 === void 0 ? void 0 : _req_headers_authorization1.length);
            paths = req.body.paths;
            Firestore.Is_Authenticated(fetch, id_token).then(function() {
                var _ref = _async_to_generator(function(user) {
                    var _loop, listener, i;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _loop = function(i) {
                                    return _ts_generator(this, function(_state) {
                                        switch(_state.label){
                                            case 0:
                                                if (!listener.listen_to.find(function(l) {
                                                    return l.path === paths[i];
                                                })) return [
                                                    3,
                                                    1
                                                ];
                                                return [
                                                    3,
                                                    3
                                                ];
                                            case 1:
                                                return [
                                                    4,
                                                    Firestore.Listen_To(db, paths[i])
                                                ];
                                            case 2:
                                                _state.sent();
                                                listener.listen_to.push({
                                                    path: paths[i]
                                                });
                                                _state.label = 3;
                                            case 3:
                                                return [
                                                    2
                                                ];
                                        }
                                    });
                                };
                                listener = firestore_listeners.find(function(l) {
                                    return l.user_email === user.email;
                                });
                                if (!listener) {
                                    res.status(400).send("no listener found");
                                    return [
                                        2
                                    ];
                                }
                                clearInterval(listener.expires_at_timeout);
                                listener.expires_at_timeout = setTimeout(function() {
                                // nothing for now. may eventually remove listener but lets see how it goes
                                }, 3600 * 1000);
                                i = 0;
                                _state.label = 1;
                            case 1:
                                if (!(i < paths.length)) return [
                                    3,
                                    4
                                ];
                                return [
                                    5,
                                    _ts_values(_loop(i))
                                ];
                            case 2:
                                _state.sent();
                                _state.label = 3;
                            case 3:
                                i++;
                                return [
                                    3,
                                    1
                                ];
                            case 4:
                                res.status(200).send(JSON.stringify({
                                    message: "chance it wasnt added. but it probably was. yeah. thats super great and specific"
                                }));
                                return [
                                    2
                                ];
                        }
                    });
                });
                return function(user) {
                    return _ref.apply(this, arguments);
                };
            }()).catch(function(err) {
                res.status(401).send("unable to authenticate user: " + err);
            });
            return [
                2
            ];
        });
    });
    return function(req, res) {
        return _ref.apply(this, arguments);
    };
}());
/*
app.post('/firestore_listen_refresh', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    Firestore.Is_Authenticated(fetch, id_token).then(async (user:any)=> {

        const listener = firestore_listeners.find(l=>l.user_email === user.email)

        if (!listener) {
            res.status(400).send("no listener found")
            return
        }

        clearInterval(listener.expires_at_timeout)
        listener.expires_at_timeout = setTimeout(()=> {
            // nothing for now. may eventually remove listener but lets see how it goes
        }, 3600*1000)

        res.status(200).send(JSON.stringify({message:"refreshed"}))

    }).catch((err:str)=> {
        res.status(401).send("unable to authenticate user: " + err)
    })
})
*/ app.post("/firestore_listen_to_remove", function() {
    var _ref = _async_to_generator(function(req, res) {
        var _req_headers_authorization, _req_headers_authorization1, id_token, paths;
        return _ts_generator(this, function(_state) {
            id_token = (_req_headers_authorization = req.headers.authorization) === null || _req_headers_authorization === void 0 ? void 0 : _req_headers_authorization.substring(7, (_req_headers_authorization1 = req.headers.authorization) === null || _req_headers_authorization1 === void 0 ? void 0 : _req_headers_authorization1.length);
            paths = req.body.paths;
            Firestore.Is_Authenticated(fetch, id_token).then(function() {
                var _ref = _async_to_generator(function(user) {
                    var i;
                    return _ts_generator(this, function(_state) {
                        for(i = 0; i < paths.length; i++){
                            firestore_listener_listen_to_remove(user.email, paths[i]);
                        }
                        res.status(200).send(JSON.stringify({
                            message: "success"
                        }));
                        return [
                            2
                        ];
                    });
                });
                return function(user) {
                    return _ref.apply(this, arguments);
                };
            }()).catch(function(err) {
                res.status(401).send("unable to authenticate user: " + err);
            });
            return [
                2
            ];
        });
    });
    return function(req, res) {
        return _ref.apply(this, arguments);
    };
}());
function firestore_listener_remove(user_email) {
    var firestore_listener = firestore_listeners.find(function(l) {
        return l.user_email === user_email;
    });
    if (!firestore_listener) {
        return;
    }
    firestore_listeners.splice(firestore_listeners.indexOf(firestore_listener), 1);
    var all_paths = firestore_listeners.map(function(l) {
        return l.listen_to.map(function(lt) {
            return lt.path;
        });
    }).flat();
    Firestore.Prune_Listeners_Not_In_Paths(all_paths);
}
function firestore_listener_listen_to_remove(user_email, path) {
    var listener = firestore_listeners.find(function(l) {
        return l.user_email === user_email;
    });
    if (!listener) {
        return;
    }
    var listen_to = listener.listen_to.find(function(l) {
        return l.path === path;
    });
    if (!listen_to) {
        return;
    }
    this.listen_to.splice(this.listen_to.indexOf(listen_to), 1);
    var all_paths = firestore_listeners.map(function(l) {
        return l.listen_to.map(function(lt) {
            return lt.path;
        });
    }).flat();
    Firestore.Prune_Listeners_Not_In_Paths(all_paths);
}
//@ts-ignore
var port = is_dev_env ? 3004 : parseInt(process.env.PORT) || 8080;
app.listen(port, function() {
    console.log("listening on port ".concat(port));
});
