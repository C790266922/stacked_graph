
window.onload = function () {
	var data1 = [
		{xAxis:'1', names:['A', 'B', 'C', 'D'], values:[341, 200, 100, 500]},
		{xAxis:'2', names:['A', 'B', 'C', 'D'], values:[499, 310, 200, 600]},
		{xAxis:'3', names:['A', 'B', 'C', 'D'], values:[360, 300, 250, 650]},
		{xAxis:'4', names:['A', 'B', 'C', 'D'], values:[700, 280, 210, 600]},
		{xAxis:'5', names:['A', 'B', 'C', 'D'], values:[970, 340, 300, 700]},
		{xAxis:'6', names:['A', 'B', 'C', 'D'], values:[1350, 400, 400, 900]}
	];

	window.dataset1 = data1;

	var data2 = [
		{xAxis:'1', names:['A', 'B', 'C', 'D', 'F'], values:[141, 100, 40, 240, 279]},
		{xAxis:'2', names:['A', 'B', 'C', 'D', 'F'], values:[299, 290, 230, 400, 380]},
		{xAxis:'3', names:['A', 'B', 'C', 'D', 'F'], values:[320, 240, 200, 600, 400]},
		{xAxis:'4', names:['A', 'B', 'C', 'D', 'F'], values:[400, 260, 240, 630, 500]},
		{xAxis:'5', names:['A', 'B', 'C', 'D', 'F'], values:[360, 330, 310, 530, 639]},
		{xAxis:'6', names:['A', 'B', 'C', 'D', 'F'], values:[300, 240, 300, 330, 532]}
	];

	window.dataset2 = data2;


	var colors = ['#72f6ff', '#1E9FFF', '#666666', '#FF9EFF', '#FF00FF']

	window.colors = colors;

	var chart = new stackedGraph('canvas', data1, {
		title: 'Stacked Graph Demo',
		bgColor: '#829dba',
		titleColor: '#ffffff',      
		titlePosition: 'top',       
		fillColor: colors,       	
		axisColor: '#eeeeee',       
		contentColor: '#bbbbbb',    
		streamGraph: 0
	});

	window.chart = chart;
}

function toStreamGraph() {
	window.chart.toStream();
}

function toBarGraph() {
	window.chart.toBar();
}

function toDataset1() {
	window.chart.changeDataset(window.dataset1);
}

function toDataset2() {
	window.chart.changeDataset(window.dataset2);
}

function stackedGraph(canvas, data, options) {
	this.canvas = document.getElementById(canvas);
	this.ctx = this.canvas.getContext('2d');
	this.data = data;                           
	this.dataLength = this.data.length;         
	this.width = this.canvas.width;             
	this.height = this.canvas.height;           
	this.padding = 50;                          
	this.yEqual = 5;                            
	this.yLength = 0;                           
	this.xLength = 0;                           
	this.yGap = 0;                       
	this.yRatio = 0;                            
	this.bgColor = '#ffffff';                   
	this.fillColor = options.fillColor;         
	this.axisColor = '#666666';                 
	this.contentColor = '#eeeeee';              
	this.titleColor = '#000000';                
	this.title = '';                            
	this.titlePosition = 'top';                 
	this.looped = null;                         
	this.current = 0;                           
	this.currentIndex = -1;
	this.onceMove = -1;
	this.originX = 0;
	this.originY = 0;
	this.streamGraph = 0;
	this.streamPointsArrs = [];
	this.inStream = [];
	this.init(options);
}

