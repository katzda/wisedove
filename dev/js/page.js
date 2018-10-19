/*Page object
	ActivityDiagram
	--
	- First I register a page type
	- This gets inserted under JSON_Str_ID->array
	- Then I can call Page.Reload(JSON-Str_Id) to call all handlers
	  for the given pageType
*/

function PageType(){
	var pageInitializer = new PageInitializer();
	/**	provides convenient methods because allows me to register page types in multiple groups **/
	function PageInitializer(){
		var types = {};
		this.CreateType = function(fn,data,selector,multiSelect){
			return function(){
				fn(data,selector,multiSelect);
			};
		}
		this.AddPageGroup = function(gname,pageType){
			if(typeof types[gname] == "undefined"){
				types[gname] = [];
			}
			var length = types[gname].length;
			types[gname][length] = pageType;
		}
		this.ReloadGroup = function(gname){
			types[gname].forEach(function(elem){
				elem();
			});
		}
	}
	var that = this;
	this.RegisterWebPart = function(idName,selector){
		that[idName] = function(){
			return document.querySelector(selector);
		}
	}
	this.RegisterFunciton = function(fname,fn,sdata){
		that[fname] = function(ddata){return fn(ddata,sdata);};
	}
	this.AddPageGroup = function(gname,pageType){
		pageInitializer.AddPageGroup(gname,pageType);
	}
	this.ReloadGroup = function(gname){
		pageInitializer.ReloadGroup(gname);
	}
	this.CreateType = function(fn,data,selector,multiSelect){
		return pageInitializer.CreateType(fn,data,selector,multiSelect);
	}
}

