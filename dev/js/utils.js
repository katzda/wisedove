
function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

Math.__proto__.rad = function(degrees){
  return degrees * (Math.PI/180);
}

/**
*	compare(A,B) returns -1 when: A <  B
*	compare(A,B) returns 0  when: A == B
*	compare(A,B) returns 1  when: A >  B
**/
HTMLElement.prototype.IsSorted = function (compare) {
	if (this.childElementCount < 2){
		return true;
	}else{
		for(var i=0; i<this.childElementCount-1; i++){
			if(compare(this.children[i],this.children[i+1]) == 1){
				return false;
			}
		}
		return true;
	}
}
/**
*	compare(A,B) returns -1 when: A <  B
*	compare(A,B) returns 0  when: A == B
*	compare(A,B) returns 1  when: A >  B
**/
HTMLElement.prototype.InsertSort = function (elem, compare) {
	if (this.childElementCount == 0) {
		this.appendChild(elem);
		return; /*return 0;*/
	}else{
		for(var i=0 ; i<this.childElementCount ; i++){
			if (compare(elem,this.children[i]) == -1) {
				this.children[i].insertAdjacentElement('beforebegin', elem);
				return;
			}else{
				if (compare(elem,this.children[i]) == 0){
					this.children[i].insertAdjacentElement('afterend', elem);
				}else{
					if (compare(elem,this.children[i]) == 1 && (i+1 == this.childElementCount)) {
						this.children[i].insertAdjacentElement('afterend', elem);
					}
				}
			}
		}
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