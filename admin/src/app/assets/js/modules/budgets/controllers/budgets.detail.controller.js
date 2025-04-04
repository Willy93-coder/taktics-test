/**
 * @typedef {Object} Batch
 * @property {number} rank
 * @property {string} description
 * @property {number} amount
 * @property {number} labourCostImport
 * @property {number} materialCostImport
 */

/**
 * @typedef {Object} Chapter
 * @property {number} rank
 * @property {string} description
 * @property {number} saleCoefficientLabour
 * @property {number} saleCoefficientMaterial
 * @property {Batch[]} batches
 */

/**
 * @typedef {Object} Budget
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [thumbnail]
 * @property {Chapter[]} chapters
 */
export default function BudgetsDetailController($stateParams, $state, BudgetService, ContainerService) {
  const vm = this;

  vm.newThumbnail = null;

  vm.isNew = !$stateParams.id;

  /**
 * @type {Budget}
 */
  vm.budget = {
    chapters: []
  };

  if (!vm.isNew) {
    BudgetService.getBudget($stateParams.id).then((res) => {
      vm.budget = res.data;
      vm.budget.chapters = vm.budget.chapters || [];
    });
  }

  vm.saveBudget = function () {
    if (vm.isNew) {
      BudgetService.createBudget(vm.budget).then(() => {
        $state.go('budgets');
      });
    } else {
      BudgetService.updateBudget(vm.budget.id, vm.budget).then(() => {
        $state.go('budgets');
      });
    }
  };

  vm.uploadThumbnail = function () {
    if (!vm.newThumbnail) return;
    ContainerService.uploadFile('images', vm.newThumbnail).then((filename) => {
      vm.budget.thumbnail = `/api/containers/images/download/${filename}`;
    });
  };

  vm.deleteThumbnail = function () {
    vm.budget.thumbnail = undefined;
  };

  vm.addChapter = function () {
    vm.budget.chapters = vm.budget.chapters || [];
    vm.budget.chapters.push({
      rank: vm.budget.chapters.length + 1,
      description: '',
      saleCoefficientLabour: 1,
      saleCoefficientMaterial: 1,
      batches: []
    });
  };

  vm.deleteChapter = function (ch) {
    const idx = vm.budget.chapters.indexOf(ch);
    if (idx >= 0) vm.budget.chapters.splice(idx, 1);
  };

  vm.addBatch = function (ch) {
    ch.batches = ch.batches || [];
    ch.batches.push({
      rank: ch.batches.length + 1,
      description: '',
      amount: 1,
      labourCostImport: 0,
      materialCostImport: 0
    });
  };

  vm.deleteBatch = function (ch, b) {
    const idx = ch.batches.indexOf(b);
    if (idx >= 0) ch.batches.splice(idx, 1);
  };
}

BudgetsDetailController.$inject = ['$stateParams', '$state', 'BudgetService', 'ContainerService'];