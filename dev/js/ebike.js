function Start(){
	ReDraw();
	document.querySelector("canvas#canvasBatteryDesign").ondblclick = DrawMouseRuler;
}

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

function ReDraw(){
	var canvas = document.querySelector("canvas#canvasBatteryDesign");
	var oPaper = GetOPaper();
	var oMonitor = GetOMonitor();
	
	PrepareCanvas(canvas,oPaper);
	DrawBateryDesign(canvas,oMonitor);
	DrawRuler(canvas,oPaper,oMonitor);
	addDownloadLink(canvas,oPaper,oMonitor);
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

function getClippedRegion(png, x, y, width, height) {
    var clipped = document.createElement('canvas'),
    ctx = clipped.getContext('2d');
    clipped.width = width-x;
    clipped.height = height-y;
    //                   source region         dest. region
    ctx.drawImage(png, x, y, width, height,  0, 0, width, height);
    return clipped;
}

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

function GetDesignUserInput(){
	var table = document.querySelector("table.battery_design");
	var xlimit = parseFloat(table.querySelector("input#inNumberBatteryXLimit").value);
	return {
		"diameter" : parseFloat(table.querySelector("input#inFloatDiameter").value),
		"interSpacing" : parseFloat(table.querySelector("input#inNumberSpacing").value),
		"xFrameOffset" : parseFloat(table.querySelector("input#inNumberOffset").value),
		"batteryXLimit" : isNaN(xlimit) ? Number.MAX_VALUE : xlimit,
		"frameAngle" : parseFloat(table.querySelector("input#inNumberAngle").value),
		"parallelCount" : parseInt(table.querySelector("input#inNumberParallel").value),
		"serialCount" : parseInt(table.querySelector("input#inNumberSerial").value),
	}
}

function GenerateBattery(noParalel,noSeries){
	let battery = [];
	for(var i=0; i<noSeries; i++){
		for(var j=0 ; j<noParalel ; j++){
			let cell = {};
			battery[i][j] = cell;
			/*row, col*/
		}
	}
	return BATTERY;
}

function PrecalcBatteryDesign(params){
	//create battery object
	var battery = GenerateBattery(params.parallelCount,params.serialCount);
	//alias params
	var d = params.diameter,
		s = params.interSpacing,
		xFrameOffset = params.xFrameOffset,
		batteryXLimit = params.batteryXLimit,
		frameAngle = params.frameAngle,
		parallelCount = params.parallelCount,
		serialCount = params.serialCount;
	
	//pre calculation
	var alpha = Math.rad(frameAngle),
		r = d/2,
		rs = r+s,														//radius with spacing
		h0 = rs/Math.tan(alpha/2),										//cell's offset for the first row based on angle
		h1 = 1.7320508*rs+0.866025403;									//height of a single row
		w1 = rs*2,														// width of a single column

	function shift(lineNumber){
		return lineNumber % 2 == 1 ? rs : 0;
	};

	function CalcCellsCenterPoint(row,col){	
		//this is the cell's center Cx and Cy
		var Hx = row*h1+h0,					// to the center
			w = shift(row),					// shift
			w0 = w+(rs*(col+1)),			// cell's offset for the first column based on row oddness
			Wx = w0+(w1*col),				// to the center
			C = {
				"x" : Wx,
				"y"	: Hx
			};								//cells' center point
			return C;
	}
	
	var Px = 0,
		Py = 0;
		
	function isOverlapping(Cx,Cy){
		var CPx = Px - Cx,
			CPy = Py - Cy,
			CP_length = Math.sqrt(Math.pow(CPx,2)+Math.pow(CPy,2)),
			R = Math.sqrt(Math.pow(CP_length,2)-Math.pow(rs,2)),
			Beta = Math.atan(R/rs),
			MC_length = Math.cos(Beta)*rs,
			t = MC_length/CP_length,
			Mx = Cx+t*CPx,
			My = Cy+t*CPy,
			MT_length = Math.sin(Beta)*rs,
			MT2x = -CPy,
			MT2y = CPx,
			MT2_length = math.sqrt(Math.pow(MT2x,2)+Math.pow(MT2y,2)),
			t2 = MT_length/MT2_length,
			MTx = MT2x*t2,
			MTy = MT2y*t2,
			Tx = MTx + Mx,
			Ty = MTy + My,
			Alpha_needed = Math.atan(Tx/Ty);
		return Alpha_needed > alpha;
	}
	
	//Calc battery cells' general row and col positions
	var row = 0,
		col = 0;
	for(var i=0 ; i<battery.length ; i++){
		for(var j=0 ; i<battery[i].length ; j++){
			position = CalcCellsCenterPoint(row,col);
			if(isOverlapping(position.x,position.y)){
				col = 0;
				row++;
			}
			battery[i][j].position = CalcCellsCenterPoint(row,col);
			battery[i][j].isPositive = i % 2 == 0;
		}
	}
	
	//post calculations
	battery.H = row*h1+h0+rs;															//overall batter height
	battery.W = (col+1)*(rs*2)+(col-1)+shift(row);										//overall battery width
	battery.rows = row;
	battery.cols = col;
	
	return battery;
}

function GetDrawingParams(){
	var table = document.querySelector("table.battery_design"),
		oMonitor = GetOPaper(),
		oPaper = GetOPaper();
	var batteryXLimit = parseFloat(table.querySelector("input#inNumberBatteryXLimit").value);
	return {
		"table" : table,
		"oMonitor" : OMonitor,
		"oPaper" : oPaper,
		"canvasContext" : document.getElementById("canvasBatteryDesign").getContext("2d"),
		"screenWidthMM" : parseFloat(document.getElementById("inNumberScreenWidth").value),
		"screenHeightMM" : parseFloat(document.getElementById("inNumberScreenHeight").value),
		"d" : parseFloat(table.querySelector("input#inFloatDiameter").value),
		"voltage" : parseFloat(table.querySelector("input#inFloatVoltage").value),
		"capacity" : parseFloat(table.querySelector("input#inFloatCapacity").value),
		"s" : parseFloat(table.querySelector("input#inNumberSpacing").value),
		"xFrameOffset" : parseFloat(table.querySelector("input#inNumberOffset").value),
		"batteryXLimit" : isNaN(batteryXLimit) ? Number.MAX_VALUE : batteryXLimit,
		"frameAngle" : parseFloat(table.querySelector("input#inNumberAngle").value),
		"parallelCount" : parseInt(table.querySelector("input#inNumberParallel").value),
		"serialCount" : parseInt(table.querySelector("input#inNumberSerial").value),
		"xPPmm" : oMonitor.GetxPPmm(),
		"yPPmm" : oMonitor.GetyPPmm()
	}
}

function Draw(params){
	function GetScreenPosition(battery){
		var positive = true;
		var Hb = H + r;
		var Fb = Math.tan(frameAngle * Math.PI/180)*Hb;	//Frame boundary
	}

	DrawBattery(params);
	DrawRuler(params);
}

function DrawBatery(params){
	function GetScreenPosition(battery){
		var positive = true;
		var Hb = H + r;
		var Fb = Math.tan(frameAngle * Math.PI/180)*Hb;	//Frame boundary
	}

	

	canvasContext.strokeStyle = '#ff0000';
	var parallelCounter = 0;
	var allCells = serialCount * parallelCount;
	
	for(var cell = 0; cell < allCells;){
	
		canvasContext.strokeStyle = positive ? '#ff0000' : '#0000ff';	
		var X = xPPmm * (n * (d + s) - r - s + shiftPX(line));		//X display coordinate for the centre of a battery cell cirlce
		var Y = yPPmm * H;										//Y display coordinate for the centre of a battery cell circle
		var radius = xPPmm*r;//this is wrong!
		canvasContext.arc(X,Y,radius,0,2*Math.PI);
		canvasContext.stroke();
		canvasContext.beginPath();
		if(positive){
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
		n++;
		cell++;
		parallelCounter++; 			
		if(parallelCounter >= parallelCount){
			parallelCounter = 0;
			positive = !positive;	
			canvasContext.strokeStyle = positive ? '#ff0000' : '#0000ff';	
		}
	}
	canvasContext.beginPath();
	canvasContext.moveTo(xFrameOffset*xPPmm, 0);
	var Hb = H + r;
	var Fb = Math.tan(frameAngle * Math.PI/180)*Hb;	//Frame boundary
	canvasContext.strokeStyle = '#000000';
	canvasContext.lineTo((Fb+xFrameOffset)*xPPmm,Hb*yPPmm);	//hypotenuse
	canvasContext.stroke();
	
	canvasContext.beginPath();
	canvasContext.strokeStyle = '#005500';
	canvasContext.moveTo(0, Hb*yPPmm);	//Leg "width"
	var height = maxHeight;
	canvasContext.lineTo(height*xPPmm, Hb*yPPmm);	//Leg "width"
	canvasContext.stroke();
	canvasContext.beginPath();
	canvasContext.moveTo(height*xPPmm, Hb*yPPmm);	//Leg "width"
	canvasContext.lineTo(height*xPPmm, 0);	//Leg "width"
	canvasContext.stroke();
	
	canvasContext.beginPath();
	canvasContext.strokeStyle = '#000000';
	canvasContext.moveTo(batteryXLimit*xPPmm, Hb*yPPmm);	//Battery X Limit
	canvasContext.lineTo(batteryXLimit*xPPmm, 0);	//Leg "width"
	canvasContext.stroke();

	canvasContext.beginPath();
	canvasContext.fillStyle = '#000000';
	canvasContext.font="30px Arial bold";
	canvasContext.fillText("Battery parameters:",400,50);
	canvasContext.fillText("Number of cells: "+serialCount*parallelCount,650,50);
	canvasContext.fillText("Voltage: "+Math.round(voltage*serialCount*10)/10.0+" V",650,80);
	canvasContext.fillText("Capacity: "+Math.round(capacity*parallelCount*10)/10.0+" Ah",650,110);
	canvasContext.fillText("Dimensions:",400,200);
	canvasContext.fillText("height:  " + Math.round(height)/10.0+" cm",650,200);
	canvasContext.fillText("length: " + Math.round(Hb)/10.0+" cm",650,230);
	canvasContext.fillText("hypotenuse: " + Math.round(Math.sqrt(Fb*Fb+Hb*Hb))/10.0+" cm",650,260);
}


function DrawBateryDesign(canvas,oMonitor){

	
	var table = document.querySelector("table.battery_design");
	var canvasContext = document.getElementById("canvasBatteryDesign").getContext("2d");
	var screenWidthMM = parseFloat(document.getElementById("inNumberScreenWidth").value);
	var screenHeightMM = parseFloat(document.getElementById("inNumberScreenHeight").value);
	var d = parseFloat(table.querySelector("input#inFloatDiameter").value);
	var voltage = parseFloat(table.querySelector("input#inFloatVoltage").value);
	var capacity = parseFloat(table.querySelector("input#inFloatCapacity").value);
	var s = parseFloat(table.querySelector("input#inNumberSpacing").value);
	var xFrameOffset = parseFloat(table.querySelector("input#inNumberOffset").value);
	var batteryXLimit = parseFloat(table.querySelector("input#inNumberBatteryXLimit").value);
	batteryXLimit = isNaN(batteryXLimit) ? Number.MAX_VALUE : batteryXLimit;
	var frameAngle = parseFloat(table.querySelector("input#inNumberAngle").value);
	var parallelCount = parseInt(table.querySelector("input#inNumberParallel").value);
	var serialCount = parseInt(table.querySelector("input#inNumberSerial").value);
	var xPPmm = oMonitor.GetxPPmm();
	var yPPmm = oMonitor.GetyPPmm();

	var r = d/2;
	var shiftPX = function(lineNumber){
		return lineNumber % 2 == 1 ? r+s/2 : 0;
	};
	canvasContext.strokeStyle = '#ff0000';
	var parallelCounter = 0;
	var allCells = serialCount * parallelCount;
	var h = 1.7320508*r+0.866025403*s;					//single line hight h
	var W = 0; 											//overall Width for the max battery cell width for a given line number.
	var line = 0;//line number counter
	var Hmin = (d-xFrameOffset)/Math.tan(frameAngle * Math.PI/180);	//min height at which the first cell can be drawn
	Hmin = Hmin < r ? r : Hmin;
	var H = Hmin;											// overall height for a given line number (used only for the max Width W)
	var n = 1;	// cells on a line counter
	var N = 1;											// max cells on a single line
	var Wc = 0;
	var maxHeight = 0;
	var Wcprev = 0;
	var Hb = H + r;
	var positive = true;
	var noCells = [];
	for(var cell = 0; cell < allCells;){
		if(n > N){
			n = 1;
			line++;
			H = line*h + Hmin;
			W = Math.tan(frameAngle * Math.PI/180)*H-shiftPX(line)+xFrameOffset;
			W = Math.min(W,batteryXLimit-shiftPX(line));			//height limit
			N = parseInt((W+s)/(d+s));								//number of cells I can possibly fit on a line
			Wc = N*d+(N-1)*s + shiftPX(line);						//width of the next line
			maxHeight = Wcprev > Wc ? Wcprev : Wc;										//actual max height of the whole battery
			Wcprev = maxHeight;
			/*if(line == 19){
				console.log(line + ": " + W);
				console.log("N: " + N);
				console.log("Wc: " + Wc);
				console.log("MaxHeight: " + maxHeight);
				console.log("Wcprev: " + Wcprev);
			}*/
		}
		canvasContext.strokeStyle = positive ? '#ff0000' : '#0000ff';	
		var X = xPPmm * (n * (d + s) - r - s + shiftPX(line));		//X display coordinate for the centre of a battery cell cirlce
		var Y = yPPmm * H;										//Y display coordinate for the centre of a battery cell circle
		var radius = xPPmm*r;//this is wrong!
		canvasContext.arc(X,Y,radius,0,2*Math.PI);
		canvasContext.stroke();
		canvasContext.beginPath();
		if(positive){
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
		n++;
		cell++;
		parallelCounter++; 			
		if(parallelCounter >= parallelCount){
			parallelCounter = 0;
			positive = !positive;	
			canvasContext.strokeStyle = positive ? '#ff0000' : '#0000ff';	
		}
	}
	canvasContext.beginPath();
	canvasContext.moveTo(xFrameOffset*xPPmm, 0);
	var Hb = H + r;
	var Fb = Math.tan(frameAngle * Math.PI/180)*Hb;	//Frame boundary
	canvasContext.strokeStyle = '#000000';
	canvasContext.lineTo((Fb+xFrameOffset)*xPPmm,Hb*yPPmm);	//hypotenuse
	canvasContext.stroke();
	
	canvasContext.beginPath();
	canvasContext.strokeStyle = '#005500';
	canvasContext.moveTo(0, Hb*yPPmm);	//Leg "width"
	var height = maxHeight;
	canvasContext.lineTo(height*xPPmm, Hb*yPPmm);	//Leg "width"
	canvasContext.stroke();
	canvasContext.beginPath();
	canvasContext.moveTo(height*xPPmm, Hb*yPPmm);	//Leg "width"
	canvasContext.lineTo(height*xPPmm, 0);	//Leg "width"
	canvasContext.stroke();
	
	canvasContext.beginPath();
	canvasContext.strokeStyle = '#000000';
	canvasContext.moveTo(batteryXLimit*xPPmm, Hb*yPPmm);	//Battery X Limit
	canvasContext.lineTo(batteryXLimit*xPPmm, 0);	//Leg "width"
	canvasContext.stroke();

	canvasContext.beginPath();
	canvasContext.fillStyle = '#000000';
	canvasContext.font="30px Arial bold";
	canvasContext.fillText("Battery parameters:",400,50);
	canvasContext.fillText("Number of cells: "+serialCount*parallelCount,650,50);
	canvasContext.fillText("Voltage: "+Math.round(voltage*serialCount*10)/10.0+" V",650,80);
	canvasContext.fillText("Capacity: "+Math.round(capacity*parallelCount*10)/10.0+" Ah",650,110);
	canvasContext.fillText("Dimensions:",400,200);
	canvasContext.fillText("height:  " + Math.round(height)/10.0+" cm",650,200);
	canvasContext.fillText("length: " + Math.round(Hb)/10.0+" cm",650,230);
	canvasContext.fillText("hypotenuse: " + Math.round(Math.sqrt(Fb*Fb+Hb*Hb))/10.0+" cm",650,260);
}

/*
at what hight I'm drawing the circles
what hight I am using to calc the line width?
//
what is the width of one circle?

*/

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

function CalcRPMtoKMH(btn){
	var table = btn.closest(".RPMtoKMH");  
	var selectMaxSpeedUnits = table.querySelector("select#speed");
	var maxSpeedUnitsConversion = selectMaxSpeedUnits.options[selectMaxSpeedUnits.selectedIndex].value;
	var rph = parseInt(table.querySelector("#inputRPM").value)*60; /*[r/h]*/
	var radius_km = (parseFloat(table.querySelector("#inputINCH").value)/2.0)*0.0000254; /**/
	var circumference = 2*Math.PI*radius_km;	/*[km]*/
	var result = circumference*rph*maxSpeedUnitsConversion; 			/*[km/h]*/
	resultInput = table.querySelector("#resultSpeed").innerHTML = Math.round(result*100)/100;
}
function CalcKMHtoRPM(btn){
	var table = btn.closest(".KMHtoRPM");
	var selectMaxSpeedUnits = table.querySelector("select#speed");
	var maxSpeedUnitsConversion = selectMaxSpeedUnits.options[selectMaxSpeedUnits.selectedIndex].value;
	var meters_p_minute = parseFloat(table.querySelector("#inputKMH").value)*(maxSpeedUnitsConversion/60.0); /*[distanceUnits/min]*/
	var radius_m = (parseFloat(table.querySelector("#inputINCH").value)/2.0)*0.0254; /**/
	var circumference = 2*Math.PI*radius_m;	/*[m]*/
	var result = meters_p_minute/circumference; /*[rpm]*/
	resultInput = table.querySelector("#resultRPM").innerHTML = Math.round(result*10)/10.0;
}
