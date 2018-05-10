function WebsiteLocalization(data,selector){
	var elem = document.querySelector(selector);
	elem.innerHTML = Localization[data][Localization.Selected];
}

function GetSections(data,selector){
	var menuItems = document.getElementsByClassName("menuitem");	/*Seach for menu items (sections)*/
	if(menuItems.length == 0 /*If they've not been created yet*/){
		menuItems = [];
		var elem = document.querySelector(selector);
		elem.innerHTML = "";
		for(var i=1 ; i<dir_tree.length; i++){
			var alink = document.createElement("a");
			alink.classList.add("menuitem");
			menuItems[menuItems.length] = alink;
			alink.setAttribute("href","javascript:webpage.LoadSection("+i+");");
			elem.appendChild(alink);
		}
	}
	for(var i=1 ; i<=menuItems.length; i++){
		menuItems[i-1].innerHTML = Localization["Section" + i][Localization.Selected];
	}
}

function GetLeads(data,selector){
	function DoLoad(sectionNo,PageNo,file){
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

	var elem = document.querySelector(selector);
	elem.innerHTML = "";
	var section = webpage.GetSection();
	var file;
	for(var i=0 ; i<dir_tree[section].length; i++){
		if(dir_tree[section][i][Localization.Selected]/*translation exists*/){
			file = "./" + section + "/" + (i+1) + "_" + dir_tree[0][Localization.Selected] +".html";
			DoLoad(section,(i+1),file);
		}else{
			if(!document.querySelector("#exclChbox").checked){
				for(var j=0; j<dir_tree[0].length; j++){
					if(dir_tree[section][i][j]){
						if(j != Localization.Selected){
							file = "./" + section + "/" + (i+1) + "_" + dir_tree[0][j] + ".html";
							DoLoad(section,(i+1),file);
							break;
						}
					}
				}
			}
		}
	}
}

function LanguageFlags(data,selector){
	var langFlags = document.querySelectorAll(".webflags label[for='exclChbox'],.webflags span.text");	/*Seach for menu items (sections)*/
	if(langFlags.length == 0 /*If they've not been created yet*/){
		langFlags = [];
		var elem = document.querySelector(selector);
		elem.innerHTML = "";
		var span = document.createElement("span");
		var span2 = document.createElement("span");
		var sel = document.createElement("select");
		sel.setAttribute("onchange","webpage.SetLanguage(this)");
		span.classList.add("lang");
		span2.classList.add("sel");
		span2.appendChild(sel);
		elem.appendChild(span);
		elem.appendChild(span2);
		for(var i=0; i<dir_tree[0].length; i++){
			var opt = document.createElement("option");
			opt.setAttribute("value",i);
			opt.innerHTML = dir_tree[0][i];
			sel.appendChild(opt);
		}
		var lbl = document.createElement("label");
		var chckbox = document.createElement("input");
		var spanHelp = document.createElement("span");
		var spanIcon = document.createElement("span");
		var spanText = document.createElement("span");
		span2.appendChild(lbl);
		span2.appendChild(chckbox);
		span2.appendChild(spanHelp);
		spanHelp.classList.add("help");
		spanIcon.classList.add("icon");
		spanText.classList.add("text");
		spanHelp.appendChild(spanIcon);
		spanHelp.appendChild(spanText);
		lbl.setAttribute("for","exclChbox");
		spanIcon.innerHTML = "?";
		chckbox.setAttribute("type","checkbox");
		chckbox.setAttribute("id","exclChbox");
		chckbox.setAttribute("onclick","webpage.ReloadSection();");
		langFlags[0] = lbl;
		langFlags[1] = spanText;
		spanIcon.addEventListener("mouseover",function(obj){
			spanText.classList.add("tooltip");
		});			
		spanIcon.addEventListener("mouseleave",function(obj){
			spanText.classList.remove("tooltip");
		});
	}
	langFlags[0].innerHTML = Localization.ExclLangChck[Localization.Selected];
	langFlags[1].innerHTML = Localization.ExclLangHelp[Localization.Selected];
}

function InitPage(){
	Localization.GetLanguage();
	window.webpage = new Page();	
	window.webpage.RegisterFunciton("SelectArticle",function(obj){
		var articles = document.querySelectorAll(".article").forEach(function(el){
			el.classList.add("invisible");
		});
		var hey = obj.closest(".article");
		hey.classList.remove("invisible");
		hey.querySelector(".invisible").classList.remove("invisible");
		hey.querySelector("hr").classList.add("invisible");
	});
	window.webpage.RegisterFunciton("GetSection",function(){
		if(location.hash!=""){
			var tmp = Number.parseInt(location.hash.substr(1));
			if(isNaN(tmp)){
				location.hash = 1;
				return location.hash;
			}else{
				return tmp;
			}
		}
		return 1;
	});
	window.webpage.RegisterFunciton("LoadSection",function(section){
		section = Number.parseInt(section);
		if(!isNaN(section)){
			if(section > 0 && section < 100){
				location.hash = section;
			}
		}
		window.webpage.ReloadSection();
	});
	window.webpage.RegisterFunciton("SetLanguage",function(sel){
		Localization.SetLanguage(sel.selectedOptions[0].value);
		window.webpage.ReCreatePage();
	});	
	
	/*Creating the page types using the above functions*/
	var WebTitle = window.webpage.CreateType(WebsiteLocalization,"WebTitle","title");					//WebTitle	
	var WebHeadline = window.webpage.CreateType(WebsiteLocalization,"WebHeadline",".webheadline");		//WebHeadline	
	var WebMotto = window.webpage.CreateType(WebsiteLocalization,"WebMotto",".webmotto");				//WebMotto
	var Webflags = window.webpage.CreateType(LanguageFlags,null,".webflags");							//flags
	var WebSection = window.webpage.CreateType(GetSections,null,".websection");						//section
	var WebContent = window.webpage.CreateType(GetLeads,null,".webcontent");							//content
	/*Creating the page groups*/
	window.webpage.AddPageGroup("sectionChange",WebContent);
	window.webpage.AddPageGroup("wholePage",WebTitle);
	window.webpage.AddPageGroup("wholePage",WebHeadline);
	window.webpage.AddPageGroup("wholePage",WebMotto);
	window.webpage.AddPageGroup("wholePage",Webflags);
	window.webpage.AddPageGroup("wholePage",WebSection);
	window.webpage.AddPageGroup("wholePage",WebContent);
	window.webpage.ReCreatePage = function(section){
		window.webpage.ReloadGroup("wholePage");
	}
	window.webpage.ReloadSection = function(){
		window.webpage.ReloadGroup("sectionChange");
	}
	window.webpage.ReCreatePage();
	document.getElementsByClassName("partC")[0].addEventListener('DOMSubtreeModified', OnHeightChange, false);
}

function OnHeightChange(C){
	var B = document.getElementsByClassName("partB");
	C = $(C.target).parents(".partC")[0];
	B[0].style = "height:"+C.scrollHeight+"px";
}

document.onload = InitPage();