var bodyWidth = $("body").css("width");
$("div.items").css("width",(bodyWidth.substring(0,bodyWidth.length-2)-380)+"px");

//跑马灯循环
var tx;
var runtx;
//是否正在运行跑马灯
var isRun=true;
//是否跑马灯暂停状态
var pause =false;
//排名分组显示算法已经取消
//var ts=20
//默认跑马灯频率
var pl=50;
//程序是否开始运行用于判断程序是否开始运行
var isStart=false;
	
var zzs = "#98ff98";
//跑马灯音效
var runingmic=document.getElementById("runingmic");
runingmic.volume=0.5;
//中奖音效
var pausemic=document.getElementById("pausemic");
pausemic.volume=1.0;

var keyStatus=false;

//帮助对象
var readmeDialog = showReadme();

$("document").ready(function(){
    
    //初始化皮肤
    if(localStorage.getItem(lotteryPrefix+"pf"))
    {
		var	pf = localStorage.getItem(lotteryPrefix+"pf");
		dynamicLoading.css("./css/style"+pf+".css");
		$("#bodybg img").attr("src","./images/bodybg"+pf+".jpg");
		$("input[name=pf][value="+pf+"]").attr("checked",true);
		if(pf!=1){
		    zzs="#ba3030";
		}
	}
    //初始化标题
    if(localStorage.getItem("title"))
    {
		$("#title").val(localStorage.getItem("title"));
	}
    $(".top").text($("#title").val()+"（"+lotteryTitles[lotteryNumber]+"）");
    
    //频率模式本地存储  	 
	if(localStorage.getItem(lotteryPrefix+"ms"))
    {
		pl = localStorage.getItem(lotteryPrefix+"ms");
		$("input[name=ms][value="+pl+"]").attr("checked",true);
	}
	//排名信息本地存储
	if(localStorage.getItem(lotteryPrefix+"sequence"))
    {
        var ssHtml = localStorage.getItem(lotteryPrefix+"sequence");
		$(".ss").html(ssHtml);
	}

    //custom lottery
    var customLotteryMembers = ['159*1059', '152*9392'];
	//创建item小方格
    $.each(members, function(index, value){
        if($.inArray(value, customLotteryMembers) >= 0)
        {
            customers.push(index);
        }
        var lm = [];
        $.each(lotteryPrefixes, function(index, value){
            var temp = localStorage.getItem(value+"lotteryMembers");
            if(temp)
            {
                lm = $.merge(lm, temp.split(','));
            }
        });
        var ignoreClassName = '';
        if($.inArray(value, lm) >= 0)
        {
            ignoreClassName = ' ignore';
        }
        $("div.items").append("<div class='item i"+index+ignoreClassName+"' data-index='"+index+"'>"+(++index)+"</div>");
    });

	//本地存储item宽度信息
	if(localStorage.getItem(lotteryPrefix+"itemk"))
    {
		$("div.item").css("width",localStorage.getItem(lotteryPrefix+"itemk")+"px");
	}
    //本地存储item高度信息
	if(localStorage.getItem(lotteryPrefix+"itemg"))
    {
		$("div.item").css("height",localStorage.getItem(lotteryPrefix+"itemg")+"px");
		$("div.item").css("line-height",localStorage.getItem(lotteryPrefix+"itemg")+"px");
	}
    //回显设定item宽高
	$("#itemk").attr("placeholder",$(".i1").css("width"));
	$("#itemg").attr("placeholder",$(".i1").css("height"));
	
	//初始化排序信息
	$(".ss li").each(function(idx,item){
        var num = $(item).attr("data-number");
		$(".i"+num).addClass("ignore");
        lotteryMembers.push(members[num]);
        localStorage.setItem(lotteryPrefix+"lotteryMembers", lotteryMembers);
	});

    $("body").keyup(function(e){
    	keyStatus = false;
	});

	//全局键盘事件监听
	$("body").keydown(function(e){
		if(isStart){
			if(! keyStatus)
            {
			    keyStatus=true;
			} else {
				return false;
			}
		}
		if(e.keyCode == 116 || e.keyCode == 8)
        {
			return true;
		}
		//按F1弹出帮助窗口
		if(e.keyCode == 112)
        {
			e.preventDefault();
            if($(".readme:hidden").size() > 0)
                readmeDialog.show();
            else
                readmeDialog.close();
			return false;
		}
		//ESC案件呼出隐藏菜单
		if(e.keyCode == 27)
        {
			if($(".help:hidden").size() > 0)
				$(".help").show();
			else
				$(".help").hide();
			return false;
		}
        
		if(e.keyCode == 37)
        {
			$(".prev").click();
			return false;
		}
		if(e.keyCode == 39)
        {
			$(".next").click();
			return false;
		}
		//当程序出于暂停状态
		if(pause)
        {
			//以下按键有效 数字键 0-9 和 小键盘 0-9
			return true;
		}
		//存在未中奖用户切程序出于未开始运行状态执行开始方法
		if((e.keyCode==32 || e.keyCode == 65) && $("div.item:not(.ignore)").size() != 0 && ! isStart)
        {
			isStart = !isStart;
			startApp();
			return false;
		}
		
		if(e.keyCode == 32 || e.keyCode == 65)
        {
			//当所有抽奖号全部抽取完毕则销毁跑马和音效循环
			if($("div.item:not(.ignore)").size() == 0)
            {
				clearInterval(tx);
				clearInterval(runtx);
				runingmic.puase();
				alert("抽奖已经全部结束。");
				return false;
			}
			//更新运行状态
			isRun = !isRun;
			//如果项目出于运行状态
			if(! isRun)
            {
                //deal customers
                var runCount = $(".ss>ol>li").size();
                if(runCount >= 1 && lotteryNumber < 2 && customers.length > 0)
                {
                    var randCustomer = Math.floor(Math.random() * customers.length);
                    if($(".i"+customers[randCustomer]+".ignore").attr('data-index') != customers[randCustomer])
                    {
                        $(".item.active").removeClass("active");
                        $("div.item:not(.ignore):not(.active).i"+customers[randCustomer]).addClass("active");
                        customers.splice(randCustomer, 1);
                    }
                }
				//取得当前选中号码
				var it = $(".item.active").attr('data-index');
				//停止跑马灯
				runingmic.pause();

				//播放中奖音效
				pausemic.currentTime = 0;
				pausemic.play();

				//中奖号处理
				var it = Number(it);
                $('.ss ol').append('<li class="si'+it+'" data-number='+it+'>'+members[it]+"："+lotteryTitle+'；</li>');
                var dd = dialog({
                    title: '抽奖结果',
                    content: '<h2>'+members[it]+' 恭喜您，抽得'+lotteryTitle+'！</h2>',
                    okValue: '确定',
                    ok: function(){
                        dd.close();
                    }
                });
                dd.show();
                lotteryMembers.push(members[it]);
                localStorage.setItem(lotteryPrefix+"lotteryMembers", lotteryMembers);
                localStorage.setItem(lotteryPrefix+"sequence",$(".ss").html()); 
				$(".item.active").addClass("ignore");
				$(".item.active").pulsate({
					color: zzs,        //#98ff98
					repeat: 5
				});
			} else {
				$(".active").removeClass("active");
				runingmic.play();
			}
		}
		e.preventDefault();
	});
	
	//打开高级设置窗口	 
	$("a.config").click(function(){
		pause=true;
		runingmic.pause();
		var d = dialog({
			title: '抽奖参数设定',
		    content: $(".model"),
		    okValue: '确定',
		    ok: function(){
		    	if($("#reset:checked").val() && confirm("点击确定将清空抽奖结果。")){
		    		localStorage.removeItem(lotteryPrefix+"sequence");
                    localStorage.removeItem(lotteryPrefix+"lotteryMembers");
		    	}
		   		if($("#itemk").val()){
		   			localStorage.setItem(lotteryPrefix+"itemk", $("#itemk").val());
		    	}
		   		if($("#itemg").val()){
		    		localStorage.setItem(lotteryPrefix+"itemg", $("#itemg").val());
		    	}
		    	localStorage.setItem("title", $("#title").val());
		    	localStorage.setItem(lotteryPrefix+"ms", $("input[name=ms]:checked").val());
		    	localStorage.setItem(lotteryPrefix+"pf", $("input[name=pf]:checked").val());
		    	window.location.reload();
		    }, onclose: function(){
		        pause = false;
		    }
		});
		d.show();
	});
	
	//清除错误中奖号
	$("body").on("click",".item.ignore",function(){
		if(confirm("点击确定将清除错误中奖号。"))
        {
			$("li[data-number="+$(this).attr('data-index')+"]").remove();
			$(this).removeClass("active ignore");
			localStorage.setItem(lotteryPrefix+"sequence",$(".ss").html());
            localStorage.removeItem(lotteryPrefix+"lotteryMembers");
        } else
        {

		}
	});
});
//程序开始入口
function startApp(){
	//开始播放跑马灯音效
	runingmic.play();
 	//产生随机数临时变量
	var rand = 0;
	//存储上一次随机数的临时变量
	var prenum;
	tx = setInterval(function(){
	    if(isRun){
	    	while(true){
				rand=Math.floor(Math.random() * ( $("div.item:not(.ignore)").size()));
			 	if(rand == 0 || rand != prenum){break;}
			}
			prenum = rand;
			$(".item.active").removeClass("active");
			$("div.item:not(.ignore):not(.active)").eq(rand).addClass("active");
		}
	}, pl);
	runtx = setInterval(function(){runingmic.currentTime = 0;},7000);
}
/**
 * 显示帮助信息
 *
 * @returns dialog
 */
function showReadme()
{
	return dialog({
		    title: '帮助信息',
		    content: $(".readme") ,
		    width:'400px',
		    okValue: '关闭',
			ok:function(){
		    },
		    onclose: function () {
		        pause=false;
		    }
	});
}
var dynamicLoading = {
    css: function(path){
		if(!path || path.length === 0){
			throw new Error('argument "path" is required !');
		}
		var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.href = path;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        head.appendChild(link);
    },
    js: function(path){
		if(!path || path.length === 0){
			throw new Error('argument "path" is required !');
		}
		var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = path;
        script.type = 'text/javascript';
        head.appendChild(script);
    }
}