function ReDraw(){
	var canvas = document.querySelector("canvas#canvasBatteryDesign");
	var oPaper = GetOPaper();
	var oMonitor = GetOMonitor();
	
	PrepareCanvas(canvas,oPaper);
	
	var battery = new Battery(canvas,oMonitor).Draw(canvas,oMonitor);
	DrawRuler(canvas,oPaper,oMonitor);
	addDownloadLink(canvas,oPaper,oMonitor);
}

/*Define global objects*/
function OMonitor(screenWidthMM,screenHeightMM){
	var screenWidthMM = screenWidthMM;
	var screenHeightMM = screenHeightMM;
	this.GetxPPmm = function(){
		return screen.width/screenWidthMM;
	}	
	this.GetyPPmm = function(){
		return screen.height/screenHeightMM;
	}
}

function OPaper(paperFormat,printerMargin){
	/*Properties*/
	var format = paperFormat || "A4";
	var printerMargin = printerMargin || 8;
	var paperDefinitions = 
		{A2 : {width : 420,height : 594, quantity: 4},
		 A3 : {width : 420,height : 297, quantity: 2},
		 A4 : {width : 210,height : 297, quantity: 1}};
	this.GetWidth = function(){
		return paperDefinitions[format].width - printerMargin;
	}
	this.GetHeight = function(){
		return paperDefinitions[format].height - printerMargin;
	}	
	this.GetNoPapers = function(){
		return paperDefinitions[format].quantity;
	}
	this.GetSlices = function(){
		var slices = [];
		var qty = this.GetNoPapers();
		var width = qty == 1 ? this.GetWidth() : this.GetWidth() / 2;
		var height = qty == 1 ? this.GetHeight() : this.GetHeight() / 2;
		for(var i=0; i < qty; i++){
			var slice = {};
			slice.x1 = (i%2) * width;
			slice.y1 = i<2 ? 0 : height;
			slice.x2 = (i%2+1) * width;
			slice.y2 = (i<2?1:2) * height;
			slices[slices.length] = slice;
		}
		return slices;
	}
}

function GetOPaper(){
	var selectPaperSize = document.querySelector("select#inNumberPaperSize");
	var paperFormat = selectPaperSize.options[selectPaperSize.selectedIndex].value;
	var inNumberPrinMargin = parseFloat(document.getElementById("inNumberPrinMargin").value);
	return new OPaper(paperFormat,inNumberPrinMargin);
}

function GetOMonitor(){
	var screenWidthMM = parseFloat(document.querySelector("input#inNumberScreenWidth").value);
	var screenHeightMM = parseFloat(document.querySelector("input#inNumberScreenHeight").value);
	return new OMonitor(screenWidthMM,screenHeightMM);
}

/*Helper global functions*/
function getClippedRegion(png, x, y, width, height) {
    var clipped = document.createElement('canvas'),
    ctx = clipped.getContext('2d');
    clipped.width = width-x;
    clipped.height = height-y;
    //                   source region         dest. region
    ctx.drawImage(png, x, y, width, height,  0, 0, width, height);
    return clipped;
}
function addDownloadLink(canvas,oPaper,oMonitor){
	var linksArea = document.getElementById("downloadLinks");
	while (linksArea.firstChild) {
		linksArea.removeChild(linksArea.firstChild);
	}
	var qty = oPaper.GetNoPapers();
	var slices = oPaper.GetSlices();
	var xPPmm = oMonitor.GetxPPmm();
	var yPPmm = oMonitor.GetyPPmm();
	for(var i=0; i < qty; i++){
		var alink = document.createElement("a");
		var x1 = xPPmm*slices[i].x1;
		var y1 = yPPmm*slices[i].y1;
		var x2 = xPPmm*slices[i].x2;
		var y2 = yPPmm*slices[i].y2;
		var pic = getClippedRegion(canvas,x1,y1,x2,y2);
		alink.setAttribute("href",pic.toDataURL('image/png'));
		var name = "A4#" + (i+1) + ".png";
		alink.setAttribute('download', name);
		alink.innerHTML = name;
		linksArea.appendChild(alink);
		linksArea.appendChild(document.createElement("br"));
		
	}
}

