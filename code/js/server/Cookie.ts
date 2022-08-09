class Cookie{
    public static Set (key:string, value: string, date: Date) {
        document.cookie = key + "=" + value + ";" + "expires="+date.toUTCString() + ";";
    }
    
    public static Get(key: string) {
        var allcookies = document.cookie.split(';');
        for(var i = 0; i < allcookies.length; i++) {
            var cookie = allcookies[i].split("=");
            if (cookie[0].trim() == key) {
                return cookie[1];
            }
        }
        return "";
    }
    public static Remove(key: string){
        var date = new Date();
        date.setYear(2016);
        document.cookie = key + "=a;" + "expires="+date.toUTCString() + ";";
    }
}