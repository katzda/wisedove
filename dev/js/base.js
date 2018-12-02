/*version 2.2*/
document.onload = Configure();
function Configure(){	
	window.page = new WiseDove();
	Server.AddWebPart("Change",page.ChangeWebTitle,Content.GetSectionRef(page.GetSectionID()));
	Server.AddWebPart("Change",page.ChangeWebMotto,["WebMotto",0,Content["motto"]-1,10,20],".webmotto",true);
	Server.AddWebPart("Change",page.ChangeWebHeadline,"WebHeadline",".webheadline");
	Server.AddWebPart("Change",page.ReCreateListOfSections,Localization.Languages,"menu");
	Server.AddWebPart("Change",page.GetMainPageContent,null,".partB");
	Server.AddWebPart("Change",page.ReCreateWebflags,Localization.Languages,".webflags");
	Server.AddWebPart("Change",page.UpdateLinks);
	Server.AddWebPart("CreatePage",page.StartWebMotto,["WebMotto",0,Content["motto"]-1,10000,20000],".webmotto");
	Server.AddWebPart("CreatePage",page.ReCreateWebflags,Localization.Languages,".webflags");
	Server.AddWebPart("CreatePage",page.ReCreateListOfSections,Localization.Languages,"menu");
	Server.AddWebPart("CreatePage",page.GetMainPageContent,null,".partB");
	Server.AddWebPart("CreatePage",page.ChangeWebHeadline,"WebHeadline",".webheadline");
	Server.AddWebPart("CreatePage",page.HideOnlineArticleLink,null,"#footer>a");
	
	Content.SetSectionDisabled(Content["4_Muslims"],false);
	Content.SetArticleDisabled(Content["3_Krishna"],1,false);
	
	document.addEventListener("FileLoaded",page.UpdateLinks,false);
}



/*User handler*/
function SetExclusivelyCheckboxHandler(isChecked){
	page.SetExclusively(isChecked);
	Server.RunGroup('Change');
}
function SetLanguageSelectHandler(languageID){
	page.SetLanguage(languageID);
	Server.RunGroup('Change');
}

