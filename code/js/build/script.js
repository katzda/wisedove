"use strict";
'';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function ReDraw() {
    var canvas = new Canvas();
    var battery = new Battery();
    var ruler = new Ruler();
    new MetalCase(battery);
    battery.Draw(canvas);
    ruler.Draw(canvas);
    var linksArea = document.getElementById("downloadLinks");
    while (linksArea.firstChild) {
        linksArea.removeChild(linksArea.firstChild);
    }
}
var Battery = /** @class */ (function () {
    function Battery() {
        //pre calculation
        this.Px = 0;
        this.Py = 0;
        this.alpha = Math.rad(this.frameAngle);
        this.r = this.d / 2;
        this.rs = this.r + (this.s / 2.0); //radius with spacing
        this.l0 = this.r / Math.tan(this.alpha / 2); //cell's offset for the first row based on angle
        this.l1 = this.rs / Math.tan(Math.rad(30)); //height of a single row
        this.w1 = this.rs * 2; // width of a single column
        this.H = 0;
        var table = document.querySelector("table.battery_design");
        this.d = parseFloat(table.querySelector("input#inFloatDiameter").value);
        this.s = parseFloat(table.querySelector("input#inNumberSpacing").value);
        this.frameAngle = parseFloat(table.querySelector("input#inNumberAngle").value);
        this.parallelCount = parseInt(table.querySelector("input#inNumberParallel").value);
        this.serialCount = parseInt(table.querySelector("input#inNumberSerial").value);
        /*drawing*/
        this.screenWidthMM = parseFloat(document.getElementById("inNumberScreenWidth").value);
        this.screenHeightMM = parseFloat(document.getElementById("inNumberScreenHeight").value);
        this.voltage = parseFloat(table.querySelector("input#inFloatVoltage").value);
        this.capacity = parseFloat(table.querySelector("input#inFloatCapacity").value);
        this.Init();
    }
    Battery.prototype.Init = function () {
        this.Px = 0;
        this.Py = 0;
        this.alpha = Math.rad(this.frameAngle);
        this.r = this.d / 2;
        this.rs = this.r + (this.s / 2.0); //radius with spacing
        this.l0 = this.r / Math.tan(this.alpha / 2); //cell's offset for the first row based on angle
        this.l1 = this.rs / Math.tan(Math.rad(30)); //height of a single row
        this.w1 = this.rs * 2;
        this.battery = []; // width of a single column
        for (var i = 0; i < this.serialCount; i++) {
            this.battery[i] = [];
            for (var j = 0; j < this.parallelCount; j++) {
                this.battery[i][j] = {};
            }
        }
        this.Precalculate();
    };
    Battery.prototype.CalcCellsPosition = function (i, j, row, col) {
        //this is the cell's center Cx and Cy
        this.battery[i][j].row = row;
        this.battery[i][j].col = col;
        var Lx = row * this.l1 + this.l0, // to the center
        h0 = this.shift(row) + this.r, // cell's offset for the first column based on row oddness
        Hx = h0 + (this.w1 * col); // to the center
        this.battery[i][j].H = col * (this.rs * 2) + h0 + this.r; //current overall battery width (may override the last row)
        this.battery[i][j].Cx = Hx;
        this.battery[i][j].Cy = Lx;
    };
    Battery.prototype.isOverlapping = function (i, j) {
        var Cx = this.battery[i][j].Cx, Cy = this.battery[i][j].Cy, 
        //vector CP
        CPx = this.Px - Cx, CPy = this.Py - Cy, 
        //|CP| length
        CP_length = Math.sqrt(Math.pow(CPx, 2) + Math.pow(CPy, 2)), Beta = Math.acos(this.r / CP_length);
        //normalize CP vector and change its length to be 'r'
        var CPx_r_len = (CPx * this.r) / CP_length, CPy_r_len = (CPy * this.r) / CP_length;
        //Rotate CP by beta to become in fact a CT vector
        CPx = CPx_r_len * Math.cos(Beta) - CPy_r_len * Math.sin(Beta);
        CPy = CPx_r_len * Math.sin(Beta) + CPy_r_len * Math.cos(Beta);
        //Get the point T
        this.battery[i][j].Tx = CPx + Cx;
        this.battery[i][j].Ty = CPy + Cy;
        var Alpha_needed = Math.atan(this.battery[i][j].Tx / this.battery[i][j].Ty);
        //parseFloat().toFixed(14) removes javascript number inaccuracies when dealing with more then 14 digits
        return parseFloat(Alpha_needed).toFixed(14) > parseFloat(this.alpha).toFixed(14);
    };
    Battery.prototype.shift = function (row) {
        return row % 2 == 1 ? this.rs : 0;
    };
    Battery.prototype.PostCalculation = function () {
        var maxCol = 0;
        var maxRow = 0;
        for (var i = 0; i < this.battery.length; i++) {
            for (var j = 0; j < this.battery[i].length; j++) {
                this.H = this.battery[i][j].H > this.H ? this.battery[i][j].H : this.H;
            }
        }
    };
    Battery.prototype.Precalculate = function () {
        //Calc battery cells' general row and col positions
        var row = 0, col = -1;
        for (var i = 0; i < this.battery.length; i++) {
            for (var j = 0; j < this.battery[i].length; j++) {
                this.CalcCellsPosition(i, j, row, ++col);
                if (this.isOverlapping(i, j)) {
                    col = 0;
                    this.CalcCellsPosition(i, j, ++row, col);
                }
                this.battery[i][j].isPositive = i % 2 == 0;
            }
        }
        //post calculations
        this.PostCalculation();
        this.rows = row;
        this.L = this.rows * this.l1 + 2 * this.rs; //actual batter height
        this.cols = col;
        this.Nl = this.l0 - this.r; //Nuy
        this.Ndu_length = Math.tan(this.alpha) * this.Nl; //Nux
        this.Tl = this.rows * this.l1 + this.l0 + this.r; //big triangle lenght
        this.Th = Math.tan(this.alpha) * this.Tl; //big triangle height
        this.sth = this.Th - this.H; //tail triangle height
        this.stl = this.sth / Math.tan(this.alpha); //small (tail) triangle length
        this.Sux = this.H; //tail triangle point S on the base - x coordinate
        this.Suy = this.Tl - this.stl; //tail triangle point S on the base - y coordinate
        this.Hypo_length = Math.sqrt(Math.pow(this.Tl - this.Nl, 2) + Math.pow(this.Th - this.Ndu_length, 2));
    };
    Battery.prototype._UpdateCaseModel = function () {
    };
    Battery.prototype.Draw = function (canvas) {
        this._UpdateCaseModel();
        this._DrawBattery(canvas);
        this._DrawFrame(canvas);
        this._DrawDimensionsIndicators(canvas);
        this._DrawPhysicalElectricalResults(canvas);
    };
    Battery.prototype._DrawBattery = function (canvas) {
        var canvasContext = canvas.getContext2d(), xPPmm = canvas.GetxPPmm(), yPPmm = canvas.GetxPPmm();
        canvasContext.strokeStyle = '#ff0000';
        for (var i = 0; i < this.battery.length; i++) {
            for (var j = 0; j < this.battery[i].length; j++) {
                var X = xPPmm * this.battery[i][j].Cx;
                var Y = yPPmm * this.battery[i][j].Cy;
                canvasContext.strokeStyle = this.battery[i][j].isPositive ? '#ff0000' : '#0000ff';
                var radius = xPPmm * this.r;
                canvasContext.beginPath();
                canvasContext.arc(X, Y, radius, 0, 2 * Math.PI);
                canvasContext.stroke();
                canvasContext.beginPath();
                if (this.battery[i][j].isPositive) {
                    canvasContext.strokeStyle = '#555555';
                    canvasContext.moveTo(X + radius - 3, Y);
                    canvasContext.arc(X, Y, radius - 3, 0, 2 * Math.PI);
                    canvasContext.stroke();
                    canvasContext.beginPath();
                }
                /*cross*/
                canvasContext.moveTo(X - 5, Y);
                canvasContext.lineTo(X + 5, Y);
                canvasContext.moveTo(X, Y - 5);
                canvasContext.lineTo(X, Y + 5);
                canvasContext.stroke();
                canvasContext.beginPath();
            }
        }
    };
    Battery.prototype._DrawPhysicalElectricalResults = function (canvas) {
        var canvasContext = canvas.getContext2d();
        canvasContext.beginPath();
        canvasContext.fillStyle = '#000000';
        canvasContext.font = "20px Arial bold";
        canvasContext.fillText("Number of cells needed: " + this.serialCount * this.parallelCount, 650, 50);
        canvasContext.fillText("Voltage: " + Math.round(this.voltage * this.serialCount * 10) / 10.0 + " V", 650, 80);
        canvasContext.fillText("Capacity: " + Math.round(this.capacity * this.parallelCount * 10) / 10.0 + " Ah", 650, 110);
    };
    Battery.prototype._DrawDimensionsIndicators = function (canvas) {
        var canvasContext = canvas.getContext2d(), xPPmm = canvas.GetxPPmm(), yPPmm = canvas.GetxPPmm();
        var offset = 4;
        canvasContext.font = "20px Arial bold";
        //Beak
        canvasContext.fillText(Math.round(this.Ndu_length * 10) / 100.0 + " cm", (this.Ndu_length / 2) * xPPmm, (this.Nl - offset) * yPPmm);
        canvasContext.stroke();
        //Height
        canvasContext.fillText(Math.round(this.Th * 10) / 100.0 + " cm", (this.Th / 2) * xPPmm, (this.Tl + offset) * yPPmm);
        canvasContext.stroke();
        //Length
        //canvasContext.rotate(Math.PI/2);
        canvasContext.fillText(Math.round(this.L * 10) / 100.0 + " cm", offset, (this.Tl + offset) * yPPmm);
        //canvasContext.rotate(-Math.PI/2);
        //Hypotenuse
        canvasContext.stroke();
        var middle_x = (this.Sux - this.Ndu_length) / 2;
        var middle_y = (this.Suy - this.Nl) / 2;
        canvasContext.fillText(Math.round(this.Hypo_length * 10) / 100.0 + " cm", (middle_x + offset) * xPPmm, (middle_y - offset) * yPPmm);
    };
    Battery.prototype._DrawFrame = function (canvas) {
        var canvasContext = canvas.getContext2d(), xPPmm = canvas.GetxPPmm(), yPPmm = canvas.GetxPPmm();
        //draw battery close boundary - base (hypotenuse)
        canvasContext.beginPath();
        canvasContext.strokeStyle = '#000000';
        canvasContext.moveTo(this.Ndu_length * xPPmm, this.Nl * yPPmm);
        canvasContext.lineTo(this.Th * xPPmm, this.Tl * yPPmm);
        canvasContext.stroke();
        //Draw battery close boundary - back
        canvasContext.beginPath();
        canvasContext.strokeStyle = '#005500';
        canvasContext.moveTo(0, this.Tl * yPPmm);
        canvasContext.lineTo(this.Th * xPPmm, this.Tl * yPPmm);
        canvasContext.stroke();
        //Draw battery close boundary - front cut (beak triangle)
        canvasContext.beginPath();
        canvasContext.moveTo(0, this.Nl * yPPmm);
        canvasContext.lineTo(this.Ndu_length * xPPmm, this.Nl * yPPmm);
        canvasContext.stroke();
        //Draw battery close boundary - height indicator
        canvasContext.strokeStyle = '#555555';
        canvasContext.lineWidth = parseFloat("0.5");
        canvasContext.setLineDash([5, 20]);
        canvasContext.beginPath();
        canvasContext.moveTo(this.Th * xPPmm, 0);
        canvasContext.lineTo(this.Th * xPPmm, this.Tl * yPPmm);
        canvasContext.stroke();
    };
    return Battery;
}());
var Canvas = /** @class */ (function () {
    function Canvas() {
        this.paperDefinitions = {
            "A2": { width: 420, height: 594, quantity: 4 },
            "A3": { width: 420, height: 297, quantity: 2 },
            "A4": { width: 210, height: 297, quantity: 1 }
        };
        this.canvas = document.getElementById("canvasBatteryDesign");
        this.ctx_2d = this.getContext2d();
        this.inputNoPrintMargin = document.getElementById("inNumberPrinMargin");
        this.screenWidthMM = parseFloat(document.querySelector("input#inNumberScreenWidth").value);
        this.screenHeightMM = parseFloat(document.querySelector("input#inNumberScreenHeight").value);
        var selectOptions = document.querySelector("select#inNumberPaperSize").options;
        this.paperFormat = (selectOptions)[selectOptions.selectedIndex].value || "A4";
        this.printerMargin = parseFloat(this.inputNoPrintMargin.value) || 8;
        //fixes a problem where double clicking causes text to get selected on the canvas
        this.canvas.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        }, false);
        this.Prepare();
    }
    /*preparation*/
    Canvas.prototype.Prepare = function () {
        var xPPmm = this.GetxPPmm(), yPPmm = this.GetyPPmm();
        //set the canvas size
        var canvasWidth = this.GetWidth();
        var canvasHeight = this.GetHeight();
        this.canvas.width = canvasWidth * xPPmm;
        this.canvas.height = canvasHeight * yPPmm;
    };
    Canvas.prototype.GetxPPmm = function () {
        return screen.width / this.screenWidthMM;
    };
    Canvas.prototype.GetyPPmm = function () {
        return screen.height / this.screenHeightMM;
    };
    Canvas.prototype.GetWidth = function () {
        return this.paperDefinitions[this.paperFormat].width - this.printerMargin;
    };
    Canvas.prototype.GetHeight = function () {
        return this.paperDefinitions[this.paperFormat].height - this.printerMargin;
    };
    Canvas.prototype.getContext2d = function () {
        if (this.ctx_2d == null) {
            this.ctx_2d = this.canvas.getContext("2d");
        }
        return this.ctx_2d;
    };
    Canvas.prototype.getClippedRegion = function (png, x, y, width, height) {
        var clipped = document.createElement('canvas'), ctx = clipped.getContext('2d');
        clipped.width = width - x;
        clipped.height = height - y;
        ctx.drawImage(png, x, y, width, height, 0, 0, width, height);
        return clipped;
    };
    Canvas.prototype.GetNoPapers = function () {
        return this.paperDefinitions[this.paperFormat].quantity;
    };
    Canvas.prototype.GetSlices = function () {
        var slices = [];
        var qty = this.GetNoPapers();
        var width = qty == 1 ? this.GetWidth() : this.GetWidth() / 2;
        var height = qty == 1 ? this.GetHeight() : this.GetHeight() / 2;
        for (var i = 0; i < qty; i++) {
            var slice = {
                x1: (i % 2) * width,
                y1: i < 2 ? 0 : height,
                x2: (i % 2 + 1) * width,
                y2: (i < 2 ? 1 : 2) * height
            };
            slices[slices.length] = slice;
        }
        return slices;
    };
    Canvas.prototype.getDownloadLinks = function () {
        var links = [];
        var qty = this.GetNoPapers();
        var slices = this.GetSlices();
        var xPPmm = this.GetxPPmm();
        var yPPmm = this.GetyPPmm();
        for (var i = 0; i < qty; i++) {
            var alink = document.createElement("a");
            var x1 = xPPmm * slices[i].x1;
            var y1 = yPPmm * slices[i].y1;
            var x2 = xPPmm * slices[i].x2;
            var y2 = yPPmm * slices[i].y2;
            var pic = this.getClippedRegion(this.canvas, x1, y1, x2, y2);
            alink.setAttribute("href", pic.toDataURL('image/png'));
            var name_1 = "A4#" + (i + 1) + ".png";
            alink.setAttribute('download', name_1);
            alink.innerHTML = name_1;
            links.push(alink);
        }
        return links;
    };
    Canvas.prototype.Draw = function () {
    };
    Canvas.prototype.clear = function () {
        this.getContext2d().clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return Canvas;
}());
var MetalCase = /** @class */ (function () {
    function MetalCase(battery) {
        this.store = {
            pixlesPerDegree: 10,
            Alpha: 0,
            Beta: 0,
            shiftX: 0,
            shiftY: 0,
            scale: 1,
            mouseStartPositionX: 0,
            mouseStartPositionY: 0,
            mouseStopPositionX: 0,
            mouseStopPositionY: 0,
            isShiftDown: false,
            isLeftMouseDown: false,
            sowModel: false,
        };
        this.battery = battery;
        this.elem = document.querySelector(".metal-case");
        this.Precalculate();
    }
    MetalCase.prototype.SetShow = function (show) {
        if (show) {
            this.elem.classList.remove("hidden");
        }
        else {
            this.elem.classList.add("hidden");
        }
    };
    MetalCase.prototype.Drag = function (e) {
        this._Rotate(this.GetShift(e));
    };
    MetalCase.prototype.MouseClick_UP = function (e) {
        if (Mouse.GetInstance(e).GetButton() == "left") {
            var SHIFT = this.GetShift(e);
            if (this.store.isShiftDown) {
                this.store.shiftX += SHIFT.x;
                this.store.shiftY += SHIFT.y;
            }
            else {
                this.store.Alpha += SHIFT.y / this.store.pixlesPerDegree,
                    this.store.Beta += SHIFT.x / this.store.pixlesPerDegree;
            }
            this._Rotate(SHIFT);
        }
    };
    MetalCase.prototype.MouseClick_DOWN = function (e) {
        if (Mouse.GetInstance(e).GetButton() == "left") {
            this.store.isLeftMouseDown = true;
            this.store.mouseStartPositionX = e.pageX;
            this.store.mouseStartPositionY = e.pageY;
            this.store.mouseStopPositionX = e.pageX;
            this.store.mouseStopPositionY = e.pageY;
        }
    };
    MetalCase.prototype.ShiftKEY_DOWN = function () {
        this.store.isShiftDown = true;
        this._Rotate(this.GetShift());
    };
    MetalCase.prototype.ShiftKEY_UP = function () {
        this.store.isShiftDown = false;
        this._Rotate(this.GetShift());
    };
    /* Private functions */
    MetalCase.prototype.Precalculate = function () {
    };
    MetalCase.prototype.GetShift = function (e) {
        if (e != null) {
            this.store.mouseStopPositionX = e.pageX;
            this.store.mouseStopPositionY = e.pageY;
        }
        return {
            x: this.store.mouseStartPositionX - this.store.mouseStopPositionX,
            y: this.store.mouseStartPositionY - this.store.mouseStopPositionY
        };
    };
    MetalCase.prototype._Rotate = function (SHIFT) {
        var A, B, translateX, translateY;
        if (this.store.isShiftDown) {
            A = this.store.Alpha;
            B = this.store.Beta;
            translateX = this.store.shiftX + SHIFT.x;
            translateY = this.store.shiftY + SHIFT.y;
        }
        else {
            A = this.store.Alpha + (SHIFT.y / this.store.pixlesPerDegree);
            B = this.store.Beta + (SHIFT.x / this.store.pixlesPerDegree);
            translateX = this.store.shiftX;
            translateY = this.store.shiftY;
        }
        var M = Array.Matrix([[Math.cos(B), 0, Math.sin(B), 0],
            [Math.sin(A) * Math.sin(B), Math.cos(A), -Math.sin(A) * Math.cos(B), 0],
            [-Math.cos(A) * Math.sin(B), Math.sin(A), Math.cos(A) * Math.cos(B), 0],
            [translateX, translateY, 0, this.store.scale]]);
        this.elem.style.transform = "translate3d(" + M.toString() + ")";
    };
    return MetalCase;
}());
var Mouse = /** @class */ (function () {
    function Mouse() {
        Mouse.instance = null;
        this.event = null;
        this.isEarlierOrIE8 = document.getElementsByTagName("html")[0].classList.contains("lt-ie9");
    }
    Object.defineProperty(Mouse.prototype, "x", {
        get: function () {
            return this.GetPosition().x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Mouse.prototype, "y", {
        get: function () {
            return this.GetPosition().y;
        },
        enumerable: true,
        configurable: true
    });
    Mouse.prototype.GetPosition = function () {
        this.event = this.event;
        var element = this.event.target, offsetX = 0, offsetY = 0, mx, my;
        assertTrue(element != null, "When I clicked, why do I get event.target null?");
        // Compute the total offset
        var html = document.body.parentNode;
        var htmlTop = html.offsetTop, htmlLeft = html.offsetLeft, stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(element, null)['paddingLeft'], 10) || 0, stylePaddingTop = parseInt(document.defaultView.getComputedStyle(element, null)['paddingTop'], 10) || 0, styleBorderLeft = parseInt(document.defaultView.getComputedStyle(element, null)['borderLeftWidth'], 10) || 0, styleBorderTop = parseInt(document.defaultView.getComputedStyle(element, null)['borderTopWidth'], 10) || 0;
        offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
        offsetY += stylePaddingTop + styleBorderTop + htmlTop;
        while ((element = element.offsetParent)) {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        }
        mx = this.event.pageX - offsetX;
        my = this.event.pageY - offsetY;
        return {
            x: mx,
            y: my
        };
    };
    Mouse.GetInstance = function (mouseEvent) {
        if (Mouse.instance == null) {
            Mouse.instance = new Mouse();
        }
        Mouse.instance.event = mouseEvent;
        return Mouse.instance;
    };
    Mouse.prototype.GetButton = function () {
        var button = null;
        if (this.isEarlierOrIE8) {
            switch (this.event.button) {
                case 1: {
                    button = "left";
                    break;
                }
                case 2: {
                    button = "right";
                    break;
                }
                case 4: {
                    button = "wheel";
                    break;
                }
            }
        }
        else {
            switch (this.event.button) {
                case 0: {
                    button = "left";
                    break;
                }
                case 1: {
                    button = "right";
                    break;
                }
                case 2: {
                    button = "wheel";
                    break;
                }
            }
        }
        if (button == null) {
            throw "Incorrect handling of mouse event!";
        }
        else {
            return button;
        }
    };
    Mouse.prototype.GetTarget = function () {
        return this.event.target;
    };
    return Mouse;
}());
var Ruler = /** @class */ (function () {
    function Ruler() {
    }
    Ruler.prototype.DrawMouseRuler = function (canvas, event) {
        var cxt = canvas.getContext2d();
        canvas.clear();
        var mouse = Mouse.GetInstance(event);
        ReDraw();
        cxt.beginPath();
        cxt.strokeStyle = '#005500';
        cxt.moveTo(0, mouse.y);
        cxt.lineTo(mouse.x + 15, mouse.y); //horizontal line
        cxt.moveTo(mouse.x, 0);
        cxt.lineTo(mouse.x, mouse.y + 15); //vertical line
        cxt.stroke();
    };
    Ruler.prototype.Draw = function (canvas) {
        var canvasWidth = canvas.GetWidth();
        var canvasHeight = canvas.GetHeight();
        var xPPmm = canvas.GetxPPmm();
        var yPPmm = canvas.GetyPPmm();
        var ctx = canvas.getContext2d();
        ctx.font = "10px Arial";
        for (var i = 0; i < canvasWidth; i++) {
            ctx.fillStyle = '#000000';
            var m = i % 1000 == 0;
            var dm = i % 100 == 0;
            var cm = i % 10 == 0;
            var mm5 = i % 5 == 0;
            var x1 = void 0, x2 = void 0;
            var y1 = void 0, y2 = void 0;
            var number = void 0;
            ctx.beginPath();
            if (m) {
            }
            else {
                if (dm) {
                    ctx.fillStyle = '#ff0000';
                    x1 = i * xPPmm;
                    y1 = 0;
                    x2 = i * xPPmm;
                    y2 = 10;
                    ctx.fillText(Math.floor(i / 10), i * xPPmm - 6, 15);
                }
                else {
                    if (cm) {
                        x1 = i * xPPmm;
                        y1 = 0;
                        x2 = i * xPPmm;
                        y2 = 10;
                        ctx.fillText((i / 10) % 10, i * xPPmm - 3, 10);
                    }
                    else {
                        if (mm5) {
                            x1 = i * xPPmm;
                            y1 = 0;
                            x2 = i * xPPmm;
                            y2 = 7;
                        }
                        else {
                            x1 = i * xPPmm;
                            y1 = 0;
                            x2 = i * xPPmm;
                            y2 = 3;
                        }
                    }
                }
            }
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        for (var i = 0; i < canvasHeight; i++) {
            var ctx_1 = canvas.getContext2d();
            ctx_1.fillStyle = '#000000';
            var m = i % 1000 == 0;
            var dm = i % 100 == 0;
            var cm = i % 10 == 0;
            var mm5 = i % 5 == 0;
            var x1 = void 0, x2 = void 0;
            var y1 = void 0, y2 = void 0;
            var number = void 0;
            ctx_1.beginPath();
            if (m) {
            }
            else {
                if (dm) {
                    ctx_1.fillStyle = '#ff0000';
                    x1 = 0;
                    y1 = i * yPPmm;
                    x2 = 10;
                    y2 = i * yPPmm;
                    ctx_1.fillText(Math.floor(i / 10), 12, i * yPPmm + 3);
                }
                else {
                    if (cm) {
                        x1 = 0;
                        y1 = i * yPPmm;
                        x2 = 10;
                        y2 = i * yPPmm;
                        ctx_1.fillText((i / 10) % 10, 7, i * yPPmm + 3);
                    }
                    else {
                        if (mm5) {
                            x1 = 0;
                            y1 = i * yPPmm;
                            x2 = 7;
                            y2 = i * yPPmm;
                        }
                        else {
                            x1 = 0;
                            y1 = i * yPPmm;
                            x2 = 3;
                            y2 = i * yPPmm;
                        }
                    }
                }
            }
            ctx_1.moveTo(x1, y1);
            ctx_1.lineTo(x2, y2);
            ctx_1.stroke();
        }
    };
    return Ruler;
}());
var MySceneryHandler = /** @class */ (function () {
    function MySceneryHandler(canvas) {
        this.canvas = canvas;
    }
    MySceneryHandler.prototype.mouseDown = function () {
    };
    MySceneryHandler.prototype.mouseUp = function () {
    };
    MySceneryHandler.prototype.mouseDrag = function () {
    };
    return MySceneryHandler;
}());
function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}
function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}
Math.__proto__.rad = function (degrees) {
    return degrees * (Math.PI / 180);
};
HTMLElement.prototype.InsertSort = function (elem, indexOf) {
    if (this.childElementCount == 0) {
        this.appendChild(elem);
    }
    else {
        var index = indexOf(elem);
        for (var i = 0; i + 1 < this.childElementCount; i++) {
            var current = indexOf(this.children[i]);
            var next = indexOf(this.children[i + 1]);
            if (index < current) {
                this.children[i].insertAdjacentElement('beforebegin', elem);
                return;
            }
            else {
                if (index < next) {
                    this.children[i].insertAdjacentElement('beforebegin', elem);
                    return;
                }
            }
        }
        this.children[this.childElementCount - 1].insertAdjacentElement('afterend', elem);
    }
};
var xDown = null;
var yDown = null;
function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}
function handleTouchStart(evt) {
    var firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}
