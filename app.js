document.addEventListener('DOMContentLoaded', function () {
    // Initialize Dexie database
    const db = new Dexie('IncomeExpenseDB');


    
    // Define the schema with the correct version and upgrade logic
    db.version(20).stores({
        transactions: '++id, date, transaction, income, investment, expense',
    }).upgrade(tx => {
        // Handle upgrades if needed
        // For example, you can add a new index or migrate data
    });

    // DOM elements
    const itemForm = document.getElementById('itemForm');
    const dateInput = document.getElementById('dateInput');
    const transactionInput = document.getElementById('transactionInput');
    const incomeInput = document.getElementById('incomeInput');
    const investmentInput = document.getElementById('investmentInput');
    const expenseInput = document.getElementById('expenseInput');
    const itemsDiv = document.getElementById('itemsDiv');
    const totalPriceDiv = document.getElementById('totalPrice');

    const exportButton = document.getElementById('exportButton');


    // Add item to the database and update the display
    itemForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const transaction = transactionInput.value.trim();
        const income = parseFloat(incomeInput.value) || 0;
        const investment = parseFloat(investmentInput.value) || 0;
        const expense = parseFloat(expenseInput.value) || 0;
        const date = dateInput.value; // Add this line to get the date value

        if (transaction !== '') {
            // Add transaction to the database
            db.transactions.add({
                date,
                transaction,
                income,
                investment,
                expense,
            }).then(() => {
                // Clear the form inputs
                transactionInput.value = '';
                incomeInput.value = '';
                investmentInput.value = '';
                expenseInput.value = '';

                // Refresh the displayed transactions and update totals
                displayTransactions();
                calculateSummaryTotals();
            });
        }
    });

    // Display transactions in the itemsDiv
function displayTransactions() {
    // Clear existing transactions
    itemsDiv.innerHTML = '';

    // Create table headers
    const tableHeaders = document.createElement('tr');
    tableHeaders.innerHTML = `
        <th>Date</th>
        <th>Transaction</th>
        <th>Income</th>
        <th>Investment</th>
        <th>Expense</th>
        <th>Action</th> <!-- Add a column for the delete button -->
    `;
    const headersTable = document.createElement('table');
    headersTable.appendChild(tableHeaders);
    itemsDiv.appendChild(headersTable);

    // Fetch transactions from the database and display them
    db.transactions.toArray().then(transactions => {
        transactions.forEach(transaction => {
            const transactionTable = document.createElement('tr');
            transactionTable.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.transaction}</td>
                <td>${transaction.income}</td>
                <td>${transaction.investment}</td>
                <td>${transaction.expense}</td>
                <td><button class="deleteButton" data-transaction-id="${transaction.id}">Delete</button></td> <!-- Add the delete button -->
            `;
            headersTable.appendChild(transactionTable);
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.deleteButton');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const transactionId = parseInt(button.getAttribute('data-transaction-id'), 10);
                deleteTransaction(transactionId);
            });
        });
    });
}

// Function to delete a transaction by ID
function deleteTransaction(transactionId) {
    db.transactions.delete(transactionId).then(() => {
        // Refresh the displayed transactions and update totals after deletion
        displayTransactions();
        calculateSummaryTotals();
    });
}
    // Calculate and display summary totals
    function calculateSummaryTotals() {
        db.transactions.toArray().then(transactions => {
            const totalIncome = transactions.reduce((total, transaction) => total + transaction.income, 0);
            const totalInvestment = transactions.reduce((total, transaction) => total + transaction.investment, 0);
            const totalExpense = transactions.reduce((total, transaction) => total + transaction.expense, 0);
            const totalBalance = transactions.reduce((total, transaction) => total + transaction.income-(transaction.expense+transaction.investment), 0);

            // Update the existing summary totals
            const summaryTotalsDiv = document.querySelector('.summary-totals');
            summaryTotalsDiv.innerHTML = `
                <label>Total Income:KES ${totalIncome} </label><br/>
                <label>Total Investment:KES ${totalInvestment} </label><br/>
                <label>Total Expense:KES ${totalExpense} </label><br/>
                <label>Total Balance:KES ${totalBalance} </label><br/>
            `;
        });
    }

     // Initial display of transactions and summary totals
    displayTransactions();
    calculateSummaryTotals();
});
