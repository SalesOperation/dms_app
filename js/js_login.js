
//var ws_url = 'http://localhost:8090/ws_so/service_so.php';
var ws_url = 'https://190.4.63.207/ws_so/service_so.php';
var userWS = '69BA4B9D76B7C3452E2A48B7BF9790FE';
var pdwWS  = '0BAD6CE456FCFBEF59544697D43E06D1';
var cont_logs = 0;

var app = {
    
    //alert(getParams('user'));
    
    initialize: function() {        
        document.addEventListener("deviceready", this.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        //shownot('Hello World');
        console.log(device.cordova);  
        //cordova.plugins.backgroundMode.overrideBackButton();
        cordova.plugins.backgroundMode.setEnabled(false);       
        cordova.plugins.backgroundMode.setDefaults({title:'SO KPIs', text: 'Running', resume:true, hidden:true}); 
       
        cordova.plugins.backgroundMode.on('activate',function(){
           // navigator.vibrate(800)
           //setInterval(function(){ navigator.vibrate(80);}, 10000);
           //cordova.plugins.backgroundMode.configure({ silent: true });
        });
        
        cordova.plugins.backgroundMode.on('deactivate',function(){
            navigator.vibrate(50);
        });

        if(SMS) SMS.enableIntercept(vIntersept, function(){}, function(){});
        if(SMS) SMS.startWatch(function(){}, function(){});
            
        document.addEventListener('onSMSArrive', function(e){
            var sms = e.data;
            var arrinfo = [];
            //shownot();
            if(sms.address == 'BOCAPP'){
                //alert(sms.body + "/From:" + sms.address);
                arrinfo.push(hex2a(sms.body));                    
                getIdSMS(arrinfo);
            }
        });

        document.addEventListener('resume', function(e){
            KPIsmain(0);
            $("#dvtitle").html('Sales Operation-BOC');
            screen.orientation.unlock();
            $("#dvMap").hide();
        });

        document.addEventListener('backbutton', function(e){
            if(parseInt(vFlagFrame)==0){
                cordova.plugins.backgroundMode.moveToBackground();
            }else{
                if(vFlagFrame == 10 || vFlagFrame == 20 || vFlagFrame == 30 || vFlagFrame == 40 || vFlagFrame == 50 || vFlagFrame == 1){
                    switchMenu(1, 'Sales Operation-BOC',0,0);
                }else if(vFlagFrame == 11){
                    switchMenu(4, 'KPIs by SubChannel',0,0)
                }else if(vFlagFrame == 31){
                    switchMenu(5, 'KPIs Favorites',0,00)
                }
            }
        });

        var notificationOpenedCallback = function(jsonData) {
            console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
            consultSVR();
        };

        window.plugins.OneSignal
            .startInit("0bc4d5a9-2951-4262-8590-d24068acb2a1")
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();
    }

}

$(document).ready(function(e){

    $("#pwd").keypress(function(e){
        if(e.which == 13){
            login();
        };
    });

});

function msj(vStr){
    alert(msj);
}

function login(){

	var usr = String($("#user").val()).trim().toLowerCase();
	var pwd = String($("#pwd").val()).trim();
    var vQuery = '';
    var vDateLicense = getYMD(0);

    $.mobile.loading('show');                            

	db.transaction(function(cmd){   
        cmd.executeSql("SELECT * FROM users where id=? and status=1", [usr], function (cmd, results) {
            var len = results.rows.length, i;

            if(len>0){
                //alert(len);
                for (i = 0; i < len; i++) {
                    //alert(results.rows.item(i).login);
                    if(results.rows.item(i).pwd == pwd && vDateLicense <= results.rows.item(0).license){
                        //sleep(300);
                        window.location.replace('index.html?user=' + usr +  '&login=1');
                    }else{
                        cont_logs ++;
                        if(vDateLicense <= results.rows.item(0).license){
                            $("#msj_err").html('Acceso Denegado');
                        }else{
                            $("#msj_err").html('Clave Incorrecta');
                        }
                        if(cont_logs >= 3){
                            vQuery = 'DELETE FROM users where id =\'' + usr + '\'';
                            ejecutaSQL(vQuery, 0);
                        }
                        setTimeout(function(){$.mobile.loading('hide');}, 1000);
                    }
                   //alert(results.rows.item(i).id);          
                }
            }else{
                $.ajax( {type:'POST',
                        url: ws_url,
                        dataType:'json',
                        data: {m:100, vx:userWS, vy:pdwWS, ui:usr, pw:pwd},
                        success: function(data){ 
                            console.log(data);

                            setTimeout(function(){$.mobile.loading('hide');}, 1000);
                            
                            if(data[0].flag == 'true'){
                                console.log('Log OK');
                                vQuery = 'INSERT INTO users (id, pwd, name, phone, email, job_title, status, login,type, id_dms, license,id_pdv_dlr)';
                                vQuery += 'VALUES(\''+ usr +'\',\''+ pwd +'\',\''+ data[0].vdatos[0].name +'\',';
                                vQuery += data[0].vdatos[0].phone + ',';
                                vQuery += '\'' + data[0].vdatos[0].email + '\',';
                                vQuery += '\'' + data[0].vdatos[0].job + '\',1,1,\'-\',';
                                vQuery += data[0].vdatos[0].id_dms +',';
                                vQuery += data[0].vdatos[0].license +','+ data[0].vdatos[0].dlr_pdv_dms +')';
                                ejecutaSQL(vQuery, 0);
                                $("#msj_err").html('');
                                setTimeout(function(){ window.location.replace('index.html?user=' + usr +  '&login=1'); }, 800);
                            }else{
                                cont_logs += 1;
                                //console.log('Log Bad');
                                $("#msj_err").html("Usuario o Clave Incorecto");
                                if(cont_logs >= 3){
                                    vQuery = 'DELETE FROM users where id =\'' + usr + '\'';
                                    ejecutaSQL(vQuery, 0);
                                }
                            }  
                        },
                        error: function(data){
                            alert('Error consultando el servidor..');
                            setTimeout(function(){$.mobile.loading('hide');}, 1000);
                            console.log(data);
                        }
                }); 
                //$("#msj_err").html("Usuario Incorecto");
            }
        });
    });
}


function getYMD(vDays){
    var vToday = new Date();
    var time = vToday.getTime();
    var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time + milsecs);

    var strDate = '';
    strDate = vToday.getFullYear();

    if(parseInt(vToday.getMonth() + 1) < 10 ){
        strDate += '0' + (vToday.getMonth()+1);
    }else{
        strDate += '' + (vToday.getMonth()+1);
    }
    if(parseInt(vToday.getDate()) < 10 ){
        strDate += '0' + vToday.getDate();
    }else{
        strDate += '' + vToday.getDate();
    }
    return strDate;
}

function fclearusers(){
    vQuery = 'DELETE FROM users';
    ejecutaSQL(vQuery, 0);
    console.log('users cleared..');
}