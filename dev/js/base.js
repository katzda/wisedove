document.onload = Start();
function Start(){
	Localization.GetLanguage();
	window.webpage = new Page();
	window.webpage.ReCreatePage();
}

function GotoArticle(){
	function DoLoad(file){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(obj) {
			if (this.readyState == 4 && this.status == 200) {
				/*prepairing the content*/
				var article = document.createElement("p");
				article.innerHTML = this.responseText;
				if(article.childElementCount == 0){
					article = [];
					article[0] = this.responseText;
				}else{
					article = article.children;
				}
				/*creating other DOM elements - the root article node*/
				var divArticle = document.createElement("div");
				divArticle.classList.add("article");
				var _tmp = obj.srcElement.responseURL.split(document.location.origin+"/")[1].split("/");
				var ID = _tmp[_tmp.length-1].split(".")[0];
				var articleId = _tmp[_tmp.length-2] + "_" + ID;
				divArticle.setAttribute("id",articleId);
				/*creating other DOM elements - the lead*/
				var divLead = document.createElement("div");
				divLead.classList.add("lead");
				var alink = document.createElement("a");
				var h1 = document.createElement("h1");
				alink.setAttribute("onclick","javascript:webpage.SelectArticle(this);");
				alink.setAttribute("href","javascript:void(0);");
				/*creating other DOM elements - the rest*/
				var divRest = document.createElement("div");
				divRest.classList.add("content");
				divRest.classList.add("invisible");
				/*appending*/
				divArticle.appendChild(divLead);
				divArticle.appendChild(divRest);
				divLead.appendChild(h1);
				h1.appendChild(alink);
				alink.innerHTML = article[0].innerText;
				while((article.length > 1) && (article[1].tagName != "HR")){
					divLead.appendChild(article[1]);
				}
				/*appending the rest*/			
				while(article.length > 1){
					divRest.appendChild(article[1]);
				}
				var index = elem.BinaryInsert(divArticle,function(A,B){
					/*comparator*/
					var iA = Number.parseInt(A.id.split("_")[1]);
					var iB = Number.parseInt(B.id.split("_")[1]);
					if(iA<iB) return -1; else if(iA==iB) return 0; else return 1;
				});
				console.log(Array.from(elem.children).toString(function(child){
					return child.id;
				}));
			}
		};
		xhttp.open("GET", file);
		xhttp.send();
	}
}
//TODO: dont have to transform H1 when only the article is displayed, instead I can create a "back" button
//TODO: fix single article loading on url request like this: ./?s=2&a=1
//TODO: Make all links work in all articles

function ToggleLangBar(elem){
  var sel = document.querySelector(".webflags>.sel");
  sel.hidden = !sel.hidden;
  if(sel.hidden){
     elem.innerHTML = "+";
  }else{
     elem.innerHTML = "-";
  }
}


function HideOnlineArticleLink(){
	if(location.host != "localhost"){
		document.querySelector("#footer>a").hidden = true;
	}
}

function ShowLinkNames(){
	for(prop in Data[Settings][Articles]){
		console.log(prop);
	};
}
