
function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function insertBefore(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

location.URLParams = function() {
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
    qi = qi.map(function(n) {
      return decodeURIComponent(n)
    });
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

      } else if (typeof (qso[qi[0]]) == "object") {
        if (qi[1] == "") {
          qi[1] = null;
        }
        qso[qi[0]].push(qi[1]);
      }
    } else {
      // If no key exists just set it as a string
      if (qi[1] == "") {
        qi[1] = null;
      }
      qso[qi[0]] = qi[1];
    }
  }
  return qso;
}

function CookieHandler(){
	this.SetCookieValue = function(cname, cvalue, date) {
		document.cookie = cname + "=" + cvalue + ";" + "expires="+date.toUTCString() + ";";
	}
	this.RemoveCookie = function(cname){
		var date = new Date();
		date.setYear(2016);
		setCookie(cname,"",date);
	}
	this.GetCookieValue = function(cname) {
		var allcookies = document.cookie.split(';');
		for(var i = 0; i < allcookies.length; i++) {
			var cookie = allcookies[i].split("=");
			if (cookie[0].trim() == cname) {
				return cookie[1];
			}
		}
		return "";
	}
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