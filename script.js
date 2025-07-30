class ExpenseTracker {
  constructor() {
    this.expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    this.budgets =
      JSON.parse(localStorage.getItem("budgets")) || this.getDefaultBudgets();
    this.goals = JSON.parse(localStorage.getItem("goals")) || [];
    this.settings =
      JSON.parse(localStorage.getItem("settings")) || this.getDefaultSettings();
    this.currentExpenseId = null;
    this.charts = {};
    this.filteredExpenses = [...this.expenses];
    this.currentSection = "dashboard";

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupTheme();
    this.updateDashboard();
    this.renderExpenses();
    this.setupDateDefaults();
    this.initializeCharts();
    this.loadAnalytics();
    this.loadBudgets();
    this.loadGoals();
    this.loadSettings();
  }

  getDefaultBudgets() {
    return {
      food: 15000,
      transport: 5000,
      entertainment: 8000,
      bills: 12000,
      shopping: 7000,
      healthcare: 3000,
      education: 2000,
      travel: 5000,
      other: 3000,
    };
  }

  getDefaultSettings() {
    return {
      currency: "INR",
      theme: "light",
      monthlyBudget: 50000,
      alertThreshold: 80,
      notifications: true,
    };
  }

  // Enhanced Event Listeners
  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.switchSection(e.target.dataset.section);
      });
    });

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme();
    });

    // Profile dropdown
    document.getElementById("profileBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleProfileDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      this.closeProfileDropdown();
    });

    // Modal controls
    document.getElementById("addExpenseBtn").addEventListener("click", () => {
      this.openExpenseModal();
    });

    document.getElementById("addExpenseBtn2").addEventListener("click", () => {
      this.openExpenseModal();
    });

    document.getElementById("quickAddBtn").addEventListener("click", () => {
      this.openQuickAddModal();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      this.closeExpenseModal();
    });

    document.getElementById("closeQuickAdd").addEventListener("click", () => {
      this.closeQuickAddModal();
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
      this.closeExpenseModal();
    });

    // Form submission
    document.getElementById("expenseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleExpenseSubmit();
    });

    // Quick add functionality
    document.querySelectorAll(".quick-category").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        const amount = parseFloat(e.target.dataset.amount);
        this.addQuickExpense(category, amount);
      });
    });

    document.getElementById("quickAddCustom").addEventListener("click", () => {
      const amount = parseFloat(document.getElementById("quickAmount").value);
      if (amount > 0) {
        this.addQuickExpense("other", amount);
      }
    });

    // Delete modal
    document
      .getElementById("closeDeleteModal")
      .addEventListener("click", () => {
        this.closeDeleteModal();
      });

    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
      this.closeDeleteModal();
    });

    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", () => {
        this.confirmDelete();
      });

    // Filters
    document.getElementById("searchInput").addEventListener("input", () => {
      this.applyFilters();
    });

    document.getElementById("categoryFilter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("dateFrom").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("dateTo").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("amountFilter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
      this.clearFilters();
    });

    // Analytics controls
    document
      .getElementById("analyticsTimeframe")
      .addEventListener("change", () => {
        this.loadAnalytics();
      });

    document.getElementById("chartPeriod").addEventListener("change", () => {
      this.updateCharts();
    });

    // Settings
    document.getElementById("themeSelect").addEventListener("change", (e) => {
      this.updateSetting("theme", e.target.value);
      this.applyTheme(e.target.value);
    });

    document
      .getElementById("currencySelect")
      .addEventListener("change", (e) => {
        this.updateSetting("currency", e.target.value);
        this.updateDashboard();
      });

    document
      .getElementById("monthlyBudgetSetting")
      .addEventListener("change", (e) => {
        this.updateSetting("monthlyBudget", parseFloat(e.target.value));
        this.updateDashboard();
      });

    document
      .getElementById("alertThreshold")
      .addEventListener("change", (e) => {
        this.updateSetting("alertThreshold", parseInt(e.target.value));
      });

    // Data management
    document.getElementById("exportData").addEventListener("click", () => {
      this.exportData();
    });

    document.getElementById("importData").addEventListener("click", () => {
      document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", (e) => {
      this.importData(e.target.files[0]);
    });

    document.getElementById("backupData").addEventListener("click", () => {
      this.exportData();
    });

    document.getElementById("restoreData").addEventListener("click", () => {
      document.getElementById("fileInput").click();
    });

    document.getElementById("clearAllData").addEventListener("click", () => {
      this.clearAllData();
    });

    // View all expenses
    document.getElementById("viewAllBtn").addEventListener("click", () => {
      this.switchSection("expenses");
    });

    // Modal backdrop clicks
    document.getElementById("expenseModal").addEventListener("click", (e) => {
      if (e.target.id === "expenseModal") {
        this.closeExpenseModal();
      }
    });

    document.getElementById("quickAddModal").addEventListener("click", (e) => {
      if (e.target.id === "quickAddModal") {
        this.closeQuickAddModal();
      }
    });

    document.getElementById("deleteModal").addEventListener("click", (e) => {
      if (e.target.id === "deleteModal") {
        this.closeDeleteModal();
      }
    });
  }

  // Theme Management
  setupTheme() {
    const savedTheme = this.settings.theme || "light";
    this.applyTheme(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
    this.updateSetting("theme", newTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.updateThemeIcon(theme);
    document.getElementById("themeSelect").value = theme;
  }

  updateThemeIcon(theme) {
    const themeIcon = document.querySelector("#themeToggle i");
    themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }

  // Profile Dropdown
  toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("active");
  }

  closeProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.remove("active");
  }

  // Navigation
  switchSection(sectionId) {
    this.currentSection = sectionId;

    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document
      .querySelector(`[data-section="${sectionId}"]`)
      .classList.add("active");

    // Update sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");

    // Load section-specific content
    if (sectionId === "analytics") {
      this.loadAnalytics();
    } else if (sectionId === "budgets") {
      this.loadBudgets();
    } else if (sectionId === "goals") {
      this.loadGoals();
    } else if (sectionId === "dashboard") {
      this.updateCharts();
    }
  }

  // Quick Add Modal
  openQuickAddModal() {
    document.getElementById("quickAddModal").classList.add("active");
  }

  closeQuickAddModal() {
    document.getElementById("quickAddModal").classList.remove("active");
    document.getElementById("quickAmount").value = "";
  }

  addQuickExpense(category, amount) {
    const expense = {
      id: Date.now(),
      amount: amount,
      description: `Quick ${this.getCategoryName(category)}`,
      category: category,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "card",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    this.expenses.unshift(expense);
    this.saveExpenses();
    this.updateDashboard();
    this.renderExpenses();
    this.closeQuickAddModal();
    this.showNotification(`₹${amount} expense added successfully!`, "success");
    this.checkBudgetAlerts();
  }

  // Expense Management
  openExpenseModal(expense = null) {
    this.currentExpenseId = expense ? expense.id : null;
    const modal = document.getElementById("expenseModal");
    const title = document.getElementById("modalTitle");
    const submitBtn = document.getElementById("submitBtnText");

    if (expense) {
      title.textContent = "Edit Expense";
      submitBtn.textContent = "Update Expense";
      this.populateForm(expense);
    } else {
      title.textContent = "Add New Expense";
      submitBtn.textContent = "Add Expense";
      this.clearForm();
    }

    modal.classList.add("active");
  }

  closeExpenseModal() {
    document.getElementById("expenseModal").classList.remove("active");
    this.clearForm();
    this.currentExpenseId = null;
  }

  populateForm(expense) {
    document.getElementById("amount").value = expense.amount;
    document.getElementById("description").value = expense.description;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
    document.getElementById("paymentMethod").value =
      expense.paymentMethod || "card";
    document.getElementById("notes").value = expense.notes || "";
  }

  clearForm() {
    document.getElementById("expenseForm").reset();
    document.getElementById("date").value = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("paymentMethod").value = "card";
  }

  handleExpenseSubmit() {
    const formData = {
      amount: parseFloat(document.getElementById("amount").value),
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      date: document.getElementById("date").value,
      paymentMethod: document.getElementById("paymentMethod").value,
      notes: document.getElementById("notes").value,
    };

    if (this.currentExpenseId) {
      this.updateExpense(this.currentExpenseId, formData);
    } else {
      this.addExpense(formData);
    }

    this.closeExpenseModal();
  }

  addExpense(expenseData) {
    const expense = {
      id: Date.now(),
      ...expenseData,
      createdAt: new Date().toISOString(),
    };

    this.expenses.unshift(expense);
    this.saveExpenses();
    this.updateDashboard();
    this.renderExpenses();
    this.updateCharts();
    this.showNotification("Expense added successfully!", "success");
    this.checkBudgetAlerts();
  }

  updateExpense(id, expenseData) {
    const index = this.expenses.findIndex((exp) => exp.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...expenseData };
      this.saveExpenses();
      this.updateDashboard();
      this.renderExpenses();
      this.updateCharts();
      this.showNotification("Expense updated successfully!", "success");
    }
  }

  deleteExpense(id) {
    this.expenseToDelete = id;
    document.getElementById("deleteModal").classList.add("active");
  }

  confirmDelete() {
    const index = this.expenses.findIndex(
      (exp) => exp.id === this.expenseToDelete
    );
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.saveExpenses();
      this.updateDashboard();
      this.renderExpenses();
      this.updateCharts();
      this.showNotification("Expense deleted successfully!", "success");
    }
    this.closeDeleteModal();
  }

  closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
    this.expenseToDelete = null;
  }

  // Data Management
  saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(this.expenses));
  }

  saveBudgets() {
    localStorage.setItem("budgets", JSON.stringify(this.budgets));
  }

  saveGoals() {
    localStorage.setItem("goals", JSON.stringify(this.goals));
  }

  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  // Dashboard Updates
  updateDashboard() {
    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const monthlyBudget = this.settings.monthlyBudget;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = this.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate trends
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    const lastMonthExpenses = this.expenses
      .filter((exp) => exp.date.startsWith(lastMonthStr))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const trendPercentage =
      lastMonthExpenses > 0
        ? (
            ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) *
            100
          ).toFixed(1)
        : 0;

    // Update DOM
    document.getElementById("totalExpenses").textContent =
      this.formatCurrency(totalExpenses);
    document.getElementById("monthlyBudget").textContent =
      this.formatCurrency(monthlyBudget);
    document.getElementById("remainingBudget").textContent =
      this.formatCurrency(monthlyBudget - monthlyExpenses);
    document.getElementById("monthlyExpenses").textContent =
      this.formatCurrency(monthlyExpenses);

    // Update trend
    const trendElement = document.getElementById("expenseTrend");
    const trendIcon =
      trendPercentage >= 0 ? "fas fa-arrow-up" : "fas fa-arrow-down";
    const trendColor =
      trendPercentage >= 0 ? "var(--color-danger)" : "var(--color-success)";
    trendElement.innerHTML = `<i class="${trendIcon}"></i><span>${Math.abs(
      trendPercentage
    )}% from last month</span>`;
    trendElement.style.color = trendColor;

    // Update budget progress
    const budgetProgress = (monthlyExpenses / monthlyBudget) * 100;
    document.getElementById("budgetProgress").style.width = `${Math.min(
      budgetProgress,
      100
    )}%`;

    // Update remaining days
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const daysRemaining = daysInMonth - today.getDate();
    document.getElementById(
      "daysRemaining"
    ).textContent = `${daysRemaining} days remaining`;

    // Update daily average
    const daysElapsed = today.getDate();
    const dailyAverage = daysElapsed > 0 ? monthlyExpenses / daysElapsed : 0;
    document.getElementById(
      "dailyAverage"
    ).textContent = `Avg: ${this.formatCurrency(dailyAverage)}/day`;

    this.renderRecentExpenses();
    this.checkBudgetAlerts();
  }

  checkBudgetAlerts() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = this.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const budgetUsed = (monthlyExpenses / this.settings.monthlyBudget) * 100;

    if (budgetUsed >= this.settings.alertThreshold) {
      this.showNotification(
        `Warning: You've used ${budgetUsed.toFixed(
          1
        )}% of your monthly budget!`,
        "warning"
      );
    }
  }

  renderRecentExpenses() {
    const recentExpenses = this.expenses.slice(0, 5);
    const container = document.getElementById("recentExpenses");

    if (recentExpenses.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses yet. Add your first expense!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = recentExpenses
      .map(
        (expense) => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-icon ${expense.category}">
                            ${this.getCategoryIcon(expense.category)}
                        </div>
                        <div class="expense-details">
                            <h4>${expense.description}</h4>
                            <p>${this.formatDate(
                              expense.date
                            )} • ${this.getCategoryName(expense.category)}</p>
                        </div>
                    </div>
                    <div class="expense-amount">-${this.formatCurrency(
                      expense.amount
                    )}</div>
                </div>
            `
      )
      .join("");
  }

  // Filters and Search
  applyFilters() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const amountFilter = document.getElementById("amountFilter").value;

    this.filteredExpenses = this.expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm) ||
        this.getCategoryName(expense.category)
          .toLowerCase()
          .includes(searchTerm);
      const matchesCategory =
        !categoryFilter || expense.category === categoryFilter;
      const matchesDateFrom = !dateFrom || expense.date >= dateFrom;
      const matchesDateTo = !dateTo || expense.date <= dateTo;
      const matchesAmount = this.matchesAmountFilter(
        expense.amount,
        amountFilter
      );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesAmount
      );
    });

    this.renderExpenses();
    this.updateFilterStats();
  }

  matchesAmountFilter(amount, filter) {
    if (!filter) return true;

    const [min, max] = filter.split("-").map((v) => v.replace("+", ""));
    const minAmount = parseFloat(min) || 0;
    const maxAmount = max ? parseFloat(max) : Infinity;

    return amount >= minAmount && amount <= maxAmount;
  }

  updateFilterStats() {
    const total = this.filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const count = this.filteredExpenses.length;
    const average = count > 0 ? total / count : 0;

    document.getElementById("filteredTotal").textContent =
      this.formatCurrency(total);
    document.getElementById("filteredCount").textContent = count;
    document.getElementById("filteredAverage").textContent =
      this.formatCurrency(average);
  }

  clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    document.getElementById("amountFilter").value = "";
    this.filteredExpenses = [...this.expenses];
    this.renderExpenses();
    this.updateFilterStats();
  }

  // Render Expenses
  renderExpenses() {
    const tbody = document.getElementById("expensesTableBody");

    if (this.filteredExpenses.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No expenses found matching your criteria.</p>
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = this.filteredExpenses
      .map(
        (expense) => `
                <tr>
                    <td>${this.formatDate(expense.date)}</td>
                    <td>
                        <div class="expense-description">
                            <strong>${expense.description}</strong>
                            ${
                              expense.notes
                                ? `<div class="expense-notes">${expense.notes}</div>`
                                : ""
                            }
                        </div>
                    </td>
                    <td>
                        <span class="category-tag ${expense.category}">
                            ${this.getCategoryIcon(expense.category)}
                            ${this.getCategoryName(expense.category)}
                        </span>
                    </td>
                    <td class="text-right">
                        <div class="amount-info">
                            <strong>${this.formatCurrency(
                              expense.amount
                            )}</strong>
                            <div class="payment-method">${this.getPaymentMethodIcon(
                              expense.paymentMethod
                            )} ${expense.paymentMethod || "Card"}</div>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="app.openExpenseModal(${JSON.stringify(
                              expense
                            ).replace(/"/g, "&quot;")})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="app.deleteExpense(${
                              expense.id
                            })">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
      )
      .join("");

    this.updateFilterStats();
  }

  // Charts and Analytics
  initializeCharts() {
    this.initTrendChart();
    this.initCategoryChart();
    this.updateCharts();
  }

  initTrendChart() {
    const ctx = document.getElementById("trendChart").getContext("2d");
    this.charts.trend = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Daily Expenses",
            data: [],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "₹" + value.toLocaleString();
              },
            },
          },
        },
      },
    });
  }

  initCategoryChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");
    this.charts.category = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [
              "#ff6b6b",
              "#4ecdc4",
              "#45b7d1",
              "#f9ca24",
              "#f0932b",
              "#6c5ce7",
              "#a55eea",
              "#26de81",
              "#fd79a8",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  updateCharts() {
    const period = parseInt(document.getElementById("chartPeriod").value);
    this.updateTrendChart(period);
    this.updateCategoryChart();
  }

  updateTrendChart(days = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const dailyData = [];
    const labels = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const dayExpenses = this.expenses
        .filter((exp) => exp.date === dateStr)
        .reduce((sum, exp) => sum + exp.amount, 0);

      dailyData.push(dayExpenses);
      labels.push(
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      );
    }

    this.charts.trend.data.labels = labels;
    this.charts.trend.data.datasets[0].data = dailyData;
    this.charts.trend.update();
  }

  updateCategoryChart() {
    const categoryTotals = {};

    this.expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    this.charts.category.data.labels = sortedCategories.map(([cat]) =>
      this.getCategoryName(cat)
    );
    this.charts.category.data.datasets[0].data = sortedCategories.map(
      ([, amount]) => amount
    );
    this.charts.category.update();
  }

  loadAnalytics() {
    const timeframe = document.getElementById("analyticsTimeframe").value;
    const analytics = this.calculateAnalytics(timeframe);

    this.renderAnalytics(analytics);
    this.initMonthlyChart();
    this.initWeeklyChart();
  }

  calculateAnalytics(timeframe) {
    let startDate;
    const endDate = new Date();

    switch (timeframe) {
      case "month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
        break;
      case "year":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredExpenses = this.expenses.filter(
      (exp) => new Date(exp.date) >= startDate && new Date(exp.date) <= endDate
    );

    const totalSpent = filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const categoryTotals = {};

    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const dailyAverage = totalSpent / days;

    return {
      totalSpent,
      topCategory: topCategory
        ? {
            name: this.getCategoryName(topCategory[0]),
            amount: topCategory[1],
            percentage: ((topCategory[1] / totalSpent) * 100).toFixed(1),
          }
        : null,
      dailyAverage,
      categoryTotals,
    };
  }

  renderAnalytics(analytics) {
    document.getElementById("topCategory").textContent = analytics.topCategory
      ? analytics.topCategory.name
      : "None";
    document.getElementById("topCategoryPercent").textContent =
      analytics.topCategory
        ? `${analytics.topCategory.percentage}% of spending`
        : "0% of spending";
    document.getElementById("dailyAverageAnalytics").textContent =
      this.formatCurrency(analytics.dailyAverage);

    this.renderCategoryAnalysis(analytics.categoryTotals);
  }

  renderCategoryAnalysis(categoryTotals) {
    const container = document.getElementById("categoryAnalysis");
    const total = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const sortedCategories = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    );

    container.innerHTML = sortedCategories
      .map(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        return `
                <div class="category-analysis-item">
                    <div class="category-info">
                        <span class="category-icon">${this.getCategoryIcon(
                          category
                        )}</span>
                        <span class="category-name">${this.getCategoryName(
                          category
                        )}</span>
                    </div>
                    <div class="category-stats">
                        <div class="category-amount">${this.formatCurrency(
                          amount
                        )}</div>
                        <div class="category-percentage">${percentage}%</div>
                    </div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  initMonthlyChart() {
    const ctx = document.getElementById("monthlyChart");
    if (!ctx) return;

    if (this.charts.monthly) {
      this.charts.monthly.destroy();
    }

    const monthlyData = this.getMonthlyData();

    this.charts.monthly = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: "Monthly Expenses",
            data: monthlyData.data,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "₹" + value.toLocaleString();
              },
            },
          },
        },
      },
    });
  }

  initWeeklyChart() {
    const ctx = document.getElementById("weeklyChart");
    if (!ctx) return;

    if (this.charts.weekly) {
      this.charts.weekly.destroy();
    }

    const weeklyData = this.getWeeklyData();

    this.charts.weekly = new Chart(ctx.getContext("2d"), {
      type: "radar",
      data: {
        labels: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        datasets: [
          {
            label: "Average Spending by Day",
            data: weeklyData,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgb(59, 130, 246)",
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgb(59, 130, 246)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "₹" + value;
              },
            },
          },
        },
      },
    });
  }

  getMonthlyData() {
    const monthlyTotals = {};
    const labels = [];
    const data = [];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      monthlyTotals[monthKey] = 0;
      labels.push(monthLabel);
    }

    this.expenses.forEach((expense) => {
      const monthKey = expense.date.slice(0, 7);
      if (monthlyTotals.hasOwnProperty(monthKey)) {
        monthlyTotals[monthKey] += expense.amount;
      }
    });

    Object.keys(monthlyTotals).forEach((month) => {
      data.push(monthlyTotals[month]);
    });

    return { labels, data };
  }

  getWeeklyData() {
    const weeklyTotals = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];

    this.expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday = 0
      weeklyTotals[dayOfWeek] += expense.amount;
      weeklyCounts[dayOfWeek]++;
    });

    return weeklyTotals.map((total, index) =>
      weeklyCounts[index] > 0 ? total / weeklyCounts[index] : 0
    );
  }

  // Budget Management
  loadBudgets() {
    this.renderBudgetOverview();
    this.renderCategoryBudgets();
  }

  renderBudgetOverview() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = this.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalBudget = this.settings.monthlyBudget;
    const percentage = ((monthlyExpenses / totalBudget) * 100).toFixed(0);

    document.getElementById("overallPercentage").textContent = `${percentage}%`;
    document.getElementById("totalSpent").textContent =
      this.formatCurrency(monthlyExpenses);
    document.getElementById("totalBudget").textContent =
      this.formatCurrency(totalBudget);
    document.getElementById("totalRemaining").textContent = this.formatCurrency(
      totalBudget - monthlyExpenses
    );

    // Update progress circle
    const progressCircle = document.getElementById("overallProgress");
    const circumference = 2 * Math.PI * 45; // Assuming radius of 45
    const offset = circumference - (percentage / 100) * circumference;
    progressCircle.style.setProperty("--progress", offset);
  }

  renderCategoryBudgets() {
    const container = document.getElementById("categoryBudgets");
    const currentMonth = new Date().toISOString().slice(0, 7);

    const categoryExpenses = {};
    this.expenses
      .filter((exp) => exp.date.startsWith(currentMonth))
      .forEach((exp) => {
        categoryExpenses[exp.category] =
          (categoryExpenses[exp.category] || 0) + exp.amount;
      });

    container.innerHTML = Object.entries(this.budgets)
      .map(([category, budget]) => {
        const spent = categoryExpenses[category] || 0;
        const percentage = ((spent / budget) * 100).toFixed(1);
        const remaining = budget - spent;

        return `
                <div class="budget-category-card">
                    <div class="budget-header">
                        <div class="category-info">
                            <span class="category-icon">${this.getCategoryIcon(
                              category
                            )}</span>
                            <h3>${this.getCategoryName(category)}</h3>
                        </div>
                        <div class="budget-amount">${this.formatCurrency(
                          budget
                        )}</div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(
                              percentage,
                              100
                            )}%"></div>
                        </div>
                        <div class="progress-text">${percentage}% used</div>
                    </div>
                    <div class="budget-details">
                        <span>Spent: ${this.formatCurrency(spent)}</span>
                        <span class="${
                          remaining >= 0 ? "remaining" : "overspent"
                        }">
                            ${
                              remaining >= 0 ? "Remaining" : "Over"
                            }: ${this.formatCurrency(Math.abs(remaining))}
                        </span>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // Goals Management
  loadGoals() {
    this.renderGoals();
  }

  renderGoals() {
    const container = document.getElementById("goalsGrid");

    if (this.goals.length === 0) {
      container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-target"></i>
                    <p>No financial goals set. Add your first goal!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.goals
      .map((goal) => {
        const progress = (
          (goal.currentAmount / goal.targetAmount) *
          100
        ).toFixed(1);
        return `
                <div class="goal-card">
                    <div class="goal-header">
                        <h3>${goal.title}</h3>
                        <div class="goal-target">${this.formatCurrency(
                          goal.targetAmount
                        )}</div>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(
                              progress,
                              100
                            )}%"></div>
                        </div>
                        <div class="progress-text">${progress}% achieved</div>
                    </div>
                    <div class="goal-details">
                        <span>Current: ${this.formatCurrency(
                          goal.currentAmount
                        )}</span>
                        <span>Target: ${this.formatDate(goal.targetDate)}</span>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // Settings Management
  loadSettings() {
    document.getElementById("themeSelect").value = this.settings.theme;
    document.getElementById("currencySelect").value = this.settings.currency;
    document.getElementById("monthlyBudgetSetting").value =
      this.settings.monthlyBudget;
    document.getElementById("alertThreshold").value =
      this.settings.alertThreshold;
  }

  // Data Import/Export
  exportData() {
    const data = {
      expenses: this.expenses,
      budgets: this.budgets,
      goals: this.goals,
      settings: this.settings,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-tracker-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification("Data exported successfully!", "success");
  }

  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.expenses) this.expenses = data.expenses;
        if (data.budgets) this.budgets = data.budgets;
        if (data.goals) this.goals = data.goals;
        if (data.settings)
          this.settings = { ...this.settings, ...data.settings };

        this.saveExpenses();
        this.saveBudgets();
        this.saveGoals();
        this.saveSettings();

        this.updateDashboard();
        this.renderExpenses();
        this.updateCharts();
        this.loadAnalytics();
        this.loadBudgets();
        this.loadGoals();
        this.loadSettings();

        this.showNotification("Data imported successfully!", "success");
      } catch (error) {
        this.showNotification(
          "Error importing data. Please check the file format.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  }

  clearAllData() {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      location.reload();
    }
  }

  // Utility Functions
  formatCurrency(amount) {
    const currency = this.settings.currency || "INR";
    const symbols = {
      INR: "₹",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    return `${symbols[currency] || "₹"}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  getCategoryName(category) {
    const categories = {
      food: "Food & Dining",
      transport: "Transportation",
      entertainment: "Entertainment",
      bills: "Bills & Utilities",
      shopping: "Shopping",
      healthcare: "Healthcare",
      education: "Education",
      travel: "Travel",
      other: "Other",
    };
    return categories[category] || "Other";
  }

  getCategoryIcon(category) {
    const icons = {
      food: "🍽️",
      transport: "🚗",
      entertainment: "🎬",
      bills: "💡",
      shopping: "🛍️",
      healthcare: "🏥",
      education: "📚",
      travel: "✈️",
      other: "📦",
    };
    return icons[category] || "📦";
  }

  getPaymentMethodIcon(method) {
    const icons = {
      cash: "💵",
      card: "💳",
      upi: "📱",
      netbanking: "🏦",
    };
    return icons[method] || "💳";
  }

  setupDateDefaults() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
  }

  showNotification(message, type = "info") {
    const container = document.getElementById("notificationContainer");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize the application
const app = new ExpenseTracker();
