var Server = {
	AddWebPart : function(groupName,fn,data,selector,multiSelect){
		multiSelect = multiSelect || false;
		if(typeof Server[groupName] == "undefined"){
			Server[groupName] = [];
		}
		Server[groupName][Server[groupName].length] = function(){fn(data,selector,multiSelect);};
	},
	RunGroup : function(groupName){
		Server[groupName].forEach(function(elem){
			elem();
		});
	},
	Cookie : (function(){
		this.Set = function(cname, cvalue, date) {
			document.cookie = cname + "=" + cvalue + ";" + "expires="+date.toUTCString() + ";";
		}
		this.Get = function(cname) {
			var allcookies = document.cookie.split(';');
			for(var i = 0; i < allcookies.length; i++) {
				var cookie = allcookies[i].split("=");
				if (cookie[0].trim() == cname) {
					return cookie[1];
				}
			}
			return "";
		}
		this.Remove = function(cname){
			var date = new Date();
			date.setYear(2016);
			document.cookie = cname + "=a;" + "expires="+date.toUTCString() + ";";
		}
		return this;
	})()
};


var Localization = {
	/*webparts*/
	"Languages" : ["en","cz"],
	"LangName0noun" : ["english","angličtina"],
	"LangName1noun" : ["czech","čeština"],
	"LangName0adjSHE" : ["english","anglická"],
	"LangName0adjHE" : ["english","anglický"],
	"LangName1adjSHE" : ["czech","česká"],
	"LangName1adjHE" : ["czech","český"],
	"WrongURL" : ["No target matches the given URL!","Zadaný odkaz neodpovídá žádnému výsledku!"],
	"Date" : ["Date","Datum"],
	"Author" : ["Author","Autor"],
	"linkWarning" : ["Note: This article has not been created in the $1 language! You may, however, try to unselect the $2 tickbox in settings.",
					"Upozornění: Článek však nebyl vytvořen v jazyce '$1'! Může zkusit zrušit volbu '$2' v nastavení."],
	"WebHeadline": ["Wise Dove","Chytrá Holubice"],
	"TitleExplanation" : ["Be wise as serpents and innocent as doves.","Buďte chytří jako hadi a nevinní jako holubice."],
	"ExclLangChck": ["Exclusively","Výlučně"],
	"ExclLangHelp": ["If not ticked, all articles on the website will be listed but the selected language will be preffered if translation exists.",
					"Pokud je volba 'Výhradně' nezaškrtnuta, uvidíte výpis všech článků webu, s tím že se upřednostní překlad (pokud existuje) ve zvoleném jazyku."],
	/*sections*/
	"0_Default": ["Wise Dove","Chytrá Holubice"],
	"1_Intro": ["Intro","Úvod"],
	"2_Christ": ["For Christians","Pro křesťany"],
	"3_Krishna": ["For Krishna People","Pro hare Krišny"],
	"4_Muslims": ["For Muslims","Pro muslimy"],
	"5_Nofaith": ["For Non Believers", "Pro nevěřící"],
	"WebMotto000": ["Back then, you all came close and stood at the foot of the mountain. The mountain was blazing with fire up to the sky, with darkness, cloud, and thick smoke!",
					"Tenkrát jste se přiblížili a stáli pod horou. Hora planula ohněm až do samých nebes a kolem byla tma, oblak a mrákota."],
	"WebMotto001": ["But if from there you seek the Lord your God, you will find him if you seek him with all your heart and with all your soul.",
					"Odtamtud budete hledat Hospodina, svého Boha; nalezneš ho , budeš-li ho opravdu hledat celým svým srdcem a celou svou duší."],
	"WebMotto002": ["For the Lord your God is a merciful God; he will not abandon or destroy you or forget the covenant with your ancestors, which he confirmed to them by oath.",
					"Vždyť Hospodin, tvůj Bůh, je Bůh milosrdný, nenechá tě klesnout a nepřipustí tvou zkázu, nezapomene na smlouvu s tvými otci, kterou jim stvrdil přísahou."],
	/*Articles*/
	"Intro":["Introduction","Úvod"],
	"Dating":["About Dating","O Chození"],
	"Dating2":["About Dating 2","O Chození 2"],
	"Passion":["Controlling Passions","Ovládání vášní"],
	"OTvsNT":["What changed: Old Testament -> New Testament","Co se změnilo: Starý Zákon -> Nový Zákon"],
	"Love":["Christian Love","Křesťanská láska","2018"],
	"Stuff":["Other Stuff","Jiné věci","2018"],
	"KrishnaMeat":["(Not)Eating meat from Biblical perspective","O (ne)jezení masa z pohledu Bible"],
	"KrishnaDevil":["You believe in the lies of the Devil!","Vy věříte ďáblovým lžím."],
	"ReligionMuslim":["Religion vs Jesus","Náboženství a Křesťanství","2018"],
	"GoodNews":["The Gospel means: \"Good News\"","Evangelium znamená: \"Dobrá zpráva\""],
	"ACell":["Why is Christianity practical, moral and very real?","Proč je křesťanství praktické, morální a opodstatněné?"],
	"FaithIsChoice":["Faith is a choice!","Víra je rozhodnutí!"],
	"Coincidence":["Creation and Coincidence","Stvoření a Náhoda"]
}

