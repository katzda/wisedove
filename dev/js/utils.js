
function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
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
HTMLElement.prototype.BinaryInsert = function (elem, compare) {
	if (this.childElementCount == 0) {
		this.appendChild(elem);
		return; /*return 0;*/
	}
	var lowerBound = 0;
	var upperBound = this.childElementCount - 1;
	var curIn = 0;
	while (true) {
		curIn = Math.ceil((upperBound + lowerBound) / 2);
		if (compare(this.children[curIn], elem) == 0) {
			this.children[curIn].insertAdjacentElement('afterend', elem);
			return; /*return curIn;*/
		} else {
			if (compare(this.children[curIn], elem) == -1) {
				lowerBound = curIn + 1; // its in the upper
				if (lowerBound > upperBound) {
					this.children[curIn].insertAdjacentElement('afterend', elem);
					return; /*return curIn + 1;*/
				}
			} else {
				upperBound = curIn - 1; // its in the lower
				if (lowerBound > upperBound) {
					this.children[curIn].insertAdjacentElement('beforebegin', elem);
					return; /*return curIn;*/
				}
			}
		}
	}
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