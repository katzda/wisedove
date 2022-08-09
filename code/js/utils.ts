''
function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

HTMLElement.prototype.InsertSort = function (elem, indexOf) {
	if (this.childElementCount == 0) {
		this.appendChild(elem);
	}else{
		let index = indexOf(elem);
		for(var i=0 ; i+1<this.childElementCount ; i++){
			let current = indexOf(this.children[i]);
			let next = indexOf(this.children[i+1]);
			if (index < current) {
				this.children[i].insertAdjacentElement('beforebegin', elem);
				return;
			}else{
				if(index < next){
					this.children[i].insertAdjacentElement('beforebegin', elem);
					return;
				}
			}
		}
		this.children[this.childElementCount-1].insertAdjacentElement('afterend', elem);
	}
}


var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */
        } else {
            /* right swipe */
        }
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */
        } else {
            /* down swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};

Array.prototype.Matrix = function(matrix){
	function Matrix(M){
		this.data = M;
		this.toString = function(){
			let str = "";
			for(var i=0; i<M.length; i++){
				for(var j=0; j < M[i].length; j++){
					if(i+1 < M.length || j+1 < M[i].length){
						str += M[i][j] + ",";
					}else{
						str += M[i][j]
					}
				}
			}
			return str;
		}
		return this;

	}
	return new Matrix(matrix);
}

Array.prototype.contains = function (elem, comparator) {
	for (var i = 0; i < this.length; i++) {
		if (comparator(this[i], elem)) { return true; }
	}
	return false;
}

Array.prototype.getIndex = function (elem, comparator) {
	for (var i = 0; i < this.length; i++) {
		if (comparator(this[i], elem)) { return i; }
	}
}

Array.prototype.toString = function (convertor, separator) {
	separator = separator || ", ";
	var txt = "";
	var Len = this.length - 1;
	var i = 0;
	while(i < Len) {
		txt += convertor(this[i++]) + separator;
	}
	txt += convertor(this[i]);
	return txt;
}

function assertNever(x: never, msg:string): never {
    throw new Error(`Failed assertion "${x}" because: "${msg}".`);
}

function assertTrue(x: boolean, msg:string):void {
	if(!x){
    	throw new Error(`Failed assertion "${x}" because: "${msg}".`);
	}
}