module.exports = function (Chapter) {
  Chapter.prototype.recalculateTotals = function (cb) {
    const chapter = this;
    chapter.batches(function (err, batches) {
      if (err) return cb(err);
      let totalCost = 0, totalSale = 0;
      batches.forEach(batch => {
        totalCost += batch.totalCostImport;
        totalSale += batch.totalSaleImport;
      });
      Chapter.updateAll({ id: chapter.id }, {
        totalCostImport: totalCost,
        totalSaleImport: totalSale
      }, cb);
    });
  };

  Chapter.observe('after save', function (ctx, next) {
    let instance = ctx.instance;
    if (instance) {
      instance.recalculateTotals(err => {
        next(err);
      });
    } else {
      next();
    }
  });

  Chapter.observe('before delete', function (ctx, next) {
    const where = ctx.where;
    if (!where) return next();

    Chapter.find({ where: where }, (err, chapters) => {
      if (err) return next(err);
      if (!chapters || chapters.length === 0) return next();

      const Batch = Chapter.app.models.Batch;

      let total = chapters.length;
      let count = 0;

      chapters.forEach(chapter => {
        Batch.destroyAll({ chapterId: chapter.id }, (err2) => {
          if (err2) return next(err2);

          count++;
          if (count === total) {
            return next();
          }
        });
      });
    });
  });
};
