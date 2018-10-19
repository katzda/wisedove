var Localization = {
	"WebHeadline": ["About Christianity","O Křesťanství"],
	"ExclLangChck": ["Exclusively","Výlučně"],
	"ExclLangHelp": ["If there is no article in a section in the desired language but exists in others, you will see it in other language according to your choice.",
						"Pokud v sekci neexistuje článek v požadovaném jazyku, ale existuje v jiných, uvidíte jej v jiném jazyku dle Vaší volby."],
	"Section0": ["Wise Dove","Chytrá Holubice"],
	"Section1": ["Intro","Úvod"],
	"Section2": ["For Christians","Pro křesťany"],
	"Section3": ["For Krishna People","Pro hare Krišny"],
	"Section4": ["For Muslims","Pro muslimy"],
	"Section5": ["For Non Believers", "Pro nevěřící"],
	"WebMotto00": ["Be wise as serpents and innocent as doves.","Buďte chytří jako hadi a bezelstní jako holubice."],
	"WebMotto01": ["God loves a cheerful giver.","Ochotného dárce miluje Bůh"],
}

Localization.SetLanguage = function(id_lang){
	id_lang = Number.parseInt(id_lang);
	if(!isNaN(id_lang)){
		var date = new Date();
		date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
		var cookieHandler = new CookieHandler();
		cookieHandler.SetCookieValue("language",id_lang,date);
		Localization.Selected = id_lang;
	}
}

Localization.GetLanguage = function(){
	if(typeof Localization.Selected === "undefined"){
		var cookieHandler = new CookieHandler();
		Localization.Selected = Number.parseInt(cookieHandler.GetCookieValue("language"));
		if (isNaN(Localization.Selected)) {
			Localization.SetLanguage(0);
			Localization.Selected = 0;
		}
	}
	return Localization.Selected;
}

Localization.SetExclusively = function(bool_exclusively){
	if(typeof bool_exclusively != "undefined"){
		var date = new Date();
		date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
		var cookieHandler = new CookieHandler();
		cookieHandler.SetCookieValue("langExclusively",bool_exclusively.toString(),date);
		Localization.Exclusively = bool_exclusively;
	}
}

Localization.GetExclusively = function(){
	if(typeof Localization.Exclusively === "undefined"){
		var cookieHandler = new CookieHandler();
		var cv = cookieHandler.GetCookieValue("langExclusively");
		if (cv === "") {
			Localization.SetExclusively(false);
			Localization.Exclusively = false;
		}else{
			Localization.Exclusively = cv.toLowerCase() === "true";
		}
	}
	return Localization.Exclusively;
}

