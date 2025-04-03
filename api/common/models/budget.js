module.exports = function (Budget) {
  Budget.prototype.recalculateTotals = function (cb) {
    const budget = this;
    budget.chapters(function (err, chapters) {
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

  Budget.observe('after save', function (ctx, next) {
    let instance = ctx.instance;
    if (!instance) {
      return next();
    }

    instance.recalculateTotals(function (err) {
      next(err);
    });
  });

  Budget.mergeBudgets = function (data, cb) {
    if (!data || !Array.isArray(data.ids) || data.ids.length < 2) {
      return cb(new Error('Debes enviar un objeto con la propiedad "ids" como array con al menos 2 IDs.'));
    }
    const ids = data.ids;

    Budget.find({
      where: { id: { inq: ids } },
      include: 'chapters'
    }, function (err, budgets) {
      if (err) return cb(err);
      if (!budgets || budgets.length < 2) {
        return cb(new Error('No se encontraron suficientes presupuestos.'));
      }

      const mergedBudgetData = {
        name: 'Presupuesto Fusionado',
        thumbnail: 'imagen fusionada',
        date: new Date(),
        client_name: 'Cliente de fusión',
      };

      Budget.create(mergedBudgetData, function (err, newBudget) {
        if (err) return cb(err);

        const Chapter = Budget.app.models.Chapter;
        const Batch = Budget.app.models.Batch;

        const chaptersToMerge = [];
        budgets.forEach(function (budget) {
          let chs = (budget.__cachedRelations && budget.__cachedRelations.chapters) || [];
          chs.forEach(function (ch) {
            chaptersToMerge.push(ch.toJSON());
          });
        });

        const createChapter = function (chapterData, done) {
          delete chapterData.id;
          chapterData.budgetId = newBudget.id;

          Chapter.create(chapterData, function (err, newChapter) {
            if (err) return done(err);

            if (chapterData.batches && chapterData.batches.length) {
              const createBatch = function (batchData, batchDone) {
                delete batchData.id;
                batchData.chapterId = newChapter.id;
                Batch.create(batchData, batchDone);
              };

              let i = 0;
              const nextBatch = function (err) {
                if (err) return done(err);
                if (i < chapterData.batches.length) {
                  createBatch(chapterData.batches[i++], nextBatch);
                } else {
                  return done();
                }
              };
              nextBatch();
            } else {
              return done();
            }
          });
        };

        let i = 0;
        const nextChapter = function (err) {
          if (err) return cb(err);
          if (i < chaptersToMerge.length) {
            createChapter(chaptersToMerge[i++], nextChapter);
          } else {
            return cb(null, newBudget);
          }
        };
        nextChapter();
      });
    });
  };

  Budget.observe('before delete', function (ctx, next) {
    const where = ctx.where;
    if (!where) return next();

    Budget.find({ where: where }, (err, budgets) => {
      if (err) return next(err);
      if (!budgets || budgets.length === 0) return next();

      const Chapter = Budget.app.models.Chapter;

      let total = budgets.length;
      let count = 0;

      budgets.forEach(budget => {
        Chapter.destroyAll({ budgetId: budget.id }, (err2) => {
          if (err2) return next(err2);
          count++;
          if (count === total) {
            return next();
          }
        });
      });
    });
  });

  Budget.uploadThumbnail = function (id, req, res, cb) {
    Budget.findById(id, (err, budgetInstance) => {
      if (err) return cb(err);
      if (!budgetInstance) return cb(new Error('Budget no encontrado'));

      const Container = Budget.app.models.Container;
      Container.upload(req, res, { container: 'thumbnails' }, function (err, fileObj) {
        if (err) return cb(err);
        const fileInfo = fileObj.files.file[0];
        budgetInstance.thumbnail = `/api/containers/thumbnails/download/${fileInfo.name}`;
        budgetInstance.save((err2, updated) => {
          if (err2) return cb(err2);
          cb(null, updated);
        });
      });
    });
  };

  Budget.remoteMethod('uploadThumbnail', {
    description: 'Sube un archivo y lo asocia como thumbnail del Budget',
    accepts: [
      { arg: 'id', type: 'string', required: true },
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'res', type: 'object', http: { source: 'res' } }
    ],
    returns: { arg: 'budget', type: 'object' },
    http: { path: '/:id/uploadThumbnail', verb: 'post' }
  });

  Budget.remoteMethod('mergeBudgets', {
    accepts: [
      {
        arg: 'ids',
        type: 'object',
        required: true,
        http: { source: 'body' }
      }
    ],
    returns: { arg: 'mergedBudget', type: 'object' },
    http: { path: '/merge', verb: 'post' },
    description: 'Fusiona múltiples presupuestos en uno solo.'
  });
};