/*preparation*/
function PrepareCanvas(canvas,oPaper){
	var xPPmm,yPPmm;
	var screenWidthMM = parseFloat(document.getElementById("inNumberScreenWidth").value);
	var screenHeightMM = parseFloat(document.getElementById("inNumberScreenHeight").value);
	
	xPPmm = screen.width/screenWidthMM;
	yPPmm = screen.height/screenHeightMM;
	//set the canvas size
	var canvasWidth = oPaper.GetWidth();
	var canvasHeight = oPaper.GetHeight();
	
	canvas.width = canvasWidth*xPPmm;
	canvas.height = canvasHeight*yPPmm;
}
/*helper functions*/
function CanvasState(canvas) {
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');
	var stylePaddingLeft,
	stylePaddingTop,
	styleBorderLeft,
	styleBorderTop;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
		this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
		this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
		this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
	}
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;


	this.valid = false; // when set to false, the canvas will redraw everything
	this.shapes = []; // the collection of things to be drawn
	this.dragging = false; // Keep track of when we are dragging
	this.selection = null;
	this.dragoffx = 0; // See mousedown and mousemove events for explanation
	this.dragoffy = 0;

	var myState = this;
	//fixes a problem where double clicking causes text to get selected on the canvas
	canvas.addEventListener('selectstart', function (e) {
		e.preventDefault();
		return false;
	}, false);
}

CanvasState.prototype.clear = function () {
	this.ctx.clearRect(0, 0, this.width, this.height);
}

CanvasState.prototype.getMouse = function (e) {
	var element = this.canvas,
	offsetX = 0,
	offsetY = 0,
	mx,
	my;

	// Compute the total offset
	if (element.offsetParent !== undefined) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
	}

	// Add padding and border style widths to offset
	// Also add the <html> offsets in case there's a position:fixed bar
	offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;

	// We return a simple javascript object (a hash) with x and y defined
	return {
		x: mx,
		y: my
	};
}

/*job*/
function DrawMouseRuler(mouseEvt){
	var canvas = document.getElementById("canvasBatteryDesign");
	var cxt = canvas.getContext("2d");
	var cvState = new CanvasState(canvas);
	var mouse = cvState.getMouse(mouseEvt);
	cvState.clear();
	ReDraw();
	
	cxt.beginPath();
	cxt.strokeStyle = '#005500';
	cxt.moveTo(0, mouse.y);
	cxt.lineTo(mouse.x+15, mouse.y);//horizontal line
	
	cxt.moveTo(mouse.x, 0);
	cxt.lineTo(mouse.x, mouse.y+15);//vertical line
	cxt.stroke();
}

