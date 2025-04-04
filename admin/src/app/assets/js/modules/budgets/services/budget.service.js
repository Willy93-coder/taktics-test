export default function BudgetService($http) {
  const baseUrl = '/api/Budgets';

  function listBudgets(filter) {
    const params = filter
      ? '?filter=' + encodeURIComponent(JSON.stringify(filter))
      : '';
    return $http.get(baseUrl + params);
  }

  function getBudget(id) {
    return $http.get(`${baseUrl}/${id}`);
  }

  function createBudget(data) {
    return $http.post(baseUrl, data);
  }

  function updateBudget(id, data) {
    return $http.put(`${baseUrl}/${id}`, data);
  }

  function deleteBudget(id) {
    return $http.delete(`${baseUrl}/${id}`);
  }

  function deleteMultiple(ids) {
    return $http.post(`${baseUrl}/bulkDelete`, { ids });
  }

  function mergeBudgets(ids) {
    return $http.post(`${baseUrl}/merge`, { ids });
  }

  return {
    listBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    deleteMultiple,
    mergeBudgets,
  };
}

BudgetService.$inject = ['$http'];