var Content = {
	"Sections":[
		{RefName:"1_Intro",Show:true,Articles:[{RefName:"Intro",Show:true,Translations:[true,true],Date:2018,Author:"DKz"}]},
		{RefName:"2_Christ",Show:true,Articles:[
			{RefName:"Dating",Show:true,Translations:[false,true],Date:2007,Author:"DKz"},
			{RefName:"Dating2",Show:true,Translations:[false,true],Date:2009,Author:"DKz"},
			{RefName:"Passion",Show:true,Translations:[false,true],Date:2014,Author:"DKz"},
			{RefName:"OTvsNT",Show:true,Translations:[false,true],Date:2013,Author:"DKz"},
			{RefName:"Love",Show:true,Translations:[true,true],Date:2018,Author:"DKz"},
			{RefName:"Stuff",Show:true,Translations:[false,false],Date:2018,Author:"DKz"}]
		},
		{RefName:"3_Krishna",Show:true,Articles:[{RefName:"KrishnaMeat",Show:true,Translations:[true,false],Date:2018,Author:"DKz"},{RefName:"KrishnaDevil",Show:true,Translations:[false,false],Date:2018,Author:"DKz"}]},
		{RefName:"4_Muslims",Show:true,Articles:[{RefName:"ReligionMuslim",Show:true,Translations:[true,false],Date:2018,Author:"DKz"}]},
		{RefName:"5_Nofaith",Show:true,Articles:[{RefName:"GoodNews",Show:true,Translations:[false,true],Date:2018,Author:"DKz"},{RefName:"ACell",Show:true,Translations:[false,true],Date:2018,Author:"DKz"},{RefName:"FaithIsChoice",Show:true,Translations:[true,true],Date:2017,Author:"DKz"},{RefName:"Coincidence",Show:true,Translations:[false,true],Date:2012,Author:"DKz"}]}
	],
	"motto" : 3,
	"1_Intro": 0,
	"2_Christ": 1,
	"3_Krishna": 2,
	"4_Muslims": 3,
	"5_Nofaith": 4
}

