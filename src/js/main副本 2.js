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

	function Frag(index, size, col, row, faCanvas) {
		this.index = index;
		this.size = size;
		this.oriX = index%col*size;
		this.oriY = Math.floor(index/col)*size;
		this.offsetX = 0;
		this.offsetY = 0;
		this.startX = 0;
		this.startY = 0;
		this.linkList = [index];
		this.el = null;
		this.top = index;
		this.init(faCanvas);
	}
	var fpt = Frag.prototype;
	fpt.init = function(faCanvas) {
		var c = document.createElement("canvas");
		c.width = this.size;
		c.height = this.size;
		var ctx = c.getContext("2d");
		ctx.drawImage(faCanvas, this.oriX, this.oriY, this.size, this.size, 0, 0, this.size, this.size);
		Game.canvas.jigsaw.getContext("2d").drawImage(faCanvas, this.oriX, this.oriY, this.size, this.size, 0, 0, this.size, this.size);
		this.el = c;
	};
	fpt.move = function(x, y) {
		var ox = this.offsetX = this.startX + x,
			oy = this.offsetY = this.startY + y;
		var list = this.linkList;
		var gf = Game.frags;
		for( var i = 0, len = list.length; i < len; i++ ) {
			gf[ list[i] ].offsetX = ox;
			gf[ list[i] ].offsetY = oy;
		}
		return {
			x: ox,
			y: oy
		};
	};
	fpt.isLinked = function(index) {
		return $.inArray( index, this.linkList ) !== -1;
	};
	fpt.link = function(arr, index) {
		var ar = this.linkList;
		ar = ar.concat(arr[index].linkList);
		var i,len;
		for( i = 0, len = ar.length; i < len; i++ ) {
			arr[ ar[i] ].linkList = ar;
		}
		this.setTop();
		return ar.length;
	};
	fpt.setTop = function() {
		this.top = ++Game.moveElId;
		// var list = this.linkList;
		// for( var i = 0, len = list.length; i < len; i++ ) {
		// 	Game.frags[ list[i] ].index = this.index;
		// }
		Game.draw("moving", 3, this.index);
		Game.draw("jigsaw", 2, this.index);
	};
	fpt.draw = function(ctx, only) {
		var frag = {};
		var linkList = this.linkList;
		var list = Game.frags;
		if( only ) {
			ctx.drawImage( this.el, this.oriX+this.offsetX, this.oriY+this.offsetY );
		} else {
			for( var i = 0, len = linkList.length; i < len; i++ ) {
				frag = list[ linkList[i] ];
				ctx.drawImage( frag.el, frag.oriX+frag.offsetX, frag.oriY+frag.offsetY );
			}
		}
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
		count: function() {
			var startTime = 0;
			clearTimeout(Timer.timeId);
			function step() {
				Timer.setDom(startTime);
				startTime++;
				Timer.result = startTime;
				Timer.timeId = setTimeout(step, 1000);
			}
			Timer.timeId = setTimeout(step, 1000);
		},
		stop: function() {
			clearTimeout(Timer.timeId);
		}
	};

	var t1 = 0; 			// test

	var Game = {
		wr: $(".frag-wr"),
		canvas: {
			jigsaw: $("#jigsaw").get(0),
			moving: $("#moving").get(0)
		},
		imgIndex: 1,
		moveElId: 110,
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
			$(".container").removeClass("step2 show-btn");
			$(".mode-btn-wr .btn").eq(0).one(Transitionend, function() {
				setTimeout(function() {
					Game.wr.one(Transitionend, function() {
						$(".container").addClass("show-ctr");
					});
					$(".container").addClass("step3")
				}, 10);
			});
		},
		ready: function(cb) {
			Game.frags = [];
			Game.moveModule.list = [];
			Game.imgIndex = Game.nowDi;
			Game.generateView();
			var el = $(".game-ctr .game-mode");
			var time = 5;
			function step() {
				el.text( time + "秒钟记图" );
				time--;
				if( time < 0 ) {
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
				pos = {};
			selectMode.setDom();
			var callback = function() {
				Game.bind();
				if( selectMode.mode === 1 ) {
					Timer.countDown( Timer.limit, Game.fail );
				} else if( selectMode.mode === 2 && Game.nowDi === 1 || selectMode.mode === 3 ) {
					Timer.count();
				}
			};
			var posArr = [];
			for(var i = 0, len = frags.length; i < len; i++) {
				c = i % col;
				r = Math.floor( i/col );
				rx = Math.random()*(300-size) | 0;
				ry = Math.random()*(400-size) | 0;
				pos = {
					x: rx-c*size,
					y: ry-r*size
				};
				posArr.push(pos);
			}
			var nowStep = 0;
			var tarStep = 50;
			function step() {
				nowStep++;
				var ratio = nowStep/tarStep;
				for( var i = 0, len = frags.length; i < len; i++ ) {
					frags[i].move( posArr[i].x*ratio | 0, posArr[i].y*ratio | 0 );
				}
				Game.draw("jigsaw", 1);
				if( nowStep < tarStep ) {
					requestAnimationFrame(step);
				} else {
					for( var i = 0, len = frags.length; i < len; i++ ) {
						frags[i].offsetX = posArr[i].x;
						frags[i].offsetY = posArr[i].y;
					}
					callback();
				}
			}
			requestAnimationFrame(step);
		},
		generateView: function() {
			var count = 0;
			var mode = Game.nowDi;
			if( mode === 1 ) {
				count = 12;
			} else if( mode === 2 ) {
				count = 48;
			} else if( mode === 3 ) {
				count = 108;
			}
			var size = (100/mode) | 0,
				i = 0,
				col = 3*mode,
				row = col/3*4,
				f;
			Game.size = size;
			Game.col = col;
			Game.row = row;


			var bc = document.createElement("canvas");
			bc.width = size*col;
			bc.height = size*row;
			var img = new Image();
			console.log( size*col, size*row );
			img.onload = function() {
				var ctx = bc.getContext("2d");
				ctx.drawImage(img, 0, 0, 300, 400);
				ctx.strokeWidth = 1;
				ctx.strokeStyle = "#FFFFFF";
				ctx.beginPath();
				for( var j = 0, len = row; j < len; j++ ) {
					ctx.moveTo(0.5, j*size+.5);
					ctx.lineTo(col*size+.5, j*size+.5);
				}
				for( var j = 0, len = col; j < len; j++ ) {
					ctx.moveTo(j*size+.5, 0.5);
					ctx.lineTo(j*size+.5, row*size+.5);
				}
				ctx.closePath();
				ctx.stroke();
				ctx.beginPath();
				ctx.strokeStyle = "#6C6C6C";
				for( var j = 0, len = row; j < len; j++ ) {
					ctx.moveTo(0.5, (j+1)*size-.5);
					ctx.lineTo(col*size-.5, (j+1)*size-.5);
				}
				for( var j = 0, len = col; j < len; j++ ) {
					ctx.moveTo((j+1)*size-.5, 0.5);
					ctx.lineTo((j+1)*size-.5, row*size-.5);
				}
				ctx.closePath();
				ctx.stroke();

				// Game.canvas.jigsaw.getContext("2d").drawImage(bc, 0, 0, 300, 400);

				i = 0;
				while( i < count ) {
					f = new Frag(i, size, col, row, bc);
					Game.frags.push(f);
					i++;
				}
				ctx = null;
				bc = null;
				img = null;
				Game.draw("jigsaw", 1);
			};
			img.src = HOST+"/static/img/winnie" + Game.nowDi + ".jpg";
		},
		bind: function() {
			var wr = Game.wr;
			var offset = wr.offset();
			wr.on("touchstart", function(e) {
				if( Game.moveModule.list.length > 0 ) {
					e.preventDefault();
					return ;
				}
				var touch = e.touches[0];
				// console.log( touch.clientX-offset.left, touch.clientY-offset.top );
				Game.moveElId = touch.identifier;
				Game.moveModule.add(touch.clientX-offset.left, touch.clientY-offset.top, Game.moveElId);
			});
			wr.on("touchmove", function(e) {
				var touch = e.touches[0];
				if( Game.drawId || !Game.moveModule.list.length ) {
					return ;
				}
				Game.moveModule.move(touch.clientX-offset.left, touch.clientY-offset.top, touch.identifier);
			});
			wr.on("touchend touchcancel", function(e) {
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
				sc = -1,
				sr = -1,
				oArr = [[-1, 0], [0, 1], [1, 0], [0, -1]],
				fragsList = Game.frags,
				_index = fragsList[index].index,
				col = _index%Game.col,
				row = Math.floor(_index/Game.col),
				dx = 10000,
				dy = 10000,
				si = -1,
				flag = false,
				tar = 0
				;
			for( var i = 0, len = oArr.length; i < len; i++ ) {
				sr = row + oArr[i][0];
				sc = col + oArr[i][1];
				if( sr >= 0 && sr < Game.row && sc >= 0 && sc < Game.col ) {
					si = fragsList.length;
					tar = sr*Game.col+sc;
					while( --si && fragsList[si].index !== tar );
					if( si >= 0 && !fragsList[index].isLinked(si) ) {
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
			}
			return false;
		},
		drawId: 0,
		draw: function(name, type, index) {
			$(".test").text(new Date() - t1);		// test
			if( Game.drawId ) {
				cancelAnimationFrame(Game.drawId);
			}
			var canvas = Game.canvas[name];
			var ctx = canvas.getContext("2d");
			var frags = Game.frags;
			var tar = frags[index || 1];
			
			requestAnimationFrame(function() {
				t1 = +new Date();					// test
				Game.drawId = 0;
				var flag = false;
				var drawed = [];
				ctx.clearRect(0, 0, 300, 400);
				var sortArr = [];
				if( type === 1 || type === 2 ) {
					for( var i = 0, len = frags.length; i < len; i++ ) {
						for( var j = 0, len2 = sortArr.length; j < len2; j++ ) {
							if( frags[i].top < sortArr[j].top ) {
								j--;
								break;
							}
						}
						sortArr.splice(j, 0, frags[i]);
					}
					frags = sortArr;
					console.log(frags);
				}
				if( type === 1 ) {											// 将生成的碎片全部画上去
					for( var i = 0, len = frags.length; i < len; i++ ) {
						frags[i].draw( ctx, true );
					}
				} else if( type === 2 ) {									// 将除了指定index的组之外的碎片全部画上去
					for( var i = 0, len = frags.length; i < len; i++ ) {
						if( tar.isLinked( frags[i].index ) ) continue;
						frags[i].draw( ctx, true );
					}
				} else if( type === 3 ) {									// 只画指定index的组的碎片
					frags[index].draw( ctx );
				}
			});
		},
		detectTouched: function(x, y) {
			var list = Game.frags;
			var size = Game.size;
			var posx = -1, posy = -1, nowIndex = -1;
			var frag = {};
			for( var i = -1, len = list.length-1; i < len; len-- ) {
				frag = list[len];
				posx = x-(frag.oriX+frag.offsetX);
				posy = y-(frag.oriY+frag.offsetY);
				if( posx >= 0 && posy >= 0 && posx <= size && posy <= size ) {
					nowIndex = len;
					break;
				}
			}
			return nowIndex;
		},
		moveModule: {
			list: [],
			add: function(x, y, id) {
				var list = Game.moveModule.list;
				var index;
				if( list.length ) {
					return ;
				}
				if( (index = Game.detectTouched(x, y)) === -1 ) {
					return ;
				}
				var tarF = Game.frags[ index ];
				tarF.setTop( index );
				tarF.startX = tarF.offsetX;
				tarF.startY = tarF.offsetY;
				list[0] = {
					index: index,
					x: x,
					y: y,
					id: id
				};
			},
			move: function(x, y, id) {
				var list = Game.moveModule.list;
				if( !list.length || Game.moveElId !== id ) return ;
				var index = list[0].index;
				var pos;
				Game.detectCat(index);
				pos = Game.frags[index].move( x-list[0].x, y-list[0].y );
				Game.draw("moving", 3, list[0].index);
			},
			remove: function(id) {
				Game.moveModule.list = [];
				Game.draw("jigsaw", 1);
				Game.draw("moving", 0);
			}
		},
		fail: function() {
			Game.destroy();
			Pop.show("so sad...时间已到~", 1);
			Music.play("fail");
		},
		pass: function() {
			if( selectMode.mode === 2 ) {
				if( Game.nowDi < 3 ) {
					Game.nowDi++;
					requestAnimationFrame(function() {
						Game.ready();
					});
				} else {
					Game.destroy();
					Pop.show("通关成功！", 2);
				}
			} else {
				Game.destroy();
				Pop.show("通关成功！", 2);
			}
			Music.play("pass");
		},
		destroy: function() {
			Game.unbind();
			Timer.stop();
			var list = Game.frags;
			for( var i = 0, len = list.length; i < len; i++ ) {
				list[i].el = null;
			}
			Game.frags = null;
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