function Battery(canvas,oMonitor){
	/*private property*/
	var battery = [],
		table = document.querySelector("table.battery_design"),
		xPPmm = oMonitor.GetxPPmm(),
		yPPmm = oMonitor.GetyPPmm(),
		d = parseFloat(table.querySelector("input#inFloatDiameter").value),
		s = parseFloat(table.querySelector("input#inNumberSpacing").value),
		frameAngle = parseFloat(table.querySelector("input#inNumberAngle").value),
		parallelCount = parseInt(table.querySelector("input#inNumberParallel").value),
		serialCount = parseInt(table.querySelector("input#inNumberSerial").value);
		
	/*drawing*/
	var canvas = canvas,
		oMonitor = oMonitor,
		canvasContext = canvas.getContext("2d"),
		screenWidthMM = parseFloat(document.getElementById("inNumberScreenWidth").value),
		screenHeightMM = parseFloat(document.getElementById("inNumberScreenHeight").value),
		voltage = parseFloat(table.querySelector("input#inFloatVoltage").value),
		capacity = parseFloat(table.querySelector("input#inFloatCapacity").value);
	
	//pre calculation
	var Px = 0,
		Py = 0,
		alpha = Math.rad(frameAngle),
		r = d/2,
		rs = r+(s/2.0),														//radius with spacing
		l0 = r/Math.tan(alpha/2),										//cell's offset for the first row based on angle
		l1 = rs/Math.tan(Math.rad(30));									//height of a single row
		w1 = rs*2;														// width of a single column
		
	//post calculations
	var L,H = 0,rows,cols,Nl,Ndu_length,Tl,Th,stl,sth,Sux,Suy,Hypo_length;	
	
	function Init(){
		for(var i=0; i<serialCount; i++){
			battery[i] = [];
			for(var j=0 ; j<parallelCount ; j++){
				battery[i][j] = {};
			}
		}
		Precalculate();
	}
	function Precalculate(){
		function CalcCellsPosition(i,j,row,col){	
			//this is the cell's center Cx and Cy
			battery[i][j].row = row;
			battery[i][j].col = col;
			var Lx = row*l1+l0,									// to the center
				h0 = shift(row)+r,										// cell's offset for the first column based on row oddness
				Hx = h0+(w1*col);								// to the center
			battery[i][j].H = col * (rs * 2) + h0 + r;	//current overall battery width (may override the last row)
			battery[i][j].Cx = Hx;
			battery[i][j].Cy = Lx;
		}
		function isOverlapping(i,j){
			let Cx = battery[i][j].Cx,
				Cy = battery[i][j].Cy,
				//vector CP
				CPx = Px - Cx,
				CPy = Py - Cy,
				//|CP| length
				CP_length = Math.sqrt(Math.pow(CPx,2)+Math.pow(CPy,2)),
				Beta = Math.acos(r/CP_length);
			//normalize CP vector and change its length to be 'r'
			let CPx_r_len = (CPx*r)/CP_length,
				CPy_r_len = (CPy*r)/CP_length;
			//Rotate CP by beta to become in fact a CT vector
			CPx = CPx_r_len*Math.cos(Beta)-CPy_r_len*Math.sin(Beta);
			CPy = CPx_r_len*Math.sin(Beta)+CPy_r_len*Math.cos(Beta);
			//Get the point T
			battery[i][j].Tx = CPx + Cx;
			battery[i][j].Ty = CPy + Cy;
			let Alpha_needed = Math.atan(battery[i][j].Tx / battery[i][j].Ty);
			//parseFloat().toFixed(14) removes javascript number inaccuracies when dealing with more then 14 digits
			return parseFloat(Alpha_needed).toFixed(14) > parseFloat(alpha).toFixed(14);
		}
		//Calc battery cells' general row and col positions
		var row = 0,
			col = -1;
		for(var i=0 ; i<battery.length ; i++){
			for(var j=0 ; j<battery[i].length ; j++){
				CalcCellsPosition(i,j,row,++col);
				if(isOverlapping(i,j)){
					col = 0;
					CalcCellsPosition(i,j,++row,col);
				}
				battery[i][j].isPositive = i % 2 == 0;
			}
		}
		function shift(row){
			return row % 2 == 1 ? rs : 0;
		}
		function PostCalculation(){
			var maxCol = 0;
			var maxRow = 0;
			for(var i=0 ; i< battery.length ; i++){
				for(var j=0 ; j< battery[i].length ; j++){
					H = battery[i][j].H > H ? battery[i][j].H : H;
				}
			}				

		}
		//post calculations
		PostCalculation();
		rows = row;
		L = rows*l1+2*rs;																//actual batter height
		cols = col;
		Nl = l0-r;																	//Nuy
		Ndu_length = Math.tan(alpha)*Nl;											//Nux
		Tl = rows*l1+l0+r;															//big triangle lenght
		Th = Math.tan(alpha)*Tl;													//big triangle height
		sth = Th-H;																	//tail triangle height
		stl = sth/Math.tan(alpha);													//small (tail) triangle length
		Sux = H;																	//tail triangle point S on the base - x coordinate
		Suy = Tl-stl;																//tail triangle point S on the base - y coordinate
		Hypo_length = Math.sqrt(Math.pow(Tl-Nl,2)+Math.pow(Th-Ndu_length,2));
	}
	this.Draw = function(){
		_DrawBattery();
		_DrawFrame();
		_DrawDimensionsIndicators();
		_DrawPhysicalElectricalResults();
	}	
	function _DrawBattery(){
		canvasContext.strokeStyle = '#ff0000';		
		for(var i=0 ; i< battery.length ; i++){
			for(var j=0 ; j< battery[i].length ; j++){
				var X = xPPmm * battery[i][j].Cx;		
				var Y = yPPmm * battery[i][j].Cy;
				canvasContext.strokeStyle = battery[i][j].isPositive ? '#ff0000' : '#0000ff';	
				var radius = xPPmm*r;
				canvasContext.arc(X,Y,radius,0,2*Math.PI);
				canvasContext.stroke();
				canvasContext.beginPath();
				if(battery[i][j].isPositive){
					canvasContext.strokeStyle = '#555555';
					canvasContext.moveTo(X+radius-3,Y);
					canvasContext.arc(X,Y,radius-3,0,2*Math.PI);
					canvasContext.stroke();
					canvasContext.beginPath();
				}	
				/*cross*/
				canvasContext.moveTo(X-5,Y);
				canvasContext.lineTo(X+5,Y);
				canvasContext.moveTo(X,Y-5);
				canvasContext.lineTo(X,Y+5);
				canvasContext.stroke();
				canvasContext.beginPath();
			}
		}
	}
	function _DrawPhysicalElectricalResults(){
		canvasContext.beginPath();
		canvasContext.fillStyle = '#000000';
		canvasContext.font="20px Arial bold";
		canvasContext.fillText("Number of cells needed: "+serialCount*parallelCount,650,50);
		canvasContext.fillText("Voltage: "+Math.round(voltage*serialCount*10)/10.0+" V",650,80);
		canvasContext.fillText("Capacity: "+Math.round(capacity*parallelCount*10)/10.0+" Ah",650,110);
	}
	function _DrawDimensionsIndicators(){
		let offset = 4;
		canvasContext.font="20px Arial bold";
		//Beak
		canvasContext.fillText(Math.round(Ndu_length*10)/100.0+" cm",(Ndu_length/2)*xPPmm,(Nl - offset)*yPPmm);
		canvasContext.stroke();
		//Height
		canvasContext.fillText(Math.round(Th*10)/100.0+" cm",(Th/2)*xPPmm,(Tl + offset)*yPPmm);
		canvasContext.stroke();
		//Length
		//canvasContext.rotate(Math.PI/2);
		canvasContext.fillText(Math.round(L*10)/100.0+" cm",offset,(Tl+offset)*yPPmm);
		//canvasContext.rotate(-Math.PI/2);
		//Hypotenuse
		canvasContext.stroke();
		middle_x = (Sux-Ndu_length)/2;
		middle_y = (Suy-Nl)/2;
		canvasContext.fillText(Math.round(Hypo_length*10)/100.0+" cm",(middle_x+offset)*xPPmm,(middle_y-offset)*yPPmm);
	}
	function _DrawFrame(){
		//draw battery close boundary - base (hypotenuse)
		canvasContext.beginPath();
		canvasContext.strokeStyle = '#000000';
		canvasContext.moveTo(Ndu_length*xPPmm, Nl*yPPmm);
		canvasContext.lineTo(Th*xPPmm,Tl*yPPmm);
		canvasContext.stroke();
		
		//Draw battery close boundary - back
		canvasContext.beginPath();
		canvasContext.strokeStyle = '#005500';
		canvasContext.moveTo(0, Tl*yPPmm);	
		canvasContext.lineTo(Th*xPPmm, Tl*yPPmm);	
		canvasContext.stroke();
		
		//Draw battery close boundary - front cut (beak triangle)
		canvasContext.beginPath();
		canvasContext.moveTo(0, Nl*yPPmm);	
		canvasContext.lineTo(Ndu_length*xPPmm, Nl*yPPmm);
		canvasContext.stroke();
		
		//Draw battery close boundary - height indicator
		canvasContext.strokeStyle = '#555555';
		canvasContext.lineWidth  = "0.5";
		canvasContext.setLineDash([5, 20]);
		canvasContext.beginPath();
		canvasContext.moveTo(Th*xPPmm, 0);		
		canvasContext.lineTo(Th*xPPmm, Tl*yPPmm);
		canvasContext.stroke();
	}
	Init();
	return this;
}

