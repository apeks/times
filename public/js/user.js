/**
 * 
 */

var userModel = Backbone.Model.extend({
	defaults : {
		id : '',
		view_name : '',
		team_id : 0
	},
	clear : function() {
		this.destory();
	}
});

var UserList = Backbone.Collection.extend({
	model : User,
	url : TIMES.Config.usersUrl
});