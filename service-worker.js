"use strict";var precacheConfig=[["./index.html","e3239e7df52c47106ee1e9baad9dfc7f"],["./static/css/main.cc674ef0.css","391322c0c3aaf389a9fffd70adb31c83"],["./static/js/main.50f98b95.js","1132e7ae82e0c811544236475ad37653"],["./static/media/arrival-departure-board2.56cbc6c3.png","56cbc6c39d325d5749ba70f04ccc9da3"],["./static/media/escalator0.768fde6c.png","768fde6cdc19b7f2f966cbd52fc9d217"],["./static/media/escalator1.d1973214.png","d1973214bbb940f630ec50b6982d155b"],["./static/media/escalator2.effe7b6d.png","effe7b6dcf97239ddf872eceefc5efcf"],["./static/media/fedora.9fd8124c.png","9fd8124cac84463460d094c34ad91109"],["./static/media/food-court-bakery1.f80df88b.png","f80df88b27e06d723704d9e6dd80d09a"],["./static/media/food-court-bakery2.2d9dbd0d.png","2d9dbd0d842e822a6dcf691c5b6a7f4a"],["./static/media/food-court-chairs0.330017de.png","330017de6c65f75cfcd4ec60cebb65d7"],["./static/media/food-court-chairs1.d5314250.png","d53142504487f7940dd5866d05db7fa6"],["./static/media/food-court-chairs2.56398bbf.png","56398bbf9d80ea775bcd45a4762c0bd7"],["./static/media/food-court-ramen-front.84a6c2d6.png","84a6c2d6d59a2596945ffacb3b289a1a"],["./static/media/food-court-ramen1.a944ada1.png","a944ada186dc72a38b3a650c2eb81f16"],["./static/media/hira-あ.38107f42.png","38107f42196610910692aea500b8147f"],["./static/media/hira-い.5ef3a210.png","5ef3a210c4cff4612b80345c1eb2575d"],["./static/media/hira-う.3f2c8a1e.png","3f2c8a1e6cd2c5a35d320862db7b74eb"],["./static/media/hira-え.1740ad6b.png","1740ad6bbe718a08ba5c45cce4f28fdb"],["./static/media/hira-お.8669ef1d.png","8669ef1d3ab6b6300e184f17019574e6"],["./static/media/hira-か.a581cca6.png","a581cca659f226a1706bc421dc2f66d9"],["./static/media/hira-き.3c71bb81.png","3c71bb81f469c3b902a8c9eb097478c0"],["./static/media/hira-く.1156e865.png","1156e865ebb86e0111baeeb17d6fac4d"],["./static/media/hira-け.c1c57186.png","c1c57186c01fc481b245ea90506f3fee"],["./static/media/hira-こ.08e90aa0.png","08e90aa03d5b7709bcbeb5d903440294"],["./static/media/hira-さ.f75d17af.png","f75d17af3415704271dd3d14bcbfaaa1"],["./static/media/hira-し.4ad16c4d.png","4ad16c4d41055759b1cdeb324ceb3526"],["./static/media/hira-す.680528d6.png","680528d67a8b4382cfb43187aaa8ae5d"],["./static/media/hira-せ.ba9a8276.png","ba9a8276aa77261540ccb126b3e14732"],["./static/media/hira-そ.5b4edea5.png","5b4edea55c24abb6b76d36ca9de4a6f9"],["./static/media/hira-た.58940b70.png","58940b70c4538a64d319de305b2e5644"],["./static/media/hira-ち.33581c15.png","33581c156950637df51f6925b34124f3"],["./static/media/hira-つ.b2585dd1.png","b2585dd1f45abb70b32469a391040bd5"],["./static/media/hira-て.879adc58.png","879adc581cbbd5d55096904cd285aa9f"],["./static/media/hira-と.73a905b1.png","73a905b1ff17f4ac0a0ea4e6a6ad853f"],["./static/media/hira-な.e1a365de.png","e1a365de97afaa90b7de8de514a0945c"],["./static/media/hira-に.6e8f4678.png","6e8f46788e94a3a3a467b30c6c682284"],["./static/media/hira-ぬ.39b7d844.png","39b7d84494c61d24b179a97e07250b43"],["./static/media/hira-ね.1e9b29b7.png","1e9b29b713e00a7673dcb1795eed3907"],["./static/media/hira-の.e265c9f0.png","e265c9f04efff148699acd3a5e2fe4ae"],["./static/media/hira-は.c859e407.png","c859e4078fef3bae81cafa462ed7097f"],["./static/media/hira-ひ.884089ec.png","884089ecbf837931c5564699e40495fa"],["./static/media/hira-ふ.17015edd.png","17015eddd65b8afc6653618484b3867a"],["./static/media/hira-へ.437c2911.png","437c2911ebd18080731d1fa58eac7405"],["./static/media/hira-ほ.ff54a8a8.png","ff54a8a89e34eaa5b50b593518b5cdbd"],["./static/media/hira-ま.f4e42783.png","f4e42783072ee2a397e380d2704e1d15"],["./static/media/hira-み.cb92c02a.png","cb92c02ac9d5d5c94dc0dfcfb2e0dd9d"],["./static/media/hira-む.20c4ed3e.png","20c4ed3e190fa4d10e4453492bef121e"],["./static/media/hira-め.7baf3250.png","7baf3250ccfed86891251d6aad3cd243"],["./static/media/hira-も.c01dd3f1.png","c01dd3f11a570386bbcc283345da9f63"],["./static/media/hira-や.f4d778b4.png","f4d778b4f129349a98dd9df8d8859852"],["./static/media/hira-ゆ.2a29b146.png","2a29b146bc7b870c103e487215225968"],["./static/media/hira-よ.365ffb4a.png","365ffb4abf33f012b5f2dbada6c9ec7a"],["./static/media/hira-ら.4ce61b11.png","4ce61b114e41d53998381d4df6c0e579"],["./static/media/hira-り.1c9b4bb6.png","1c9b4bb653467c6c2222643f0c073f57"],["./static/media/hira-る.5d495474.png","5d495474cb704aa2803eeba888eaac3d"],["./static/media/hira-れ.2a24078e.png","2a24078e251c2d369d011aefad9e3383"],["./static/media/hira-ろ.fd588539.png","fd5885396c0e37c5963ffe4161597554"],["./static/media/hira-わ.43315457.png","433154572a1604b379d9a82fd092fd50"],["./static/media/hira-を.5d9487ed.png","5d9487eddb859e5ff21644021917f6c8"],["./static/media/hira-ん.5463d9ff.png","5463d9ff988d37e95caea96860c3cde9"],["./static/media/odango-atama.b6cf7cc3.png","b6cf7cc3d8574ac73d3d8531011097e7"],["./static/media/ribbon.e9563bb5.png","e9563bb5b9bc5a94dd28d7cec4c45e8b"],["./static/media/speaker.345a3945.png","345a3945a9caf0a7c0d07601e7fb993c"],["./static/media/subway-ticketmachine-front.6dfff079.png","6dfff079dc52266324476c9ef9fa5896"],["./static/media/subway-ticketmachine1.8b9dcbb4.png","8b9dcbb4519439dc869fa0985d4c04d7"],["./static/media/subway-ticketmachine2.77f6a7c6.png","77f6a7c64c188d7a5dac369bea0bcc88"],["./static/media/vendclose.e9f2c851.png","e9f2c8515cf763a69162e53e12b5c712"],["./static/media/witch.86b8939b.png","86b8939b4c8f1d885f31cbbd64756233"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(a,e){a=new URL(a);return"/"===a.pathname.slice(-1)&&(a.pathname+=e),a.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(a,e,c,t){a=new URL(a);return t&&a.pathname.match(t)||(a.search+=(a.search?"&":"")+encodeURIComponent(e)+"="+encodeURIComponent(c)),a.toString()},isPathWhitelisted=function(a,e){if(0===a.length)return!0;var c=new URL(e).pathname;return a.some(function(a){return c.match(a)})},stripIgnoredUrlParameters=function(a,c){a=new URL(a);return a.hash="",a.search=a.search.slice(1).split("&").map(function(a){return a.split("=")}).filter(function(e){return c.every(function(a){return!a.test(e[0])})}).map(function(a){return a.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(a){var e=a[0],a=a[1],e=new URL(e,self.location),a=createCacheKey(e,hashParamName,a,/\.\w{8}\./);return[e.toString(),a]}));function setOfCachedUrls(a){return a.keys().then(function(a){return a.map(function(a){return a.url})}).then(function(a){return new Set(a)})}self.addEventListener("install",function(a){a.waitUntil(caches.open(cacheName).then(function(t){return setOfCachedUrls(t).then(function(c){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(e){if(!c.has(e)){var a=new Request(e,{credentials:"same-origin"});return fetch(a).then(function(a){if(!a.ok)throw new Error("Request for "+e+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return t.put(e,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(a){var c=new Set(urlsToCacheKeys.values());a.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(a){return Promise.all(a.map(function(a){if(!c.has(a.url))return e.delete(a)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){var c,a,t;"GET"===e.request.method&&(c=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching),t="index.html",(a=urlsToCacheKeys.has(c))||(c=addDirectoryIndex(c,t),a=urlsToCacheKeys.has(c)),t="./index.html",!a&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(c=new URL(t,self.location).toString(),a=urlsToCacheKeys.has(c)),a&&e.respondWith(caches.open(cacheName).then(function(a){return a.match(urlsToCacheKeys.get(c)).then(function(a){if(a)return a;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)})))});