(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
var Transitionend = "ontransitionend" in window ? "transitionend" : "webkitTransitionEnd";
var GAMEID = 10000190;
function getHost() {
	if( HOST && HOST.length ) return HOST;
	HOST = window.location;
	HOST = HOST.protocol + "//" + HOST.host + "/" + GAMEID;
	if( HOST.indexOf("file") >= 0 ) {
		HOST = ".";
	}
	return HOST;
}
var HOST = getHost();

Zepto(function($) {
	var selectMode = {
		ready: function() {
			$(".select").removeClass("select");
			$("h2").one(Transitionend, function() {
				setTimeout(function() {
					$(".container").addClass("show-btn");
				}, 50);
			});
			$(".container").removeClass("step1 step3 show-ctr").addClass("step2");
			selectMode.state[0] = false;
			selectMode.state[1] = false;
			Music.play("oui");
			$(".mode-btn-wr").on("touchstart", ".btn", function(e) {
				var tar = $(e.target);
				Music.play("oui");
				if( tar.hasClass("large") ) {
					$(".large .select").removeClass("select");
					tar.addClass("select");
					selectMode.mode = +tar.data("mode");
					selectMode.state[0] = true;
					if( selectMode.mode === 2 ) {
						selectMode.difficulty = 1;
						selectMode.state[1] = true;
					}
				} else {
					$(".small .select").removeClass("select");
					tar.addClass("select");
					selectMode.difficulty = +tar.data("difficulty");
					selectMode.state[1] = true;
				}
				if( selectMode.finish() ) {
					Game.fire();
				}
			});
		},
		state: [false, false],
		mode: -1,
		difficulty: -1,
		setDom: function() {
			var str1 = "", str2 = "";
			switch( selectMode.mode ) {
				case 1: str1 = "限时模式";break;
				case 2: str1 = "进阶模式";break;
				case 3: str1 = "计时模式";break;
				default:;
			}
			if( selectMode.mode !== 2 ) {
				switch( selectMode.difficulty ) {
					case 1: str2 = "低能";break;
					case 2: str2 = "中能";break;
					case 3: str2 = "高能";break;
					default:;
				}
			}
			$(".game-ctr .game-mode").html("<span class='m'>" + str1 + "</span><span class='d'>" + str2 + "</span>" );
		},
		finish: function() {
			var o = selectMode.state;
			return o[0] && o[1];
		}
	};

	var viewport = {
		w: $(window).width(),
		h: $(window).height()
	};
	try {
	yw.init({gameId: GAMEID, width: viewport.w, height: viewport.h});
	} catch(e) {
		alert(e.message);
	}

	function Frag(index, size, col) {
		this.str = "<div class='frag' \
		style=' \
		width: " + size + "px; \
		height: " + size + "px; \
		background-image: url(./static/img/winnie" + Game.imgIndex + ".jpg); \
		background-position: -" + (index%col*size) + "px -" + (Math.floor(index/col)*size) + "px; \
		-webkit-transform: translateX(0) translateY(0); \
		transform: translateX(0) translateY(0); \
		left: " + (index%col*size) + "px; \
		top: " + (Math.floor(index/col)*size) + "px; \
		' \
		data-index='" + index + "' \
		></div>";
		this.oriX = index%col*size;
		this.oriY = Math.floor(index/col)*size;
		this.offsetX = 0;
		this.offsetY = 0;
		this.startX = 0;
		this.startY = 0;
		this.linkList = [index];
		this.el = null;
		this.faEl = null;
		this.topIndex = index;
	}
	var fpt = Frag.prototype;
	fpt.move = function(x, y) {
		this.offsetX = this.startX + x;
		this.offsetY = this.startY + y;
		var list = this.linkList;
		var gf = Game.frags;
		for( var i = 0, len = list.length; i < len; i++ ) {
			gf[ list[i] ].offsetX = this.offsetX;
			gf[ list[i] ].offsetY = this.offsetY;
		}
		return {
			x: this.offsetX,
			y: this.offsetY
		};
	};
	fpt.isLinked = function(index) {
		return $.inArray( index, this.linkList ) !== -1;
	};
	fpt.link = function(arr, index) {
		var ar = this.linkList;
		ar = ar.concat(arr[index].linkList);
		var i,len;
		var el = null;
		var oldFa1 = null, oldFa2 = null;
		var fa = $("<div class='frag-group'></div>");
		var topIndex = this.topIndex;
		fa.css({
			"-webkit-transform": "translateX(" + this.offsetX + "px) translateY(" + this.offsetY + "px)",
			"transform": "translateX(" + this.offsetX + "px) translateY(" + this.offsetY + "px)"
		});
		oldFa1 = this.faEl;
		oldFa2 = arr[index].faEl;
		for( i = 0, len = ar.length; i < len; i++ ) {
			el = arr[ ar[i] ];
			if( !el.faEl ) {
				el.el.css({
					"-webkit-transform": "none",
					"transform": "none"
				});
			}
			fa.append( el.el );
			el.linkList = ar;
			el.faEl = fa;
			el.topIndex = this.topIndex;
		}
		if( !!oldFa1 ) {
			oldFa1.remove();
		}
		if( !!oldFa2 ) {
			oldFa2.remove();
		}
		fa.appendTo(Game.wr);
		this.top( ++Game.moveElId );
		return ar.length;
	};
	fpt.top = function(t) {
		if( !!this.faEl ) {
			this.faEl.css({"z-index": t});
			for( var i = 0, len = this.linkList.length; i < len; i++ ) {
				Game.frags[ this.linkList[i] ].topIndex = t;
			}
		} else {
			this.el.css({"z-index": t});
			this.topIndex = t;
		}
	};
	fpt.isTop = function() {
		for( var i = 0, len = Game.frags.length; i < len; i++ ) {
			if( Game.frags[i].topIndex > this.topIndex 
				&& Math.abs( Game.frags[i].offsetX+Game.frags[i].oriX - this.offsetX-this.oriX ) < Game.size-2 
				&& Math.abs( Game.frags[i].offsetY+Game.frags[i].oriY - this.offsetY-this.oriY ) < Game.size-2 ) {
				return false;
			}
		}
		return true;
	};
	var Timer = {
		el: $(".game-ctr .timer .value"),
		limit: 0,
		timeId: 0,
		result: 0,
		reset: function() {
			Timer.el.text( "00:00" );
			if( selectMode.mode === 1 ) {
				switch(selectMode.difficulty) {
					case 1: Timer.limit = 22;break;
					case 2: Timer.limit = 180;break;
					case 3: Timer.limit = 600;break;
					default:;
				}
			}
		},
		normalize: function(time) {
			var m = Math.floor(time/60),
				s = time%60;
			m = ("0" + m).substr(-2);
			s = ("0" + s).substr(-2);
			return m + ":" + s;
		},
		setDom: function(str) {
			if( typeof str !== "string" ) {
				str = Timer.normalize(str);
			}
			Timer.el.text(str);
		},
		countDown: function(startTime, cb) {
			clearTimeout(Timer.timeId);
			function step() {
				Timer.setDom(startTime);
				startTime--;
				Timer.result = startTime;
				if( startTime < 0 ) {
					cb && cb();
				} else {
					Timer.timeId = setTimeout(step, 1000);
				}
			}
			Timer.timeId = setTimeout(step, 1000);
		},
		count: function(cur) {
			var startTime = cur ? cur : 0;
			clearTimeout(Timer.timeId);
			function step() {
				Timer.setDom(startTime);
				startTime++;
				Timer.result = startTime;
				Timer.timeId = setTimeout(step, 1000);
			}
			Timer.timeId = setTimeout(step, 1000);
		},
		con: function() {
			this.count(Timer.result);
		},
		stop: function() {
			clearTimeout(Timer.timeId);
		}
	};

	// var t1 = 0; 			// test

	var Game = {
		wr: $(".frag-wr"),
		imgIndex: 1,
		moveElId: 111,
		frags: [],
		col: 0,
		row: 0,
		size: 0,
		nowDi: 0,
		fire: function() {
			Game.nowDi = selectMode.difficulty;
			Timer.reset();
			Game.wr.css("margin-top", (viewport.h-460)/2 + "px" );
			Game.ready();
			$(".mode-btn-wr .btn").eq(5).one(Transitionend, function() {
				setTimeout(function() {
					Game.wr.one(Transitionend, function() {
						$(".container").addClass("show-ctr");
					});
					$(".container").addClass("step3").removeClass("step2");
				}, 10);
			});
			$(".container").removeClass("show-btn");
		},
		ready: function(cb) {
			Game.frags = [];
			Game.moveModule.list = [];
			Game.moveArr = [];
			Game.imgIndex = Game.nowDi;
			Game.generateView();
			var el = $(".game-ctr .game-mode");
			var time = 5;
			function step() {
				el.text( time + "秒钟记图" );
				time--;
				if( time < 0 ) {
					Game.getDom();
					Game.messup();
				} else {
					setTimeout(step, 1000);
				}
			}
			step();
		},
		messup: function() {
			var cx = 150, xy = 200;
				rx = 0, ry = 0,
				c = 0, r = 0,
				col = Game.col, row = Game.row,
				size = Game.size,
				frags = Game.frags,
				pos = {},
			Game.wr.addClass("ready");
			selectMode.setDom();
			frags[0].el.one(Transitionend, function(e) {
				Game.wr.removeClass("ready");
				Game.bind();
				if( selectMode.mode === 1 ) {
					Timer.countDown( Timer.limit, Game.fail );
				} else if( selectMode.mode === 2 && Game.nowDi === 1 || selectMode.mode === 3 ) {
					Timer.count();
				} else if( selectMode.mode === 2 ) {
					Timer.con(Timer.result);
				}
			});
			for(var i = 0, len = frags.length; i < len; i++) {
				c = i % col;
				r = Math.floor( i/col );
				rx = Math.random()*(300-size);
				ry = Math.random()*(400-size);
				pos = frags[i].move(rx-c*size, ry-r*size);
				frags[i].el.css({
					"-webkit-transform": "translate3d(" + pos.x + "px, " + pos.y + "px, 0)",
					"transform": "translate3d(" + pos.x + "px, " + pos.y + "px, 0)"
				});
			}
			setTimeout(Game.loop, 0);
		},
		getDom: function() {
			var els = $(".frag-wr .frag");
			var list = Game.frags;
			for( var i = 0, len = list.length; i < len; i++ ) {
				list[i].el = els.eq(i);
			}
		},
		generateView: function() {
			Game.wr.empty();
			var count = 0;
			var mode = Game.nowDi;
			if( mode === 1 ) {
				count = 12;
			} else if( mode === 2 ) {
				count = 48;
			} else if( mode === 3 ) {
				count = 108;
			}
			var size = 100/mode,
				res = "",
				i = 0,
				col = 3*mode,
				f;
			Game.size = size;
			Game.col = col;
			Game.row = Game.col/3*4;
			while( i < count ) {
				f = new Frag(i, size, col);
				Game.frags.push(f);
				res += f.str;
				i++;
			}
			Game.wr.append(res);
		},
		bind: function() {
			var wr = Game.wr;
			wr.on("touchstart", ".frag", function(e) {
				if( Game.moveModule.list.length > 0 ) {
					e.preventDefault();
					return ;
				}
				var touch = e.touches[0];
				Game.moveModule.add(touch.target, touch.clientX, touch.clientY, ++Game.moveElId, touch.identifier);
			});
			wr.on("touchmove", ".frag", function(e) {
				var touch = e.touches[0];

				// if( Game.moveArr.valid ) {
				// 	return ;
				// }
				
				

				Game.moveModule.move(touch.target, touch.clientX, touch.clientY, touch.identifier);
				

			});
			wr.on("touchend touchcancel", ".frag", function(e) {
				Game.moveModule.remove();
			});
			$(".game-ctr .back").one("touchstart", function() {
				if( confirm("确定返回吗？") ) {
					Game.destroy();
					selectMode.ready();
				}
			});
		},
		unbind: function() {
			Game.wr.off();
			$(".game-ctr .back").off();
		},
		detectCat: function(index) {
			var size = Game.size,
				col = index%Game.col,
				row = Math.floor(index/Game.col),
				sc = -1,
				sr = -1,
				oArr = [[-1, 0], [0, 1], [1, 0], [0, -1]],
				fragsList = Game.frags,
				dx = 10000,
				dy = 10000,
				si = -1,
				flag = false
				;
			for( var i = 0, len = oArr.length; i < len; i++ ) {
				sr = row + oArr[i][0];
				sc = col + oArr[i][1];
				if( sr >= 0 && sr < Game.row && sc >= 0 && sc < Game.col && !fragsList[index].isLinked(si = sr*Game.col+sc) && fragsList[si].isTop() ) {
					dx = Math.abs(fragsList[ si ].offsetX - fragsList[index].offsetX);
					dy = Math.abs(fragsList[ si ].offsetY - fragsList[index].offsetY);
					if( dx < 5 && dy < 5 ) {
						if( fragsList[index].link(fragsList, si) === Game.frags.length ) {
							Game.pass();
							return true;
						}
						Music.play("oui");
						flag = true;
					}
				}
			}
			return false;
		},
		drawIndex: -1,
		drawId: 0,
		pos: null,
		draw: function(index, pos) {

				
				// t1 = +new Date();						// test
			var el = Game.frags[index].faEl || Game.frags[index].el;
			el.css({
				"-webkit-transform": "translate3d(" + pos.x + "px, " + pos.y + "px, 0)",
				"transform": "translate3d(" + pos.x + "px, " + pos.y + "px, 0)"
			});
			// setTimeout(function() {
			// 	$(".test").text(new Date() - t1);		// test
			// }, 0);
			
			// Game.drawIndex = -1;
			// Game.pos = null;
		},
		moveArr: {},
		loop: function() {
			var list = Game.frags;
			var mel = Game.moveArr;
			// var lindex = -1;
			var pos;
			var size = Game.size,
				col = 0,
				row = 0,
				sc = -1,
				sr = -1,
				oArr = [[-1, 0], [0, 1], [1, 0], [0, -1]],
				dx = 10000,
				dy = 10000,
				si = -1,
				i = 0,
				len = 0
				;
			function detect(index) {
				col = index%Game.col;
				row = Math.floor(index/Game.col);
				dx = 10000;
				dy = 10000;
				si = -1;
				for( i = 0, len = oArr.length; i < len; i++ ) {
					sr = row + oArr[i][0];
					sc = col + oArr[i][1];
					if( sr >= 0 && sr < Game.row && sc >= 0 && sc < Game.col && !list[index].isLinked(si = sr*Game.col+sc) && list[si].isTop() ) {
						dx = Math.abs(list[ si ].offsetX - list[index].offsetX);
						dy = Math.abs(list[ si ].offsetY - list[index].offsetY);
						if( dx < 5 && dy < 5 ) {
							if( list[index].link(list, si) === list.length ) {
								Game.pass();
								return true;
							}
							Music.play("oui");
						}
					}
				}
				return false;
			}
			


			function round() {
				Game.drawId = requestAnimationFrame(round);

				if( mel.valid ) {
					pos = list[ mel.index ].move( mel.ox, mel.oy );
					detect(mel.index);
					Game.draw(mel.index, pos);
					setTimeout(function() {
						mel.valid = false;
					}, 0);
				}
			}
			round();
		},
		moveModule: {
			list: [],
			add: function(el, x, y, id, tid) {
				var list = Game.moveModule.list;
				if( list.length ) {
					return ;
				}
				// $(el).data("moveid", id);
				var index = +$(el).data("index");
				var tarF = Game.frags[index];
				tarF.top( id+1 );
				tarF.startX = tarF.offsetX;
				tarF.startY = tarF.offsetY;
				list[0] = {
					tar: el,
					x: x,
					y: y,
					id: id,
					tid: tid,
					index: index
				};
			},
			move: function(el, x, y, tid) {
				var list = Game.moveModule.list;
				var index = -1;
				var pos;
				if( tid != list[0].tid ) {
					return ;
				}
				index = list[0].index;
				Game.moveArr.index = index;
				Game.moveArr.ox = x-list[0].x;
				Game.moveArr.oy = y-list[0].y;
				Game.moveArr.valid = true;

			},
			remove: function(el) {
				Game.moveModule.list = [];
			}
		},
		fail: function() {
			Game.destroy();
			Pop.show("so sad...时间已到~", 1);
			Music.play("fail");
		},
		pass: function() {
			Game.destroy();
			if( selectMode.mode === 2 ) {
				if( Game.nowDi < 3 ) {
					Game.nowDi++;
					requestAnimationFrame(function() {
						Game.ready();
					});
				} else {
					Pop.show("通关成功！", 2);
				}
			} else {
				Pop.show("通关成功！", 2);
			}
			Music.play("pass");
		},
		destroy: function() {
			Game.unbind();
			Timer.stop();
			cancelAnimationFrame(Game.drawId);
		}
	};
	$("body").on("touchmove", function(e) {
		e.preventDefault();
	});
	$("#start-btn").one("touchstart", selectMode.ready);

	var Pop = {
		el: $(".pop"),
		textel: $(".pop").find(".pop-card .text-wr"),
		btn: $(".pop .btn-wr"),
		show: function(text, type, cb) {
			Pop.textel.text(text);
			Pop.el.addClass("show");
			if( typeof type !== "number" ) {
				Pop.hideBtn();
				Pop.el.one("touchstart", function() {
					Pop.hide();
				});
				cb = type;
			} else {
				Pop.showBtn();
				var btns = Pop.btn.find("button");
				if( type === 1 ) {
					btns.eq(0).text("找人帮忙");
				} else if( type === 2 ) {
					btns.eq(0).text("低调秀一下");
				}
				Pop.bindBtn(type);
			}
			// cb();
		},
		hide: function() {
			Pop.el.removeClass("show");
		},
		hideBtn: function() {
			Pop.btn.css("display", "none");
		},
		showBtn: function() {
			Pop.btn.css("display", "block");
		},
		bindBtn: function(type) {
			Pop.btn.on("touchstart", function(e) {
				var tar = e.target;
				if( $(tar).hasClass("replay") ) {
					selectMode.ready();
					Pop.hide();
				} else if( $(tar).hasClass("share") ) {
					Share.show(type, Timer.result);
				} else {
					return ;
				}
			});
		}
	};

	var Resource = {
		shareImageUrl: HOST + "/static/img/icon.jpg",
		bgs: [HOST + "/static/img/winnie1.jpg", 
			HOST + "/static/img/winnie2.jpg",
			HOST + "/static/img/winnie3.jpg"]
	};

	var Share = {
		data: {
			title: "拼出维尼熊",
			text: "我正在拼维尼熊，啊~！好喜欢维尼熊~",
			imageUrl: Resource.shareImageUrl
		},
		shareTpl: [{
			title: "拼出维尼熊",
			text: "So sad...我没能把高能维尼熊拼出来，求助大神~",
			imageUrl: Resource.shareImageUrl
		}, {
			title: "拼出维尼熊",
			text: "So sad...我竟没能把中能维尼熊拼出来，求助大神~",
			imageUrl: Resource.shareImageUrl
		}, {
			title: "拼出维尼熊",
			text: "So sad...我连低能维尼熊都没拼出来，我面壁去了",
			imageUrl: Resource.shareImageUrl
		}, {
			title: "拼出维尼熊",
			text: "我在计时模式中拼出了$difficulty$的维尼熊，还剩$time$秒哦！",
			imageUrl: Resource.shareImageUrl
		}, {
			title: "拼出维尼熊",
			text: "呕液~我花了$time$秒成功拼出了$difficulty$的维尼熊~求超越~",
			imageUrl: Resource.shareImageUrl
		}, {
			title: "拼出维尼熊",
			text: "我花了$time$秒完成了进阶模式的维尼熊拼图，速来膜拜~",
			imageUrl: Resource.shareImageUrl
		}],
		show: function(type, result) {
			var data;
			if( !type || type === 0 ) {
				Share.setData(0);
			} else if( type === 1 ) {
				Share.setData(1);
			} else if( type === 2 ) {
				Share.setData(2, result);
			}
			yw.openSocialShareMenu(Share.data, function(err, data) {
				if( err ) {
					Pop.show( data.toString() );
				}
			});
		},
		setData: function(type) {
			var data = {};
			if( type === 0 ) {
				$.extend(true, data, Share.shareTpl[0]);
			} else if( type === 1) {
				switch(selectMode.difficulty) {
					case 1:$.extend(true, data, Share.shareTpl[1]);break;
					case 2:$.extend(true, data, Share.shareTpl[2]);break;
					case 3:$.extend(true, data, Share.shareTpl[3]);break;
					default:;
				}
			} else if( type === 2 ) {
				switch(selectMode.mode) {
					case 1:$.extend(true, data, Share.shareTpl[4]);break;
					case 2:$.extend(true, data, Share.shareTpl[5]);break;
					case 3:$.extend(true, data, Share.shareTpl[6]);break;
					default:;
				}
				var d = "";
				switch(selectMode.difficulty) {
					case 1:d = "低能";break;
					case 2:d = "中能";break;
					case 3:d = "高能";break;
					default:;
				}
				data.text = data.text.replace(/\$difficulty\$/g, d).replace(/\$time\$/g, Timer.result);
			}
			Share.data = data;
		}
	};

	var Music = {
		playing: "",
		tracks: {
			oui: $("#audio-oui").get(0),
			fail: $("#audio-fail").get(0),
			pass: $("#audio-pass").get(0)
		},
		play: function(name) {
			if( Music.playing === name ) {
				Music.pause();
			}
			Music.playing = name;
			Music.tracks[name].play();
		},
		pause: function() {
			Music.playing.length && Music.tracks[ Music.playing ].pause() && (Music.tracks[ Music.playing ].currentTime = 0);
		}
	};



	for( var i = 0, len = Resource.bgs.length; i < len; i++ ) {
		$(".preload").append("<img src='" + Resource.bgs[i] + "'>");
	}



});