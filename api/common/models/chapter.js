module.exports = function(Chapter) {
  Chapter.prototype.recalculateTotals = function(cb) {
    const batches = this;
    batches(function(err, batches) {
      if (err) return cb(err);
      let totalCost = 0, totalSale = 0;
      batches.forEach(batch => {
        totalCost += batch.totalCostImport;
        totalSale += batch.totalSaleImport;
      });
      Chapter.updateAll({ id: this.id }, {
        totalCostImport: totalCost,
        totalSaleImport: totalSale
      }, cb);
    });
  };

  Chapter.observe('after save', function(ctx, next) {
    let instance = ctx.instance;
    if (instance) {
      instance.recalculateTotals(err => {
        next(err);
      });
    } else {
      next();
    }
  });
};
