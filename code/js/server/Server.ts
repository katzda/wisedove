class Server {
	public AddWebPart (groupName,fn,data,selector,multiSelect){
		multiSelect = multiSelect || false;
		if(typeof Server[groupName] == "undefined"){
			Server[groupName] = [];
		}
		Server[groupName][Server[groupName].length] = function(){fn(data,selector,multiSelect);};
	}

	public RunGroup (groupName){
		Server[groupName].forEach(function(elem){
			elem();
		});
	}
}