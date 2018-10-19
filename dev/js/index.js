/**	
*	This file only contains info which can be directly detected by a PHP function and should 
*	be at least manually regenerated each time anyone adds a translation, article or a section.
*	Data explanation:
*		[0]: 	no languages
*		[1-5]: 	section id,page id, translation in the order defined in the directory number 0.
*				Same articles must have the same id per section
*				
*				e.g. ./1/en/1.html 
*					 ./1/cz/1.html 	Are considered the same articles in different language
*
*					
*				e.g. ./1/en/1.html 
*					 ./2/cz/1.html  Are considered different articles and in different language
**/

/**
	returns: string
**/
function ArticleName(refName,localization){
	return Articles[refName][localization];
}

/**
	returns: string
**/
function ArticleDate(refName){
	return Articles[refName][3];
}

//TODO:
function Link(refName,localization){
	var link = document.createElement("a");
	link.setAttribute("href",location.origin+location.pathname+Articles[refName][2]);
	link.innerHTML = Articles[refName][localization];
	return link;
}

//TODO:
function ArticleLead(refName){
}

var Articles = {
	"Intro":["Introduction","Úvod","?s=1&a=1",/*date*/""],
	"Dating":["About Dating","O Chození","?s=2&a=1","2007"],
	"Dating2":["About Dating 2","O Chození 2","?s=2&a=2","2009"],
	"Passion":["Controlling Passions","Ovládání vášní","?s=2&a=3","2014"],
	"OTvsNT":["What changed: Old Testament -> New Testament","Co se změnilo: Starý Zákon -> Nový Zákon","?s=2&a=4","2013"],
	"Love":["Christian Love","Křesťanská láska","?s=2&a=5","2018"],
	"Stuff":["Other Stuff","Jiné věci","?s=2&a=6","2018"],
	"KrishnaMeat":["(Not)Eating meat from Biblical perspective","O (ne)jezení masa z pohledu Bible","?s=3&a=1","2018"],
	"KrishnaDevil":["You believe in the lies of the Devil!","Vy věříte ďáblovým lžím.","?s=3&a=2","2018"],
	"ReligionMuslim":["Religion vs Jesus","Náboženství a Křesťanství","?s=4&a=1","2018"],
	"GoodNews":["The Gospel means: \"Good News\"","Evangelium znamená: \"Dobrá zpráva\"","?s=5&a=1","2010"],
	"ACell":["Why is Christianity practical, moral and very real?","Proč je křesťanství praktické, morální a opodstatněné?","?s=5&a=2","2017"],
	"FaithIsChoice":["Faith is a choice!","Víra je rozhodnutí!","?s=5&a=3","2017"],
	"Coincidence":["Creation and Coincidence","Stvoření a Náhoda","?s=5&a=4","2012"]
}

var Data = [
	["en","cz"]
,[
	["Intro",true,true]]
,[
	["Dating",false,true],
	["Dating2",false,true],
	["Passion",false,true],
	["OTvsNT",false,true],
	["Love",true,true],
	["Stuff",true,false]]
,[
	["KrishnaMeat",true,false],
	["KrishnaDevil",true,false]]
,[
	["ReligionMuslim",true, false]]
,[
	["GoodNews",false,true],
	["ACell",false,true],
	["FaithIsChoice",true,true],
	["Coincidence",false,true]
 ]
]