function WiseDove(){
	var that = this;
	this.ReCreateListOfSections = function(data,selector){
		var menuItems = document.getElementsByClassName("menuitem");
		var sections = Content.GetSections(page.GetSelectedLanguageID(),page.GetExclusively()).map((o,i) => ({"secID":Content.GetSectionID(o.RefName),...o}));
		if(menuItems.length != sections.length){
			menuItems = [];
			var elem = document.getElementById(selector);
			elem.innerHTML = "";
			var sectionNames = document.createElement("div");
			sectionNames.classList.add("categories");
			var scrollPointArea = document.createElement("div");
			scrollPointArea.classList.add("scrollarea");
			for(var i=0 ; i<sections.length; i++){
				var secID = sections[i]["secID"];
				var alink = document.createElement("a");
				var scrollPoint = document.createElement("span");
				scrollPoint.classList.add("point");
				//scrollPoint.setAttribute("onclick","FocusOnSection("+i+");");
				alink.classList.add("menuitem");
				menuItems[menuItems.length] = alink;
				alink.setAttribute("href",location.origin + location.pathname + "?s="+secID);
				alink.setAttribute("id","sec"+i);
				sectionNames.appendChild(alink);
				scrollPointArea.appendChild(scrollPoint);
			}
			elem.appendChild(sectionNames);
			elem.appendChild(scrollPointArea);
		}
		for(var i=0 ; i<sections.length; i++){
			menuItems[i].innerHTML = Localization[sections[i].RefName][page.GetSelectedLanguageID()];
		}
	}
	this.UpdateLinks = function(){
		document.querySelectorAll("span.link:not(.generated)").forEach(function(elem){
			elem.classList.add("generated");
			var refname = elem.dataset["refname"];
			var title = elem.dataset["title"];
			var hash = elem.dataset["hash"];
			var target = elem.dataset["target"];
			var langID = page.GetSelectedLanguageID();
			var language = page.GetArticleLanguage(refname,langID,page.GetExclusively());
			var warning;
			if(typeof language === "undefined"){
				var linkWarning = Localization["linkWarning"][page.GetSelectedLanguageID()];
				linkWarning = linkWarning
								.replace("$1",Localization[`LangName${langID}noun`][langID])
								.replace("$2",Localization["ExclLangChck"][langID]);
				title = (!!title ? (title) : "") + " " + linkWarning;
			}
			var innerHTML = elem.dataset["innerHTML"];
			if(typeof refname != "string"){
				console.error(`Incorrect link's RefName: ${refname}`);
			}else{
				langID = page.GetArticleLanguage(refname, langID,false);
				innerHTML = Content.GetArticleNameByRef(refname,langID);
				var link = Content.GenerateLink(refname,langID,title,hash,innerHTML,target);
				elem.append(link);
			}
		});
	}
	this.ChangeWebTitle = function(refName,selector){
		var elem = document.getElementsByTagName("title")[0];
		elem.innerHTML = Localization[refName][page.GetSelectedLanguageID()];
	}
	this.ChangeWebHeadline = function(refName,selector){
		var elem = document.querySelector(selector);
		var a = elem.querySelector("a");
		if(!a){
			a = document.createElement("a");
			a.setAttribute("href",location.origin + location.pathname);
			elem.appendChild(a);
		}
		a.innerHTML = Localization[refName][page.GetSelectedLanguageID()];
	}
	var stopWebMotto = false;
	this.StopWebMotto = function(){
		stopWebMotto = true;
	}
	this.StartWebMotto = function(data,selector){
		stopWebMotto = false;
		that.ChangeWebMotto(data,selector);
	}
	this.ChangeWebMotto = function(data,selector,skip){
		/*example:
			data: ['WebMotto',min_number,max_number] 
			selector: ".webmotto"
			skip : boolean
		*/
		skip = skip || false;
		var elem = document.querySelector(selector);
		var numberRef = parseInt(Math.round(data[1]+Math.random()*(data[2]-data[1])));
		if(numberRef < 100){
			if(numberRef < 10){
				numberRef = "00"+numberRef;
			}else{
				numberRef = "0"+numberRef;
			}
		}
		var textRef = data[0]+numberRef;
		elem.innerHTML = Localization[textRef][page.GetSelectedLanguageID()];
		if(!stopWebMotto && !skip){
			setTimeout(that.ChangeWebMotto,data[3]+Math.random()*(data[4]-data[3]),data,selector);
		}
	}
	this.ReCreateWebflags = function(data,selector){
		var langFlags = document.querySelectorAll(".webflags label[for='exclChbox'],.webflags span.text");	/*Seach for menu items (sections)*/
		if(langFlags.length == 0 /*If they've not been created yet*/){
			langFlags = [];
			var elem = document.querySelector(selector);
			elem.innerHTML = "";
			var spanLang = document.createElement("span");
			var spanSel = document.createElement("span");
			var sel = document.createElement("select");
			sel.setAttribute("onchange","SetLanguageSelectHandler(this.options[this.selectedIndex].value);");
			spanLang.classList.add("lang");
			spanLang.innerHTML = "+";
			spanLang.setAttribute("onclick","page.ToggleLangBar(this);");
			spanSel.classList.add("sel");
			spanSel.appendChild(sel);
			spanSel.hidden = true;
			elem.appendChild(spanLang);
			elem.appendChild(spanSel);
			for(var languageID=0; languageID<page.GetNumberOfLanguages(); languageID++){
				var opt = document.createElement("option");
				opt.setAttribute("value",languageID);
				opt.innerHTML = data[languageID];
				sel.appendChild(opt);			
				if(page.GetSelectedLanguageID() == languageID){
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
			lbl.setAttribute("for","exclChbox");
			spanIcon.innerHTML = "?";
			chckbox.setAttribute("type","checkbox");
			chckbox.setAttribute("id","exclChbox");
			chckbox.setAttribute("onclick","SetExclusivelyCheckboxHandler(this.checked);");
			var ex = page.GetExclusively();
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
		langFlags[0].innerHTML = Localization.ExclLangChck[page.GetSelectedLanguageID()];
		langFlags[1].innerHTML = Localization.ExclLangHelp[page.GetSelectedLanguageID()];
	}			//flags
	this.SetExclusively = function(bool_exclusively){
		var date = new Date();
		date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
		Server.Cookie.Set("langExclusively",bool_exclusively.toString(),date);
		page.Exclusively = bool_exclusively;
	}
	this.GetExclusively = function(){
		if(isNaN(page.Exclusively) || page.Exclusively==null){
			var cv = Server.Cookie.Get("langExclusively");
			if (cv === "") {
				page.SetExclusively(true);
			}else{
				page.Exclusively = cv.toLowerCase() === "true";
			}
		}
		return page.Exclusively;
	}
	this.SetLanguage = function(id_lang){
		id_lang = Number.parseInt(id_lang);
		if(!isNaN(id_lang)){
			var date = new Date();
			date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
			Server.Cookie.Set("language",id_lang,date);
			page.Selected = id_lang;
		}
	}
	this.GetSelectedLanguageID = function(){
		if(isNaN(page.Selected)){
			page.Selected = Number.parseInt(Server.Cookie.Get("language"));
			if (isNaN(page.Selected)) {
				page.SetLanguage(0);
			}
		}
		return page.Selected;
	},
	this.ToggleLangBar = function(elem){
		var sel = document.querySelector(".webflags>.sel");
			sel.hidden = !sel.hidden;
		if (sel.hidden) {
			elem.innerHTML = "+";
		} else {
			elem.innerHTML = "-";
		}
	}
	this.HideOnlineArticleLink = function(data, selector){
		if(location.host != "localhost"){
			document.querySelector(selector).hidden = true;
		}
	},
	this.URLParams = function() {
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
			qi = qi.map(function(n) {return decodeURIComponent(n)});
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
				} else {
					if (typeof (qso[qi[0]]) == "object") {
						if (qi[1] == "") {qi[1] = null;}
						qso[qi[0]].push(qi[1]);
					}
				}
			} else {// If no key exists just set it as a string
				if (qi[1] == "") {
					qi[1] = null;
				}
				qso[qi[0]] = qi[1];
			}
		}
		return qso;
	}
	/*Only extracts the number from URL: e.g. ?s=1*/
	this.GetSectionID = function(){
		var p = this.URLParams();
		var sectionID = Number.parseInt(p.s);
		if(isNaN(sectionID)){
			return 0;
		}else{
			return sectionID;
		}
	}
	/*Only extracts the number from URL: e.g. ?a=1*/
	this.GetSectionArticleID = function(){
		return Number.parseInt(this.URLParams().a);
	}
	/*handles the loading icon*/
	this.LoadingIcon = (function(){
		this.ArticlesRemaining = 0;
		function SetLoadingIcon(isEnabled){
			if(isEnabled){
				document.getElementsByTagName("html")[0].classList.add("loading");
			}else{
				document.getElementsByTagName("html")[0].classList.remove("loading");
			}
		}
		this.Reset = function(){
			this.ArticlesRemaining = 0;
		}
		this.AddLoadingAmount = function(integer){
			this.ArticlesRemaining += integer;
			if(this.ArticlesRemaining > 0){
				SetLoadingIcon(true);
			}
		}
		this.ReleaseLoadingAmount = function(integer){
			this.ArticlesRemaining -= integer;
			if(this.ArticlesRemaining == 0){
				SetLoadingIcon(false);
			}
		}
		return this;
	})();
	this.GetArticleLanguage = function(refname, translationID,exclusively){
		/*get the article langID of translationID. But if exclusively, select a different language*/
		/*which different language do I choose, for now any one*/
		var sectionID = Content.GetSectionIDByArticleRef(refname);
		var articleID = Content.GetArticleIDbyRef(refname,sectionID);
		var selLang = Content.Sections[sectionID].Articles[articleID].Translations.map((o,i)=>({"bool":o,"i":i})).filter((o,i) => ((exclusively && o["bool"] && i==translationID) || (!exclusively && o["bool"])));
		var prefLang = selLang.getIndex({i:translationID},function(o1,o2){return o1["i"]==o2["i"]});
		if(!isNaN(prefLang)){
			return selLang[prefLang]["i"];
		}else{
			if(selLang.length > 0){
				/*return the first other available - hey no priorities here!!!??*/
				return selLang[0]["i"];
			}else{
				console.warn(`No language found for article ${articleID} in section ${sectionID}!`);
				return undefined;
			}
		}
	}
	this.GetMainPageContent = function(data,contentSelector){
		that.LoadingIcon.Reset();
		var exists = document.querySelector(contentSelector).innerHTML="";
		var sectionID = page.GetSectionID();
		var articleID = page.GetSectionArticleID();
		var onlyLeads = isNaN(articleID);
		var langID = page.GetSelectedLanguageID();
		var excl = page.GetExclusively();
		var allArticles = onlyLeads /*true == articleID is not defined*/ 
						? Content.GetArticles(sectionID,langID,excl).map(function(o,i){
								var id = Content.GetArticleIDbyRef(o.RefName,sectionID);
								return {"articleID" : id,"langID" : page.GetArticleLanguage(o.RefName,langID,excl)}; 
							}) 	
						: [{"articleID" : articleID,
							"langID" : page.GetArticleLanguage(Content.GetArticleRefName(sectionID,articleID),langID,excl) 
						}];
		var fileExtension = onlyLeads ? "_lead.html" : ".html";
		var sel = document.querySelector(".categories>.selected");
		if(!!sel){
			sel.classList.remove("selected");
		}
		sel = document.getElementById("sec"+sectionID);
		if(!!sel){
			sel.classList.add("selected");
		}
		allArticles.forEach(function(article){
			var langID = article["langID"];
			if(typeof langID !== "undefined" /*if no language exists then do not try loading it*/){
				that.LoadingIcon.AddLoadingAmount(1);
				var artID = article["articleID"];
				var langTxt = page.GetLanguageRefName(langID);
				
				var file = "./" + (sectionID+1) + "/" + (artID+1) + "_" +langTxt + fileExtension;
				var data = [sectionID,artID,langID,onlyLeads,contentSelector];
				LoadFile(file,RenderContent,data);
			}
		});
		function LoadFile(file,renderContentCallback,data){
			var xhttp = new XMLHttpRequest();
			function PrepareResponse(response){
				/*prepairing the content*/
				var lead = document.createElement("p");
				lead.innerHTML = response;
				if(lead.childElementCount == 0){
					lead = [];
					lead[0] = response;
				}else{
					lead = lead.children;
				}
				return lead;
			}
			xhttp.onreadystatechange = function(obj) {
				if (this.readyState == 4 && this.status == 200) {
					data.splice(0,0,PrepareResponse(this.responseText));
					renderContentCallback(data);
					document.dispatchEvent(new Event('FileLoaded'));
				}
			};
			xhttp.open("GET", file);
			xhttp.send();
		}
		function RenderContent(data){
			var txt = data[0];			
			var secID = data[1];		/*ID in the data structure Content*/
			var artID = data[2];		/*ID in the data structure Content*/
			var langID = data[3];		
			var onlyLeads = data[4];	
			var selector = data[5];		
			that.LoadingIcon.ReleaseLoadingAmount(1);
			var elem = document.querySelector(selector);
			var divArticle = document.createElement("div");
			divArticle.classList.add("article");
			var id = secID + "_" + artID + "_" + page.GetLanguageRefName(langID);
			divArticle.setAttribute("id",artID);
			var divLead = document.createElement("div");
			divLead.classList.add((onlyLeads ? "lead" : "content"));
			while(txt.length > 0){
				divLead.appendChild(txt[0]);
			}
			if(onlyLeads){
				var h1 = document.createElement("h1");
				var br = document.createElement("br");
				var author = Content.GetArticleAuthor(secID,artID);
				var date = Content.GetArticleDate(secID,artID);
				var spanOtherInfo;
				if(author || date){
					spanOtherInfo = document.createElement("span");
					spanOtherInfo.setAttribute("class","meta");
				}
				if(author){
					var spanAuthor = document.createElement("span");
					spanAuthor.setAttribute("class","author");
					spanAuthor.innerHTML = Localization["Author"][langID] + ": "+author;
					spanOtherInfo.appendChild(spanAuthor);
				}
				if(date){
					var spanDate = document.createElement("span");
					spanDate.setAttribute("class","date");
					spanDate.innerHTML = Localization["Date"][langID] + ": "+date;
					spanOtherInfo.appendChild(spanDate);
				}
				var titleLink = document.createElement("span");
				titleLink.classList.add("link");
				titleLink.dataset["refname"] = Content.GetArticleRefName(secID,artID);
				h1.appendChild(titleLink);
				if(spanOtherInfo){
					h1.appendChild(document.createElement("br"));
					h1.appendChild(spanOtherInfo);
				}
				divArticle.appendChild(h1);
			}
			divArticle.appendChild(divLead);
			var index = elem.BinaryInsert(divArticle,function(A,B){
				/*comparator*/
				var iA = Number.parseInt(A.id.split("_")[1]);
				var iB = Number.parseInt(B.id.split("_")[1]);
				if(iA<iB) return 1; else if(iA==iB) return 0; else return -1;
			});
			console.log(Array.from(elem.children).toString(function(child){
				return child.id;
			}));
		}
	}
	
	this.GetNumberOfLanguages = function(){
		return Localization.Languages.length;
	}
	this.GetLanguageRefName = function(languageID){
		return Localization.Languages[languageID];
	}
	this.GetLanguageRefName = function(languageID){
		return Localization.Languages[languageID];
	}
};
Server.RunGroup("CreatePage");