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
	bindTreeClickEvent();
	function reInitTree(){
		leval = -1;
		initId = -1;
		treeMenu.innerHTML = createTreeHtml(initId,leval);
		bindTreeClickEvent();
		
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

	//-----------------文件夹区域------------------
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

	//------------------渲染导航区域---------------------------

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

	//------------------给树形菜单每一个菜单绑定点击------------------------
//	bindTreeClickEvent()
	var treeDivs = treeMenu.getElementsByTagName("div");
	function bindTreeClickEvent(){
		treeDivs = treeMenu.getElementsByTagName("div");
		
//		treeMenu.onclick = function(ev){
//			if(ev.target.nodeName ==="SPAN" || ev.target.nodeName ==="DIV"){
//				var treeId = ev.target.dataset.id;
//				folders.innerHTML = createFileHtml(treeId);	
//				breadNav.innerHTML = createNavHtml(treeId);
//				positionElement(treeId);
//			}
//		}
//		
		
		for( var i = 0; i < treeDivs.length; i++ ){
			treeDivs[i].onclick  =function (){
				console.log("a")
				var treeId = this.dataset.id;
				folders.innerHTML = createFileHtml(treeId);	
				breadNav.innerHTML = createNavHtml(treeId);
				positionElement(treeId);
			};
		}
	}h
	
	//----------------------点击右侧导航-------------------------
	var breadNav = document.querySelector(".bread-nav");
	breadNav.onclick = function(ev){
		if(ev.target.nodeName =="A"){
			var treeId = ev.target.dataset.id;
			folders.innerHTML = createFileHtml(treeId);	
			breadNav.innerHTML = createNavHtml(treeId);
			positionElement(treeId);
			
		}
	}
	//----------------------点击右侧文件夹-------------------------
	var folders = document.querySelector(".folders");
	folders.onclick = foldersH;
	function foldersH(ev){
		//如果点击的是新建文件夹输入框
		if(ev.target.nodeName == "INPUT"){
			return;//不进入子集
		}else{//判断文件夹
			var tempInput = document.querySelector(".showeditor");//强制显示
			if(tempInput){
				if(tempInput.value.trim()==""){
					//如果未输入文件夹名称，就移除这个元素，并retrun,停止执行后面的代码
					tempInput.parentNode.remove();
					if(folders.children.length ==0){
						fEmpty.style.display = "block";
					}
					return;
				}else{
					addNewFolderFromInput(tempInput);
				}
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
			positionElement(treeId);
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
			positionElement(treeId);
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
	
	//--------------------------框选文件夹--------------------------
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
	
	//------------------------新建文件夹---------------------------
	var create = document.querySelector("#create");//新建文件夹按钮
	var editor = document.querySelector(".file-item .editor")
	
	create.onclick = function(){
		
		if(document.querySelector(".showeditor")){//如果已经有一个在创建了 就不能再创建了 这个创建完成后可以再创建
			return;
		}
		var newfileItem =document.createElement("div");
		
		newfileItem.className = "file-item";
		newfileItem.setAttribute("data-id",new Date().getTime());//根据当前时间生成ID
		folders.appendChild(newfileItem);
		
		var newfileItemHtml = '<img src="img/folder-b.png" alt="" /><span class="folder-name"></span><input type="text" class="editor showeditor"/><i></i>';
		newfileItem.innerHTML += newfileItemHtml;
		
		fEmpty.style.display = "none";//“暂无文件”提示背景隐藏
		
	
	}
	
	//按Enter键同样可以保存新建文件夹名字
	document.onkeydown = function(ev){
		if(ev.keyCode === 13){
			//showeditor表示正在输入的文本框的样式
			var inputEditor = document.querySelector(".showeditor");
			//如果已经有一个,并且它的值不为空，意思就是输入了文件夹名称
			if(inputEditor && inputEditor.value.trim() != ""){
				//那么就根据文件夹名称添加对应的文件夹
				addNewFolderFromInput(inputEditor);
			}
		}
	}
	//通过新建文件夹输入框，创建文件夹。
	function addNewFolderFromInput(tempInput){
		tempInput.previousElementSibling.innerText = tempInput.value.trim();
		tempInput.classList.remove("showeditor");
		var dataid = tempInput.parentNode.dataset.id;
		var pid = document.querySelector(".tree-title.active").dataset.id;
		data[dataid.toString()]={
			id:parseInt(dataid),
			pid:pid,
			title:tempInput.value.trim(),
			type:"file"
		};
		//重新初始化左边树，右侧导航，清空全选按钮(因为新加了文件夹，所以肯定不是全选状态)
		reInitTree();//重新初始化左侧树形菜单
		breadNav.innerHTML = createNavHtml(pid);
		positionElement(pid);
		
		checkedAll.className = "";
		checkedAll.ischecked = false;
	}
	
	
	
	//-------------------点击删除----------------------
	var del = document.getElementById("del");
	del.onclick = function(){
		if(selectedArr.length ==0){
			alert("请选择要删除的文件或文件夹");
			return;
		}
		
		var treeId = data[selectedArr[0]].pid;
		selectedArr.forEach(function(id){
			deleteById(id);
		});
		reInitTree();//重新初始化左侧树形菜单
		folders.innerHTML = createFileHtml(treeId);	//左侧文件夹
		breadNav.innerHTML = createNavHtml(treeId);
		positionElement(treeId);
	}
	
	function deleteById(id){
		delete data[id];
		var childs = getChildsById(id);
		if(childs.length){
			childs.forEach(function(item){
				deleteById(item.id);
			});
		}
	}


	
	
	
	
	//-------点击移动---
	var remove = document.getElementById("remove");
	var removeToId = -99999;
	var toRemoveArr = [];
	remove.onclick = function(){
		if(selectedArr.length ==0){
			alert("请选择要移动的文件或文件夹");
			return;
		}
		toRemoveArr = [];
		removeToId = -99999;
		//获取要移动的元素
		selectedArr.forEach(function(id){
			setAllChildToRemoveById(id);
		});
		console.log(toRemoveArr);
		
		//显示弹出层
		//获取弹出层选取的ID值,假设为3
		removeToId = 3;
		removeData(toRemoveArr,removeToId)
		
		
		reInitTree();//重新初始化左侧树形菜单
		folders.innerHTML = createFileHtml(removeToId);	//左侧文件夹
		breadNav.innerHTML = createNavHtml(removeToId);
		positionElement(removeToId);
	}
	
	//获取所有需要移动的元素
	function setAllChildToRemoveById(id){
		toRemoveArr.push(id);
		var childs = getChildsById(id);
		if(childs.length){
			childs.forEach(function(item){
				setAllChildToRemoveById(item.id);
			});
		}
	}
	//对应文件夹的数据移动
	function removeData(arr,toid){
		arr.forEach(function(id){
			data[id].pid  = toid;
		});
	}
	
	
})();