function DrawRuler(canvas,oPaper,oMonitor){
	var canvas = document.querySelector("canvas#canvasBatteryDesign");
	var canvasWidth = oPaper.GetWidth();
	var canvasHeight = oPaper.GetHeight();
	var xPPmm = oMonitor.GetxPPmm();
	var yPPmm = oMonitor.GetyPPmm();
	var ctx = canvas.getContext("2d");
	ctx.font="10px Arial";
	for(var i=0;i<canvasWidth;i++){
		ctx.fillStyle = '#000000';
		var m = i%1000==0;
		var dm = i%100==0;
		var cm = i%10==0;
		var mm5 = i%5 == 0;
		var x1,x2;
		var y1,y2;
		var number;
		ctx.beginPath();
		if(m){
			
		}else{
			if(dm){
				ctx.fillStyle = '#ff0000';
				x1 = i*xPPmm;
				y1 = 0;
				x2 = i*xPPmm;
				y2 = 10;
				ctx.fillText(Math.floor(i/10),i*xPPmm-6,15);
			}else{
				if(cm){
					x1 = i*xPPmm;
					y1 = 0;
					x2 = i*xPPmm;
					y2 = 10;
					ctx.fillText((i/10)%10,i*xPPmm-3,10);
				}else{
					if(mm5){
						x1 = i*xPPmm;
						y1 = 0;
						x2 = i*xPPmm;
						y2 = 7;
					}else{
						x1 = i*xPPmm;
						y1 = 0;
						x2 = i*xPPmm;
						y2 = 3;
					}
				}
			}
		}
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}
	for(var i=0;i<canvasHeight;i++){
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = '#000000';
		var m = i%1000==0;
		var dm = i%100==0;
		var cm = i%10==0;
		var mm5 = i%5 == 0;
		var x1,x2;
		var y1,y2;
		var number;
		ctx.beginPath();
		if(m){
			
		}else{
			if(dm){
				ctx.fillStyle = '#ff0000';
				x1 = 0;
				y1 = i*yPPmm;
				x2 = 10;
				y2 = i*yPPmm;
				ctx.fillText(Math.floor(i/10),12,i*yPPmm+3);
			}else{
				if(cm){
					x1 = 0;
					y1 = i*yPPmm;
					x2 = 10;
					y2 = i*yPPmm;
					ctx.fillText((i/10)%10,7,i*yPPmm+3);
				}else{
					if(mm5){
						x1 = 0;
						y1 = i*yPPmm;
						x2 = 7;
						y2 = i*yPPmm;
					}else{
						x1 = 0;
						y1 = i*yPPmm;
						x2 = 3;
						y2 = i*yPPmm;
					}
				}
			}
		}
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}
}