;
function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    if (Math.abs(xDiff) > Math.abs(yDiff)) { /*most significant*/
        if (xDiff > 0) {
            /* left swipe */
        }
        else {
            /* right swipe */
        }
    }
    else {
        if (yDiff > 0) {
            /* up swipe */
        }
        else {
            /* down swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
}
;
Array.prototype.Matrix = function (matrix) {
    function Matrix(M) {
        this.data = M;
        this.toString = function () {
            var str = "";
            for (var i = 0; i < M.length; i++) {
                for (var j = 0; j < M[i].length; j++) {
                    if (i + 1 < M.length || j + 1 < M[i].length) {
                        str += M[i][j] + ",";
                    }
                    else {
                        str += M[i][j];
                    }
                }
            }
            return str;
        };
        return this;
    }
    return new Matrix(matrix);
};
Array.prototype.contains = function (elem, comparator) {
    for (var i = 0; i < this.length; i++) {
        if (comparator(this[i], elem)) {
            return true;
        }
    }
    return false;
};
Array.prototype.getIndex = function (elem, comparator) {
    for (var i = 0; i < this.length; i++) {
        if (comparator(this[i], elem)) {
            return i;
        }
    }
};
Array.prototype.toString = function (convertor, separator) {
    separator = separator || ", ";
    var txt = "";
    var Len = this.length - 1;
    var i = 0;
    while (i < Len) {
        txt += convertor(this[i++]) + separator;
    }
    txt += convertor(this[i]);
    return txt;
};
/*Other*/
function CalcRPMtoKMH(btn) {
    var table = btn.closest(".RPMtoKMH");
    var selectMaxSpeedUnits = table.querySelector("select#speed");
    var maxSpeedUnitsConversion = selectMaxSpeedUnits.options[selectMaxSpeedUnits.selectedIndex].value;
    var rph = parseInt(table.querySelector("#inputRPM").value) * 60; /*[r/h]*/
    var radius_km = (parseFloat(table.querySelector("#inputINCH").value) / 2.0) * 0.0000254; /**/
    var circumference = 2 * Math.PI * radius_km; /*[km]*/
    var result = circumference * rph * maxSpeedUnitsConversion; /*[km/h]*/
    resultInput = table.querySelector("#resultSpeed").innerHTML = Math.round(result * 100) / 100;
}
function CalcKMHtoRPM(btn) {
    var table = btn.closest(".KMHtoRPM");
    var selectMaxSpeedUnits = table.querySelector("select#speed");
    var maxSpeedUnitsConversion = selectMaxSpeedUnits.options[selectMaxSpeedUnits.selectedIndex].value;
    var meters_p_minute = parseFloat(table.querySelector("#inputKMH").value) * (maxSpeedUnitsConversion / 60.0); /*[distanceUnits/min]*/
    var radius_m = (parseFloat(table.querySelector("#inputINCH").value) / 2.0) * 0.0254; /**/
    var circumference = 2 * Math.PI * radius_m; /*[m]*/
    var result = meters_p_minute / circumference; /*[rpm]*/
    resultInput = table.querySelector("#resultRPM").innerHTML = Math.round(result * 10) / 10.0;
}
function assertNever(x, msg) {
    throw new Error("Failed assertion \"" + x + "\" because: \"" + msg + "\".");
}
function assertTrue(x, msg) {
    if (!x) {
        throw new Error("Failed assertion \"" + x + "\" because: \"" + msg + "\".");
    }
}
var Content = /** @class */ (function () {
    function Content() {
        this.data = {
            "Sections": [
                { RefName: "1_Intro", Show: true, Articles: [{ RefName: "Intro", Show: true, Translations: [true, true], Date: 2018, Author: "DKz" }] },
                {
                    RefName: "2_Christ", Show: true, Articles: [
                        { RefName: "Dating", Show: true, Translations: [false, true], Date: 2007, Author: "DKz" },
                        { RefName: "Dating2", Show: true, Translations: [false, true], Date: 2009, Author: "DKz" },
                        { RefName: "Passion", Show: true, Translations: [false, true], Date: 2014, Author: "DKz" },
                        { RefName: "OTvsNT", Show: true, Translations: [false, true], Date: 2013, Author: "DKz" },
                        { RefName: "Love", Show: true, Translations: [true, true], Date: 2018, Author: "DKz" },
                        { RefName: "Stuff", Show: true, Translations: [false, false], Date: 2018, Author: "DKz" }
                    ]
                },
                { RefName: "3_Krishna", Show: true, Articles: [{ RefName: "KrishnaMeat", Show: true, Translations: [true, false], Date: 2018, Author: "DKz" }, { RefName: "KrishnaDevil", Show: true, Translations: [false, false], Date: 2018, Author: "DKz" }] },
                { RefName: "4_Muslims", Show: true, Articles: [{ RefName: "ReligionMuslim", Show: true, Translations: [true, false], Date: 2018, Author: "DKz" }] },
                { RefName: "5_Nofaith", Show: true, Articles: [{ RefName: "GoodNews", Show: true, Translations: [false, true], Date: 2018, Author: "DKz" }, { RefName: "ACell", Show: true, Translations: [false, true], Date: 2018, Author: "DKz" }, { RefName: "FaithIsChoice", Show: true, Translations: [true, true], Date: 2017, Author: "DKz" }, { RefName: "Coincidence", Show: true, Translations: [false, true], Date: 2012, Author: "DKz" }] }
            ],
            "motto": 3,
            "1_Intro": 0,
            "2_Christ": 1,
            "3_Krishna": 2,
            "4_Muslims": 3,
            "5_Nofaith": 4
        };
    }
    Content.prototype.AddSection = function (sectionRefName, show) {
        if (!this.data.Sections) {
            this.data.Sections = [];
        }
        show = show || true;
        var len = this.data.Sections.length;
        if (!this.data.Sections[sectionRefName]) {
            this.data[sectionRefName] = len;
            this.data.Sections[len] = {};
            this.data.Sections[len].RefName = sectionRefName;
            this.data.Sections[len].Show = show;
            this.data.Sections[len].Articles = [];
        }
        return len;
    };
    Content.prototype.GetArticleByRef = function (ArticleRefName) {
        return this.data.Sections.filter(function (o, i) { return o.Articles.filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName).length > 0; })[0].
            Articles.filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName);
    };
    Content.prototype.GetArticleByID = function (sectionID, articleID) {
        return this.data.Sections[sectionID].Articles[articleID];
    };
    Content.prototype.GetArticleIDbyRef = function (ArticleRefName, sectionID) {
        var searchedSections = typeof sectionID === "undefined" ? this.data.Sections : [this.data.Sections[sectionID]];
        var exists = searchedSections.filter(function (o, i) { return o.Articles.filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName).length > 0; }, ArticleRefName, searchedSections)[0];
        if (exists !== undefined) {
            return exists.Articles.map(function (o, i) { return ({ "RefName": o.RefName, "index": i }); }).filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName)[0].index;
        }
        else {
            return undefined;
        }
    };
    Content.prototype.GetSectionByArticleRef = function (ArticleRefName) {
        return this.data.Sections.filter(function (o, i) { return o.Articles.filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName).length > 0; }, ArticleRefName)[0];
    };
    Content.prototype.GetSectionIDByArticleRef = function (ArticleRefName) {
        return this.data[this.data.Sections.filter(function (o, i) { return o.Articles.filter(function (o, i) { return o.RefName.toUpperCase() == ArticleRefName.toUpperCase(); }, ArticleRefName).length > 0; }, ArticleRefName)[0]["RefName"]];
    };
    Content.prototype.GetSectionRef = function (sectionID) {
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].RefName : undefined;
    };
    Content.prototype.GetSectionID = function (sectionRefName) {
        return this.data[sectionRefName];
    };
    Content.prototype.SetSectionDisabled = function (sectionID, show) {
        if (this.IndicesAreCorrect(sectionID)) {
            this.data.Sections[sectionID].Show = show;
        }
    };
    Content.prototype.GetSectionDisabled = function (sectionID) {
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].Show : undefined;
    };
    Content.prototype.GetSectionEmpty = function (sectionID, translationID) {
        if (this.IndicesAreCorrect(sectionID)) {
            for (var i = 0; i < this.data.Sections[sectionID].Articles.length; i++) {
                if (this.data.Sections[sectionID].Articles[i].Translations[translationID]) {
                    return false;
                }
            }
            return true;
        }
        else {
            return undefined;
        }
    };
    Content.prototype.AddArticle = function (sectionID, articleRefName, translations, date, author, show) {
        translations = translations || [false, false];
        show = show || true;
        date = date || "";
        if (this.data.Sections && this.data.Sections[sectionID]) {
            var len = this.data.Sections[sectionID].Articles.length;
            this.data.Sections[sectionID].Articles[len] = {};
            this.data.Sections[sectionID].Articles[len].RefName = articleRefName;
            this.data.Sections[sectionID].Articles[len].Translations = translations;
            this.data.Sections[sectionID].Articles[len].Date = date;
            this.data.Sections[sectionID].Articles[len].Author = author;
            this.data.Sections[sectionID].Articles[len].Show = show;
        }
    };
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetSections without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    Content.prototype.GetSections = function (translationID, exclusively) {
        var _this = this;
        if (exclusively === undefined) {
            console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
        }
        return this.IndicesAreCorrect(undefined, undefined, translationID) ?
            this.data.Sections.filter(function (o, i) { return _this.data.GetNoArticles(i, translationID, exclusively) > 0; }) :
            undefined;
    };
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetNoArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    Content.prototype.GetNoArticles = function (sectionID, translationID, exclusively) {
        return this.IndicesAreCorrect(sectionID, undefined, translationID) ? this.data.Sections[sectionID].Articles.filter(function (o, i) {
            if (exclusively === undefined) {
                console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
            }
            if (exclusively) {
                return o.Translations[translationID];
            }
            else {
                return o.Translations.reduce(function (acc, cur) { return acc || cur; });
            }
        }).length : undefined;
    };
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    Content.prototype.GetArticles = function (sectionID, translationID, exclusively) {
        return this.IndicesAreCorrect(sectionID, undefined, translationID) ? this.data.Sections[sectionID].Articles.filter(function (o, i) {
            if (exclusively === undefined) {
                console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
            }
            if (exclusively) {
                return o.Translations[translationID];
            }
            else {
                return o.Translations.reduce(function (acc, cur) { return acc || cur; });
            }
        }) : undefined;
    };
    Content.prototype.GetArticleRefName = function (sectionID, articleID) {
        return this.IndicesAreCorrect(sectionID, articleID) ? this.data.Sections[sectionID].Articles[articleID].RefName : undefined;
    };
    Content.prototype.GetTranslationExists = function (sectionID, articleID, translationID) {
        if (this.IndicesAreCorrect(sectionID, articleID, translationID)) {
            return this.Sections[sectionID].Articles[articleID].Translations[translationID];
        }
        else {
            return false;
        }
    };
    Content.prototype.GetArticleDate = function (sectionID, articleID) {
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].Articles[articleID].Date : undefined;
    };
    Content.prototype.GetArticleAuthor = function (sectionID, articleID) {
        return this.IndicesAreCorrect(sectionID, articleID) ? this.data.Sections[sectionID].Articles[articleID].Author : undefined;
    };
    Content.prototype.SetArticleDisabled = function (sectionID, articleID, show) {
        if (this.IndicesAreCorrect(sectionID, articleID)) {
            this.data.Sections[sectionID].Articles[articleID].Show = show;
        }
    };
    Content.prototype.GetArticleDisabled = function (sectionID, articleID) {
        return this.IndicesAreCorrect(sectionID, articleID) ? this.data.Sections[sectionID].Articles[articleID].Show : undefined;
    };
    Content.prototype.GetArticleNameByRef = function (refname, translationID) {
        var exists = this.GetArticleByRef(refname);
        return typeof exists !== "undefined"
            ? Localization[exists[0]["RefName"]][translationID]
            : undefined;
    };
    Content.prototype.GetArticleName = function (sectionID, articleID, translationID) {
        return this.IndicesAreCorrect(sectionID, articleID, translationID) ? Localization[this.data.Sections[sectionID].Articles[articleID].RefName][translationID] : undefined;
    };
    Content.prototype.PrintSections = function () {
        var Sections = this.data.Sections;
        console.log({ Sections: Sections });
    };
    Content.prototype.PrintArticles = function (sectionID) {
        var Articles = this.data.Sections[sectionID].Articles;
        console.log({ Articles: Articles });
    };
    Content.prototype.GenerateLink = function (ArticleRefName, translationID, title, hash, innerHTML, target) {
        var link = document.createElement("a");
        var sectionID = this.data.GetSectionID(this.data.GetSectionByArticleRef(ArticleRefName).RefName);
        var articleID = this.data.GetArticleIDbyRef(ArticleRefName);
        if (typeof sectionID == "number" && typeof articleID == "number") {
            return this.GetLink(sectionID, articleID, translationID, title, hash, innerHTML);
        }
        else {
            console.error("Incorrect sectionID or articleID");
            return undefined;
        }
    };
    Content.prototype.GetLink = function (sectionID, articleID, translationID, title, hash, innerHTML, target) {
        var link = document.createElement("a");
        var href = location.origin + location.pathname + "?s=" + sectionID + "&a=" + articleID;
        if (!!hash) {
            href = href + "#" + hash;
        }
        link.setAttribute("href", href);
        if (!!title) {
            link.setAttribute("title", title);
        }
        if (!!target) {
            link.setAttribute("target", target);
        }
        if (typeof innerHTML != "undefined") {
            link.append(innerHTML);
        }
        if (!this.IndicesAreCorrect(sectionID, articleID, translationID)) {
            console.error("Incorrect link IDs (" + { link: link } + ") in section " + sectionID + " in " + Localization['LangName'][translationID] + " article " + articleID);
        }
        return link;
    };
    Content.prototype.IndicesAreCorrect = function (sectionID, articleID, translationID) {
        if (isNaN(translationID)) {
            if (isNaN(articleID)) {
                return sectionID < this.data.Sections.length;
            }
            else {
                return sectionID < this.data.Sections.length &&
                    articleID < this.data.Sections[sectionID].Articles.length;
            }
        }
        else {
            if (isNaN(articleID)) {
                if (isNaN(sectionID)) {
                    return translationID < this.data.Sections[0].Articles[0].Translations.length;
                }
                else {
                    return sectionID < this.data.Sections.length &&
                        translationID < this.data.Sections[0].Articles[0].Translations.length;
                }
            }
            else {
                return sectionID < this.data.Sections.length &&
                    articleID < this.data.Sections[sectionID].Articles.length &&
                    translationID < this.data.Sections[sectionID].Articles[articleID].Translations.length;
            }
        }
    };
    return Content;
}());
var Cookie = /** @class */ (function () {
    function Cookie() {
    }
    Cookie.Set = function (key, value, date) {
        document.cookie = key + "=" + value + ";" + "expires=" + date.toUTCString() + ";";
    };
    Cookie.Get = function (key) {
        var allcookies = document.cookie.split(';');
        for (var i = 0; i < allcookies.length; i++) {
            var cookie = allcookies[i].split("=");
            if (cookie[0].trim() == key) {
                return cookie[1];
            }
        }
        return "";
    };
    Cookie.Remove = function (key) {
        var date = new Date();
        date.setYear(2016);
        document.cookie = key + "=a;" + "expires=" + date.toUTCString() + ";";
    };
    return Cookie;
}());
var Localization = /** @class */ (function () {
    function Localization() {
        this.data = {
            /*webparts*/
            "Languages": ["en", "cz"],
            "LangName0noun": ["english", "angličtina"],
            "LangName1noun": ["czech", "čeština"],
            "LangName0adjSHE": ["english", "anglická"],
            "LangName0adjHE": ["english", "anglický"],
            "LangName1adjSHE": ["czech", "česká"],
            "LangName1adjHE": ["czech", "český"],
            "WrongURL": ["No target matches the given URL!", "Zadaný odkaz neodpovídá žádnému výsledku!"],
            "Date": ["Date", "Datum"],
            "Author": ["Author", "Autor"],
            "linkWarning": ["Note: This article has not been created in the $1 language! You may, however, try to unselect the $2 tickbox in settings.",
                "Upozornění: Článek však nebyl vytvořen v jazyce '$1'! Může zkusit zrušit volbu '$2' v nastavení."],
            "WebHeadline": ["Wise Dove", "Chytrá Holubice"],
            "TitleExplanation": ["Be wise as serpents and innocent as doves.", "Buďte chytří jako hadi a nevinní jako holubice."],
            "ExclLangChck": ["Exclusively", "Výlučně"],
            "ExclLangHelp": ["If not ticked, all articles on the website will be listed but the selected language will be preffered if translation exists.",
                "Pokud je volba 'Výhradně' nezaškrtnuta, uvidíte výpis všech článků webu, s tím že se upřednostní překlad (pokud existuje) ve zvoleném jazyku."],
            /*sections*/
            "0_Default": ["Wise Dove", "Chytrá Holubice"],
            "1_Intro": ["Intro", "Úvod"],
            "2_Christ": ["For Christians", "Pro křesťany"],
            "3_Krishna": ["For Krishna People", "Pro hare Krišny"],
            "4_Muslims": ["For Muslims", "Pro muslimy"],
            "5_Nofaith": ["For Non Believers", "Pro nevěřící"],
            "WebMotto000": ["Back then, you all came close and stood at the foot of the mountain. The mountain was blazing with fire up to the sky, with darkness, cloud, and thick smoke!",
                "Tenkrát jste se přiblížili a stáli pod horou. Hora planula ohněm až do samých nebes a kolem byla tma, oblak a mrákota."],
            "WebMotto001": ["But if from there you seek the Lord your God, you will find him if you seek him with all your heart and with all your soul.",
                "Odtamtud budete hledat Hospodina, svého Boha; nalezneš ho , budeš-li ho opravdu hledat celým svým srdcem a celou svou duší."],
            "WebMotto002": ["For the Lord your God is a merciful God; he will not abandon or destroy you or forget the covenant with your ancestors, which he confirmed to them by oath.",
                "Vždyť Hospodin, tvůj Bůh, je Bůh milosrdný, nenechá tě klesnout a nepřipustí tvou zkázu, nezapomene na smlouvu s tvými otci, kterou jim stvrdil přísahou."],
            /*Articles*/
            "Intro": ["Introduction", "Úvod"],
            "Dating": ["About Dating", "O Chození"],
            "Dating2": ["About Dating 2", "O Chození 2"],
            "Passion": ["Controlling Passions", "Ovládání vášní"],
            "OTvsNT": ["What changed: Old Testament -> New Testament", "Co se změnilo: Starý Zákon -> Nový Zákon"],
            "Love": ["Christian Love", "Křesťanská láska", "2018"],
            "Stuff": ["Other Stuff", "Jiné věci", "2018"],
            "KrishnaMeat": ["(Not)Eating meat from Biblical perspective", "O (ne)jezení masa z pohledu Bible"],
            "KrishnaDevil": ["You believe in the lies of the Devil!", "Vy věříte ďáblovým lžím."],
            "ReligionMuslim": ["Religion vs Jesus", "Náboženství a Křesťanství", "2018"],
            "GoodNews": ["The Gospel means: \"Good News\"", "Evangelium znamená: \"Dobrá zpráva\""],
            "ACell": ["Why is Christianity practical, moral and very real?", "Proč je křesťanství praktické, morální a opodstatněné?"],
            "FaithIsChoice": ["Faith is a choice!", "Víra je rozhodnutí!"],
            "Coincidence": ["Creation and Coincidence", "Stvoření a Náhoda"]
        };
    }
    return Localization;
}());
var Server = /** @class */ (function () {
    function Server() {
    }
    Server.prototype.AddWebPart = function (groupName, fn, data, selector, multiSelect) {
        multiSelect = multiSelect || false;
        if (typeof Server[groupName] == "undefined") {
            Server[groupName] = [];
        }
        Server[groupName][Server[groupName].length] = function () { fn(data, selector, multiSelect); };
    };
    Server.prototype.RunGroup = function (groupName) {
        Server[groupName].forEach(function (elem) {
            elem();
        });
    };
    return Server;
}());
/*version 2.2*/
document.onload = Configure();
function Configure() {
    window.page = new WiseDove();
    Server.AddWebPart("Change", page.ChangeWebTitle, Content.GetSectionRef(page.GetSectionID()));
    Server.AddWebPart("Change", page.ChangeWebMotto, ["WebMotto", 0, Content["motto"] - 1, 10, 20], ".webmotto", true);
    Server.AddWebPart("Change", page.ChangeWebHeadline, "WebHeadline", ".webheadline");
    Server.AddWebPart("Change", page.ReCreateListOfSections, Localization.Languages, "#menu");
    Server.AddWebPart("Change", page.GetMainPageContent, null, ".partB");
    Server.AddWebPart("Change", page.ReCreateWebflags, Localization.Languages, ".webflags");
    Server.AddWebPart("Change", page.UpdateLinks);
    Server.AddWebPart("CreatePage", page.StartWebMotto, ["WebMotto", 0, Content["motto"] - 1, 10000, 20000], ".webmotto");
    Server.AddWebPart("CreatePage", page.ReCreateWebflags, Localization.Languages, ".webflags");
    Server.AddWebPart("CreatePage", page.ReCreateListOfSections, Localization.Languages, "#menu");
    Server.AddWebPart("CreatePage", page.GetMainPageContent, null, ".partB");
    Server.AddWebPart("CreatePage", page.ChangeWebHeadline, "WebHeadline", ".webheadline");
    Server.AddWebPart("CreatePage", page.HideOnlineArticleLink, null, "#footer>a");
    Content.SetSectionDisabled(Content["4_Muslims"], false);
    Content.SetArticleDisabled(Content["3_Krishna"], 1, false);
    document.addEventListener("FileLoaded", page.UpdateLinks, false);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.querySelector(".webmotto").addEventListener("transitionend", function () { this.classList.remove("begin"); });
}
/*todo: rename all articles to normal names, keep IDs internal, use refnames, same with folders
  generate the powershell script that will generate the data structure
*/
/*User handler*/
function SetExclusivelyCheckboxHandler(isChecked) {
    page.SetExclusively(isChecked);
    Server.RunGroup('Change');
}
function SetLanguageSelectHandler(languageID) {
    page.SetLanguage(languageID);
    Server.RunGroup('Change');
}
function WiseDove() {
    var that = this;
    this.ReCreateListOfSections = function (data, selector) {
        var menuItems = document.getElementsByClassName("menuitem");
        var sections = Content.GetSections(page.GetSelectedLanguageID(), page.GetExclusively()).map(function (o, i) { return (__assign({ "secID": Content.GetSectionID(o.RefName) }, o)); });
        if (menuItems.length != sections.length) {
            menuItems = [];
            var elem = document.querySelector(selector);
            elem.innerHTML = "";
            var sectionNames = document.createElement("div");
            sectionNames.classList.add("categories");
            var scrollPointArea = document.createElement("div");
            scrollPointArea.classList.add("scrollarea");
            for (var i = 0; i < sections.length; i++) {
                var secID = sections[i]["secID"];
                var alink = document.createElement("a");
                var scrollPoint = document.createElement("span");
                scrollPoint.classList.add("point");
                //scrollPoint.setAttribute("onclick","FocusOnSection("+i+");");
                alink.classList.add("menuitem");
                menuItems[menuItems.length] = alink;
                alink.setAttribute("href", location.origin + location.pathname + "?s=" + secID);
                alink.setAttribute("id", "sec" + i);
                sectionNames.appendChild(alink);
                scrollPointArea.appendChild(scrollPoint);
            }
            elem.appendChild(sectionNames);
            elem.appendChild(scrollPointArea);
        }
        for (var i = 0; i < sections.length; i++) {
            menuItems[i].innerHTML = Localization[sections[i].RefName][page.GetSelectedLanguageID()];
        }
    };
    this.UpdateLinks = function () {
        document.querySelectorAll("span.link:not(.generated)").forEach(function (elem) {
            elem.classList.add("generated");
            var refname = elem.dataset["refname"];
            var title = elem.dataset["title"];
            var hash = elem.dataset["hash"];
            var target = elem.dataset["target"];
            var langID = page.GetSelectedLanguageID();
            var language = page.GetArticleLanguage(refname, langID, page.GetExclusively());
            var warning;
            if (typeof language === "undefined") {
                var linkWarning = Localization["linkWarning"][page.GetSelectedLanguageID()];
                linkWarning = linkWarning
                    .replace("$1", Localization["LangName" + langID + "noun"][langID])
                    .replace("$2", Localization["ExclLangChck"][langID]);
                title = (!!title ? (title) : "") + " " + linkWarning;
            }
            var innerHTML = elem.dataset["innerHTML"];
            if (typeof refname != "string") {
                console.error("Incorrect link's RefName: " + refname);
            }
            else {
                langID = page.GetArticleLanguage(refname, langID, false);
                innerHTML = Content.GetArticleNameByRef(refname, langID);
                var link = Content.GenerateLink(refname, langID, title, hash, innerHTML, target);
                elem.append(link);
            }
        });
    };
    this.ChangeWebTitle = function (refName, selector) {
        var elem = document.getElementsByTagName("title")[0];
        elem.innerHTML = Localization[refName][page.GetSelectedLanguageID()];
    };
    this.ChangeWebHeadline = function (refName, selector) {
        var elem = document.querySelector(selector);
        if (elem.parentElement.tagName != "a") {
            $(elem).wrap("<a href=\"" + location.origin + location.pathname + "\"></a>");
        }
    };
    var stopWebMotto = false;
    this.StopWebMotto = function () {
        stopWebMotto = true;
    };
    this.StartWebMotto = function (data, selector) {
        stopWebMotto = false;
        that.ChangeWebMotto(data, selector);
    };
    this.ChangeWebMotto = function (data, selector, skip) {
        /*example:
            data: ['WebMotto',min_number,max_number]
            selector: ".webmotto"
            skip : boolean
        */
        skip = skip || false;
        var elem = document.querySelector(selector);
        var numberRef = parseInt(Math.round(data[1] + Math.random() * (data[2] - data[1])));
        if (numberRef < 100) {
            if (numberRef < 10) {
                numberRef = "00" + numberRef;
            }
            else {
                numberRef = "0" + numberRef;
            }
        }
        var textRef = data[0] + numberRef;
        elem.innerHTML = Localization[textRef][page.GetSelectedLanguageID()];
        if (!stopWebMotto && !skip) {
            var dur = Number.parseInt(data[3] + Math.random() * (data[4] - data[3]));
            setTimeout(that.ChangeWebMotto, dur, data, selector);
            elem.style.setProperty("--dur", dur + "ms");
            elem.classList.add("begin");
        }
    };
    this.ReCreateWebflags = function (data, selector) {
        var langFlags = document.querySelectorAll(".webflags label[for='exclChbox'],.webflags span.text"); /*Seach for menu items (sections)*/
        if (langFlags.length == 0 /*If they've not been created yet*/) {
            langFlags = [];
            var elem = document.querySelector(selector);
            elem.innerHTML = "";
            var spanLang = document.createElement("span");
            var spanSel = document.createElement("span");
            var sel = document.createElement("select");
            sel.setAttribute("onchange", "SetLanguageSelectHandler(this.options[this.selectedIndex].value);");
            spanLang.classList.add("lang");
            spanLang.innerHTML = "+";
            spanLang.setAttribute("onclick", "page.ToggleLangBar(this);");
            spanSel.classList.add("sel");
            spanSel.appendChild(sel);
            spanSel.hidden = true;
            elem.appendChild(spanLang);
            elem.appendChild(spanSel);
            for (var languageID = 0; languageID < page.GetNumberOfLanguages(); languageID++) {
                var opt = document.createElement("option");
                opt.setAttribute("value", languageID);
                opt.innerHTML = data[languageID];
                sel.appendChild(opt);
                if (page.GetSelectedLanguageID() == languageID) {
                    opt.selected = true;
                }
            }
            var lbl = document.createElement("label");
            var chckbox = document.createElement("input");
            var spanHelp = document.createElement("span");
            var spanIcon = document.createElement("span");
            var spanText = document.createElement("span");
            var spanChboxLabel = document.createElement("span");
            spanChboxLabel.appendChild(chckbox);
            spanChboxLabel.appendChild(lbl);
            spanChboxLabel.classList.add("checkbox_exclusive");
            spanSel.appendChild(spanChboxLabel);
            spanHelp.classList.add("help");
            spanIcon.classList.add("icon");
            spanText.classList.add("text");
            spanHelp.appendChild(spanText);
            spanHelp.appendChild(spanIcon);
            spanSel.appendChild(spanHelp);
            lbl.setAttribute("for", "exclChbox");
            spanIcon.innerHTML = "?";
            chckbox.setAttribute("type", "checkbox");
            chckbox.setAttribute("id", "exclChbox");
            chckbox.setAttribute("onclick", "SetExclusivelyCheckboxHandler(this.checked);");
            var ex = page.GetExclusively();
            chckbox.checked = ex;
            langFlags[0] = lbl;
            langFlags[1] = spanText;
            spanIcon.addEventListener("mouseover", function (obj) {
                spanText.classList.add("tooltip");
            });
            spanIcon.addEventListener("mouseleave", function (obj) {
                spanText.classList.remove("tooltip");
            });
        }
        langFlags[0].innerHTML = Localization.ExclLangChck[page.GetSelectedLanguageID()];
        langFlags[1].innerHTML = Localization.ExclLangHelp[page.GetSelectedLanguageID()];
    }; //flags
    this.SetExclusively = function (bool_exclusively) {
        var date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        Server.Cookie.Set("langExclusively", bool_exclusively.toString(), date);
        page.Exclusively = bool_exclusively;
    };
    this.GetExclusively = function () {
        if (isNaN(page.Exclusively) || page.Exclusively == null) {
            var cv = Server.Cookie.Get("langExclusively");
            if (cv === "") {
                page.SetExclusively(true);
            }
            else {
                page.Exclusively = cv.toLowerCase() === "true";
            }
        }
        return page.Exclusively;
    };
    this.SetLanguage = function (id_lang) {
        id_lang = Number.parseInt(id_lang);
        if (!isNaN(id_lang)) {
            var date = new Date();
            date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
            Server.Cookie.Set("language", id_lang, date);
            page.Selected = id_lang;
        }
    };
    this.GetSelectedLanguageID = function () {
        if (isNaN(page.Selected)) {
            page.Selected = Number.parseInt(Server.Cookie.Get("language"));
            if (isNaN(page.Selected)) {
                page.SetLanguage(0);
            }
        }
        return page.Selected;
    },
        this.ToggleLangBar = function (elem) {
            var sel = document.querySelector(".webflags>.sel");
            sel.hidden = !sel.hidden;
            if (sel.hidden) {
                elem.innerHTML = "+";
            }
            else {
                elem.innerHTML = "-";
            }
        };
    this.HideOnlineArticleLink = function (data, selector) {
        if (location.host != "localhost") {
            document.querySelector(selector).hidden = true;
        }
    },
        this.URLParams = function () {
            var qso = {};
            var qs = document.location.search;
            // Check for an empty querystring
            if (qs == "") {
                return qso;
            }
            // Normalize the querystring
            qs = qs.replace(/(^\?)/, '').replace(/;/g, '&');
            while (qs.indexOf("&&") != -1) {
                qs = qs.replace(/&&/g, '&');
            }
            qs = qs.replace(/([\&]+$)/, '');
            // Break the querystring into parts
            qs = qs.split("&");
            // Build the querystring object
            for (var i = 0; i < qs.length; i++) {
                var qi = qs[i].split("=");
                qi = qi.map(function (n) { return decodeURIComponent(n); });
                if (typeof qi[1] === "undefined") {
                    qi[1] = null;
                }
                if (typeof qso[qi[0]] !== "undefined") {
                    // If a key already exists then make this an object
                    if (typeof (qso[qi[0]]) == "string") {
                        var temp = qso[qi[0]];
                        if (qi[1] == "") {
                            qi[1] = null;
                        }
                        qso[qi[0]] = [];
                        qso[qi[0]].push(temp);
                        qso[qi[0]].push(qi[1]);
                    }
                    else {
                        if (typeof (qso[qi[0]]) == "object") {
                            if (qi[1] == "") {
                                qi[1] = null;
                            }
                            qso[qi[0]].push(qi[1]);
                        }
                    }
                }
                else { // If no key exists just set it as a string
                    if (qi[1] == "") {
                        qi[1] = null;
                    }
                    qso[qi[0]] = qi[1];
                }
            }
            return qso;
        };
    /*Only extracts the number from URL: e.g. ?s=1*/
    this.GetSectionID = function () {
        var p = this.URLParams();
        var sectionID = Number.parseInt(p.s);
        if (isNaN(sectionID)) {
            return 0;
        }
        else {
            return sectionID;
        }
    };
    /*Only extracts the number from URL: e.g. ?a=1*/
    this.GetSectionArticleID = function () {
        return Number.parseInt(this.URLParams().a);
    };
    /*handles the loading icon*/
    this.LoadingIcon = (function () {
        this.ArticlesRemaining = 0;
        function SetLoadingIcon(isEnabled) {
            if (isEnabled) {
                document.getElementsByTagName("html")[0].classList.add("loading");
            }
            else {
                document.getElementsByTagName("html")[0].classList.remove("loading");
            }
        }
        this.Reset = function () {
            this.ArticlesRemaining = 0;
        };
        this.AddLoadingAmount = function (integer) {
            this.ArticlesRemaining += integer;
            if (this.ArticlesRemaining > 0) {
                SetLoadingIcon(true);
            }
        };
        this.ReleaseLoadingAmount = function (integer) {
            this.ArticlesRemaining -= integer;
            if (this.ArticlesRemaining == 0) {
                SetLoadingIcon(false);
            }
        };
        return this;
    })();
    this.GetArticleLanguage = function (refname, translationID, exclusively) {
        /*get the article langID of translationID. But if exclusively, select a different language*/
        /*which different language do I choose, for now any one*/
        var sectionID = Content.GetSectionIDByArticleRef(refname);
        var articleID = Content.GetArticleIDbyRef(refname, sectionID);
        var selLang = Content.Sections[sectionID].Articles[articleID].Translations.map(function (o, i) { return ({ "bool": o, "i": i }); }).filter(function (o, i) { return ((exclusively && o["bool"] && i == translationID) || (!exclusively && o["bool"])); });
        var prefLang = selLang.getIndex({ i: translationID }, function (o1, o2) { return o1["i"] == o2["i"]; });
        if (!isNaN(prefLang)) {
            return selLang[prefLang]["i"];
        }
        else {
            if (selLang.length > 0) {
                /*return the first other available - hey no priorities here!!!??*/
                return selLang[0]["i"];
            }
            else {
                console.warn("No language found for article " + articleID + " in section " + sectionID + "!");
                return undefined;
            }
        }
    };
    this.GetMainPageContent = function (data, contentSelector) {
        that.LoadingIcon.Reset();
        document.querySelector(contentSelector).innerHTML = "";
        var sectionID = page.GetSectionID();
        var articleID = page.GetSectionArticleID();
        var onlyLeads = isNaN(articleID);
        var langID = page.GetSelectedLanguageID();
        var excl = page.GetExclusively();
        var exists = Content.IndicesAreCorrect(sectionID, articleID);
        if (!exists) {
            var elem = document.querySelector(contentSelector);
            elem.innerHTML = Localization["WrongURL"][langID];
            return;
        }
        var allArticles = onlyLeads /*true == articleID is not defined*/
            ? Content.GetArticles(sectionID, langID, excl).map(function (o, i) {
                var id = Content.GetArticleIDbyRef(o.RefName, sectionID);
                return { "articleID": id, "langID": page.GetArticleLanguage(o.RefName, langID, excl) };
            })
            : [{ "articleID": articleID,
                    "langID": page.GetArticleLanguage(Content.GetArticleRefName(sectionID, articleID), langID, excl)
                }];
        var fileExtension = onlyLeads ? "_lead.html" : ".html";
        var sel = document.querySelector(".categories>.selected");
        if (!!sel) {
            sel.classList.remove("selected");
        }
        sel = document.getElementById("sec" + sectionID);
        if (!!sel) {
            sel.classList.add("selected");
        }
        allArticles.forEach(function (article) {
            var langID = article["langID"];
            if (typeof langID !== "undefined" /*if no language exists then do not try loading it*/) {
                that.LoadingIcon.AddLoadingAmount(1);
                var artID = article["articleID"];
                var langTxt = page.GetLanguageRefName(langID);
                var file = "./" + (sectionID + 1) + "/" + (artID + 1) + "_" + langTxt + fileExtension;
                var data = [sectionID, artID, langID, onlyLeads, contentSelector];
                LoadFile(file, RenderContent, data);
            }
        });
        function LoadFile(file, renderContentCallback, data) {
            var xhttp = new XMLHttpRequest();
            function PrepareResponse(response) {
                /*prepairing the content*/
                var lead = document.createElement("p");
                lead.innerHTML = response;
                if (lead.childElementCount == 0) {
                    lead = [];
                    lead[0] = response;
                }
                else {
                    lead = lead.children;
                }
                return lead;
            }
            xhttp.onreadystatechange = function (obj) {
                if (this.readyState == 4 && this.status == 200) {
                    data.splice(0, 0, PrepareResponse(this.responseText));
                    renderContentCallback(data);
                    document.dispatchEvent(new Event('FileLoaded'));
                }
            };
            xhttp.open("GET", file);
            xhttp.send();
        }
        function RenderContent(data) {
            var txt = data[0];
            var secID = data[1]; /*ID in the data structure Content*/
            var artID = data[2]; /*ID in the data structure Content*/
            var langID = data[3];
            var onlyLeads = data[4];
            var selector = data[5];
            that.LoadingIcon.ReleaseLoadingAmount(1);
            var elem = document.querySelector(selector);
            var divArticle = document.createElement("div");
            divArticle.classList.add("article");
            var id = secID + "_" + artID + "_" + page.GetLanguageRefName(langID);
            divArticle.setAttribute("id", artID);
            var divLead = document.createElement("div");
            divLead.classList.add((onlyLeads ? "lead" : "content"));
            while (txt.length > 0) {
                divLead.appendChild(txt[0]);
            }
            if (onlyLeads) {
                var h1 = document.createElement("h1");
                var br = document.createElement("br");
                var author = Content.GetArticleAuthor(secID, artID);
                var date = Content.GetArticleDate(secID, artID);
                var spanOtherInfo;
                if (author || date) {
                    spanOtherInfo = document.createElement("span");
                    spanOtherInfo.setAttribute("class", "meta");
                }
                if (author) {
                    var spanAuthor = document.createElement("span");
                    spanAuthor.setAttribute("class", "author");
                    spanAuthor.innerHTML = Localization["Author"][langID] + ": " + author;
                    spanOtherInfo.appendChild(spanAuthor);
                }
                if (date) {
                    var spanDate = document.createElement("span");
                    spanDate.setAttribute("class", "date");
                    spanDate.innerHTML = Localization["Date"][langID] + ": " + date;
                    spanOtherInfo.appendChild(spanDate);
                }
                var titleLink = document.createElement("span");
                titleLink.classList.add("link");
                titleLink.dataset["refname"] = Content.GetArticleRefName(secID, artID);
                h1.appendChild(titleLink);
                if (spanOtherInfo) {
                    h1.appendChild(document.createElement("br"));
                    h1.appendChild(spanOtherInfo);
                }
                divArticle.appendChild(h1);
            }
            divArticle.appendChild(divLead);
            var index = elem.InsertSort(divArticle, function (A) {
                /*indexOf*/
                var rA = A.querySelector(".link").dataset["refname"];
                var yA = Content.GetArticleByRef(rA)[0].Date;
                return yA;
            });
            console.info(Array.from(elem.children).toString(function (child) {
                return child.id;
            }));
        }
    };
    this.GetNumberOfLanguages = function () {
        return Localization.Languages.length;
    };
    this.GetLanguageRefName = function (languageID) {
        return Localization.Languages[languageID];
    };
    this.GetLanguageRefName = function (languageID) {
        return Localization.Languages[languageID];
    };
}
;
Server.RunGroup("CreatePage");
