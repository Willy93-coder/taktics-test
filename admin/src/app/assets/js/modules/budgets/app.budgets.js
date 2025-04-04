import angular from 'angular';
import budgetsUrl from './views/budgets.index.html';
import budgetsDetailUrl from './views/budgets.detail.html';
import BudgetsController from './controllers/budgets.index.controller';
import BudgetsDetailController from './controllers/budgets.detail.controller';
import BudgetService from './services/budget.service';


export default angular.module('app.budgets', [])
  .service('BudgetService', BudgetService)
  .config(routeConfig).name;

function routeConfig($stateProvider) {
  $stateProvider
    .state('budgets', {
      url: '/budgets',
      templateUrl: budgetsUrl,
      controller: BudgetsController,
      controllerAs: 'vm',
    })
    .state('budgetsNew', {
      url: '/budgets/new',
      templateUrl: budgetsDetailUrl,
      controller: BudgetsDetailController,
      controllerAs: 'vm',
    })
    .state('budgetsEdit', {
      url: '/budgets/:id',
      templateUrl: budgetsDetailUrl,
      controller: BudgetsDetailController,
      controllerAs: 'vm',
    });
}

routeConfig.$inject = ['$stateProvider'];