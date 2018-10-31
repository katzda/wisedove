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
	"WebHeadline": ["About Christianity","O Křesťanství"],
	"ExclLangChck": ["Exclusively","Výlučně"],
	"ExclLangHelp": ["If there is no article in a section in the desired language but exists in others, you will see it in other language according to your choice.",
						"Pokud v sekci neexistuje článek v požadovaném jazyku, ale existuje v jiných, uvidíte jej v jiném jazyku dle Vaší volby."],
	/*sections*/
	"0_Default": ["Wise Dove","Chytrá Holubice"],
	"1_Intro": ["Intro","Úvod"],
	"2_Christ": ["For Christians","Pro křesťany"],
	"3_Krishna": ["For Krishna People","Pro hare Krišny"],
	"4_Muslims": ["For Muslims","Pro muslimy"],
	"5_Nofaith": ["For Non Believers", "Pro nevěřící"],
	"WebMotto000": ["Be wise as serpents and innocent as doves.","Buďte chytří jako hadi a bezelstní jako holubice."],
	"WebMotto001": ["God loves a cheerful giver.","Ochotného dárce miluje Bůh"],
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
		{RefName:"1_Intro",Show:true,Articles:[{RefName:"Intro",Show:true,Translations:[true,true],Date:"",Author:"DKz"}]},
		{RefName:"2_Christ",Show:true,Articles:[
			{RefName:"Dating",Show:true,Translations:[false,true],Date:2007,Author:"DKz"},
			{RefName:"Dating2",Show:true,Translations:[false,true],Date:2009,Author:"DKz"},
			{RefName:"Passion",Show:true,Translations:[false,true],Date:2014,Author:"DKz"},
			{RefName:"OTvsNT",Show:true,Translations:[false,true],Date:2013,Author:"DKz"},
			{RefName:"Love",Show:true,Translations:[true,true],Date:2018,Author:"DKz"},
			{RefName:"Stuff",Show:true,Translations:[true,false],Date:2018,Author:"DKz"}]
		},
		{RefName:"3_Krishna",Show:true,Articles:[{RefName:"KrishnaMeat",Show:true,Translations:[true,false],Date:2018,Author:"DKz"},{RefName:"KrishnaDevil",Show:true,Translations:[true,false],Date:2018,Author:"DKz"}]},
		{RefName:"4_Muslims",Show:true,Articles:[{RefName:"ReligionMuslim",Show:true,Translations:[true,false],Date:2018,Author:"DKz"}]},
		{RefName:"5_Nofaith",Show:true,Articles:[{RefName:"GoodNews",Show:true,Translations:[false,true],Date:2018,Author:"DKz"},{RefName:"ACell",Show:true,Translations:[false,true],Date:2018,Author:"DKz"},{RefName:"FaithIsChoice",Show:true,Translations:[true,true],Date:2017,Author:"DKz"},{RefName:"Coincidence",Show:true,Translations:[false,true],Date:2012,Author:"DKz"}]}
	],
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
	GetSectionRef : function(sectionID){
		return Content.Sections[sectionID].RefName;
	},
	GetSectionID : function(sectionRefName){
		return Content[sectionRefName];
	},
	SetSectionShown : function(sectionID,show){
		if(this.IndexIsCorrect(sectionID)){
			Content.Sections[sectionID].Show = show;
		}
	},
	GetSectionShown : function(sectionID){
		return this.IndexIsCorrect(sectionID) ? Content.Sections[sectionID].Show : null;
	},	
	GetSectionEmpty : function(sectionID, translationID){
		if(this.IndexIsCorrect(sectionID)){
			for(var i=0; i<Content.Sections[sectionID].Articles.length ; i++){
				if(Content.Sections[sectionID].Articles[i].Translations[translationID]){
					return false;
				}
			}
			return true;
		}else{
			return null;
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
	GetNoArticles : function(sectionID){
		return this.IndexIsCorrect(sectionID) ? Content.Sections[sectionID].Articles.length : null;
	},
	GetArticleRefName : function(sectionID,articleID){
		return this.IndexIsCorrect(sectionID) ? Content.Sections[sectionID].Articles[articleID].RefName : null;
	},
	GetTranslationExists : function(sectionID,articleID,translationID){
		if(this.IndicesAreCorrect(sectionID,articleID,translationID)){
			return this.Sections[sectionID].Articles[articleID].Translations[translationID];
		}else{
			return false;
		}
	},
	GetArticleDate : function(sectionID,articleID){
		return this.IndexIsCorrect(sectionID) ? Content.Sections[sectionID].Articles[articleID].Date : null;
	},
	GetArticleAuthor : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID,articleID) ? Content.Sections[sectionID].Articles[articleID].Author : null;
	},
	SetArticleShown : function(sectionID,articleID,show){
		if(this.IndicesAreCorrect(sectionID,articleID)){
			Content.Sections[sectionID].Articles[articleID].Show = show;
		}
	},
	GetArticleShown : function(sectionID,articleID){
		return this.IndicesAreCorrect(sectionID,articleID) ? Content.Sections[sectionID].Articles[articleID].Show : null;
	},	
	GetArticleName : function(sectionID,articleID,translationID){
		return this.IndicesAreCorrect(sectionID,articleID,translationID) ? Localization[Content.Sections[sectionID].Articles[articleID].RefName][translationID] : null;
	},
	PrintSections : function(){
		var Sections = Content.Sections;
		console.log({ Sections });
	},
	PrintArticles : function(sectionID){
		var Articles = Content.Sections[sectionID].Articles;
		console.log({ Articles });
	},
	GenerateLink : function(sectionID,articleID,translationID){
		var link = document.createElement("a");
		link.setAttribute("href",location.origin+location.pathname+"?s="+sectionID+"&a="+articleID);
		link.innerHTML = this.GetArticleName(sectionID,articleID,translationID);
		return link;
	},
	IndexIsCorrect : function(sectionID){
		return sectionID < Content.Sections.length;
	},
	IndicesAreCorrect : function(sectionID,articleID,translationID){
		if(isNaN(translationID)){
			return 	sectionID < Content.Sections.length && 
					articleID < Content.Sections[sectionID].Articles.length;
		}else{
			return 	sectionID < Content.Sections.length && 
					articleID < Content.Sections[sectionID].Articles.length && 
					translationID < Content.Sections[sectionID].Articles[articleID].Translations.length;
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