Content = {...Content,
	AddSection : function(sectionRefName,show){
		if(!Content.Sections){
			Content.Sections = [];
		}
		show = show || true;
		var len = Content.Sections.length;
		if(!Content.Sections[sectionRefName]){
			Content[sectionRefName] = len;
			Content.Sections[len] = {};
			Content.Sections[len].RefName = sectionRefName;
			Content.Sections[len].Show = show;
			Content.Sections[len].Articles = [];
		}
		return len;
	},
	GetArticleByRef : function(ArticleRefName){
		return Content.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 )[0].
				Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName);
	},	
	GetArticleByID : function(sectionID, articleID){
		return Content.Sections[sectionID].Articles[articleID];
	},
	GetArticleIDbyRef : function(ArticleRefName, sectionID){
		var searchedSections = typeof sectionID === "undefined" ? Content.Sections : [Content.Sections[sectionID]];
		var exists = searchedSections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName,searchedSections)[0];
		if(exists !== undefined){
			return exists.Articles.map((o,i) => ({"RefName":o.RefName,"index":i}) ).filter((o,i)=> o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName)[0].index;
		}else{
			return undefined;
		}
	},
	GetSectionByArticleRef : function(ArticleRefName){
		return Content.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName)[0];
	},
	GetSectionIDByArticleRef : function(ArticleRefName){
		return Content[Content.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName)[0]["RefName"]];
	},
	GetSectionRef : function(sectionID){
		return this.IndicesAreCorrect(sectionID) ? Content.Sections[sectionID].RefName : undefined;
	},
	GetSectionID : function(sectionRefName){
		return Content[sectionRefName];
	},
	SetSectionDisabled : function(sectionID,show){
		if(this.IndicesAreCorrect(sectionID)){
			Content.Sections[sectionID].Show = show;
		}
	},
	GetSectionDisabled : function(sectionID){
		return this.IndicesAreCorrect(sectionID) ? Content.Sections[sectionID].Show : undefined;
	},	
	GetSectionEmpty : function(sectionID, translationID){
		if(this.IndicesAreCorrect(sectionID)){
			for(var i=0; i<Content.Sections[sectionID].Articles.length ; i++){
				if(Content.Sections[sectionID].Articles[i].Translations[translationID]){
					return false;
				}
			}
			return true;
		}else{
			return undefined;
		}
	},	
	AddArticle : function(sectionID,articleRefName,translations,date,author,show){
		translations = translations || [false,false];
		show = show || true;
		date = date || "";
		if(Content.Sections && Content.Sections[sectionID]){
			var len = Content.Sections[sectionID].Articles.length;
			Content.Sections[sectionID].Articles[len] = {};
			Content.Sections[sectionID].Articles[len].RefName = articleRefName;
			Content.Sections[sectionID].Articles[len].Translations = translations;
			Content.Sections[sectionID].Articles[len].Date = date;
			Content.Sections[sectionID].Articles[len].Author = author;
			Content.Sections[sectionID].Articles[len].Show = show;
		}
	},		
	/**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
		I can't have a general function GetSections without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
	GetSections : function(translationID, exclusively){
		if(exclusively === undefined){
			console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
		}
		return this.IndicesAreCorrect(undefined,undefined,translationID) ? 
				Content.Sections.filter((o,i) => Content.GetNoArticles(i,translationID,exclusively) > 0) : 
				undefined;
	},		
	/**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
		I can't have a general function GetNoArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
	GetNoArticles : function(sectionID, translationID, exclusively){
		return this.IndicesAreCorrect(sectionID,undefined,translationID) ? Content.Sections[sectionID].Articles.filter(function(o,i){
			if(exclusively === undefined){
				console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
			}
			if(exclusively){
				return o.Translations[translationID];
			}else{
				return o.Translations.reduce((acc,cur) => acc||cur);
			}
		}).length : undefined;
	},
	/**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
		I can't have a general function GetArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
	GetArticles : function(sectionID, translationID, exclusively){
		return this.IndicesAreCorrect(sectionID,undefined,translationID) ? Content.Sections[sectionID].Articles.filter(function(o,i){
			if(exclusively === undefined){
				console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
			}
			if(exclusively){
				return o.Translations[translationID];
			}else{
				return o.Translations.reduce((acc,cur) => acc||cur);
			}
		}) : undefined;
	},
	GetArticleRefName : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID,articleID) ? Content.Sections[sectionID].Articles[articleID].RefName : undefined;
	},
	GetTranslationExists : function(sectionID,articleID,translationID){
		if(this.IndicesAreCorrect(sectionID,articleID,translationID)){
			return this.Sections[sectionID].Articles[articleID].Translations[translationID];
		}else{
			return false;
		}
	},
	GetArticleDate : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID) ? Content.Sections[sectionID].Articles[articleID].Date : undefined;
	},
	GetArticleAuthor : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID,articleID) ? Content.Sections[sectionID].Articles[articleID].Author : undefined;
	},
	SetArticleDisabled : function(sectionID,articleID,show){
		if(this.IndicesAreCorrect(sectionID,articleID)){
			Content.Sections[sectionID].Articles[articleID].Show = show;
		}
	},
	GetArticleDisabled : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID,articleID) ? Content.Sections[sectionID].Articles[articleID].Show : undefined;
	},	
	GetArticleNameByRef : function(refname,translationID){
		var exists = this.GetArticleByRef(refname);
		return typeof exists !== "undefined"
				? Localization[exists[0]["RefName"]][translationID]
				: undefined;
	},
	GetArticleName : function(sectionID,articleID,translationID){
		return this.IndicesAreCorrect(sectionID,articleID,translationID) ? Localization[Content.Sections[sectionID].Articles[articleID].RefName][translationID] : undefined;
	},
	PrintSections : function(){
		var Sections = Content.Sections;
		console.log({ Sections });
	},
	PrintArticles : function(sectionID){
		var Articles = Content.Sections[sectionID].Articles;
		console.log({ Articles });
	},
	GenerateLink : function(ArticleRefName,translationID,title,hash,innerHTML,target){
		var link = document.createElement("a");
		var sectionID = Content.GetSectionID(Content.GetSectionByArticleRef(ArticleRefName).RefName);
		var articleID = Content.GetArticleIDbyRef(ArticleRefName);
		if(typeof sectionID == "number" && typeof articleID == "number"){
			return this.GetLink(sectionID,articleID,translationID,title,hash, innerHTML);
		}else{
			console.error("Incorrect sectionID or articleID");
			return undefined;
		}
	},
	GetLink : function(sectionID,articleID,translationID,title,hash,innerHTML,target){
		var link = document.createElement("a");
		var href = location.origin+location.pathname+"?s="+sectionID+"&a="+articleID;
		if(!!hash){
			href = href+"#"+hash;
		}
		link.setAttribute("href",href);
		if(!!title){
			link.setAttribute("title",title);
		}
		if(!!target){
			link.setAttribute("target",target);
		}
		if(typeof innerHTML != "undefined"){
			link.append(innerHTML);
		}	
		if(!this.IndicesAreCorrect(sectionID,articleID,translationID)){		
			console.error(`Incorrect link IDs (${{link}}) in section ${sectionID} in ${Localization['LangName'][translationID]} article ${articleID}`);
		}
		return link;
	},
	IndicesAreCorrect : function(sectionID,articleID,translationID){
		if(isNaN(translationID)){
			if(isNaN(articleID)){
				return sectionID < Content.Sections.length;
			}else{
				return 	sectionID < Content.Sections.length && 
						articleID < Content.Sections[sectionID].Articles.length;
			}
		}else{
			if(isNaN(articleID)){
				if(isNaN(sectionID)){
					return 	translationID < Content.Sections[0].Articles[0].Translations.length;
				}else{
					return 	sectionID < Content.Sections.length && 
							translationID < Content.Sections[0].Articles[0].Translations.length;
				}
			}else{
				return 	sectionID < Content.Sections.length && 
						articleID < Content.Sections[sectionID].Articles.length && 
						translationID < Content.Sections[sectionID].Articles[articleID].Translations.length;
			}
		}
	}
};


/*	//inheritance example
	function Person(name){
	   var Name = name;
	   this.GetName = function(){console.log(Name);}
	}
	function Student(id,name){
	   Person.call(this,name);
	   var ID = id;
	   this.GetID = function(){console.log("ID:"+this.ID);}
	}
*/