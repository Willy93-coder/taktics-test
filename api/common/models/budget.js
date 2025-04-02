module.exports = function(Budget) {
  Budget.prototype.recalculateTotals = function(cb) {
    const budget = this;
    budget.chapters(function(err, chapters) {
      if (err) return cb(err);
      let totalCost = 0;
      let totalSale = 0;
      chapters.forEach(chapter => {
        totalCost += chapter.totalCostImport;
        totalSale += chapter.totalSaleImport;
      });
      Budget.updateAll({ id: budget.id }, {
        totalCostImport: totalCost,
        totalSaleImport: totalSale
      }, cb);
    });
  };

  Budget.observe('after save', function(ctx, next) {
    let instance = ctx.instance;
    if (!instance) {
      return next();
    } 

    instance.recalculateTotals(function(err) {
      next(err);
    });
  });
};
