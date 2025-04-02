module.exports = function(Batch) {
  Batch.observe('before save', function(ctx, next) {
    let data = ctx.instance;
    if (!data) return next();

    data.unitaryCostImport = data.materialCostImport + data.labourCostImport;
    data.totalCostImport = data.unitaryCostImport * data.amount;
    data.unitarySaleCost = (data.materialCostImport * data.saleCoefficientMaterial) +
                           (data.labourCostImport * data.saleCoefficientLabour);
    data.totalSaleImport = data.unitarySaleCost * data.amount;

    next();
  });
};
