var app = angular.module('plunker',[]);

app.controller('DynamicFormController', function ($scope, $log) {
    

 
    // we would get this from the api
    $scope.entity = {
      name : "Course", 
      fields :
        [
          {type: "text", name: "firstname", label: "Name" , required: true, data:""},
          {type: "radio", name: "color_id", label: "Colors" , options:[{id: 1, name: "orange"},{id: 2, name: "pink"},{id: 3, name: "gray"},{id: 4, name: "cyan"}], required: true, data:""},
          {type: "email", name: "emailUser", label: "Email" , required: true, data:""},
          {type: "text", name: "city", label: "City" , required: true, data:""},
          {type: "password", name: "pass", label: "Password" , min: 6, max:20, required: true, data:""},
          {type: "select", name: "teacher_id", label: "Teacher" , options:[{name: "Mark"},{name: "Claire"},{name: "Daniel"},{name: "Gary"}], required: true, data:""},
          {type: "checkbox", name: "car_id", label: "Cars" , options:[{id: 1, name: "bmw"},{id: 2, name: "audi"},{id: 3, name: "porche"},{id: 4, name: "jaguar"}], required: true, data:""}
        ]
      };

      $scope.submitForm = function(){
        $log.debug($scope.entity);
      }
})

  .directive("dynamicName",function($compile){
    return {
        restrict:"A",
        terminal:true,
        priority:1000,
        link:function(scope,element,attrs){
            element.attr('name', scope.$eval(attrs.dynamicName));
            element.removeAttr("dynamic-name");
            $compile(element)(scope);
        }
    }
})
