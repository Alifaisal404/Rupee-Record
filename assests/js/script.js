// Select DOM elements
const amountInput = document.getElementById("amount_input");
const categoryInputs = document.getElementsByName("category");
const notesInput = document.getElementById("notes");
const submitIncomeButton = document.getElementById("submit_as_income");
const submitExpenseButton = document.getElementById("submit_as_expense");
const balanceDisplay = document.getElementById("balance_display");
const incomeSheet = document.getElementById("income_sheet");
const expenseSheet = document.getElementById("expense_sheet");

let transactions = []; // Store transactions in an array

// Load data from localStorage
function loadData() {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Clear previous sheet data
    incomeSheet.innerHTML = '';
    expenseSheet.innerHTML = '';

    // Repopulate the transaction list and balance
    transactions.forEach(transaction => {
        addTransactionToSheet(transaction.type, transaction.amount, transaction.category, transaction.notes, false);
    });

    updateBalanceDisplay(); // Update the balance based on loaded transactions
}

// Calculate and update balance display
function updateBalanceDisplay() {
    const totalIncome = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpense = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const balance = totalIncome - totalExpense;
    balanceDisplay.textContent = `Balance: ${balance.toFixed(2)} ${balance <= 0 ? '😢' : ''}`;
}

// Add transaction to the sheet and optionally update localStorage
function addTransactionToSheet(type, amount, category, notes, shouldUpdateLocalStorage = true) {
    const transactionRow = document.createElement("div");
    transactionRow.className = "transaction-row";
    transactionRow.innerHTML = `
        <span class="transaction-amount">${type === 'income' ? '+' : '-'} ${Math.abs(amount).toFixed(2)}</span>
        <span class="transaction-category">${category}</span>
        <span class="transaction-notes">${notes || 'No notes'}</span>
        <button class="delete-button">Delete</button>
    `;

    if (type === 'income') {
        incomeSheet.appendChild(transactionRow);
    } else {
        expenseSheet.appendChild(transactionRow);
    }

    // Add delete functionality
    transactionRow.querySelector('.delete-button').addEventListener('click', () => {
        transactionRow.remove();
        removeTransaction(type, amount, category, notes);
    });

    if (shouldUpdateLocalStorage) {
        // Add transaction to the list and update localStorage
        transactions.push({ type, amount, category, notes });
        updateLocalStorage();
    }

    updateBalanceDisplay(); // Recalculate and update balance after adding transaction
}

// Update localStorage with the current transactions
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Remove a transaction
function removeTransaction(type, amount, category, notes) {
    // Remove the matching transaction from the array
    transactions = transactions.filter(transaction => {
        return !(transaction.type === type && transaction.amount === amount && transaction.category === category && transaction.notes === notes);
    });

    updateLocalStorage(); // Update localStorage
    updateBalanceDisplay(); // Recalculate balance after deletion
}

// Get the selected category
function getSelectedCategory() {
    for (let input of categoryInputs) {
        if (input.checked) {
            return input.value;
        }
    }
    return null;
}

// Submit income
submitIncomeButton.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const category = getSelectedCategory();
    const sanitizedNotes = notesInput.value.trim().replace(/\s+/g, ' ');

    if (!isNaN(amount) && category) {
        addTransactionToSheet('income', amount, category, sanitizedNotes);
        resetForm();
    } else {
        alert("Please enter a valid amount and select a category.");
    }
});

// Submit expense
submitExpenseButton.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const category = getSelectedCategory();
    const sanitizedNotes = notesInput.value.trim().replace(/\s+/g, ' ');

    if (!isNaN(amount) && category) {
        addTransactionToSheet('expense', amount, category, sanitizedNotes);
        resetForm();
    } else {
        alert("Please enter a valid amount and select a category.");
    }
});

// Reset form inputs
function resetForm() {
    amountInput.value = '';
    notesInput.value = '';
    for (let input of categoryInputs) {
        input.checked = false;
    }
}

// Initial data load on page load
loadData();
