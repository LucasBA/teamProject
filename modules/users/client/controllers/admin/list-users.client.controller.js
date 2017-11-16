'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', '$state', '$http', 'Admin',
  function ($scope, $filter, $state, $http, Admin) {
    $scope.currentUser = undefined;
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.displayDetails = function(index) {
      $scope.detailedInfo = $scope.users[index];
      $scope.currentUser = $scope.users[index];
    };

    $scope.returnUser = function(index) {
      $scope.userID = $scope.users[index];
    }; //Added this!!!!

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

    $scope.makeAdmin = function(){
      if (confirm('Are you sure you want to give this user Administrator privledges?')) {
        if ($scope.currentUser !== undefined) {
          $http.post('/api/admin/makeAdmin', $scope.currentUser).success(function (response) {
            $state.go('admin.users', $state.previos.params);
          }).error(function (response) {
            $scope.error = response.message;
          });
        }
      }
    };

    $scope.remove = function () {
      var user = $scope.currentUser;
      if (confirm('Are you sure you want to delete this user?')) {
        if (user !== undefined) {
          $http.post('/api/admin/removeUser', $scope.currentUser).success(function (response) {
            $state.go($state.previous.state.name || 'home', $state.previous.params);
          }).error(function (response) {
            $scope.error = response.message;
          });
        }
        else{
          alert('Cannot delete user');
        }
      }
    };
  }
]);
