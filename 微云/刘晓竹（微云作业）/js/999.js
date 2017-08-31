(function(){
	
	//自适应宽高
	var section = document.querySelector('#section');
	var head = document.querySelector('#head');
	function resize(){
		var clientH = document.documentElement.clientHeight;
		section.style.height = clientH - head.offsetHeight+'px';
	}
	window.onresize = resize;
	resize();

	// -------------------操作数据的方法---------------------------

	//根据指定id找到指定id的所有的子级
	function getChildsById(id){
		var arr = [];
		for(var attr in data){
			if(data[attr].pid == id){
				arr.push(data[attr])
			}
		}
		return arr;	
	}

	var checkedAll = document.querySelector(".checkedAll");
	checkedAll.ischecked = false;//默认未选中
	
	//---------------------渲染菜单区域--------------------

	var leval = -1;//初始最原始的级别
	var initId = -1;//最顶级的父级

	// 循环数据，那些数据的pid为 指定的id，就是指定id的子数据
	
	function createTreeHtml(id,leval){
		// 找到传过来参数id下所有的子级
		var arr = getChildsById(id);
		leval++;
		var treeHtml = '';
		if(arr.length){
			treeHtml += '<ul>';
			arr.forEach(function (item){
				// 如果没有下一级，createTreeHtml返回的结构为空
				var html = createTreeHtml(item.id,leval);
				treeHtml += `<li>
						<div data-id="${item.id}" style="padding-left: ${leval*15}px;" class="tree-title ${html !== '' ? 'tree-ico' : '' } close">
							<span data-id="${item.id}"><i></i>${item.title}</span>
						</div>
						`
				// createTreeHtml返回的是下一级的结构
				treeHtml += html
				treeHtml += `</li>`	
			})
			treeHtml += '</ul>'
		}	

		return treeHtml;
	}
	
	var treeMenu = document.querySelector(".tree-menu");
	treeMenu.innerHTML = createTreeHtml(initId,leval);
	bindTreeClickEvent();//绑定树形菜单点击事件
	
	//初始化左边树形菜单
	function reInitTree(){
		leval = -1;
		initId = -1;
		treeMenu.innerHTML = createTreeHtml(initId,leval);
		bindTreeClickEvent();//绑定树形菜单点击事件
		
	}

	// -----------------------定位到指定的元素------------------------------
	function positionElement(positionId){
		var treeDivs = treeMenu.getElementsByTagName("div");
		
		for( var i = 0; i < treeDivs.length; i++ ){
			
			if(treeDivs[i].dataset.id == positionId){
				treeDivs[i].classList.add("active");
				continue;
			}
			treeDivs[i].classList.remove('active');
		}
	}

	positionElement(0)

	//--------------------------文件夹区域-----------------------
	var fEmpty = document.querySelector('.f-empty');
	var selectedArr = [];
	function createFileHtml(id){
		selectedArr = [];
		
		var childs = getChildsById(id);
		if(childs.length){
			var fileHtmls = childs.map(function (item){
				return `<div data-id ="${item.id}" class="file-item">
						<img src="img/folder-b.png" alt="" />
						<span class="folder-name">${item.title}</span>
						<input type="text" class="editor"/>
						<i class ="${ischecked = false?"checked": ''}"></i>
					</div>`		
				}).join("");
			fEmpty.style.display = "none";
			bindMouseDown();
			return fileHtmls;
		}else{
			 fEmpty.style.display = "block";
			 return "";
		}
		
	}

	var folders = document.querySelector(".folders");
	folders.innerHTML = createFileHtml(0);

	//---------------------------渲染导航区域---------------------------

	// 找到指定id的祖先数据一直找到最顶层
	function getParentsById(id){
		var arr = [];
		for(var attr in data){
			if(data[attr].id == id){
				arr.push(data[attr]);
			
				arr = arr.concat(getParentsById(data[attr].pid));
				break;
			}
		}
		return arr;
	}	

	function createNavHtml(id){
		checkedAll.className = "";
		checkedAll.ischecked = false;
		var parents = getParentsById(id).reverse();//颠倒位置
		var navHtml = '';
		for( var i = 0; i < parents.length-1; i++ ){
			navHtml += `<a data-id="${parents[i].id}" href="javascript:;">${parents[i].title}</a>`;
		}

		navHtml += `<span data-id="${parents[parents.length-1].id}">${parents[parents.length-1].title}</span>`;

		return navHtml;
	}

	var breadNav = document.querySelector(".bread-nav");
	breadNav.innerHTML = createNavHtml(0);

	//---------------------------给树形菜单每一个菜单绑定点击---------------------------

	var treeDivs = treeMenu.getElementsByTagName("div");
	//绑定树形菜单点击事件
	function bindTreeClickEvent(){
		treeDivs = treeMenu.getElementsByTagName("div");		
		
		for( var i = 0; i < treeDivs.length; i++ ){
			treeDivs[i].onclick  =function (){
				console.log("a")
				var treeId = this.dataset.id;
				folders.innerHTML = createFileHtml(treeId);	
				breadNav.innerHTML = createNavHtml(treeId);
				positionElement(treeId);//定位到指定的元素
			};
		}
	}
	
	//----------------------点击右侧导航-------------------------
	var breadNav = document.querySelector(".bread-nav");
	breadNav.onclick = function(ev){
		if(ev.target.nodeName =="A"){
			var treeId = ev.target.dataset.id;
			folders.innerHTML = createFileHtml(treeId);	
			breadNav.innerHTML = createNavHtml(treeId);
			positionElement(treeId);//定位到指定的元素
			
		}
	}
	//-----------------------------------点击右侧文件夹--------------------------------
	var folders = document.querySelector(".folders");
	folders.onclick = foldersH;
	function foldersH(ev){
		//如果点击的是新建文件夹输入框
		if(ev.target.nodeName == "INPUT"){
			return;//不进入子集
		}else{
			//创建或重命名文件夹，如果校验不通过，则返回
			var setFlag = setNewFolder();
			if(!setFlag){
				return;
			}
		}
		
		//点击到空白区停止
		if(ev.target == this){
			return;
		}
		
		//判断无论点击到文件夹的哪个部分都进入他的子集
		if(ev.target.nodeName =="DIV"){
			var treeId = ev.target.dataset.id;
			folders.innerHTML = createFileHtml(treeId);	
			breadNav.innerHTML = createNavHtml(treeId);
			positionElement(treeId);//定位到指定的元素
		}else if(ev.target.nodeName == "I"){
			console.log("i");
			var treeId = ev.target.parentNode.dataset.id;
			var treeIndex = selectedArr.indexOf(treeId);//获取treeid在selectindex的索引
			//找不到，就表示I没有被选中。因为每个选中的I，都会把对应的ID存到selectArr里

			if(treeIndex<0){//如果在这个数组中不存在
				ev.target.setAttribute("class","checked");
				selectedArr.push(treeId);
			}else{//存在的话就从数组中移除
				ev.target.setAttribute("class","");
				selectedArr.splice(treeIndex,1);
			}
			//点击文件夹的I时，判断是否要勾选全选：i的数量等于i.chekced的数量
			var folderItems = document.querySelectorAll(".file-item i");//对号
			var checkedFolderItems = document.querySelectorAll(".file-item i.checked");//对号
			if(folderItems.length == checkedFolderItems.length){
				checkedAll.className = "checked";
				checkedAll.ischecked = true;
			}else{
				checkedAll.className = "";
				checkedAll.ischecked = false;
			}
			
		}else if(ev.target.parentNode.nodeName =="DIV"){
			var treeId = ev.target.parentNode.dataset.id;
			folders.innerHTML = createFileHtml(treeId);	
			breadNav.innerHTML = createNavHtml(treeId);
			positionElement(treeId);//定位到指定的元素
		}
	}
	checkedAll.onclick = function(){
		if(this.ischecked == false){
			this.className = "checked";
			this.ischecked = true;
			selectAllFolder();
		}else{
			this.className = "";
			this.ischecked = false;
			unSelectAllFolder();
		}
	}
	
	//全选
	function selectAllFolder(){
		selectedArr = [];
		var folderItems = document.querySelectorAll(".file-item i");//对号
		if(folderItems.length == 0){//如果对号都没有被选中，全选为未选中
			checkedAll.className = "";
			checkedAll.ischecked = false;
			return;
		}
		//全选的时候把i的父级就是这个文件夹的，id放进数组里，以便后面进行删除移动操作使用
		Array.from(folderItems).forEach(function(item){
			selectedArr.push(item.parentNode.dataset.id);
			item.className = 'checked';
		});
	}
	//非全选
	function unSelectAllFolder(){
		selectedArr = [];
		checkedAll.className = "";
		checkedAll.ischecked = false;
		//对号
		var ii = document.querySelectorAll(".file-item i");
		Array.from(ii).forEach(function(item){
			item.className = '';
		});
		//框选后背景颜色改变
		var fileItem = document.querySelectorAll(".file-item");
		Array.from(fileItem).forEach(function(item){
			item.style.background  = '';
		});
	}
	
	//-------------------------------------框选文件夹-----------------------------------
	function bindMouseDown (){
		folders.onmousedown = function(ev){
			if(ev.target != this){
				return;
			}
			unSelectAllFolder();
			var boxSelect =document.querySelector("folders p");
			
			var boxSelect =document.createElement("p");
			boxSelect.className = "box-select";
			document.body.appendChild(boxSelect);
			
			var disX = ev.clientX;
			var disY = ev.clientY;
			
			boxSelect.style.left = disX + 'px';
			boxSelect.style.top = disY + 'px';
			
			document.onmousemove = function(ev){
				boxSelect.style.width = Math.abs(ev.clientX - disX) + 'px';
				boxSelect.style.height = Math.abs(ev.clientY - disY) + 'px';
				boxSelect.style.left = Math.min(disX,ev.clientX) + 'px';	
				boxSelect.style.top = Math.min(disY,ev.clientY) + 'px';	
				//判断选中
				
				var fileItem = document.querySelectorAll(".file-item");
				var ii = document.querySelectorAll(".file-item i");//对号			
				//框选后背景颜色改变
				for( var j = 0; j < fileItem.length; j++ ){
					if(collision(boxSelect,fileItem[j])){
						if(ev.target.nodeName == "I"){
							continue;
						}
						fileItem[j].style.background = 'lightblue';
						ii[j].className = "checked";//框选后小对号选中
						var dataid = ii[j].parentNode.dataset.id;
						if(selectedArr.indexOf(dataid)<0){//如果在这个数组中不存在
							selectedArr.push(dataid);
						}
					}else{
						fileItem[j].style.background = '';
						ii[j].className = "";//框选后小对号选中
						var dataid = ii[j].parentNode.dataset.id;
						var sindex = selectedArr.indexOf(dataid);
						if(sindex>=0){//如果在这个数组中存在
							selectedArr.splice(sindex,1);
						}
					}
				}
				//全选
				var checkedFolderItems = document.querySelectorAll(".file-item i.checked");//对号
				if(fileItem.length == checkedFolderItems.length && checkedFolderItems.length>0){//如果文件夹的长度等于对号的长度就是全选
					checkedAll.className = "checked";
					checkedAll.ischecked = true;
				}else{
					checkedAll.className = "";
					checkedAll.ischecked = false;
				}
			}
			document.onmouseup = function (){
				document.onmousemove = null;
				boxSelect.remove();	
				ev.preventDefault();//清除浏览器默认
			}
			ev.preventDefault();//清除浏览器默认
		}
	}
	bindMouseDown();
	
	
	//碰撞函数
	function collision(obj1,obj2){
		var obj1Rect = obj1.getBoundingClientRect();	
		var obj2Rect = obj2.getBoundingClientRect();	

		if(obj1Rect.right < obj2Rect.left || obj1Rect.bottom < obj2Rect.top || obj1Rect.left > obj2Rect.right || obj1Rect.top > obj2Rect.bottom){
			return false;
		}else{
			return true;
		}
	}
	
	//-----------------------------------新建文件夹-------------------------------------
	var create = document.querySelector("#create");//新建文件夹按钮
	var inputEditor = document.querySelector(".showeditor");
	var fullTipBox = document.querySelector(".full-tip-box");//新建文件夹啊成功的弹窗
	
	create.onclick = function(){
		//如果已经有一个在创建了 就不能再创建了 这个创建完成后可以再创建
		if(document.querySelector(".showeditor")){
			return;
		}
		var newfileItem =document.createElement("div");
		
		newfileItem.className = "file-item";
		newfileItem.setAttribute("data-id",new Date().getTime());//根据当前时间生成ID
//		folders.appendChild(newfileItem);
		folders.insertBefore(newfileItem,folders.firstElementChild);//新建的文件夹在前面添加
		
		var newfileItemHtml = '<img src="img/folder-b.png" alt="" /><span class="folder-name"></span><input type="text" class="editor showeditor"/><i></i>';
		newfileItem.innerHTML += newfileItemHtml;
		
		fEmpty.style.display = "none";//“暂无文件”提示背景隐藏
		document.querySelector(".showeditor").focus();//获取焦点
	}
	
	//按Enter键同样可以保存新建文件夹名字
	document.onkeydown = function(ev){
		if(ev.keyCode === 13){
			setNewFolder();
		}
	}
	
	//创建或重命名文件夹
	function setNewFolder(){
		
		//showeditor表示正在输入的文本框的样式
		var inputEditor = document.querySelector(".showeditor");
		
		if(!inputEditor){//未找到，则返回
			return true;
		}
		var tempVal = inputEditor.value.trim();
		
		//查找该文件夹内的span
		var spans = inputEditor.previousElementSibling;
		var spanText = inputEditor.previousElementSibling.innerText;
		spans.className = "folder-name";
		
		//是否是新建文件夹
		var isNew = false;
		if(spanText ==""){//如果span的innerText为空，则说明这个span所属的文件夹是新添加的
			isNew = true;
		}
		//是否需要在顶部弹出通知(创建/重命名成功)
		var notice = true;
		//如果不是新添加的，并且输入的的值为空，则把文件夹的名称重新还原为原来的值
		if(!isNew && tempVal ==""){
			//同时设置notice为false，表示不提示，因为压根没改名字
			inputEditor.value = spanText;
			notice = false;
		}
		
		var haveSameName = false;//是否有重复名称
		//首先，如果新建文件夹的名称不为空，则判断是否有重复
		if(inputEditor.value != ""){
			//同一个目录下不能有同名的文件
			var navSpan = document.querySelector(".bread-nav span");
			var pid  = navSpan.dataset.id;
			var id = inputEditor.parentNode.dataset.id;
			for(var attr in data){//只要能找到相同文件名字的就会变成true
				if(data[attr].pid == pid){
					//首先，判断是否有重复的名称时，不能让自己跟自己比较
					if(data[attr].id !=id &&  data[attr].title == inputEditor.value){
						haveSameName = true;
					}
				}
			}
		}
		if(haveSameName){
			alert("文件名称已存在");
		}
		if(inputEditor.value =="" || haveSameName){
			//如果未输入文件夹名称，就移除这个元素，并retrun,停止执行后面的代码
			inputEditor.parentNode.remove();
			if(folders.children.length ==0){
				fEmpty.style.display = "block";
			}
			return false;
		}else{
			//inputEditor 要添加的文件夹
			//notice 是否需要进行通知
			//isNew 是不是新建的
			addNewFolderFromInput(inputEditor,notice,isNew);
		}
		return true;
	}
	//通过新建文件夹输入框，创建文件夹
	function addNewFolderFromInput(tempInput,notice,isNew){
		//tempInput的前一个同胞兄弟节点的innerText就是当前这个Input的value
		tempInput.previousElementSibling.innerText = tempInput.value.trim();
		tempInput.classList.remove("showeditor");//移除输入框
		var dataid = tempInput.parentNode.dataset.id;//获取他父级也就是file-item的id
		var pid = document.querySelector(".tree-title.active").dataset.id;//取新添加的文件夹的父级的id
	
		data[dataid.toString()]={
			id:parseInt(dataid),
			pid:pid,
			title:tempInput.value.trim(),
			type:"file"
		};
		//重新初始化左边树，右侧导航，清空全选按钮(因为新加了文件夹，所以肯定不是全选状态)
		reInitTree();//重新初始化左侧树形菜单
		breadNav.innerHTML = createNavHtml(pid);
		positionElement(pid);//定位到指定的元素
		
		checkedAll.className = "";
		checkedAll.ischecked = false;
		//判断是否需要通知
		if(notice){
			//获取通知的那个span
			var tipsTextItem = document.querySelector(".tip-text");
			if(isNew){
				tipsTextItem.innerText = "新建文件夹成功";
			}else{
				tipsTextItem.innerText = "重命名文件夹成功";
			}
			//新建成功后，提示窗显示
			fullTipBox.style.top = "15px";
			setTimeout(function(){
				fullTipBox.style.top = "-32px";
			},2000);
		}
	}
	

	//---------------------------------点击删除--------------------------------
	var del = document.getElementById("del");
	var tanbox = document.getElementById("tanbox");//弹窗
	var closeIco = document.querySelector(".close-ico")//X
	var queding = document.getElementById("queding");//确定
	var quxiao = document.getElementById("quxiao");//取消
	
	del.onclick = function(){
		
		if(selectedArr.length ==0){//如果没有选中的就要提示
			alert("请选择要删除的文件或文件夹");
			return;
		}
		//取数组中的第一个，因为如果数组长度不为0的话，要是有数组就肯定有第一个，所以就是第0个，就取他的父ID，即为pid.
		var treeId = data[selectedArr[0]].pid;
		
		//弹窗显示
		tanbox.style.display = "block";
		//点击确定
		queding.onclick = function(){
			//对所有选中的文件的ID进行循环
			selectedArr.forEach(function(id){
				deleteById(id);//进行删除
			});
			reInitTree();//重新初始化左侧树形菜单
			
			folders.innerHTML = createFileHtml(treeId);	//左侧文件夹
			breadNav.innerHTML = createNavHtml(treeId); //右侧导航栏
			positionElement(treeId);//定位到指定的元素
			
			tanbox.style.display = "none";
		}
		
		//点击取消
		quxiao.onclick = function(){
			tanbox.style.display = "none";
		}
		
	}
	//通过ID来删除data中的ID
	function deleteById(id){
		delete data[id];
		//同时也要删除他的子级
		var childs = getChildsById(id);
		if(childs.length){//如果有子级就删除
			childs.forEach(function(item){
				deleteById(item.id);
			});
		}
	}


	//----------------------------------重命名----------------------------------
	var rename = document.getElementById("rename");
	var editor = document.querySelector(".file-item .editor");//输入框
	
	
	rename.onclick = function(){
		
		if(selectedArr.length ==0){//如果没有选中的文件夹就提示
			alert("请选择要重命名的文件夹");
			return;
		}
		if(selectedArr.length >1){//如果selectedArr.length大于1，代表选中了超过1个文件夹，要提示
			alert("只能选择一个文件夹");
			return;
		}
		
		var dataid = selectedArr[0];//取数组中第一个
		//获取到被选中的I的上一个兄弟，也就是INPUT
		var tempInput = document.querySelectorAll(".file-item i.checked")[0].previousElementSibling;
		tempInput.className += " showeditor";
		
		var spans = tempInput.previousElementSibling;//获取到文件名字
		
		//如果有选中的
		if(selectedArr != ""){
			spans.className +="  hidespan";
		}
		tempInput.value = spans.innerHTML;
		
		document.querySelector(".showeditor").focus();//获取焦点
		document.querySelector(".showeditor").select();//选中

	}
	
	
	//------------------------------点击移动-----------------------------------
	var maskMove = document.getElementById("mask-move");//窗口
	var remove = document.getElementById("remove");//移动按钮
	var confirm = document.getElementsByClassName("confirm")[0];//确定
	var cancel = document.getElementsByClassName("cancel")[0];//取消
	var treeMenuComm = document.querySelector(".tree-menu-comm");//获取菜单
	var notRemoveArr = [];
	//点击移动
	remove.onclick = function(){
		if(selectedArr.length ==0){//如果没有选中的就要提示
			alert("请选择要移动的文件或文件夹");
			return;
		}                                                                                                                                                                                                                                                                                                                  
		//需要移动
		maskMove.style.display = "block";
		initCommHTML();//渲染窗口菜单
	};
	//点击确定
	confirm.onclick = function(){
		var toElement = treeMenuComm.querySelector("div.active");//获取被选中的元素，就是身上有active的
		if(toElement){//如果有这个元素
			var toId = toElement.dataset.id;//获取他的ID
			var moveALL  = true;//是否所有的都可以进行移动
			Array.from(selectedArr).forEach(function(item){
				if(judgeSameName(toId,data[item].title)){//如果目标文件夹的子级名字与要移动的这个文件名字相同
					moveALL = false;//不可以移动
					return;
				}
				data[item].pid = toId;//将要移动的这个文件的父ID设置为目标文件夹的的ID
			});
			
			reInitTree();//重新初始化左侧树形菜单
			folders.innerHTML = createFileHtml(toId);//左侧文件夹
			breadNav.innerHTML = createNavHtml(toId); //右侧导航栏
			positionElement(toId);//定位到指定的元素
			maskMove.style.display = "none";
			if(!moveALL){//如果不是所有都可以移动
				alert("目标目录有同名文件夹，部分移动失败。");
			}
		}else{//没有选中
			alert("请选择要移动到的文件夹");
		}
	}
	//判断是否有相同的文件名字
	function judgeSameName (moveToId,judgeName){//参数1：目标文件夹的ID;参数2：要移动的文件夹的名字;
		var subArr = getChildsById(moveToId);//根据ID获取目标文件夹的子级
		for(var i = 0 ;i < subArr.length;i++){
			if(subArr[i].title == judgeName){//如果当前这个子级的title（就是文件名字） = 要移动的文件夹的名字
				return true;//代表找到了有相同名字的，返回true
			}
		}
		return false;//代表没有找到同名，返回false
	}
	
	//点击取消
	cancel.onclick = function(){
		maskMove.style.display = "none";//窗口隐藏
	}
		
	//渲染窗口菜单
	function initCommHTML(){
		Array.from(selectedArr).forEach(function(item){
			setIdToNotRemove(item);//获取不能移动的文件的ID
		});
		//渲染菜单
		treeMenuComm.innerHTML = createTreeHtmlForRemove(initId,leval);
		notRemoveArr = [];//重置notRemoveArr
		//对菜单绑定事件
		var newTree = document.querySelectorAll(".tree-menu-comm .tree-title");
		Array.from(newTree).forEach(function(item){
			item.onclick=function(){
				var notremove = this.dataset.notremove;
				if(notremove=="1"){
					//不可以移动
					alert("不可以移动")
				}else{
					movePositionElement(this.dataset.id);//菜单点击定位，变颜色
				}
			}
		});
	}
	//获取不能移动的文件的ID：本身以及自己的所有子级ID
	function setIdToNotRemove(id){
		notRemoveArr.push(id.toString());//将本身push到不能移动元素数组
		var arr = getChildsById(id);//获取子级
		if(arr.length>0){
			Array.from(arr).forEach(function(item){
				setIdToNotRemove(item.id);//对子级进行同样操作
			});
		}
	}
	//复制原来的创建菜单方法，进行一些小改动：增加了判断不能移动的元素ID的判断，并对这些元素打上data-notremove=1的属性标签
	function createTreeHtmlForRemove(id,leval){
		// 找到传过来参数id下所有的子级
		var arr = getChildsById(id);
		leval++;
		var treeHtml = '';
		if(arr.length){
			treeHtml += '<ul>';
			arr.forEach(function (item){
				// 如果没有下一级，createTreeHtml返回的结构为空
				var html = createTreeHtmlForRemove(item.id,leval);
				//判断如果当前渲染元素的ID在不能移动数组中，则将他的data-notremove属性标识为1
				var notRemove = notRemoveArr.indexOf(item.id.toString())>-1;
				treeHtml += `<li>
						<div data-id="${item.id}" data-notremove="${notRemove?1:0}" style="padding-left: ${leval*15}px;" class="tree-title ${html !== '' ? 'tree-ico' : '' } close">
							<span data-id="${item.id}"><i></i>${item.title}</span>
						</div>
						`
				// createTreeHtml返回的是下一级的结构
				treeHtml += html
				treeHtml += `</li>`	
			})
			treeHtml += '</ul>'
		}	

		return treeHtml;
	}
	
	// -----------------------菜单点击定位，变颜色------------------------------
	function movePositionElement(positionId){
		var treeCommDiv = treeMenuComm.getElementsByTagName("div");
		
		for( var i = 0; i < treeCommDiv.length; i++ ){
			
			if(treeCommDiv[i].dataset.id == positionId){
				treeCommDiv[i].classList.add("active");
				continue;
			}
			treeCommDiv[i].classList.remove('active');
		}
	}

})();
