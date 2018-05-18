let singleton = null;
export default function getLogging() {
    if (!singleton) {
        singleton = new Logger();
    }
    return singleton;

    function Logger() {
        var BASE_URL = "https://gdiac.cis.cornell.edu/research_games/";
        var PAGE_LOAD = "page_load.php";
        var PLAYER_ACTION = "player_action.php";
        var PLAYER_QUEST = "player_quest.php";
        var PLAYER_QUEST_END = "player_quest_end.php";
        var PLAYER_AB_TEST = "record_abtest.php";

        var StatusEnum = {
            STATUS_UNINITIALIZED: 0,
            STATUS_LEVEL_NOT_STARTED: 1,
            STATUS_LEVEL_IN_PROGRESS: 2
        };

        var _gameId = 1817055;
        var _abValueSet = false;
        var _abStoredValue = null;
        var _versionId = 1;
        var _debugMode = false;
        var _userId = "";
        var _sessionId = "";
        var _sessionSeqId = 1;
        var _dynamicQuestId = "";
        var _questId = 0;
        var _questSeqId = 1;
        var _currentStatus = StatusEnum.STATUS_UNINITIALIZED;
        var _suppressConsoleOutput = false;

        this.ACTION_EFFECT = 0;

        function getItem(key) {
            return window.localStorage[key];
        }

        function setItem(key, value) {
            window.localStorage[key] = value;
        }

        this.reset = function() {
            setItem("user_id", null);
            setItem("ab_test_value", null);
        };

        this.initialize = function (/*gameId, versionId,*/ debugMode, suppressConsoleOutput) {
            if (suppressConsoleOutput) {
                _suppressConsoleOutput = suppressConsoleOutput;
            }

            /*_gameId = gameId;
            _versionId = versionId;*/
            _debugMode = debugMode;
            if (_debugMode) {
                return;
            }
            _userId = getItem('user_id');
            if (!_userId) {
                _userId = generateRandomString(40);
            }
            _sessionId = generateRandomString(36);
            _currentStatus = StatusEnum.STATUS_LEVEL_NOT_STARTED;
        };

        var trace = function (message) {
            if (!_suppressConsoleOutput) {
                console.log(message);
            }
        };

        var generateRandomString = function (strlen) {
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var num_chars = chars.length - 1;
            var randomChar = "";

            for (var i = 0; i < strlen; i++) {
                randomChar += chars.charAt(Math.floor(Math.random() * num_chars));
            }
            return randomChar;
        };

        var getTimestamp = function () {
            return new Date().getTime();
        };

        var sendRequest = function (methodName, url) {
        //    $.ajax({
        //        url: url,
        //        dataType: 'jsonp',
        //        success: (function (data) {
        //            if (!_suppressConsoleOutput) {
        //                trace(methodName + ": Sent w/ the following server response: " + JSON.stringify(data))
        //            }
        //        }),
        //        error: (function (jqXHR) {
        //            if (!_suppressConsoleOutput) {
        //                if (jqXHR.statusText == "error") {
        //                    trace(methodName + ": Could not connect to server at all.")
        //                } else {
        //                    trace(methodName + ": Failed with the following server response: " + jqXHR.statusText)
        //                }
        //            }
        //        }),
        //        jsonp: 'jsonp'
        //    });

            var r = new XMLHttpRequest();
            r.open("jsonp", url, true);


            r.onreadystatechange = function () {

            //   4: completed HTTP request  200: successful
              if (r.readyState != 4 || r.status != 200) {
                console.log("ABCD " + JSON.stringify(r.readyState));
                console.log("ABCD " + JSON.stringify(r.status));
                console.log("ABCD " + JSON.stringify(r.response));
                console.log("ABCD " + JSON.stringify(r.responseText));
                return;
              }
              else {

                var response = this.responseText;
              }
            };
            r.send(null);
        };

        this.assignABTestValue = function (candidate) {
            if (!_debugMode) {
                if (! (getItem("ab_test_value"))) {
                    _abStoredValue = candidate;
                    setItem("ab_test_value", _abStoredValue);
                } else {
                    _abStoredValue = getItem("ab_test_value");
                }
                _abValueSet = true;
                return _abStoredValue;
            } else {
                return candidate;
            }
        }

        this.recordABTestValue = function () {
            if (_currentStatus == StatusEnum.STATUS_UNINITIALIZED) {
                if (!_debugMode) {
                    trace("recordABTestValue: You must call initialize() before recording anything!");
                }
                return;
            }
            if (!_abValueSet) {
                if (!_debugMode) {
                    trace("recordABTestValue: You must call assignABTestValue before recording the A/B test value!");
                }
                return;
            }
            var serverURL =
                BASE_URL + PLAYER_AB_TEST +
                "?game_id=" + _gameId +
                "&user_id=" + _userId +
                "&abvalue=" + _abStoredValue;
            sendRequest("recordABTestValue", serverURL);
        };

        this.recordPageLoad = function (userInfo) {
            if (_debugMode) {
                trace(`recordPageLoad: ${userInfo}`);
            }
            if (_currentStatus == StatusEnum.STATUS_UNINITIALIZED) {
                if (!_debugMode) {
                    trace("recordPageLoad: You must call initialize() before recording anything!");
                }
                return;
            }

            // Set default parameters
            if (typeof(userInfo) === 'undefined') userInfo = "";

            var serverURL =
                BASE_URL + PAGE_LOAD +
                "?game_id=" + _gameId +
                "&client_timestamp=" + getTimestamp() +
                "&user_info=" + userInfo +
                "&version_id=" + _versionId +
                "&user_id=" + _userId +
                "&session_id=" + _sessionId;
            sendRequest("recordPageLoad", serverURL);
            //stores user info
            setItem('user_id', _userId);
            setItem('session_id', _sessionId);
        };

        this.recordLevelStart = function (questId, questDetail) {
            if (_debugMode) {
                trace(`recordLevelStart: ${questId} ${questDetail}`);
            }
            if (_currentStatus != StatusEnum.STATUS_LEVEL_NOT_STARTED) {
                if (!_debugMode) {
                    if (_currentStatus == StatusEnum.STATUS_UNINITIALIZED) {
                        trace("recordLevelStart: You must call initialize() before recording anything!");
                    } else {
                        trace("recordLevelStart: You can't start a level before you end the last one.");
                    }
                }
                return;
            }

            // Set default parameters
            if (typeof(questDetail) === 'undefined') questDetail = "";

            _dynamicQuestId = generateRandomString(40);
            var serverURL =
                BASE_URL + PLAYER_QUEST +
                "?game_id=" + _gameId +
                "&client_timestamp=" + getTimestamp() +
                "&quest_id=" + questId +
                "&user_id=" + _userId +
                "&session_id=" + _sessionId +
                "&session_seq_id=" + _sessionSeqId +
                "&version_id=" + _versionId +
                "&quest_detail=" + questDetail +
                "&dynamic_quest_id=" + _dynamicQuestId;
            sendRequest("recordLevelStart", serverURL);
            _sessionSeqId++;
            _questSeqId = 1;
            _questId = questId;
            _currentStatus = StatusEnum.STATUS_LEVEL_IN_PROGRESS;
        };

        this.recordLevelEnd = function () {
            if (_currentStatus != StatusEnum.STATUS_LEVEL_IN_PROGRESS) {
                if (!_debugMode) {
                    if (_currentStatus == StatusEnum.STATUS_UNINITIALIZED) {
                        trace("recordLevelEnd: You must call initialize before recording anything!");
                    } else {
                        trace("recordLevelEnd: You must start a level before ending!");
                    }
                }
                return;
            }
            var serverURL =
                BASE_URL + PLAYER_QUEST_END +
                "?dynamic_quest_id=" + _dynamicQuestId;
            sendRequest("recordLevelEnd", serverURL);
            _sessionSeqId++;
            _questSeqId = 1;
            _currentStatus = StatusEnum.STATUS_LEVEL_NOT_STARTED;
        };

        this.recordEvent = function (actionId, actionDetail) {
            if (_debugMode) {
                trace(`recordEvent: ${actionId} ${actionDetail}`);
            }
            if (_currentStatus != StatusEnum.STATUS_LEVEL_IN_PROGRESS) {
                if (!_debugMode) {
                    if (_currentStatus == StatusEnum.STATUS_UNINITIALIZED) {
                        trace("recordEvent: You must call initialize before recording anything!");
                    } else {
                        trace("recordEvent: You must start a level before recording an event!");
                    }
                }
                return;
            }

            // Set default parameters
            if (typeof(actionDetail) === 'undefined') actionDetail = "";

            var serverURL =
                BASE_URL + PLAYER_ACTION +
                "?game_id=" + _gameId +
                "&client_timestamp=" + getTimestamp() +
                "&quest_id=" + _questId +
                "&user_id=" + _userId +
                "&action_id=" + actionId +
                "&session_seq_id=" + _sessionSeqId +
                "&quest_seq_id=" + _questSeqId +
                "&action_detail=" + actionDetail +
                "&dynamic_quest_id=" + _dynamicQuestId;
            sendRequest("recordEvent", serverURL);
            _sessionSeqId++;
            _questSeqId++;
        };
    }
}
