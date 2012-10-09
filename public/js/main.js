// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function() {
	
	
	// user model
	var User = Backbone.Model.extend({
		defaults : {
			id : '',
			view_name : '',
			team_id : 0,
			checked : true
		},
		initialize : function(){
			this.checked = this.defaults.checked;
		}, 
		clear : function() {
			this.destory();
		},
		switchChecked : function(switcher) {
			if (switcher != null)
				this.set("checked", switcher);
			else 
				this.set("checked", !this.get("checked"));
			
			return this.get("checked");
		}
	});

	// user list collection
	var UserList = Backbone.Collection.extend({
		model : User,
		url : TIMES.Config.usersUrl,
		
		switchChecked : function(id, switcher){
			return this.get(id).switchChecked(switcher);
		},
		
		getCheckedUsers : function(){
			var ids = new Array;
			this.forEach(function(user){
				if (user.get("checked")){
					ids.push(user.get("id"));
				}
			});
			return ids;
		},
		
		getAllUsers : function(){
			var ids = new Array;
			this.forEach(function(user){
				ids.push(user.get("id"));
			});
			return ids;
		},
		
		getUserViewName : function(id){
			return this.get(id).get("view_name");
		},
		
		getUserAvatar : function(id){
			console.log("getUserAvatar:" + id);
			return this.get(id).get("avatar");
		}
	});
	
	
	// user list view
	var UserListView = Backbone.View.extend({
		el : '#userListView',
		userListTemplate : _.template($('#userList-template').html()),
		
		initialize : function() {
			_.bindAll(this, 'render', 'onClickUser', 'onSwitchAll', 'onCheckAll', 'checkUser'); 
			$UserList.bind('reset', this.render);
			$UserList.fetch();
		},
		
		events : {
			"click #userListView .item" :         "onClickUser",
			"click #btnSwitchAll" : "onSwitchAll",
			"click #btnCheckAll"  : "onCheckAll",
			"click #btnUnCheckAll"  : "onUnCheckAll",
		},
		
		render : function() {
			console.log("userList render");
			this.$("#userList").html(this.userListTemplate({"users" : $UserList.toJSON()}));
			return this;
		},
		
		onClickUser : function(e){
			var target = $(e.currentTarget);
			var id = target.attr('id');
			console.log("onClickUser:" + id);
			this.checkUser(id, $(target));
			this.updateNoteList();
		},
		
		updateNoteList : function(){
			var uList = $UserList.getCheckedUsers(); 
			if (uList.length == 0){
				// TODO:
			}
			// 更新note列表
			$ReadView.showLoading();
			$Notes.setFilter("/users/" + uList.join(','));
		},
		
		onSwitchAll : function() {
			var self = this;
			self.$(".item").each(function(item){
				self.checkUser($(this).attr("id"), $(this));
			});
			self.updateNoteList();
		},
		
		onCheckAll : function() {
			var self = this;
			self.$(".item").each(function(item){
				self.checkUser($(this).attr("id"), $(this), true);
			});
			self.updateNoteList();
		},
		
		onUnCheckAll : function() {
			var self = this;
			self.$(".item").each(function(item){
				self.checkUser($(this).attr("id"), $(this), false);
			});
			self.updateNoteList();
		},
		
		checkUser : function(id, view, switcher){
			if ($UserList.switchChecked(id, switcher)){
				view.removeClass("unchecked");
			}else{
				view.addClass("unchecked");
			}
		}
	});
	
	
	// Note Model
	var Note = Backbone.Model.extend({
		// Default attributes for the todo item.
		defaults : function() {
			return {
				title : "empty todo...",
				body : "你为什么不写就发？",
				id : Math.random(),
				user_id : 'zeyuan.wl',
				user_view_name : "泽远",
				mtime : '',
				ctime : '',
				done : false
			};
		},

		// Ensure that each todo created has `title`.
		initialize : function() {
			if (!this.get("body")) {
				this.set({
					"body" : this.defaults().title
				});
			}
		},
	});

	// note view
	var NoteView = Backbone.View.extend({
		//... is a list tag.
		tagName : "li",
		// Cache the template function for a single item.
		template : _.template($('#itemView').html()),

		typeMap : {
			"1" : "便签",
			"2" : "日报",
			"3" : "周报",
		},
		// The DOM events specific to an item.
		events : {
			"dblclick .view" : "edit",
			"click a.destroy" : "clear",
			"keypress .edit" : "updateOnEnter",
			"blur .edit" : "close",
		},

		// The NoteView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Note** and a **NoteView** in this
		// app, we set a direct reference on the model for convenience.
		initialize : function() {
			//this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
		},
		
		onHover : function(){
			this.$("div").show();
		},
		
		show : function(){
			this.$("div").show();
		},
		
		slideDown : function(){
			this.$("div").slideDown();
		},
		
		render : function() {
			console.log("NoteView.render");
			var userId = this.model.get("user_id");
			this.model.set("ctime", friendlyTime(this.model.get("ctime")));
			this.model.set("mtime", friendlyTime(this.model.get("mtime")));
			this.model.set("type", this.typeMap[this.model.get("type")]);
			this.model.set("avatar", $UserList.getUserAvatar(userId));
			this.model.set("user_view_name", $UserList.getUserViewName(userId));
			this.$el.html(this.template(this.model.toJSON()));
			this.input = this.$('.edit');
			return this;
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit : function() {
			this.$el.addClass("editing");
			this.input.focus();
		},

		// Close the `"editing"` mode, saving changes to the todo.
		close : function() {
			var value = this.input.val();
			if (!value) {
				this.clear();
			} else {
				this.model.save({
					title : value
				});
				this.$el.removeClass("editing");
			}
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter : function(e) {
			if (e.keyCode == 13)
				this.close();
		},

		// Remove the item, destroy the model.
		clear : function() {
			this.model.destroy();
		}
	});
	
	
	// note list model
	var NoteList = Backbone.Collection.extend({
		// Reference to this collection's model.
		model : Note,	
		// Save all of the todo items under the `"todos-backbone"` namespace.
		//localStorage : new Backbone.LocalStorage("todos-backbone"),
		url : TIMES.Config.notesUrl,
		rootUrl : TIMES.Config.notesUrl,
		
		// Todos are sorted by their original insertion order.
		comparator : function(todo) {
			return todo.get('id');
		},
		setFilter : function(filter){
			this.url = this.rootUrl + filter;
			console.log("set notes filter:" + this.url);
			this.fetch(); // 向服务器发送请求，如果返回与当前数据不一样会触发change
		}
	});

	// datePickerView
	var DatePickerView = Backbone.View.extend({
		initialize : function(){
			$('#reportrange').daterangepicker(
				{
					ranges: {
						'今天': ['today', 'today'],
						'昨天': ['yesterday', 'yesterday'],
						'最近七天': [Date.today().add({ days: -6 }), 'today'],
						'最近三十天': [Date.today().add({ days: -29 }), 'today'],
						'本月': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
						'上个月': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
					},
					opens: 'right',
					format: 'yyyy/MM/dd',
					startDate: Date.today().add({days:-29}),
					endDate: Date.today(),
					minDate: Date.today().add({days:-100}),
					maxDate: Date.today(),
		        	locale: {
		            		applyLabel: '确定',
		           			fromLabel: '从',
		            		toLabel: '到',
		            		customRangeLabel: '自定义日期范围',
		            		daysOfWeek: ['日', '一', '二', '三', '四', '五','六'],
		            		monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
		            		firstDay: 1
		        	}
				}, 
				function(start, end) {
					$('#reportrange span').html(start.toString('yyyy/MM/dd') + ' - ' + end.toString('yyyy/MM/dd'));
				}
			);

			//Set the initial state of the picker label
			$('#reportrange span').html(Date.today().toString('yyyy/MM/dd') + ' - ' + Date.today().toString('yyyy/MM/dd'));
		}
	});
	// write view
	var WriteView = Backbone.View.extend({
		el : $("#writeView"),
		initialize : function() {
			this.contentEditor = this.$("#contentEditor").wysihtml5({
				"events" : {
					"load" : function() {
					},
					"blur" : function() {
						console.log("Blured");
					},
					"focus" : function() {
						console.log("focus");
					}
				}
			});
			this.title = this.$("#inputTitle");
		},
		// 绑定事件
		events : {
			"click #btnPublish" : "publish",
			"click #btnCancel" :  "cancel",
		},

		publish : function(e) {
			if (!this.contentEditor.val())
				return;
			console.log("createNote");
			$Notes.create({
				title: $(this.title).val(),
				body : this.contentEditor.val(),
				ctime : new Date().getTime() / 1000,
				mtime : new Date().getTime() / 1000,
				type : 1,
			});
			window.editor.clear();
			$WriteView.hide();
			$ReadView.show();
		},
		
		cancel : function(e) {
			window.editor.clear();
			$WriteView.hide();
			$ReadView.show();
		},
		
		hide : function(){
			$(this.el).slideUp(266);
		},
		show : function(){
			$(this.el).slideDown(266);
		}
	});

	
	// ReadView
	var ReadView = Backbone.View.extend({
		el : $("#readView"),
		initialize : function() {
			
			this.userView = new UserListView;
			this.DatePickerView = new DatePickerView;
			$Notes.on('add', this.renderOnAdd, this);
			$Notes.on('reset', this.render, this);
			$UserList.on('reset', this.doFetch, this); // 用户加载之后才加载note
			$Notes.on('destroy', this.remove, this);
			
		},
		
		doFetch : function(){
			$Notes.fetch();
		},
		
		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render : function() {
			console.log("note list view render");
			// clear all
			this.$("#noteList").empty();
			// add each
			$Notes.each(this.addOneShow);
			
			this.hideLoading();
		},
		
		showLoading : function() {
			this.$("#noteLoading").slideDown();
			this.$("#noteList").hide();
		},
		
		hideLoading: function() {
			this.$("#noteLoading").fadeOut();
			this.$("#noteList").show();
		},
		
		// 页面敲击回车时使用
		addOneShow : function(todo) {
			console.log("addOneShow");
			var view = new NoteView({
				model : todo
			});
			this.$("#noteList").prepend(view.render().el);
			view.show();
		},
		
		renderOnAdd : function(todo) {
			console.log("renderOnAdd");
			var view = new NoteView({
				model : todo
			});
			this.$("#noteList").prepend(view.render().el);
			view.show();
		},
		
		show : function(){
			$(this.el).slideDown(266);
		}, 
		
		hide : function(){
			$(this.el).slideUp(266);
		},
		
	});
	
	(function() {
		var $backToTopTxt = "返回顶部", $backToTopEle = $('<div class="backToTop"></div>').appendTo($("body"))
		        .text($backToTopTxt).attr("title", $backToTopTxt).click(function() {
		            $("html, body").animate({ scrollTop: 0 }, 120);
		    }), $backToTopFun = function() {
		        var st = $(document).scrollTop(), winh = $(window).height();
		        (st > 0)? $backToTopEle.show(): $backToTopEle.hide();   
		    };
		    $(window).bind("scroll", $backToTopFun);
		    $(function() { $backToTopFun(); });
	})();
	
	var HeadView = Backbone.View.extend({
		el : $("#headView"),
		initialize : function() {
			
		},
		
		// 绑定事件
		events : {
			"click #btnStartWrite" : "startWrite",
		},
		startWrite: function(){
			console.log("start write");
			$ReadView.hide();
			$WriteView.show();
			
		}
	});
	//////////////////////////////////////////////////////////////////
	

	// Finally, we kick things off by creating the **App**.
	var $UserList  = new UserList;
	var $Notes     = new NoteList;
	var $ReadView  = new ReadView;
	var $WriteView = new WriteView;
	var $HeadView  = new HeadView;
	
	$WriteView.hide();
});