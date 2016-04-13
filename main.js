$(function() {
  
    var serverUrl = "http://remote.workbook.dk:34010/";
    var userName = "dlj";
    var password = "qwer";
    var emplyees = [];
    var currentEmployeeIndex = -1;
    
    var that = this;
  $( document ).ajaxError(function(event, jqxhr, settings, thrownError) {
    debugger;
  });
  
  // GLobal ajax setup. 
  $.ajaxSetup({
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
        "Authorization": basicAuthHeader(userName,password),
    }
  });

   // Get all Employees
   
    $.ajax({
        type: "GET",
        url: serverUrl + "api/resource/employees?Active=true"
    }).done(function (data) {
      emplyees = data;
      changeUser();
      //All employees has been loaded. Start the timer.
       setInterval($.proxy(changeUser,that), 10000);
    });
                


  function changeUser () {
     currentEmployeeIndex++;
     
     if (emplyees.length == currentEmployeeIndex)
       currentEmployeeIndex = 0;
       
       console.log("Getting data for " + emplyees[currentEmployeeIndex].Name);
       getResource(emplyees[currentEmployeeIndex].Id);
       getTasks(emplyees[currentEmployeeIndex].Id);
  }
  
  function getResource(resourceId) {
     $.ajax({
        type: "GET",
        url: serverUrl + "api/resource/" + resourceId
     }).done(function (data) {
       if (data) {
         window.requestAnimationFrame(function() {
            $("#username").html(data.Name + "(@" + data.Initials  + ")");
            $("#userimagecontainer img").attr("src", serverUrl +  "/api/resource/" + data.Id + "/picture/256");
            $(document.body).animate({opacity: 1}, 500);
          });
       }
     });
  }
  
  function getTasks(resourceId) {
      $.ajax({
        type: "GET",
        url: serverUrl + "api/tasks",
        data : { "ResourceId" : resourceId, "Active" : true }
    }).done(function (data) {
      if (data === 0 || data.length === 0)
        return;
      // Handle task Data.
      var highPrio = [];
      var medPrio = [];
      var lowPrio = [];
      var taskIds = [];
      var highPrioPercentage = 0;
      var medPrioPercentage = 0;
      var lowPrioPercentage = 0;
      
      for (var i = 0;i < data.length; i++) {
        // This could also be done after with a Map, but faster when there already is a loop
        taskIds.push({ Id : data[i].Id });
        
         if (data[i].PriorityId === 3) {
          lowPrio.push(data[i]);
         }
         else if (data[i].PriorityId === 2)  {
           medPrio.push(data[i]);
         }
         else if (data[i].PriorityId === 1)  {
         highPrio.push(data[i]);
        }
        else
          throw "PriorityId not known";
      }
      
      getTaskResources(resourceId,taskIds);
      
      highPrioPercentage = ((highPrio.length * 100) / data.length).toFixed(2);
      medPrioPercentage = ((medPrio.length * 100) / data.length).toFixed(2);
      lowPrioPercentage = ((lowPrio.length * 100) / data.length).toFixed(2);
      
      window.requestAnimationFrame(function() {
        $("#hightasks > .taskcontainer > .taskcontainercounttext").html(highPrio.length + " items");
        $("#mediumtasks > .taskcontainer > .taskcontainercounttext").html(medPrio.length + " items");
        $("#lowtasks > .taskcontainer > .taskcontainercounttext").html(lowPrio.length + " items");
         
        $("#hightasks > .taskcontainer > .taskcontainerpercentag").animate({ "width" : highPrioPercentage + "%" }, 500 );
        $("#mediumtasks > .taskcontainer > .taskcontainerpercentag").animate({"width" : medPrioPercentage + "%" }, 500 );
        $("#lowtasks > .taskcontainer > .taskcontainerpercentag").animate({"width" : lowPrioPercentage + "%" }, 500 );
         
        $("#hightasks > .taskcontainer > .taskcontainerpercentagetext").html(highPrioPercentage + "%");
        $("#mediumtasks > .taskcontainer > .taskcontainerpercentagetext").html(medPrioPercentage + "%");
        $("#lowtasks > .taskcontainer > .taskcontainerpercentagetext").html(lowPrioPercentage + "%");
      });
    });
  }
  
  function getTaskResources(resourceId,taskIds) {
       $.ajax({
         /*
        type: "POST",
        url: serverUrl + "api/task/resources",
        data : JSON.stringify({ "ResourceId" : resourceId, "TaskIds" : taskIds }),
        */
        type : "POST",
        url : serverUrl + "api/json/reply/TaskResourcesRequest[]",
        data : JSON.stringify(taskIds),
         headers: { "X-HTTP-Method-Override": 'GET' },
       }).done(function(data) {
          var hours = 0;
          var hoursUsed = 0;
          var hoursoverBooked = 0;
          for (var i = 0;i < data.length; i++) { 
            if (!(data[i].hasOwnProperty("ResId") && data[i].ResId === resourceId))
              continue;
            var tmpHours = 0;
            var tmpCap = 0;
            
            if (data[i].hasOwnProperty("Hours"))
              tmpHours = parseFloat(data[i].Hours);
              
              hours += tmpHours;
              
           if (data[i].hasOwnProperty("HoursTimeRegistration"))
              hoursUsed += parseFloat(data[i].HoursTimeRegistration);
              
           if (data[i].hasOwnProperty("Capacity"))
            tmpCap = data[i].Capacity;
            
            if (tmpHours > tmpCap)
              hoursoverBooked += (tmpHours - tmpCap);
              
            if (data[i].hasOwnProperty("HoursTimeRegistration"))
              hoursUsed += parseFloat(data[i].HoursTimeRegistration);
              
          }
           window.requestAnimationFrame(function() {
            $("#hoursbooked > #hoursbookedtext").html(hours + " hours");
            $("#hoursused > #hoursusedtext").html(hoursUsed + " hours");
            $("#hoursoverbooked > #hoursoverbookedtext").html(hoursoverBooked + " hours");
            $("#timetocompletion > #timetocompletiontext").html(((hours - hoursUsed) / 6).toFixed(2) + " work days");
           });
       });

  }
  
  function basicAuthHeader (username, password) {
    var tok = username + ':' + password;
    var hash = btoa(tok);
    return "Basic " + hash;
  }
});