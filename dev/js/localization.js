var Localization = {
	"WebHeadline": ["About Christianity","O Křesťanství"],
	"WebTitle": ["Wise Dove","Chytrá Holubice"],
	"WebMotto": ["Be wise as serpents and innocent as doves.","Buďte chytří jako hadi a bezelstní jako holubice."],
	"ExclLangChck": ["Exclusively","Výlučně"],
	"ExclLangHelp": ["If there is no article in a section in the desired language but exists in others, you will see it in other language according to your choice.",
						"Pokud v sekci neexistuje článek v požadovaném jazyku, ale existuje v jiných, uvidíte jej v jiném jazyku dle Vaší volby."],
	"Section1": ["Intro","Úvod"],
	"Section2": ["For Christians","Pro křesťany"],
	"Section3": ["For Krishna People","Pro hare Krišny"],
	"Section4": ["For Muslims","Pro muslimy"],
	"Section5": ["For Non Believers", "Pro nevěřící"]
}

Localization.GetLanguage = function(){
	if(typeof Localization.Selected === "undefined"){
		var cookieHandler = new CookieHandler();
		Localization.Selected = Number.parseInt(cookieHandler.GetCookieValue("language"));
		if (isNaN(Localization.Selected)) {
			Localization.SetLanguage(0,true);
		}
	}
	return Localization.Selected;
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

