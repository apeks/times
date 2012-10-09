function friendlyTime(timestampInPage) {
	
	var timestampNow = Math.round(new Date().getTime() / 1000);
	var dif = timestampNow - timestampInPage;
	var outPut = "";

	if (dif <= 15)
		outPut = "刚才";
	else if (dif < 60)
		outPut = dif + "秒前";
	else if (dif < 3600)
		outPut = Math.round(dif / 60) + "分钟前";
	else if (dif < 86400)
		outPut = Math.round(dif / 3600) + "小时前";
	else if (dif < 604800)  // 7 days
		outPut = Math.round(dif / 86400) + "天前";
	else {
		var unixTimestamp = new Date(timestampInPage * 1000);
		outPut = unixTimestamp.toLocaleString();
	}
	return outPut;
}