function Page(){
	this.pageType = new PageType();
	var that = this;
	this.pageType.RegisterFunciton("GetSection",function(){
		var p = location.URLParams();
		var section = Number.parseInt(p.s);
		if(isNaN(section)){
			return 1;
		}else{
			return section;
		}
	});	
	this.pageType.RegisterFunciton("GetArticle",function(){
		var p = location.URLParams();
		var section = Number.parseInt(p.a);
		if(isNaN(section)){
			return 1;
		}else{
			return section;
		}
	});
	this.pageType.RegisterFunciton("LoadSection",function(section){
		section = Number.parseInt(section);
		if(!isNaN(section)){
			if(section > 0 && section < 100){
				location.hash = section;
			}
		}
		this.pageType.ReloadSection();
	});
	this.pageType.RegisterFunciton("SetLanguage",function(sel){
		Localization.SetLanguage(sel.selectedOptions[0].value);
		this.pageType.ReCreatePage();
	});	
	
	/*Creating the page types*/
	/*generate html list of all sections*/
	function GetAllSections(data,selector){
		var menuItems = document.getElementsByClassName("menuitem");	/*Seach for menu items (sections)*/
		if(menuItems.length == 0 /*If they've not been created yet*/){
			menuItems = [];
			var elem = document.querySelector(selector);
			elem.innerHTML = "";
			var sectionNames = document.createElement("div");
			sectionNames.classList.add("categories");
			var scrollPointArea = document.createElement("div");
			scrollPointArea.classList.add("scrollarea");
			for(var i=1 ; i<Data.length; i++){
				var alink = document.createElement("a");
				var scrollPoint = document.createElement("span");
				scrollPoint.classList.add("point");
				//scrollPoint.setAttribute("onclick","FocusOnSection("+i+");");
				alink.classList.add("menuitem");
				menuItems[menuItems.length] = alink;
				alink.setAttribute("href",location.origin + location.pathname + "?s="+i);
				alink.setAttribute("id","sec"+i);
				sectionNames.appendChild(alink);
				scrollPointArea.appendChild(scrollPoint);
			}
			elem.appendChild(sectionNames);
			elem.appendChild(scrollPointArea);
		}
		for(var i=1 ; i<=menuItems.length; i++){
			menuItems[i-1].innerHTML = Localization["Section" + i][Localization.Selected];
		}
	}
	
	/*Get content of one section*/
	function GetLeads(data,selector){
		var elem = document.querySelector(selector);
		elem.innerHTML = "";
		var section = webpage.GetSection();
		var file;
		/**/
		var sel = document.querySelector(".categories>.selected");
		if(!!sel){
			sel.classList.remove("selected");
		}
		sel = document.getElementById("sec"+section);
		if(!!sel){
			sel.classList.add("selected");
		}
		function DoLoad(file,sectionIndex,articleIndex,localizationIndex){
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(obj) {
				if (this.readyState == 4 && this.status == 200) {
					/*prepairing the content*/
					var lead = document.createElement("p");
					lead.innerHTML = this.responseText;
					if(lead.childElementCount == 0){
						lead = [];
						lead[0] = this.responseText;
					}else{
						lead = lead.children;
					}
					/*creating other DOM elements - the root article node*/
					var divArticle = document.createElement("div");
					divArticle.classList.add("article");
					divArticle.setAttribute("id",sectionIndex + "_" + articleIndex + "_" + Data[0][localizationIndex]);
					/*creating other DOM elements - the lead*/
					var divLead = document.createElement("div");
					divLead.classList.add("lead");
					divLead.appendChild(lead[0]);
					var h1 = document.createElement("h1");
					h1.appendChild(Link(Data[sectionIndex][articleIndex][0],localizationIndex));
					/*creating other DOM elements - the rest*/
					/*appending*/
					divArticle.appendChild(h1);
					divArticle.appendChild(divLead);
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
		/**/
		for(var i=0 ; i<Data[section].length; i++){
			if(Data[section][i][Localization.Selected+1]/*translation exists*/){
				file = "./" + section + "/" + (i+1) + "_" + Data[0][Localization.Selected] +"_lead.html";
				DoLoad(file,section,i,Localization.Selected);
			}else{
				if(!document.querySelector("#exclChbox").checked){
					for(var j=0; j<Data[0].length; j++){
						if(j != Localization.Selected){
							if(Data[section][i][j+1]){
								file = "./" + section + "/" + (i+1) + "_" + Data[0][j] + "_lead.html";
								DoLoad(file,section,i,j);
								break;
							}
						}
					}
				}
			}
		}
	}
	
	/**/
	function GetMainContent(){
		var params = location.URLParams();
		if(params.length < 2){
			this.pageType.GetSection();
			
		}else{
			
		}
	}

	var WebTitle = this.pageType.CreateType(function(data,selector){
		var elem = document.querySelector(selector);
		elem.innerHTML = Localization["Section"+that.pageType.GetSection()][Localization.Selected];
	},null,"title");								//WebTitle
	var WebHeadline = this.pageType.CreateType(function(data,selector){
		var elem = document.querySelector(selector);
		var a = document.createElement("a");
		a.setAttribute("href",location.origin + location.pathname);
		a.innerHTML = Localization[data][Localization.Selected];
		elem.innerHTML = "";
		elem.appendChild(a);
	},"WebHeadline",".webheadline");			//WebHeadline	
	var WebMotto = this.pageType.CreateType(function(data,selector){
		var elem = document.querySelector(selector);
		elem.innerHTML = Localization[data][Localization.Selected];
	},"WebMotto00",".webmotto");				//WebMotto
	var Webflags = this.pageType.CreateType(function(data,selector){
		var langFlags = document.querySelectorAll(".webflags label[for='exclChbox'],.webflags span.text");	/*Seach for menu items (sections)*/
		if(langFlags.length == 0 /*If they've not been created yet*/){
			langFlags = [];
			var elem = document.querySelector(selector);
			elem.innerHTML = "";
			var spanLang = document.createElement("span");
			var spanSel = document.createElement("span");
			var sel = document.createElement("select");
			sel.setAttribute("onchange","webpage.SetLanguage(this)");
			spanLang.classList.add("lang");
			spanLang.innerHTML = "+";
			spanLang.setAttribute("onclick","ToggleLangBar(this);");
			spanSel.classList.add("sel");
			spanSel.appendChild(sel);
			spanSel.hidden = true;
			elem.appendChild(spanLang);
			elem.appendChild(spanSel);
			for(var i=0; i<Data[0].length; i++){
				var opt = document.createElement("option");
				opt.setAttribute("value",i);
				opt.innerHTML = Data[0][i];
				sel.appendChild(opt);			
				if(Localization.GetLanguage() == i){
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
			spanHelp.appendChild(spanIcon);
			spanHelp.appendChild(spanText);
			spanSel.appendChild(spanHelp);
			lbl.setAttribute("for","exclChbox");
			spanIcon.innerHTML = "?";
			chckbox.setAttribute("type","checkbox");
			chckbox.setAttribute("id","exclChbox");
			chckbox.setAttribute("onclick","webpage.ReloadSection(this);");
			var ex = Localization.GetExclusively();
			chckbox.checked = ex;
			
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
	},null,".webflags");							//flags
	var WebAllSections = this.pageType.CreateType(GetAllSections,null,"#menu");							//section
	var WebContent = this.pageType.CreateType(GetMainContent,null,".webcontent");							//content
	/*Creating the page groups*/
	this.pageType.AddPageGroup("wholePage",WebTitle);
	this.pageType.AddPageGroup("wholePage",WebHeadline);
	this.pageType.AddPageGroup("wholePage",WebMotto);
	this.pageType.AddPageGroup("wholePage",Webflags);
	this.pageType.AddPageGroup("wholePage",WebAllSections);
	this.pageType.AddPageGroup("wholePage",WebContent);
	this.ReCreatePage = function(){
		this.pageType.ReloadGroup("wholePage");
	};
	this.ChangeLanguage = function(elem){
		Localization.SetExclusively(elem.checked);
		this.pageType.ReCreatePage();
	}
}