stackedGraph.prototype = {
	init: function(options) {
		if(options){
			this.padding = options.padding || 50;
			this.yEqual = options.yEqual || 5;
			this.bgColor = options.bgColor || '#ffffff';
			this.fillColor = options.fillColor; 
			this.axisColor = options.axisColor || '#666666';
			this.contentColor = options.contentColor || '#eeeeee';
			this.titleColor = options.titleColor || '#000000';
			this.title = options.title;
			this.titlePosition = options.titlePosition || 'top';
			this.streamGraph = options.streamGraph;
		}
		this.yLength = Math.floor((this.height - this.padding * 2 - 10) / this.yEqual);
		this.xLength = Math.floor((this.width - this.padding * 1.5 - 10) / this.dataLength);
		this.yGap = this.getYGap(this.data);
		this.yRatio = this.yLength / this.yGap;
		this.originX = this.padding + 0.5;
		this.originY = this.height - this.padding + 0.5;
		this.streamPointsArrs = [];
		this.inStream = [];
		this.looping();
	},
	looping: function() {
		this.looped = requestAnimationFrame(this.looping.bind(this));
		if(this.current < 100){
			this.current = (this.current + 3) > 100 ? 100 : (this.current + 3);
			this.drawAnimation();
		}else{
			window.cancelAnimationFrame(this.looped);
			this.looped = null;
			if(this.streamGraph == 0){
				this.canvas.removeEventListener('mousemove', this.streamWatchHoverHandler);
				this.barWatchHover();
			} else {
				this.canvas.removeEventListener('mousemove', this.barWatchHoverHandler);
				this.streamWatchHover();
			}
		}
	},
	drawAnimation: function() {
		if(this.streamGraph == 0) {
			for(var i = 0; i < this.dataLength; i++) {
				var sum = this.data[i].values.reduce((x1, x2) => {
					return x1 + x2;
				});
				var x = Math.ceil(sum * this.current / 100 * this.yRatio);
				var y = this.height - this.padding - x;

				this.data[i].left = this.padding + this.xLength * (i + 0.25);
				this.data[i].top = y;
				this.data[i].right = this.padding + this.xLength * (i + 0.75);
				this.data[i].bottom = this.height - this.padding;
				this.data[i].center = (this.data[i].left + this.data[i].right) / 2;

				this.drawUpdate();
			}
		} else {
			for(var i = 0; i < this.dataLength; ++i) {
				var sum = this.data[i].values.reduce((x1, x2) => {
					return x1 + x2;
				});

				this.data[i].left = this.padding + this.xLength * (i + 0.25);
				this.data[i].right = this.padding + this.xLength * (i + 0.75);
				this.data[i].center = (this.data[i].left + this.data[i].right) / 2;

				var height = sum * this.yRatio;
				this.data[i].currentHeight = Math.ceil(this.current / 100 * height);

				this.drawUpdate();
			}
		}
	},
	drawUpdate: function() {
		this.ctx.fillStyle = this.bgColor;
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.drawAxis();
		this.drawPoint();
		this.drawTitle();
		if(this.streamGraph == 0) {
			this.drawBar();
		} else {
			this.drawStream();
		}
	},
	drawBar: function() {
		for(var i = 0; i < this.dataLength; i++) {
			var sum = this.data[i].values.reduce((x1, x2) => {
				return x1 + x2;
			});

			var height = this.data[i].bottom - this.data[i].top;
			var s = 0;
			for(var j = 0; height > 0; ++j){
				this.ctx.fillStyle = this.fillColor[j];
				if(height > this.data[i].values[j]){
					s += this.data[i].values[j];
					this.ctx.fillRect(
						this.data[i].left, 
						this.data[i].bottom - s,
						this.data[i].right - this.data[i].left, 
						this.data[i].values[j] * this.yRatio
					);
				} else {
					this.ctx.fillRect(
						this.data[i].left,
						this.data[i].top,
						this.data[i].right - this.data[i].left,
						height
					);
				}
				height -= this.data[i].values[j] * this.yRatio;
			}

			this.ctx.font = '12px Arial'
			this.ctx.fillText(
				sum * this.current / 100,
				this.data[i].left + this.xLength / 4, 
				this.data[i].top - 5
			);
		}
	},

	drawStream: function() {
		var arrs = [];

		var currentHeight = this.data[0].currentHeight;
		for(var i = 0; currentHeight > 0; ++i) {
			var cords = [];

			this.ctx.fillStyle = this.fillColor[i];
			if(currentHeight > this.data[0].values[i] * this.yRatio){
				this.ctx.beginPath();
				this.ctx.moveTo(this.originX, this.originY);
				cords.push({
					x: this.originX,
					y: this.originY
				});

				for(var j = 0; j < this.dataLength; ++j) {
					var sum = 0;
					for(k = 0; k <= i; ++k) {
						sum += this.data[j].values[k];
					}
					var y = this.originY - sum * this.yRatio;
					this.ctx.lineTo(this.data[j].center, y);

					cords.push({
						x: this.data[j].center,
						y: y
					});
				}

				for(var j = this.dataLength - 1; j >= 0; --j) {
					var sum = 0;
					for(k = 0; k < i; ++k) {
						sum += this.data[j].values[k];
					}
					var y = this.originY - sum * this.yRatio;
					this.ctx.lineTo(this.data[j].center, y);
					cords.push({
						x: this.data[j].center,
						y: y
					});
				}

				this.ctx.lineTo(this.originX, this.originY);
				this.ctx.fill();

				cords.push({
					x: this.originX,
					y: this.originY
				});

				arrs.push(cords);

			} else {
				this.ctx.beginPath();
				this.ctx.moveTo(this.originX, this.originY);

				cords.push({
					x: this.originX,
					y: this.originY
				});

				for(var j = 0; j < this.dataLength; ++j) {
					var y = this.originY - this.data[j].currentHeight;
					this.ctx.lineTo(this.data[j].center, y);
					cords.push({
						x: this.data[j].center,
						y: y
					});
				}

				for(var j = this.dataLength - 1; j >= 0; --j) {
					var sum = 0;
					for(k = 0; k < i; ++k) {
						sum += this.data[j].values[k];
					}
					var y = this.originY - sum * this.yRatio;
					this.ctx.lineTo(this.data[j].center, y);
					cords.push({
						x: this.data[j].center,
						y: y
					});
				}

				this.ctx.lineTo(this.originX, this.originY);
				this.ctx.fill();

				cords.push({
					x: this.originX,
					y: this.originY
				});

				arrs.push(cords);
			}
			currentHeight -= this.data[0].values[i] * this.yRatio;
			this.streamPointsArrs = arrs;
		}
	},

	toStream: function() {
		this.streamGraph = 1;
		this.current = 0;
		this.canvas.removeEventListener('mousemove', this.barWatchHoverHandler);
		this.looping();
	},

	toBar: function() {
		this.streamGraph = 0;
		this.current = 0;
		this.canvas.removeEventListener('mousemove', this.streamWatchHoverHandler);
		this.looping();
	},

	changeDataset: function (data) {
		this.data = data;
		this.current = 0;
		this.looping();
	},

	streamWatchHover: function () {
		this.canvas.addEventListener('mousemove', this.streamWatchHoverHandler);
	},

	streamWatchHoverHandler: function (ev) {
		var chart = window.chart;
		for(var i = 0; i < chart.data[0].values.length; ++i) {
			chart.ctx.save();
			chart.ctx.beginPath();
			chart.ctx.moveTo(chart.streamPointsArrs[i][0].x, chart.streamPointsArrs[i][0].y);
			for(var j = 0; j < chart.streamPointsArrs[i].length; ++j) {
				chart.ctx.lineTo(chart.streamPointsArrs[i][j].x, chart.streamPointsArrs[i][j].y);
			}
			if(chart.ctx.isPointInPath(ev.offsetX, ev.offsetY)) {
				chart.ctx.fillStyle = "#FFFF00";
				chart.ctx.fill();

				var sum = 0;
				for(var j = 0; j < chart.dataLength; ++j) {
					sum += chart.data[j].values[i];
				}
				var msg = 'Sum(' + chart.data[0].names[i] + '):' + String(sum);
				popupDiv = document.getElementById('popup_div');
				popupDiv.style.display = 'block';
				popupDiv.style.left = String(ev.clientX + 10) + 'px';
				popupDiv.style.top = String(ev.clientY + 5) + 'px';
				popupDiv.style.position = 'absolute';
				popupDiv.style.background = chart.fillColor[i];
				popupDiv.innerHTML = msg;
				
				if(i in chart.inStream) {
					continue;
				} else {
					chart.inStream.push(i);
				}

			} else {
				chart.ctx.fillStyle = chart.fillColor[i];
				chart.ctx.fill();

				if(i in chart.inStream) {
					var idx = chart.inStream.indexOf(i);
					chart.inStream.splice(idx, 1); 
				}
			}
			console.log(chart.inStream);

			if(chart.inStream.length == 0) {
				popupDiv = document.getElementById('popup_div');
				popupDiv.style.display = 'none';
			}

			chart.ctx.restore()
		}	

	},

	drawAxis: function() {
		this.ctx.beginPath();
		this.ctx.strokeStyle = this.axisColor;
		this.ctx.moveTo(this.padding + 0.5, this.height - this.padding + 0.5);
		this.ctx.lineTo(this.padding + 0.5, this.padding + 0.5);
		this.ctx.moveTo(this.padding + 0.5, this.height - this.padding + 0.5);
		this.ctx.lineTo(this.width - this.padding / 2 + 0.5, this.height - this.padding + 0.5);
		this.ctx.stroke();
	},
	drawPoint: function() {
		this.ctx.beginPath();
		this.ctx.font = '12px Microsoft YaHei';
		this.ctx.textAlign = 'center';
		this.ctx.fillStyle = this.axisColor; 
		for(var i = 0; i < this.dataLength; i ++){
			var xAxis = this.data[i].xAxis;
			var xlen = this.xLength * (i + 1);
			this.ctx.moveTo(this.padding + xlen + 0.5, this.height - this.padding + 0.5);
			this.ctx.lineTo(this.padding + xlen + 0.5, this.height - this.padding + 5.5);
			this.ctx.fillText(xAxis, this.padding + xlen - this.xLength / 2, this.height - this.padding + 15);
		}
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.font = '12px Microsoft YaHei';
		this.ctx.textAlign = 'right';
		this.ctx.fillStyle = this.axisColor;
		this.ctx.moveTo(this.padding + 0.5, this.height - this.padding + 0.5);
		this.ctx.lineTo(this.padding - 4.5, this.height - this.padding + 0.5);
		this.ctx.fillText(0, this.padding - 10, this.height - this.padding + 5);
		for(var i=0; i < this.yEqual; i ++){
			var y = this.yGap * (i + 1);
			var ylen = this.yLength * (i + 1);
			this.ctx.beginPath();
			this.ctx.strokeStyle = this.axisColor;
			this.ctx.moveTo(this.padding + 0.5, this.height - this.padding - ylen + 0.5);
			this.ctx.lineTo(this.padding - 4.5, this.height - this.padding - ylen + 0.5);
			this.ctx.stroke();
			this.ctx.fillText(y,this.padding - 10, this.height - this.padding - ylen + 5);
			this.ctx.beginPath();
			this.ctx.strokeStyle = this.contentColor;
			this.ctx.moveTo(this.padding + 0.5, this.height - this.padding - ylen + 0.5)
			this.ctx.lineTo(this.width - this.padding / 2 + 0.5, this.height - this.padding - ylen+0.5);
			this.ctx.stroke();
		}
	},
	drawTitle: function() {
		if(this.title){
			this.ctx.beginPath();
			this.ctx.textAlign = 'center';
			this.ctx.fillStyle = this.titleColor;
			this.ctx.font = '16px Microsoft YaHei';
			if(this.titlePosition === 'bottom' && this.padding >= 40){
				this.ctx.fillText(this.title, this.width / 2, this.height - 5)
			}else{
				this.ctx.fillText(this.title, this.width / 2, this.padding / 2)
			}
		}
	},

	barWatchHover: function() {
		this.canvas.addEventListener('mousemove', this.barWatchHoverHandler);
	},

	barWatchHoverHandler: function (ev) {
		var chart = window.chart;
		chart.currentIndex = -1;
		for (var i = 0; i < chart.data.length; i ++){
			if( ev.offsetX > chart.data[i].left &&
				ev.offsetX < chart.data[i].right &&
				ev.offsetY > chart.data[i].top &&
				ev.offsetY < chart.data[i].bottom )
			{
				chart.currentIndex = i;
				var height = chart.data[i].bottom - ev.offsetY;
				var idx = -1;
				while (height > 0) {
					idx += 1;
					height -= chart.data[i].values[idx] * chart.yRatio;
				}

				var msg = chart.data[i].names[idx] + ':' + String(chart.data[i].values[idx]);
				popupDiv = document.getElementById('popup_div');
				popupDiv.style.display = 'block';
				popupDiv.style.left = String(ev.clientX + 10) + 'px';
				popupDiv.style.top = String(ev.clientY + 5) + 'px';
				popupDiv.style.position = 'absolute';
				popupDiv.style.background = chart.fillColor[idx];
				popupDiv.innerHTML = msg;
			}
		}
		chart.barDrawHover();
	},

	barDrawHover: function() {

		if(this.currentIndex !== -1){
			if(this.onceMove === -1){
				this.onceMove = this.currentIndex;
				this.canvas.style.cursor = 'pointer';
			}
		}else{
			if(this.onceMove !== -1){
				popupDiv = document.getElementById('popup_div');
				popupDiv.style.display = 'none';
				this.onceMove = -1;
				this.canvas.style.cursor = 'inherit';
			}
		}
	},

	getYGap: function(data) {
		var arr = data.slice(0);
		arr.sort(function(a,b){
			sumA = a.values.reduce((x1, x2) => {
				return x1 + x2;
			});

			sumB = b.values.reduce((x1, x2) => {
				return x1 + x2;
			});

			return -(sumA - sumB);
		});

		var len = Math.ceil(arr[0].values.reduce((x1, x2) => {
			return x1 + x2;
		}) / this.yEqual);

		var pow = len.toString().length - 1;
		pow = pow > 2 ? 2 : pow;
		return Math.ceil(len / Math.pow(10,pow)) * Math.pow(10,pow);
	}
}
