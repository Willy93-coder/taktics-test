export default function BudgetsListController($location, BudgetService) {
  const vm = this;

  vm.filter = {};
  vm.pageSize = 10;
  vm.currentPage = 0;
  vm.budgets = [];
  vm.selectedBudgets = [];
  vm.selectAll = false;

  vm.loadBudgets = function () {
    let skip = vm.currentPage * vm.pageSize;
    let filter = {
      where: {},
      limit: vm.pageSize,
      skip: skip,
      order: 'date DESC'
    };

    if (vm.filter.clientName) {
      filter.where.clientName = { like: `%${vm.filter.clientName}%` };
    }

    if (vm.filter.name) {
      filter.where.name = { like: `%${vm.filter.name}%` };
    }

    if (vm.filter.dateFrom && vm.filter.dateTo) {
      filter.where.date = { between: [vm.filter.dateFrom, vm.filter.dateTo] };
    }

    BudgetService.listBudgets(filter).then((res) => {
      vm.budgets = res.data;
    });
  };

  vm.nextPage = function () {
    vm.currentPage++;
    vm.loadBudgets();
  };

  vm.prevPage = function () {
    vm.currentPage--;
    vm.loadBudgets();
  };

  vm.goCreate = function () {
    $location.path('/budgets/new');
  };

  vm.editBudget = function (b) {
    $location.path('/budgets/' + b.id);
  };

  vm.deleteBudget = function (b) {
    if (confirm('Are you sure you want to delete this budget?')) {
      BudgetService.deleteBudget(b.id).then(() => {
        vm.loadBudgets();
      });
    }
  };

  vm.checkSelection = function () {
    vm.selectedBudgets = vm.budgets.filter(b => b._selected);
  };

  vm.toggleAll = function () {
    vm.budgets.forEach(b => b._selected = vm.selectAll);
    vm.checkSelection();
  };

  vm.deleteMultiple = function () {
    if (confirm('Delete selected budgets?')) {
      let ids = vm.selectedBudgets.map(b => b.id);
      BudgetService.deleteMultiple(ids).then(() => {
        vm.loadBudgets();
      });
    }
  };

  vm.mergeSelected = function () {
    let ids = vm.selectedBudgets.map(b => b.id);
    BudgetService.mergeBudgets(ids).then(() => {
      vm.loadBudgets();
    });
  };

  vm.loadBudgets();
}

BudgetsListController.$inject = ['$location', 'BudgetService'];