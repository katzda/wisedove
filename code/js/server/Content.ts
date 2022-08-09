class Content{

    private data: {};

    public constructor(){
        this.data = {
            "Sections": [
                { RefName: "1_Intro", Show: true, Articles: [{ RefName: "Intro", Show: true, Translations: [true, true], Date: 2018, Author: "DKz" }] },
                {
                    RefName: "2_Christ", Show: true, Articles: [
                        { RefName: "Dating", Show: true, Translations: [false, true], Date: 2007, Author: "DKz" },
                        { RefName: "Dating2", Show: true, Translations: [false, true], Date: 2009, Author: "DKz" },
                        { RefName: "Passion", Show: true, Translations: [false, true], Date: 2014, Author: "DKz" },
                        { RefName: "OTvsNT", Show: true, Translations: [false, true], Date: 2013, Author: "DKz" },
                        { RefName: "Love", Show: true, Translations: [true, true], Date: 2018, Author: "DKz" },
                        { RefName: "Stuff", Show: true, Translations: [false, false], Date: 2018, Author: "DKz" }]
                },
                { RefName: "3_Krishna", Show: true, Articles: [{ RefName: "KrishnaMeat", Show: true, Translations: [true, false], Date: 2018, Author: "DKz" }, { RefName: "KrishnaDevil", Show: true, Translations: [false, false], Date: 2018, Author: "DKz" }] },
                { RefName: "4_Muslims", Show: true, Articles: [{ RefName: "ReligionMuslim", Show: true, Translations: [true, false], Date: 2018, Author: "DKz" }] },
                { RefName: "5_Nofaith", Show: true, Articles: [{ RefName: "GoodNews", Show: true, Translations: [false, true], Date: 2018, Author: "DKz" }, { RefName: "ACell", Show: true, Translations: [false, true], Date: 2018, Author: "DKz" }, { RefName: "FaithIsChoice", Show: true, Translations: [true, true], Date: 2017, Author: "DKz" }, { RefName: "Coincidence", Show: true, Translations: [false, true], Date: 2012, Author: "DKz" }] }
            ],
            "motto": 3,
            "1_Intro": 0,
            "2_Christ": 1,
            "3_Krishna": 2,
            "4_Muslims": 3,
            "5_Nofaith": 4
        };
    }

    public AddSection (sectionRefName,show){
        if(!this.data.Sections){
            this.data.Sections = [];
        }
        show = show || true;
        var len = this.data.Sections.length;
        if(!this.data.Sections[sectionRefName]){
            this.data[sectionRefName] = len;
            this.data.Sections[len] = {};
            this.data.Sections[len].RefName = sectionRefName;
            this.data.Sections[len].Show = show;
            this.data.Sections[len].Articles = [];
        }
        return len;
    }

    public GetArticleByRef(ArticleRefName){
        return this.data.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 )[0].
                Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName);
    }

    public GetArticleByID(sectionID, articleID){
        return this.data.Sections[sectionID].Articles[articleID];
    }

    public GetArticleIDbyRef(ArticleRefName, sectionID){
        var searchedSections = typeof sectionID === "undefined" ? this.data.Sections : [this.data.Sections[sectionID]];
        var exists = searchedSections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName,searchedSections)[0];
        if(exists !== undefined){
            return exists.Articles.map((o,i) => ({"RefName":o.RefName,"index":i}) ).filter((o,i)=> o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName)[0].index;
        }else{
            return undefined;
        }
    }

    public GetSectionByArticleRef(ArticleRefName){
        return this.data.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName)[0];
    }

    public GetSectionIDByArticleRef(ArticleRefName){
        return this.data[this.data.Sections.filter((o,i) => o.Articles.filter((o,i)=>o.RefName.toUpperCase() == ArticleRefName.toUpperCase(),ArticleRefName).length > 0 ,ArticleRefName)[0]["RefName"]];
    }
    public GetSectionRef(sectionID){
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].RefName : undefined;
    }
    public GetSectionID(sectionRefName){
        return this.data[sectionRefName];
    }
    public SetSectionDisabled(sectionID,show){
        if(this.IndicesAreCorrect(sectionID)){
            this.data.Sections[sectionID].Show = show;
        }
    }
    public GetSectionDisabled(sectionID){
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].Show : undefined;
    }

    public GetSectionEmpty(sectionID, translationID){
        if(this.IndicesAreCorrect(sectionID)){
            for(var i=0; i<this.data.Sections[sectionID].Articles.length ; i++){
                if(this.data.Sections[sectionID].Articles[i].Translations[translationID]){
                    return false;
                }
            }
            return true;
        }else{
            return undefined;
        }
    }

    public AddArticle(sectionID,articleRefName,translations,date,author,show){
        translations = translations || [false,false];
        show = show || true;
        date = date || "";
        if(this.data.Sections && this.data.Sections[sectionID]){
            var len = this.data.Sections[sectionID].Articles.length;
            this.data.Sections[sectionID].Articles[len] = {};
            this.data.Sections[sectionID].Articles[len].RefName = articleRefName;
            this.data.Sections[sectionID].Articles[len].Translations = translations;
            this.data.Sections[sectionID].Articles[len].Date = date;
            this.data.Sections[sectionID].Articles[len].Author = author;
            this.data.Sections[sectionID].Articles[len].Show = show;
        }
    }
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetSections without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    public GetSections(translationID, exclusively){
        if(exclusively === undefined){
            console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
        }
        return this.IndicesAreCorrect(undefined,undefined,translationID) ?
                this.data.Sections.filter((o,i) => this.data.GetNoArticles(i,translationID,exclusively) > 0) :
                undefined;
    }
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetNoArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    public GetNoArticles(sectionID, translationID, exclusively){
        return this.IndicesAreCorrect(sectionID,undefined,translationID) ? this.data.Sections[sectionID].Articles.filter(function(o,i){
            if(exclusively === undefined){
                console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
            }
            if(exclusively){
                return o.Translations[translationID];
            }else{
                return o.Translations.reduce((acc,cur) => acc||cur);
            }
        }).length : undefined;
    }
    /**	exclusively shouldn't be here because this is a back-end structure but maybe it's more readable than having this functionality created externally (like a plugin function)
        I can't have a general function GetArticles without thise "exclusively" because this would get me articles that are not filtered out relevantly.**/
    public GetArticles(sectionID, translationID, exclusively){
        return this.IndicesAreCorrect(sectionID,undefined,translationID) ? this.data.Sections[sectionID].Articles.filter(function(o,i){
            if(exclusively === undefined){
                console.error("Parameter 'Exclusively' not passed into GetSection(translationID,exclusively)");
            }
            if(exclusively){
                return o.Translations[translationID];
            }else{
                return o.Translations.reduce((acc,cur) => acc||cur);
            }
        }) : undefined;
    }
    public GetArticleRefName(sectionID,articleID){
        return this.IndicesAreCorrect(sectionID,articleID) ? this.data.Sections[sectionID].Articles[articleID].RefName : undefined;
    }
    public GetTranslationExists(sectionID,articleID,translationID){
        if(this.IndicesAreCorrect(sectionID,articleID,translationID)){
            return this.Sections[sectionID].Articles[articleID].Translations[translationID];
        }else{
            return false;
        }
    }
    public GetArticleDate(sectionID,articleID){
        return this.IndicesAreCorrect(sectionID) ? this.data.Sections[sectionID].Articles[articleID].Date : undefined;
    }
    public GetArticleAuthor(sectionID,articleID){
        return this.IndicesAreCorrect(sectionID,articleID) ? this.data.Sections[sectionID].Articles[articleID].Author : undefined;
    }
    public SetArticleDisabled(sectionID,articleID,show){
        if(this.IndicesAreCorrect(sectionID,articleID)){
            this.data.Sections[sectionID].Articles[articleID].Show = show;
        }
    }
    public GetArticleDisabled(sectionID,articleID){
        return this.IndicesAreCorrect(sectionID,articleID) ? this.data.Sections[sectionID].Articles[articleID].Show : undefined;
    }
    public GetArticleNameByRef(refname,translationID){
        var exists = this.GetArticleByRef(refname);
        return typeof exists !== "undefined"
                ? Localization[exists[0]["RefName"]][translationID]
                : undefined;
    }
    public GetArticleName(sectionID,articleID,translationID){
        return this.IndicesAreCorrect(sectionID,articleID,translationID) ? Localization[this.data.Sections[sectionID].Articles[articleID].RefName][translationID] : undefined;
    }
    public PrintSections(){
        var Sections = this.data.Sections;
        console.log({ Sections });
    }
    public PrintArticles(sectionID){
        var Articles = this.data.Sections[sectionID].Articles;
        console.log({ Articles });
    }
    public GenerateLink(ArticleRefName,translationID,title,hash,innerHTML,target){
        var link = document.createElement("a");
        var sectionID = this.data.GetSectionID(this.data.GetSectionByArticleRef(ArticleRefName).RefName);
        var articleID = this.data.GetArticleIDbyRef(ArticleRefName);
        if(typeof sectionID == "number" && typeof articleID == "number"){
            return this.GetLink(sectionID,articleID,translationID,title,hash, innerHTML);
        }else{
            console.error("Incorrect sectionID or articleID");
            return undefined;
        }
    }
    public GetLink(sectionID,articleID,translationID,title,hash,innerHTML,target){
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
    }
    public IndicesAreCorrect(sectionID,articleID,translationID){
        if(isNaN(translationID)){
            if(isNaN(articleID)){
                return sectionID < this.data.Sections.length;
            }else{
                return 	sectionID < this.data.Sections.length &&
                        articleID < this.data.Sections[sectionID].Articles.length;
            }
        }else{
            if(isNaN(articleID)){
                if(isNaN(sectionID)){
                    return 	translationID < this.data.Sections[0].Articles[0].Translations.length;
                }else{
                    return 	sectionID < this.data.Sections.length &&
                            translationID < this.data.Sections[0].Articles[0].Translations.length;
                }
            }else{
                return 	sectionID < this.data.Sections.length &&
                        articleID < this.data.Sections[sectionID].Articles.length &&
                        translationID < this.data.Sections[sectionID].Articles[articleID].Translations.length;
            }
        }
    }
}